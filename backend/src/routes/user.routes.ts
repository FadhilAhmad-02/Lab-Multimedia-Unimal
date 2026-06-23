import { Router } from "express";
import { getUsers } from "../controllers/user.controller";
import { authenticate, onlyAdminOrOperator } from "../middlewares/auth.middleware";

const router = Router();

// Hanya admin dan operator yang bisa melihat daftar user
router.get("/", authenticate, onlyAdminOrOperator, getUsers);

export default router;