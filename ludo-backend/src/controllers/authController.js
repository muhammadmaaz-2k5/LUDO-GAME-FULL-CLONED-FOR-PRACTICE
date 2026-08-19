import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env.js';
import { prisma } from '../config/prisma.js';

// In-memory fallback users cache
const inMemoryUsers = new Map();

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name || user.username,
      rating: user.rating,
      coins: user.coins,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let user;

    if (prisma) {
      try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
          return res.status(400).json({ success: false, error: 'Email already registered' });
        }

        user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name: name || email.split('@')[0],
            provider: 'EMAIL',
            rating: 1200,
            coins: 1000,
          },
        });
      } catch (dbErr) {
        console.warn('DB create fallback:', dbErr.message);
      }
    }

    if (!user) {
      // In-memory fallback
      user = {
        id: uuidv4(),
        email,
        name: name || email.split('@')[0],
        rating: 1200,
        coins: 1000,
        provider: 'EMAIL',
        createdAt: new Date(),
      };
      inMemoryUsers.set(email, { ...user, password: hashedPassword });
    }

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          rating: user.rating,
          coins: user.coins,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    let user;

    if (prisma) {
      try {
        user = await prisma.user.findUnique({ where: { email } });
      } catch (dbErr) {
        console.warn('DB login fallback:', dbErr.message);
      }
    }

    if (!user) {
      user = inMemoryUsers.get(email);
    }

    if (!user || !user.password) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          rating: user.rating,
          coins: user.coins,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function guestLogin(req, res, next) {
  try {
    const guestId = Math.floor(1000 + Math.random() * 9000);
    const guestEmail = `guest_${guestId}_${Date.now()}@pakludo.com`;
    const guestName = `Guest_${guestId}`;

    let user;

    if (prisma) {
      try {
        user = await prisma.user.create({
          data: {
            email: guestEmail,
            name: guestName,
            username: guestName,
            provider: 'GUEST',
            rating: 1200,
            coins: 1000,
          },
        });
      } catch (dbErr) {
        console.warn('DB guest create fallback:', dbErr.message);
      }
    }

    if (!user) {
      user = {
        id: uuidv4(),
        email: guestEmail,
        name: guestName,
        rating: 1200,
        coins: 1000,
        provider: 'GUEST',
        createdAt: new Date(),
      };
      inMemoryUsers.set(guestEmail, user);
    }

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          rating: user.rating,
          coins: user.coins,
          isGuest: true,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const userId = req.user?.id;
    let user;

    if (prisma && userId) {
      try {
        user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, name: true, username: true, rating: true, coins: true, gamesPlayed: true, gamesWon: true },
        });
      } catch (dbErr) {
        console.warn('DB getMe fallback:', dbErr.message);
      }
    }

    if (!user) {
      user = req.user;
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}
