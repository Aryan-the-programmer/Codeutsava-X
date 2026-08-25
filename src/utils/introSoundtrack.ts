// =========================================================================
// PROCEDURAL INTRO AMBIENT SOUNDTRACK ENGINE
// Ethereal Startup Atmosphere | Harmonic Key: F# Minor 9th
// 100% Offline Web Audio API | Zero Audio File Overhead | 92 BPM
// =========================================================================

class IntroSoundtrackEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private currentStep: number = 0;
  private timerId: number | null = null;
  private nextStepTime: number = 0;
  private tempo: number = 92; // Atmospheric, spacious dreamscape tempo
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private listeners: Set<(playing: boolean) => void> = new Set();

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.setupAudioGraph();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private setupAudioGraph() {
    if (!this.ctx) return;

    // 1. Transparent Warm Compressor
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-26, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(20, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(3.2, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.03, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.4, this.ctx.currentTime);

    // 2. Master Soft Volume Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    // 3. Ethereal Stereo Tape Delay Line
    this.delayNode = this.ctx.createDelay();
    this.delayNode.delayTime.setValueAtTime((60 / this.tempo) * 0.75, this.ctx.currentTime);

    this.delayFeedback = this.ctx.createGain();
    this.delayFeedback.gain.setValueAtTime(0.45, this.ctx.currentTime);

    const delayFilter = this.ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    delayFilter.Q.setValueAtTime(0.7, this.ctx.currentTime);

    this.delayNode.connect(delayFilter);
    delayFilter.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayFeedback.connect(this.compressor);

    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  public subscribe(cb: (playing: boolean) => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb(!this.isMuted));
  }

  public getIsPlaying(): boolean {
    return !this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.start(true);
    } else {
      this.pause();
    }
    this.notify();
    return this.isMuted;
  }

  public start(fromBeginning: boolean = true) {
    const ctx = this.getContext();
    if (!ctx) return;

    this.isMuted = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }

    this.isPlaying = true;
    if (fromBeginning) {
      this.currentStep = 0;
    }
    this.nextStepTime = ctx.currentTime + 0.02;

    // Gentle fade-in
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 0.5);
    }

    this.scheduleLoop();
    this.notify();
  }

  public pause() {
    if (!this.isPlaying) return;
    const ctx = this.getContext();
    if (ctx && this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
    }
    setTimeout(() => {
      this.isPlaying = false;
      this.currentStep = 0;
      if (this.timerId !== null) {
        window.clearTimeout(this.timerId);
        this.timerId = null;
      }
      this.notify();
    }, 300);
  }

  public fadeOutAndStop(duration: number = 0.5) {
    if (!this.isPlaying) return;
    const ctx = this.getContext();
    if (ctx && this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + duration);
    }
    setTimeout(() => {
      this.isPlaying = false;
      this.currentStep = 0;
      if (this.timerId !== null) {
        window.clearTimeout(this.timerId);
        this.timerId = null;
      }
      this.notify();
    }, duration * 1000 + 50);
  }

  private scheduleLoop = () => {
    if (!this.isPlaying || !this.ctx) return;

    const secondsPer16th = 60 / this.tempo / 4;
    const lookAhead = 0.15;

    while (this.nextStepTime < this.ctx.currentTime + lookAhead) {
      this.playStep(this.currentStep % 64, this.nextStepTime);
      this.nextStepTime += secondsPer16th;
      this.currentStep = (this.currentStep + 1) % 64;
    }

    this.timerId = window.setTimeout(this.scheduleLoop, 35);
  };

  // =========================================================================
  // STEP SEQUENCER: 64 STEPS (4 BARS AT 92 BPM)
  // Harmonic Progression: F#m9 -> Dmaj7 -> Esus2 -> C#m7
  // =========================================================================
  private playStep(step: number, time: number) {
    if (!this.ctx || !this.compressor) return;

    const bar = Math.floor(step / 16);
    const barStep = step % 16;
    const stepDuration = 60 / this.tempo / 4;

    // 1. ETHEREAL AMBIENT PAD SWELL (Bar onset)
    if (barStep === 0) {
      this.triggerIntroPadChord(time, bar, stepDuration * 15.5);
    }

    // 2. WARM, DEEP ANALOG SUB-BASS (F# -> D -> E -> C#)
    if (barStep === 0 || barStep === 6 || barStep === 10) {
      const bassNote = this.getIntroBassNote(bar, barStep);
      this.triggerWarmSubBass(time, bassNote, stepDuration * 3.8);
    }

    // 3. MINIMAL AIR PULSE (Gentle ambient heartbeat)
    if (barStep === 0 || barStep === 8) {
      this.triggerSubtleAirKick(time);
    }

    // 4. CELESTIAL F#m9 CHIME ARPEGGIO SPARKLES
    const chimeNote = this.getIntroChimeNote(bar, barStep);
    if (chimeNote > 0) {
      this.triggerIntroChime(time, chimeNote, stepDuration * 2.4);
    }
  }

  private midiToHz(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  // --- INTRO BASS NOTES ---
  private getIntroBassNote(bar: number, step: number): number {
    // F#1 = 30, D2 = 38, E2 = 40, C#2 = 37, F#2 = 42
    if (bar === 0) {
      return step === 0 ? 30 : step === 6 ? 42 : 30; // F#1 -> F#2
    } else if (bar === 1) {
      return step === 0 ? 38 : step === 6 ? 45 : 38; // D2 -> A2
    } else if (bar === 2) {
      return step === 0 ? 40 : step === 6 ? 47 : 40; // E2 -> B2
    } else {
      return step === 0 ? 37 : step === 6 ? 44 : 37; // C#2 -> G#2
    }
  }

  // --- INTRO CHIME NOTES ---
  private getIntroChimeNote(bar: number, step: number): number {
    // F#m9: F#4(66), A4(69), C#5(73), E5(76), G#5(80)
    // Dmaj7: D4(62), F#4(66), A4(69), C#5(73), F#5(78)
    // Esus2: E4(64), F#4(66), B4(71), E5(76), G#5(80)
    // C#m7: C#4(61), E4(64), G#4(68), B4(71), E5(76)
    if (bar === 0) {
      const notes = [66, 0, 73, 0, 76, 0, 80, 0, 76, 0, 73, 0, 69, 0, 66, 0];
      return notes[step] || 0;
    } else if (bar === 1) {
      const notes = [69, 0, 73, 0, 78, 0, 81, 0, 78, 0, 73, 0, 69, 0, 66, 0];
      return notes[step] || 0;
    } else if (bar === 2) {
      const notes = [64, 0, 71, 0, 76, 0, 80, 0, 76, 0, 71, 0, 66, 0, 64, 0];
      return notes[step] || 0;
    } else {
      const notes = [61, 0, 68, 0, 73, 0, 76, 0, 73, 0, 68, 0, 64, 0, 61, 0];
      return notes[step] || 0;
    }
  }

  // =========================================================================
  // INSTRUMENT SYNTHESIS
  // =========================================================================

  // 1. Swelling Ethereal Ambient Pad Chord
  private triggerIntroPadChord(time: number, bar: number, duration: number) {
    if (!this.ctx || !this.compressor) return;

    let midiChord: number[] = [];
    if (bar === 0) {
      midiChord = [42, 49, 54, 57, 61]; // F#m9 (F#2, C#3, F#3, A3, C#4)
    } else if (bar === 1) {
      midiChord = [38, 45, 50, 54, 57]; // Dmaj7 (D2, A2, D3, F#3, A3)
    } else if (bar === 2) {
      midiChord = [40, 47, 52, 56, 59]; // Esus2/E (E2, B2, E3, G#3, B3)
    } else {
      midiChord = [37, 44, 49, 52, 56]; // C#m7 (C#2, G#2, C#3, E3, G#3)
    }

    midiChord.forEach((midi, idx) => {
      if (!this.ctx || !this.compressor) return;
      const freq = this.midiToHz(midi);

      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 1.0015, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, time);
      filter.frequency.exponentialRampToValueAtTime(780, time + duration * 0.45);
      filter.frequency.exponentialRampToValueAtTime(380, time + duration);
      filter.Q.setValueAtTime(0.6, time);

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(0.042 / (idx + 1), time + 1.0);
      gain.gain.linearRampToValueAtTime(0.032 / (idx + 1), time + duration * 0.75);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.compressor);

      osc.start(time);
      osc2.start(time);
      osc.stop(time + duration + 0.1);
      osc2.stop(time + duration + 0.1);
    });
  }

  // 2. Warm Deep Sub-Bass
  private triggerWarmSubBass(time: number, midiNote: number, dur: number) {
    if (!this.ctx || !this.compressor) return;

    const freq = this.midiToHz(midiNote);
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, time);
    filter.Q.setValueAtTime(0.7, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.22, time + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);

    osc.start(time);
    osc.stop(time + dur + 0.05);
  }

  // 3. Subtle Air Kick
  private triggerSubtleAirKick(time: number) {
    if (!this.ctx || !this.compressor) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(68, time);
    osc.frequency.exponentialRampToValueAtTime(28, time + 0.14);

    gain.gain.setValueAtTime(0.28, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.24);

    osc.connect(gain);
    gain.connect(this.compressor);

    osc.start(time);
    osc.stop(time + 0.26);
  }

  // 4. Intro Celestial Chime
  private triggerIntroChime(time: number, midiNote: number, dur: number) {
    if (!this.ctx || !this.compressor) return;

    const freq = this.midiToHz(midiNote);
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, time);
    filter.frequency.exponentialRampToValueAtTime(700, time + dur);
    filter.Q.setValueAtTime(0.75, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.085, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);
    if (this.delayNode) gain.connect(this.delayNode);

    osc.start(time);
    osc2.start(time);
    osc.stop(time + dur + 0.02);
    osc2.stop(time + dur + 0.02);
  }
}

export const introSoundtrack = new IntroSoundtrackEngine();
