import { COLOR_CONFIG } from '../../lib/ludoEngine';
import { Bot, User, Trophy, ShieldCheck } from 'lucide-react';

export function PlayerCard({ player, isCurrentTurn = false, turnTimer = 30 }) {
  if (!player) return null;

  const colorConfig = COLOR_CONFIG[player.color] || COLOR_CONFIG.RED;
  const tokens = player.tokens || [];
  const wonCount = tokens.filter((t) => t.isWon).length;

  return (
    <div
      className={`relative p-3.5 rounded-2xl border transition-all duration-300 ${
        isCurrentTurn
          ? 'bg-bgAuxiliary border-white/30 shadow-xl shadow-black/40 ring-2'
          : 'bg-bgAuxiliary/60 border-white/5 opacity-85'
      }`}
      style={{
        boxShadow: isCurrentTurn ? `0 0 20px ${colorConfig.accent}33` : undefined,
      }}
    >
      {/* Active turn badge */}
      {isCurrentTurn && (
        <div
          className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md animate-pulse"
          style={{ backgroundColor: colorConfig.accent }}
        >
          Active Turn ({turnTimer}s)
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Avatar with dynamic border */}
        <div className="relative">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-md overflow-hidden ${
              isCurrentTurn ? 'ring-2 ring-offset-2 ring-offset-stone-900' : ''
            }`}
            style={{ backgroundColor: colorConfig.accent }}
          >
            {player.isBot ? (
              <Bot className="w-6 h-6 text-white" />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>
          {/* Pawns in Goal indicator badge */}
          <div
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-stone-900 border border-white/20 flex items-center justify-center text-[10px] font-bold text-yellow-400"
            title={`${wonCount}/4 tokens in goal`}
          >
            {wonCount}
          </div>
        </div>

        {/* Player details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-white truncate">{player.name}</h4>
            {player.isBot ? (
              <span className="text-[10px] bg-stone-800 text-cyan-400 font-semibold px-1.5 py-0.2 rounded border border-cyan-500/20">
                BOT
              </span>
            ) : (
              <span className="text-[10px] bg-green-500/20 text-green-400 font-semibold px-1.5 py-0.2 rounded">
                YOU
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: colorConfig.light }}
            >
              {colorConfig.name}
            </span>
            <span className="text-[11px] text-stone-400 font-medium">
              Rating: {player.rating || 1200}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Token Mini Progress Indicators */}
      <div className="grid grid-cols-4 gap-1.5 mt-3 pt-2.5 border-t border-white/5">
        {tokens.map((token, idx) => {
          let statusText = 'Base';
          let statusColor = 'bg-stone-800 text-stone-400 border-stone-700';

          if (token.isWon) {
            statusText = '★ Goal';
            statusColor = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 font-bold';
          } else if (token.step >= 0) {
            statusText = `S${token.step}`;
            statusColor = 'bg-white/10 text-white border-white/20 font-mono';
          }

          return (
            <div
              key={idx}
              className={`py-0.5 px-1 rounded-md text-[10px] text-center border truncate ${statusColor}`}
              title={`Pawn #${idx + 1}: ${token.isWon ? 'In Goal' : token.step === -1 ? 'In Base' : `Step ${token.step}`}`}
            >
              {statusText}
            </div>
          );
        })}
      </div>
    </div>
  );
}
