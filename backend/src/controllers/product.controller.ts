import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

export const getProducts = async (
    req: Request,
    res: Response
    ) => {
    try {
        const products = await prisma.product.findMany({
        include: {
            configurations: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        });

        const formatted = products.map((product) => ({
        ...product,
        images: Array.isArray(product.images)
            ? product.images
            : product.image
            ? [product.image]
            : [],
        }));

        return res.json(formatted);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
        message: "Gagal mengambil produk",
        });
    }
    };

/*
==========================================
CREATE PRODUCT
==========================================
*/
export const createProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      category,
      price,
      description,
      active,
      configurations,
      specifications,
      saveAsTemplate,
    } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({
        message:
          "Nama, kategori, dan harga wajib diisi",
      });
    }

    const files =
      (req.files as Express.Multer.File[]) ||
      [];

    const imageUrls = files.map(
      (file) =>
        `http://localhost:3001/uploads/${file.filename}`
    );

    const parsedConfigurations =
      typeof configurations === "string"
        ? JSON.parse(configurations)
        : configurations || [];

    const parsedSpecifications =
      typeof specifications === "string"
        ? JSON.parse(specifications)
        : specifications || [];

    const isActive =
      active === undefined
        ? true
        : active === "true" ||
          active === true;

    const shouldSaveTemplate =
      saveAsTemplate === "true" ||
      saveAsTemplate === true;

    const product =
        await prisma.product.create({
            data: {
            name,
            category,
            price: Number(price),

            image: imageUrls[0] ?? null,

            images: imageUrls as Prisma.InputJsonValue,

            description,

            active: isActive,

            specifications:
                parsedSpecifications,
            },
        });

    if (parsedConfigurations.length) {
        await prisma.productConfig.createMany(
            {
            data:
                parsedConfigurations.map(
                (item: any) => ({
                    productId: product.id,
                    type: item.type,
                    name: item.name,
                    extraPrice:
                    Number(
                        item.extraPrice
                    ) || 0,
                    active: true,
                })
                ),
            }
        );
    }

    if (
        shouldSaveTemplate &&
        parsedConfigurations.length
    ) {
        await prisma.configTemplate.create({
            data: {
            name: `${name} Template`,
            items: {
                create:
                parsedConfigurations.map(
                    (item: any) => ({
                    type: item.type,
                    name: item.name,
                    extraPrice:
                        Number(
                        item.extraPrice
                        ) || 0,
                    })
                ),
            },
            },
        });
    }

    return res.status(201).json(product);
    } catch (error) {
        console.error(error);

    return res.status(500).json({
        message: "Gagal menambah produk",
        });
    }
};

/*
==========================================
UPDATE PRODUCT
==========================================
*/
export const updateProduct = async (
    req: Request,
    res: Response
) => {
    try {
        const id = Number(req.params.id);

    const {
        name,
        category,
        price,
        description,
        active,
        configurations,
        specifications,
    } = req.body;

    const existingProduct =
        await prisma.product.findUnique({
            where: { id },
        });

        if (!existingProduct) {
        return res.status(404).json({
            message: "Produk tidak ditemukan",
        });
    }

    const files =
        (req.files as Express.Multer.File[]) ||
        [];

    const imageUrls = files.map(
        (file) =>
            `http://localhost:3001/uploads/${file.filename}`
    );

    const parsedConfigurations =
        typeof configurations === "string"
            ? JSON.parse(configurations)
            : configurations || [];

    const parsedSpecifications =
        typeof specifications === "string"
            ? JSON.parse(specifications)
            : specifications || [];

    const updated =
        await prisma.product.update({
            where: {
            id,
        },
        data: {
            name,
            category,
            price: Number(price),

            image:
                imageUrls[0] ??
                existingProduct.image ??
                null,

            images:
                imageUrls.length > 0
                    ? (imageUrls as Prisma.InputJsonValue)
                    : (existingProduct.images as Prisma.InputJsonValue),

            description,

            active:
                active === undefined
                    ? existingProduct.active
                    : active === "true" ||
                    active === true,

            specifications:
                parsedSpecifications,
            },
        });

    await prisma.productConfig.deleteMany({
        where: {
            productId: id,
        },
        });

        if (parsedConfigurations.length) {
        await prisma.productConfig.createMany(
            {
            data:
                parsedConfigurations.map(
                (item: any) => ({
                    productId: id,
                    type: item.type,
                    name: item.name,
                    extraPrice:
                    Number(
                        item.extraPrice
                    ) || 0,
                    active: true,
                })
                ),
            }
        );
        }

    return res.json(updated);
    } catch (error) {
        console.error(error);

    return res.status(500).json({
        message: "Gagal update produk",
        });
    }
};

/*
==========================================
TOGGLE ACTIVE PRODUCT
==========================================
*/
export const toggleProduct =
    async (
        req: Request,
        res: Response
    ) => {
        try {
        const id = Number(
            req.params.id
        );

        const product =
            await prisma.product.findUnique(
            {
                where: {
                id,
                },
            }
            );

        if (!product) {
            return res
            .status(404)
            .json({
                message:
                "Produk tidak ditemukan",
            });
        }

        const updated =
            await prisma.product.update(
            {
                where: {
                id,
                },
                data: {
                active:
                    !product.active,
                },
            }
            );

        return res.json(
            updated
        );
        } catch (error) {
        console.error(error);

        return res.status(500).json({
            message:
            "Gagal update status",
        });
        }
    };

/*
==========================================
DELETE PRODUCT
==========================================
*/
export const deleteProduct =
    async (
        req: Request,
        res: Response
    ) => {
        try {
        const id = Number(
            req.params.id
        );

        await prisma.product.delete(
            {
            where: {
                id,
            },
            }
        );

        return res.json({
            message:
            "Produk berhasil dihapus",
        });
        } catch (error) {
        console.error(error);

        return res.status(500).json({
            message:
            "Gagal menghapus produk",
        });
        }
    };

    