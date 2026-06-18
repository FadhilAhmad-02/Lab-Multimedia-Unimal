import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

/* =========================
   CREATE TEMPLATE
========================= */
export const createTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, items } = req.body;

    const template = await prisma.configTemplate.create({
      data: {
        name,
        items: {
          create: items,
        },
      },
      include: {
        items: true,
      },
    });

    res.json(template);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET ALL TEMPLATE
========================= */
export const getTemplates = async (_req: Request, res: Response): Promise<void> => {
  try {
    const templates = await prisma.configTemplate.findMany({
      include: {
        items: true,
      },
    });

    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET BY ID
========================= */
export const getTemplateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const template = await prisma.configTemplate.findUnique({
      where: { id: Number(id) },
      include: {
        items: true,
      },
    });

    res.json(template);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   NORMALIZED (FOR FRONTEND)
========================= */
export const getTemplateNormalized = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const template = await prisma.configTemplate.findUnique({
      where: { id: Number(id) },
      include: {
        items: true,
      },
    });

    const result = {
      material: [] as any[],
      finishing: [] as any[],
      size: [] as any[],
      design: [] as any[],
    };

    template?.items.forEach((item) => {
      if (result[item.type as keyof typeof result]) {
        result[item.type as keyof typeof result].push({
          name: item.name,
          extraPrice: item.extraPrice,
        });
      }
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};