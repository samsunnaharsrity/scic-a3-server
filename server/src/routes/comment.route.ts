import express from "express";
import { addComment, addReply, deleteComment, getCommentsByPlace, toggleLikeComment } from "../controllers/comment.controller";


const router = express.Router();

router.get("/:placeId", getCommentsByPlace);
router.post("/", addComment);
router.post("/:commentId/reply", addReply);
router.patch("/:commentId/like", toggleLikeComment); 
router.delete("/:commentId", deleteComment);       

export default router;