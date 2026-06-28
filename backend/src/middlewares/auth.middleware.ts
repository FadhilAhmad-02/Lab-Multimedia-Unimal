import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserRole } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key_ganti_ini";

export interface AuthRequest extends Request {
    user?: {
        id: number;
        role: UserRole;
    };
}

// Middleware verifikasi token JWT
export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
    ) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
        .status(401)
        .json({ message: "Token tidak ditemukan, silakan login" });
    }

    const token = authHeader.split(" ")[1] as string;

    try {
        // cast ke unknown dulu agar TypeScript tidak protes overlap
        const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload & {
        id: number;
        role: UserRole;
        };
        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (error) {
        return res
        .status(401)
        .json({ message: "Token tidak valid atau sudah expired" });
    }
};

// Middleware cek role — authorize("admin") | authorize("admin", "operator")
export const authorize = (...roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const userRole = req.user?.role;

        if (!userRole || !roles.includes(userRole)) {
        return res.status(403).json({ message: "Akses ditolak" });
        }

        next();
    };
};



// Shorthand helpers untuk tiap role
export const onlyAdmin = authorize(UserRole.admin);
export const onlyOperator = authorize(UserRole.operator);
export const onlyAdminOrOperator = authorize(UserRole.admin, UserRole.operator);
export const onlyCustomer = authorize(UserRole.customer);