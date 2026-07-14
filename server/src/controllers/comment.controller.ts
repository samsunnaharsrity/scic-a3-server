import { Request, Response } from "express";
import { ObjectId, Db } from "mongodb";
import { connectDB } from "../config/mongodb";

export const getCommentsByPlace = async (
  req: Request<{ placeId: string }>,
  res: Response
) => {
  try {
    const db = (await connectDB()) as Db;

    const { placeId } = req.params;

    if (!placeId) {
      return res.status(400).json({
        success: false,
        message: "placeId parameter is missing",
      });
    }

    let query: any = { placeId };

    if (ObjectId.isValid(placeId)) {
      query = {
        $or: [
          { placeId },
          { placeId: new ObjectId(placeId) },
        ],
      };
    }

    const comments = await db
      .collection("comments")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const addComment = async (req: Request, res: Response) => {
  try {
    const db = (await connectDB()) as Db;
    const { placeId, userName, userEmail, comment } = req.body;

    if (!placeId || !userName || !comment) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (placeId, userName, or comment)",
      });
    }

    const newComment = {
      placeId: ObjectId.isValid(placeId) ? new ObjectId(placeId) : placeId,
      userName,
      userEmail: userEmail || "",
      comment,
      likes: [], 
      createdAt: new Date(),
      replies: [],
    };

    const result = await db.collection("comments").insertOne(newComment);

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      insertedId: result.insertedId,
      comment: { ...newComment, _id: result.insertedId }
    });
  } catch (error) {
    console.error(" Error adding comment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
};


export const addReply = async (
  req: Request<{ commentId: string }>,
  res: Response
) => {
  try {
    const db = (await connectDB()) as Db;

    const { commentId } = req.params;
    const { userName, userEmail, reply } = req.body;

    if (!ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid commentId",
      });
    }

    if (!userName || !reply) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    const newReply = {
      _id: new ObjectId(),
      userName,
      userEmail: userEmail || "",
      reply,
      createdAt: new Date(),
    };

    const result = await db.collection("comments").updateOne(
      {
        _id: new ObjectId(commentId),
      },
      {
        $push: {
          replies: newReply as any,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    return res.status(200).json({
      success: true,
      reply: newReply,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to add reply",
    });
  }
};


export const toggleLikeComment = async (
  req: Request<{ commentId: string }>,
  res: Response
) => {
  try {
    const db = (await connectDB()) as Db;

    const { commentId } = req.params;
    const { userEmail } = req.body;

    if (!ObjectId.isValid(commentId) || !userEmail) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const comment = await db
      .collection("comments")
      .findOne({
        _id: new ObjectId(commentId),
      });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const hasLiked = comment.likes?.includes(userEmail);

    await db.collection("comments").updateOne(
      {
        _id: new ObjectId(commentId),
      },
      hasLiked
        ? { $pull: { likes: userEmail } }
        : { $addToSet: { likes: userEmail } }
    );

    return res.json({
      success: true,
      message: hasLiked ? "Comment unliked" : "Comment liked",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update like",
    });
  }
};

export const deleteComment = async (
  req: Request<{ commentId: string }>,
  res: Response
) => {
  try {
    const db = (await connectDB()) as Db;

    const { commentId } = req.params;

    if (!ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid commentId",
      });
    }

    const result = await db.collection("comments").deleteOne({
      _id: new ObjectId(commentId),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    return res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete comment",
    });
  }
};