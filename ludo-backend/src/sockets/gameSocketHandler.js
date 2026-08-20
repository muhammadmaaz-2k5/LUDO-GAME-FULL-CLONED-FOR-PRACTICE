import { roomManager } from './roomManager.js';

export function setupGameSocketHandlers(io, socket) {
  // 1. Join Matchmaking Queue
  socket.on('join_queue', ({ mode = 'CLASSIC', players = 2 }) => {
    try {
      const user = socket.user || { name: 'Player' };
      const parsedPlayers = parseInt(players, 10) || 2;
      const result = roomManager.addToQueue(socket, user, mode, parsedPlayers);

      if (result.matchFound) {
        console.log(`🎉 Match successfully created: Room ${result.room.roomCode} with ${result.room.players.length} players!`);

        result.room.players.forEach((p) => {
          if (p.socketId) {
            io.to(p.socketId).emit('match_found', {
              roomId: result.room.id,
              roomCode: result.room.roomCode,
              gameState: result.room,
              yourColor: p.color,
            });

            io.to(p.socketId).emit('game_started', {
              gameState: result.room,
              currentTurn: result.room.currentTurn,
              yourColor: p.color,
            });
          }
        });
      } else {
        socket.emit('queue_joined', {
          mode,
          players: parsedPlayers,
          position: result.position,
        });
      }
    } catch (err) {
      console.error('Error in join_queue:', err);
      socket.emit('error', { message: err.message });
    }
  });

  // 2. Leave Queue
  socket.on('leave_queue', () => {
    roomManager.removeFromQueue(socket.id);
    socket.emit('queue_left', { success: true });
  });

  // 3. Create Custom Room
  socket.on('create_room', ({ mode = 'CLASSIC', isPrivate = true, maxPlayers = 4, entryFee = 0 }) => {
    try {
      const user = socket.user || { name: 'Host Player' };
      const room = roomManager.createRoom(socket, user, { mode, isPrivate, maxPlayers, entryFee });

      socket.emit('room_created', {
        roomId: room.id,
        roomCode: room.roomCode,
        gameState: room,
        yourColor: room.players[0].color,
      });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // 4. Join Custom Room by Code
  socket.on('join_room', ({ roomCode }) => {
    try {
      const user = socket.user || { name: 'Guest' };
      const result = roomManager.joinRoomByCode(socket, user, roomCode);

      if (!result.success) {
        return socket.emit('error', { message: result.error });
      }

      const joinedPlayer = result.room.players.find((p) => p.socketId === socket.id);

      socket.emit('room_joined', {
        roomId: result.room.id,
        roomCode: result.room.roomCode,
        gameState: result.room,
        yourColor: joinedPlayer?.color,
      });

      io.to(result.room.id).emit('player_joined', {
        gameState: result.room,
      });

      if (result.room.status === 'IN_PROGRESS') {
        result.room.players.forEach((p) => {
          if (p.socketId) {
            io.to(p.socketId).emit('match_found', {
              roomId: result.room.id,
              roomCode: result.room.roomCode,
              gameState: result.room,
              yourColor: p.color,
            });
            io.to(p.socketId).emit('game_started', {
              gameState: result.room,
              currentTurn: result.room.currentTurn,
              yourColor: p.color,
            });
          }
        });
      }
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  // 5. Roll Dice
  socket.on('roll_dice', ({ gameId }) => {
    try {
      const rollResult = roomManager.rollDice(gameId, socket);
      if (!rollResult) return;

      console.log(`🎲 Dice rolled in room ${gameId}: Player ${rollResult.room.currentTurn} rolled ${rollResult.rolledValue}. Valid moves: ${rollResult.validMoves.length}`);

      io.to(gameId).emit('dice_rolled', {
        playerColor: rollResult.room.currentTurn,
        value: rollResult.rolledValue,
        penalty: rollResult.penalty,
        possibleMoves: rollResult.validMoves,
        gameState: rollResult.room,
      });

      if (rollResult.validMoves.length === 0) {
        setTimeout(() => {
          const room = roomManager.getRoomById(gameId);
          if (room && room.status === 'IN_PROGRESS' && room.hasRolled && room.validMoves.length === 0) {
            roomManager.advanceTurn(room);
            console.log(`➡️ 0 moves available. Auto-advancing turn to ${room.currentTurn}`);
            io.to(gameId).emit('turn_changed', {
              gameState: room,
              currentTurn: room.currentTurn,
            });
          }
        }, 1200);
      }
    } catch (err) {
      console.error('Error in roll_dice:', err);
      socket.emit('error', { message: err.message });
    }
  });

  // 6. Move Token
  socket.on('move_token', ({ gameId, tokenId }) => {
    try {
      const moveResult = roomManager.moveToken(gameId, socket, tokenId);
      if (!moveResult) return;

      console.log(`♟️ Token moved in room ${gameId}: tokenId ${tokenId}. New turn: ${moveResult.room.currentTurn}`);

      io.to(gameId).emit('token_moved', {
        tokenId,
        outcome: moveResult.outcome,
        gameState: moveResult.room,
        currentTurn: moveResult.room.currentTurn,
      });

      if (moveResult.gameOver) {
        io.to(gameId).emit('game_over', {
          winner: moveResult.room.winner,
          gameState: moveResult.room,
        });
      }
    } catch (err) {
      console.error('Error in move_token:', err);
      socket.emit('error', { message: err.message });
    }
  });

  // 7. Timeout Turn Progression
  socket.on('turn_timeout', ({ gameId }) => {
    try {
      const room = roomManager.getRoomById(gameId);
      if (room && room.status === 'IN_PROGRESS') {
        roomManager.advanceTurn(room);
        io.to(gameId).emit('turn_changed', {
          gameState: room,
          currentTurn: room.currentTurn,
        });
      }
    } catch (err) {
      console.error('Error in turn_timeout:', err);
    }
  });

  // 8. In-Game Chat / Emoji Reaction
  socket.on('send_chat', ({ gameId, message, emoji }) => {
    try {
      const sender = socket.user?.name || 'Player';
      io.to(gameId).emit('chat_received', {
        sender,
        message,
        emoji,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error('Error in send_chat:', err);
    }
  });

  // 9. Leave Room / Match
  socket.on('leave_room', () => {
    try {
      const result = roomManager.handleDisconnect(socket.id);
      if (result) {
        if (result.gameOver) {
          io.to(result.roomId).emit('game_over', {
            winner: result.winner,
            gameState: result.room,
            reason: result.reason,
          });
        } else {
          io.to(result.roomId).emit('player_left', {
            leavingPlayer: result.leavingPlayer,
            gameState: result.room,
          });
          io.to(result.roomId).emit('turn_changed', {
            gameState: result.room,
            currentTurn: result.room.currentTurn,
          });
        }
      }
    } catch (err) {
      console.error('Error in leave_room:', err);
    }
  });

  // 10. Disconnect Handler
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
    try {
      const result = roomManager.handleDisconnect(socket.id);
      if (result) {
        if (result.gameOver) {
          io.to(result.roomId).emit('game_over', {
            winner: result.winner,
            gameState: result.room,
            reason: result.reason,
          });
        } else {
          io.to(result.roomId).emit('player_left', {
            leavingPlayer: result.leavingPlayer,
            gameState: result.room,
          });
          io.to(result.roomId).emit('turn_changed', {
            gameState: result.room,
            currentTurn: result.room.currentTurn,
          });
        }
      }
    } catch (err) {
      console.error('Error handling socket disconnect:', err);
    }
  });
}
