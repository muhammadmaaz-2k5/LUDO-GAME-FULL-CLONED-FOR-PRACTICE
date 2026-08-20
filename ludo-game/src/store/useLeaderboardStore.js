import { create } from 'zustand';

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
  return 'https://ludo-game-full-cloned-for-practice.onrender.com/api';
};

const DEFAULT_LEADERBOARD = [
  { rank: 1, name: 'Sultan_Ludo', rating: 2450, winRate: '78%', games: 412, coins: '145,000', badge: 'Grandmaster' },
  { rank: 2, name: 'Shahid_Afridi_Fan', rating: 2380, winRate: '74%', games: 380, coins: '120,500', badge: 'Master' },
  { rank: 3, name: 'Fatima_Queen', rating: 2310, winRate: '71%', games: 320, coins: '98,000', badge: 'Master' },
  { rank: 4, name: 'Babar_Azam56', rating: 2240, winRate: '68%', games: 290, coins: '85,400', badge: 'Diamond' },
  { rank: 5, name: 'LudoKing_PK', rating: 2190, winRate: '66%', games: 275, coins: '72,000', badge: 'Diamond' },
  { rank: 6, name: 'Zainab_DiceMaster', rating: 2120, winRate: '64%', games: 240, coins: '64,200', badge: 'Platinum' },
  { rank: 7, name: 'Hamza_Sniper', rating: 2060, winRate: '62%', games: 210, coins: '58,000', badge: 'Platinum' },
  { rank: 8, name: 'Bilal_Khan', rating: 2010, winRate: '60%', games: 195, coins: '49,500', badge: 'Gold' },
  { rank: 9, name: 'Usman_Speed', rating: 1980, winRate: '59%', games: 180, coins: '44,000', badge: 'Gold' },
  { rank: 10, name: 'Ayesha_Star', rating: 1920, winRate: '57%', games: 165, coins: '38,200', badge: 'Gold' },
];

export const useLeaderboardStore = create((set) => ({
  leaderboard: DEFAULT_LEADERBOARD,
  isLoading: false,
  error: null,

  fetchLeaderboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${getApiBaseUrl()}/leaderboard`);
      const data = await res.json();

      if (data.success && data.data) {
        set({ leaderboard: data.data, isLoading: false, error: null });
      } else {
        set({ leaderboard: DEFAULT_LEADERBOARD, isLoading: false, error: null });
      }
    } catch (err) {
      set({ leaderboard: DEFAULT_LEADERBOARD, isLoading: false, error: null });
    }
  },
}));
