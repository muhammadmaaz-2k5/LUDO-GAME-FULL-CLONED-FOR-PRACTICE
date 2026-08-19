import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { registerGameSocketHandlers } from './gameSocketHandler.js';

export function setupSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Socket Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      jwt.verify(token, config.jwtSecret, (err, decoded) => {
        if (!err && decoded) {
          socket.user = decoded;
        }
        next();
      });
    } else {
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id} (${socket.user?.name || 'Guest'})`);
    registerGameSocketHandlers(io, socket);
  });

  return io;
}
