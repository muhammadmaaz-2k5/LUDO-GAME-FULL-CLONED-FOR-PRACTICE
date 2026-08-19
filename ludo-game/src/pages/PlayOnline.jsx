import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  PlusCircle,
  LogIn,
  Coins,
  Shield,
  Loader2,
  Copy,
  Check,
  Zap,
  Play,
} from 'lucide-react';
import { useLudoGameStore } from '../store/useLudoGameStore';
import { ErrorBanner } from '../components/common/ErrorBanner';

export default function PlayOnline() {
  const navigate = useNavigate();
  const {
    initSocket,
    joinQueue,
    leaveQueue,
    createRoom,
    joinRoom,
    isSearching,
    createdRoom,
    activeGame,
    isLoading,
    error,
  } = useLudoGameStore();

  const [activeTab, setActiveTab] = useState('matchmaking');
  const [selectedMode, setSelectedMode] = useState('CLASSIC');
  const [playerCount, setPlayerCount] = useState(2); // Default to 2 players for quick 1v1 battle
  const [entryFee, setEntryFee] = useState(500);

  const [joinCode, setJoinCode] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    initSocket();
  }, [initSocket]);

  // Navigate to live game when activeGame starts
  useEffect(() => {
    if (activeGame && activeGame.status === 'IN_PROGRESS') {
      navigate('/computer');
    }
  }, [activeGame, navigate]);

  const handleStartSearch = () => {
    joinQueue(selectedMode, playerCount);
  };

  const handleCancelSearch = () => {
    leaveQueue();
  };

  const handleCreateRoom = () => {
    createRoom({
      mode: selectedMode,
      isPrivate,
      maxPlayers: playerCount,
      entryFee,
    });
  };

  const handleCopyCode = () => {
    if (createdRoom?.roomCode) {
      navigator.clipboard.writeText(createdRoom.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoinWithCode = (e) => {
    e.preventDefault();
    if (joinCode.trim().length >= 4) {
      joinRoom(joinCode.trim());
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Play Online</h1>
          <p className="text-sm text-textSecondary mt-1">
            Real-time multiplayer lobbies & private room matchmaking
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-bgAuxiliary p-1 rounded-2xl border border-white/10 shadow">
          <button
            onClick={() => setActiveTab('matchmaking')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'matchmaking'
                ? 'bg-green-600 text-white shadow'
                : 'text-textSecondary hover:text-white'
            }`}
          >
            Quick Matchmaking
          </button>
          <button
            onClick={() => setActiveTab('custom-rooms')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'custom-rooms'
                ? 'bg-green-600 text-white shadow'
                : 'text-textSecondary hover:text-white'
            }`}
          >
            Custom Rooms
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {activeTab === 'matchmaking' ? (
        /* Quick Matchmaking Panel */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-bgAuxiliary/70 border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
            {/* Mode selection */}
            <div>
              <label className="text-xs font-bold text-textSecondary uppercase tracking-wider block mb-2">
                1. Select Game Mode
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'CLASSIC', name: 'Classic', desc: 'Standard 4 pawns' },
                  { id: 'QUICK', name: 'Quick', desc: '2 pawns to win' },
                  { id: 'MASTER', name: 'Master', desc: 'Cut required' },
                  { id: 'TEAM_UP', name: '2v2 Team', desc: 'Allied colors' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      selectedMode === mode.id
                        ? 'bg-green-600/20 border-green-500 text-white shadow-lg shadow-green-500/10'
                        : 'bg-bgDark/60 border-white/5 text-textSecondary hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{mode.name}</div>
                    <div className="text-[10px] text-textSecondary mt-0.5">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Players */}
            <div>
              <label className="text-xs font-bold text-textSecondary uppercase tracking-wider block mb-2">
                2. Player Count
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[2, 4].map((count) => (
                  <button
                    key={count}
                    onClick={() => setPlayerCount(count)}
                    className={`py-3 rounded-2xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
                      playerCount === count
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                        : 'bg-bgDark/60 border-white/5 text-textSecondary hover:text-white'
                    }`}
                  >
                    <Users size={16} /> {count} Players Battle
                  </button>
                ))}
              </div>
            </div>

            {/* Entry Fee / Bet */}
            <div>
              <label className="text-xs font-bold text-textSecondary uppercase tracking-wider block mb-2">
                3. Entry Coins Stake
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[100, 500, 1000].map((fee) => (
                  <button
                    key={fee}
                    onClick={() => setEntryFee(fee)}
                    className={`py-3 rounded-2xl font-bold text-xs border flex items-center justify-center gap-1.5 transition-all ${
                      entryFee === fee
                        ? 'bg-amber-500/20 text-yellow-300 border-yellow-400 shadow'
                        : 'bg-bgDark/60 border-white/5 text-textSecondary hover:text-white'
                    }`}
                  >
                    <Coins size={14} className="text-yellow-400" /> {fee} Coins
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Match Status & Search Trigger */}
          <div className="lg:col-span-5 bg-bgAuxiliary/70 border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between items-center text-center relative overflow-hidden">
            {isSearching ? (
              <div className="my-auto space-y-6 w-full animate-in fade-in">
                {/* Radar Searching Animation */}
                <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-green-500/30 animate-ping" />
                  <div className="absolute inset-4 rounded-full border border-green-500/50 animate-pulse" />
                  <div className="w-16 h-16 rounded-full bg-green-600/30 border border-green-400 flex items-center justify-center text-green-400 shadow-xl">
                    <Loader2 size={30} className="animate-spin" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Searching for Opponents...</h3>
                  <p className="text-xs text-green-400 font-mono font-bold">
                    Queue: {selectedMode} ({playerCount} Players)
                  </p>
                </div>

                <button
                  onClick={handleCancelSearch}
                  className="w-full py-3 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 font-bold text-xs transition-all"
                >
                  Cancel Matchmaking
                </button>
              </div>
            ) : (
              <div className="my-auto space-y-6 w-full">
                <div className="w-20 h-20 rounded-3xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 mx-auto shadow-lg">
                  <Zap size={36} />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-black text-white">{playerCount} Player Battle</h3>
                  <p className="text-xs text-textSecondary max-w-xs mx-auto">
                    Prize Pool: <span className="text-yellow-400 font-bold">{entryFee * playerCount} Coins</span>
                  </p>
                </div>

                <button
                  onClick={handleStartSearch}
                  className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-extrabold text-sm shadow-xl shadow-green-600/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Play size={18} /> Find {playerCount}-Player Match
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Custom Rooms Panel */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Room */}
          <div className="bg-bgAuxiliary/70 border border-white/10 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <PlusCircle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Create Private Room</h3>
                <p className="text-xs text-textSecondary">
                  Play with friends using a 6-character room code
                </p>
              </div>
            </div>

            {createdRoom ? (
              <div className="p-5 bg-bgDark rounded-2xl border border-white/10 text-center space-y-4">
                <p className="text-xs text-textSecondary uppercase font-bold">
                  Your Room Code
                </p>
                <div className="text-3xl font-mono font-black text-yellow-400 tracking-widest bg-stone-900 py-3 rounded-xl border border-white/10">
                  {createdRoom.roomCode}
                </div>

                <button
                  onClick={handleCopyCode}
                  className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs border border-white/10 flex items-center justify-center gap-2 transition-all"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  {copied ? 'Code Copied!' : 'Copy Invitation Code'}
                </button>

                <button
                  onClick={() => navigate('/computer')}
                  className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs shadow-lg transition-all"
                >
                  Enter Room Arena
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-bgDark rounded-xl border border-white/5">
                  <span className="text-xs font-bold text-white">Private Room (Invite Only)</span>
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="w-4 h-4 accent-green-500 cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleCreateRoom}
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
                  Generate Custom Room
                </button>
              </div>
            )}
          </div>

          {/* Join Room by Code */}
          <div className="bg-bgAuxiliary/70 border border-white/10 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <LogIn size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Join Existing Room</h3>
                <p className="text-xs text-textSecondary">
                  Enter code shared by a friend
                </p>
              </div>
            </div>

            <form onSubmit={handleJoinWithCode} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-textSecondary uppercase tracking-wider block mb-2">
                  Enter 6-Letter Room Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. PK7749"
                  className="w-full bg-bgDark border border-white/10 rounded-2xl py-3 px-4 text-lg font-mono font-bold text-white text-center tracking-widest placeholder-stone-600 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={joinCode.trim().length < 4 || isLoading}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                Join Room
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
