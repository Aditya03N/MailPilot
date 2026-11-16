import mongoose from 'mongoose';

const handoverSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  action: {
    type: String,
    enum: ['ASK_ASSISTANT_TO_HANDLE', 'MARK_HANDLED_BY_CLIENT', 'ESCALATE_TO_CLIENT'],
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'completed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Handover', handoverSchema);

