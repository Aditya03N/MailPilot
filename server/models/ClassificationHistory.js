import mongoose from 'mongoose';

const classificationHistorySchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  previousResponsibility: {
    type: String,
    enum: ['ASSISTANT_TO_REPLY', 'CLIENT_TO_REPLY', 'NO_REPLY_NEEDED', 'NEEDS_REVIEW', null],
  },
  newResponsibility: {
    type: String,
    enum: ['ASSISTANT_TO_REPLY', 'CLIENT_TO_REPLY', 'NO_REPLY_NEEDED', 'NEEDS_REVIEW'],
    required: true,
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  changeSource: {
    type: String,
    enum: ['AI_CLASSIFICATION', 'MANUAL_ASSISTANT', 'CLIENT_HANDOVER', 'SYSTEM_RESET'],
    required: true,
  },
  reason: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('ClassificationHistory', classificationHistorySchema);

