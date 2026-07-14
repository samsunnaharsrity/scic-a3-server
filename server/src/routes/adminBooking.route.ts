import { Router } from "express";
import { getAllBookings, updateBookingStatus } from "../controllers/adminBooking.controller";


const router = Router();

router.get("/", getAllBookings);

router.patch("/:id/status", updateBookingStatus);

export default router;