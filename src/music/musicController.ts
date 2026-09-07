import { PLAYLIST } from "../data/playlist";

export interface MusicState {
  index: number;
  playing: boolean;
  loaded: boolean;        // a song has been loaded at least once
  drawerOpen: boolean;
  autoplayHint: boolean;  // "Tap to begin the soundtrack"
  unavailable: boolean;   // "This song isn't available here."
  soundtrackMode: boolean;
  finished: boolean;      // Tonight's Soundtrack completed
}

let state: MusicState = {
  index: 0, playing: false, loaded: false, drawerOpen: false,
  autoplayHint: false, unavailable: false, soundtrackMode: false, finished: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

export const musicStore = {
  get: () => state,
  set(partial: Partial<MusicState>) {
    state = { ...state, ...partial };
    listeners.forEach((l) => l());
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => { listeners.delete(l); };
  },
};

export const currentSong = () => PLAYLIST[state.index];

/* ──────────────────────────────────────────────────────────
   MUSIC → UNIVERSE
   Smoothed visual parameters, advanced once per frame from
   Particles.tsx (the always-mounted useFrame). Consumers blend
   these into existing timeline uniforms. ~2–4s convergence.
   ────────────────────────────────────────────────────────── */
const visual = {
  warmth: 0.4, motion: 0.5, glow: 0.5, density: 0.5, colorShift: 0,
  influence: 0, // 0 = story only, 0.45 = music shaping the universe
};

export const getMusicVisual = () => visual;

let lastT = -1;
export function advanceMusicVisual(time: number) {
  if (lastT < 0) lastT = time;
  const dt = Math.min(time - lastT, 0.1);
  lastT = time;

  const k = 1 - Math.exp(-dt / 1.4); // exponential smoothing ≈ 3s settle
  const targetInf = state.playing ? 0.45 : 0;
  visual.influence += (targetInf - visual.influence) * k;

  const song = currentSong();
  if (song) {
    visual.warmth += (song.visual.warmth - visual.warmth) * k;
    visual.motion += (song.visual.motion - visual.motion) * k;
    visual.glow += (song.visual.glow - visual.glow) * k;
    visual.density += (song.visual.particleDensity - visual.density) * k;
    visual.colorShift += (song.visual.colorShift - visual.colorShift) * k;
  }
}

/** helper — blend a story value with the music layer */
export function musicBlend(storyValue: number, musicValue: number): number {
  return storyValue * (1 - visual.influence) + musicValue * visual.influence;
}