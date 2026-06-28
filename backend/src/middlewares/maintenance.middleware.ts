// middleware/maintenance.middleware.ts
// Pasang di app.ts SEBELUM route customer, SESUDAH route admin.

import { Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "./auth.middleware"; // file ini ada di folder middlewares, jadi path tetap sama

const prisma = new PrismaClient();

let maintenanceCache: { active: boolean; message: string; lastCheck: number } = {
  active: false,
  message: "",
  lastCheck: 0,
};
const CACHE_TTL = 30_000; // 30 detik

export const maintenanceGuard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Admin dan operator tetap bisa akses saat maintenance
  const role = req.user?.role;
  if (role === "admin" || role === "operator") return next();

  const now = Date.now();
  if (now - maintenanceCache.lastCheck > CACHE_TTL) {
    try {
      const rows = await prisma.setting.findMany({
        where: { key: { in: ["maintenance_mode", "maintenance_message"] } },
      });
      const map = Object.fromEntries(rows.map((r: { key: string; value: string }) => [r.key, r.value]));
      maintenanceCache = {
        active: map["maintenance_mode"] === "true",
        message: map["maintenance_message"] || "Website sedang dalam pemeliharaan.",
        lastCheck: now,
      };
    } catch {
      return next(); // DB error → lanjut saja
    }
  }

  if (maintenanceCache.active) {
    return res.status(503).json({
      success: false,
      maintenance: true,
      message: maintenanceCache.message,
    });
  }

  next();
};

/** Panggil setelah update setting maintenance agar cache langsung reset */
export const invalidateMaintenanceCache = () => {
  maintenanceCache.lastCheck = 0;
};