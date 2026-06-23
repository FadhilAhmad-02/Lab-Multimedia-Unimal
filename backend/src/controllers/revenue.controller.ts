import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

/*
=================================
GET REVENUE REPORT
query: period = "today" | "week" | "month"
=================================
*/
export const getRevenueReport = async (req: Request, res: Response) => {
    try {
        const { period = "week" } = req.query;
        const now = new Date();

        let startDate: Date;
        if (period === "today") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (period === "month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else {
        // week (default)
        const day = now.getDay(); // 0=Sun
        startDate = new Date(now);
        startDate.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
        startDate.setHours(0, 0, 0, 0);
        }

        const orders = await prisma.order.findMany({
        where: {
            status: "completed",
            createdAt: { gte: startDate },
        },
        select: {
            totalPrice: true,
            createdAt: true,
        },
        orderBy: { createdAt: "asc" },
        });

        // Group by date
        const grouped: Record<string, number> = {};
        for (const order of orders) {
        const dateKey = order.createdAt.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
        });
        grouped[dateKey] = (grouped[dateKey] ?? 0) + order.totalPrice;
        }

        const chartData = Object.entries(grouped).map(([date, amount]) => ({
        date,
        amount,
        }));

        const totalRevenue = orders.reduce((s, o) => s + o.totalPrice, 0);
        const totalTransactions = orders.length;
        const avgOrder =
        totalTransactions > 0
            ? Math.round(totalRevenue / totalTransactions)
            : 0;

        return res.json({
        chartData,
        totalRevenue,
        totalTransactions,
        avgOrder,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Gagal mengambil laporan" });
    }
};