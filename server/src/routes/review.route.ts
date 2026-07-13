import { Router } from "express";
import { addReview, getReviewsByPlace, getReviewsByUser } from "../controllers/review.controller";



const router = Router();

router.get(
 "/user/:email",
 getReviewsByUser
);


router.get(
 "/place/:placeId",
 getReviewsByPlace
);


router.post(
 "/",
 addReview
);


export default router;