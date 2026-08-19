// Server-Side Authoritative Ludo Engine

export const PLAYER_COLORS = ['RED', 'GREEN', 'YELLOW', 'BLUE'];

export const COLOR_CONFIG = {
  RED: { startIndex: 0, endTrackStep: 50 },
  GREEN: { startIndex: 13, endTrackStep: 50 },
  YELLOW: { startIndex: 26, endTrackStep: 50 },
  BLUE: { startIndex: 39, endTrackStep: 50 },
};

export const SAFE_ZONES = [0, 8, 13, 21, 26, 34, 39, 47];
export const MAX_STEPS = 57;

export function getGlobalTrackIndex(color, step) {
  if (step < 0 || step > 51) return null;
  const startIndex = COLOR_CONFIG[color].startIndex;
  return (startIndex + step) % 52;
}

export function canMoveToken(token, diceValue, options = {}) {
  const { isMasterMode = false, hasCutOpponent = false } = options;
  if (token.isWon) return false;

  if (token.step === -1) {
    return diceValue === 6;
  }

  const nextStep = token.step + diceValue;
  if (isMasterMode && !hasCutOpponent && nextStep > 51) {
    return false;
  }

  return nextStep <= MAX_STEPS;
}

export function getValidTokenMoves(tokens, diceValue, options = {}) {
  return tokens
    .map((token, index) => ({ token, index }))
    .filter(({ token }) => canMoveToken(token, diceValue, options))
    .map(({ index }) => index);
}

export function processServerMove(gameState, playerColor, tokenId, diceValue) {
  const player = gameState.players.find((p) => p.color === playerColor);
  if (!player) return { valid: false, error: 'Player not found' };

  const tokens = [...player.tokens];
  const currentToken = { ...tokens[tokenId] };

  if (!canMoveToken(currentToken, diceValue, { isMasterMode: gameState.mode === 'MASTER', hasCutOpponent: player.hasCutOpponent })) {
    return { valid: false, error: 'Illegal move' };
  }

  let nextStep = currentToken.step;
  let isCut = false;
  let capturedColor = null;
  let capturedTokenId = null;

  if (currentToken.step === -1 && diceValue === 6) {
    nextStep = 0;
  } else if (currentToken.step >= 0) {
    nextStep = currentToken.step + diceValue;
  }

  const isWon = nextStep === MAX_STEPS;
  currentToken.step = nextStep;
  currentToken.isHome = nextStep === -1;
  currentToken.isWon = isWon;
  tokens[tokenId] = currentToken;

  let updatedPlayers = gameState.players.map((p) => {
    if (p.color === playerColor) {
      return {
        ...p,
        tokens,
        tokensWon: tokens.filter((t) => t.isWon).length,
      };
    }
    return p;
  });

  if (nextStep >= 0 && nextStep <= 51) {
    const globalDestTrack = getGlobalTrackIndex(playerColor, nextStep);
    const isSafe = SAFE_ZONES.includes(globalDestTrack);

    if (!isSafe) {
      updatedPlayers = updatedPlayers.map((otherPlayer) => {
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
              return { ...oppToken, step: -1, isHome: true };
            }
          }
          return oppToken;
        });

        return { ...otherPlayer, tokens: opponentTokens };
      });
    }
  }

  if (isCut) {
    updatedPlayers = updatedPlayers.map((p) =>
      p.color === playerColor ? { ...p, hasCutOpponent: true } : p
    );
  }

  const awardsExtraTurn = diceValue === 6 || isCut || isWon;

  return {
    valid: true,
    updatedPlayers,
    isCut,
    capturedColor,
    capturedTokenId,
    isWon,
    awardsExtraTurn,
    nextStep,
  };
}
