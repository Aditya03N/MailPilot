import Conversation from '../models/Conversation.js';
import ClassificationHistory from '../models/ClassificationHistory.js';
import { analyzeConversationWithGemini, draftCustomReply } from '../services/ai/geminiService.js';
import { getGeminiModel } from '../config/ai.js';

// @desc    Reanalyze conversation with Gemini
// @route   POST /api/ai/classify/:id
// @access  Private (Assistant)
export const reanalyzeConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, teamId: req.user.teamId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const previousResponsibility = conversation.currentResponsibility;
    const aiResult = await analyzeConversationWithGemini(conversation);

    // Save AI findings
    conversation.aiResponsibility = aiResult.responsibility;
    // Overwrite only if user didn't explicitly lock or if reanalysis explicitly requested
    conversation.currentResponsibility = aiResult.responsibility;
    conversation.aiCategory = aiResult.category;
    conversation.summary = aiResult.summary;
    conversation.reason = aiResult.reason;
    conversation.suggestedAction = aiResult.suggestedAction;
    conversation.confidence = aiResult.confidence;
    conversation.actionRequired = aiResult.actionRequired;
    conversation.extractedDates = aiResult.extractedDates;
    conversation.keyPoints = aiResult.keyPoints;
    conversation.suggestedReply = aiResult.suggestedReply;
    conversation.isManuallyOverridden = false;

    await conversation.save();

    await ClassificationHistory.create({
      conversationId: conversation._id,
      previousResponsibility,
      newResponsibility: aiResult.responsibility,
      changedBy: req.user._id,
      changeSource: 'AI_CLASSIFICATION',
      reason: `Reanalyzed via Gemini AI: ${aiResult.reason}`,
    });

    res.json({
      success: true,
      message: 'Conversation reanalyzed with Gemini successfully.',
      analysis: aiResult,
      conversation,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Draft tailored reply
// @route   POST /api/ai/draft-reply/:id
// @access  Private
export const generateDraftReply = async (req, res, next) => {
  try {
    const { instruction } = req.body;
    const conversation = await Conversation.findOne({ _id: req.params.id, teamId: req.user.teamId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const draft = await draftCustomReply(conversation, instruction);
    res.json({ success: true, draft });
  } catch (err) {
    next(err);
  }
};

// @desc    AI Assistant Chat with retrieval of team conversations
// @route   POST /api/ai/chat
// @access  Private (Assistant)
export const aiChatAssistant = async (req, res, next) => {
  try {
    const { message, conversationContextId } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message prompt is required.' });
    }

    // Retrieve authorized team conversations
    const query = { teamId: req.user.teamId, isArchived: false };
    const recentConversations = await Conversation.find(query)
      .sort({ lastMessageAt: -1 })
      .limit(15)
      .select('subject summary currentResponsibility aiCategory status lastMessageAt participants extractedDates actionRequired isImportant');

    // Build context summary for Gemini
    const contextSummary = recentConversations.map(c => ({
      id: c._id,
      subject: c.subject,
      summary: c.summary,
      responsibility: c.currentResponsibility,
      category: c.aiCategory,
      status: c.status,
      actionRequired: c.actionRequired,
      isImportant: c.isImportant,
      extractedDates: c.extractedDates,
    }));

    const systemPrompt = `You are MailPilot Copilot, an AI assistant dedicated to helping Personal Assistants manage executive emails.
The user's role is ${req.user.role} and their name is ${req.user.name}.
Here is the current database of recent email conversations in their authorized workspace:
${JSON.stringify(contextSummary, null, 2)}

Instructions:
- Provide concise, practical, high-value answers.
- When referencing specific emails, clearly state the subject and current responsibility.
- If asked about upcoming meetings, check extractedDates or category 'MEETINGS'.
- If asked about client attention, check responsibility 'CLIENT_TO_REPLY'.
- Keep your tone professional, structured, and helpful. Use markdown bullet points for readability.`;

    try {
      const model = getGeminiModel('gemini-1.5-flash');
      const chat = model.startChat({
        history: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: "Understood. I am MailPilot Copilot. I have analyzed the current workspace email context and am ready to assist you with triage, scheduling, delegation, and client approvals." }] }
        ]
      });

      const response = await chat.sendMessage(message);
      res.json({
        success: true,
        answer: response.response.text(),
      });
    } catch (aiErr) {
      console.warn('[Gemini Chat Fallback]', aiErr.message);

      // Fallback local smart answering based on actual data
      const q = message.toLowerCase();
      let answer = '';

      if (q.includes('attention') || q.includes('need') || q.includes('assistant to reply')) {
        const paEmails = recentConversations.filter(c => c.currentResponsibility === 'ASSISTANT_TO_REPLY');
        answer = `You currently have **${paEmails.length} conversations** assigned to you:\n` +
          paEmails.map(c => `• **${c.subject}** (${c.aiCategory}) — ${c.summary}`).join('\n');
      } else if (q.includes('client') || q.includes('approval')) {
        const clientEmails = recentConversations.filter(c => c.currentResponsibility === 'CLIENT_TO_REPLY');
        answer = `There are **${clientEmails.length} conversations** requiring client decision:\n` +
          clientEmails.map(c => `• **${c.subject}** — ${c.summary}`).join('\n');
      } else if (q.includes('meeting') || q.includes('calendar') || q.includes('schedule')) {
        const meetings = recentConversations.filter(c => c.aiCategory === 'MEETINGS' || (c.extractedDates && c.extractedDates.length > 0));
        answer = `Found **${meetings.length} meeting & appointment items**:\n` +
          meetings.map(c => `• **${c.subject}** — Status: ${c.status}`).join('\n');
      } else {
        answer = `I reviewed your workspace conversations. You have ${recentConversations.length} active threads across administrative coordination, client decision requests, and calendar appointments. Let me know if you would like me to draft replies or highlight urgent decisions.`;
      }

      res.json({ success: true, answer });
    }
  } catch (err) {
    next(err);
  }
};

