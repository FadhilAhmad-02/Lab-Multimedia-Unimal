// backend/src/routes/notification.routes.ts
// Import path disesuaikan dengan naming convention kamu: notification.controller
import { Router } from "express";
import {
  getAdminNotifications,
  getAdminUnreadCount,
  toggleAdminRead,
  markAllAdminRead,
  deleteAdminNotification,
  clearAllAdminNotifications,
  sendBroadcast,
  getMyNotifications,
  getMyUnreadCount,
  getMyNotificationsPreview,
  toggleMyRead,
  markAllMyRead,
  deleteMyNotification,
} from "../controllers/notification.controller";

const router = Router();

function adminOnly(req: any, res: any, next: any) {
  if (req.user?.role === "admin" || req.user?.role === "operator") return next();
  return res.status(403).json({ message: "Forbidden" });
}

// ─── Admin ─────────────────────────────────────────────────────
router.get("/admin",              adminOnly, getAdminNotifications);
router.get("/admin/count",        adminOnly, getAdminUnreadCount);
router.patch("/admin/read-all",   adminOnly, markAllAdminRead);
router.patch("/admin/:id/read",   adminOnly, toggleAdminRead);
router.delete("/admin/clear-all", adminOnly, clearAllAdminNotifications);
router.delete("/admin/:id",       adminOnly, deleteAdminNotification);

// ─── Broadcast ─────────────────────────────────────────────────
router.post("/broadcast", adminOnly, sendBroadcast);

// ─── Customer ──────────────────────────────────────────────────
router.get("/me",            getMyNotifications);
router.get("/me/count",      getMyUnreadCount);
router.get("/me/preview",    getMyNotificationsPreview);
router.patch("/me/read-all", markAllMyRead);
router.patch("/me/:id/read", toggleMyRead);
router.delete("/me/:id",     deleteMyNotification);

export default router;