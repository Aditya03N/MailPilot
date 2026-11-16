import express from "express";
import {
  getAssistantDashboard,
  getClientDashboard,
} from "../controllers/dashboardController.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/assistant", requireRole("assistant"), getAssistantDashboard);
router.get("/client", getClientDashboard);

export default router;
