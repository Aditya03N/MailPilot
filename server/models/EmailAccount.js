import mongoose from 'mongoose';

const emailAccountSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  provider: {
    type: String,
    enum: ['google', 'microsoft', 'other'],
    default: 'google',
  },
  emailAddress: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  connectionStatus: {
    type: String,
    enum: ['connected', 'disconnected', 'error', 'syncing'],
    default: 'connected',
  },
  isSimulated: {
    type: Boolean,
    default: true,
  },
  lastSyncedAt: {
    type: Date,
    default: Date.now,
  },
  syncStats: {
    totalSynced: { type: Number, default: 0 },
    unreadCount: { type: Number, default: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('EmailAccount', emailAccountSchema);

