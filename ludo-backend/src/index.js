import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { setupSocketServer } from './sockets/index.js';

const app = express();
const server = http.createServer(app);

// Global Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Mount API Routes
app.use('/api', routes);

// 404 and Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

// Setup Socket.IO
const io = setupSocketServer(server);

// Start Server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`
  🎲 Pak Ludo Backend Service
  =========================================
  🚀 Server running on: http://localhost:${PORT}
  🔌 WebSockets ready on ws://localhost:${PORT}
  🌐 Client Origin: ${config.clientUrl}
  =========================================
  `);
});

export { app, server, io };
