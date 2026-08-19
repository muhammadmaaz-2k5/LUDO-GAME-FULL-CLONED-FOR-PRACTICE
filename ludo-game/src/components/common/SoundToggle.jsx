import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { audioManager } from '../../lib/audioManager';

export function SoundToggle({ className = '' }) {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(audioManager.isMuted());
  }, []);

  const toggleSound = () => {
    const nextMuted = !muted;
    audioManager.setMuted(nextMuted);
    setMuted(nextMuted);
  };

  return (
    <button
      onClick={toggleSound}
      title={muted ? 'Unmute Game Sounds' : 'Mute Game Sounds'}
      aria-label="Sound Toggle"
      className={`p-2.5 rounded-xl border border-white/10 bg-bgAuxiliary hover:bg-stone-800 text-textSecondary hover:text-white transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center ${className}`}
    >
      {muted ? (
        <VolumeX className="w-5 h-5 text-red-400" />
      ) : (
        <Volume2 className="w-5 h-5 text-green-400" />
      )}
    </button>
  );
}
