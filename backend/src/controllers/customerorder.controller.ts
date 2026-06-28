// controllers/customer_order.controller.ts
// Endpoint khusus customer — semua route divalidasi ownership (userId dari JWT)

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";
import multer from "multer";

const prisma = new PrismaClient();

// ─── Helper: ambil userId dari JWT middleware ────────────────────────────────
function getUserId(req: Request): number | null {
    const id = (req as any).user?.id;
    return typeof id === "number" ? id : null;
}

// ─── Select fields standar untuk response ke customer ───────────────────────
const ORDER_SELECT = {
    id: true,
    totalPrice: true,
    status: true,
    paymentStatus: true,
    notes: true,
    createdAt: true,
    updatedAt: true,
    dueAt: true,
    completedAt: true,
    handledAt: true,
    confirmedAt: true,
    items: {
        select: {
        id: true,
        quantity: true,
        price: true,
        product: {
            select: {
            id: true,
            name: true,
            category: true,
            image: true,
            },
        },
        },
    },
    stageLogs: {
        orderBy: { startAt: "asc" as const },
        select: {
        id: true,
        stage: true,
        startAt: true,
        endAt: true,
        },
    },
    operator: {
        select: {
        id: true,
        fullName: true,
        },
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// [1] GET /api/customer/orders
// Daftar semua pesanan milik customer yang sedang login
// Query params: ?status=processing&page=1&limit=10
// ═══════════════════════════════════════════════════════════════════════════════
export async function getMyOrders(req: Request, res: Response) {
    try {
        const userId = getUserId(req);
        if (!userId) {
        res.status(401).json({ success: false, message: "Tidak terautentikasi" });
        return;
        }

        const { status, page = "1", limit = "10" } = req.query as Record<string, string>;

        const pageNum  = Math.max(1, parseInt(page,  10));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
        const skip     = (pageNum - 1) * limitNum;

        const where = {
        userId,
        ...(status ? { status: status as any } : {}),
        };

        const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limitNum,
            select: ORDER_SELECT,
        }),
        prisma.order.count({ where }),
        ]);

        // Parsing resi dari notes: format "[RESI:KURIR:NOMOR]"
        const enriched = orders.map(enrichOrder);

        res.json({
        success: true,
        data: enriched,
        pagination: {
            total,
            page:  pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        },
        });
    } catch (err) {
        console.error("[GET /customer/orders]", err);
        res.status(500).json({ success: false, message: "Gagal mengambil daftar pesanan" });
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// [2] GET /api/customer/orders/:id
// Detail satu pesanan — hanya boleh diakses pemiliknya
// ═══════════════════════════════════════════════════════════════════════════════
export async function getMyOrderById(req: Request, res: Response) {
    try {
        const userId  = getUserId(req);
        if (!userId) {
        res.status(401).json({ success: false, message: "Tidak terautentikasi" });
        return;
        }

        const orderId = parseInt(String(req.params.id), 10);
        if (isNaN(orderId)) {
        res.status(400).json({ success: false, message: "ID pesanan tidak valid" });
        return;
        }

        const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: ORDER_SELECT,
        });

        if (!order) {
        res.status(404).json({ success: false, message: "Pesanan tidak ditemukan" });
        return;
        }

        // Pastikan pesanan milik user ini
        // (ORDER_SELECT tidak include userId — ambil terpisah untuk validasi)
        const raw = await prisma.order.findUnique({
        where: { id: orderId },
        select: { userId: true },
        });

        if (raw?.userId !== userId) {
        res.status(403).json({ success: false, message: "Akses ditolak" });
        return;
        }

        res.json({ success: true, data: enrichOrder(order) });
    } catch (err) {
        console.error("[GET /customer/orders/:id]", err);
        res.status(500).json({ success: false, message: "Gagal mengambil detail pesanan" });
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// [3] POST /api/customer/orders/:id/payment-proof
// Upload bukti pembayaran (multipart/form-data, field: "proof")
// Menyimpan URL ke notes order: format "[BUKTI_BAYAR:url]"
// ═══════════════════════════════════════════════════════════════════════════════

// Setup multer untuk bukti bayar
const paymentStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const dir = path.join(process.cwd(), "public", "uploads", "payment-proof");
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `proof-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
});

export const uploadPaymentProof = multer({
    storage: paymentStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error("Hanya JPG, PNG, WebP, atau PDF yang diizinkan"));
    },
});

export async function submitPaymentProof(req: Request, res: Response) {
    try {
        const userId = getUserId(req);
        if (!userId) {
        res.status(401).json({ success: false, message: "Tidak terautentikasi" });
        return;
        }

        const orderId = parseInt(String(req.params.id), 10);
        if (isNaN(orderId)) {
        res.status(400).json({ success: false, message: "ID pesanan tidak valid" });
        return;
        }

        const file = req.file as Express.Multer.File | undefined;
        if (!file) {
        res.status(400).json({ success: false, message: "File bukti bayar wajib diupload" });
        return;
        }

        // Validasi kepemilikan & status
        const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { userId: true, paymentStatus: true, status: true },
        });

        if (!order) {
        res.status(404).json({ success: false, message: "Pesanan tidak ditemukan" });
        return;
        }
        if (order.userId !== userId) {
        res.status(403).json({ success: false, message: "Akses ditolak" });
        return;
        }
        if (order.paymentStatus === "paid") {
        res.status(409).json({ success: false, message: "Pembayaran sudah dikonfirmasi" });
        return;
        }
        if (order.status === "cancelled") {
        res.status(409).json({ success: false, message: "Pesanan sudah dibatalkan" });
        return;
        }

        const proofUrl = `/uploads/payment-proof/${file.filename}`;

        // Simpan URL ke notes (hapus bukti lama jika ada, lalu append yang baru)
        const existing = await prisma.order.findUnique({
        where: { id: orderId },
        select: { notes: true },
        });
        const baseNotes = (existing?.notes ?? "")
        .replace(/\[BUKTI_BAYAR:[^\]]+\]/g, "")
        .trim();
        const newNotes = `${baseNotes} [BUKTI_BAYAR:${proofUrl}]`.trim();

        await prisma.order.update({
        where: { id: orderId },
        data: { notes: newNotes },
        });

        res.json({
        success: true,
        message: "Bukti pembayaran berhasil dikirim. Menunggu konfirmasi operator.",
        data: { proofUrl },
        });
    } catch (err) {
        console.error("[POST /customer/orders/:id/payment-proof]", err);
        res.status(500).json({ success: false, message: "Gagal upload bukti pembayaran" });
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// [4] PATCH /api/customer/orders/:id/confirm-received
// Customer konfirmasi sudah terima pesanan → status: completed, confirmedAt: now
// Hanya boleh jika order sudah punya resi (siap_kirim) dan belum completed
// ═══════════════════════════════════════════════════════════════════════════════
export async function confirmReceived(req: Request, res: Response) {
    try {
        const userId = getUserId(req);
        if (!userId) {
        res.status(401).json({ success: false, message: "Tidak terautentikasi" });
        return;
        }

        const orderId = parseInt(String(req.params.id), 10);
        if (isNaN(orderId)) {
        res.status(400).json({ success: false, message: "ID pesanan tidak valid" });
        return;
        }

        const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            userId: true,
            status: true,
            notes: true,
            stageLogs: {
            orderBy: { startAt: "desc" },
            take: 1,
            select: { stage: true },
            },
        },
        });

        if (!order) {
        res.status(404).json({ success: false, message: "Pesanan tidak ditemukan" });
        return;
        }
        if (order.userId !== userId) {
        res.status(403).json({ success: false, message: "Akses ditolak" });
        return;
        }
        if (order.status === "completed") {
        res.status(409).json({ success: false, message: "Pesanan sudah selesai" });
        return;
        }
        if (order.status === "cancelled") {
        res.status(409).json({ success: false, message: "Pesanan sudah dibatalkan" });
        return;
        }

        // Pastikan pesanan sudah dikirim (ada resi di notes atau stage siap_kirim)
        const hasResi      = order.notes?.includes("[RESI:") ?? false;
        const lastStage    = order.stageLogs[0]?.stage;
        const sudahDikirim = hasResi || lastStage === "siap_kirim";

        if (!sudahDikirim) {
        res.status(409).json({
            success: false,
            message: "Pesanan belum dikirim, tidak bisa dikonfirmasi penerimaan",
        });
        return;
        }

        const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
            status:      "completed",
            completedAt: new Date(),
            confirmedAt: new Date(),
        },
        select: ORDER_SELECT,
        });

        res.json({
        success: true,
        message: "Penerimaan pesanan berhasil dikonfirmasi. Terima kasih!",
        data: enrichOrder(updated),
        });
    } catch (err) {
        console.error("[PATCH /customer/orders/:id/confirm-received]", err);
        res.status(500).json({ success: false, message: "Gagal konfirmasi penerimaan" });
    }
}

// ─── Helper: parse resi & bukti bayar dari notes ────────────────────────────
function enrichOrder(order: any) {
    const notes: string = order.notes ?? "";

    // Parse [RESI:KURIR:NOMOR]
    const resiMatch = notes.match(/\[RESI:([^:]+):([^\]]+)\]/);
    const resi = resiMatch
        ? { kurir: resiMatch[1], nomor: resiMatch[2] }
        : null;

  // Parse [BUKTI_BAYAR:url]
    const buktiMatch = notes.match(/\[BUKTI_BAYAR:([^\]]+)\]/);
    const buktiPembayaran = buktiMatch ? buktiMatch[1] : null;

  // Bersihkan notes dari tag internal sebelum dikirim ke client
    const cleanNotes = notes
        .replace(/\[RESI:[^\]]+\]/g, "")
        .replace(/\[BUKTI_BAYAR:[^\]]+\]/g, "")
        .trim() || null;

    return {
        ...order,
        notes: cleanNotes,
        resi,
        buktiPembayaran,
    };
}