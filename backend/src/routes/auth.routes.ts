import { Router } from "express";
import { register, registerStaff, login, getMe } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { loginLimiter } from "../security";

const router = Router();

// Publik
router.post("/register", register);
router.post("/register-staff", registerStaff); // DEV ONLY — hapus saat production
router.post("/login", loginLimiter, login);

// Butuh token (semua role)
router.get("/me", authenticate, getMe);

export default router;
