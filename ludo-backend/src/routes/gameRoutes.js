import { Router } from 'express';
import { getActiveGames } from '../controllers/gameController.js';

const router = Router();
router.get('/stats', getActiveGames);

export default router;
