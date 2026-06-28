// routes/customer_order.routes.ts
// Daftarkan di server.ts:
//   import customerOrderRouter from "./routes/customer_order.routes";
//   app.use("/api/customer/orders", customerOrderRouter);

import { Router } from "express";
import { authenticate, onlyCustomer } from "../middlewares/auth.middleware";
import {
    getMyOrders,
    getMyOrderById,
    submitPaymentProof,
    uploadPaymentProof,
    confirmReceived,
} from "../controllers/customerorder.controller";

const router = Router();

// Semua route di sini butuh token customer
router.use(authenticate, onlyCustomer);

// [1] Daftar pesanan saya
// GET /api/customer/orders?status=processing&page=1&limit=10
router.get("/", getMyOrders);

// [2] Detail satu pesanan (validasi ownership di controller)
// GET /api/customer/orders/:id
router.get("/:id", getMyOrderById);

// [3] Upload bukti pembayaran (multipart, field: "proof")
// POST /api/customer/orders/:id/payment-proof
router.post(
    "/:id/payment-proof",
    uploadPaymentProof.single("proof"),
    submitPaymentProof
);

// [4] Konfirmasi penerimaan pesanan
// PATCH /api/customer/orders/:id/confirm-received
router.patch("/:id/confirm-received", confirmReceived);

export default router;