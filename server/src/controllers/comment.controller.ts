import { Request, Response } from "express";
import { ObjectId, Db } from "mongodb";
import { connectDB } from "../config/mongodb";

export const getCommentsByPlace = async (req: Request, res: Response) => {
  try {
    const db = (await connectDB()) as Db;
    const placeId = req.params.placeId || req.params.id;

    if (!placeId) {
      return res.status(400).json({
        success: false,
        message: "placeId parameter is missing in request",
      });
    }

    let query: any = { placeId: placeId };

    if (ObjectId.isValid(placeId)) {
      query = {
        $or: [
          { placeId: placeId },
          { placeId: new ObjectId(placeId) }
        ]
      };
    }

    const comments = await db
      .collection("comments")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      comments: comments || [],
    });
  } catch (error) {
    console.error("❌ Critical Error in getCommentsByPlace:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while fetching comments",
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
    console.error("❌ Error adding comment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
};


export const addReply = async (req: Request, res: Response) => {
  try {
    const db = (await connectDB()) as Db;
    const { commentId } = req.params;
    const { userName, userEmail, reply } = req.body; 

    if (!ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid commentId format",
      });
    }

    if (!userName || !reply) {
      return res.status(400).json({
        success: false,
        message: "Missing reply text or userName",
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
      { _id: new ObjectId(commentId) },
      {
        $push: {
          replies: newReply as any,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Parent comment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reply added successfully",
      reply: newReply,
    });
  } catch (error) {
    console.error("❌ Error adding reply:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add reply",
    });
  }
};


export const toggleLikeComment = async (req: Request, res: Response) => {
  try {
    const db = (await connectDB()) as Db;
    const { commentId } = req.params;
    const { userEmail } = req.body;

    if (!ObjectId.isValid(commentId) || !userEmail) {
      return res.status(400).json({
        success: false,
        message: "Invalid commentId or missing userEmail",
      });
    }

    const comment = await db
      .collection("comments")
      .findOne({ _id: new ObjectId(commentId) });

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const hasLiked = comment.likes?.includes(userEmail);
    const updateOperator = hasLiked 
      ? { $pull: { likes: userEmail } } 
      : { $addToSet: { likes: userEmail } }; 

    await db.collection("comments").updateOne(
      { _id: new ObjectId(commentId) },
      updateOperator
    );

    return res.status(200).json({
      success: true,
      message: hasLiked ? "Comment unliked" : "Comment liked",
    });
  } catch (error) {
    console.error("❌ Error toggling like:", error);
    return res.status(500).json({ success: false, message: "Failed to update like" });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const db = (await connectDB()) as Db;
    const { commentId } = req.params;

    if (!ObjectId.isValid(commentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid commentId format",
      });
    }

    const result = await db
      .collection("comments")
      .deleteOne({ _id: new ObjectId(commentId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting comment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete comment",
    });
  }
};