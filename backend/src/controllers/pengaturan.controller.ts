// controllers/pengaturan.controller.ts
import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middlewares/auth.middleware";
import multer from "multer";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const prisma = new PrismaClient();
const execAsync = promisify(exec);

// ─── MULTER CONFIG (logo upload) ──────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const dir = path.join(__dirname, "../../public/uploads/logo");
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `logo-${Date.now()}${ext}`);
    },
});

export const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = /jpeg|jpg|png|svg|webp/;
        const ok =
        allowed.test(path.extname(file.originalname).toLowerCase()) &&
        allowed.test(file.mimetype);
        ok ? cb(null, true) : cb(new Error("Hanya file gambar yang diizinkan"));
    },
});

// ─── HELPER ───────────────────────────────────────────────────────────────────
const rowsToMap = (rows: { key: string; value: string }[]) =>
    rows.reduce<Record<string, string>>((acc, r) => {
        acc[r.key] = r.value;
        return acc;
    }, {});

function detectGroup(key: string): string {
    if (key.startsWith("midtrans_")) return "payment";
    if (["maintenance_mode", "maintenance_message", "last_backup_at"].includes(key))
        return "system";
    return "general";
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

export const getSettings = async (req: AuthRequest, res: Response) => {
    try {
        const { group } = req.query;

        // Fix: exactOptionalPropertyTypes — jangan pass `where: undefined`, spread saja jika ada
        const rows = await prisma.setting.findMany({
        ...(group !== undefined ? { where: { group: String(group) } } : {}),
        orderBy: { key: "asc" },
        });

        res.json({ success: true, data: rowsToMap(rows) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Gagal mengambil pengaturan" });
    }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
    try {
        const entries = Object.entries(req.body as Record<string, string>);
        if (entries.length === 0) {
        return res.status(400).json({ success: false, message: "Tidak ada data yang dikirim" });
        }

        await prisma.$transaction(
        entries.map(([key, value]) =>
            prisma.setting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value), group: detectGroup(key) },
            })
        )
        );

        res.json({ success: true, message: "Pengaturan berhasil disimpan" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Gagal menyimpan pengaturan" });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGO UPLOAD
// ─────────────────────────────────────────────────────────────────────────────

export const uploadLogo = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
        return res.status(400).json({ success: false, message: "File logo tidak ditemukan" });
        }

        const logoUrl = `/uploads/logo/${req.file.filename}`;

        await prisma.setting.upsert({
        where: { key: "store_logo" },
        update: { value: logoUrl },
        create: { key: "store_logo", value: logoUrl, group: "general" },
        });

        res.json({ success: true, message: "Logo berhasil diupload", data: { url: logoUrl } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Gagal mengupload logo" });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// STATIC PAGES
// ─────────────────────────────────────────────────────────────────────────────

export const getStaticPages = async (_req: AuthRequest, res: Response) => {
    try {
        const pages = await prisma.staticPage.findMany({
        select: { id: true, slug: true, title: true, active: true, updatedAt: true },
        orderBy: { id: "asc" },
        });
        res.json({ success: true, data: pages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Gagal mengambil halaman statis" });
    }
};

export const getStaticPage = async (req: AuthRequest, res: Response) => {
    try {
        // Fix: req.params.slug bisa string|string[]|undefined — pastikan string
        const slug = String(req.params["slug"]);
        const page = await prisma.staticPage.findUnique({ where: { slug } });
        if (!page) return res.status(404).json({ success: false, message: "Halaman tidak ditemukan" });
        res.json({ success: true, data: page });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Gagal mengambil halaman" });
    }
};

export const updateStaticPage = async (req: AuthRequest, res: Response) => {
    try {
        const slug = String(req.params["slug"]);
        const { title, content, active } = req.body;
        const page = await prisma.staticPage.update({
        where: { slug },
        data: {
            ...(title !== undefined && { title }),
            ...(content !== undefined && { content }),
            ...(active !== undefined && { active: Boolean(active) }),
        },
        });
        res.json({ success: true, message: "Halaman berhasil diupdate", data: page });
    } catch (err: any) {
        if (err.code === "P2025") {
        return res.status(404).json({ success: false, message: "Halaman tidak ditemukan" });
        }
        console.error(err);
        res.status(500).json({ success: false, message: "Gagal mengupdate halaman" });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

export const getDesignTemplates = async (_req: AuthRequest, res: Response) => {
    try {
        const templates = await prisma.designTemplate.findMany({ orderBy: { createdAt: "desc" } });
        res.json({ success: true, data: templates });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Gagal mengambil template" });
    }
};

export const createDesignTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const { name, category, image, link } = req.body;
        if (!name || !category || !image || !link) {
        return res.status(400).json({ success: false, message: "Semua field wajib diisi" });
        }
        const template = await prisma.designTemplate.create({
        data: { name, category, image, link },
        });
        res.status(201).json({ success: true, message: "Template berhasil ditambahkan", data: template });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Gagal membuat template" });
    }
};

export const updateDesignTemplate = async (req: AuthRequest, res: Response) => {
    try {
        // Fix: parseInt bisa NaN jika params undefined — cast dulu ke string
        const id = parseInt(String(req.params["id"]), 10);
        const { name, category, image, link, active } = req.body;

        const template = await prisma.designTemplate.update({
        where: { id },
        data: {
            ...(name !== undefined && { name }),
            ...(category !== undefined && { category }),
            ...(image !== undefined && { image }),
            ...(link !== undefined && { link }),
            ...(active !== undefined && { active: Boolean(active) }),
        },
        });
        res.json({ success: true, message: "Template berhasil diupdate", data: template });
    } catch (err: any) {
        if (err.code === "P2025") {
        return res.status(404).json({ success: false, message: "Template tidak ditemukan" });
        }
        console.error(err);
        res.status(500).json({ success: false, message: "Gagal mengupdate template" });
    }
};

export const deleteDesignTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(String(req.params["id"]), 10);
        await prisma.designTemplate.delete({ where: { id } });
        res.json({ success: true, message: "Template berhasil dihapus" });
    } catch (err: any) {
        if (err.code === "P2025") {
        return res.status(404).json({ success: false, message: "Template tidak ditemukan" });
        }
        console.error(err);
        res.status(500).json({ success: false, message: "Gagal menghapus template" });
    }
};

export const toggleDesignTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(String(req.params["id"]), 10);
        const current = await prisma.designTemplate.findUnique({ where: { id } });
        if (!current) return res.status(404).json({ success: false, message: "Template tidak ditemukan" });

        const updated = await prisma.designTemplate.update({
        where: { id },
        data: { active: !current.active },
        });
        res.json({
        success: true,
        message: `Template ${updated.active ? "diaktifkan" : "dinonaktifkan"}`,
        data: updated,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Gagal mengubah status template" });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// BACKUP DATABASE
// ─────────────────────────────────────────────────────────────────────────────

export const backupDatabase = async (_req: AuthRequest, res: Response) => {
    try {
        const dbUrl = process.env.DATABASE_URL ?? "";
        const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
        if (!match) {
        return res.status(500).json({ success: false, message: "DATABASE_URL tidak valid untuk backup" });
        }

        const [, user, pass, host, port, dbName] = match;
        const backupDir = path.join(__dirname, "../../backups");
        fs.mkdirSync(backupDir, { recursive: true });

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `backup-${timestamp}.sql`;
        const filepath = path.join(backupDir, filename);

        const cmd = `mysqldump -h${host} -P${port} -u${user} -p${pass} ${dbName} > "${filepath}"`;
        await execAsync(cmd);

        const now = new Date().toISOString();
        await prisma.setting.upsert({
        where: { key: "last_backup_at" },
        update: { value: now },
        create: { key: "last_backup_at", value: now, group: "system" },
        });

        res.json({
        success: true,
        message: "Backup berhasil dibuat",
        data: {
            filename,
            downloadUrl: `/api/pengaturan/backup/download/${filename}`,
            createdAt: now,
        },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Gagal membuat backup. Pastikan mysqldump terinstall." });
    }
};