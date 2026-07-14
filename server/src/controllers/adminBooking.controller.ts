import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { connectDB } from "../config/mongodb";

export const updateBookingStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const db = await connectDB();

    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    await db.collection("bookings").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );

    res.json({
      success: true,
      message: "Booking status updated",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to update booking",
    });
  }
};

export const getAllBookings = async (
  req: Request,
  res: Response
) => {
  try {
    const db = await connectDB();

    const bookings = await db
      .collection("bookings")
      .aggregate([
        {
          $lookup: {
            from: "user",
            localField: "email",
            foreignField: "email",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            placeName: 1,
            image: 1,
            date: 1,
            price: 1,
            status: 1,
            email: 1,
            createdAt: 1,

            userName: "$user.name",
            userImage: "$user.image",
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ])
      .toArray();

    res.status(200).json({
      success: true,
      total: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};