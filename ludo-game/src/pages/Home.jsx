import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Bot,
  Users,
  Trophy,
  Sparkles,
  Zap,
  Gift,
  Flame,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export default function Home() {
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [coins, setCoins] = useState(1000);

  const handleClaimDaily = () => {
    if (!dailyClaimed) {
      setDailyClaimed(true);
      setCoins((prev) => prev + 250);
    }
  };

  const gameModes = [
    {
      title: 'Play Online',
      description: 'Match with players globally or create custom private rooms.',
      icon: Users,
      badge: 'Multiplayer',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      to: '/play-online',
      gradient: 'from-emerald-600 to-teal-800',
      iconImg: '/friendship.png',
    },
    {
      title: 'Play vs Computer',
      description: 'Practice offline against smart bots with custom difficulty.',
      icon: Bot,
      badge: 'Offline AI',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      to: '/computer',
      gradient: 'from-cyan-600 to-blue-800',
      iconImg: '/computer.png',
    },
    {
      title: 'Championship Tournaments',
      description: 'Compete in 8 & 16 player knockout brackets for big prize pools.',
      icon: Trophy,
      badge: 'Live Events',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      to: '/tournaments',
      gradient: 'from-amber-500 to-orange-700',
      iconImg: '/trophy.png',
    },
    {
      title: 'Special Variants',
      description: 'Quick 2-Pawn Ludo, 2v2 Team Up, and Master Mode rules.',
      icon: Sparkles,
      badge: '4 Modes',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      to: '/variants',
      gradient: 'from-purple-600 to-pink-800',
      iconImg: '/strategy.png',
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900/90 to-bgAuxiliary border border-white/10 p-6 sm:p-10 shadow-2xl">
        {/* Glow backdrop */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-green-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider">
              <Flame size={14} className="animate-bounce text-yellow-400" />
              Pak Ludo Experience
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Roll the Dice. <br />
              <span className="bg-gradient-to-r from-green-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
                Conquer the Board!
              </span>
            </h1>

            <p className="text-sm sm:text-base text-textSecondary max-w-xl leading-relaxed">
              Experience authentic real-time multiplayer Ludo with custom board themes,
              safe star zones, instant bot matchmaking, and competitive tournaments.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/computer"
                className="px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-extrabold text-sm shadow-xl shadow-green-600/30 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Play size={18} /> Quick Play Now
              </Link>
              <Link
                to="/play-online"
                className="px-6 py-3 rounded-2xl bg-bgDark hover:bg-stone-800 text-white font-bold text-sm border border-white/10 transition-all flex items-center gap-2"
              >
                <Users size={18} /> Create Room
              </Link>
            </div>
          </div>

          {/* Hero Visual Preview */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 p-4 bg-bgDark/80 rounded-3xl border border-white/10 shadow-2xl flex items-center justify-center">
              <div className="grid grid-cols-2 gap-3 w-full h-full">
                <div className="rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center p-3">
                  <img
                    src="/ludo-images/pion_red0.png"
                    alt="Red Pawn"
                    className="w-12 h-12 object-contain animate-pulse drop-shadow"
                  />
                </div>
                <div className="rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center p-3">
                  <img
                    src="/ludo-images/pion_green0.png"
                    alt="Green Pawn"
                    className="w-12 h-12 object-contain animate-pulse drop-shadow"
                  />
                </div>
                <div className="rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center p-3">
                  <img
                    src="/ludo-images/pion_blue0.png"
                    alt="Blue Pawn"
                    className="w-12 h-12 object-contain animate-pulse drop-shadow"
                  />
                </div>
                <div className="rounded-2xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center p-3">
                  <img
                    src="/ludo-images/pion_yellow0.png"
                    alt="Yellow Pawn"
                    className="w-12 h-12 object-contain animate-pulse drop-shadow"
                  />
                </div>
              </div>

              {/* Center Floating 3D Dice */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-18 h-18 p-2 rounded-2xl bg-stone-900 border-2 border-yellow-400 shadow-2xl shadow-yellow-500/40 animate-bounce">
                  <img
                    src="/ludo-images/dice_6.png"
                    alt="Dice 6"
                    className="w-14 h-14 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Bonus Reward Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Gift size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Daily Lucky Roll & Coins Bonus
            </h3>
            <p className="text-xs text-textSecondary">
              Your Coins: <span className="font-bold text-yellow-400">{coins}</span> • Claim your free +250 coins bonus every 24 hours!
            </p>
          </div>
        </div>

        <button
          onClick={handleClaimDaily}
          disabled={dailyClaimed}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 ${
            dailyClaimed
              ? 'bg-stone-800 text-stone-500 border border-white/5 cursor-default'
              : 'bg-amber-500 hover:bg-amber-400 text-stone-950 hover:scale-105 active:scale-95'
          }`}
        >
          {dailyClaimed ? '✓ Claimed Today' : '🎁 Claim +250 Coins'}
        </button>
      </div>

      {/* Game Modes Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-white">Select Game Mode</h2>
          <span className="text-xs font-semibold text-textSecondary">
            Multiple Variations Supported
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {gameModes.map((mode) => (
            <Link
              key={mode.title}
              to={mode.to}
              className="group relative overflow-hidden bg-bgAuxiliary hover:bg-stone-800/80 border border-white/10 hover:border-green-500/40 rounded-3xl p-6 transition-all duration-300 transform hover:-translate-y-1 shadow-xl flex flex-col justify-between min-h-[170px]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <span
                    className={`inline-block text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${mode.badgeColor}`}
                  >
                    {mode.badge}
                  </span>
                  <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">
                    {mode.title}
                  </h3>
                  <p className="text-xs text-textSecondary max-w-sm">
                    {mode.description}
                  </p>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-bgDark border border-white/10 flex items-center justify-center p-2 group-hover:scale-110 transition-transform shadow">
                  <img
                    src={mode.iconImg}
                    alt={mode.title}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <mode.icon className="w-6 h-6 text-textSecondary group-hover:text-green-400" />
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-green-400 mt-4 group-hover:translate-x-1 transition-transform">
                Play Mode <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Feature Badges Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
        <div className="p-4 rounded-2xl bg-bgAuxiliary/50 border border-white/5 flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-green-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-white">Authentic Safe Zones</h4>
            <p className="text-[11px] text-textSecondary">
              8 safe star tiles prevent captures & reward tactical strategy.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-bgAuxiliary/50 border border-white/5 flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-yellow-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-white">4 Curated Themes</h4>
            <p className="text-[11px] text-textSecondary">
              Switch smoothly between Classic, Neon, Pastel, and Ocean boards.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-bgAuxiliary/50 border border-white/5 flex items-center gap-3">
          <Zap className="w-6 h-6 text-cyan-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-white">Smart Bot Engines</h4>
            <p className="text-[11px] text-textSecondary">
              Adaptive AI bots calibrated for Easy, Medium, and Master matches.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
