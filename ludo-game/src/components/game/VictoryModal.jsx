import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, RefreshCw, Home, Sparkles, UserX } from 'lucide-react';
import { COLOR_CONFIG } from '../../lib/ludoEngine';
import { audioManager } from '../../lib/audioManager';

export function VictoryModal({
  winner,
  players = [],
  forfeitReason = null,
  onPlayAgain,
  onBackToHome,
}) {
  if (!winner) return null;

  const winnerColorConfig = COLOR_CONFIG[winner.color] || COLOR_CONFIG.RED;

  useEffect(() => {
    // Play celebratory audio
    audioManager.playWin();

    // Trigger colorful confetti explosion
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ef4444', '#22c55e', '#eab308', '#3b82f6', '#ec4899'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ef4444', '#22c55e', '#eab308', '#3b82f6', '#ec4899'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [winner]);

  // Sort players by won tokens descending
  const sortedPlayers = [...players].sort((a, b) => {
    const aWon = a.tokens?.filter((t) => t.isWon).length || 0;
    const bWon = b.tokens?.filter((t) => t.isWon).length || 0;
    return bWon - aWon;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-bgAuxiliary border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden text-center">
        {/* Glow halo */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: winnerColorConfig.accent }}
        />

        {/* Trophy Animation Header */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-300 flex items-center justify-center shadow-lg shadow-yellow-500/20 mb-4 animate-bounce">
            <Trophy className="w-11 h-11 text-stone-950" />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-400 uppercase tracking-widest bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20 mb-2">
            <Sparkles size={13} /> {forfeitReason ? 'Victory by Forfeit!' : 'Victory Champion!'}
          </div>

          <h2 className="text-3xl font-extrabold text-white">
            {winner.name} Wins!
          </h2>

          {forfeitReason ? (
            <div className="mt-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center gap-2 text-xs font-semibold text-amber-300">
              <UserX size={16} className="text-amber-400" />
              <span>{forfeitReason} — You are declared the winner!</span>
            </div>
          ) : (
            <p className="text-sm text-textSecondary mt-1">
              Player with {winnerColorConfig.name} tokens conquered the board!
            </p>
          )}
        </div>

        {/* Podium Leaderboard */}
        <div className="relative z-10 my-6 space-y-2 bg-bgDark/60 border border-white/5 rounded-2xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-textSecondary mb-3">
            Match Final Status
          </h3>

          {sortedPlayers.map((player, index) => {
            const config = COLOR_CONFIG[player.color] || COLOR_CONFIG.RED;
            const wonTokens = player.tokens?.filter((t) => t.isWon).length || 0;
            const isWinnerPlayer = player.color === winner.color;

            return (
              <div
                key={player.color}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  isWinnerPlayer
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-bgAuxiliary/40 border-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                      index === 0
                        ? 'bg-yellow-400 text-stone-950 shadow'
                        : index === 1
                        ? 'bg-stone-300 text-stone-950'
                        : index === 2
                        ? 'bg-amber-600 text-white'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    #{index + 1}
                  </span>

                  <div className="text-left">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      {player.name}
                      {player.isBot && (
                        <span className="text-[10px] bg-stone-700 px-1.5 py-0.2 rounded text-stone-300 font-mono">
                          BOT
                        </span>
                      )}
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: config.accent }}
                      />
                    </span>
                    <span className="text-[11px] text-textSecondary">
                      {config.name} Team
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-white">
                    {wonTokens} / 4 Goals
                  </span>
                  <p className="text-[11px] text-green-400">
                    {isWinnerPlayer ? '+25 Rating' : '-10 Rating'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-3 mt-4">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <RefreshCw size={16} /> Play Again
          </button>
          <button
            onClick={onBackToHome}
            className="flex-1 py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-sm border border-white/10 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Home size={16} /> Return to Lobby
          </button>
        </div>
      </div>
    </div>
  );
}
