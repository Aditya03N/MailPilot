import express from "express";
import {
  createTeam,
  joinTeam,
  getCurrentTeam,
  getTeamMembers,
  approveMember,
} from "../controllers/teamController.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/create", requireRole("assistant"), createTeam);
router.post("/join", joinTeam);
router.get("/current", getCurrentTeam);
router.get("/members", getTeamMembers);
router.post("/approve-member", requireRole("assistant"), approveMember);

export default router;
