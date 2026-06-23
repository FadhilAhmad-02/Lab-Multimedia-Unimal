import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

/*
=================================
GET ALL FLASH SALES
=================================
*/
export const getFlashSales = async (_req: Request, res: Response) => {
    try {
        const flashSales = await prisma.flashSale.findMany({
        include: {
            products: {
            include: { product: { select: { id: true, name: true } } },
            },
        },
        orderBy: { startDate: "desc" },
        });
        return res.json(flashSales);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Gagal mengambil data flash sale" });
    }
};

/*
=================================
CREATE FLASH SALE
=================================
*/
export const createFlashSale = async (req: Request, res: Response) => {
    try {
        const { name, startDate, endDate, productIds } = req.body;

        if (!name || !startDate || !endDate) {
        return res.status(400).json({ message: "Data flash sale tidak lengkap" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();

        let status: "upcoming" | "active" | "ended" = "upcoming";
        if (now >= start && now <= end) status = "active";
        else if (now > end) status = "ended";

        const flashSale = await prisma.flashSale.create({
        data: {
            name,
            startDate: start,
            endDate: end,
            status,
            products: {
            create: (productIds ?? []).map((pid: number) => ({ productId: pid })),
            },
        },
        include: {
            products: { include: { product: { select: { id: true, name: true } } } },
        },
        });

        return res.status(201).json(flashSale);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Gagal membuat flash sale" });
    }
};