import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderName: { type: String, required: true },
  senderEmail: { type: String, required: true },
  recipientName: { type: String, default: "" },
  recipientEmail: { type: String, required: true },
  bodyText: { type: String, required: true },
  bodyHtml: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
  isInbound: { type: Boolean, default: true },
  isSimulatedSent: { type: Boolean, default: false },
  attachments: [
    {
      filename: String,
      size: String,
      contentType: String,
    },
  ],
});

const conversationSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  emailAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EmailAccount",
    default: null,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  participants: [
    {
      name: String,
      email: String,
      role: { type: String, default: "participant" },
    },
  ],
  messages: [messageSchema],

  // AI Classification Fields
  aiResponsibility: {
    type: String,
    enum: [
      "ASSISTANT_TO_REPLY",
      "CLIENT_TO_REPLY",
      "NO_REPLY_NEEDED",
      "NEEDS_REVIEW",
    ],
    default: "NEEDS_REVIEW",
  },
  currentResponsibility: {
    type: String,
    enum: [
      "ASSISTANT_TO_REPLY",
      "CLIENT_TO_REPLY",
      "NO_REPLY_NEEDED",
      "NEEDS_REVIEW",
    ],
    default: "NEEDS_REVIEW",
  },
  aiCategory: {
    type: String,
    enum: [
      "GENERAL",
      "MEETINGS",
      "IMPORTANT",
      "ACTION_REQUIRED",
      "WAITING_RESPONSE",
      "NEWSLETTER",
      "FINANCE",
      "LEGAL",
    ],
    default: "GENERAL",
  },
  summary: {
    type: String,
    default: "",
  },
  reason: {
    type: String,
    default: "",
  },
  suggestedAction: {
    type: String,
    default: "",
  },
  confidence: {
    type: Number,
    default: 0.85,
  },
  actionRequired: {
    type: Boolean,
    default: false,
  },
  extractedDates: [
    {
      title: String,
      date: Date,
      rawText: String,
    },
  ],
  keyPoints: [
    {
      type: String,
    },
  ],
  suggestedReply: {
    type: String,
    default: "",
  },

  // State Flags
  isImportant: {
    type: Boolean,
    default: false,
  },
  isUnread: {
    type: Boolean,
    default: true,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "in_progress",
      "handled",
      "completed",
      "waiting_client",
      "waiting_third_party",
    ],
    default: "pending",
  },
  isManuallyOverridden: {
    type: Boolean,
    default: false,
  },
  escalatedToClient: {
    type: Boolean,
    default: false,
  },
  escalationNote: {
    type: String,
    default: '',
  },
  clientDelegationNote: {
    type: String,
    default: '',
  },
  internalNotes: [
    {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      senderName: {
        type: String,
        default: '',
      },
      senderRole: {
        type: String,
        enum: ['assistant', 'client'],
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

conversationSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  if (this.messages && this.messages.length > 0) {
    const lastMsg = this.messages[this.messages.length - 1];
    this.lastMessageAt = lastMsg.timestamp || new Date();
  }
  next();
});

export default mongoose.model("Conversation", conversationSchema);
