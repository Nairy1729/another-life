import { getProgress } from "../utils/progress";
import { sampleTimeline } from "../scenes/timeline";

/**
 * Two-layer audio engine:
 *  1. Procedural ambient — deep drone + air shimmer, generated live (no file needed)
 *  2. Music track — optional /public/audio/theme.mp3 (your licensed Hindi track)
 * Never autoplays. Started only by the sound toggle. Fades everything.
 * The ambient layer follows the story: warmer during intimacy, hollow after the miss.
 */
class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;

  // ambient nodes
  private droneGain: GainNode | null = null;
  private shimmerGain: GainNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;

  // music track
  private trackEl: HTMLAudioElement | null = null;
  private trackGain: GainNode | null = null;

  private raf = 0;
  private ready = false;

  private init() {
    if (this.ready) return;
    const ctx = new AudioContext();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);

    /* ---------- LAYER 1: the drone (two detuned sines, filtered) ---------- */
    this.droneFilter = ctx.createBiquadFilter();
    this.droneFilter.type = "lowpass";
    this.droneFilter.frequency.value = 220;

    this.droneGain = ctx.createGain();
    this.droneGain.gain.value = 0.05;
    this.droneGain.connect(this.droneFilter).connect(this.master);

    const oscA = ctx.createOscillator();
    oscA.type = "sine";
    oscA.frequency.value = 55; // low A — felt more than heard
    const oscB = ctx.createOscillator();
    oscB.type = "sine";
    oscB.frequency.value = 55 * 1.006; // slight detune = slow organic beating
    oscA.connect(this.droneGain);
    oscB.connect(this.droneGain);
    oscA.start();
    oscB.start();

    // very slow breathing on the drone level
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05; // one breath every 20s
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.018;
    lfo.connect(lfoDepth).connect(this.droneGain.gain);
    lfo.start();

    /* ---------- LAYER 2: air shimmer (filtered noise, barely there) ---------- */
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.4;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 1400;
    noiseFilter.Q.value = 1.2;

    this.shimmerGain = ctx.createGain();
    this.shimmerGain.gain.value = 0.006;
    noise.connect(noiseFilter).connect(this.shimmerGain).connect(this.master);
    noise.start();

    /* ---------- LAYER 3: the music track (optional file) ---------- */
    this.trackEl = new Audio("/audio/theme.mp3");
    this.trackEl.loop = true;
    this.trackEl.preload = "auto";
    this.trackGain = ctx.createGain();
    this.trackGain.gain.value = 0.55;
    try {
      const src = ctx.createMediaElementSource(this.trackEl);
      src.connect(this.trackGain).connect(this.master);
    } catch {
      /* ignore */
    }

    this.ready = true;
  }

  /** story-reactive loop — ambience follows the emotional timeline */
  private tick = () => {
    if (!this.ctx || !this.droneFilter || !this.droneGain || !this.shimmerGain) return;
    const st = sampleTimeline(getProgress(), performance.now() / 1000);
    const t = this.ctx.currentTime;

    // warmth opens the drone filter (brighter, closer); cold closes it (distant, hollow)
    const targetFreq = 160 + st.warmth * 420;
    this.droneFilter.frequency.setTargetAtTime(targetFreq, t, 0.6);

    // shimmer swells with connection, disappears in the darkness between lives
    const shimmer = (0.004 + st.connection * 0.010) * (1 - st.darkness);
    this.shimmerGain.gain.setTargetAtTime(shimmer, t, 0.8);

    // the whole soundscape sinks into the black transition
    this.droneGain.gain.setTargetAtTime(0.03 + st.warmth * 0.035 * (1 - st.darkness), t, 0.6);

    this.raf = requestAnimationFrame(this.tick);
  };

  async play() {
    this.init();
    if (!this.ctx || !this.master) return;
    if (this.ctx.state === "suspended") await this.ctx.resume();

    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(0.8, this.ctx.currentTime, 1.2); // slow fade in

    try {
      await this.trackEl?.play(); // silently fails if theme.mp3 doesn't exist — drone still plays
    } catch { /* no track yet — ambient only */ }

    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(this.tick);
  }

  pause() {
    if (!this.ctx || !this.master) return;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
    cancelAnimationFrame(this.raf);
    const el = this.trackEl;
    setTimeout(() => el?.pause(), 1800);
  }
}

export const audio = new AudioEngine();