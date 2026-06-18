import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

/*
==========================================
GET ALL CATEGORY
==========================================
*/
export const getCategories = async (
    req: Request,
    res: Response
    ) => {
    try {
        const categories =
        await prisma.category.findMany({
            orderBy: {
            createdAt: "desc",
            },
        });

        return res.json(categories);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
        message:
            "Gagal mengambil kategori",
        });
    }
    };

    /*
    ==========================================
    CREATE CATEGORY
    ==========================================
    */
    export const createCategory =
    async (
        req: Request,
        res: Response
    ) => {
        try {
        const {
            name,
            slug,
            icon,
            active,
        } = req.body;

        if (!name || !slug) {
            return res.status(400).json({
            message:
                "Nama dan slug wajib diisi",
            });
        }

        const category =
            await prisma.category.create({
            data: {
                name,
                slug,
                icon:
                icon || "Printer",
                active:
                active ?? true,
            },
            });

        return res.status(201).json({
            message:
            "Kategori berhasil ditambahkan",
            data: category,
        });
        } catch (error) {
        console.error(error);

        return res.status(500).json({
            message:
            "Gagal menambah kategori",
        });
        }
    };

    /*
    ==========================================
    UPDATE CATEGORY
    ==========================================
    */
    export const updateCategory =
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
            slug,
            icon,
            active,
        } = req.body;

        const category =
            await prisma.category.update({
            where: { id },
            data: {
                name,
                slug,
                icon,
                active,
            },
            });

        return res.json({
            message:
            "Kategori berhasil diupdate",
            data: category,
        });
        } catch (error) {
        console.error(error);

        return res.status(500).json({
            message:
            "Gagal update kategori",
        });
        }
    };

    /*
    ==========================================
    TOGGLE ACTIVE CATEGORY
    ==========================================
    */
    export const toggleCategory =
    async (
        req: Request,
        res: Response
    ) => {
        try {
        const id = Number(
            req.params.id
        );

        const category =
            await prisma.category.findUnique({
            where: { id },
            });

        if (!category) {
            return res.status(404).json({
            message:
                "Kategori tidak ditemukan",
            });
        }

        const updated =
            await prisma.category.update({
            where: { id },
            data: {
                active:
                !category.active,
            },
            });

        return res.json(updated);
        } catch (error) {
        console.error(error);

        return res.status(500).json({
            message:
            "Gagal update status kategori",
        });
        }
    };

    /*
    ==========================================
    DELETE CATEGORY
    ==========================================
    */
    export const deleteCategory =
    async (
        req: Request,
        res: Response
    ) => {
        try {
        const id = Number(
            req.params.id
        );

        await prisma.category.delete({
            where: { id },
        });

        return res.json({
            message:
            "Kategori berhasil dihapus",
        });
        } catch (error) {
        console.error(error);

        return res.status(500).json({
            message:
            "Gagal menghapus kategori",
        });
        }
    };