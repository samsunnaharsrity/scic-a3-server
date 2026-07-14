import { Router } from "express";
import { connectDB } from "../config/mongodb";

const router = Router();

// console.log("✅ settings.route.ts loaded");

// GET SETTINGS
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();

    const settings = await db.collection("admin_settings").findOne({
      type: "general",
    });

    res.json(
      settings || {
        siteName: "StayNest",
        email: "",
        phone: "",
        address: "",
        currency: "USD",
        bookingFee: "10",
        emailNotification: true,
        maintenanceMode: false,
      }
    );
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to load settings",
    });
  }
});

// SAVE SETTINGS
router.post("/", async (req, res) => {
  try {
    const db = await connectDB();

    await db.collection("admin_settings").updateOne(
      { type: "general" },
      {
        $set: {
          type: "general",
          ...req.body,
        },
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: "Settings updated",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Database failure",
    });
  }
});

export default router;