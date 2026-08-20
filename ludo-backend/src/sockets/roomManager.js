import { v4 as uuidv4 } from 'uuid';
import { PLAYER_COLORS, getValidTokenMoves, processServerMove } from '../engine/ludoRuleEngine.js';

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> RoomState
    this.socketToRoom = new Map(); // socketId -> roomId
    this.matchmakingQueues = {
      CLASSIC: [],
      QUICK: [],
      MASTER: [],
      TEAM_UP: [],
    };
  }

  getActiveRoomsCount() {
    return this.rooms.size;
  }

  getQueueCount() {
    return Object.values(this.matchmakingQueues).reduce((acc, q) => acc + q.length, 0);
  }

  // Create a custom private/public room
  createRoom(hostSocket, hostUser, options = {}) {
    const { mode = 'CLASSIC', isPrivate = true, maxPlayers = 4, entryFee = 0 } = options;
    const roomId = uuidv4();
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const needed = parseInt(maxPlayers, 10) || 4;

    const hostColor = PLAYER_COLORS[0];
    const initialPlayers = [
      {
        id: hostUser?.id || uuidv4(),
        socketId: hostSocket.id,
        name: hostUser?.name || 'Host Player',
        color: hostColor,
        isHost: true,
        isBot: false,
        tokensWon: 0,
        hasCutOpponent: false,
        tokens: [
          { id: 0, step: -1, isHome: true, isWon: false },
          { id: 1, step: -1, isHome: true, isWon: false },
          { id: 2, step: -1, isHome: true, isWon: false },
          { id: 3, step: -1, isHome: true, isWon: false },
        ],
      },
    ];

    const roomState = {
      id: roomId,
      roomCode,
      mode,
      isPrivate,
      maxPlayers: needed,
      entryFee,
      status: 'WAITING',
      currentTurn: hostColor,
      currentTurnIndex: 0,
      diceValue: null,
      hasRolled: false,
      isRolling: false,
      consecutiveSix: 0,
      validMoves: [],
      players: initialPlayers,
      moveHistory: [],
      chatMessages: [],
      createdAt: Date.now(),
    };

    this.rooms.set(roomId, roomState);
    this.socketToRoom.set(hostSocket.id, roomId);
    hostSocket.join(roomId);

    return roomState;
  }

  // Join a custom room by code
  joinRoomByCode(socket, user, roomCode) {
    const room = Array.from(this.rooms.values()).find(
      (r) => r.roomCode.toUpperCase() === roomCode.toUpperCase() && r.status === 'WAITING'
    );

    if (!room) {
      return { success: false, error: 'Room not found or game already started' };
    }

    if (room.players.length >= room.maxPlayers) {
      return { success: false, error: 'Room is already full' };
    }

    const availableColors = PLAYER_COLORS.filter(
      (c) => !room.players.some((p) => p.color === c)
    );
    const assignedColor = availableColors[0] || 'GREEN';

    const newPlayer = {
      id: user?.id || uuidv4(),
      socketId: socket.id,
      name: user?.name || `Player ${room.players.length + 1}`,
      color: assignedColor,
      isHost: false,
      isBot: false,
      tokensWon: 0,
      hasCutOpponent: false,
      tokens: [
        { id: 0, step: -1, isHome: true, isWon: false },
        { id: 1, step: -1, isHome: true, isWon: false },
        { id: 2, step: -1, isHome: true, isWon: false },
        { id: 3, step: -1, isHome: true, isWon: false },
      ],
    };

    room.players.push(newPlayer);
    this.socketToRoom.set(socket.id, room.id);
    socket.join(room.id);

    if (room.players.length >= room.maxPlayers) {
      room.status = 'IN_PROGRESS';
    }

    return { success: true, room };
  }

  removeFromQueue(socketId) {
    Object.keys(this.matchmakingQueues).forEach((mode) => {
      const idx = this.matchmakingQueues[mode].findIndex((e) => e.socket.id === socketId);
      if (idx !== -1) {
        this.matchmakingQueues[mode].splice(idx, 1);
      }
    });
  }

  // Add to Matchmaking Queue
  addToQueue(socket, user, mode = 'CLASSIC', playersNeeded = 2) {
    const queueKey = this.matchmakingQueues[mode] ? mode : 'CLASSIC';
    const needed = parseInt(playersNeeded, 10) || 2;

    this.removeFromQueue(socket.id);

    this.matchmakingQueues[queueKey].push({
      socket,
      user,
      playersNeeded: needed,
      joinedAt: Date.now(),
    });

    const currentQueue = this.matchmakingQueues[queueKey];
    console.log(`🔍 Player joined queue [${queueKey}]: ${socket.id} (Needs: ${needed} players). Total in queue: ${currentQueue.length}`);

    const matchingEntries = currentQueue.filter((p) => p.playersNeeded === needed);

    if (matchingEntries.length >= needed) {
      const matched = matchingEntries.slice(0, needed);

      matched.forEach((m) => {
        const idx = currentQueue.findIndex((entry) => entry.socket.id === m.socket.id);
        if (idx !== -1) currentQueue.splice(idx, 1);
      });

      console.log(`🎯 Match formed for ${needed} players in ${queueKey} mode! Room creating...`);

      const host = matched[0];
      const room = this.createRoom(host.socket, host.user, {
        mode: queueKey,
        isPrivate: false,
        maxPlayers: needed,
      });

      for (let i = 1; i < matched.length; i++) {
        this.joinRoomByCode(matched[i].socket, matched[i].user, room.roomCode);
      }

      room.status = 'IN_PROGRESS';
      return { matchFound: true, room };
    }

    return { matchFound: false, position: currentQueue.length };
  }

  getRoomBySocket(socketId) {
    const roomId = this.socketToRoom.get(socketId);
    return roomId ? this.rooms.get(roomId) : null;
  }

  getRoomById(roomId) {
    return this.rooms.get(roomId);
  }

  // Execute Roll Dice
  rollDice(roomId, socket) {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'IN_PROGRESS') return null;

    const currentPlayer = room.players[room.currentTurnIndex];
    const socketId = typeof socket === 'string' ? socket : socket?.id;
    const userId = typeof socket === 'object' ? socket?.user?.id : null;

    const isCurrentPlayer =
      currentPlayer.socketId === socketId ||
      (userId && currentPlayer.id === userId) ||
      (room.players.find((p) => p.socketId === socketId)?.color === currentPlayer.color);

    if (!isCurrentPlayer || room.hasRolled || room.isRolling) {
      return null;
    }

    if (socketId) {
      currentPlayer.socketId = socketId;
      this.socketToRoom.set(socketId, roomId);
      if (typeof socket === 'object' && socket.join) socket.join(roomId);
    }

    room.isRolling = true;
    const rolledValue = Math.floor(Math.random() * 6) + 1;
    const consecutive = rolledValue === 6 ? room.consecutiveSix + 1 : 0;

    room.diceValue = rolledValue;
    room.consecutiveSix = consecutive;
    room.hasRolled = true;
    room.isRolling = false;

    // 3 Consecutive 6s Penalty Check
    if (consecutive === 3) {
      room.consecutiveSix = 0;
      this.advanceTurn(room);
      return {
        room,
        rolledValue,
        penalty: true,
        validMoves: [],
      };
    }

    const validMoves = getValidTokenMoves(currentPlayer.tokens, rolledValue, {
      isMasterMode: room.mode === 'MASTER',
      hasCutOpponent: currentPlayer.hasCutOpponent,
    });

    room.validMoves = validMoves;

    return {
      room,
      rolledValue,
      penalty: false,
      validMoves,
    };
  }

  // Execute Token Move
  moveToken(roomId, socket, tokenId) {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'IN_PROGRESS' || !room.hasRolled) return null;

    const currentPlayer = room.players[room.currentTurnIndex];
    const socketId = typeof socket === 'string' ? socket : socket?.id;
    const userId = typeof socket === 'object' ? socket?.user?.id : null;

    const isCurrentPlayer =
      currentPlayer.socketId === socketId ||
      (userId && currentPlayer.id === userId) ||
      (room.players.find((p) => p.socketId === socketId)?.color === currentPlayer.color);

    if (!isCurrentPlayer) {
      console.warn(`[moveToken] Unauthorized: socket ${socketId} cannot move for ${currentPlayer.name} (${currentPlayer.color})`);
      return null;
    }

    if (socketId) {
      currentPlayer.socketId = socketId;
      this.socketToRoom.set(socketId, roomId);
      if (typeof socket === 'object' && socket.join) socket.join(roomId);
    }

    const parsedTokenId = parseInt(tokenId, 10);
    const outcome = processServerMove(room, currentPlayer.color, parsedTokenId, room.diceValue);
    if (!outcome.valid) {
      console.warn(`[moveToken] processServerMove invalid: ${outcome.error}`);
      return null;
    }

    room.players = outcome.updatedPlayers;

    const targetWon = room.mode === 'QUICK' ? 2 : 4;
    const wonPlayer = room.players.find((p) => p.color === currentPlayer.color);

    if (wonPlayer && wonPlayer.tokensWon >= targetWon) {
      room.status = 'COMPLETED';
      room.winner = wonPlayer;
      return { room, outcome, gameOver: true };
    }

    if (outcome.awardsExtraTurn) {
      // Player rolled 6 or captured pawn -> gets extra roll on same turn
      room.diceValue = null;
      room.hasRolled = false;
      room.isRolling = false;
      room.validMoves = [];
    } else {
      // Normal move completed -> pass turn to next player
      this.advanceTurn(room);
    }

    return { room, outcome, gameOver: false };
  }

  advanceTurn(room) {
    room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
    room.currentTurn = room.players[room.currentTurnIndex].color;
    room.diceValue = null;
    room.hasRolled = false;
    room.isRolling = false;
    room.consecutiveSix = 0;
    room.validMoves = [];
  }

  // Opponent Disconnect / Leave Handler
  handleDisconnect(socketId) {
    this.removeFromQueue(socketId);
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) {
      this.socketToRoom.delete(socketId);
      return null;
    }

    const leavingPlayer = room.players.find((p) => p.socketId === socketId);
    this.socketToRoom.delete(socketId);

    if (room.status === 'IN_PROGRESS') {
      const remainingHumans = room.players.filter(
        (p) => p.socketId && p.socketId !== socketId && !p.isBot
      );

      if (remainingHumans.length === 1) {
        const winner = remainingHumans[0];
        room.status = 'COMPLETED';
        room.winner = winner;
        room.forfeitReason = `${leavingPlayer?.name || 'Opponent'} left the match`;

        return {
          roomId,
          room,
          leavingPlayer,
          gameOver: true,
          winner,
          reason: room.forfeitReason,
        };
      }

      if (leavingPlayer) {
        leavingPlayer.isBot = true;
        leavingPlayer.name += ' (Bot)';
      }

      if (room.currentTurn === leavingPlayer?.color) {
        this.advanceTurn(room);
      }

      return {
        roomId,
        room,
        leavingPlayer,
        gameOver: false,
      };
    } else if (room.status === 'WAITING') {
      room.players = room.players.filter((p) => p.socketId !== socketId);
      if (room.players.length === 0) {
        this.rooms.delete(roomId);
      }
      return { roomId, room, leavingPlayer, gameOver: false };
    }

    return null;
  }
}

export const roomManager = new RoomManager();
