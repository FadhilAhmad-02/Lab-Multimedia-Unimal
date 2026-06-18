import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

/*
=========================
GET CONFIGS
=========================
*/
export const getProductConfigs =
    async (
        req: Request,
        res: Response
    ) => {
        try {
        const productId =
            Number(
            req.params.productId
            );

        const configs =
            await prisma.productConfig.findMany({
            where: {
                productId,
            },

            orderBy: {
                createdAt:
                "desc",
            },
            });

        res.json(configs);
        } catch (error) {
        console.error(error);

        res.status(500).json({
            message:
            "Gagal mengambil konfigurasi",
        });
        }
    };

/*
=========================
CREATE
=========================
*/
export const createProductConfig =
    async (
        req: Request,
        res: Response
    ) => {
        try {
        const data =
            req.body;

        const config =
            await prisma.productConfig.create({
            data: {
                productId:
                data.productId,

                type:
                data.type,

                name:
                data.name,

                extraPrice:
                Number(
                    data.extraPrice
                ) || 0,

                active:
                true,
            },
            });

        res.status(201).json(
            config
        );
        } catch (error) {
        console.error(error);

        res.status(500).json({
            message:
            "Gagal menambah konfigurasi",
        });
        }
    };

/*
=========================
UPDATE
=========================
*/
export const updateProductConfig =
    async (
        req: Request,
        res: Response
    ) => {
        try {
        const id =
            Number(
            req.params.id
            );

        const data =
            req.body;

        const config =
            await prisma.productConfig.update({
            where: {
                id,
            },

            data,
            });

        res.json(config);
        } catch (error) {
        console.error(error);

        res.status(500).json({
            message:
            "Gagal update konfigurasi",
        });
        }
    };

/*
=========================
DELETE
=========================
*/
export const deleteProductConfigs =
    async (
        req: Request,
        res: Response
    ) => {
        try {

        const productId =
            Number(
            req.params.productId
            );

        await prisma.productConfig.deleteMany({
            where: {
            productId,
            },
        });

        res.json({
            message:
            "Berhasil dihapus",
        });

        } catch (error) {

        console.error(
            error
        );

        res.status(500).json({
            message:
            "Gagal hapus konfigurasi",
        });
        }
    };