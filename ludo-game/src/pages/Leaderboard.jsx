import { useState, useEffect } from 'react';
import { Trophy, Medal, Search, Flame, Crown, Globe, Users, RefreshCw } from 'lucide-react';
import { useLeaderboardStore } from '../store/useLeaderboardStore';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBanner } from '../components/common/ErrorBanner';

export default function Leaderboard() {
  const { leaderboard, isLoading, error, fetchLeaderboard } = useLeaderboardStore();
  const [activeTab, setActiveTab] = useState('global');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const filteredData = (leaderboard || []).filter((player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Global Leaderboard</h1>
          <p className="text-sm text-textSecondary mt-1">
            Top ranked Pak Ludo players based on competitive ELO rating
          </p>
        </div>

        {/* Tab Switcher & Refresh */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchLeaderboard()}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-bgAuxiliary border border-white/10 text-stone-300 hover:text-white transition-all shadow"
            title="Refresh Leaderboard"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <div className="flex bg-bgAuxiliary p-1 rounded-2xl border border-white/10 shadow">
            <button
              onClick={() => setActiveTab('global')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'global'
                  ? 'bg-green-600 text-white shadow'
                  : 'text-textSecondary hover:text-white'
              }`}
            >
              <Globe size={14} /> Global
            </button>
            <button
              onClick={() => setActiveTab('national')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'national'
                  ? 'bg-green-600 text-white shadow'
                  : 'text-textSecondary hover:text-white'
              }`}
            >
              🇵🇰 Pakistan
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'friends'
                  ? 'bg-green-600 text-white shadow'
                  : 'text-textSecondary hover:text-white'
              }`}
            >
              <Users size={14} /> Friends
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {isLoading ? (
        <LoadingSpinner text="Fetching live leaderboard rankings..." className="py-16" />
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          {filteredData.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* Rank 2 (Silver) */}
              <div className="bg-bgAuxiliary/80 border border-white/10 rounded-3xl p-6 shadow-xl text-center space-y-3 order-2 md:order-1">
                <div className="w-16 h-16 rounded-2xl bg-stone-300 text-stone-950 font-black text-2xl flex items-center justify-center mx-auto shadow-lg">
                  #2
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {filteredData[1].name}
                  </h3>
                  <p className="text-xs text-textSecondary">{filteredData[1].badge}</p>
                </div>
                <div className="p-3 bg-bgDark rounded-2xl border border-white/5 space-y-1">
                  <span className="text-lg font-extrabold text-white">
                    {filteredData[1].rating} ELO
                  </span>
                  <p className="text-[11px] text-green-400">
                    Win Rate: {filteredData[1].winRate}
                  </p>
                </div>
              </div>

              {/* Rank 1 (Gold - Elevated) */}
              <div className="bg-gradient-to-b from-yellow-500/20 via-bgAuxiliary to-bgAuxiliary border-2 border-yellow-400/60 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-3 order-1 md:order-2 md:-translate-y-4">
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-yellow-400 to-amber-500 text-stone-950 font-black text-3xl flex items-center justify-center mx-auto shadow-xl shadow-yellow-500/30 animate-pulse">
                  <Crown size={32} className="text-stone-950" />
                  <span className="absolute -bottom-2 px-2 py-0.5 bg-stone-950 text-yellow-400 text-[10px] font-extrabold rounded-full border border-yellow-400">
                    #1 CHAMPION
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {filteredData[0].name}
                  </h3>
                  <p className="text-xs text-yellow-400 font-bold">
                    {filteredData[0].badge}
                  </p>
                </div>
                <div className="p-3 bg-bgDark/90 rounded-2xl border border-yellow-400/20 space-y-1">
                  <span className="text-2xl font-black text-yellow-300">
                    {filteredData[0].rating} ELO
                  </span>
                  <p className="text-xs text-green-400 font-bold">
                    Win Rate: {filteredData[0].winRate} • {filteredData[0].coins} Coins
                  </p>
                </div>
              </div>

              {/* Rank 3 (Bronze) */}
              <div className="bg-bgAuxiliary/80 border border-white/10 rounded-3xl p-6 shadow-xl text-center space-y-3 order-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-700 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg">
                  #3
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {filteredData[2].name}
                  </h3>
                  <p className="text-xs text-textSecondary">{filteredData[2].badge}</p>
                </div>
                <div className="p-3 bg-bgDark rounded-2xl border border-white/5 space-y-1">
                  <span className="text-lg font-extrabold text-white">
                    {filteredData[2].rating} ELO
                  </span>
                  <p className="text-[11px] text-green-400">
                    Win Rate: {filteredData[2].winRate}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rankings Table & Search Filter */}
          <div className="bg-bgAuxiliary/80 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-white">Global Player Standings</h3>

              {/* Search Input */}
              <div className="relative w-full max-w-xs">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search player name..."
                  className="w-full bg-bgDark border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-textSecondary uppercase tracking-wider font-bold">
                    <th className="pb-3 px-3">Rank</th>
                    <th className="pb-3 px-3">Player</th>
                    <th className="pb-3 px-3">Tier</th>
                    <th className="pb-3 px-3 text-right">Rating</th>
                    <th className="pb-3 px-3 text-right">Win Rate</th>
                    <th className="pb-3 px-3 text-right">Matches</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {filteredData.map((player) => (
                    <tr
                      key={player.rank}
                      className="hover:bg-stone-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-3 font-mono font-bold text-stone-400">
                        #{player.rank}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-white">
                        {player.name}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-white/10 font-bold">
                          {player.badge}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-yellow-400 font-mono">
                        {player.rating}
                      </td>
                      <td className="py-3.5 px-3 text-right text-green-400 font-bold">
                        {player.winRate}
                      </td>
                      <td className="py-3.5 px-3 text-right text-textSecondary font-mono">
                        {player.games}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
