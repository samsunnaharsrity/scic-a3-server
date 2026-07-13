import express from "express";
import { 
  getAllStays, 
  getStayById, 
  createStay, 
  updateStay, 
  deleteStay 
} from "../controllers/stay.controller";

const router = express.Router();

router.get("/", getAllStays);
router.get("/:id", getStayById);
router.post("/", createStay);
router.put("/:id", updateStay);
router.delete("/:id", deleteStay);

export default router;