import { Router } from "express";
import upload from "../middlewares/upload";
import {
    getProducts,
    createProduct,
    toggleProduct,
    deleteProduct,
    updateProduct,
} from "../controllers/product.controller";

const router = Router();

/*
    GET all products
*/
router.get("/", getProducts);

/*
    POST create product
*/
router.post(
    "/",
    upload.array("images", 10),
    createProduct
);

/*
    PATCH toggle active
*/
router.patch(
    "/:id/toggle",
    toggleProduct
);

/*
    UPDATE product
*/
router.put(
    "/:id",
    upload.array("images", 10),
    updateProduct
);

/*
    DELETE product
*/
router.delete(
    "/:id",
    deleteProduct
);

export default router;