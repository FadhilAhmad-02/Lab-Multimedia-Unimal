import { Router } from "express";
import {
    createOrder,
    getOrders,
    updateOrderStatus,
    getPendingPayments,
    confirmPayment,
    rejectPayment,
    getRevenueReport,
} from "../controllers/order.controller";
import { authenticate, onlyAdminOrOperator } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, onlyAdminOrOperator, getOrders);
router.get("/revenue", authenticate, onlyAdminOrOperator, getRevenueReport);
router.get("/pending-payment", authenticate, onlyAdminOrOperator, getPendingPayments);

router.post("/", createOrder);

router.patch("/:id/status", authenticate, onlyAdminOrOperator, updateOrderStatus);
router.patch("/:id/confirm-payment", authenticate, onlyAdminOrOperator, confirmPayment);
router.patch("/:id/reject-payment", authenticate, onlyAdminOrOperator, rejectPayment);

export default router;