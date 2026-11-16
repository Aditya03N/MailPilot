import express from "express";
import {
  getConversations,
  getConversationById,
  createConversation,
  updateResponsibility,
  toggleImportant,
  toggleRead,
  toggleArchive,
  sendSimulatedReply,
  escalateEmailToClient,
  addInternalNote,
} from "../controllers/conversationController.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getConversations);
router.post("/", createConversation);
router.get("/:id", getConversationById);
router.patch(
  "/:id/responsibility",
  requireRole("assistant"),
  updateResponsibility,
);
router.patch("/:id/important", toggleImportant);
router.patch("/:id/read", toggleRead);
router.patch("/:id/archive", toggleArchive);
router.post("/:id/reply", sendSimulatedReply);
router.post("/:id/escalate", requireRole("assistant"), escalateEmailToClient);
router.post("/:id/internal-note", addInternalNote);

export default router;
