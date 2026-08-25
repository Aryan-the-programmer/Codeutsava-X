// =========================================================================
// MINIMAL & SOOTHING CYBER AMBIENT SOUNDTRACK ENGINE
// Ethereal Chillwave / Cyber Lo-Fi Ambient Synthesizer
// 100% Offline Web Audio API | Zero Audio File Overhead | 98 BPM
// =========================================================================

class CyberSoundtrackEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = true;
  private currentStep: number = 0;
  private timerId: number | null = null;
  private nextStepTime: number = 0;
  private tempo: number = 98; // Relaxed, soothing lo-fi / chillwave tempo
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

    // 1. Transparent Warm Dynamics Compressor
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-24, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(18, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(3.5, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.02, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.35, this.ctx.currentTime);

    // 2. Master Soft Volume Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    // 3. Ethereal Stereo Tape Delay Line (Warm lowpassed repeats)
    this.delayNode = this.ctx.createDelay();
    this.delayNode.delayTime.setValueAtTime((60 / this.tempo) * 0.75, this.ctx.currentTime); // Dotted 8th delay (~0.46s)

    this.delayFeedback = this.ctx.createGain();
    this.delayFeedback.gain.setValueAtTime(0.42, this.ctx.currentTime);

    const delayFilter = this.ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    delayFilter.Q.setValueAtTime(0.8, this.ctx.currentTime);

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
    this.listeners.forEach((cb) => cb(this.isPlaying && !this.isMuted));
  }

  public getIsPlaying(): boolean {
    return this.isPlaying && !this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.start();
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
      this.masterGain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 0.3);
    }

    this.scheduleLoop();
    this.notify();
  }

  public pause() {
    if (!this.isPlaying) return;
    const ctx = this.getContext();
    if (ctx && this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    }
    setTimeout(() => {
      this.isPlaying = false;
      this.currentStep = 0;
      if (this.timerId !== null) {
        window.clearTimeout(this.timerId);
        this.timerId = null;
      }
      this.notify();
    }, 200);
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

    this.timerId = window.setTimeout(this.scheduleLoop, 30);
  };

  // =========================================================================
  // STEP SEQUENCER: 64 STEPS (4 BARS OF 16TH NOTES AT 98 BPM)
  // Soothing, Minimal, Cyber Chillwave Progression: Dm9 -> BbMaj7 -> Csus2 -> Am7
  // =========================================================================
  private playStep(step: number, time: number) {
    if (!this.ctx || !this.compressor) return;

    const bar = Math.floor(step / 16);
    const barStep = step % 16;
    const stepDuration = 60 / this.tempo / 4;

    // 1. LUSH AMBIENT CYBER PAD CHORD (Triggers at the start of each bar)
    if (barStep === 0) {
      this.triggerPadChord(time, bar, stepDuration * 15.5);
    }

    // 2. WARM, DEEP ANALOG SUB-BASS (Gentle 8th/16th note glide)
    if (barStep === 0 || barStep === 6 || barStep === 10) {
      const bassNote = this.getSoothingBassNote(bar, barStep);
      this.triggerWarmBass(time, bassNote, stepDuration * 3.5);
    }

    // 3. MINIMAL HEARTBEAT KICK (Soft, warm, pillowy)
    if (barStep === 0 || barStep === 8) {
      this.triggerSoftKick(time);
    }

    // 4. GENTLE ORGANIC RIM TAP (Subtle, relaxing)
    if (barStep === 4 || barStep === 12) {
      this.triggerSoftRim(time);
    }

    // 5. AIRY SHAKER WHISPER (Quiet lo-fi texture on 8th notes)
    if (barStep % 2 === 0) {
      this.triggerAirShaker(time, barStep % 4 === 2);
    }

    // 6. CELESTIAL GLASS CHIME ARPEGGIO (Soothing, crystalline sparkles)
    const chimeNote = this.getSoothingChimeNote(bar, barStep);
    if (chimeNote > 0) {
      this.triggerGlassChime(time, chimeNote, stepDuration * 2.2);
    }
  }

  // --- FREQUENCY HELPER ---
  private midiToHz(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  // --- SOOTHING BASS NOTES ---
  private getSoothingBassNote(bar: number, step: number): number {
    // D2 = 38, Bb1 = 34, C2 = 36, A1 = 33
    if (bar === 0) {
      return step === 0 ? 38 : step === 6 ? 41 : 38; // D2 -> F2 -> D2
    } else if (bar === 1) {
      return step === 0 ? 34 : step === 6 ? 38 : 34; // Bb1 -> D2 -> Bb1
    } else if (bar === 2) {
      return step === 0 ? 36 : step === 6 ? 40 : 36; // C2 -> E2 -> C2
    } else {
      return step === 0 ? 33 : step === 6 ? 37 : 33; // A1 -> C#2 -> A1
    }
  }

  // --- SOOTHING CHIME NOTES ---
  private getSoothingChimeNote(bar: number, step: number): number {
    // Dm9: D4(62), F4(65), A4(69), C5(72), E5(76)
    // BbMaj7: Bb3(58), D4(62), F4(65), A4(69), D5(74)
    // Csus2: C4(60), D4(62), G4(67), C5(72), E5(76)
    // Am7: A3(57), C4(60), E4(64), G4(67), C5(72)
    if (bar === 0) {
      const notes = [62, 0, 69, 0, 72, 0, 76, 0, 72, 0, 69, 0, 65, 0, 62, 0];
      return notes[step] || 0;
    } else if (bar === 1) {
      const notes = [65, 0, 69, 0, 74, 0, 77, 0, 74, 0, 69, 0, 65, 0, 62, 0];
      return notes[step] || 0;
    } else if (bar === 2) {
      const notes = [60, 0, 67, 0, 72, 0, 76, 0, 72, 0, 67, 0, 64, 0, 60, 0];
      return notes[step] || 0;
    } else {
      const notes = [57, 0, 64, 0, 69, 0, 72, 0, 69, 0, 64, 0, 60, 0, 57, 0];
      return notes[step] || 0;
    }
  }

  // =========================================================================
  // SOOTHING INSTRUMENT VOICES
  // =========================================================================

  // 1. Ethereal Ambient Pad Chord
  private triggerPadChord(time: number, bar: number, duration: number) {
    if (!this.ctx || !this.compressor) return;

    let midiChord: number[] = [];
    if (bar === 0) {
      midiChord = [50, 57, 60, 65, 69]; // Dm9
    } else if (bar === 1) {
      midiChord = [46, 53, 58, 62, 65]; // BbMaj7
    } else if (bar === 2) {
      midiChord = [48, 55, 60, 64, 67]; // C (add9)
    } else {
      midiChord = [45, 52, 57, 60, 64]; // Am7
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
      osc2.frequency.setValueAtTime(freq * 1.002, time);

      // Gentle warm lowpass filter sweep
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(520, time);
      filter.frequency.exponentialRampToValueAtTime(820, time + duration * 0.4);
      filter.frequency.exponentialRampToValueAtTime(450, time + duration);
      filter.Q.setValueAtTime(0.7, time);

      // Slow, smooth swell
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(0.045 / (idx + 1), time + 0.8);
      gain.gain.linearRampToValueAtTime(0.035 / (idx + 1), time + duration * 0.7);
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

  // 2. Warm Analog Sub-Bass (Deep & Soft)
  private triggerWarmBass(time: number, midiNote: number, dur: number) {
    if (!this.ctx || !this.compressor) return;

    const freq = this.midiToHz(midiNote);
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, time);
    filter.Q.setValueAtTime(0.8, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.24, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);

    osc.start(time);
    osc.stop(time + dur + 0.05);
  }

  // 3. Soft Pillowy Heartbeat Kick
  private triggerSoftKick(time: number) {
    if (!this.ctx || !this.compressor) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(75, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.12);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);

    osc.connect(gain);
    gain.connect(this.compressor);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  // 4. Soft Organic Rim Tap
  private triggerSoftRim(time: number) {
    if (!this.ctx || !this.compressor) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(340, time);
    osc.frequency.exponentialRampToValueAtTime(140, time + 0.04);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, time);
    filter.Q.setValueAtTime(1.5, time);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);

    osc.start(time);
    osc.stop(time + 0.07);
  }

  // 5. Airy Shaker Whisper
  private triggerAirShaker(time: number, isAccent: boolean) {
    if (!this.ctx || !this.compressor) return;

    const duration = isAccent ? 0.05 : 0.025;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(8200, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isAccent ? 0.045 : 0.02, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);

    noise.start(time);
    noise.stop(time + duration + 0.01);
  }

  // 6. Celestial Glass Chime Arpeggio (Warm, Crystalline & Dreamy)
  private triggerGlassChime(time: number, midiNote: number, dur: number) {
    if (!this.ctx || !this.compressor) return;

    const freq = this.midiToHz(midiNote);
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, time); // Subtle shimmer harmonic

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, time);
    filter.frequency.exponentialRampToValueAtTime(800, time + dur);
    filter.Q.setValueAtTime(0.8, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.09, time + 0.015);
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

export const cyberSoundtrack = new CyberSoundtrackEngine();
