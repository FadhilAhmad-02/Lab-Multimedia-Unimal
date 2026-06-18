import {
    Router,
} from "express";

import {
    getMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    updateStock,
} from "../controllers/material.controller";

const router =
    Router();

router.get(
    "/",
    getMaterials
);

router.post(
    "/",
    createMaterial
);

router.put(
    "/:id",
    updateMaterial
);

router.delete(
    "/:id",
    deleteMaterial
);

router.patch(
    "/:id/stock",
    updateStock
);

export default router;