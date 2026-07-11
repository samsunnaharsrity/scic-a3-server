import { Router } from "express";
import { ObjectId } from "mongodb";
import { connectDB } from "../config/mongodb";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const db = await connectDB();

    const places = await db
      .collection("explorePlaces")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      count: places.length,
      data: places,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load explore places",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const db = await connectDB();

    const { id } = req.params;

    const place = await db
      .collection("explorePlaces")
      .findOne({
        _id: new ObjectId(id),
      });

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    res.status(200).json({
      success: true,
      data: place,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Invalid ID or Server Error",
    });
  }
});

export default router;