# 🎲 Pak Ludo Backend

Real-time backend service for Pak Ludo built with Node.js, Express, Socket.IO, PostgreSQL, and Prisma.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure `.env`:**
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/ludo_db"
   JWT_SECRET="your_secret_key"
   PORT=5000
   FRONTEND_URL="http://localhost:5173"
   ```

3. **Initialize Prisma Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

## 📖 Full Documentation
For complete architecture, database schema, real-time WebSocket protocol, and Ludo game engine logic, please refer to [DOCUMENTATION.md](./DOCUMENTATION.md).
