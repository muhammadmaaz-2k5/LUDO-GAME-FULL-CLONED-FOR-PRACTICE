import { useState } from 'react';
import { Trophy, Award, Clock, Users, Coins, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Tournaments() {
  const navigate = useNavigate();
  const [registeredIds, setRegisteredIds] = useState([]);

  const tournaments = [
    {
      id: 'tourney_1',
      title: 'Grand Pakistan Championship',
      badge: 'Major Tournament',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      prize: 10000,
      entryFee: 1000,
      slotsTotal: 16,
      slotsFilled: 12,
      startTime: 'In 25 mins',
      format: '16-Player Knockout',
    },
    {
      id: 'tourney_2',
      title: 'Weekend Rapid Blitz',
      badge: 'Fast Pace',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      prize: 4000,
      entryFee: 500,
      slotsTotal: 8,
      slotsFilled: 7,
      startTime: 'In 6 mins',
      format: '8-Player Knockout',
    },
    {
      id: 'tourney_3',
      title: 'Daily High Rollers Cup',
      badge: 'High Stakes',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      prize: 25000,
      entryFee: 2500,
      slotsTotal: 16,
      slotsFilled: 15,
      startTime: 'In 1 hour',
      format: '16-Player Knockout',
    },
  ];

  const handleRegister = (id) => {
    if (!registeredIds.includes(id)) {
      setRegisteredIds((prev) => [...prev, id]);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/60 via-bgAuxiliary to-bgDark border border-amber-500/20 p-6 sm:p-8 shadow-2xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Trophy size={14} /> Competitive Circuit
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Pak Ludo Tournaments
          </h1>
          <p className="text-xs sm:text-sm text-textSecondary max-w-lg">
            Enter structured knockout brackets, eliminate opponents round by round, and take home massive coin prize pools!
          </p>
        </div>

        <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
          <Award size={42} />
        </div>
      </div>

      {/* Tournament Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tournaments.map((t) => {
          const isRegistered = registeredIds.includes(t.id);
          const percentFilled = Math.round((t.slotsFilled / t.slotsTotal) * 100);

          return (
            <div
              key={t.id}
              className="bg-bgAuxiliary/80 border border-white/10 hover:border-amber-500/40 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${t.badgeColor}`}
                  >
                    {t.badge}
                  </span>
                  <span className="text-xs text-textSecondary flex items-center gap-1 font-mono">
                    <Clock size={13} /> {t.startTime}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">
                  {t.title}
                </h3>
                <p className="text-xs text-textSecondary">{t.format}</p>

                {/* Prize Pool Info */}
                <div className="p-3.5 bg-bgDark/80 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-textSecondary">Total Prize Pool:</span>
                    <span className="font-extrabold text-yellow-400 flex items-center gap-1">
                      <Coins size={14} /> {t.prize.toLocaleString()} Coins
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-textSecondary">Entry Ticket:</span>
                    <span className="font-bold text-white">
                      {t.entryFee.toLocaleString()} Coins
                    </span>
                  </div>
                </div>

                {/* Progress bar for slots */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium text-textSecondary">
                    <span>Registered Players</span>
                    <span className="text-white font-bold">
                      {isRegistered ? t.slotsFilled + 1 : t.slotsFilled} / {t.slotsTotal}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-bgDark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                      style={{ width: `${percentFilled}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => handleRegister(t.id)}
                disabled={isRegistered}
                className={`w-full py-3 rounded-2xl font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
                  isRegistered
                    ? 'bg-green-600/20 text-green-400 border border-green-500/30 cursor-default'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20 active:scale-95'
                }`}
              >
                {isRegistered ? (
                  <>
                    <CheckCircle2 size={16} /> Registered! Awaiting Start
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> Register ({t.entryFee} Coins)
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Interactive Bracket Visualizer Preview */}
      <div className="bg-bgAuxiliary/60 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy size={18} className="text-yellow-400" />
              Tournament Knockout Bracket Structure
            </h2>
            <p className="text-xs text-textSecondary mt-0.5">
              Live progression from Quarter-Finals to Champion Podium
            </p>
          </div>
        </div>

        {/* 8-Player Bracket Diagram */}
        <div className="grid grid-cols-3 gap-4 font-mono text-xs overflow-x-auto py-2">
          {/* Column 1: Quarter Finals */}
          <div className="space-y-4">
            <span className="text-textSecondary uppercase text-[10px] font-bold">
              Quarter-Finals (Round 1)
            </span>
            <div className="p-3 bg-bgDark rounded-xl border border-white/10 space-y-1.5">
              <div className="flex justify-between text-white font-bold">
                <span>Player_Red</span> <span className="text-green-400">WIN</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Player_Green</span> <span>ELIM</span>
              </div>
            </div>

            <div className="p-3 bg-bgDark rounded-xl border border-white/10 space-y-1.5">
              <div className="flex justify-between text-white font-bold">
                <span>Sara_99</span> <span className="text-green-400">WIN</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Tariq_Pro</span> <span>ELIM</span>
              </div>
            </div>
          </div>

          {/* Column 2: Semi Finals */}
          <div className="space-y-4 pt-6">
            <span className="text-textSecondary uppercase text-[10px] font-bold">
              Semi-Finals
            </span>
            <div className="p-3 bg-bgDark rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-1.5">
              <div className="flex justify-between text-yellow-300 font-bold">
                <span>Player_Red</span> <span>VS</span>
              </div>
              <div className="flex justify-between text-yellow-300 font-bold">
                <span>Sara_99</span> <span>(Live)</span>
              </div>
            </div>
          </div>

          {/* Column 3: Grand Final */}
          <div className="space-y-4 pt-12">
            <span className="text-amber-400 uppercase text-[10px] font-bold flex items-center gap-1">
              <Trophy size={12} /> Grand Final
            </span>
            <div className="p-4 bg-gradient-to-br from-amber-500/20 to-yellow-500/10 rounded-2xl border-2 border-yellow-400/50 text-center space-y-1">
              <span className="text-xs font-bold text-white">Championship Arena</span>
              <p className="text-[11px] text-yellow-400 font-bold">10,000 Coins Prize</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
