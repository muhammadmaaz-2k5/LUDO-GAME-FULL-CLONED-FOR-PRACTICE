import { useState, useEffect, useRef, useCallback } from 'react';
import {
  createInitialGameState,
  executeMove,
  getValidTokenMoves,
  selectBotMove,
  COLOR_CONFIG,
  PLAYER_COLORS,
} from '../lib/ludoEngine';
import { audioManager } from '../lib/audioManager';
import { LudoBoard } from '../components/game/LudoBoard';
import { DiceController } from '../components/game/DiceController';
import { PlayerCard } from '../components/game/PlayerCard';
import { VictoryModal } from '../components/game/VictoryModal';
import { GameChat } from '../components/game/GameChat';
import { SoundToggle } from '../components/common/SoundToggle';
import { RotateCcw, Settings2, Play, Bot, Zap, Globe, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLudoGameStore } from '../store/useLudoGameStore';
import { useAuthStore } from '../store/useAuthStore';

export default function Computer() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    socket,
    activeGame,
    myPlayerColor,
    forfeitReason,
    rollDice: socketRollDice,
    moveToken: socketMoveToken,
    triggerTurnTimeout: socketTriggerTurnTimeout,
    leaveGame: socketLeaveGame,
    sendReaction: socketSendReaction,
    sendMessage: socketSendMessage,
    clearActiveGame,
    logs: socketLogs,
    reactions: socketReactions,
  } = useLudoGameStore();

  const isOnlineMatch = Boolean(activeGame && (activeGame.status === 'IN_PROGRESS' || activeGame.status === 'COMPLETED'));

  // Match configuration state (for local/bot mode)
  const [playerCount, setPlayerCount] = useState(4);
  const [playerColor, setPlayerColor] = useState('RED');
  const [botDifficulty, setBotDifficulty] = useState('MEDIUM');
  const [gameSpeed, setGameSpeed] = useState(1); // 1x, 1.5x, 2x
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Local game state
  const [localGameState, setLocalGameState] = useState(() =>
    createInitialGameState({
      playerCount: 4,
      playerColor: 'RED',
      botDifficulty: 'MEDIUM',
    })
  );

  const [localReactions, setLocalReactions] = useState([]);
  const [localLogs, setLocalLogs] = useState([]);
  const [localWinner, setLocalWinner] = useState(null);

  // Live countdown timer state (30s)
  const [turnSeconds, setTurnSeconds] = useState(30);

  const botTimeoutRef = useRef(null);
  const turnIntervalRef = useRef(null);

  // Active game reference
  const currentGameState = isOnlineMatch ? activeGame : localGameState;
  const currentLogs = isOnlineMatch ? socketLogs : localLogs;
  const currentReactions = isOnlineMatch ? socketReactions : localReactions;
  const currentWinner = isOnlineMatch ? activeGame?.winner : localWinner;

  // Determine user's player color in online match
  const resolvedMyColor = (() => {
    if (!isOnlineMatch) return playerColor;
    if (myPlayerColor) return myPlayerColor;
    const found = activeGame?.players?.find(
      (p) => p.socketId === socket?.id || (user?.id && p.id === user.id)
    );
    if (found) return found.color;
    return activeGame?.players?.[0]?.socketId === socket?.id ? 'RED' : 'GREEN';
  })();

  const currentPlayer = currentGameState.players?.[currentGameState.currentTurnIndex];
  const isMyTurn = isOnlineMatch
    ? currentGameState.currentTurn === resolvedMyColor
    : currentPlayer && !currentPlayer.isBot;

  // Reset turn countdown whenever currentTurn changes or dice is rolled
  useEffect(() => {
    setTurnSeconds(30);
  }, [currentGameState?.currentTurn, currentGameState?.diceValue]);

  // Live 30s Countdown Timer Effect
  useEffect(() => {
    if (currentGameState?.status !== 'IN_PROGRESS' || currentWinner) return;

    turnIntervalRef.current = setInterval(() => {
      setTurnSeconds((prev) => {
        if (prev <= 1) {
          if (isOnlineMatch) {
            if (isMyTurn && activeGame) {
              socketTriggerTurnTimeout(activeGame.id);
            }
          } else {
            handleLocalTurnTimeout();
          }
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(turnIntervalRef.current);
  }, [currentGameState?.currentTurn, currentGameState?.status, currentWinner, isOnlineMatch, isMyTurn, activeGame, socketTriggerTurnTimeout]);

  const handleLocalTurnTimeout = () => {
    setLocalGameState((prev) => {
      const currentIndex = prev.currentTurnIndex;
      const nextIndex = (currentIndex + 1) % prev.players.length;
      const nextPlayer = prev.players[nextIndex];

      setLocalLogs((l) => [
        ...l,
        {
          type: 'info',
          text: `${COLOR_CONFIG[prev.currentTurn].name}'s turn timed out!`,
        },
      ]);

      return {
        ...prev,
        currentTurn: nextPlayer.color,
        currentTurnIndex: nextIndex,
        diceValue: null,
        hasRolled: false,
        isRolling: false,
        consecutiveSix: 0,
        validMoves: [],
        turnTimer: 30,
      };
    });
  };

  const advanceLocalTurn = useCallback((currState) => {
    const nextIndex = (currState.currentTurnIndex + 1) % currState.players.length;
    const nextPlayer = currState.players[nextIndex];

    setLocalGameState((prev) => ({
      ...prev,
      currentTurn: nextPlayer.color,
      currentTurnIndex: nextIndex,
      diceValue: null,
      hasRolled: false,
      isRolling: false,
      consecutiveSix: 0,
      validMoves: [],
      turnTimer: 30,
    }));
  }, []);

  const handleRestart = useCallback(() => {
    if (isOnlineMatch) {
      socketLeaveGame();
      navigate('/play-online');
      return;
    }

    if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
    if (turnIntervalRef.current) clearInterval(turnIntervalRef.current);

    const newState = createInitialGameState({
      playerCount,
      playerColor,
      botDifficulty,
    });
    setLocalGameState(newState);
    setLocalWinner(null);
    setLocalReactions([]);
    setLocalLogs([{ type: 'info', text: 'Match started! Good luck.' }]);
    setTurnSeconds(30);
  }, [isOnlineMatch, playerCount, playerColor, botDifficulty, socketLeaveGame, navigate]);

  // Dice Roll Handler
  const handleRollDice = useCallback(() => {
    if (isOnlineMatch) {
      if (activeGame && isMyTurn && !activeGame.hasRolled && !activeGame.isRolling) {
        socketRollDice(activeGame.id);
      }
      return;
    }

    if (localGameState.isRolling || localGameState.hasRolled || localWinner) return;

    audioManager.playDice();

    setLocalGameState((prev) => ({
      ...prev,
      isRolling: true,
    }));

    const rollDuration = 600 / gameSpeed;

    setTimeout(() => {
      const rolledValue = Math.floor(Math.random() * 6) + 1;
      const curr = localGameState.players[localGameState.currentTurnIndex];

      const consecutive =
        rolledValue === 6 ? localGameState.consecutiveSix + 1 : 0;

      if (consecutive === 3) {
        setLocalLogs((prev) => [
          ...prev,
          {
            type: 'info',
            text: `${curr.name} rolled three 6s in a row! Turn forfeited.`,
          },
        ]);

        setLocalGameState((prev) => ({
          ...prev,
          isRolling: false,
          hasRolled: true,
          diceValue: rolledValue,
          consecutiveSix: 0,
        }));

        setTimeout(() => advanceLocalTurn(localGameState), 800 / gameSpeed);
        return;
      }

      const validMoves = getValidTokenMoves(curr.tokens, rolledValue, {
        isMasterMode: localGameState.mode === 'MASTER',
        hasCutOpponent: curr.hasCutOpponent,
      });

      setLocalLogs((prev) => [
        ...prev,
        {
          type: rolledValue === 6 ? 'extra' : 'move',
          text: `${curr.name} rolled a ${rolledValue}`,
        },
      ]);

      setLocalGameState((prev) => ({
        ...prev,
        isRolling: false,
        hasRolled: true,
        diceValue: rolledValue,
        consecutiveSix: consecutive,
        validMoves,
      }));

      if (validMoves.length === 0) {
        setTimeout(() => {
          advanceLocalTurn(localGameState);
        }, 1200 / gameSpeed);
      }
    }, rollDuration);
  }, [isOnlineMatch, activeGame, isMyTurn, socketRollDice, localGameState, gameSpeed, localWinner, advanceLocalTurn]);

  // Token Movement Handler
  const handleTokenMove = useCallback(
    (color, tokenId) => {
      if (isOnlineMatch) {
        if (activeGame && isMyTurn && activeGame.hasRolled && !activeGame.isRolling) {
          socketMoveToken(activeGame.id, tokenId);
        }
        return;
      }

      if (
        localGameState.currentTurn !== color ||
        !localGameState.hasRolled ||
        localGameState.isRolling ||
        localWinner
      ) {
        return;
      }

      const moveOutcome = executeMove(
        localGameState,
        color,
        tokenId,
        localGameState.diceValue
      );
      if (!moveOutcome) return;

      const {
        updatedPlayers,
        isCut,
        capturedColor,
        isWon,
        awardsExtraTurn,
      } = moveOutcome;

      if (isCut) {
        audioManager.playCapture();
        setLocalLogs((prev) => [
          ...prev,
          {
            type: 'capture',
            text: `🎯 ${COLOR_CONFIG[color].name} captured ${COLOR_CONFIG[capturedColor]?.name}'s pawn!`,
          },
        ]);
      } else {
        audioManager.playMove();
      }

      if (isWon) {
        setLocalLogs((prev) => [
          ...prev,
          {
            type: 'win',
            text: `⭐ ${COLOR_CONFIG[color].name} reached the GOAL!`,
          },
        ]);
      }

      const movingPlayer = updatedPlayers.find((p) => p.color === color);
      const targetTokens = localGameState.mode === 'QUICK' ? 2 : 4;

      if (movingPlayer && movingPlayer.tokensWon >= targetTokens) {
        setLocalWinner(movingPlayer);
        setLocalGameState((prev) => ({
          ...prev,
          players: updatedPlayers,
          status: 'COMPLETED',
        }));
        return;
      }

      if (awardsExtraTurn) {
        setLocalLogs((prev) => [
          ...prev,
          {
            type: 'extra',
            text: `🎲 ${COLOR_CONFIG[color].name} earns an extra turn!`,
          },
        ]);

        setLocalGameState((prev) => ({
          ...prev,
          players: updatedPlayers,
          diceValue: null,
          hasRolled: false,
          isRolling: false,
          validMoves: [],
          turnTimer: 30,
        }));
        setTurnSeconds(30);
      } else {
        const nextState = {
          ...localGameState,
          players: updatedPlayers,
        };
        advanceLocalTurn(nextState);
      }
    },
    [isOnlineMatch, activeGame, socketMoveToken, localGameState, localWinner, advanceLocalTurn]
  );

  // Auto-move single valid pawn helper for seamless responsiveness
  useEffect(() => {
    if (currentGameState?.status !== 'IN_PROGRESS' || currentWinner) return;
    if (!currentGameState?.hasRolled || currentGameState?.isRolling) return;

    if (currentGameState?.validMoves?.length === 1) {
      const singleTokenId = currentGameState.validMoves[0];
      const moveTimer = setTimeout(() => {
        if (isOnlineMatch) {
          if (activeGame && isMyTurn) {
            socketMoveToken(activeGame.id, singleTokenId);
          }
        } else {
          const curr = localGameState.players[localGameState.currentTurnIndex];
          if (curr && !curr.isBot) {
            handleTokenMove(curr.color, singleTokenId);
          }
        }
      }, 450);

      return () => clearTimeout(moveTimer);
    }
  }, [
    currentGameState?.hasRolled,
    currentGameState?.isRolling,
    currentGameState?.validMoves,
    currentGameState?.currentTurn,
    currentGameState?.status,
    isOnlineMatch,
    isMyTurn,
    activeGame,
    socketMoveToken,
    handleTokenMove,
    localGameState,
    currentWinner,
  ]);

  // Auto Bot Turn Execution for Local mode
  useEffect(() => {
    if (isOnlineMatch || localGameState.status !== 'IN_PROGRESS' || localWinner) return;

    const curr = localGameState.players[localGameState.currentTurnIndex];
    if (!curr || !curr.isBot) return;

    if (!localGameState.hasRolled && !localGameState.isRolling) {
      botTimeoutRef.current = setTimeout(() => {
        handleRollDice();
      }, 700 / gameSpeed);
      return;
    }

    if (localGameState.hasRolled && !localGameState.isRolling && localGameState.validMoves.length > 0) {
      botTimeoutRef.current = setTimeout(() => {
        const chosenTokenId = selectBotMove(
          localGameState,
          curr.color,
          localGameState.diceValue,
          botDifficulty
        );
        if (chosenTokenId !== null) {
          handleTokenMove(curr.color, chosenTokenId);
        }
      }, 900 / gameSpeed);
    }
  }, [
    isOnlineMatch,
    localGameState.currentTurnIndex,
    localGameState.hasRolled,
    localGameState.isRolling,
    localGameState.validMoves,
    localGameState.status,
    localWinner,
    botDifficulty,
    gameSpeed,
    handleRollDice,
    handleTokenMove,
  ]);

  const handleSendReaction = (emoji) => {
    if (isOnlineMatch && activeGame) {
      socketSendReaction(activeGame.id, emoji);
    } else {
      setLocalReactions((prev) => [
        ...prev,
        { sender: 'You', emoji, timestamp: Date.now() },
      ]);
    }
  };

  const handleSendMessage = (text) => {
    if (isOnlineMatch && activeGame) {
      socketSendMessage(activeGame.id, text);
    } else {
      setLocalLogs((prev) => [...prev, { type: 'info', text: `💬 You: ${text}` }]);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-4 px-2 sm:px-4 md:px-6">
      {/* Top Game Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-bgAuxiliary/80 backdrop-blur p-3.5 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow ${
              isOnlineMatch
                ? 'bg-gradient-to-tr from-green-500 to-emerald-700'
                : 'bg-gradient-to-tr from-cyan-500 to-blue-600'
            }`}
          >
            {isOnlineMatch ? <Globe size={22} /> : <Bot size={22} />}
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight flex items-center gap-2">
              {isOnlineMatch ? 'Live Multiplayer Battle' : 'Single Player / Computer Arena'}
              {isOnlineMatch && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-500/20 text-green-400 font-bold border border-green-500/30">
                  Online ({resolvedMyColor})
                </span>
              )}
            </h1>
            <p className="text-xs text-textSecondary">
              Mode: {currentGameState.mode} • {currentGameState.players?.length || 4} Players Battle
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {!isOnlineMatch && (
            <button
              onClick={() => setGameSpeed((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1))}
              className="px-3 py-2 rounded-xl bg-bgDark border border-white/10 text-xs font-bold text-cyan-400 hover:text-white flex items-center gap-1.5 transition-all shadow"
              title="Adjust Animation & Bot Speed"
            >
              <Zap size={14} /> {gameSpeed}x Speed
            </button>
          )}

          <SoundToggle />

          {!isOnlineMatch && (
            <button
              onClick={() => setIsConfigOpen((prev) => !prev)}
              className="p-2.5 rounded-xl bg-bgDark border border-white/10 hover:bg-stone-800 text-stone-300 hover:text-white transition-all shadow"
              title="Configure Match"
            >
              <Settings2 size={18} />
            </button>
          )}

          <button
            onClick={handleRestart}
            className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 transition-all shadow flex items-center gap-1.5 text-xs font-bold"
            title={isOnlineMatch ? 'Leave Match' : 'Restart Match'}
          >
            {isOnlineMatch ? <LogOut size={16} /> : <RotateCcw size={16} />}
            {isOnlineMatch && <span>Leave</span>}
          </button>
        </div>
      </div>

      {/* Match Config Drawer / Modal for Local Mode */}
      {isConfigOpen && !isOnlineMatch && (
        <div className="mb-6 p-5 bg-bgAuxiliary border border-white/15 rounded-2xl shadow-xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
              <Settings2 size={16} /> Game Setup Options
            </h3>
            <button
              onClick={() => setIsConfigOpen(false)}
              className="text-xs text-textSecondary hover:text-white"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-textSecondary block mb-1.5">
                Player Count
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setPlayerCount(num)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      playerCount === num
                        ? 'bg-green-600 text-white border-green-500 shadow'
                        : 'bg-bgDark text-textSecondary border-white/10 hover:text-white'
                    }`}
                  >
                    {num} Players
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-textSecondary block mb-1.5">
                Your Pawn Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PLAYER_COLORS.slice(0, playerCount).map((color) => {
                  const cfg = COLOR_CONFIG[color];
                  return (
                    <button
                      key={color}
                      onClick={() => setPlayerColor(color)}
                      className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all ${
                        playerColor === color
                          ? 'ring-2 ring-white border-transparent text-white shadow'
                          : 'bg-bgDark text-textSecondary border-white/10 hover:text-white'
                      }`}
                      style={{
                        backgroundColor:
                          playerColor === color ? cfg.accent : undefined,
                      }}
                    >
                      {cfg.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-textSecondary block mb-1.5">
                AI Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['EASY', 'MEDIUM', 'MASTER'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setBotDifficulty(diff)}
                    className={`py-2 rounded-xl text-[11px] font-bold border transition-all ${
                      botDifficulty === diff
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow'
                        : 'bg-bgDark text-textSecondary border-white/10 hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
            <button
              onClick={() => {
                handleRestart();
                setIsConfigOpen(false);
              }}
              className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2"
            >
              <Play size={14} /> Apply & Start New Game
            </button>
          </div>
        </div>
      )}

      {/* Main Arena Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Player Cards */}
        <div className="lg:col-span-3 space-y-3 order-2 lg:order-1">
          {currentGameState.players?.map((player) => (
            <PlayerCard
              key={player.color}
              player={player}
              isCurrentTurn={currentGameState.currentTurn === player.color}
              turnTimer={turnSeconds}
            />
          ))}
        </div>

        {/* Center Column: Interactive Ludo Board */}
        <div className="lg:col-span-6 flex flex-col items-center order-1 lg:order-2">
          <LudoBoard
            players={currentGameState.players || []}
            currentTurn={currentGameState.currentTurn}
            validMoves={currentGameState.validMoves || []}
            hasRolled={currentGameState.hasRolled}
            isRolling={currentGameState.isRolling}
            onTokenClick={handleTokenMove}
            disabled={!isMyTurn}
          />
        </div>

        {/* Right Column: Dice Controller & Live Chat/Logs */}
        <div className="lg:col-span-3 space-y-4 order-3">
          <DiceController
            currentTurn={currentGameState.currentTurn}
            diceValue={currentGameState.diceValue}
            isRolling={currentGameState.isRolling}
            hasRolled={currentGameState.hasRolled}
            canRoll={isMyTurn && !currentGameState.hasRolled && !currentGameState.isRolling}
            consecutiveSix={currentGameState.consecutiveSix || 0}
            turnTimer={turnSeconds}
            onRoll={handleRollDice}
            isBot={!isMyTurn && !isOnlineMatch}
            isMyTurn={isMyTurn}
            isOnline={isOnlineMatch}
            validMovesCount={currentGameState.validMoves?.length || 0}
          />

          <GameChat
            logs={currentLogs}
            reactions={currentReactions}
            onSendReaction={handleSendReaction}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>

      {/* Victory Celebration Modal (Normal victory or Forfeit default) */}
      {currentWinner && (
        <VictoryModal
          winner={currentWinner}
          players={currentGameState.players || []}
          forfeitReason={isOnlineMatch ? forfeitReason : null}
          onPlayAgain={handleRestart}
          onBackToHome={() => {
            clearActiveGame();
            navigate('/');
          }}
        />
      )}
    </div>
  );
}
