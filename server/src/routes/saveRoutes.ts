import express from "express";
import { toggleSaveItem, getSavedItems } from "../controllers/saveController";

const router = express.Router();

router.post("/toggle", toggleSaveItem);
router.get("/user/:userEmail", getSavedItems);

export default router;