import { Router } from "express";
import { addReview, getReviewsByPlace } from "../controllers/review.controller";


const router = Router();

router.get("/:placeId", getReviewsByPlace);
router.post("/", addReview);

export default router;