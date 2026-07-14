import { Request, Response } from "express";
import { getDB } from "../config/mongodb";

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const db = getDB();

    const usersCollection = db.collection("user");
    const staysCollection = db.collection("explorePlaces");
    const bookingsCollection = db.collection("bookings");

    // Counts
    const totalUsers = await usersCollection.countDocuments();
    const totalStays = await staysCollection.countDocuments();
    const totalBookings = await bookingsCollection.countDocuments();

    // Revenue
    const bookingList = await bookingsCollection.find().toArray();

    const totalRevenue = bookingList.reduce(
      (sum: number, booking: any) => sum + Number(booking.totalPrice || booking.price || 0),
      0
    );

    // Monthly Growth
    const monthlyMap: Record<string, number> = {};

    bookingList.forEach((booking: any) => {
      const date = booking.createdAt
        ? new Date(booking.createdAt)
        : new Date();

      const month = date.toLocaleString("default", {
        month: "short",
      });

      monthlyMap[month] = (monthlyMap[month] || 0) + 1;
    });

    const monthlyGrowth = Object.entries(monthlyMap).map(
      ([month, count]) => ({
        month,
        percentage: count,
      })
    );

    // Categories
    const stays = await staysCollection.find().toArray();

    const categoryMap: Record<string, number> = {};

    stays.forEach((stay: any) => {
      const category = stay.category || "Other";
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });

    const categories = Object.entries(categoryMap).map(
      ([name, bookings]) => ({
        name,
        bookings,
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStays,
        totalBookings,
        totalRevenue,
        monthlyGrowth,
        categories,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
};