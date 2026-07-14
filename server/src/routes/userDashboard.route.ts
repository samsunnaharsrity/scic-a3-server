import { Router } from "express";
import { getUserDashboard } from "../controllers/userDashboard.controller";


const router = Router();


router.get("/dashboard", getUserDashboard);

export default router;