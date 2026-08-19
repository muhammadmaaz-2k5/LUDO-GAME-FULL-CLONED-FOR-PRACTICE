import { useState } from 'react';
import { MessageSquare, Send, Smile, Sparkles } from 'lucide-react';

const QUICK_EMOJIS = ['🎲', '🔥', '👏', '🎯', '👑', '😭', '😎', '🚀'];

export function GameChat({
  logs = [],
  reactions = [],
  onSendReaction,
  onSendMessage,
}) {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState('reactions'); // 'reactions' | 'logs'

  const handleSubmitMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage?.(inputText.trim());
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full bg-bgAuxiliary/80 backdrop-blur border border-white/10 rounded-2xl p-4 shadow-xl">
      {/* Tab Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('reactions')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'reactions'
                ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                : 'text-textSecondary hover:text-white'
            }`}
          >
            Reactions
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'logs'
                ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                : 'text-textSecondary hover:text-white'
            }`}
          >
            Match Log
          </button>
        </div>
        <span className="text-[11px] text-textSecondary flex items-center gap-1 font-mono">
          <MessageSquare size={12} /> Live
        </span>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 min-h-[160px] max-h-[220px] overflow-y-auto pr-1 space-y-2">
        {activeTab === 'reactions' ? (
          <div>
            <p className="text-xs text-textSecondary mb-2 font-medium">
              Tap to send live reaction:
            </p>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onSendReaction?.(emoji)}
                  className="h-10 text-xl bg-bgDark hover:bg-stone-700/80 rounded-xl border border-white/5 transition-all transform hover:scale-110 active:scale-90 flex items-center justify-center shadow"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Recent floating reactions stream */}
            {reactions.length > 0 && (
              <div className="mt-3 pt-2 border-t border-white/5 space-y-1">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                  Recent Reactions
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {reactions.slice(-6).map((r, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-lg bg-stone-800 text-xs border border-white/10 flex items-center gap-1 animate-in zoom-in-50"
                    >
                      <span className="font-semibold text-[11px] text-textSecondary">
                        {r.sender}:
                      </span>
                      <span className="text-sm">{r.emoji}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1.5 font-mono text-xs">
            {logs.length === 0 ? (
              <p className="text-stone-500 text-center py-6">No game moves yet</p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-1.5 rounded text-[11px] leading-tight ${
                    log.type === 'capture'
                      ? 'bg-red-500/10 text-red-300 border-l-2 border-red-500'
                      : log.type === 'win'
                      ? 'bg-yellow-500/10 text-yellow-300 border-l-2 border-yellow-500 font-bold'
                      : log.type === 'extra'
                      ? 'bg-green-500/10 text-green-300'
                      : 'text-stone-300'
                  }`}
                >
                  <span className="text-stone-500 text-[10px] mr-1">
                    #{index + 1}
                  </span>
                  {log.text}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* In-game text chat input */}
      <form onSubmit={handleSubmitMessage} className="mt-3 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Send match message..."
          className="flex-1 bg-bgDark border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-green-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 rounded-xl bg-green-600 hover:bg-green-500 text-white disabled:opacity-40 transition-all flex items-center justify-center shadow"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
