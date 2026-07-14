import { Router } from "express";
import { connectDB } from "../config/mongodb";
import { ObjectId } from "mongodb";

const router = Router();

// GET all bookings for a user (BY EMAIL)
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const email = req.query.email as string;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email query parameter is required",
      });
    }

    console.log("GET BOOKINGS ROUTE HIT FOR:", email);

    const bookings = await db
      .collection("bookings")
      .find({ email })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching bookings",
    });
  }
});

// CREATE a new booking
router.post("/", async (req, res) => {
  try {
    const db = await connectDB();
    const { email, placeId, placeName, image, location, date, price } = req.body;

    if (!email || !placeName || !date || !price) {
      return res.status(400).json({
        success: false,
        message: "email, placeName, date, and price are required",
      });
    }

    console.log("CREATE BOOKING ROUTE HIT FOR:", email);

const newBooking = {
  email,
  placeId,
  placeName,
  image:
    image?.trim() ||
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80",
  location: location || "Not Specified",
  date,
  price,
  status: "pending",
  createdAt: new Date(),
  updatedAt: new Date(),
};

    const result = await db.collection("bookings").insertOne(newBooking);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: { ...newBooking, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while creating booking",
    });
  }
});

// CANCEL a booking BY ID
router.patch("/:id/cancel", async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.params;

    console.log("CANCEL BOOKING ROUTE HIT FOR:", id);

    const result = await db.collection("bookings").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "cancelled",
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while cancelling booking",
    });
  }
});

export default router;