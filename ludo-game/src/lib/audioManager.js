// Audio Manager for Pak Ludo sound effects

class AudioManager {
  constructor() {
    this.muted = localStorage.getItem('ludo_sound_muted') === 'true';
    this.volume = parseFloat(localStorage.getItem('ludo_sound_volume') || '0.7');
    this.sounds = {};
    this.initSounds();
  }

  initSounds() {
    if (typeof window === 'undefined') return;

    this.sounds = {
      dice: new Audio('/dice.mp3'),
      move: new Audio('/move.wav'),
      capture: new Audio('/capture.wav'),
      win: new Audio('/win.mp3'),
    };

    Object.values(this.sounds).forEach((audio) => {
      audio.volume = this.volume;
      audio.preload = 'auto';
    });
  }

  setMuted(muted) {
    this.muted = muted;
    localStorage.setItem('ludo_sound_muted', muted.toString());
  }

  isMuted() {
    return this.muted;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('ludo_sound_volume', this.volume.toString());
    Object.values(this.sounds).forEach((audio) => {
      audio.volume = this.volume;
    });
  }

  getVolume() {
    return this.volume;
  }

  playSound(name) {
    if (this.muted) return;
    try {
      const audio = this.sounds[name];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {
          // Autoplay policy fallback
        });
      }
    } catch {
      // Ignore audio failure
    }
  }

  playDice() {
    this.playSound('dice');
  }

  playMove() {
    this.playSound('move');
  }

  playCapture() {
    this.playSound('capture');
  }

  playWin() {
    this.playSound('win');
  }
}

export const audioManager = new AudioManager();
