// routes/operator.routes.ts
// Semua endpoint untuk halaman Operator — tersambung langsung ke tabel yang sama
// yang dipakai Admin (Order, User, OrderStageLog, dsb).

import express, { Request, Response } from "express";
import { PrismaClient, ProductionStage, OrderStatus } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();
const prisma = new PrismaClient();

// ─── Multer: upload foto progres ─────────────────────────────────────────────
const progressStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const dir = path.join(process.cwd(), "public", "uploads", "progress");
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `progress-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
});
const uploadProgress = multer({
    storage: progressStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith("image/")) cb(null, true);
        else cb(new Error("Hanya file gambar yang diizinkan"));
    },
    });

// ─── Helper: mapping stage string → enum ────────────────────────────────────
const STAGE_MAP: Record<string, ProductionStage> = {
    VERIFIKASI_FILE: ProductionStage.verifikasi_file,
    PRACETAK:        ProductionStage.pracetak,
    SEDANG_DICETAK:  ProductionStage.sedang_dicetak,
    FINISHING:       ProductionStage.finishing,
    QC:              ProductionStage.qc,
    SIAP_KIRIM:      ProductionStage.siap_kirim,
};

// Urutan stage resmi
const STAGE_ORDER: ProductionStage[] = [
    ProductionStage.verifikasi_file,
    ProductionStage.pracetak,
    ProductionStage.sedang_dicetak,
    ProductionStage.finishing,
    ProductionStage.qc,
    ProductionStage.siap_kirim,
    ];

    // ─── Helper: select fields untuk list order ──────────────────────────────────
    const ORDER_LIST_SELECT = {
    id: true,
    totalPrice: true,
    status: true,
    notes: true,
    operatorId: true,
    handledAt: true,
    dueAt: true,
    completedAt: true,
    createdAt: true,
    paymentStatus: true,
    user: {
        select: { id: true, fullName: true, phoneNumber: true, email: true },
    },
    items: {
        select: {
        id: true,
        quantity: true,
        price: true,
        product: { select: { id: true, name: true, category: true, image: true } },
        },
    },
    stageLogs: {
        orderBy: { startAt: "asc" as const },
        select: { id: true, stage: true, startAt: true, endAt: true },
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/operator/dashboard
// KPI + pesanan baru (pending) + pesanan sedang dikerjakan operator ini
// ═══════════════════════════════════════════════════════════════════════════════
router.get("/dashboard", async (req: Request, res: Response) => {
    try {
        // operatorId dari JWT middleware (asumsi req.user sudah di-inject middleware auth)
        const operatorId = (req as any).user?.id as number | undefined;

        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay   = new Date(startOfDay.getTime() + 86400000);

        const [totalMasuk, totalDikerjakan, selesaiHari, terlambat, pesananBaru, pesananAktif] =
        await Promise.all([
            // Pesanan masuk hari ini (paid & belum diambil operator)
            prisma.order.count({
            where: {
                paymentStatus: "paid",
                status: "pending",
                createdAt: { gte: startOfDay, lt: endOfDay },
            },
            }),

            // Sedang dikerjakan operator ini
            prisma.order.count({
            where: { ...(operatorId !== undefined ? { operatorId } : {}), status: "processing" },
            }),

            // Selesai hari ini
            prisma.order.count({
            where: {
                status: "completed",
                completedAt: { gte: startOfDay, lt: endOfDay },
            },
            }),

            // Terlambat (processing & dueAt sudah lewat)
            prisma.order.count({
            where: {
                status: "processing",
                dueAt: { lt: today },
            },
            }),

            // Pesanan baru (paid, belum diambil operator) — maks 10
            prisma.order.findMany({
            where: { paymentStatus: "paid", status: "pending", operatorId: null },
            orderBy: { createdAt: "desc" },
            take: 10,
            select: ORDER_LIST_SELECT,
            }),

            // Pesanan aktif milik operator ini — maks 10
            prisma.order.findMany({
            where: { ...(operatorId !== undefined ? { operatorId } : {}), status: "processing" },
            orderBy: { dueAt: "asc" },
            take: 10,
            select: ORDER_LIST_SELECT,
            }),
        ]);

        res.json({
        success: true,
        data: {
            kpi: {
            pesananMasuk: totalMasuk,
            dikerjakan: totalDikerjakan,
            selesaiHari,
            terlambat,
            },
            pesananBaru,
            pesananAktif,
        },
        });
    } catch (err) {
        console.error("[GET /operator/dashboard]", err);
        res.status(500).json({ success: false, message: "Gagal memuat dashboard" });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/operator/antrian
// Semua pesanan paid+pending yang belum diambil operator (antrian)
// ═══════════════════════════════════════════════════════════════════════════════
router.get("/antrian", async (req: Request, res: Response) => {
    try {
        const { sort = "fifo", filter } = req.query as Record<string, string>;

        const orders = await prisma.order.findMany({
        where: {
            paymentStatus: "paid",
            status: "pending",
            operatorId: null,
            // filter by category produk jika ada
            ...(filter && filter !== "Semua" && filter !== "Urgent"
            ? { items: { some: { product: { category: filter } } } }
            : {}),
        },
        orderBy: sort === "deadline"
            ? { dueAt: "asc" }
            : { createdAt: "asc" },
        select: ORDER_LIST_SELECT,
        });

        // tandai urgent jika dueAt < 24 jam dari sekarang
        const now = Date.now();
        const enriched = orders.map(o => ({
        ...o,
        urgent: o.dueAt ? o.dueAt.getTime() - now < 24 * 3600000 : false,
        countdownMs: o.dueAt ? Math.max(0, o.dueAt.getTime() - now) : null,
        }));

        const filtered = filter === "Urgent"
        ? enriched.filter(o => o.urgent)
        : enriched;

        res.json({ success: true, data: filtered });
    } catch (err) {
        console.error("[GET /operator/antrian]", err);
        res.status(500).json({ success: false, message: "Gagal memuat antrian" });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/operator/antrian/:id/ambil
// Operator mengambil pesanan dari antrian → operatorId di-set, status → processing
// ═══════════════════════════════════════════════════════════════════════════════
router.post("/antrian/:id/ambil", async (req: Request, res: Response) => {
    try {
        const orderId    = parseInt(String(req.params.id), 10);
        const operatorId = (req as any).user?.id as number;

        // Cek belum diambil operator lain
        const existing = await prisma.order.findUnique({ where: { id: orderId } });
        if (!existing) {
        res.status(404).json({ success: false, message: "Pesanan tidak ditemukan" });
        return;
        }
        if (existing.operatorId) {
        res.status(409).json({ success: false, message: "Pesanan sudah diambil operator lain" });
        return;
        }

        const order = await prisma.order.update({
        where: { id: orderId },
        data: {
            operatorId,
            handledAt: new Date(),
            status: "processing",
        },
        select: ORDER_LIST_SELECT,
        });

        // Buat stage log pertama
        await prisma.orderStageLog.create({
        data: { orderId, stage: ProductionStage.verifikasi_file },
        });

        res.json({ success: true, data: order });
    } catch (err) {
        console.error("[POST /operator/antrian/:id/ambil]", err);
        res.status(500).json({ success: false, message: "Gagal mengambil pesanan" });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/operator/pesanan/:id
// Detail lengkap satu pesanan
// ═══════════════════════════════════════════════════════════════════════════════
router.get("/pesanan/:id", async (req: Request, res: Response) => {
    try {
        const orderId = parseInt(String(req.params.id), 10);

        const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            ...ORDER_LIST_SELECT,
            operator: {
            select: { id: true, fullName: true },
            },
        },
        });

        if (!order) {
        res.status(404).json({ success: false, message: "Pesanan tidak ditemukan" });
        return;
        }

        // Hitung stage saat ini dari log
        const lastLog = order.stageLogs[order.stageLogs.length - 1];
        const currentStageKey = lastLog?.stage ?? null;
        const currentStageIdx = currentStageKey ? STAGE_ORDER.indexOf(currentStageKey) : -1;
        const nextStage = currentStageIdx >= 0 && currentStageIdx < STAGE_ORDER.length - 1
        ? STAGE_ORDER[currentStageIdx + 1]
        : null;

        const now = Date.now();

        res.json({
        success: true,
        data: {
            ...order,
            urgent: order.dueAt ? order.dueAt.getTime() - now < 24 * 3600000 : false,
            countdownMs: order.dueAt ? Math.max(0, order.dueAt.getTime() - now) : null,
            currentStage: currentStageKey,
            nextStage,
            stageOrderList: STAGE_ORDER,
        },
        });
    } catch (err) {
        console.error("[GET /operator/pesanan/:id]", err);
        res.status(500).json({ success: false, message: "Gagal memuat detail pesanan" });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH /api/operator/pesanan/:id/stage
// Majukan ke stage berikutnya (atau stage tertentu)
// Body: { stage: "FINISHING" }  ← pakai key string yang sama dengan frontend
// ═══════════════════════════════════════════════════════════════════════════════
router.patch("/pesanan/:id/stage", async (req: Request, res: Response) => {
    try {
        const orderId  = parseInt(String(req.params.id), 10);
        const { stage } = req.body as { stage: string };

        const prismaStage = STAGE_MAP[stage?.toUpperCase()];
        if (!prismaStage) {
        res.status(400).json({ success: false, message: `Stage tidak valid: ${stage}` });
        return;
        }

        const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { stageLogs: { orderBy: { startAt: "asc" } } },
        });
        if (!order) {
        res.status(404).json({ success: false, message: "Pesanan tidak ditemukan" });
        return;
        }

        // Tutup log stage sebelumnya
        const lastLog = order.stageLogs[order.stageLogs.length - 1];
        if (lastLog && !lastLog.endAt) {
        await prisma.orderStageLog.update({
            where: { id: lastLog.id },
            data: { endAt: new Date() },
        });
        }

        // Buat log stage baru
        await prisma.orderStageLog.create({
        data: { orderId, stage: prismaStage },
        });

        // Jika SIAP_KIRIM → order selesai
        let newStatus = order.status;
        if (prismaStage === ProductionStage.siap_kirim) {
        newStatus = "completed";
        await prisma.order.update({
            where: { id: orderId },
            data: { status: "completed", completedAt: new Date() },
        });
        }

        const updated = await prisma.order.findUnique({
        where: { id: orderId },
        select: ORDER_LIST_SELECT,
        });

        res.json({ success: true, data: updated });
    } catch (err) {
        console.error("[PATCH /operator/pesanan/:id/stage]", err);
        res.status(500).json({ success: false, message: "Gagal update stage" });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH /api/operator/pesanan/:id/urgent
// Toggle flag urgent
// Body: { urgent: true }
// ═══════════════════════════════════════════════════════════════════════════════
router.patch("/pesanan/:id/urgent", async (req: Request, res: Response) => {
    try {
        const orderId = parseInt(String(req.params.id), 10);
        const { urgent } = req.body as { urgent: boolean };

        // Simpan sebagai notes sementara (atau bisa tambah field di schema)
        // Di sini kita update dueAt agar masuk < 24 jam jika urgent,
        // atau reset ke null jika tidak. Alternatif: tambah field `urgent Boolean` di schema.
        // Untuk sekarang kita simpan di notes sebagai marker.
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
        res.status(404).json({ success: false, message: "Pesanan tidak ditemukan" });
        return;
        }

        const updatedNotes = urgent
        ? `[URGENT] ${order.notes ?? ""}`.trim()
        : (order.notes ?? "").replace(/^\[URGENT\]\s*/i, "").trim() || null;

        const updated = await prisma.order.update({
        where: { id: orderId },
        data: { notes: updatedNotes },
        select: ORDER_LIST_SELECT,
        });

        res.json({ success: true, data: updated });
    } catch (err) {
        console.error("[PATCH /operator/pesanan/:id/urgent]", err);
        res.status(500).json({ success: false, message: "Gagal update urgent" });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/operator/pesanan/:id/resi
// Simpan nomor resi + kurir, otomatis advance ke SIAP_KIRIM
// Body: { kurir: "JNE", resi: "1234567890" }
// ═══════════════════════════════════════════════════════════════════════════════
router.post("/pesanan/:id/resi", async (req: Request, res: Response) => {
    try {
        const orderId = parseInt(String(req.params.id), 10);
        const { kurir, resi } = req.body as { kurir: string; resi: string };

        if (!kurir || !resi) {
        res.status(400).json({ success: false, message: "kurir dan resi wajib diisi" });
        return;
        }

        const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { stageLogs: { orderBy: { startAt: "asc" } } },
        });
        if (!order) {
        res.status(404).json({ success: false, message: "Pesanan tidak ditemukan" });
        return;
        }

        // Tutup stage aktif
        const lastLog = order.stageLogs[order.stageLogs.length - 1];
        if (lastLog && !lastLog.endAt) {
        await prisma.orderStageLog.update({
            where: { id: lastLog.id },
            data: { endAt: new Date() },
        });
        }

        // Tambah stage SIAP_KIRIM
        await prisma.orderStageLog.create({
        data: { orderId, stage: ProductionStage.siap_kirim },
        });

        // Simpan resi di notes (atau bisa tambah field resi di schema)
        const resiNote = `[RESI:${kurir}:${resi}]`;
        const baseNotes = (order.notes ?? "").replace(/\[RESI:[^\]]+\]/g, "").trim();
        const newNotes  = `${baseNotes} ${resiNote}`.trim();

        const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
            notes: newNotes,
            status: "completed",
            completedAt: new Date(),
        },
        select: ORDER_LIST_SELECT,
        });

        res.json({ success: true, data: updated });
    } catch (err) {
        console.error("[POST /operator/pesanan/:id/resi]", err);
        res.status(500).json({ success: false, message: "Gagal simpan resi" });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/operator/pesanan/:id/photos
// Upload foto progres produksi (multipart, field: photos)
// ═══════════════════════════════════════════════════════════════════════════════
router.post(
    "/pesanan/:id/photos",
    uploadProgress.array("photos", 10),
    async (req: Request, res: Response) => {
        try {
        const files = req.files as Express.Multer.File[] | undefined;
        if (!files || files.length === 0) {
            res.status(400).json({ success: false, message: "Tidak ada file yang diupload" });
            return;
        }

        const urls = files.map(f => `/uploads/progress/${f.filename}`);

        res.json({ success: true, data: { urls } });
        } catch (err) {
        console.error("[POST /operator/pesanan/:id/photos]", err);
        res.status(500).json({ success: false, message: "Gagal upload foto" });
        }
    }
);

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/operator/kalender?year=2026&month=2
// Data pesanan per hari dalam sebulan (untuk kalender produksi)
// ═══════════════════════════════════════════════════════════════════════════════
router.get("/kalender", async (req: Request, res: Response) => {
    try {
        const year  = parseInt(String(req.query.year  ?? new Date().getFullYear()), 10);
        const month = parseInt(String(req.query.month ?? new Date().getMonth()), 10); // 0-based

        const startOfMonth = new Date(year, month, 1);
        const endOfMonth   = new Date(year, month + 1, 0, 23, 59, 59);

        // Ambil semua pesanan yang dueAt jatuh di bulan ini
        const orders = await prisma.order.findMany({
        where: {
            dueAt: { gte: startOfMonth, lte: endOfMonth },
            status: { in: ["pending", "processing"] },
        },
        select: {
            id: true,
            dueAt: true,
            status: true,
            notes: true,
            user: { select: { fullName: true } },
            items: {
            take: 1,
            select: { product: { select: { name: true } } },
            },
        },
        });

        // Ambil setting kapasitas harian (key: "kapasitas_YYYY-MM-DD")
        const kapasitasKeys = await prisma.setting.findMany({
        where: {
            key: {
            startsWith: `kapasitas_${year}-${String(month + 1).padStart(2, "0")}`,
            },
        },
        });
        const kapasitasMap: Record<string, number> = {};
        for (const s of kapasitasKeys) {
        const day = s.key.split("_")[1]; // "YYYY-MM-DD"
        if (day) kapasitasMap[day] = parseInt(s.value, 10) || 10;
        }

        // Ambil setting blokir harian (key: "blokir_YYYY-MM-DD")
        const blokirKeys = await prisma.setting.findMany({
        where: {
            key: {
            startsWith: `blokir_${year}-${String(month + 1).padStart(2, "0")}`,
            },
        },
        });
        const blokirMap: Record<string, string> = {};
        for (const s of blokirKeys) {
        const day = s.key.split("_")[1];
        if (day && s.value) blokirMap[day] = s.value;
        }

        // Kelompokkan per tanggal
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dayData: Record<number, {
        orders: number;
        maxOrders: number;
        blocked: boolean;
        blockReason?: string;
        orderList: { id: number; customer: string; product: string; status: string }[];
        }> = {};

        for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const dayOrders = orders.filter(o => {
            const due = o.dueAt!;
            return due.getFullYear() === year && due.getMonth() === month && due.getDate() === d;
        });

        dayData[d] = {
            orders:   dayOrders.length,
            maxOrders: kapasitasMap[dateStr] ?? 10,
            blocked:  !!blokirMap[dateStr],
            ...(blokirMap[dateStr] ? { blockReason: blokirMap[dateStr] } : {}),
            orderList: dayOrders.map(o => ({
            id:       o.id,
            customer: o.user.fullName,
            product:  o.items[0]?.product?.name ?? "—",
            status:   o.status,
            })),
        };
        }

        res.json({ success: true, data: dayData });
    } catch (err) {
        console.error("[GET /operator/kalender]", err);
        res.status(500).json({ success: false, message: "Gagal memuat kalender" });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/operator/kalender/:dateStr
// Simpan kapasitas & blokir untuk satu hari
// Body: { maxOrders: 8, blocked: false, blockReason: "" }
// dateStr format: "2026-02-17"
// ═══════════════════════════════════════════════════════════════════════════════
router.put("/kalender/:dateStr", async (req: Request, res: Response) => {
    try {
        const dateStr = String(req.params.dateStr); // "YYYY-MM-DD"
        const { maxOrders, blocked, blockReason } = req.body as {
        maxOrders?: number;
        blocked?: boolean;
        blockReason?: string;
        };

        const ops: Promise<any>[] = [];

        if (maxOrders !== undefined) {
        ops.push(
            prisma.setting.upsert({
            where: { key: `kapasitas_${dateStr}` },
            update: { value: String(maxOrders) },
            create: { key: `kapasitas_${dateStr}`, value: String(maxOrders) },
            })
        );
        }

        if (blocked !== undefined) {
        ops.push(
            blocked
            ? prisma.setting.upsert({
                where: { key: `blokir_${dateStr}` },
                update: { value: blockReason ?? "Diblokir operator" },
                create: { key: `blokir_${dateStr}`, value: blockReason ?? "Diblokir operator" },
                })
            : prisma.setting.deleteMany({ where: { key: `blokir_${dateStr}` } })
        );
        }

        await Promise.all(ops);

        res.json({ success: true, message: "Kalender diperbarui" });
    } catch (err) {
        console.error("[PUT /operator/kalender/:dateStr]", err);
        res.status(500).json({ success: false, message: "Gagal menyimpan kalender" });
    }
});

export default router;