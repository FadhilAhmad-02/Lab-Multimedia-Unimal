// routes/pengaturan.ts
import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

const router = express.Router();
const prisma = new PrismaClient();

// ─── Multer: logo upload ──────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), "public", "uploads", "logos");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Hanya file gambar yang diizinkan"));
  },
});

// ─── Helper ───────────────────────────────────────────────────────────────────
// Seed default settings jika belum ada di DB
async function ensureDefaultSettings() {
  const defaults: Record<string, string> = {
    store_name: "",
    store_email: "",
    store_whatsapp: "",
    store_tagline: "",
    store_address: "",
    store_logo: "",
    midtrans_server_key: "",
    midtrans_client_key: "",
    midtrans_is_production: "false",
    maintenance_mode: "false",
    maintenance_message: "Sedang dalam perbaikan. Mohon coba beberapa saat lagi.",
    last_backup_at: "",
  };

  for (const [key, value] of Object.entries(defaults)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},          // jangan timpa nilai yang sudah ada
      create: { key, value },
    });
  }
}

// ─── Default static pages ────────────────────────────────────────────────────
async function ensureDefaultStaticPages() {
  const pages = [
    { slug: "tentang-kami",    title: "Tentang Kami",    content: "<p>Halaman tentang kami.</p>" },
    { slug: "kebijakan-privasi", title: "Kebijakan Privasi", content: "<p>Kebijakan privasi kami.</p>" },
    { slug: "syarat-ketentuan", title: "Syarat & Ketentuan", content: "<p>Syarat dan ketentuan penggunaan.</p>" },
    { slug: "kontak",          title: "Kontak",           content: "<p>Hubungi kami.</p>" },
  ];

  for (const page of pages) {
    await prisma.staticPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/pengaturan/settings  — ambil semua settings sebagai key-value map
// ═══════════════════════════════════════════════════════════════════════════════
router.get("/settings", async (_req: Request, res: Response) => {
  try {
    await ensureDefaultSettings();

    const rows = await prisma.setting.findMany();
    const data: Record<string, string> = {};
    for (const row of rows) data[row.key] = row.value;

    res.json({ success: true, data });
  } catch (err) {
    console.error("[GET /settings]", err);
    res.status(500).json({ success: false, message: "Gagal memuat pengaturan" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/pengaturan/settings  — simpan semua settings sekaligus
// ═══════════════════════════════════════════════════════════════════════════════
router.put("/settings", async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, string>;

    // upsert tiap key
    for (const [key, value] of Object.entries(body)) {
      if (typeof value !== "string") continue;
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    res.json({ success: true, message: "Pengaturan berhasil disimpan" });
  } catch (err) {
    console.error("[PUT /settings]", err);
    res.status(500).json({ success: false, message: "Gagal menyimpan pengaturan" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/pengaturan/settings/logo  — upload logo
// ═══════════════════════════════════════════════════════════════════════════════
router.post(
  "/settings/logo",
  upload.single("logo"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: "File tidak ditemukan" });
        return;
      }

      // URL publik logo (sesuaikan base URL jika pakai CDN / storage lain)
      const url = `/uploads/logos/${req.file.filename}`;

      await prisma.setting.upsert({
        where: { key: "store_logo" },
        update: { value: url },
        create: { key: "store_logo", value: url },
      });

      res.json({ success: true, data: { url } });
    } catch (err) {
      console.error("[POST /settings/logo]", err);
      res.status(500).json({ success: false, message: "Gagal upload logo" });
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/pengaturan/static-pages  — list semua halaman statis
// ═══════════════════════════════════════════════════════════════════════════════
router.get("/static-pages", async (_req: Request, res: Response) => {
  try {
    await ensureDefaultStaticPages();

    const pages = await prisma.staticPage.findMany({
      select: { id: true, slug: true, title: true, active: true, updatedAt: true },
      orderBy: { id: "asc" },
    });

    res.json({ success: true, data: pages });
  } catch (err) {
    console.error("[GET /static-pages]", err);
    res.status(500).json({ success: false, message: "Gagal memuat halaman statis" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/pengaturan/static-pages/:slug  — detail satu halaman (termasuk konten)
// ═══════════════════════════════════════════════════════════════════════════════
router.get("/static-pages/:slug", async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);
    const page = await prisma.staticPage.findUnique({
      where: { slug },
    });

    if (!page) {
      res.status(404).json({ success: false, message: "Halaman tidak ditemukan" });
      return;
    }

    res.json({ success: true, data: page });
  } catch (err) {
    console.error("[GET /static-pages/:slug]", err);
    res.status(500).json({ success: false, message: "Gagal memuat halaman" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/pengaturan/static-pages/:slug  — edit halaman statis
// ═══════════════════════════════════════════════════════════════════════════════
router.put("/static-pages/:slug", async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body as { title: string; content: string };

    if (!title || content === undefined) {
      res.status(400).json({ success: false, message: "title dan content wajib diisi" });
      return;
    }

    const page = await prisma.staticPage.update({
      where: { slug: String(req.params.slug) },
      data: { title, content },
    });

    res.json({ success: true, data: page });
  } catch (err: any) {
    console.error("[PUT /static-pages/:slug]", err);
    if (err.code === "P2025") {
      res.status(404).json({ success: false, message: "Halaman tidak ditemukan" });
    } else {
      res.status(500).json({ success: false, message: "Gagal menyimpan halaman" });
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/pengaturan/templates  — list semua template desain
// ═══════════════════════════════════════════════════════════════════════════════
router.get("/templates", async (_req: Request, res: Response) => {
  try {
    const templates = await prisma.designTemplate.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: templates });
  } catch (err) {
    console.error("[GET /templates]", err);
    res.status(500).json({ success: false, message: "Gagal memuat template" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/pengaturan/templates  — tambah template baru
// ═══════════════════════════════════════════════════════════════════════════════
router.post("/templates", async (req: Request, res: Response) => {
  try {
    const { name, category, image, link } = req.body as {
      name: string; category: string; image: string; link: string;
    };

    if (!name || !category || !image || !link) {
      res.status(400).json({ success: false, message: "Semua field wajib diisi" });
      return;
    }

    const template = await prisma.designTemplate.create({
      data: { name, category, image, link },
    });

    res.status(201).json({ success: true, data: template });
  } catch (err) {
    console.error("[POST /templates]", err);
    res.status(500).json({ success: false, message: "Gagal menambah template" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/pengaturan/templates/:id  — edit template
// ═══════════════════════════════════════════════════════════════════════════════
router.put("/templates/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const { name, category, image, link } = req.body as {
      name: string; category: string; image: string; link: string;
    };

    const template = await prisma.designTemplate.update({
      where: { id },
      data: { name, category, image, link },
    });

    res.json({ success: true, data: template });
  } catch (err: any) {
    console.error("[PUT /templates/:id]", err);
    if (err.code === "P2025") {
      res.status(404).json({ success: false, message: "Template tidak ditemukan" });
    } else {
      res.status(500).json({ success: false, message: "Gagal mengubah template" });
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE /api/pengaturan/templates/:id  — hapus template
// ═══════════════════════════════════════════════════════════════════════════════
router.delete("/templates/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    await prisma.designTemplate.delete({ where: { id } });
    res.json({ success: true, message: "Template dihapus" });
  } catch (err: any) {
    console.error("[DELETE /templates/:id]", err);
    if (err.code === "P2025") {
      res.status(404).json({ success: false, message: "Template tidak ditemukan" });
    } else {
      res.status(500).json({ success: false, message: "Gagal menghapus template" });
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH /api/pengaturan/templates/:id/toggle  — toggle aktif/nonaktif
// ═══════════════════════════════════════════════════════════════════════════════
router.patch("/templates/:id/toggle", async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);

    const current = await prisma.designTemplate.findUnique({ where: { id } });
    if (!current) {
      res.status(404).json({ success: false, message: "Template tidak ditemukan" });
      return;
    }

    const updated = await prisma.designTemplate.update({
      where: { id },
      data: { active: !current.active },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("[PATCH /templates/:id/toggle]", err);
    res.status(500).json({ success: false, message: "Gagal toggle template" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/pengaturan/backup  — backup database (mysqldump)
// ═══════════════════════════════════════════════════════════════════════════════
router.post("/backup", async (_req: Request, res: Response) => {
  try {
    const backupDir = path.join(process.cwd(), "backups");
    fs.mkdirSync(backupDir, { recursive: true });

    const filename = `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;
    const filepath = path.join(backupDir, filename);

    // Ambil koneksi dari DATABASE_URL: mysql://user:pass@host:port/dbname
    const dbUrl = process.env.DATABASE_URL || "";
    const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

    if (!match) {
      res.status(500).json({ success: false, message: "DATABASE_URL tidak valid untuk backup" });
      return;
    }

    const [, user, pass, host, port, dbname] = match;

    execSync(
      `mysqldump -h ${host} -P ${port} -u ${user} -p${pass} ${dbname} > "${filepath}"`,
      { stdio: "pipe" }
    );

    // Simpan log backup
    const log = await prisma.backupLog.create({ data: { filename } });

    // Update setting last_backup_at
    await prisma.setting.upsert({
      where: { key: "last_backup_at" },
      update: { value: log.createdAt.toISOString() },
      create: { key: "last_backup_at", value: log.createdAt.toISOString() },
    });

    res.json({
      success: true,
      data: { filename, createdAt: log.createdAt.toISOString() },
    });
  } catch (err) {
    console.error("[POST /backup]", err);
    res.status(500).json({ success: false, message: "Gagal melakukan backup" });
  }
});

export default router;