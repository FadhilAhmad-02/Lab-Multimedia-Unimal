import { Response } from "express";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";

// ----------------------------------------------------------------
// POST /api/admin/users
// Hanya admin yang bisa membuat akun operator / admin baru
// ----------------------------------------------------------------
export const createStaffUser = async (req: AuthRequest, res: Response) => {
    try {
        const { fullName, email, phoneNumber, password, role } = req.body;

        if (!fullName || !email || !phoneNumber || !password || !role) {
        return res.status(400).json({ message: "Semua field wajib diisi" });
        }

        // Hanya izinkan pembuatan akun operator atau admin
        const allowedRoles: UserRole[] = [UserRole.operator, UserRole.admin];
        if (!allowedRoles.includes(role)) {
        return res.status(400).json({
            message: `Role tidak valid. Pilih salah satu: ${allowedRoles.join(", ")}`,
        });
        }

        const existingEmail = await prisma.user.findUnique({ where: { email } });
        if (existingEmail) {
        return res.status(400).json({ message: "Email sudah terdaftar" });
        }

        const existingPhone = await prisma.user.findUnique({
        where: { phoneNumber },
        });
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
            role,
        },
        select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            role: true,
            createdAt: true,
        },
        });

        return res.status(201).json({
        message: `Akun ${role} berhasil dibuat`,
        user,
        });
    } catch (error) {
        console.error("CreateStaffUser error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ----------------------------------------------------------------
// PATCH /api/admin/users/:id/role
// Ubah role user (admin only)
// ----------------------------------------------------------------
export const updateUserRole = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const validRoles = Object.values(UserRole);
        if (!validRoles.includes(role)) {
        return res.status(400).json({
            message: `Role tidak valid. Pilih salah satu: ${validRoles.join(", ")}`,
        });
        }

        const user = await prisma.user.findUnique({ where: { id: Number(id) } });
        if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const updated = await prisma.user.update({
        where: { id: Number(id) },
        data: { role },
        select: { id: true, fullName: true, email: true, role: true },
        });

        return res.status(200).json({
        message: "Role berhasil diperbarui",
        user: updated,
        });
    } catch (error) {
        console.error("UpdateUserRole error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};

// ----------------------------------------------------------------
// PATCH /api/admin/users/:id/status
// Blokir / aktifkan user (admin only)
// ----------------------------------------------------------------
export const updateUserStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["active", "blocked"].includes(status)) {
        return res
            .status(400)
            .json({ message: "Status tidak valid. Pilih: active atau blocked" });
        }

        const user = await prisma.user.findUnique({ where: { id: Number(id) } });
        if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const updated = await prisma.user.update({
        where: { id: Number(id) },
        data: { status },
        select: { id: true, fullName: true, email: true, role: true, status: true },
        });

        return res.status(200).json({
        message: `Status user berhasil diubah menjadi ${status}`,
        user: updated,
        });
    } catch (error) {
        console.error("UpdateUserStatus error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};