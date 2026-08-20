import { create } from 'zustand';
import { io } from 'socket.io-client';
import { useNotificationStore } from './useNotificationStore';
import { audioManager } from '../lib/audioManager';

const getSocketUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(window.location.hostname)) {
      return `http://${window.location.hostname}:3000`;
    }
  }
  return 'http://localhost:3000';
};

export const useLudoGameStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  isSearching: false,
  searchTime: 0,
  queuePosition: 0,
  createdRoom: null,
  activeGame: null,
  myPlayerColor: null,
  forfeitReason: null,
  isLoading: false,
  error: null,
  reactions: [],
  logs: [],

  // Initialize Socket connection
  initSocket: () => {
    if (get().socket && get().socket.connected) return;

    const token = localStorage.getItem('ludo_token');
    const socketUrl = getSocketUrl();

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to Ludo WebSocket Gateway:', newSocket.id);
      set({ isConnected: true, error: null });
    });

    newSocket.on('disconnect', () => {
      console.warn('⚠️ Disconnected from Ludo WebSocket Gateway');
      set({ isConnected: false });
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
      set({ isConnected: false });
    });

    // Room created event
    newSocket.on('room_created', ({ roomId, roomCode, gameState, yourColor }) => {
      set({
        createdRoom: { roomId, roomCode },
        activeGame: gameState,
        myPlayerColor: yourColor || 'RED',
        forfeitReason: null,
        isLoading: false,
      });
      useNotificationStore.getState().addToast({
        type: 'success',
        message: `Room created! Code: ${roomCode}`,
      });
    });

    // Room joined event
    newSocket.on('room_joined', ({ roomId, roomCode, gameState, yourColor }) => {
      set({
        activeGame: gameState,
        myPlayerColor: yourColor || null,
        forfeitReason: null,
        isLoading: false,
      });
      useNotificationStore.getState().addToast({
        type: 'success',
        message: `Joined room ${roomCode}`,
      });
    });

    // Player joined broadcast
    newSocket.on('player_joined', ({ gameState }) => {
      set({ activeGame: gameState });
      useNotificationStore.getState().addToast({
        type: 'info',
        message: 'A new player has joined the room!',
      });
    });

    // Queue status
    newSocket.on('queue_joined', ({ position }) => {
      set({ isSearching: true, queuePosition: position });
    });

    // Match Found
    newSocket.on('match_found', ({ roomId, roomCode, gameState, yourColor }) => {
      console.log('🎯 Match found event received:', gameState, 'Your color:', yourColor);
      set({
        isSearching: false,
        activeGame: gameState,
        myPlayerColor: yourColor || get().myPlayerColor,
        forfeitReason: null,
      });
      useNotificationStore.getState().addToast({
        type: 'success',
        message: 'Match found! Starting battle...',
      });
    });

    // Game Started
    newSocket.on('game_started', ({ gameState, yourColor }) => {
      console.log('🚀 Game started event received:', gameState, 'Your color:', yourColor);
      set({
        isSearching: false,
        activeGame: gameState,
        myPlayerColor: yourColor || get().myPlayerColor,
        forfeitReason: null,
        logs: [{ type: 'info', text: 'Live battle started! Good luck.' }],
      });
    });

    // Dice Rolled
    newSocket.on('dice_rolled', ({ playerColor, value, penalty, possibleMoves, gameState }) => {
      audioManager.playDice();
      set({
        activeGame: gameState,
        logs: [
          ...get().logs,
          {
            type: penalty ? 'info' : value === 6 ? 'extra' : 'move',
            text: penalty
              ? `${playerColor} rolled 3 sixes! Turn forfeited.`
              : `${playerColor} rolled a ${value}`,
          },
        ],
      });
    });

    // Token Moved
    newSocket.on('token_moved', ({ tokenId, outcome, gameState }) => {
      if (outcome?.isCut) {
        audioManager.playCapture();
        set({
          logs: [
            ...get().logs,
            {
              type: 'capture',
              text: `🎯 Pawn captured!`,
            },
          ],
        });
      } else {
        audioManager.playMove();
      }

      set({ activeGame: gameState });
    });

    // Turn Changed (e.g. from timeout or 0 moves)
    newSocket.on('turn_changed', ({ gameState, currentTurn }) => {
      set({
        activeGame: gameState,
        logs: [
          ...get().logs,
          {
            type: 'info',
            text: `Turn passed to ${currentTurn}`,
          },
        ],
      });
    });

    // Player Left broadcast (3+ players match)
    newSocket.on('player_left', ({ leavingPlayer, gameState }) => {
      set({ activeGame: gameState });
      useNotificationStore.getState().addToast({
        type: 'warning',
        message: `${leavingPlayer?.name || 'A player'} left the game. Bot took over!`,
      });
      set((state) => ({
        logs: [
          ...state.logs,
          {
            type: 'info',
            text: `⚠️ ${leavingPlayer?.name || 'Player'} disconnected. Handed over to AI Bot.`,
          },
        ],
      }));
    });

    // Game Over (Normal victory OR Opponent forfeit victory)
    newSocket.on('game_over', ({ winner, gameState, reason }) => {
      audioManager.playWin();
      set({
        activeGame: gameState,
        forfeitReason: reason || null,
        logs: [
          ...get().logs,
          {
            type: 'win',
            text: reason
              ? `🏆 ${winner?.name} WON by default! (${reason})`
              : `🏆 ${winner?.name} has WON the game!`,
          },
        ],
      });

      useNotificationStore.getState().addToast({
        type: 'success',
        message: reason
          ? `Victory by Forfeit! ${reason}`
          : `Match completed! Winner: ${winner?.name}`,
      });
    });

    // In-game chat message received
    newSocket.on('chat_received', ({ sender, message, emoji }) => {
      if (emoji) {
        set((state) => ({
          reactions: [...state.reactions, { sender, emoji, timestamp: Date.now() }],
        }));
      }
      if (message) {
        set((state) => ({
          logs: [...state.logs, { type: 'info', text: `💬 ${sender}: ${message}` }],
        }));
      }
    });

    // Error event
    newSocket.on('error', ({ message }) => {
      set({ isLoading: false, error: message });
      useNotificationStore.getState().addToast({
        type: 'error',
        message: message || 'An error occurred',
      });
    });

    set({ socket: newSocket });
  },

  // Actions
  joinQueue: (mode = 'CLASSIC', players = 2) => {
    let socket = get().socket;
    if (!socket || !socket.connected) {
      get().initSocket();
      socket = get().socket;
    }
    set({ isSearching: true, searchTime: 0, error: null, forfeitReason: null });
    socket?.emit('join_queue', { mode, players: parseInt(players, 10) });
  },

  leaveQueue: () => {
    get().socket?.emit('leave_queue');
    set({ isSearching: false, searchTime: 0 });
  },

  createRoom: (options = {}) => {
    let socket = get().socket;
    if (!socket || !socket.connected) {
      get().initSocket();
      socket = get().socket;
    }
    set({ isLoading: true, error: null, forfeitReason: null });
    socket?.emit('create_room', options);
  },

  joinRoom: (roomCode) => {
    let socket = get().socket;
    if (!socket || !socket.connected) {
      get().initSocket();
      socket = get().socket;
    }
    set({ isLoading: true, error: null, forfeitReason: null });
    socket?.emit('join_room', { roomCode });
  },

  rollDice: (gameId) => {
    get().socket?.emit('roll_dice', { gameId });
  },

  moveToken: (gameId, tokenId) => {
    get().socket?.emit('move_token', { gameId, tokenId });
  },

  triggerTurnTimeout: (gameId) => {
    get().socket?.emit('turn_timeout', { gameId });
  },

  leaveGame: () => {
    get().socket?.emit('leave_room');
    get().clearActiveGame();
  },

  sendReaction: (gameId, emoji) => {
    get().socket?.emit('send_chat', { gameId, emoji });
  },

  sendMessage: (gameId, message) => {
    get().socket?.emit('send_chat', { gameId, message });
  },

  clearActiveGame: () => {
    set({ activeGame: null, createdRoom: null, myPlayerColor: null, forfeitReason: null, logs: [], reactions: [] });
  },
}));
