import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

/*
=================================
GET ALL DEVICES
=================================
*/
export const getDevices = async (
    _req: Request,
    res: Response
    ) => {
    try {
        const devices =
        await prisma.device.findMany({
            orderBy: {
            createdAt: "desc",
            },
        });

        return res.json(devices);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
        message:
            "Gagal mengambil perangkat",
        });
    }
    };

/*
=================================
CREATE DEVICE
=================================
*/
export const createDevice =
    async (
        req: Request,
        res: Response
    ) => {
        try {
        const {
            addedDate,
            ...data
        } = req.body;

        const device =
            await prisma.device.create({
            data,
            });

        res
            .status(201)
            .json(device);
        } catch (error) {
        console.log(error);

        res
            .status(500)
            .json({
            message:
                "Gagal menambah perangkat",
            });
        }
    };
/*
=================================
UPDATE DEVICE
=================================
*/
export const updateDevice =
    async (
        req: Request,
        res: Response
    ) => {
        try {
        const id = Number(
            req.params.id
        );

        const device =
            await prisma.device.update({
            where: { id },
            data: req.body,
            });

        return res.json({
            message:
            "Perangkat berhasil diupdate",
            data: device,
        });
        } catch (error) {
        console.error(error);

        return res.status(500).json({
            message:
            "Gagal update perangkat",
        });
        }
    };

/*
=================================
DELETE DEVICE
=================================
*/
export const deleteDevice =
    async (
        req: Request,
        res: Response
    ) => {
        try {
        const id = Number(
            req.params.id
        );

        await prisma.device.delete({
            where: { id },
        });

        return res.json({
            message:
            "Perangkat berhasil dihapus",
        });
        } catch (error) {
        console.error(error);

        return res.status(500).json({
            message:
            "Gagal hapus perangkat",
        });
        }
    };

/*
=================================
DEVICE STATS
=================================
*/
export const getDeviceStats =
    async (
        _req: Request,
        res: Response
    ) => {
        try {
        const total =
            await prisma.device.count();

        const machines =
            await prisma.device.count({
            where: {
                type:
                "machine",
            },
            });

        const drones =
            await prisma.device.count({
            where: {
                type:
                "drone",
            },
            });

        const active =
            await prisma.device.count({
            where: {
                status:
                "active",
            },
            });

        const maintenance =
            await prisma.device.count({
            where: {
                status:
                "maintenance",
            },
            });

        return res.json({
            total,
            machines,
            drones,
            active,
            maintenance,
        });
        } catch (error) {
        console.error(error);

        return res.status(500).json({
            message:
            "Gagal mengambil statistik perangkat",
        });
        }
    };

    