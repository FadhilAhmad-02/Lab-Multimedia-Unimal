import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

/*
=================================
GET ALL SERVICES
=================================
*/
export const getServices =
    async (
        req: Request,
        res: Response
    ) => {
        try {
        const services =
            await prisma.service.findMany({
            orderBy: {
                createdAt:
                "desc",
            },
            });

        res.json(
            services
        );
        } catch (error) {
        console.error(
            error
        );

        res.status(500).json({
            message:
            "Gagal mengambil jasa",
        });
        }
    };

/*
=================================
CREATE SERVICE
=================================
*/
export const createService =
    async (
        req: Request,
        res: Response
    ) => {
        try {
        const data =
            req.body;

        const service =
            await prisma.service.create({
            data: {
                title:
                data.title,
                description:
                data.description,
                features:
                data.features,
                duration:
                data.duration,
                price:
                Number(
                    data.price
                ),
                image:
                data.image,
                category:
                data.category,
                featured:
                data.featured ??
                false,
                active:
                data.active ??
                true,
            },
            });

        res.status(201).json(
            service
        );
        } catch (error) {
        console.error(
            error
        );

        res.status(500).json({
            message:
            "Gagal menambah jasa",
        });
        }
    };

/*
=================================
UPDATE SERVICE
=================================
*/
export const updateService = async (
    req: Request,
    res: Response
    ) => {
    try {
        const id = Number(req.params.id);
        const data = req.body;

        const updateData: any = {};

        // hanya update field yang ada
        if (data.title !== undefined)
        updateData.title = data.title;

        if (data.description !== undefined)
        updateData.description =
            data.description;

        if (data.features !== undefined)
        updateData.features =
            data.features;

        if (data.duration !== undefined)
        updateData.duration =
            data.duration;

        if (data.price !== undefined)
        updateData.price =
            Number(data.price);

        if (data.image !== undefined)
        updateData.image =
            data.image;

        if (data.category !== undefined)
        updateData.category =
            data.category;

        if (data.featured !== undefined)
        updateData.featured =
            data.featured;

        if (data.active !== undefined)
        updateData.active =
            data.active;

        const service =
        await prisma.service.update({
            where: { id },
            data: updateData,
        });

        res.json(service);
    } catch (error) {
        console.error(error);

        res.status(500).json({
        message:
            "Gagal update jasa",
        });
    }
    };

/*
=================================
DELETE SERVICE
=================================
*/
export const deleteService =
    async (
        req: Request,
        res: Response
    ) => {
        try {
        const id =
            Number(
            req.params.id
            );

        await prisma.service.delete({
            where: {
            id,
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
            "Gagal menghapus jasa",
        });
        }
    };

