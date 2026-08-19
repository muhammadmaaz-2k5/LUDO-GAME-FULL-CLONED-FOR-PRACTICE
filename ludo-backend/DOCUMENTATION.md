# 🎲 Pak Ludo Backend Documentation

A high-performance real-time multiplayer backend service for **Pak Ludo**, built with **Node.js, Express, Socket.IO, PostgreSQL, and Prisma ORM**.

---

## 📑 Table of Contents
1. [Architecture Overview](#-architecture-overview)
2. [Data Model & Prisma Schema](#-data-model--prisma-schema)
3. [Game Engine & Rules Logic](#-game-engine--rules-logic)
4. [WebSocket Real-Time Event Protocol](#-websocket-real-time-event-protocol)
5. [REST API Endpoints](#-rest-api-endpoints)
6. [Room & Matchmaking System](#-room--matchmaking-system)
7. [Environment Variables & Configuration](#-environment-variables--configuration)
8. [Installation & Getting Started](#-installation--getting-started)

---

## 🏗 Architecture Overview

```
                        ┌────────────────────────────────┐
                        │      React Frontend (Vite)     │
                        └──────────────┬─────────────────┘
                                       │ HTTP / WebSockets (Socket.IO)
                                       ▼
                        ┌────────────────────────────────┐
                        │     Express & Socket Gateway   │
                        ├────────────────────────────────┤
                        │  - Auth & JWT Middleware       │
                        │  - Room & Matchmaking Manager  │
                        │  - Ludo Game Engine (Rules)    │
                        │  - Turn & Dice State Machine   │
                        └──────────────┬─────────────────┘
                                       │ Prisma ORM
                                       ▼
                        ┌────────────────────────────────┐
                        │      PostgreSQL Database       │
                        └────────────────────────────────┘
```

---

## 🗄 Data Model & Prisma Schema

### 1. `User` Model
Stores registered players and guests, user ratings, coins balance, and game statistics.
- `id` (UUID): Primary key.
- `username`, `name`, `email`: User identity.
- `provider`: `EMAIL`, `GOOGLE`, `GITHUB`, `GUEST`.
- `rating`: ELO/Skill rating (default `1200`).
- `coins`: Virtual currency balance.
- `gamesPlayed`, `gamesWon`: Career stats.

### 2. `Game` Model
Tracks game sessions, modes, state snapshots, turn order, and outcomes.
- `id` (UUID): Unique game identifier.
- `roomCode`: 6-character alphanumeric code for private rooms.
- `isPrivate`: Whether the game is invite-only or matchmaking.
- `mode`: `CLASSIC`, `QUICK`, `MASTER`, `TEAM_UP`.
- `status`: `WAITING`, `IN_PROGRESS`, `COMPLETED`, `ABANDONED`, `CANCELLED`.
- `maxPlayers`: 2, 3, or 4 players.
- `timePerTurn`: Turn timeout in seconds (default `30s`).
- `currentTurn`: Color of the player whose turn it is (`RED`, `GREEN`, `YELLOW`, `BLUE`).
- `diceValue`: Latest rolled dice value (1–6).
- `hasRolled`: Boolean flag indicating if current player has rolled.
- `consecutiveSix`: Tracks consecutive 6s (3 consecutive 6s forfeits the turn).
- `gameState`: JSON snapshot of board, tokens, and active timers.

### 3. `GamePlayer` Model
Links users to their game color slot and tracks individual token positions.
- `gameId`, `userId`: Foreign keys.
- `color`: `RED`, `GREEN`, `YELLOW`, `BLUE`.
- `playerIndex`: Turn rotation order (`0`, `1`, `2`, `3`).
- `isHost`, `isBot`, `hasLeft`: State flags.
- `rank`: Final position (`1` for 1st place, `2` for 2nd, etc.).
- `tokens`: JSON array storing the 4 tokens:
  ```json
  [
    { "id": 0, "step": -1, "isHome": true, "isWon": false },
    { "id": 1, "step": -1, "isHome": true, "isWon": false },
    { "id": 2, "step": -1, "isHome": true, "isWon": false },
    { "id": 3, "step": -1, "isHome": true, "isWon": false }
  ]
  ```

### 4. `Move` Model
Audit trail of all dice rolls and token advancements.
- `gameId`, `moveNumber`, `playerColor`.
- `diceRoll`: 1 to 6.
- `tokenId`: Index 0 to 3 of moved token.
- `fromPos`, `toPos`: Board coordinates before and after move.
- `capturedTokenId`, `capturedColor`: Captured opponent token details.
- `isCut`: True if an opponent token was captured.
- `isHomeRun`: True if the token reached the destination.
- `timeTaken`: Move duration in milliseconds.

---

## ⚙️ Game Engine & Rules Logic

### 1. Board Coordinate System (52 Track Steps)
- **Track Length**: 52 common tiles (indices `0` to `51`).
- **Start Positions**:
  - `RED`: Step index `0` (tile 1)
  - `GREEN`: Step index `13` (tile 14)
  - `YELLOW`: Step index `26` (tile 27)
  - `BLUE`: Step index `39` (tile 40)
- **Home Stretch**: 5 colored tiles leading to center home (step `52` to `56`).
- **Destination (Goal)**: Step `57`.

### 2. Core Rule Implementations
1. **Unlocking Tokens**: A player must roll a **6** to move a token from Home Base onto the starting tile (`step = 0`).
2. **Extra Turns Awarded For**:
   - Rolling a **6**.
   - Capturing (**cutting**) an opponent's token.
   - Getting a token into the final **Goal / Home**.
3. **Three 6s Penalty**: If a player rolls a **6** three times in a row, the 3rd roll is forfeited and turn passes immediately to the next player.
4. **Safe Zones (Star Tiles & Starting Tiles)**:
   - Tokens on safe tiles (indices `0, 8, 13, 21, 26, 34, 39, 47`) cannot be captured.
5. **Turn Expiration**: A 30-second timer runs per turn. If a player misses 3 consecutive turns, their tokens are managed by an Auto-Bot or they forfeit.

---

## 🔌 WebSocket Real-Time Event Protocol

### Client ➔ Server Events

| Event Name | Payload | Description |
|---|---|---|
| `join_queue` | `{ mode: 'CLASSIC', players: 4 }` | Join matchmaking queue |
| `create_room` | `{ mode: 'CLASSIC', isPrivate: true }` | Create a custom room |
| `join_room` | `{ roomCode: 'ABC123' }` | Join existing custom room |
| `roll_dice` | `{ gameId: 'UUID' }` | Request dice roll |
| `move_token` | `{ gameId: 'UUID', tokenId: 0 }` | Move selected token |
| `leave_game` | `{ gameId: 'UUID' }` | Forfeit / exit active game |
| `send_chat` | `{ gameId: 'UUID', message: 'Good luck!' }` | Send in-game chat or emoji |

### Server ➔ Client Events

| Event Name | Payload | Description |
|---|---|---|
| `match_found` | `{ gameId, roomCode, players }` | Match found, redirect to board |
| `game_started` | `{ gameState, currentTurn, timePerTurn }` | All players loaded; game starts |
| `dice_rolled` | `{ playerColor, value, possibleMoves }` | Broadcasts dice value & valid tokens |
| `token_moved` | `{ playerColor, tokenId, fromPos, toPos, isCut, isWon }` | Animation & state update |
| `turn_changed` | `{ nextTurn: 'GREEN', timeoutMs: 30000 }` | Switch turn to next player |
| `player_left` | `{ playerColor, isBot: true }` | Player disconnected or forfeited |
| `game_over` | `{ winners: [{ rank: 1, color: 'RED' }] }` | Game finished; final rankings |

---

## 🌐 REST API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account.
- `POST /api/auth/login` - Sign in with email & password (returns JWT).
- `POST /api/auth/guest` - Generate one-click guest session.
- `GET /api/auth/me` - Retrieve current logged-in user profile.
- `POST /api/auth/logout` - Clear authentication session cookie.

### Leaderboard & Stats
- `GET /api/leaderboard` - Top rated Ludo players globally.
- `GET /api/user/history` - User's previous match history & statistics.

---

## 🚀 Installation & Getting Started

### Prerequisites
- Node.js 18+ & npm
- PostgreSQL database

### 1. Clone & Install Dependencies
```bash
cd ludo-backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ludo_db?schema=public"
JWT_SECRET="your_secure_jwt_secret"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

### 3. Setup Database Schema
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Server will be listening on `http://localhost:5000`.
