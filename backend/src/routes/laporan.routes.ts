// routes/laporan.routes.ts
// Daftarkan di server.ts: import laporanRouter from "./routes/laporan.routes";
//                         app.use("/api/laporan", laporanRouter);

import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// ── Helper ──────────────────────────────────────────────────
function getPeriodRange(period: string): { start: Date; end: Date } {
    const now = new Date();
    const end = new Date(now);
    let start = new Date(now);

    switch (period) {
        case "7hari":
        start.setDate(now.getDate() - 7);
        break;
        case "30hari":
        start.setDate(now.getDate() - 30);
        break;
        case "3bulan":
        start.setMonth(now.getMonth() - 3);
        break;
        case "tahun_ini":
        start = new Date(now.getFullYear(), 0, 1);
        break;
        case "bulan_ini":
        default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end.setMonth(end.getMonth() + 1, 0);
        break;
    }

    return { start, end };
}

// ── GET /api/laporan/penjualan ───────────────────────────────
router.get("/penjualan", async (req: Request, res: Response) => {
    try {
        const period = (req.query.period as string) || "bulan_ini";
        const { start, end } = getPeriodRange(period);

        const orderItems = await prisma.orderItem.findMany({
        where: {
            order: {
            createdAt: { gte: start, lte: end },
            status: { not: "cancelled" },
            },
        },
        include: {
            product: { select: { name: true, category: true } },
        },
        });

        const productMap: Record<
        number,
        { product: string; category: string; qty: number; revenue: number }
        > = {};

        for (const item of orderItems) {
        const pid = item.productId;
        if (!productMap[pid]) {
            productMap[pid] = {
            product: item.product.name,
            category: item.product.category,
            qty: 0,
            revenue: 0,
            };
        }
        productMap[pid]!.qty += item.quantity;
        productMap[pid]!.revenue += item.price * item.quantity;
        }

        const penjualanData = Object.values(productMap).sort(
        (a, b) => b.revenue - a.revenue
        );
        const totalRevenue = penjualanData.reduce((s, p) => s + p.revenue, 0);

        const orders = await prisma.order.findMany({
        where: {
            createdAt: { gte: start, lte: end },
            status: { not: "cancelled" },
        },
        select: { totalPrice: true },
        });

        const totalTransaksi = orders.length;
        const totalPendapatan = orders.reduce((s, o) => s + o.totalPrice, 0);
        const totalPcs = penjualanData.reduce((s, p) => s + p.qty, 0);
        const avgPesanan =
        totalTransaksi > 0 ? Math.round(totalPendapatan / totalTransaksi) : 0;

        res.json({
        kpi: { totalTransaksi, totalPendapatan, totalPcs, avgPesanan },
        penjualanData: penjualanData.map((p) => ({
            ...p,
            persen:
            totalRevenue > 0
                ? Math.round((p.revenue / totalRevenue) * 100)
                : 0,
        })),
        maxRevenue: Math.max(...penjualanData.map((p) => p.revenue), 1),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gagal mengambil data penjualan" });
    }
});

// ── GET /api/laporan/operator ────────────────────────────────
router.get("/operator", async (req: Request, res: Response) => {
    try {
        const period = (req.query.period as string) || "bulan_ini";
        const { start, end } = getPeriodRange(period);

        const orders = await (prisma as any).order.findMany({
        where: {
            createdAt: { gte: start, lte: end },
            operatorId: { not: null },
        },
        select: {
            operatorId: true,
            dueAt: true,
            completedAt: true,
            handledAt: true,
            operator: { select: { fullName: true } },
        },
        }) as Array<{
        operatorId: number;
        dueAt: Date | null;
        completedAt: Date | null;
        handledAt: Date | null;
        operator: { fullName: string } | null;
        }>;

        const opMap: Record<
        number,
        { name: string; handled: number; onTime: number; late: number; totalMs: number }
        > = {};

        for (const o of orders) {
        if (!o.operatorId) continue;

        if (!opMap[o.operatorId]) {
            opMap[o.operatorId] = {
            name: o.operator?.fullName ?? `Operator #${o.operatorId}`,
            handled: 0,
            onTime: 0,
            late: 0,
            totalMs: 0,
            };
        }

        const op = opMap[o.operatorId]!;
        op.handled++;

        if (o.completedAt && o.dueAt) {
            if (new Date(o.completedAt) <= new Date(o.dueAt)) op.onTime++;
            else op.late++;
        }

        if (o.handledAt && o.completedAt) {
            op.totalMs +=
            new Date(o.completedAt).getTime() - new Date(o.handledAt).getTime();
        }
        }

        const operatorPerf = Object.values(opMap).map((op) => ({
        name: op.name,
        handled: op.handled,
        onTime: op.onTime,
        late: op.late,
        avgTime:
            op.handled > 0
            ? parseFloat((op.totalMs / op.handled / 3_600_000).toFixed(1))
            : 0,
        }));

        res.json({ operatorPerf });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gagal mengambil data operator" });
    }
});

// ── GET /api/laporan/customer ────────────────────────────────
router.get("/customer", async (req: Request, res: Response) => {
    try {
        const period = (req.query.period as string) || "bulan_ini";
        const { start, end } = getPeriodRange(period);

        // 1. Customer baru per bulan (6 bulan terakhir)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const newCustomers = await prisma.user.findMany({
        where: { role: "customer", createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
        });

        const monthMap: Record<string, number> = {};
        for (const u of newCustomers) {
        const key = u.createdAt.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
        monthMap[key] = (monthMap[key] ?? 0) + 1;
        }
        const customerMonthly = Object.entries(monthMap).map(([month, baru]) => ({ month, baru }));

        // 2. Customer baru vs kembali
        const ordersInPeriod = await prisma.order.findMany({
        where: { createdAt: { gte: start, lte: end }, status: { not: "cancelled" } },
        select: { userId: true },
        });

        const allOrders = await prisma.order.findMany({
        select: { userId: true, createdAt: true },
        orderBy: { createdAt: "asc" },
        });

        const firstOrderByUser: Record<number, Date> = {};
        for (const o of allOrders) {
        if (!firstOrderByUser[o.userId]) firstOrderByUser[o.userId] = o.createdAt;
        }

        const seenUsers = new Set<number>();
        let newCust = 0;
        let returningCust = 0;

        for (const o of ordersInPeriod) {
        if (seenUsers.has(o.userId)) continue;
        seenUsers.add(o.userId);
        const firstOrder = firstOrderByUser[o.userId];
        if (firstOrder && firstOrder >= start) newCust++;
        else returningCust++;
        }

        const total = newCust + returningCust || 1;
        const pieCustomer = [
        { name: "Customer Baru",    value: Math.round((newCust       / total) * 100), color: "#F97316" },
        { name: "Customer Kembali", value: Math.round((returningCust / total) * 100), color: "#3B6FD4" },
        ];

        // 3. Top 5 customer
        const userOrders = await prisma.order.groupBy({
        by: ["userId"],
        where: { status: { not: "cancelled" } },
        _count: { id: true },
        _sum: { totalPrice: true },
        orderBy: { _sum: { totalPrice: "desc" } },
        take: 5,
        });

        const topCustomers = await Promise.all(
        userOrders.map(async (u, i) => {
            const user = await prisma.user.findUnique({
            where: { id: u.userId },
            select: { fullName: true },
            });
            const tot = u._sum.totalPrice ?? 0;
            return {
            rank: i + 1,
            name: user?.fullName ?? `User #${u.userId}`,
            orders: u._count.id,
            total: `Rp ${tot.toLocaleString("id-ID")}`,
            clv: `Rp ${((tot * 1.75) / 1_000_000).toFixed(1)} Jt`,
            };
        })
        );

        res.json({ customerMonthly, pieCustomer, topCustomers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gagal mengambil data customer" });
    }
});

// ── GET /api/laporan/operasional ─────────────────────────────
router.get("/operasional", async (req: Request, res: Response) => {
    try {
        const period = (req.query.period as string) || "bulan_ini";
        const { start, end } = getPeriodRange(period);

        // 1. Rata-rata waktu per tahap produksi
        const stageLogs = await (prisma as any).orderStageLog.findMany({
        where: { startAt: { gte: start, lte: end }, endAt: { not: null } },
        }) as Array<{ stage: string; startAt: Date; endAt: Date }>;

        const stageMap: Record<string, { totalMs: number; count: number }> = {};
        for (const log of stageLogs) {
        if (!stageMap[log.stage]) stageMap[log.stage] = { totalMs: 0, count: 0 };
        const entry = stageMap[log.stage]!;
        entry.totalMs += new Date(log.endAt).getTime() - new Date(log.startAt).getTime();
        entry.count++;
        }

        const STAGE_LABELS: Record<string, string> = {
        verifikasi_file: "Verifikasi File",
        pracetak: "Pracetak",
        sedang_dicetak: "Sedang Dicetak",
        finishing: "Finishing",
        qc: "QC",
        siap_kirim: "Siap Kirim",
        };

        const produksiStages = Object.entries(stageMap).map(([stage, data]) => ({
        stage: STAGE_LABELS[stage] ?? stage,
        avgHours: parseFloat((data.totalMs / data.count / 3_600_000).toFixed(1)),
        }));

        // 2. Heatmap
        const orders = await prisma.order.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { createdAt: true },
        });

        const heatmap: number[][] = Array.from({ length: 7 }, () => Array<number>(12).fill(0));

        for (const o of orders) {
        const day = o.createdAt.getDay();
        const dayIdx = day === 0 ? 6 : day - 1;
        const hour = o.createdAt.getHours();
        const slotIdx = Math.min(11, Math.max(0, Math.floor((hour - 6) / 2)));
        heatmap[dayIdx]![slotIdx]!++;
        }

        res.json({ produksiStages, heatmap });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gagal mengambil data operasional" });
    }
});

export default router;