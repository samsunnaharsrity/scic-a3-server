import { Request, Response } from "express";
import { getDB } from "../config/mongodb";

interface UserParams {
  email: string;
}

interface PlaceParams {
  placeId: string;
}

interface AddReviewBody {
  placeId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment?: string;
}

/**
 * Get all reviews by a specific user
 */
export const getReviewsByUser = async (
  req: Request<UserParams>,
  res: Response
) => {
  try {
    const db = getDB();
    const email = decodeURIComponent(req.params.email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "User email is required.",
      });
    }

    const reviews = await db
      .collection("reviews")
      .find({ userEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get User Reviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user reviews.",
    });
  }
};

/**
 * Get reviews and rating statistics for a place
 */
export const getReviewsByPlace = async (
  req: Request<PlaceParams>,
  res: Response
) => {
  try {
    const db = getDB();
    const { placeId } = req.params;

    if (!placeId) {
      return res.status(400).json({
        success: false,
        message: "Place ID is required.",
      });
    }

    const reviews = await db
      .collection("reviews")
      .find({ placeId })
      .sort({ createdAt: -1 })
      .toArray();

    const stats = await db
      .collection("reviews")
      .aggregate([
        {
          $match: {
            placeId,
          },
        },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: "$rating" },
          },
        },
      ])
      .toArray();

    return res.status(200).json({
      success: true,
      totalReviews: stats[0]?.totalReviews || 0,
      averageRating: stats[0]
        ? Number(stats[0].averageRating.toFixed(1))
        : 0,
      reviews,
    });
  } catch (error) {
    console.error("Get Place Reviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews.",
    });
  }
};

/**
 * Add a new review
 */
export const addReview = async (
  req: Request<{}, {}, AddReviewBody>,
  res: Response
) => {
  try {
    const db = getDB();

    const {
      placeId,
      userName,
      userEmail,
      rating,
      comment = "",
    } = req.body;

    if (!placeId || !userName || !userEmail || rating === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "placeId, userName, userEmail and rating are required.",
      });
    }

    const parsedRating = Number(rating);

    if (parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    const review = {
      placeId,
      userName,
      userEmail,
      rating: parsedRating,
      comment,
      createdAt: new Date(),
    };

    const result = await db.collection("reviews").insertOne(review);

    return res.status(201).json({
      success: true,
      message: "Review added successfully.",
      insertedId: result.insertedId,
      review,
    });
  } catch (error) {
    console.error("Add Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add review.",
    });
  }
};