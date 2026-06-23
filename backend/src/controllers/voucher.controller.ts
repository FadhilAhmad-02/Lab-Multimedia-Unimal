import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

/*
=================================
GET ALL VOUCHERS
=================================
*/
export const getVouchers = async (_req: Request, res: Response) => {
    try {
        const vouchers = await prisma.voucher.findMany({
        orderBy: { createdAt: "desc" },
        });
        return res.json(vouchers);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Gagal mengambil data voucher" });
    }
};

/*
=================================
CREATE VOUCHER
=================================
*/
export const createVoucher = async (req: Request, res: Response) => {
    try {
        const { code, type, discount, maxUse, expiresAt } = req.body;

        if (!code || !type || discount == null || !maxUse || !expiresAt) {
        return res.status(400).json({ message: "Data voucher tidak lengkap" });
        }

        const existing = await prisma.voucher.findUnique({ where: { code } });
        if (existing) {
        return res.status(409).json({ message: "Kode voucher sudah digunakan" });
        }

        const voucher = await prisma.voucher.create({
        data: {
            code: code.toUpperCase().trim(),
            type,        // "percentage" | "nominal"
            discount: Number(discount),
            maxUse: Number(maxUse),
            expiresAt: new Date(expiresAt),
        },
        });

        return res.status(201).json(voucher);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Gagal membuat voucher" });
    }
};

/*
=================================
TOGGLE ACTIVE VOUCHER
=================================
*/
export const toggleVoucher = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        const voucher = await prisma.voucher.findUnique({ where: { id } });
        if (!voucher) {
        return res.status(404).json({ message: "Voucher tidak ditemukan" });
        }

        const updated = await prisma.voucher.update({
        where: { id },
        data: { active: !voucher.active },
        });

        return res.json(updated);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Gagal mengubah status voucher" });
    }
};

/*
=================================
UPDATE VOUCHER
=================================
*/
export const updateVoucher = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { type, discount, maxUse, expiresAt } = req.body;

        const voucher = await prisma.voucher.findUnique({ where: { id } });
        if (!voucher) {
        return res.status(404).json({ message: "Voucher tidak ditemukan" });
        }

        const updated = await prisma.voucher.update({
        where: { id },
        data: {
            ...(type && { type }),
            ...(discount != null && { discount: Number(discount) }),
            ...(maxUse != null && { maxUse: Number(maxUse) }),
            ...(expiresAt && { expiresAt: new Date(expiresAt) }),
        },
        });

        return res.json(updated);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Gagal mengubah voucher" });
    }
};