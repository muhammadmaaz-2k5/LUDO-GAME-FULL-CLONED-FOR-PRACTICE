import { Sparkles, Zap, ShieldAlert, Users, Play, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Variants() {
  const navigate = useNavigate();

  const variants = [
    {
      id: 'QUICK',
      title: 'Quick Ludo (2 Pawns Goal)',
      tag: 'Fast Pace (5 Mins)',
      tagColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      description:
        'First player to safely land 2 pawns into the center home goal wins the entire match immediately. Perfect for quick coffee breaks!',
      rules: [
        'Only 2 pawns need to reach goal',
        'Standard 6 required to unlock',
        'Captures grant extra roll',
      ],
      icon: Zap,
      accent: '#22c55e',
    },
    {
      id: 'MASTER',
      title: 'Master Mode (Cut Required)',
      tag: 'High Strategy',
      tagColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      description:
        'You cannot enter the home stretch until you have captured at least one opponent pawn. Forces aggressive and tactical combat across the common track.',
      rules: [
        'Home stretch locked until 1 capture made',
        'Safe star zones active',
        'Extra turn on 6, capture, or goal',
      ],
      icon: ShieldAlert,
      accent: '#ef4444',
    },
    {
      id: 'TEAM_UP',
      title: '2v2 Team Up Mode',
      tag: 'Co-op Battle',
      tagColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      description:
        'Red & Yellow join forces to defeat Green & Blue. Allied pawns cannot capture each other and can block enemy lanes together.',
      rules: [
        'Team Red + Yellow vs Team Green + Blue',
        'Allies cannot cut each other',
        'Team with most pawns home wins',
      ],
      icon: Users,
      accent: '#a855f7',
    },
    {
      id: 'RUSH',
      title: 'Rush Mode (No 6 to Open)',
      tag: 'Instant Action',
      tagColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      description:
        'No waiting for a 6! Any rolled number instantly moves a pawn from your home base directly onto the starting track.',
      rules: [
        'Any dice roll (1–6) unlocks pawns',
        'Non-stop action from turn 1',
        'All 4 pawns to win',
      ],
      icon: Sparkles,
      accent: '#eab308',
    },
  ];

  const handleLaunchVariant = (variantId) => {
    navigate('/computer');
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Game Variants & Custom Rules</h1>
        <p className="text-sm text-textSecondary mt-1">
          Explore exciting custom gameplay modes tailored for rapid matches, hardcore strategy, and team co-op.
        </p>
      </div>

      {/* Grid of Variants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {variants.map((v) => (
          <div
            key={v.id}
            className="bg-bgAuxiliary/80 border border-white/10 hover:border-white/20 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${v.tagColor}`}
                >
                  {v.tag}
                </span>
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shadow"
                  style={{ backgroundColor: `${v.accent}20`, color: v.accent }}
                >
                  <v.icon size={20} />
                </div>
              </div>

              <h3 className="text-xl font-bold text-white">{v.title}</h3>
              <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
                {v.description}
              </p>

              {/* Rules List */}
              <div className="p-4 bg-bgDark rounded-2xl border border-white/5 space-y-2">
                <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block">
                  Rule Specifications
                </span>
                {v.rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs text-stone-300 font-medium"
                  >
                    <Check size={14} className="text-green-400 shrink-0" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleLaunchVariant(v.id)}
              className="w-full py-3.5 rounded-2xl text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95"
              style={{
                backgroundColor: v.accent,
                boxShadow: `0 8px 20px ${v.accent}33`,
              }}
            >
              <Play size={16} /> Play {v.title.split(' ')[0]} Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
