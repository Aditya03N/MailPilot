import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a workspace name"],
    trim: true,
  },
  teamCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  settings: {
    aiAutoAnalyze: {
      type: Boolean,
      default: true,
    },
    defaultClientNotification: {
      type: Boolean,
      default: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Team", teamSchema);
