import express from "express";
import {
  getClientAttentionQueue,
  markHandledByClient,
  handoverToAssistant,
} from "../controllers/clientController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/attention", getClientAttentionQueue);
router.post("/handle/:id", markHandledByClient);
router.post("/handover/:id", handoverToAssistant);

export default router;
