import { Router } from "express";
import {
    getProductConfigs,
    createProductConfig,
    updateProductConfig,
    deleteProductConfigs,
} from "../controllers/productConfig.controller";

const router = Router();

router.get("/:productId", getProductConfigs);

router.post("/", createProductConfig);

router.put("/:id", updateProductConfig);

router.delete("/:id", deleteProductConfigs);

export default router;