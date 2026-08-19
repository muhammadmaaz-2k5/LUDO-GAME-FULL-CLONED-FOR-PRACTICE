import { roomManager } from '../sockets/roomManager.js';

export async function getActiveGames(req, res, next) {
  try {
    const stats = {
      activeRooms: roomManager.getActiveRoomsCount(),
      playersInQueue: roomManager.getQueueCount(),
    };

    return res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
}
