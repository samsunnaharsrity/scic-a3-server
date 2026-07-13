import { Router } from "express";
import { connectDB } from "../config/mongodb"; // আপনার ডিরেক্টরি অনুযায়ী পাথ চেক করে নিবেন



console.log("USER ROUTE FILE LOADED");

const router = Router();

// TEST ROUTE
router.get("/test", (req, res) => {
  console.log("USER TEST ROUTE HIT");
  res.status(200).json({
    success: true,
    message: "User route working",
  });
});

// GET USER PROFILE BY EMAIL
router.get("/:email", async (req, res) => {
  try {
    const db = await connectDB();
    const email = decodeURIComponent(req.params.email);

    console.log("GET USER ROUTE HIT FOR:", email);

    const user = await db
      .collection("user")
      .findOne({ email: email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user, // explorePlaces এর মতো Response Structure সামঞ্জস্যপূর্ণ রাখা হলো
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching user",
    });
  }
});

// PATCH USER PROFILE BY EMAIL
router.patch("/:email", async (req, res) => {
  try {
    const db = await connectDB();
    const email = decodeURIComponent(req.params.email);

    console.log("PATCH USER ROUTE HIT FOR:", email);

    const result = await db.collection("user").updateOne(
      { email: email },
      {
        $set: {
          ...req.body,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while updating profile",
    });
  }
});

export default router;