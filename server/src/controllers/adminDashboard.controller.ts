import { Request, Response } from "express";
import { getDB } from "../config/mongodb";

export const getDashboard = async (req: Request, res: Response) => {
  const db = getDB();

  const users = db.collection("user");
  const bookings = db.collection("bookings");
  const stays = db.collection("explorePlaces");
  const reviews = db.collection("reviews");

  const totalUsers = await users.countDocuments();

  const totalBookings = await bookings.countDocuments();

  const totalStays = await stays.countDocuments();

  const revenue = await bookings
    .aggregate([
      {
        $match: {
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$totalPrice",
          },
        },
      },
    ])
    .toArray();

  const totalRevenue = revenue[0]?.total || 0;

  const rating = await reviews
    .aggregate([
      {
        $group: {
          _id: null,
          avg: {
            $avg: "$rating",
          },
        },
      },
    ])
    .toArray();

  const averageRating = rating[0]?.avg || 0;

  const recentBookings = await bookings
    .find()
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  res.json({
    success: true,
    data: {
      totalRevenue,
      totalBookings,
      totalUsers,
      totalStays,
      averageRating: Number(averageRating.toFixed(1)),
      serverStatus: "Operational",
      apiLatency: "124ms",
      recentBookings,
    },
  });
};