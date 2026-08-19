import { useState, useEffect } from 'react';
import { COLOR_CONFIG } from '../../lib/ludoEngine';
import { audioManager } from '../../lib/audioManager';
import { Sparkles, AlertCircle } from 'lucide-react';

export function DiceController({
  currentTurn = 'RED',
  diceValue = null,
  isRolling = false,
  hasRolled = false,
  canRoll = false,
  consecutiveSix = 0,
  turnTimer = 30,
  onRoll,
  isBot = false,
  isMyTurn = false,
  isOnline = false,
  validMovesCount = 0,
}) {
  const [animFrame, setAnimFrame] = useState(1);
  const colorConfig = COLOR_CONFIG[currentTurn] || COLOR_CONFIG.RED;

  // Dice rolling animation frames
  useEffect(() => {
    let interval;
    if (isRolling) {
      interval = setInterval(() => {
        setAnimFrame((prev) => (prev % 4) + 1);
      }, 80);
    }
    return () => clearInterval(interval);
  }, [isRolling]);

  const handleDiceClick = () => {
    if (canRoll && !isRolling && !hasRolled) {
      audioManager.playDice();
      onRoll?.();
    }
  };

  // Determine which dice image to display
  const diceImageSrc = isRolling
    ? `/ludo-images/dice_0_${animFrame}.png`
    : diceValue
    ? `/ludo-images/dice_${diceValue}.png`
    : '/ludo-images/dice_6.png';

  // Timer circle radius & circumference
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const timerPercentage = Math.max(0, Math.min(100, (turnTimer / 30) * 100));
  const strokeDashoffset = circumference - (timerPercentage / 100) * circumference;

  const isTimerLow = turnTimer <= 5;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-bgAuxiliary/90 backdrop-blur border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute inset-0 opacity-15 blur-2xl pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: colorConfig.accent }}
      />

      {/* Header status */}
      <div className="flex items-center gap-2 mb-3 z-10">
        <span
          className="w-3.5 h-3.5 rounded-full animate-pulse shadow-md"
          style={{ backgroundColor: colorConfig.accent }}
        />
        <span className="text-sm font-bold text-white tracking-wide uppercase">
          {colorConfig.name}'s Turn{' '}
          {isOnline
            ? isMyTurn
              ? '(Your Turn)'
              : "(Opponent's Turn)"
            : isBot
            ? '(Bot Thinking...)'
            : '(Your Turn)'}
        </span>
      </div>

      {/* Center Dice with Circular Timer */}
      <div className="relative flex items-center justify-center w-28 h-28 my-1 z-10">
        {/* SVG Timer Ring */}
        <svg className="absolute w-28 h-28 transform -rotate-90 pointer-events-none">
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke="#3a3835"
            strokeWidth="5"
            fill="transparent"
          />
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke={isTimerLow ? '#ef4444' : colorConfig.accent}
            strokeWidth="5"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Interactive Dice Button */}
        <button
          onClick={handleDiceClick}
          disabled={!canRoll || isRolling || hasRolled}
          className={`relative w-20 h-20 rounded-2xl flex items-center justify-center p-2 transition-all duration-300 transform ${
            canRoll && !isRolling && !hasRolled
              ? 'cursor-pointer hover:scale-110 active:scale-95 shadow-lg shadow-black/50 ring-4 ring-white/20 animate-bounce'
              : 'opacity-90 cursor-default'
          }`}
          style={{
            backgroundColor: '#1f1e1b',
          }}
        >
          <img
            src={diceImageSrc}
            alt={`Dice ${diceValue || 6}`}
            className={`w-16 h-16 object-contain drop-shadow-md transition-transform ${
              isRolling ? 'rotate-12 scale-105' : ''
            }`}
          />
        </button>

        {/* Turn Timer Seconds Label */}
        <span
          className={`absolute -bottom-2 px-2 py-0.5 rounded-full text-[11px] font-bold font-mono shadow-md border ${
            isTimerLow
              ? 'bg-red-500/90 text-white border-red-400 animate-ping'
              : 'bg-stone-900/90 text-stone-300 border-white/10'
          }`}
        >
          {turnTimer}s
        </span>
      </div>

      {/* Action / State Prompts */}
      <div className="mt-4 text-center z-10 min-h-[44px] flex flex-col items-center justify-center">
        {isRolling && (
          <p className="text-xs font-semibold text-textSecondary animate-pulse">
            Rolling the dice...
          </p>
        )}

        {!isRolling && !hasRolled && canRoll && (
          <button
            onClick={handleDiceClick}
            className="px-5 py-1.5 rounded-xl font-extrabold text-xs text-white uppercase tracking-wider shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-1.5"
            style={{ backgroundColor: colorConfig.accent }}
          >
            <Sparkles size={14} /> Click to Roll
          </button>
        )}

        {!isRolling && !hasRolled && !canRoll && (
          <p className="text-xs text-textSecondary font-medium">
            {isOnline
              ? isMyTurn
                ? 'Your turn to roll the dice'
                : `Waiting for ${colorConfig.name} to roll...`
              : isBot
              ? 'Bot is preparing to roll...'
              : 'Your turn to roll the dice'}
          </p>
        )}

        {!isRolling && hasRolled && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-white">
              Rolled <span className="text-base text-yellow-400 font-extrabold">{diceValue}</span>
            </span>
            {validMovesCount > 0 ? (
              <span className="text-[11px] text-green-400 font-semibold animate-pulse">
                Select a glowing pawn to move
              </span>
            ) : (
              <span className="text-[11px] text-amber-400 font-semibold">
                No valid moves (need a 6 to enter track)
              </span>
            )}
          </div>
        )}

        {/* Consecutive Six Indicator */}
        {consecutiveSix > 0 && (
          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
            🔥 {consecutiveSix}x Six in a row!
          </div>
        )}
      </div>
    </div>
  );
}
