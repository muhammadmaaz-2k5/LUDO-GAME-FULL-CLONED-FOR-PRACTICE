// Ludo Engine: Geometry, Rules, Validation, and AI Logic

export const PLAYER_COLORS = ['RED', 'GREEN', 'YELLOW', 'BLUE'];

export const COLOR_CONFIG = {
  RED: {
    name: 'Red',
    startIndex: 0,
    endTrackStep: 50,
    hex: 'var(--ludo-red, #ef4444)',
    accent: '#ef4444',
    bg: 'bg-red-500',
    border: 'border-red-500',
    light: '#fca5a5',
    basePawnImg: '/ludo-images/pion_red',
  },
  GREEN: {
    name: 'Green',
    startIndex: 13,
    endTrackStep: 50,
    hex: 'var(--ludo-green, #22c55e)',
    accent: '#22c55e',
    bg: 'bg-green-500',
    border: 'border-green-500',
    light: '#86efac',
    basePawnImg: '/ludo-images/pion_green',
  },
  YELLOW: {
    name: 'Yellow',
    startIndex: 26,
    endTrackStep: 50,
    hex: 'var(--ludo-yellow, #eab308)',
    accent: '#eab308',
    bg: 'bg-yellow-500',
    border: 'border-yellow-500',
    light: '#fde047',
    basePawnImg: '/ludo-images/pion_yellow',
  },
  BLUE: {
    name: 'Blue',
    startIndex: 39,
    endTrackStep: 50,
    hex: 'var(--ludo-blue, #3b82f6)',
    accent: '#3b82f6',
    bg: 'bg-blue-500',
    border: 'border-blue-500',
    light: '#93c5fd',
    basePawnImg: '/ludo-images/pion_blue',
  },
};

// 52 common track cell grid coordinates (row, col) on 15x15 board
export const TRACK_COORDINATES = [
  /* 0 - Red Start */ [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  /* 5 */ [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  /* 11 */ [0, 7],
  /* 12 */ [0, 8],
  /* 13 - Green Start */ [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  /* 18 */ [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  /* 24 */ [7, 14],
  /* 25 */ [8, 14],
  /* 26 - Yellow Start */ [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  /* 31 */ [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  /* 37 */ [14, 7],
  /* 38 */ [14, 6],
  /* 39 - Blue Start */ [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  /* 44 */ [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  /* 50 */ [7, 0],
  /* 51 */ [6, 0]
];

// Safe zones on the 52-track where tokens cannot be captured
export const SAFE_ZONES = [0, 8, 13, 21, 26, 34, 39, 47];

// Star icon coordinates for visual board markers
export const STAR_COORDINATES = [
  [6, 1],   // Red Start (Track 0)
  [2, 6],   // Track 8
  [1, 8],   // Green Start (Track 13)
  [6, 12],  // Track 21
  [8, 13],  // Yellow Start (Track 26)
  [12, 8],  // Track 34
  [13, 6],  // Blue Start (Track 39)
  [8, 2]    // Track 47
];

// Home stretch paths (steps 52 to 56) and goal (step 57)
export const HOME_STRETCH_COORDINATES = {
  RED: [
    [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6] // 52..56, 57=Goal
  ],
  GREEN: [
    [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]
  ],
  YELLOW: [
    [7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]
  ],
  BLUE: [
    [13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]
  ],
};

// Base positions inside the 4 home quadrants (row, col)
export const BASE_COORDINATES = {
  RED: [
    [2, 2], [2, 3], [3, 2], [3, 3]
  ],
  GREEN: [
    [2, 11], [2, 12], [3, 11], [3, 12]
  ],
  YELLOW: [
    [11, 11], [11, 12], [12, 11], [12, 12]
  ],
  BLUE: [
    [11, 2], [11, 3], [12, 2], [12, 3]
  ],
};

export const MAX_STEPS = 57; // Step 57 is Goal

/**
 * Converts a player's step number (0..57) to global 15x15 board coordinates [row, col].
 * Step -1 represents home base.
 */
export function getBoardCoordinates(color, step, tokenId = 0) {
  if (step === -1) {
    return BASE_COORDINATES[color][tokenId] || [0, 0];
  }
  if (step >= 0 && step <= 51) {
    const startIndex = COLOR_CONFIG[color].startIndex;
    const globalTrackIndex = (startIndex + step) % 52;
    return TRACK_COORDINATES[globalTrackIndex];
  }
  if (step >= 52 && step <= 57) {
    const stretchIndex = step - 52;
    return HOME_STRETCH_COORDINATES[color][stretchIndex];
  }
  return [7, 7]; // Center
}

/**
 * Returns global track index (0..51) for a player step (0..51)
 */
export function getGlobalTrackIndex(color, step) {
  if (step < 0 || step > 51) return null;
  const startIndex = COLOR_CONFIG[color].startIndex;
  return (startIndex + step) % 52;
}

/**
 * Determines if a token can move given the rolled dice value.
 */
export function canMoveToken(token, diceValue, options = {}) {
  const { isMasterMode = false, hasCutOpponent = false } = options;

  if (token.isWon) return false;

  // In Base: Must roll a 6 to enter
  if (token.step === -1) {
    return diceValue === 6;
  }

  const nextStep = token.step + diceValue;

  // In Master mode, must have cut at least one opponent before entering home stretch (>51)
  if (isMasterMode && !hasCutOpponent && nextStep > 51) {
    return false;
  }

  // Exact roll required to reach or enter goal (57)
  return nextStep <= MAX_STEPS;
}

/**
 * Returns a list of token indices that are eligible to move.
 */
export function getValidTokenMoves(tokens, diceValue, options = {}) {
  return tokens
    .map((token, index) => ({ token, index }))
    .filter(({ token }) => canMoveToken(token, diceValue, options))
    .map(({ index }) => index);
}

/**
 * Evaluates move outcome: returns updated token, whether opponent token was captured, and if won.
 */
export function executeMove(gameState, playerColor, tokenId, diceValue) {
  const player = gameState.players.find((p) => p.color === playerColor);
  if (!player) return null;

  const tokens = [...player.tokens];
  const currentToken = { ...tokens[tokenId] };

  let nextStep = currentToken.step;
  let isCut = false;
  let capturedColor = null;
  let capturedTokenId = null;

  if (currentToken.step === -1 && diceValue === 6) {
    nextStep = 0; // Move onto starting cell
  } else if (currentToken.step >= 0) {
    nextStep = currentToken.step + diceValue;
  }

  const isWon = nextStep === MAX_STEPS;
  currentToken.step = nextStep;
  currentToken.isHome = nextStep === -1;
  currentToken.isWon = isWon;
  tokens[tokenId] = currentToken;

  // Check captures on common track (steps 0..51)
  let updatedPlayers = gameState.players.map((p) => {
    if (p.color === playerColor) {
      return {
        ...p,
        tokens,
        tokensWon: tokens.filter((t) => t.isWon).length,
        hasCutOpponent: p.hasCutOpponent || isCut,
      };
    }
    return p;
  });

  if (nextStep >= 0 && nextStep <= 51) {
    const globalDestTrack = getGlobalTrackIndex(playerColor, nextStep);
    const isSafe = SAFE_ZONES.includes(globalDestTrack);

    if (!isSafe) {
      // Check if any opponent tokens exist on this cell
      updatedPlayers = updatedPlayers.map((otherPlayer) => {
        // In 2v2 Team Up, allies cannot cut each other (Red+Yellow, Green+Blue)
        if (otherPlayer.color === playerColor) return otherPlayer;
        if (gameState.mode === 'TEAM_UP') {
          const isAlly =
            (playerColor === 'RED' && otherPlayer.color === 'YELLOW') ||
            (playerColor === 'YELLOW' && otherPlayer.color === 'RED') ||
            (playerColor === 'GREEN' && otherPlayer.color === 'BLUE') ||
            (playerColor === 'BLUE' && otherPlayer.color === 'GREEN');
          if (isAlly) return otherPlayer;
        }

        const opponentTokens = otherPlayer.tokens.map((oppToken, oppIndex) => {
          if (oppToken.step >= 0 && oppToken.step <= 51) {
            const oppGlobalTrack = getGlobalTrackIndex(otherPlayer.color, oppToken.step);
            if (oppGlobalTrack === globalDestTrack) {
              isCut = true;
              capturedColor = otherPlayer.color;
              capturedTokenId = oppIndex;
              // Reset back to home base (-1)
              return { ...oppToken, step: -1, isHome: true };
            }
          }
          return oppToken;
        });

        return { ...otherPlayer, tokens: opponentTokens };
      });
    }
  }

  // Update current player's hasCutOpponent if cut occurred
  if (isCut) {
    updatedPlayers = updatedPlayers.map((p) =>
      p.color === playerColor ? { ...p, hasCutOpponent: true } : p
    );
  }

  // Extra turn conditions: rolled a 6, cut an opponent, or reached goal
  const awardsExtraTurn = diceValue === 6 || isCut || isWon;

  return {
    updatedPlayers,
    isCut,
    capturedColor,
    capturedTokenId,
    isWon,
    awardsExtraTurn,
    nextStep,
  };
}

/**
 * Intelligent AI Bot move selector
 * Difficulty: EASY, MEDIUM, MASTER
 */
export function selectBotMove(gameState, botColor, diceValue, difficulty = 'MEDIUM') {
  const player = gameState.players.find((p) => p.color === botColor);
  if (!player) return null;

  const validMoveIndices = getValidTokenMoves(player.tokens, diceValue, {
    isMasterMode: gameState.mode === 'MASTER',
    hasCutOpponent: player.hasCutOpponent,
  });

  if (validMoveIndices.length === 0) return null;
  if (validMoveIndices.length === 1) return validMoveIndices[0];

  if (difficulty === 'EASY') {
    // Random move choice
    return validMoveIndices[Math.floor(Math.random() * validMoveIndices.length)];
  }

  // Heuristic evaluation scoring
  let bestScore = -Infinity;
  let bestTokenIndex = validMoveIndices[0];

  validMoveIndices.forEach((tokenId) => {
    const token = player.tokens[tokenId];
    let score = 0;

    // 1. Move into Goal (Step 57) - Very High Priority
    if (token.step + diceValue === MAX_STEPS) {
      score += 1000;
    }

    // 2. Unlock from Base with a 6
    if (token.step === -1 && diceValue === 6) {
      score += 300;
    }

    // 3. Capturing opponent
    if (token.step >= 0) {
      const nextStep = token.step + diceValue;
      if (nextStep <= 51) {
        const destTrack = getGlobalTrackIndex(botColor, nextStep);
        const isSafe = SAFE_ZONES.includes(destTrack);
        if (!isSafe) {
          gameState.players.forEach((opp) => {
            if (opp.color !== botColor) {
              opp.tokens.forEach((oppToken) => {
                if (oppToken.step >= 0 && oppToken.step <= 51) {
                  const oppTrack = getGlobalTrackIndex(opp.color, oppToken.step);
                  if (oppTrack === destTrack) {
                    score += 500; // Big capture reward
                  }
                }
              });
            }
          });
        }
      }

      // 4. Moving onto a safe star cell
      if (nextStep <= 51) {
        const destTrack = getGlobalTrackIndex(botColor, nextStep);
        if (SAFE_ZONES.includes(destTrack)) {
          score += 150;
        }
      }

      // 5. Entering safe home stretch
      if (nextStep >= 52) {
        score += 200;
      }

      // 6. Advancement preference (further ahead is better)
      score += nextStep * 2;
    }

    if (score > bestScore) {
      bestScore = score;
      bestTokenIndex = tokenId;
    }
  });

  return bestTokenIndex;
}

/**
 * Creates a fresh initial game state
 */
export function createInitialGameState(options = {}) {
  const {
    playerCount = 4,
    mode = 'CLASSIC',
    playerColor = 'RED',
    botDifficulty = 'MEDIUM',
  } = options;

  const activeColors = PLAYER_COLORS.slice(0, playerCount);

  const players = activeColors.map((color, index) => {
    const isHuman = color === playerColor;
    return {
      color,
      name: isHuman ? 'You' : `Bot ${COLOR_CONFIG[color].name}`,
      isBot: !isHuman,
      botDifficulty,
      tokensWon: 0,
      hasCutOpponent: false,
      tokens: [
        { id: 0, step: -1, isHome: true, isWon: false },
        { id: 1, step: -1, isHome: true, isWon: false },
        { id: 2, step: -1, isHome: true, isWon: false },
        { id: 3, step: -1, isHome: true, isWon: false },
      ],
    };
  });

  return {
    id: `game_${Date.now()}`,
    mode,
    status: 'IN_PROGRESS',
    currentTurn: 'RED',
    currentTurnIndex: 0,
    diceValue: null,
    isRolling: false,
    hasRolled: false,
    consecutiveSix: 0,
    validMoves: [],
    players,
    moveHistory: [],
    winners: [],
    turnTimer: 30,
    startTime: Date.now(),
  };
}
