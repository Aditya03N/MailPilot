import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/error.js';
import { initSocket } from './config/socket.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import emailAccountRoutes from './routes/emailAccountRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();

// Connect MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io for Real-Time Client-PA Bridge
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});
initSocket(io);

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'MailPilot API with Real-Time Bridge',
    version: '1.1.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/email-accounts', emailAccountRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Static frontend serving in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexHtml = path.join(clientDistPath, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) next();
  });
});

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`[MailPilot Server] Running with Socket.IO on http://localhost:${PORT}`);
});

