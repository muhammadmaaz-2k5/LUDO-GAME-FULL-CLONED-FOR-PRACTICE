import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_ludo_jwt_key_987654321',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  allowedHosts: (process.env.ALLOWED_HOSTS || 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173')
    .split(',')
    .map((h) => h.trim()),
};
