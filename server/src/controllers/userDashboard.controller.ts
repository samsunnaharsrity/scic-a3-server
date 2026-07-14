import { Request, Response } from "express";
import { connectDB } from "../config/mongodb";

export const getUserDashboard = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const db = await connectDB();

    const bookings = await db
      .collection("bookings")
      .find({ email })
      .toArray();

      console.log(bookings);

    const saved = await db
      .collection("saved_items")
      .countDocuments({ userEmail: String(email), });

      console.log(saved)

    const reviews = await db
      .collection("reviews")
      .countDocuments({ userEmail: email });

    const user = await db
      .collection("user")
      .findOne({ email });
      // console.log(user)

    res.json({
      success: true,
      data: {
        userName: user?.name || "Traveler",
        totalBookings: bookings.length,
        savedPlaces: saved,
        totalReviews: reviews,
        totalVisited: bookings.filter(
          (b) => b.status === "confirmed"
        ).length,

        recentActivity: bookings
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          )
          .slice(0, 5)
          .map((booking) => ({
            title: booking.placeName,
            description: `Booking for ${booking.date}`,
            status:
              booking.status.charAt(0).toUpperCase() +
              booking.status.slice(1),
          })),
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
};