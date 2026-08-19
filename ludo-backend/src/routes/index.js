import { Router } from 'express';
import authRoutes from './authRoutes.js';
import leaderboardRoutes from './leaderboardRoutes.js';
import gameRoutes from './gameRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/games', gameRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Pak Ludo Real-time Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
