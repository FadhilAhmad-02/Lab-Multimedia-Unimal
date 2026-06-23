import { Response } from "express";
import { OrderStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";

// ----------------------------------------------------------------
// Helpers tanggal (pakai timezone server — pastikan TZ server
// di-set ke Asia/Jakarta kalau mau "Hari Ini" sesuai WIB)
// ----------------------------------------------------------------
const startOfDay = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
};

const addDays = (d: Date, n: number) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
};

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);

// null = tidak bisa dihitung (periode pembanding bernilai 0, jadi
// persentase kenaikan tidak terdefinisi) — frontend menyembunyikan
// badge trend kalau nilainya null, supaya tidak ada angka "ngasal"
const pctChange = (current: number, previous: number): number | null => {
    if (previous === 0) return current === 0 ? 0 : null;
    return Math.round(((current - previous) / previous) * 1000) / 10;
};

// "Pendapatan" = hanya order yang sudah COMPLETED (selesai).
// Pending dan processing belum tentu dibayar, jadi tidak dihitung sebagai pendapatan.
const REVENUE_STATUS_FILTER = { status: OrderStatus.completed };

const MONTH_LABEL = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// ----------------------------------------------------------------
// GET /api/dashboard
// ----------------------------------------------------------------
export const getDashboard = async (_req: AuthRequest, res: Response) => {
    try {
        const now = new Date();
        const todayStart = startOfDay(now);
        const tomorrowStart = addDays(todayStart, 1);
        const yesterdayStart = addDays(todayStart, -1);

        const monthStart = startOfMonth(now);
        const nextMonthStart = addMonths(monthStart, 1);
        const lastMonthStart = addMonths(monthStart, -1);

        // ── KPI Cards ────────────────────────────────────────────────
        const [
        revenueTodayAgg,
        revenueYesterdayAgg,
        revenueThisMonthAgg,
        revenueLastMonthAgg,
        activeOrders,
        newOrdersToday,
        newOrdersYesterday,
        newCustomersToday,
        newCustomersYesterday,
        ] = await Promise.all([
        prisma.order.aggregate({
            where: { ...REVENUE_STATUS_FILTER, createdAt: { gte: todayStart, lt: tomorrowStart } },
            _sum: { totalPrice: true },
        }),
        prisma.order.aggregate({
            where: { ...REVENUE_STATUS_FILTER, createdAt: { gte: yesterdayStart, lt: todayStart } },
            _sum: { totalPrice: true },
        }),
        prisma.order.aggregate({
            where: { ...REVENUE_STATUS_FILTER, createdAt: { gte: monthStart, lt: nextMonthStart } },
            _sum: { totalPrice: true },
        }),
        prisma.order.aggregate({
            where: { ...REVENUE_STATUS_FILTER, createdAt: { gte: lastMonthStart, lt: monthStart } },
            _sum: { totalPrice: true },
        }),
        prisma.order.count({
            where: { status: { in: [OrderStatus.pending, OrderStatus.processing] } },
        }),
        prisma.order.count({ where: { createdAt: { gte: todayStart, lt: tomorrowStart } } }),
        prisma.order.count({ where: { createdAt: { gte: yesterdayStart, lt: todayStart } } }),
        prisma.user.count({
            where: { role: "customer", createdAt: { gte: todayStart, lt: tomorrowStart } },
        }),
        prisma.user.count({
            where: { role: "customer", createdAt: { gte: yesterdayStart, lt: todayStart } },
        }),
        ]);

        const revenueToday = revenueTodayAgg._sum.totalPrice ?? 0;
        const revenueYesterday = revenueYesterdayAgg._sum.totalPrice ?? 0;
        const revenueThisMonth = revenueThisMonthAgg._sum.totalPrice ?? 0;
        const revenueLastMonth = revenueLastMonthAgg._sum.totalPrice ?? 0;

        const kpi = {
        revenueToday,
        revenueTodayTrendPct: pctChange(revenueToday, revenueYesterday),
        revenueThisMonth,
        revenueThisMonthTrendPct: pctChange(revenueThisMonth, revenueLastMonth),
        activeOrders,
        newOrdersToday,
        newOrdersTodayTrendPct: pctChange(newOrdersToday, newOrdersYesterday),
        newCustomersToday,
        newCustomersTodayTrendPct: pctChange(newCustomersToday, newCustomersYesterday),
        };

        // ── Trend Pendapatan 30 Hari ────────────────────────────────
        const range30Start = addDays(todayStart, -29);
        const orders30 = await prisma.order.findMany({
        where: { ...REVENUE_STATUS_FILTER, createdAt: { gte: range30Start, lt: tomorrowStart } },
        select: { createdAt: true, totalPrice: true },
        });

        const revenueTrend30 = Array.from({ length: 30 }, (_, i) => {
        const day = addDays(range30Start, i);
        const dayEnd = addDays(day, 1);
        const revenue = orders30
            .filter((o) => o.createdAt >= day && o.createdAt < dayEnd)
            .reduce((sum, o) => sum + o.totalPrice, 0);
        return { day: `${day.getDate()}/${day.getMonth() + 1}`, revenue };
        });

        // ── Volume Pesanan per Minggu (4 minggu terakhir) ───────────
        const range4wStart = addDays(todayStart, -27);
        const orders4w = await prisma.order.findMany({
        where: { createdAt: { gte: range4wStart, lt: tomorrowStart } },
        select: { createdAt: true },
        });

        const weeklyOrders = Array.from({ length: 4 }, (_, i) => {
        const weekStart = addDays(range4wStart, i * 7);
        const weekEnd = addDays(weekStart, 7);
        const orders = orders4w.filter((o) => o.createdAt >= weekStart && o.createdAt < weekEnd).length;
        return { week: `Mg ${i + 1}`, orders };
        });

        // ── 10 Produk Terlaris ───────────────────────────────────────
        const topProductGroups = await prisma.orderItem.groupBy({
        by: ["productId"],
        where: { order: REVENUE_STATUS_FILTER },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 10,
        });

        const topProductDetails = await prisma.product.findMany({
        where: { id: { in: topProductGroups.map((g) => g.productId) } },
        select: { id: true, name: true },
        });

        const topProducts = topProductGroups.map((g) => ({
        name: topProductDetails.find((p) => p.id === g.productId)?.name ?? "Produk dihapus",
        qty: g._sum.quantity ?? 0,
        }));

        // ── Customer Baru vs Kembali (6 bulan terakhir) ─────────────
        const range6mStart = addMonths(monthStart, -5);

        const [ordersForTrend, firstOrderPerCustomer] = await Promise.all([
        prisma.order.findMany({
            where: { createdAt: { gte: range6mStart, lt: nextMonthStart } },
            select: { userId: true, createdAt: true },
        }),
        // tanggal order PERTAMA tiap customer sepanjang histori (bukan cuma 6 bulan ini)
        prisma.order.groupBy({ by: ["userId"], _min: { createdAt: true } }),
        ]);

        const firstOrderMonthKey = new Map<number, string>();
        for (const row of firstOrderPerCustomer) {
        if (row._min.createdAt) {
            const d = row._min.createdAt;
            firstOrderMonthKey.set(row.userId, `${d.getFullYear()}-${d.getMonth()}`);
        }
        }

        const customerTrend = Array.from({ length: 6 }, (_, i) => {
        const m = addMonths(range6mStart, i);
        const mEnd = addMonths(m, 1);
        const key = `${m.getFullYear()}-${m.getMonth()}`;

        const customersThisMonth = new Set(
            ordersForTrend.filter((o) => o.createdAt >= m && o.createdAt < mEnd).map((o) => o.userId)
        );

        let baru = 0;
        let kembali = 0;
        customersThisMonth.forEach((uid) => {
            if (firstOrderMonthKey.get(uid) === key) baru++;
            else kembali++;
        });

        return { month: MONTH_LABEL[m.getMonth()], baru, kembali };
        });

        // ── 5 Pesanan Terbaru ────────────────────────────────────────
        const recentOrdersRaw = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { fullName: true } },
            items: { include: { product: { select: { name: true } } } },
        },
        });

        const recentOrders = recentOrdersRaw.map((o) => ({
        id: o.id,
        customer: o.user.fullName,
        product: o.items[0]?.product.name ?? "-",
        extraItems: Math.max(0, o.items.length - 1),
        totalPrice: o.totalPrice,
        status: o.status,
        }));

        // ── 5 Customer Terbaru ──────────────────────────────────────
        const recentCustomersRaw = await prisma.user.findMany({
        where: { role: "customer" },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
            _count: { select: { orders: true } },
            orders: { select: { totalPrice: true } },
        },
        });

        const recentCustomers = recentCustomersRaw.map((u) => ({
        name: u.fullName,
        email: u.email,
        orders: u._count.orders,
        total: u.orders.reduce((sum, o) => sum + o.totalPrice, 0),
        createdAt: u.createdAt,
        }));

        // ── Stok Bahan Menipis ───────────────────────────────────────
        const materials = await prisma.material.findMany({ where: { active: true } });
        const lowStockMaterials = materials
        .filter((m) => m.stock < m.threshold)
        .map((m) => ({ name: m.name, stock: m.stock, threshold: m.threshold, unit: m.unit }));

        // ── Live Feed ──────────────────────────────────────────────
        // CATATAN: ini BUKAN event log asli (tidak ada tabel activity log
        // di schema). Ini pendekatan dari 8 order yang baru dibuat/diubah,
        // diformat jadi teks aktivitas. Kalau order yang sama dibuat lalu
        // statusnya diganti, feed ini hanya menampilkan kondisi TERAKHIRnya,
        // bukan riwayat tiap perubahan status.
        const feedOrdersRaw = await prisma.order.findMany({
        take: 8,
        orderBy: { updatedAt: "desc" },
        include: {
            user: { select: { fullName: true } },
            items: { include: { product: { select: { name: true } } } },
        },
        });

        const liveFeed = feedOrdersRaw.map((o) => {
        const code = `#ORD-${String(o.id).padStart(4, "0")}`;
        const productName = o.items[0]?.product.name ?? "produk";

        let type: "new" | "processing" | "completed" | "cancelled" = "new";
        let text = "";

        switch (o.status) {
            case OrderStatus.cancelled:
            type = "cancelled";
            text = `Pesanan ${code} dibatalkan oleh customer`;
            break;
            case OrderStatus.completed:
            type = "completed";
            text = `Pesanan ${code} selesai diproduksi`;
            break;
            case OrderStatus.processing:
            type = "processing";
            text = `Pesanan ${code} sedang diproses`;
            break;
            default:
            type = "new";
            text = `Pesanan baru dari ${o.user.fullName} — ${productName}`;
        }

        return { type, text, time: o.updatedAt };
        });

        return res.json({
        kpi,
        revenueTrend30,
        weeklyOrders,
        topProducts,
        customerTrend,
        recentOrders,
        recentCustomers,
        lowStockMaterials,
        liveFeed,
        });
    } catch (error) {
        console.error("GetDashboard error:", error);
        return res.status(500).json({ message: "Gagal mengambil data dashboard" });
    }
};