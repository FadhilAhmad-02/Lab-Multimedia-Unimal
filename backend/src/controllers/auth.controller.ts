import { Request, Response } from "express";
import prisma from "../config/prisma";

export const register = async (
  _req: Request,
  res: Response
) => {
  try {
    const user = await prisma.user.create({
      data: {
        fullName: "Ahmad Fadhil",
        email: "fadhil2@test.com",
        phoneNumber: "08123456788",
        password: "12345678",
        referralCode: null,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal register",
    });
  }
};