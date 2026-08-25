import { cyberSoundtrack } from './cyberSoundtrack';

class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastChimeTime: number = 0;
  private listeners: Set<(muted: boolean) => void> = new Set();

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public subscribe(cb: (muted: boolean) => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isMuted));
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.notify();
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    this.notify();
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // =========================================================================
  // SMOOTH CINEMATIC SPIDER-VERSE DIMENSIONAL PULSE (Warm, Rich, Soft on Ears)
  // Low-pass filtered, zero piercing highs, smooth analog tape glide
  // =========================================================================
  public playStageChime(stageIndex: number = 0) {
    if (this.isMuted) return;
    const nowMs = performance.now();
    // Debounce to prevent audio stacking on high-speed scroll
    if (nowMs - this.lastChimeTime < 110) return;
    this.lastChimeTime = nowMs;

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const duration = 0.12;

      // 1. Warm Analog Low-Pass Filter (Eliminates all pointy / piercing high frequencies)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850, t);
      filter.frequency.exponentialRampToValueAtTime(220, t + duration);
      filter.Q.setValueAtTime(1.5, t);

      // 2. Smooth Dimensional Gain Envelope (Soft 8ms ease-in, gentle multiverse ripple)
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, t);
      masterGain.gain.linearRampToValueAtTime(0.045, t + 0.012);
      // Subtle organic dimension flutter (not harsh clicks)
      masterGain.gain.setValueAtTime(0.038, t + 0.035);
      masterGain.gain.setValueAtTime(0.048, t + 0.055);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      // 3. Warm Triangle Carrier (Deep, satisfying dimensional pitch sweep)
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      const stagePitchOffset = Math.min(6, Math.max(0, stageIndex)) * 8;
      osc.frequency.setValueAtTime(420 + stagePitchOffset, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + duration);

      // 4. Subtle Sub-Bass Dimension Underlay (Adds rich weight to the transition)
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(85, t);
      subOsc.frequency.exponentialRampToValueAtTime(42, t + duration);

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.035, t);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(filter);
      subOsc.connect(subGain);
      subGain.connect(masterGain);

      // Instant Cleanup on completion
      osc.onended = () => {
        try {
          osc.disconnect();
          subOsc.disconnect();
          subGain.disconnect();
          filter.disconnect();
          masterGain.disconnect();
        } catch {
          // Nodes may already be disconnected when the browser suspends audio.
        }
      };

      osc.start(t);
      osc.stop(t + duration);
      subOsc.start(t);
      subOsc.stop(t + duration);
    } catch {
      // Audio context silenced or blocked
    }
  }

  // =========================================================================
  // CINEMATIC INTRO PORTAL SOUND (Ascending Ethereal F# Maj9 / B Maj9 Warp Bloom)
  // Plays a distinct, soothing cyberpunk chord when entering the site
  // =========================================================================
  public playIntroPortalSound() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const duration = 1.6;

      // 1. Master Output Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, t);
      masterGain.gain.linearRampToValueAtTime(0.2, t + 0.08);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      masterGain.connect(ctx.destination);

      // 2. Spatial Delay Unit with Warm Filter
      const delay = ctx.createDelay();
      delay.delayTime.setValueAtTime(0.26, t);
      const delayFeedback = ctx.createGain();
      delayFeedback.gain.setValueAtTime(0.42, t);
      const delayFilter = ctx.createBiquadFilter();
      delayFilter.type = 'lowpass';
      delayFilter.frequency.setValueAtTime(1600, t);

      delay.connect(delayFilter);
      delayFilter.connect(delayFeedback);
      delayFeedback.connect(delay);
      delayFeedback.connect(masterGain);

      // 3. Ascending Ethereal F# Major 9th Arpeggio Chords (F#3, C#4, F#4, A#4, C#5, F#5, G#5)
      const chordMidi = [54, 61, 66, 70, 73, 78, 80];
      chordMidi.forEach((midi, i) => {
        const freq = 440 * Math.pow(2, (midi - 69) / 12);
        const osc = ctx.createOscillator();
        const subHarmonic = ctx.createOscillator();
        const noteGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        const noteStart = t + i * 0.045;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        subHarmonic.type = 'triangle';
        subHarmonic.frequency.setValueAtTime(freq * 1.002, noteStart);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(950, noteStart);
        filter.frequency.exponentialRampToValueAtTime(3400, noteStart + 0.18);
        filter.frequency.exponentialRampToValueAtTime(700, noteStart + duration);
        filter.Q.setValueAtTime(1.1, noteStart);

        noteGain.gain.setValueAtTime(0.0001, noteStart);
        noteGain.gain.linearRampToValueAtTime(0.052, noteStart + 0.025);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 1.1);

        osc.connect(filter);
        subHarmonic.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(masterGain);
        noteGain.connect(delay);

        osc.start(noteStart);
        subHarmonic.start(noteStart);
        osc.stop(noteStart + 1.2);
        subHarmonic.stop(noteStart + 1.2);
      });

      // 4. Warm Sub-Bass Gravity Swell
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(116, t);
      subOsc.frequency.exponentialRampToValueAtTime(46, t + 0.5);

      subGain.gain.setValueAtTime(0.001, t);
      subGain.gain.linearRampToValueAtTime(0.14, t + 0.06);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);

      subOsc.connect(subGain);
      subGain.connect(masterGain);

      subOsc.start(t);
      subOsc.stop(t + 0.95);
    } catch {
      // Audio context silenced or blocked
    }
  }

  // Backward compatibility alias for transition triggers
  public playGlitchTransition(stageIndex: number = 0) {
    this.playStageChime(stageIndex);
  }

  // Single Clean Windows XP Ding
  public playXPDing() {
    this.playStageChime(0);
  }

  // XP Click / Dialog open sound
  public playXPClick() {
    this.playStageChime(0);
  }

  // Time Travel / Road Warp Zoom whoosh
  public playWarp() {
    this.playStageChime(0);
  }
}

export const retroAudio = new RetroAudioEngine();
export { cyberSoundtrack };
