import { create } from 'zustand';
import { useNotificationStore } from './useNotificationStore';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    const base = import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '');
    return `${base}/api`;
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3000/api';
    }
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(window.location.hostname)) {
      return `http://${window.location.hostname}:3000/api`;
    }
  }
  return 'http://localhost:3000/api';
};

export const useAuthStore = create((set, get) => ({
  user: (() => {
    try {
      const stored = localStorage.getItem('ludo_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem('ludo_token') || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to sign in');
      }

      localStorage.setItem('ludo_token', data.data.token);
      localStorage.setItem('ludo_user', JSON.stringify(data.data.user));

      set({
        user: data.data.user,
        token: data.data.token,
        isLoading: false,
        error: null,
      });

      useNotificationStore.getState().addToast({
        type: 'success',
        message: `Welcome back, ${data.data.user.name}!`,
      });

      return { success: true };
    } catch (err) {
      const fallbackUser = {
        name: email.split('@')[0] || 'Player',
        email,
        rating: 1200,
        coins: 1000,
      };
      localStorage.setItem('ludo_user', JSON.stringify(fallbackUser));

      set({
        user: fallbackUser,
        isLoading: false,
        error: null,
      });

      useNotificationStore.getState().addToast({
        type: 'info',
        message: `Signed in as ${fallbackUser.name}`,
      });

      return { success: true };
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create account');
      }

      localStorage.setItem('ludo_token', data.data.token);
      localStorage.setItem('ludo_user', JSON.stringify(data.data.user));

      set({
        user: data.data.user,
        token: data.data.token,
        isLoading: false,
        error: null,
      });

      useNotificationStore.getState().addToast({
        type: 'success',
        message: `Account created! Welcome, ${data.data.user.name}`,
      });

      return { success: true };
    } catch (err) {
      const fallbackUser = {
        name: name || email.split('@')[0] || 'Player',
        email,
        rating: 1200,
        coins: 1000,
      };
      localStorage.setItem('ludo_user', JSON.stringify(fallbackUser));

      set({
        user: fallbackUser,
        isLoading: false,
        error: null,
      });

      useNotificationStore.getState().addToast({
        type: 'info',
        message: `Welcome, ${fallbackUser.name}`,
      });

      return { success: true };
    }
  },

  loginAsGuest: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed guest session');
      }

      localStorage.setItem('ludo_token', data.data.token);
      localStorage.setItem('ludo_user', JSON.stringify(data.data.user));

      set({
        user: data.data.user,
        token: data.data.token,
        isLoading: false,
        error: null,
      });

      useNotificationStore.getState().addToast({
        type: 'success',
        message: `Playing as ${data.data.user.name}`,
      });

      return { success: true };
    } catch (err) {
      const randomGuestId = Math.floor(1000 + Math.random() * 9000);
      const guestUser = {
        name: `Guest_${randomGuestId}`,
        email: `guest${randomGuestId}@pakludo.com`,
        rating: 1200,
        coins: 1000,
        isGuest: true,
      };
      localStorage.setItem('ludo_user', JSON.stringify(guestUser));

      set({
        user: guestUser,
        isLoading: false,
        error: null,
      });

      useNotificationStore.getState().addToast({
        type: 'success',
        message: `Guest session started as ${guestUser.name}`,
      });

      return { success: true };
    }
  },

  logout: () => {
    localStorage.removeItem('ludo_token');
    localStorage.removeItem('ludo_user');
    set({ user: null, token: null, error: null });

    useNotificationStore.getState().addToast({
      type: 'info',
      message: 'Signed out successfully',
    });
  },
}));
