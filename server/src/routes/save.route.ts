console.log("✅ save.route.ts loaded successfully");

import express from "express";

import { getSavedItems, toggleSaveItem } from "../controllers/saveController";

const router = express.Router();

router.post("/toggle", toggleSaveItem);

router.get("/user/:userEmail", getSavedItems);

export default router;