import { Router } from "express";
import {
    getVouchers,
    createVoucher,
    toggleVoucher,
    updateVoucher,
} from "../controllers/voucher.controller";
import {
    getFlashSales,
    createFlashSale,
} from "../controllers/flashsale.controller";

const router = Router();

// Voucher
router.get("/vouchers", getVouchers);
router.post("/vouchers", createVoucher);
router.patch("/vouchers/:id/toggle", toggleVoucher);
router.patch("/vouchers/:id", updateVoucher);

// Flash Sale
router.get("/flash-sales", getFlashSales);
router.post("/flash-sales", createFlashSale);

export default router;