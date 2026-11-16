import express from 'express';
import { reanalyzeConversation, generateDraftReply, aiChatAssistant } from '../controllers/aiController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/classify/:id', requireRole('assistant'), reanalyzeConversation);
router.post('/draft-reply/:id', generateDraftReply);
router.post('/chat', requireRole('assistant'), aiChatAssistant);

export default router;

