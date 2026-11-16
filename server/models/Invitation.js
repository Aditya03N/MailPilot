import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  requestedRole: {
    type: String,
    enum: ["assistant", "client"],
    required: true,
  },
  tokenHash: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "expired", "revoked"],
    default: "pending",
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Invitation", invitationSchema);
