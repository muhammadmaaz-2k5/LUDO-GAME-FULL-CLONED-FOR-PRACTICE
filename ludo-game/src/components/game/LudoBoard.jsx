import { useState } from 'react';
import {
  COLOR_CONFIG,
  TRACK_COORDINATES,
  SAFE_ZONES,
  STAR_COORDINATES,
  HOME_STRETCH_COORDINATES,
  BASE_COORDINATES,
  getGlobalTrackIndex,
} from '../../lib/ludoEngine';
import { useThemeContext } from '../../context/themeContext';
import { Star, Crown } from 'lucide-react';

export function LudoBoard({
  players = [],
  currentTurn = 'RED',
  validMoves = [],
  hasRolled = false,
  isRolling = false,
  onTokenClick,
  disabled = false,
}) {
  const { theme } = useThemeContext();
  const activeBg = theme?.boardBg || '/ludo-images/bg_game.jpg';

  // Build a lookup map of all tokens on the board
  // key: "row,col" -> array of { playerColor, tokenId, token }
  const cellTokensMap = {};

  players.forEach((player) => {
    player.tokens?.forEach((token, tokenId) => {
      if (token.isWon) return; // Won tokens are in the goal

      let coord = null;
      if (token.step === -1) {
        // In base
        coord = BASE_COORDINATES[player.color]?.[tokenId];
      } else if (token.step >= 0 && token.step <= 51) {
        const globalTrack = getGlobalTrackIndex(player.color, token.step);
        coord = TRACK_COORDINATES[globalTrack];
      } else if (token.step >= 52 && token.step <= 56) {
        coord = HOME_STRETCH_COORDINATES[player.color]?.[token.step - 52];
      }

      if (coord) {
        const key = `${coord[0]},${coord[1]}`;
        if (!cellTokensMap[key]) cellTokensMap[key] = [];
        cellTokensMap[key].push({
          playerColor: player.color,
          tokenId,
          token,
          isCurrentPlayer: player.color === currentTurn,
          isValidMove:
            player.color === currentTurn &&
            hasRolled &&
            !isRolling &&
            validMoves.includes(tokenId),
        });
      }
    });
  });

  // Helper to test if (r, c) is a star safe cell
  const isStarCell = (r, c) => {
    return STAR_COORDINATES.some(([sr, sc]) => sr === r && sc === c);
  };

  // Helper to test home stretch cell
  const getHomeStretchColor = (r, c) => {
    if (r === 7 && c >= 1 && c <= 5) return 'RED';
    if (c === 7 && r >= 1 && r <= 5) return 'GREEN';
    if (r === 7 && c >= 9 && c <= 13) return 'YELLOW';
    if (c === 7 && r >= 9 && r <= 13) return 'BLUE';
    return null;
  };

  // Helper to test start cell
  const getStartTileColor = (r, c) => {
    if (r === 6 && c === 1) return 'RED';
    if (r === 1 && c === 8) return 'GREEN';
    if (r === 8 && c === 13) return 'YELLOW';
    if (r === 13 && c === 6) return 'BLUE';
    return null;
  };

  return (
    <div
      className="w-full max-w-[500px] sm:max-w-[540px] md:max-w-[580px] aspect-square mx-auto p-2.5 sm:p-3.5 rounded-3xl border-4 border-stone-800 shadow-2xl relative select-none overflow-hidden transition-all duration-500"
      style={{
        backgroundImage: `url(${activeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Subtle overlay to enhance cell contrast */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-none" />

      {/* 15x15 CSS Grid Board */}
      <div className="relative w-full h-full grid grid-cols-15 grid-rows-15 gap-[1px] bg-stone-900/90 border border-stone-700/60 rounded-2xl overflow-hidden shadow-inner">
        {/* Render 225 Cells (15 x 15) */}
        {Array.from({ length: 15 }).map((_, r) =>
          Array.from({ length: 15 }).map((_, c) => {
            const cellKey = `${r},${c}`;
            const tokensHere = cellTokensMap[cellKey] || [];

            // 1. Check Quadrants (Bases)
            const isRedBase = r >= 0 && r <= 5 && c >= 0 && c <= 5;
            const isGreenBase = r >= 0 && r <= 5 && c >= 9 && c <= 14;
            const isYellowBase = r >= 9 && r <= 14 && c >= 9 && c <= 14;
            const isBlueBase = r >= 9 && r <= 14 && c >= 0 && c <= 5;

            // 2. Check Center Goal (6..8, 6..8)
            const isCenterGoal = r >= 6 && r <= 8 && c >= 6 && c <= 8;

            // Inside Base Large Area Handler
            if (isRedBase || isGreenBase || isYellowBase || isBlueBase) {
              const baseColor = isRedBase
                ? 'RED'
                : isGreenBase
                ? 'GREEN'
                : isYellowBase
                ? 'YELLOW'
                : 'BLUE';

              const config = COLOR_CONFIG[baseColor];

              // Check if this cell is one of the 4 token spawn circles inside the base
              const isBasePawnSpot = BASE_COORDINATES[baseColor].some(
                ([br, bc]) => br === r && bc === c
              );

              return (
                <div
                  key={cellKey}
                  className="relative flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: isBasePawnSpot
                      ? '#22211e'
                      : config.accent + '22',
                  }}
                >
                  {/* Decorative Base Circle */}
                  {isBasePawnSpot && (
                    <div
                      className="w-[82%] h-[82%] rounded-full flex items-center justify-center border-2 border-dashed shadow-inner"
                      style={{
                        borderColor: config.accent + '88',
                        backgroundColor: config.accent + '15',
                      }}
                    />
                  )}

                  {/* Render Token if in Base */}
                  {tokensHere.map((item) => (
                    <PawnToken
                      key={item.tokenId}
                      item={item}
                      onTokenClick={onTokenClick}
                      disabled={disabled}
                    />
                  ))}
                </div>
              );
            }

            // Center Goal Area (Triangles & Crown)
            if (isCenterGoal) {
              // Exact center cell (7,7)
              if (r === 7 && c === 7) {
                return (
                  <div
                    key={cellKey}
                    className="relative flex items-center justify-center bg-stone-950/90 shadow-2xl z-10"
                  >
                    <Crown size={16} className="text-yellow-400 animate-pulse" />
                  </div>
                );
              }

              // Color Goal Quadrant Slices
              let goalColor = null;
              if (r === 6 && c === 7) goalColor = 'GREEN';
              else if (r === 7 && c === 6) goalColor = 'RED';
              else if (r === 7 && c === 8) goalColor = 'YELLOW';
              else if (r === 8 && c === 7) goalColor = 'BLUE';

              const goalConfig = goalColor ? COLOR_CONFIG[goalColor] : null;

              return (
                <div
                  key={cellKey}
                  className="relative flex items-center justify-center"
                  style={{
                    backgroundColor: goalConfig ? goalConfig.accent : '#1b1a18',
                  }}
                >
                  {goalColor && (
                    <span className="text-[9px] font-black text-black/60">
                      GOAL
                    </span>
                  )}
                </div>
              );
            }

            // Track Cells & Home Stretch
            const isStar = isStarCell(r, c);
            const homeStretchColor = getHomeStretchColor(r, c);
            const startColor = getStartTileColor(r, c);

            let cellBg = '#272522'; // Default white track tile dark mode
            let tileBorder = 'border-stone-700/30';

            if (homeStretchColor) {
              cellBg = COLOR_CONFIG[homeStretchColor].accent + 'cc';
            } else if (startColor) {
              cellBg = COLOR_CONFIG[startColor].accent + 'bb';
            } else if (isStar) {
              cellBg = '#33312c';
            }

            return (
              <div
                key={cellKey}
                className={`relative flex items-center justify-center border ${tileBorder} transition-all duration-200 overflow-visible`}
                style={{ backgroundColor: cellBg }}
              >
                {/* Star Icon for Safe Star Cells */}
                {isStar && (
                  <Star
                    size={14}
                    className="text-amber-400 fill-amber-400/80 drop-shadow opacity-90"
                  />
                )}

                {/* Render Stacked or Single Tokens */}
                {tokensHere.length > 0 && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {tokensHere.map((item, idx) => (
                      <PawnToken
                        key={item.tokenId}
                        item={item}
                        stackIndex={idx}
                        totalStacked={tokensHere.length}
                        onTokenClick={onTokenClick}
                        disabled={disabled}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Subcomponent: Animated Pawn Token
function PawnToken({
  item,
  stackIndex = 0,
  totalStacked = 1,
  onTokenClick,
  disabled = false,
}) {
  const { playerColor, tokenId, isValidMove } = item;
  const config = COLOR_CONFIG[playerColor];

  // Token Image Texture Path
  const pawnImgSrc = `/ludo-images/pion_${playerColor.toLowerCase()}1.png`;

  // Calculate stack offset if multiple pawns share the cell
  const offsetX = totalStacked > 1 ? (stackIndex - (totalStacked - 1) / 2) * 6 : 0;
  const offsetY = totalStacked > 1 ? (stackIndex - (totalStacked - 1) / 2) * 6 : 0;

  const handleClick = (e) => {
    e.stopPropagation();
    if (isValidMove && !disabled) {
      onTokenClick?.(playerColor, tokenId);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isValidMove || disabled}
      style={{
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        zIndex: isValidMove ? 30 : 10 + stackIndex,
      }}
      className={`absolute w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center p-0.5 rounded-full transition-all duration-200 ${
        isValidMove && !disabled
          ? 'cursor-pointer animate-bounce ring-4 ring-yellow-400 drop-shadow-xl scale-125 z-40'
          : 'cursor-default opacity-95'
      }`}
      title={`${config.name} Pawn #${tokenId + 1}`}
    >
      <img
        src={pawnImgSrc}
        alt={`${playerColor} pawn`}
        className="w-full h-full object-contain filter drop-shadow-md pointer-events-none"
        onError={(e) => {
          // Fallback circular pawn if texture is missing
          e.target.style.display = 'none';
          e.target.parentNode.style.backgroundColor = config.accent;
        }}
      />
    </button>
  );
}
