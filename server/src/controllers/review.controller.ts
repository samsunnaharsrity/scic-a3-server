import { Request, Response } from "express";
import { getDB } from "../config/mongodb";

export const getReviewsByPlace = async (
  req: Request,
  res: Response
) => {
  try {
    const db = getDB();

    const reviews = await db
      .collection("reviews")
      .find({
        placeId: req.params.placeId,
      })
      .sort({ createdAt: -1 })
      .toArray();

    const total = reviews.length;

    const average =
      total > 0
        ? (
            reviews.reduce(
              (sum, item) => sum + item.rating,
              0
            ) / total
          ).toFixed(1)
        : 0;

    res.json({
      success: true,
      totalReviews: total,
      averageRating: Number(average),
      reviews,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

export const addReview = async (
  req: Request,
  res: Response
) => {
  try {
    const db = getDB();

    const review = {
      placeId: req.body.placeId,
      userName: req.body.userName,
      userEmail: req.body.userEmail,
      rating: Number(req.body.rating),
      comment: req.body.comment,
      createdAt: new Date(),
    };

    const result = await db
      .collection("reviews")
      .insertOne(review);

    res.status(201).json({
      success: true,
      insertedId: result.insertedId,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to add review",
    });
  }
};