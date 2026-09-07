export const QUALITY = {
  desktop: { dust: 4200, stars: 1600, dpr: [1, 2] as [number, number], postFx: true },
  mobile:  { dust: 1800, stars: 800,  dpr: [1, 1.5] as [number, number], postFx: true },
  low:     { dust: 1000, stars: 500,  dpr: [1, 1] as [number, number],   postFx: false },
};

export const SCROLL = {
  pages: 14,            // 14 × 100vh — long, slow, cinematic
  lerp: 0.06,           // Lenis smoothing
};

export const MOTION = {
  pointerInfluence: 0.35,   // desktop camera sway
  pointerInfluenceTouch: 0.12,
  driftSpeed: 0.05,
};

