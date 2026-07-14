import { Request, Response } from "express";
import { getDB } from "../config/mongodb";

export const createUser = async (
  req: Request,
  res: Response
) => {
  try {
    const db = getDB();

    const users = db.collection("users");

    const { name, email, role, plan } = req.body;

    const existing = await users.findOne({
      email,
    });

    if (existing) {
      return res.json({
        success: true,
        message: "User already exists",
      });
    }

    await users.insertOne({
      name,
      email,
      role,
      plan,
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "User created",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};