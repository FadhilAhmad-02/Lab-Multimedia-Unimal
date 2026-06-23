import { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key_ganti_ini";

// ----------------------------------------------------------------
// POST /api/auth/register-staff  — HANYA UNTUK DEVELOPMENT
// Hapus atau nonaktifkan endpoint ini sebelum deploy ke production
// ----------------------------------------------------------------
export const registerStaff = async (req: AuthRequest, res: Response) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ message: "Endpoint ini tidak tersedia di production" });
  }

  try {
    const { fullName, email, phoneNumber, password, role } = req.body;

    if (!fullName || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({ message: "Semua field wajib diisi termasuk role" });
    }

    const validRoles = [UserRole.admin, UserRole.operator, UserRole.customer];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: `Role tidak valid. Pilih: ${validRoles.join(", ")}`,
      });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const existingPhone = await prisma.user.findUnique({ where: { phoneNumber } });
    if (existingPhone) {
      return res.status(400).json({ message: "Nomor HP sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { fullName, email, phoneNumber, password: hashedPassword, role },
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      message: `Akun ${role} berhasil dibuat (dev only)`,
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("RegisterStaff error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// ----------------------------------------------------------------
// POST /api/auth/register  — publik, role selalu customer
// ----------------------------------------------------------------
export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, email, phoneNumber, password, referralCode } = req.body;

    if (!fullName || !email || !phoneNumber || !password) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const existingPhone = await prisma.user.findUnique({ where: { phoneNumber } });
    if (existingPhone) {
      return res.status(400).json({ message: "Nomor HP sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phoneNumber,
        password: hashedPassword,
        referralCode: referralCode || null,
        role: UserRole.customer,
      },
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      message: "Registrasi berhasil",
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// ----------------------------------------------------------------
// POST /api/auth/login
// ----------------------------------------------------------------
export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email dan password wajib diisi" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ message: "Akun Anda telah diblokir. Hubungi administrator." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Login berhasil",
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// ----------------------------------------------------------------
// GET /api/auth/me  — butuh token
// ----------------------------------------------------------------
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        avatar: true,
        points: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("GetMe error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};