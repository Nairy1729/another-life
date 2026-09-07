import { sampleScalar, sampleVec2, type ScalarKey, type Vec2Key } from "../utils/math";

/*
  TIMELINE MAP
  0.00–0.07  entering the universe
  0.07–0.18  two existences
  0.18–0.31  attraction
  0.31–0.42  connection
  0.42–0.52  intimacy
  0.52–0.63  separation
  0.63–0.78  PASS 3: approach → almost → miss → realization → second look
  0.78–0.80  collapse → BLACK
  0.80–0.93  another life
  0.93–1.00  merge → separate → one remains
*/

const A_PATH: Vec2Key[] = [
  [0.00, -4.6,  1.7], [0.09, -3.1,  1.15], [0.20, -2.2,  0.65],
  [0.28, -1.1,  0.30], [0.34, -0.62, 0.05], [0.47, -0.55, 0.0],
  // — PASS 3 choreography: converge, pause, miss, realize, look back —
  [0.58, -2.30, 0.95], [0.615, -1.55, 0.55], [0.645, -0.95, 0.28],
  [0.664, -0.55, 0.18], [0.676, -0.28, 0.14], [0.688, -0.10, 0.13],  // the almost
  [0.700,  0.45, 0.22], [0.716,  1.05, 0.42],
  [0.728,  1.35, 0.52],                                              // slowing — realization
  [0.740,  1.52, 0.44],                                              // the second look
  [0.755,  2.20, 0.80], [0.775,  3.60, 1.70],
  // — invisible reset during black —
  [0.805, -2.7, 0.75], [0.875, -1.0, 0.22], [0.925, -0.16, 0.0],
  [0.965, -0.05, 0.0], [1.00, -0.30, 0.0],
];

const B_PATH: Vec2Key[] = [
  [0.00,  4.7, -1.5], [0.09,  3.3, -1.05], [0.20,  2.25, -0.55],
  [0.28,  1.1, -0.30], [0.34,  0.62, -0.05], [0.47,  0.55, 0.0],
  // — B runs a beat LATE: the miss is a timing mismatch, not an obstacle —
  [0.58,  2.30, -0.95], [0.615,  1.55, -0.50], [0.645,  0.95, -0.30],
  [0.666,  0.55, -0.24], [0.678,  0.28, -0.20], [0.690,  0.10, -0.17], // arrives after A has passed
  [0.702, -0.45, -0.28], [0.718, -1.05, -0.46],
  [0.730, -1.35, -0.55],
  [0.742, -1.50, -0.48],                                               // B answers — too late
  [0.757, -2.20, -0.85], [0.775, -3.60, -1.70],
  [0.805,  2.7, -0.75], [0.875,  1.0, -0.22], [0.925,  0.16, 0.0],
  [0.965,  0.05, 0.0], [1.00,  0.35, 0.0],
];

const WARMTH: ScalarKey[] = [
  [0.00, 0.00], [0.18, 0.08], [0.30, 0.25], [0.38, 0.52], [0.47, 0.78],
  [0.55, 0.40],
  // warmest point at near-contact, cooling after the miss
  [0.63, 0.20], [0.675, 0.30], [0.690, 0.34], [0.710, 0.14],
  [0.77, 0.02],
  [0.83, 0.35], [0.90, 0.55], [0.95, 0.65], [1.00, 0.50],
];

const ATTRACTION: ScalarKey[] = [
  [0.00, 0.0], [0.16, 0.0], [0.24, 0.55], [0.32, 1.0], [0.50, 1.0],
  // intent builds, breaks, flickers once, dies
  [0.58, 0.35], [0.63, 0.60], [0.672, 0.85], [0.688, 0.95],
  [0.700, 0.40], [0.720, 0.18],
  [0.738, 0.32],                    // the "what if?" flicker
  [0.755, 0.10], [0.78, 0.0],
  [0.85, 0.55], [0.93, 1.0], [1.00, 0.4],
];

const CONNECTION: ScalarKey[] = [
  [0.00, 0.0], [0.315, 0.0], [0.36, 1.0], [0.50, 1.0],
  [0.565, 0.55], [0.625, 0.12], [0.655, 0.0],
  [0.665, 0.18], [0.678, 0.0],              // one last flicker before the miss
  [0.885, 0.0], [0.925, 0.85], [0.965, 1.0], [0.985, 0.3], [1.00, 0.0],
];

const ENTITY_FADE: ScalarKey[] = [
  [0.00, 0.0], [0.035, 0.55], [0.07, 1.0],
  [0.75, 1.0], [0.775, 0.0],
  [0.80, 0.0], [0.835, 1.0], [1.00, 1.0],
];

const B_FADE: ScalarKey[] = [ [0.00, 1.0], [0.955, 1.0], [0.985, 0.0], [1.0, 0.0] ];

const DARKNESS: ScalarKey[] = [
  [0.00, 0.15], [0.05, 0.0],
  [0.745, 0.0], [0.785, 1.0], [0.805, 1.0], [0.845, 0.0],
  [0.945, 0.0], [1.00, 0.72],
];

const CAMERA_Z: ScalarKey[] = [
  [0.00, 17.0], [0.09, 11.5], [0.30, 9.2], [0.47, 7.4],
  // camera leans in during the near-contact
  [0.60, 9.4], [0.665, 8.6], [0.695, 8.4],[0.72, 9.4], [0.755, 10.6],
  [0.785, 15.5],
  [0.85, 10.0], [0.94, 8.2], [1.00, 9.0],
];

const EPOCH: ScalarKey[] = [ [0.0, 0.0], [0.77, 0.0], [0.82, 1.0], [1.0, 1.0] ];

const ORBIT: ScalarKey[] = [
  [0.0, 0.0], [0.34, 0.0], [0.40, 1.0], [0.52, 1.0], [0.60, 0.0],
  [0.92, 0.0], [0.96, 0.7], [1.0, 0.0],
];

const DISSOLVE: ScalarKey[] = [ [0.0, 0.0], [0.75, 0.0], [0.78, 1.0], [0.81, 1.0], [0.86, 0.0], [1.0, 0.0] ];

// PASS 3: the held breath around the near-meeting
const TENSION: ScalarKey[] = [
  [0.60, 0.0], [0.655, 0.55], [0.688, 1.0], [0.705, 0.55], [0.735, 0.15], [0.765, 0.0],
];

// PASS 4: the hush after the miss — deep, then slowly lifting
const AFTERMATH: ScalarKey[] = [
  [0.695, 0.0], [0.712, 0.6], [0.735, 0.45], [0.758, 0.2], [0.775, 0.0],
];

// PASS 4: the trace — a residual memory of the near-meeting
// first swell = realization, second smaller swell = the almost-memory
const ECHO: ScalarKey[] = [
  [0.705, 0.0], [0.722, 0.4], [0.738, 0.12], [0.752, 0.28], [0.768, 0.0],
];

export interface TimelineState {
  a: { x: number; y: number };
  b: { x: number; y: number };
  warmth: number; attraction: number; connection: number;
  entityFade: number; bFade: number; darkness: number;
  cameraZ: number; epoch: number; orbit: number; dissolve: number;
  tension: number;
  aftermath: number;
echo: number;
}

const _state: TimelineState = {
  a: { x: 0, y: 0 }, b: { x: 0, y: 0 },
  warmth: 0, attraction: 0, connection: 0,
  entityFade: 0, bFade: 1, darkness: 1,
  cameraZ: 17, epoch: 0, orbit: 0, dissolve: 0,
  tension: 0,
  aftermath: 0, echo: 0,
};

/** Sample the full narrative state at progress p. Reuses one object — no GC pressure. */
export function sampleTimeline(p: number, t: number): TimelineState {
  sampleVec2(A_PATH, p, _state.a);
  sampleVec2(B_PATH, p, _state.b);
  _state.orbit = sampleScalar(ORBIT, p);

  // orbital motion layered on top of keyframed paths (connection + intimacy)
  if (_state.orbit > 0.001) {
    const cx = (_state.a.x + _state.b.x) / 2;
    const cy = (_state.a.y + _state.b.y) / 2;
    const ang = t * 0.35;
    const r = 0.8 * _state.orbit;
    _state.a.x = cx - Math.cos(ang) * r;
    _state.a.y = cy - Math.sin(ang) * r * 0.55;
    _state.b.x = cx + Math.cos(ang) * r;
    _state.b.y = cy + Math.sin(ang) * r * 0.55;
  }

  _state.warmth = sampleScalar(WARMTH, p);
  _state.attraction = sampleScalar(ATTRACTION, p);
  _state.connection = sampleScalar(CONNECTION, p);
  _state.entityFade = sampleScalar(ENTITY_FADE, p);
  _state.bFade = sampleScalar(B_FADE, p);
  _state.darkness = sampleScalar(DARKNESS, p);
  _state.cameraZ = sampleScalar(CAMERA_Z, p);
  _state.epoch = sampleScalar(EPOCH, p);
  _state.dissolve = sampleScalar(DISSOLVE, p);
  _state.tension = sampleScalar(TENSION, p);
  _state.aftermath = sampleScalar(AFTERMATH, p);
_state.echo = sampleScalar(ECHO, p);
  return _state;
}