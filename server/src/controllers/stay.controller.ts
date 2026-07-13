import { Request, Response } from "express";
import { ObjectId, Db } from "mongodb";
import { connectDB } from "../config/mongodb";

// ১. Get All Stays
export const getAllStays = async (req: Request, res: Response) => {
  try {
    const db = (await connectDB()) as Db;
    const stays = await db.collection("stays").find().sort({ _id: -1 }).toArray();

    return res.status(200).json({
      success: true,
      data: stays,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch stays" });
  }
};

// ২. Get Stay By ID
export const getStayById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const db = (await connectDB()) as Db;
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const stay = await db.collection("stays").findOne({ _id: new ObjectId(id) });

    if (!stay) {
      return res.status(404).json({ success: false, message: "Stay not found" });
    }

    return res.status(200).json({ success: true, data: stay });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ৩. Create New Stay (Admin)
export const createStay = async (req: Request, res: Response) => {
  try {
    const db = (await connectDB()) as Db;
    const result = await db.collection("stays").insertOne(req.body);
    
    const newStay = await db.collection("stays").findOne({ _id: result.insertedId });
    return res.status(201).json(newStay);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to create stay" });
  }
};

// ৪. Update Stay (Admin)
export const updateStay = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const db = (await connectDB()) as Db;
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const { title, location, price, type, image } = req.body;

    const result = await db.collection("stays").updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, location, price: Number(price), type, image } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Stay not found" });
    }

    const updatedStay = await db.collection("stays").findOne({ _id: new ObjectId(id) });
    return res.status(200).json(updatedStay);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update stay" });
  }
};

// ৫. Delete Stay (Admin)
export const deleteStay = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const db = (await connectDB()) as Db;
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const result = await db.collection("stays").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Stay not found" });
    }

    return res.status(200).json({ success: true, message: "Stay deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to delete stay" });
  }
};