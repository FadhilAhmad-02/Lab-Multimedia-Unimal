import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

/*GET ALL MATERIALS*/
export const getMaterials =
    async (
        _req: Request,
        res: Response
    ) => {
        try {
        const materials =
            await prisma.material.findMany({
            orderBy: {
                createdAt:
                "desc",
            },
            });

        return res.json(
            materials
        );
        } catch (error) {
        console.error(
            error
        );

        return res
            .status(500)
            .json({
            message:
                "Gagal mengambil bahan baku",
            });
        }
    };

/*CREATE MATERIAL*/
export const createMaterial =
    async (
        req: Request,
        res: Response
    ) => {
        try {
        const {
            name,
            unit,
            stock,
            threshold,
            active,
        } = req.body;

        if (
            !name ||
            !unit ||
            threshold ===
            undefined
        ) {
            return res
            .status(400)
            .json({
                message:
                "Nama, satuan dan threshold wajib diisi",
            });
        }

        const material =
            await prisma.material.create({
            data: {
                name,
                unit,
                stock:
                Number(
                    stock
                ) || 0,
                threshold:
                Number(
                    threshold
                ),
                active:
                active ??
                true,
            },
            });

        return res
            .status(201)
            .json({
            message:
                "Bahan baku berhasil ditambahkan",
            data: material,
            });
        } catch (error) {
        console.error(
            error
        );

        return res
            .status(500)
            .json({
            message:
                "Gagal menambah bahan baku",
            });
        }
    };

/*UPDATE MATERIAL*/
export const updateMaterial =
    async (
        req: Request,
        res: Response
    ) => {
        try {
        const id = Number(
            req.params.id
        );

        const {
            name,
            unit,
            stock,
            threshold,
            active,
        } = req.body;

        const material =
            await prisma.material.update({
            where: {
                id,
            },
            data: {
                name,
                unit,
                stock:
                Number(
                    stock
                ),
                threshold:
                Number(
                    threshold
                ),
                active,
            },
            });

        return res.json({
            message:
            "Bahan baku berhasil diupdate",
            data:
            material,
        });
        } catch (error) {
        console.error(
            error
        );

        return res
            .status(500)
            .json({
            message:
                "Gagal update bahan baku",
            });
        }
    };

/*DELETE MATERIAL*/
export const deleteMaterial =
    async (
        req: Request,
        res: Response
    ) => {
        try {
        const id = Number(
            req.params.id
        );

        await prisma.material.delete({
            where: {
            id,
            },
        });

        return res.json({
            message:
            "Bahan baku berhasil dihapus",
        });
        } catch (error) {
        console.error(
            error
        );

        return res
            .status(500)
            .json({
            message:
                "Gagal menghapus bahan baku",
            });
        }
    };

/*UPDATE STOCK*/
export const updateStock =
    async (
        req: Request,
        res: Response
    ) => {
        try {
        const id = Number(
            req.params.id
        );

        const {
            amount,
            type,
        } = req.body;

        const material =
            await prisma.material.findUnique({
            where: {
                id,
            },
            });

        if (
            !material
        ) {
            return res
            .status(404)
            .json({
                message:
                "Bahan baku tidak ditemukan",
            });
        }

        let newStock =
            material.stock;

        if (
            type ===
            "add"
        ) {
            newStock +=
            Number(
                amount
            );
        }

        if (
            type ===
            "reduce"
        ) {
            if (
            material.stock <
            amount
            ) {
            return res
                .status(400)
                .json({
                message:
                    "Stok tidak mencukupi",
                });
            }

            newStock -=
            Number(
                amount
            );
        }

        const updated =
            await prisma.material.update({
            where: {
                id,
            },
            data: {
                stock:
                newStock,
            },
            });

        return res.json(
            updated
        );
        } catch (error) {
        console.error(
            error
        );

        return res
            .status(500)
            .json({
            message:
                "Gagal update stok",
            });
        }
    };