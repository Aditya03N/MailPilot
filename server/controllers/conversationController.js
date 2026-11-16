import Conversation from '../models/Conversation.js';
import ClassificationHistory from '../models/ClassificationHistory.js';
import Handover from '../models/Handover.js';
import { analyzeConversationWithGemini } from '../services/ai/geminiService.js';

// @desc    Get all conversations with filters & search
// @route   GET /api/conversations
// @access  Private (Assistant or Client scoped)
export const getConversations = async (req, res, next) => {
  try {
    const { segment, search, category, responsibility, sort = 'newest', page = 1, limit = 50 } = req.query;

    const query = {
      teamId: req.user.teamId,
      isArchived: false,
    };

    // Client security boundary: Clients only see conversations where they are the designated client
    if (req.user.role === 'client') {
      query.clientId = req.user._id;
    }

    // Segment filtering
    if (segment) {
      switch (segment) {
        case 'assistant-to-reply':
          query.currentResponsibility = 'ASSISTANT_TO_REPLY';
          break;
        case 'client-to-reply':
          query.currentResponsibility = 'CLIENT_TO_REPLY';
          break;
        case 'no-reply-needed':
          query.currentResponsibility = 'NO_REPLY_NEEDED';
          break;
        case 'needs-review':
          query.currentResponsibility = 'NEEDS_REVIEW';
          break;
        case 'action-required':
          query.actionRequired = true;
          break;
        case 'important':
          query.isImportant = true;
          break;
        case 'waiting-response':
          query.status = 'waiting_response';
          break;
        case 'meetings':
          query.aiCategory = 'MEETINGS';
          break;
        case 'archived':
          query.isArchived = true;
          break;
        default:
          break;
      }
    }

    if (category) {
      query.aiCategory = category.toUpperCase();
    }

    if (responsibility) {
      query.currentResponsibility = responsibility;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { subject: searchRegex },
        { summary: searchRegex },
        { 'participants.name': searchRegex },
        { 'participants.email': searchRegex },
        { 'messages.bodyText': searchRegex },
      ];
    }

    const sortOption = sort === 'oldest' ? { lastMessageAt: 1 } : { lastMessageAt: -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const conversations = await Conversation.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('clientId', 'name email');

    const total = await Conversation.countDocuments(query);

    res.json({
      success: true,
      count: conversations.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      conversations,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single conversation detail
// @route   GET /api/conversations/:id
// @access  Private
export const getConversationById = async (req, res, next) => {
  try {
    const query = { _id: req.params.id, teamId: req.user.teamId };
    if (req.user.role === 'client') {
      query.clientId = req.user._id;
    }

    const conversation = await Conversation.findOne(query).populate('clientId', 'name email');
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found or unauthorized.' });
    }

    // Auto mark read if requested
    if (conversation.isUnread) {
      conversation.isUnread = false;
      await conversation.save();
    }

    const history = await ClassificationHistory.find({ conversationId: conversation._id })
      .populate('changedBy', 'name role')
      .sort({ createdAt: -1 });

    const handovers = await Handover.find({ conversationId: conversation._id })
      .populate('requestedBy', 'name role')
      .populate('assignedTo', 'name role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      conversation,
      history,
      handovers,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create / Inject a new conversation (or incoming email)
// @route   POST /api/conversations
// @access  Private
export const createConversation = async (req, res, next) => {
  try {
    const { subject, participants, messages, clientId, isImportant } = req.body;

    const targetClientId = clientId || (req.user.role === 'client' ? req.user._id : req.user._id);

    const newConversation = new Conversation({
      teamId: req.user.teamId,
      clientId: targetClientId,
      subject,
      participants: participants || [],
      messages: messages || [],
      isImportant: isImportant || false,
    });

    // Run AI classification
    const aiResult = await analyzeConversationWithGemini(newConversation);
    newConversation.aiResponsibility = aiResult.responsibility;
    newConversation.currentResponsibility = aiResult.responsibility;
    newConversation.aiCategory = aiResult.category;
    newConversation.summary = aiResult.summary;
    newConversation.reason = aiResult.reason;
    newConversation.suggestedAction = aiResult.suggestedAction;
    newConversation.confidence = aiResult.confidence;
    newConversation.actionRequired = aiResult.actionRequired;
    newConversation.extractedDates = aiResult.extractedDates;
    newConversation.keyPoints = aiResult.keyPoints;
    newConversation.suggestedReply = aiResult.suggestedReply;

    await newConversation.save();

    await ClassificationHistory.create({
      conversationId: newConversation._id,
      previousResponsibility: null,
      newResponsibility: aiResult.responsibility,
      changedBy: req.user._id,
      changeSource: 'AI_CLASSIFICATION',
      reason: aiResult.reason,
    });

    res.status(201).json({ success: true, conversation: newConversation });
  } catch (err) {
    next(err);
  }
};

// @desc    Manually override responsibility
// @route   PATCH /api/conversations/:id/responsibility
// @access  Private (Assistant)
export const updateResponsibility = async (req, res, next) => {
  try {
    const { responsibility, reason } = req.body;
    const valid = ['ASSISTANT_TO_REPLY', 'CLIENT_TO_REPLY', 'NO_REPLY_NEEDED', 'NEEDS_REVIEW'];

    if (!valid.includes(responsibility)) {
      return res.status(400).json({ success: false, message: 'Invalid responsibility classification.' });
    }

    const conversation = await Conversation.findOne({ _id: req.params.id, teamId: req.user.teamId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const prev = conversation.currentResponsibility;
    conversation.currentResponsibility = responsibility;
    conversation.isManuallyOverridden = true;
    await conversation.save();

    await ClassificationHistory.create({
      conversationId: conversation._id,
      previousResponsibility: prev,
      newResponsibility: responsibility,
      changedBy: req.user._id,
      changeSource: 'MANUAL_ASSISTANT',
      reason: reason || 'Manual adjustment by Personal Assistant.',
    });

    res.json({
      success: true,
      message: 'Responsibility updated successfully.',
      conversation,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle Important
// @route   PATCH /api/conversations/:id/important
// @access  Private
export const toggleImportant = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, teamId: req.user.teamId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    conversation.isImportant = req.body.isImportant !== undefined ? req.body.isImportant : !conversation.isImportant;
    await conversation.save();

    res.json({ success: true, isImportant: conversation.isImportant });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle Read / Unread
// @route   PATCH /api/conversations/:id/read
// @access  Private
export const toggleRead = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, teamId: req.user.teamId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    conversation.isUnread = req.body.isUnread !== undefined ? req.body.isUnread : !conversation.isUnread;
    await conversation.save();

    res.json({ success: true, isUnread: conversation.isUnread });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle Archive
// @route   PATCH /api/conversations/:id/archive
// @access  Private
export const toggleArchive = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, teamId: req.user.teamId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    conversation.isArchived = req.body.isArchived !== undefined ? req.body.isArchived : !conversation.isArchived;
    await conversation.save();

    res.json({ success: true, isArchived: conversation.isArchived });
  } catch (err) {
    next(err);
  }
};

// @desc    PA escalates evaluated important email to Client
// @route   POST /api/conversations/:id/escalate
// @access  Private (Assistant)
export const escalateEmailToClient = async (req, res, next) => {
  try {
    const { note } = req.body;
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      teamId: req.user.teamId,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    // Ensure clientId is attached
    if (!conversation.clientId) {
      const User = (await import('../models/User.js')).default;
      const defaultClient = await User.findOne({ teamId: req.user.teamId, role: 'client' });
      if (defaultClient) {
        conversation.clientId = defaultClient._id;
      }
    }

    const prev = conversation.currentResponsibility;
    conversation.currentResponsibility = 'CLIENT_TO_REPLY';
    conversation.isImportant = true;
    conversation.escalatedToClient = true;
    conversation.escalationNote = note || 'Escalated by Personal Assistant for executive review.';
    conversation.isManuallyOverridden = true;

    if (note && note.trim()) {
      conversation.internalNotes.push({
        senderId: req.user._id,
        senderName: req.user.name,
        senderRole: 'assistant',
        message: note.trim(),
        timestamp: new Date(),
      });
    }

    await conversation.save();

    try {
      await ClassificationHistory.create({
        conversationId: conversation._id,
        previousResponsibility: prev,
        newResponsibility: 'CLIENT_TO_REPLY',
        changedBy: req.user._id,
        changeSource: 'MANUAL_ASSISTANT',
        reason: note ? `PA Evaluated & Forwarded: ${note}` : 'Personal Assistant evaluated and forwarded as Important to Client.',
      });
    } catch (e) {
      console.warn('ClassificationHistory non-fatal warning:', e.message);
    }

    try {
      await Handover.create({
        conversationId: conversation._id,
        requestedBy: req.user._id,
        assignedTo: conversation.clientId,
        action: 'ESCALATE_TO_CLIENT',
        note: note || 'Personal Assistant forwarded this important matter to you.',
        status: 'pending',
      });
    } catch (e) {
      console.warn('Handover non-fatal warning:', e.message);
    }

    // Real-time notification to client
    const { emitToTeam } = await import('../config/socket.js');
    emitToTeam(req.user.teamId, 'conversation_updated', {
      type: 'ESCALATED_TO_CLIENT',
      conversationId: conversation._id,
      subject: conversation.subject,
      actorName: req.user.name,
    });

    res.json({
      success: true,
      message: 'Important email forwarded to client attention queue.',
      conversation,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add an internal collaboration message between PA and Client
// @route   POST /api/conversations/:id/internal-note
// @access  Private (Assistant or Client)
export const addInternalNote = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty.' });
    }

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      teamId: req.user.teamId,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const newNote = {
      senderId: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      message: message.trim(),
      timestamp: new Date(),
    };

    conversation.internalNotes.push(newNote);
    await conversation.save();

    const { emitToTeam } = await import('../config/socket.js');
    emitToTeam(req.user.teamId, 'conversation_updated', {
      type: 'INTERNAL_NOTE_ADDED',
      conversationId: conversation._id,
      note: newNote,
      senderRole: req.user.role,
      actorName: req.user.name,
    });

    res.json({
      success: true,
      message: 'Internal note recorded successfully.',
      internalNotes: conversation.internalNotes,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Simulate sending reply
// @route   POST /api/conversations/:id/reply
// @access  Private
export const sendSimulatedReply = async (req, res, next) => {
  try {
    const { bodyText } = req.body;
    if (!bodyText) {
      return res.status(400).json({ success: false, message: 'Reply content cannot be empty.' });
    }

    const conversation = await Conversation.findOne({ _id: req.params.id, teamId: req.user.teamId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    // Add message
    const replyMessage = {
      senderName: req.user.name,
      senderEmail: req.user.email,
      recipientName: conversation.participants[0]?.name || 'Client',
      recipientEmail: conversation.participants[0]?.email || 'sender@example.com',
      bodyText,
      timestamp: new Date(),
      isInbound: false,
      isSimulatedSent: true,
    };

    conversation.messages.push(replyMessage);
    conversation.status = 'handled';
    conversation.currentResponsibility = 'NO_REPLY_NEEDED';
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Broadcast real-time update to PA & Client
    const { emitToTeam } = await import('../config/socket.js');
    emitToTeam(req.user.teamId, 'conversation_updated', {
      type: 'REPLY_SENT',
      conversationId: conversation._id,
      actorName: req.user.name,
      senderEmail: req.user.email,
    });

    res.json({
      success: true,
      message: 'Reply recorded and sent successfully.',
      conversation,
    });
  } catch (err) {
    next(err);
  }
};

