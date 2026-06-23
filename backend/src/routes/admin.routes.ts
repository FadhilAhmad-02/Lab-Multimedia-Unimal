import { Router } from "express";
import {
    createStaffUser,
    updateUserRole,
    updateUserStatus,
} from "../controllers/admin.controller";
import { authenticate, onlyAdmin } from "../middlewares/auth.middleware";

const router = Router();

// Semua route di sini butuh token + role admin
router.use(authenticate, onlyAdmin);

// Buat akun operator / admin baru
router.post("/users", createStaffUser);

// Ubah role user
router.patch("/users/:id/role", updateUserRole);

// Blokir / aktifkan user
router.patch("/users/:id/status", updateUserStatus);

export default router;