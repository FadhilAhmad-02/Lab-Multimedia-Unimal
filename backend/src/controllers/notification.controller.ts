// backend/src/controllers/notification.controller.ts

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { broadcastToAllCustomers, broadcastToUser } from "../lib/notificationService";

const prisma = new PrismaClient();

interface AuthReq extends Request {
  user?: { id: number; role: "admin" | "operator" | "customer" };
}

// ─── Helper: query param → string, aman dari "string | string[] | undefined" ─
function qs(val: unknown, fallback = ""): string {
  if (val === undefined || val === null) return fallback;
  if (Array.isArray(val)) return String(val[0] ?? fallback);
  return String(val);
}

// ─────────────────────────────────────────────────────────────────
// ADMIN ENDPOINTS
// ─────────────────────────────────────────────────────────────────

export async function getAdminNotifications(req: AuthReq, res: Response) {
  try {
    const category = qs(req.query.category);
    const read     = qs(req.query.read);
    const search   = qs(req.query.search);
    const page     = parseInt(qs(req.query.page,  "1"));
    const limit    = parseInt(qs(req.query.limit, "30"));

    const where: any = { userId: null };
    if (category && category !== "semua") where.category = category;
    if (read)   where.read = read === "true";
    if (search) where.OR  = [{ title: { contains: search } }, { description: { contains: search } }];

    const [data, total, unread] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, title: true, description: true, category: true, read: true, createdAt: true, orderId: true },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: null, read: false } }),
    ]);

    res.json({ data, total, unread });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil notifikasi admin" });
  }
}

export async function getAdminUnreadCount(req: AuthReq, res: Response) {
  try {
    const count = await prisma.notification.count({ where: { userId: null, read: false } });
    res.json({ count });
  } catch {
    res.status(500).json({ message: "Error" });
  }
}

export async function toggleAdminRead(req: AuthReq, res: Response) {
  try {
    const id    = parseInt(qs(req.params.id));
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== null) return res.status(404).json({ message: "Tidak ditemukan" });

    const updated = await prisma.notification.update({ where: { id }, data: { read: !notif.read } });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengubah status" });
  }
}

export async function markAllAdminRead(req: AuthReq, res: Response) {
  try {
    await prisma.notification.updateMany({ where: { userId: null, read: false }, data: { read: true } });
    res.json({ message: "Semua ditandai dibaca" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal" });
  }
}

export async function deleteAdminNotification(req: AuthReq, res: Response) {
  try {
    const id = parseInt(qs(req.params.id));
    await prisma.notification.delete({ where: { id } });
    res.json({ message: "Berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus" });
  }
}

export async function clearAllAdminNotifications(req: AuthReq, res: Response) {
  try {
    await prisma.notification.deleteMany({ where: { userId: null } });
    res.json({ message: "Semua notifikasi admin dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal" });
  }
}

// ─────────────────────────────────────────────────────────────────
// BROADCAST
// ─────────────────────────────────────────────────────────────────

export async function sendBroadcast(req: AuthReq, res: Response) {
  try {
    const { title, description, userId } = req.body as { title: string; description: string; userId?: number };
    if (!title || !description) return res.status(400).json({ message: "title dan description wajib diisi" });

    if (userId) {
      await broadcastToUser({ userId, title, description });
    } else {
      await broadcastToAllCustomers({ title, description });
    }
    res.json({ message: "Broadcast berhasil dikirim" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengirim broadcast" });
  }
}

// ─────────────────────────────────────────────────────────────────
// CUSTOMER ENDPOINTS
// ─────────────────────────────────────────────────────────────────

export async function getMyNotifications(req: AuthReq, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const userId = req.user.id;

    const category = qs(req.query.category);
    const read     = qs(req.query.read);
    const search   = qs(req.query.search);
    const page     = parseInt(qs(req.query.page,  "1"));
    const limit    = parseInt(qs(req.query.limit, "20"));

    const where: any = { userId };
    if (category && category !== "semua") where.category = category;
    if (read)   where.read = read === "true";
    if (search) where.OR  = [{ title: { contains: search } }, { description: { contains: search } }];

    const [data, total, unread] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, title: true, description: true, category: true, read: true, createdAt: true, orderId: true },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    res.json({ data, total, unread });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil notifikasi" });
  }
}

export async function getMyUnreadCount(req: AuthReq, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const count = await prisma.notification.count({ where: { userId: req.user.id, read: false } });
    res.json({ count });
  } catch {
    res.status(500).json({ message: "Error" });
  }
}

export async function getMyNotificationsPreview(req: AuthReq, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const userId = req.user.id;

    const [data, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, description: true, category: true, read: true, createdAt: true, orderId: true },
      }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    res.json({ data, unread });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal" });
  }
}

export async function toggleMyRead(req: AuthReq, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const id     = parseInt(qs(req.params.id));
    const userId = req.user.id;

    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId) return res.status(404).json({ message: "Tidak ditemukan" });

    const updated = await prisma.notification.update({ where: { id }, data: { read: !notif.read } });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal" });
  }
}

export async function markAllMyRead(req: AuthReq, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    await prisma.notification.updateMany({ where: { userId: req.user.id, read: false }, data: { read: true } });
    res.json({ message: "Semua ditandai dibaca" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal" });
  }
}

export async function deleteMyNotification(req: AuthReq, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const id    = parseInt(qs(req.params.id));
    const notif = await prisma.notification.findUnique({ where: { id } });

    if (!notif || notif.userId !== req.user.id) return res.status(404).json({ message: "Tidak ditemukan" });

    await prisma.notification.delete({ where: { id } });
    res.json({ message: "Berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus" });
  }
}