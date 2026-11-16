import Conversation from '../models/Conversation.js';
import Handover from '../models/Handover.js';
import ClassificationHistory from '../models/ClassificationHistory.js';
import User from '../models/User.js';
import { emitToTeam } from '../config/socket.js';

// @desc    Get client attention queue (only conversations requiring client action)
// @route   GET /api/client/attention
// @access  Private (Client or Assistant viewing client view)
export const getClientAttentionQueue = async (req, res, next) => {
  try {
    const clientId = req.user.role === 'client' ? req.user._id : req.query.clientId;

    if (!clientId) {
      return res.status(400).json({ success: false, message: 'Client ID is required.' });
    }

    const conversations = await Conversation.find({
      teamId: req.user.teamId,
      clientId,
      currentResponsibility: 'CLIENT_TO_REPLY',
      status: { $ne: 'handled' },
      isArchived: false,
    }).sort({ isImportant: -1, lastMessageAt: -1 });

    const totalHandled = await Conversation.countDocuments({
      teamId: req.user.teamId,
      clientId,
      status: 'handled',
    });

    res.json({
      success: true,
      count: conversations.length,
      handledCount: totalHandled,
      conversations,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Client marks conversation as handled
// @route   POST /api/client/handle/:id
// @access  Private (Client or Assistant)
export const markHandledByClient = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      teamId: req.user.teamId,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    conversation.status = 'handled';
    conversation.currentResponsibility = 'NO_REPLY_NEEDED';
    await conversation.save();

    await Handover.create({
      conversationId: conversation._id,
      requestedBy: req.user._id,
      action: 'MARK_HANDLED_BY_CLIENT',
      status: 'completed',
      note: 'Client marked this conversation as resolved and handled directly.',
    });

    await ClassificationHistory.create({
      conversationId: conversation._id,
      previousResponsibility: 'CLIENT_TO_REPLY',
      newResponsibility: 'NO_REPLY_NEEDED',
      changedBy: req.user._id,
      changeSource: 'CLIENT_HANDOVER',
      reason: 'Marked as Handled by Client.',
    });

    // Real-time synchronization event across PA and Client
    emitToTeam(req.user.teamId, 'conversation_updated', {
      type: 'HANDLED',
      conversationId: conversation._id,
      status: 'handled',
      actorName: req.user.name,
    });

    res.json({
      success: true,
      message: 'Conversation marked as handled and archived from active attention.',
      conversation,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Client delegates / hands over conversation to PA
// @route   POST /api/client/handover/:id
// @access  Private (Client or Assistant)
export const handoverToAssistant = async (req, res, next) => {
  try {
    const { note } = req.body;
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      teamId: req.user.teamId,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    // Find primary assistant in workspace
    const primaryAssistant = await User.findOne({
      teamId: req.user.teamId,
      role: 'assistant',
    });

    const previousResponsibility = conversation.currentResponsibility;
    conversation.currentResponsibility = 'ASSISTANT_TO_REPLY';
    conversation.isManuallyOverridden = true;
    conversation.status = 'in_progress';
    conversation.clientDelegationNote = note || '';

    if (note && note.trim()) {
      conversation.internalNotes.push({
        senderId: req.user._id,
        senderName: req.user.name,
        senderRole: 'client',
        message: note.trim(),
        timestamp: new Date(),
      });
    }

    await conversation.save();

    await Handover.create({
      conversationId: conversation._id,
      requestedBy: req.user._id,
      assignedTo: primaryAssistant ? primaryAssistant._id : null,
      action: 'ASK_ASSISTANT_TO_HANDLE',
      note: note || 'Client requested personal assistant to take over communication.',
      status: 'pending',
    });

    await ClassificationHistory.create({
      conversationId: conversation._id,
      previousResponsibility,
      newResponsibility: 'ASSISTANT_TO_REPLY',
      changedBy: req.user._id,
      changeSource: 'CLIENT_HANDOVER',
      reason: note ? `Client handover note: ${note}` : 'Client handed over communication to Personal Assistant.',
    });

    // Real-time synchronization event to PA
    emitToTeam(req.user.teamId, 'conversation_updated', {
      type: 'DELEGATED_TO_PA',
      conversationId: conversation._id,
      note: note || '',
      actorName: req.user.name,
    });

    res.json({
      success: true,
      message: 'Conversation handed over to your Personal Assistant.',
      conversation,
    });
  } catch (err) {
    next(err);
  }
};

