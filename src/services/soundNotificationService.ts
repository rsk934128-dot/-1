/**
 * SoundNotificationService
 * 
 * High-clarity Web Audio API sound synthesis tailored for restaurant & busy kitchen environments.
 * Plays authentic acoustic kitchen service bells, bKash verification chimes, and delivery alerts.
 */

import { safeStorage } from '../utils/safeStorage';

const STORAGE_KEY_VOLUME = 'al_sheikh_sound_volume';
const STORAGE_KEY_MUTED = 'al_sheikh_sound_muted';

export interface SoundServiceState {
  volume: number;
  muted: boolean;
  isRinging?: boolean;
  ringingOrderIds?: string[];
}

class SoundNotificationServiceClass {
  private ctx: AudioContext | null = null;
  private volume: number = 0.85; // 0.0 to 1.0
  private muted: boolean = false;
  private listeners: Set<(state: SoundServiceState) => void> = new Set();

  // Repeating order ringtone state
  private ringtoneInterval: ReturnType<typeof setInterval> | null = null;
  private isRinging: boolean = false;
  private ringingOrderIds: Set<string> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const savedVol = safeStorage.getItem(STORAGE_KEY_VOLUME);
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.volume = parsed;
        }
      }

      const savedMuted = safeStorage.getItem(STORAGE_KEY_MUTED);
      if (savedMuted !== null) {
        this.muted = savedMuted === 'true';
      }

      // Auto-unlock audio on first user gesture
      const unlockAudio = () => {
        this.getOrCreateContext();
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };

      window.addEventListener('click', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
    }
  }

  /**
   * Initializes or returns the current Web Audio context safely.
   */
  private getOrCreateContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    try {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Master Gain Node helper with respect to current volume & mute settings.
   */
  private createMasterGain(ctx: AudioContext, customGainMultiplier = 1.0): GainNode {
    const gainNode = ctx.createGain();
    const effectiveGain = this.muted ? 0 : Math.max(0, Math.min(1, this.volume * customGainMultiplier));
    gainNode.gain.setValueAtTime(effectiveGain, ctx.currentTime);
    gainNode.connect(ctx.destination);
    return gainNode;
  }

  /**
   * Plays a crisp, resonant brass kitchen counter service bell ("Ding! Ding!").
   * Specially synthesized with multiple physical bell partials and high harmonics
   * so it cuts through ambient kitchen noise (oil frying, exhaust fans, chatter).
   */
  public playNewOrderBell(): void {
    if (this.muted) return;
    const ctx = this.getOrCreateContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const master = this.createMasterGain(ctx, 0.9);

      // Strike a 2-bell sequence: First Ding at t=0, Second Ding at t=0.32s
      const strikes = [0, 0.32];

      strikes.forEach((strikeDelay, strikeIdx) => {
        const strikeTime = now + strikeDelay;
        const fundamentalFreq = strikeIdx === 0 ? 1174.66 : 1318.51; // D6, then E6

        // Bell overtone partials ratios and relative decay factors (typical brass service bell modes)
        const partials = [
          { ratio: 1.0, gain: 0.55, decay: 1.4 },   // Prime / Fundamental
          { ratio: 2.0, gain: 0.35, decay: 1.1 },   // Octave
          { ratio: 2.76, gain: 0.28, decay: 0.9 },  // Tierce / minor third mode
          { ratio: 4.07, gain: 0.20, decay: 0.6 },  // Quint / fifth mode
          { ratio: 5.40, gain: 0.12, decay: 0.4 },  // High shimmer
          { ratio: 6.80, gain: 0.08, decay: 0.25 }, // Metallic strike transient
        ];

        partials.forEach(({ ratio, gain: partGain, decay }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = ratio > 4.0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(fundamentalFreq * ratio, strikeTime);

          // Fast instant attack (0.001s), exponential brass decay
          gain.gain.setValueAtTime(0, strikeTime);
          gain.gain.linearRampToValueAtTime(partGain * 0.45, strikeTime + 0.003);
          gain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + decay);

          osc.connect(gain);
          gain.connect(master);

          osc.start(strikeTime);
          osc.stop(strikeTime + decay + 0.05);
        });

        // Add a micro metallic strike click for mechanical realism
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        clickOsc.type = 'square';
        clickOsc.frequency.setValueAtTime(2400, strikeTime);
        clickGain.gain.setValueAtTime(0.15, strikeTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, strikeTime + 0.015);

        clickOsc.connect(clickGain);
        clickGain.connect(master);
        clickOsc.start(strikeTime);
        clickOsc.stop(strikeTime + 0.02);
      });
    } catch {
      // Graceful fallback if Web Audio is restricted
    }
  }

  /**
   * Plays a pleasant, bright ascending chord chime for successful bKash SMS verification.
   * Gives instant audible confirmation to kitchen & cashier staff that payment is verified.
   */
  public playBkashVerificationSuccess(): void {
    if (this.muted) return;
    const ctx = this.getOrCreateContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const master = this.createMasterGain(ctx, 0.85);

      // Cheerful ascending arpeggio (C6, E6, G6, C7) with warm bell harmonics
      const notes = [
        { freq: 1046.50, delay: 0.00, dur: 0.55 }, // C6
        { freq: 1318.51, delay: 0.10, dur: 0.65 }, // E6
        { freq: 1567.98, delay: 0.20, dur: 0.75 }, // G6
        { freq: 2093.00, delay: 0.30, dur: 1.10 }, // C7 (High bell shimmer)
      ];

      notes.forEach(({ freq, delay, dur }, idx) => {
        const noteTime = now + delay;

        // Primary tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === notes.length - 1 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.35, noteTime + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0005, noteTime + dur);

        osc.connect(gain);
        gain.connect(master);

        osc.start(noteTime);
        osc.stop(noteTime + dur + 0.05);

        // Sub-harmonic for warmth
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(freq * 0.5, noteTime);
        subGain.gain.setValueAtTime(0, noteTime);
        subGain.gain.linearRampToValueAtTime(0.12, noteTime + 0.005);
        subGain.gain.exponentialRampToValueAtTime(0.0005, noteTime + dur * 0.8);

        subOsc.connect(subGain);
        subGain.connect(master);

        subOsc.start(noteTime);
        subOsc.stop(noteTime + dur * 0.8 + 0.05);
      });
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Plays a single classic kitchen bell strike (Ding!).
   */
  public playKitchenBell(): void {
    if (this.muted) return;
    const ctx = this.getOrCreateContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const master = this.createMasterGain(ctx, 0.9);
      const fundamental = 1200;

      const partials = [
        { ratio: 1.0, gain: 0.5, decay: 1.5 },
        { ratio: 2.0, gain: 0.3, decay: 1.2 },
        { ratio: 2.76, gain: 0.25, decay: 0.9 },
        { ratio: 4.07, gain: 0.18, decay: 0.6 },
        { ratio: 5.4, gain: 0.1, decay: 0.35 }
      ];

      partials.forEach(({ ratio, gain: partGain, decay }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(fundamental * ratio, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(partGain * 0.45, now + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        osc.connect(gain);
        gain.connect(master);
        osc.start(now);
        osc.stop(now + decay + 0.05);
      });
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Plays a crisp high-tech scanner confirmation beep for QR code reading.
   */
  public playQrScanSuccess(): void {
    if (this.muted) return;
    const ctx = this.getOrCreateContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const master = this.createMasterGain(ctx, 0.85);

      // 2 quick high-pitch chirps: 1760Hz (A6) -> 2349Hz (D7)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1760, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.3, now + 0.005);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(master);
      osc1.start(now);
      osc1.stop(now + 0.09);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(2349, now + 0.08);
      gain2.gain.setValueAtTime(0, now + 0.08);
      gain2.gain.linearRampToValueAtTime(0.35, now + 0.085);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc2.connect(gain2);
      gain2.connect(master);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.24);
    } catch {
      // Graceful fallback
    }
  }

  /**
   * General pleasant notification chime (for push alerts & delivery toasts).
   */
  public playNotificationChime(): void {
    if (this.muted) return;
    const ctx = this.getOrCreateContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const master = this.createMasterGain(ctx, 0.75);
      const notes = [523.25, 659.25, 783.99, 1046.50];

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteTime = now + index * 0.10;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.25, noteTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.42);

        osc.connect(gain);
        gain.connect(master);

        osc.start(noteTime);
        osc.stop(noteTime + 0.45);
      });
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Synthesizes an authentic high-impact restaurant POS order ringtone cycle ("Ding-Dong-Chime!").
   * Repeats continuously until the hotel owner confirms the order.
   */
  public playRingtoneCycle(): void {
    if (this.muted) return;
    const ctx = this.getOrCreateContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;
      const master = this.createMasterGain(ctx, 0.95);

      // 4-Note Melodic Restaurant Order Call Arpeggio (E6, G#6, B6, E7)
      // Followed by double high-bell accent
      const notes = [
        { freq: 1318.51, delay: 0.00, dur: 0.40, type: 'triangle' as OscillatorType }, // E6
        { freq: 1661.22, delay: 0.16, dur: 0.40, type: 'triangle' as OscillatorType }, // G#6
        { freq: 1975.53, delay: 0.32, dur: 0.45, type: 'triangle' as OscillatorType }, // B6
        { freq: 2637.02, delay: 0.48, dur: 0.85, type: 'sine' as OscillatorType },     // E7 (Bright long ring)
        // High attention bell pair
        { freq: 2093.00, delay: 0.95, dur: 0.45, type: 'sine' as OscillatorType },     // C7
        { freq: 2637.02, delay: 1.15, dur: 0.70, type: 'sine' as OscillatorType },     // E7
      ];

      notes.forEach(({ freq, delay, dur, type }) => {
        const noteTime = now + delay;

        // Primary bell tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.35, noteTime + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0003, noteTime + dur);

        osc.connect(gain);
        gain.connect(master);

        osc.start(noteTime);
        osc.stop(noteTime + dur + 0.05);

        // Acoustic shimmer harmonic (1.5x / fifth)
        const harmOsc = ctx.createOscillator();
        const harmGain = ctx.createGain();
        harmOsc.type = 'sine';
        harmOsc.frequency.setValueAtTime(freq * 1.5, noteTime);

        harmGain.gain.setValueAtTime(0, noteTime);
        harmGain.gain.linearRampToValueAtTime(0.15, noteTime + 0.005);
        harmGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + (dur * 0.7));

        harmOsc.connect(harmGain);
        harmGain.connect(master);

        harmOsc.start(noteTime);
        harmOsc.stop(noteTime + (dur * 0.7) + 0.02);
      });
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Starts looping the incoming order ringtone until the hotel owner confirms the order.
   * Tracks orderId so multiple unconfirmed orders keep the ringtone active until all are confirmed.
   */
  public startOrderRingtone(orderId?: string): void {
    if (orderId) {
      this.ringingOrderIds.add(orderId);
    }

    // Auto unmute if muted or volume is low so owner doesn't miss incoming orders
    if (this.muted) {
      this.setMuted(false);
    }
    if (this.volume < 0.3) {
      this.setVolume(0.85);
    }

    if (!this.isRinging) {
      this.isRinging = true;
      // Play immediately
      this.playRingtoneCycle();

      // Loop every 1900ms
      if (this.ringtoneInterval) {
        clearInterval(this.ringtoneInterval);
      }
      this.ringtoneInterval = setInterval(() => {
        if (this.isRinging) {
          this.playRingtoneCycle();
        }
      }, 1900);
    }

    this.notifyListeners();
  }

  /**
   * Stops the order ringtone when the hotel owner confirms the order.
   * If an orderId is provided, removes it; if no more orders are pending confirmation, silences the ringtone.
   */
  public stopOrderRingtone(orderId?: string): void {
    if (orderId) {
      this.ringingOrderIds.delete(orderId);
    } else {
      this.ringingOrderIds.clear();
    }

    if (!orderId || this.ringingOrderIds.size === 0) {
      this.ringingOrderIds.clear();
      this.isRinging = false;
      if (this.ringtoneInterval) {
        clearInterval(this.ringtoneInterval);
        this.ringtoneInterval = null;
      }
    }

    this.notifyListeners();
  }

  /**
   * Temporarily silences the ringtone audio without clearing unconfirmed status.
   */
  public silenceRingtone(): void {
    this.isRinging = false;
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
    this.notifyListeners();
  }

  public isOrderRingtoneActive(): boolean {
    return this.isRinging;
  }

  public getRingingOrderIds(): string[] {
    return Array.from(this.ringingOrderIds);
  }

  /**
   * Sound test runner for settings / admin verification.
   */
  public testSound(type: 'new_order' | 'bkash_verified' | 'kitchen_bell' | 'chime' | 'order_ringtone' = 'new_order'): void {
    if (this.muted) {
      this.setMuted(false);
    }
    if (type === 'new_order') {
      this.playNewOrderBell();
    } else if (type === 'bkash_verified') {
      this.playBkashVerificationSuccess();
    } else if (type === 'kitchen_bell') {
      this.playKitchenBell();
    } else if (type === 'order_ringtone') {
      this.playRingtoneCycle();
    } else {
      this.playNotificationChime();
    }
  }

  // --- Volume & Mute Controls ---

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    safeStorage.setItem(STORAGE_KEY_VOLUME, this.volume.toString());
    this.notifyListeners();
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(isMuted: boolean): void {
    this.muted = isMuted;
    safeStorage.setItem(STORAGE_KEY_MUTED, this.muted ? 'true' : 'false');
    this.notifyListeners();
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public subscribe(callback: (state: SoundServiceState) => void): () => void {
    this.listeners.add(callback);
    callback({
      volume: this.volume,
      muted: this.muted,
      isRinging: this.isRinging,
      ringingOrderIds: Array.from(this.ringingOrderIds),
    });
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    const state: SoundServiceState = {
      volume: this.volume,
      muted: this.muted,
      isRinging: this.isRinging,
      ringingOrderIds: Array.from(this.ringingOrderIds),
    };
    this.listeners.forEach((fn) => {
      try {
        fn(state);
      } catch {}
    });
  }
}

// Export singleton instance
export const SoundNotificationService = new SoundNotificationServiceClass();
export default SoundNotificationService;
