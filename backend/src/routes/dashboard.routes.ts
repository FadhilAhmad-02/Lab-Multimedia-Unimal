import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller";
import { authenticate, onlyAdminOrOperator } from "../middlewares/auth.middleware";

const router = Router();

// Hanya admin & operator yang boleh lihat dashboard
router.get("/", authenticate, onlyAdminOrOperator, getDashboard);

export default router;