import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";

// GET /api/users  — admin & operator
export const getUsers = async (_req: AuthRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
        include: {
            _count: {
            select: { orders: true },
            },
            orders: {
            select: { totalPrice: true },
            },
        },
        orderBy: { createdAt: "desc" },
        });

        const formattedUsers = users.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        avatar: user.avatar,
        points: user.points,
        status: user.status,
        orders: user._count.orders,
        total: user.orders.reduce((sum, order) => sum + order.totalPrice, 0),
        createdAt: user.createdAt,
        }));

        return res.json(formattedUsers);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Gagal mengambil data pengguna" });
    }
};