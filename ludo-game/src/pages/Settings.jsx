import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Palette, Volume2, ShieldCheck, User, Check, Play } from 'lucide-react';
import { audioManager } from '../lib/audioManager';

export default function Settings() {
  const location = useLocation();

  const navItems = [
    { name: 'Board Themes', path: '/settings/themes', icon: Palette },
    { name: 'Audio & Sound', path: '/settings/audio', icon: Volume2 },
    { name: 'Game Preferences', path: '/settings/gameplay', icon: ShieldCheck },
    { name: 'Player Profile', path: '/settings/profile', icon: User },
  ];

  // Determine current active subview if not at `/settings/themes`
  const isAudio = location.pathname.includes('/settings/audio');
  const isGameplay = location.pathname.includes('/settings/gameplay');
  const isProfile = location.pathname.includes('/settings/profile');
  const isDefaultTheme = !isAudio && !isGameplay && !isProfile;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-white">Settings & Preferences</h1>
        <p className="text-sm text-textSecondary mt-1">
          Customize your board theme, sound levels, and gameplay options
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sub-nav sidebar */}
        <div className="w-full md:w-56 shrink-0 space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              (item.path === '/settings/themes' && (location.pathname === '/settings' || location.pathname === '/settings/themes')) ||
              location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-green-600/20 text-green-400 border border-green-500/30 shadow'
                    : 'text-textSecondary hover:bg-stone-800 hover:text-white'
                }`}
              >
                <item.icon size={16} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Content Box */}
        <div className="flex-1 bg-bgAuxiliary/60 border border-white/10 rounded-3xl p-6 shadow-xl min-h-[420px]">
          {isDefaultTheme && <Outlet />}
          {isAudio && <AudioSettingsView />}
          {isGameplay && <GameplaySettingsView />}
          {isProfile && <ProfileSettingsView />}
        </div>
      </div>
    </div>
  );
}

// Audio Settings Component
function AudioSettingsView() {
  const [volume, setVolume] = useState(() =>
    Math.round(audioManager.getVolume() * 100)
  );
  const [muted, setMuted] = useState(() => audioManager.isMuted());

  const handleVolumeChange = (newVal) => {
    setVolume(newVal);
    audioManager.setVolume(newVal / 100);
  };

  const handleToggleMute = (newMuted) => {
    setMuted(newMuted);
    audioManager.setMuted(newMuted);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Audio & Sound FX</h2>
        <p className="text-xs text-textSecondary mt-0.5">
          Manage volume levels for dice rolls, token movements, and victory music
        </p>
      </div>

      <div className="space-y-5">
        {/* Mute toggle */}
        <div className="flex items-center justify-between p-4 bg-bgDark rounded-2xl border border-white/5">
          <div>
            <h4 className="text-xs font-bold text-white">Sound Effects Mute</h4>
            <p className="text-[11px] text-textSecondary">
              Toggle all in-game sound effects on or off
            </p>
          </div>
          <input
            type="checkbox"
            checked={muted}
            onChange={(e) => handleToggleMute(e.target.checked)}
            className="w-5 h-5 accent-green-500 cursor-pointer"
          />
        </div>

        {/* Master Volume Slider */}
        <div className="p-4 bg-bgDark rounded-2xl border border-white/5 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-white">Sound Effects Volume</h4>
            <span className="text-xs font-mono font-bold text-green-400">
              {volume}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            disabled={muted}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-green-500 disabled:opacity-40"
          />
        </div>

        {/* SFX Previews */}
        <div className="p-4 bg-bgDark rounded-2xl border border-white/5 space-y-3">
          <h4 className="text-xs font-bold text-white">Test Audio Sounds</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => audioManager.playDice()}
              className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-200 border border-white/10 flex items-center justify-center gap-1.5 transition-all"
            >
              <Play size={12} /> Dice Roll
            </button>
            <button
              onClick={() => audioManager.playMove()}
              className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-200 border border-white/10 flex items-center justify-center gap-1.5 transition-all"
            >
              <Play size={12} /> Pawn Move
            </button>
            <button
              onClick={() => audioManager.playCapture()}
              className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-200 border border-white/10 flex items-center justify-center gap-1.5 transition-all"
            >
              <Play size={12} /> Capture Cut
            </button>
            <button
              onClick={() => audioManager.playWin()}
              className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-200 border border-white/10 flex items-center justify-center gap-1.5 transition-all"
            >
              <Play size={12} /> Victory Horn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Gameplay Preferences Component
function GameplaySettingsView() {
  const [autoMove, setAutoMove] = useState(true);
  const [timerBeep, setTimerBeep] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Gameplay Preferences</h2>
        <p className="text-xs text-textSecondary mt-0.5">
          Fine-tune match mechanics and interaction helpers
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-bgDark rounded-2xl border border-white/5">
          <div>
            <h4 className="text-xs font-bold text-white">Auto-Move Single Valid Pawn</h4>
            <p className="text-[11px] text-textSecondary">
              Automatically advance pawn when only one legal move exists
            </p>
          </div>
          <input
            type="checkbox"
            checked={autoMove}
            onChange={(e) => setAutoMove(e.target.checked)}
            className="w-5 h-5 accent-green-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-bgDark rounded-2xl border border-white/5">
          <div>
            <h4 className="text-xs font-bold text-white">Turn Timer Warning Beep</h4>
            <p className="text-[11px] text-textSecondary">
              Alert audio cue when turn timer drops below 5 seconds
            </p>
          </div>
          <input
            type="checkbox"
            checked={timerBeep}
            onChange={(e) => setTimerBeep(e.target.checked)}
            className="w-5 h-5 accent-green-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

// Profile Settings Component
function ProfileSettingsView() {
  const savedUser = JSON.parse(localStorage.getItem('ludo_user') || 'null');
  const user = savedUser || {
    name: 'Sultan_Player',
    email: 'guest@pakludo.com',
    rating: 1200,
    coins: 1000,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Player Profile</h2>
        <p className="text-xs text-textSecondary mt-0.5">
          Your personal player identity and ranking statistics
        </p>
      </div>

      <div className="p-5 bg-bgDark rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center font-black text-xl text-white shadow-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{user.name}</h3>
            <p className="text-xs text-textSecondary font-mono">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-bgAuxiliary rounded-xl border border-white/5 text-center">
            <span className="text-[11px] text-textSecondary">Rating</span>
            <div className="text-base font-black text-yellow-400 font-mono">
              {user.rating} ELO
            </div>
          </div>
          <div className="p-3 bg-bgAuxiliary rounded-xl border border-white/5 text-center">
            <span className="text-[11px] text-textSecondary">Coins</span>
            <div className="text-base font-black text-green-400 font-mono">
              {user.coins}
            </div>
          </div>
          <div className="p-3 bg-bgAuxiliary rounded-xl border border-white/5 text-center">
            <span className="text-[11px] text-textSecondary">Games</span>
            <div className="text-base font-black text-white font-mono">
              24
            </div>
          </div>
          <div className="p-3 bg-bgAuxiliary rounded-xl border border-white/5 text-center">
            <span className="text-[11px] text-textSecondary">Win Rate</span>
            <div className="text-base font-black text-cyan-400 font-mono">
              67%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
