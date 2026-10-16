/**
 * Hotel Al Sheikh Farid - Web Audio Ringtone & Telephony Synthesizer
 * Provides authentic, zero-dependency, crystal-clear ringtones for incoming
 * and outgoing customer <-> hotel owner audio & video calls.
 */

class RingtoneService {
  private audioCtx: AudioContext | null = null;
  private ringInterval: any = null;
  private vibrateInterval: any = null;
  private activeOscillators: OscillatorNode[] = [];
  private activeGainNodes: GainNode[] = [];
  private isMuted: boolean = false;

  private getAudioContext(): AudioContext | null {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return null;
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  /**
   * Plays realistic incoming call ringtone (Melodic bell cadence)
   * Rings repeatedly until stopped.
   */
  startIncomingRingtone(volume: number = 0.7) {
    this.stop();
    if (this.isMuted) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    const playMelodicRing = () => {
      if (this.isMuted) return;
      try {
        const now = ctx.currentTime;
        // Melodic sequence: E5 (659Hz), G#5 (830Hz), B5 (987Hz), E6 (1318Hz)
        const notes = [
          { freq: 659.25, time: 0.0, dur: 0.22 },
          { freq: 830.61, time: 0.24, dur: 0.22 },
          { freq: 987.77, time: 0.48, dur: 0.22 },
          { freq: 1318.51, time: 0.72, dur: 0.38 },
          { freq: 987.77, time: 1.15, dur: 0.20 },
          { freq: 1318.51, time: 1.38, dur: 0.45 },
        ];

        notes.forEach(({ freq, time, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + time);

          // Harmonic layer for warm bell presence
          const harm = ctx.createOscillator();
          const harmGain = ctx.createGain();
          harm.type = 'triangle';
          harm.frequency.setValueAtTime(freq * 2, now + time);

          // Attack - Decay envelope
          gain.gain.setValueAtTime(0.001, now + time);
          gain.gain.exponentialRampToValueAtTime(volume, now + time + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

          harmGain.gain.setValueAtTime(0.001, now + time);
          harmGain.gain.exponentialRampToValueAtTime(volume * 0.35, now + time + 0.03);
          harmGain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

          osc.connect(gain);
          harm.connect(harmGain);
          gain.connect(ctx.destination);
          harmGain.connect(ctx.destination);

          osc.start(now + time);
          osc.stop(now + time + dur + 0.05);
          harm.start(now + time);
          harm.stop(now + time + dur + 0.05);

          this.activeOscillators.push(osc, harm);
          this.activeGainNodes.push(gain, harmGain);
        });

        // Trigger phone vibration if on mobile
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([400, 200, 400, 200, 800]);
        }
      } catch (err) {
        console.warn('Ringtone synthesis notice:', err);
      }
    };

    // Play immediately, then repeat every 3.2 seconds
    playMelodicRing();
    this.ringInterval = setInterval(playMelodicRing, 3200);

    // Continuous mobile vibration cadence
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      this.vibrateInterval = setInterval(() => {
        try {
          navigator.vibrate([400, 200, 400, 200, 800]);
        } catch {}
      }, 3200);
    }
  }

  /**
   * Outgoing ringback tone: 440Hz + 480Hz dual tone (Telephone "tuu... tuu..." sound)
   */
  startOutgoingRing(volume: number = 0.4) {
    this.stop();
    if (this.isMuted) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    const playRingback = () => {
      if (this.isMuted) return;
      try {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(480, now);

        // 1.4s ring, 2.6s silence
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.08);
        gain.gain.setValueAtTime(volume, now + 1.4);
        gain.gain.linearRampToValueAtTime(0.001, now + 1.48);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 1.5);
        osc2.start(now);
        osc2.stop(now + 1.5);

        this.activeOscillators.push(osc1, osc2);
        this.activeGainNodes.push(gain);
      } catch (err) {
        console.warn('Outgoing ringback notice:', err);
      }
    };

    playRingback();
    this.ringInterval = setInterval(playRingback, 4000);
  }

  /**
   * Sound played when call is connected/answered (Positive two-tone chime)
   */
  playCallConnected() {
    this.stop();
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      [587.33, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0.001, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.5, now + i * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.3);
      });
    } catch {}
  }

  /**
   * Sound played when call is ended/declined (Three descending beeps)
   */
  playCallEnded() {
    this.stop();
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      [480, 420, 360].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0.001, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.4, now + i * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.12);
      });
    } catch {}
  }

  /**
   * Stop ringtone and vibrations immediately
   */
  stop() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
    if (this.vibrateInterval) {
      clearInterval(this.vibrateInterval);
      this.vibrateInterval = null;
    }

    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeOscillators = [];

    this.activeGainNodes.forEach((gain) => {
      try {
        gain.disconnect();
      } catch {}
    });
    this.activeGainNodes = [];

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(0);
      } catch {}
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  getIsMuted(): boolean {
    return this.isMuted;
  }
}

export const ringtoneService = new RingtoneService();
