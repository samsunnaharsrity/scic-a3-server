import { Request, Response } from "express";
import { getDB } from "../config/mongodb";

interface UserParams {
  email: string;
}

export const getReviewsByUser = async (
  req: Request<UserParams>,
  res: Response
) => {
  try {
    const db = getDB();

    const { email } = req.params;

    const reviews = await db
      .collection("reviews")
      .find({
        userEmail: decodeURIComponent(email),
      })
      .sort({
        createdAt: -1,
      })
      .toArray();

    return res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user reviews",
    });
  }
};





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
      .sort({
        createdAt: -1,
      })
      .toArray();

    const total = reviews.length;

    const average =
      total > 0
        ? Number(
            (
              reviews.reduce(
                (sum: number, item: any) => sum + item.rating,
                0
              ) / total
            ).toFixed(1)
          )
        : 0;

    res.json({
      success: true,
      totalReviews: total,
      averageRating: average,
      reviews,
    });
  } catch (error) {
    console.log(error);

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