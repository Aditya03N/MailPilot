import mongoose from 'mongoose';
import dns from 'dns';

// Ensure standard reliable DNS servers for mongodb+srv resolution across all environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if running in a restricted sandbox
}

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('[MongoDB Error] MONGODB_URI environment variable is missing!');
      process.exit(1);
    }
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error] ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

