import { Request, Response } from "express";
import { ObjectId, Db } from "mongodb";
import { connectDB } from "../config/mongodb";

export const toggleSaveItem = async (req: Request, res: Response) => {
  try {
    const db = (await connectDB()) as Db;
    const { placeId, userEmail } = req.body;

    if (!placeId || !userEmail) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    
    const existing = await db.collection("saved_items").findOne({
      placeId: placeId.toString(),
      userEmail,
    });

    if (existing) {
      await db.collection("saved_items").deleteOne({ _id: existing._id });
      return res.json({ success: true, isSaved: false });
    }

   
    let place = null;
    if (ObjectId.isValid(placeId)) {
      place = await db.collection("explorePlaces").findOne({ 
        _id: new ObjectId(placeId) 
      });
    }

    if (!place) {
      return res.status(404).json({ 
        success: false, 
        message: "Place not found in explorePlaces collection." 
      });
    }

 
    await db.collection("saved_items").insertOne({
      placeId: placeId.toString(),
      userEmail,
      placeName: place.title, 
      imageUrl: place.image, 
      savedAt: new Date(),
    });

    return res.json({ success: true, isSaved: true });
  } catch (err) {
    console.error("Error in toggleSaveItem:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


export const getSavedItems = async (req: Request, res: Response) => {
  try {
    const db = (await connectDB()) as Db;
    const { userEmail } = req.params;

    if (!userEmail) {
      return res.status(400).json({ success: false, message: "User email is required" });
    }


    const savedItems = await db
      .collection("saved_items")
      .find({ userEmail })
      .sort({ savedAt: -1 })
      .toArray();

    return res.status(200).json({ 
      success: true, 
      savedItems 
    });
  } catch (error: any) {
    console.error("Error in getSavedItems:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch saved items" });
  }
};