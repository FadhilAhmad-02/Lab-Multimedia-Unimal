import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

/*
=================================
CREATE ORDER
=================================
*/
export const createOrder = async (
    req: Request,
    res: Response
    ) => {
    try {
        const { userId, items, notes } = req.body;

        if (!userId || !items?.length) {
        return res.status(400).json({
            message: "Data pesanan tidak lengkap",
        });
        }

        const productIds = items.map(
        (item: any) => item.productId
        );

        const products = await prisma.product.findMany({
        where: {
            id: {
            in: productIds,
            },
        },
        });

        let totalPrice = 0;

        const orderItems = items.map((item: any) => {
        const product = products.find(
            (p) => p.id === item.productId
        );

        if (!product) {
            throw new Error(
            `Produk dengan ID ${item.productId} tidak ditemukan`
            );
        }

        const subtotal =
            product.price * item.quantity;

        totalPrice += subtotal;

        return {
            productId: product.id,
            quantity: item.quantity,
            price: product.price,
        };
        });

        const order = await prisma.order.create({
        data: {
            userId,
            totalPrice,
            notes,
            items: {
            create: orderItems,
            },
        },
        include: {
            user: true,
            items: {
            include: {
                product: true,
            },
            },
        },
        });

        return res.status(201).json(order);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
        message: "Gagal membuat pesanan",
        });
    }
};

/*
=================================
GET ALL ORDERS
=================================
*/
export const getOrders = async (
    _req: Request,
    res: Response
    ) => {
    try {
        const orders = await prisma.order.findMany({
        include: {
            user: true,
            items: {
            include: {
                product: true,
            },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        });

        return res.json(orders);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
        message: "Gagal mengambil pesanan",
        });
    }
};

/*
=================================
UPDATE STATUS ORDER
=================================
*/
export const updateOrderStatus = async (
    req: Request,
    res: Response
    ) => {
    try {
        const orderId = Number(req.params.id);
        const { status } = req.body;

        const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
        });

        if (!existingOrder) {
        return res.status(404).json({
            message: "Pesanan tidak ditemukan",
        });
        }

        const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status },
        });

        if (
        existingOrder.status !== "completed" &&
        status === "completed"
        ) {
        await prisma.user.update({
            where: {
            id: existingOrder.userId,
            },
            data: {
            points: {
                increment: Math.floor(
                existingOrder.totalPrice / 1000
                ),
            },
            },
        });
        }

        return res.json(updatedOrder);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
        message: "Gagal mengubah status pesanan",
        });
    }
};

/*
=================================
GET ORDERS PENDING PAYMENT
=================================
*/
export const getPendingPayments = async (
    _req: Request,
    res: Response
    ) => {
    try {
        const orders = await prisma.order.findMany({
        where: {
            paymentStatus: "unpaid",
            status: "pending",
        },
        include: {
            user: {
            select: {
                fullName: true,
                phoneNumber: true,
            },
            },
            items: {
            include: { product: true },
            },
        },
        orderBy: { createdAt: "desc" },
        });

        return res.json(orders);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
        message: "Gagal mengambil data pembayaran",
        });
    }
};

/*
=================================
CONFIRM PAYMENT (VALID)
=================================
*/
export const confirmPayment = async (
    req: Request,
    res: Response
    ) => {
    try {
        const orderId = Number(req.params.id);

        const order = await prisma.order.findUnique({
        where: { id: orderId },
        });

        if (!order) {
        return res.status(404).json({
            message: "Pesanan tidak ditemukan",
        });
        }

        const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
            paymentStatus: "paid",
            status: "processing",
            confirmedAt: new Date(),
        },
        });

        return res.json(updated);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
        message: "Gagal mengkonfirmasi pembayaran",
        });
    }
};

/*
=================================
REJECT PAYMENT
=================================
*/
export const rejectPayment = async (
    req: Request,
    res: Response
    ) => {
    try {
        const orderId = Number(req.params.id);

        const order = await prisma.order.findUnique({
        where: { id: orderId },
        });

        if (!order) {
        return res.status(404).json({
            message: "Pesanan tidak ditemukan",
        });
        }

        const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
            paymentStatus: "rejected",
            status: "cancelled",
        },
        });

        return res.json(updated);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
        message: "Gagal menolak pembayaran",
        });
    }
};

/*
=================================
GET REVENUE REPORT
query: period = "today" | "week" | "month"
=================================
*/
export const getRevenueReport = async (
    req: Request,
    res: Response
    ) => {
    try {
        const { period = "week" } = req.query;
        const now = new Date();

        let startDate: Date;

        if (period === "today") {
        startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );
        } else if (period === "month") {
        startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );
        } else {
        const day = now.getDay();

        startDate = new Date(now);
        startDate.setDate(
            now.getDate() - (day === 0 ? 6 : day - 1)
        );
        startDate.setHours(0, 0, 0, 0);
        }

        const orders = await prisma.order.findMany({
        where: {
            status: "completed",
            createdAt: {
            gte: startDate,
            },
        },
        select: {
            totalPrice: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: "asc",
        },
        });

        const grouped: Record<string, number> = {};

        for (const order of orders) {
        const dateKey = order.createdAt.toLocaleDateString(
            "id-ID",
            {
            day: "2-digit",
            month: "short",
            }
        );

        grouped[dateKey] =
            (grouped[dateKey] ?? 0) + order.totalPrice;
        }

        const chartData = Object.entries(grouped).map(
        ([date, amount]) => ({
            date,
            amount,
        })
        );

        const totalRevenue = orders.reduce(
        (sum, order) => sum + order.totalPrice,
        0
        );

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

        return res.status(500).json({
        message: "Gagal mengambil laporan",
        });
    }
};