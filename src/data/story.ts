export interface StoryCue {
  id: string;
  start: number;   // scroll progress 0..1
  end: number;
  lines: string[];
  size?: "lg" | "md" | "sm";
  stagger?: number; // seconds between lines
}

export const INTRO = {
  line1: "What if we met",
  line2: "in another life?",
  action: "begin",
};

export const STORY: StoryCue[] = [
  { id: "existed",   start: 0.075, end: 0.165, lines: ["Somewhere\u2026", "\u2026you existed.", "And somewhere\u2026", "\u2026so did I."], size: "md", stagger: 1.4 },
  { id: "meant",     start: 0.335, end: 0.425, lines: ["Maybe this was always", "supposed to happen."], size: "lg", stagger: 0.9 },
  { id: "timing",    start: 0.520, end: 0.605, lines: ["But every universe\u2026", "\u2026has its own timing."], size: "md", stagger: 1.2 },
  { id: "almost",    start: 0.685, end: 0.760, lines: ["Almost.", "Is a strange kind of forever."], size: "lg", stagger: 1.6 },
  { id: "right",     start: 0.845, end: 0.925, lines: ["Maybe\u2026", "\u2026somewhere\u2026", "\u2026we got it right."], size: "md", stagger: 1.1 },
  { id: "final",     start: 0.955, end: 0.995, lines: ["What if we met in another life?"], size: "lg" },
  { id: "final-sub", start: 0.972, end: 0.998, lines: ["Maybe we already did."], size: "sm" },
];

export const ENDING = { action: "experience again" };

export interface Whisper {
  word: string;
  start: number;   // progress window
  end: number;
  x: number;       // viewport position %
  y: number;
  drift: number;   // horizontal drift in px (negative = left)
  tone: "warm" | "cold" | "crimson";
}

export const WHISPERS: Whisper[] = [
  // mystery — quiet wondering
  { word: "somewhere",  start: 0.045, end: 0.095, x: 24, y: 20, drift: 18,  tone: "cold" },
  { word: "waiting",    start: 0.115, end: 0.165, x: 72, y: 62, drift: -14, tone: "cold" },
  // attraction — the pull becomes feelings
  { word: "closer",     start: 0.215, end: 0.265, x: 30, y: 58, drift: 22,  tone: "warm" },
  { word: "you",        start: 0.255, end: 0.300, x: 68, y: 22, drift: -18, tone: "warm" },
  // connection & intimacy — love
  { word: "finally",    start: 0.345, end: 0.395, x: 22, y: 24, drift: 16,  tone: "warm" },
  { word: "stay",       start: 0.445, end: 0.505, x: 74, y: 56, drift: -12, tone: "warm" },
  { word: "always",     start: 0.475, end: 0.525, x: 28, y: 64, drift: 14,  tone: "warm" },
  // separation — hurt enters
  { word: "wait",       start: 0.545, end: 0.590, x: 70, y: 21, drift: -24, tone: "cold" },
  { word: "no",         start: 0.585, end: 0.620, x: 26, y: 55, drift: -30, tone: "crimson" },
  // the miss — the sharpest words
  { word: "why",        start: 0.700, end: 0.740, x: 66, y: 60, drift: -16, tone: "crimson" },
  { word: "again",      start: 0.720, end: 0.760, x: 32, y: 23, drift: 12,  tone: "crimson" },
  // another life — hope
  { word: "again",      start: 0.825, end: 0.875, x: 70, y: 25, drift: 16,  tone: "warm" },
  { word: "this time",  start: 0.885, end: 0.930, x: 28, y: 60, drift: 14,  tone: "warm" },
  // acceptance
  { word: "enough",     start: 0.940, end: 0.965, x: 68, y: 44, drift: -10, tone: "cold" },
];

export const ABOUT = {
  byline: "a story by Nairy",   // ← EDIT ME
  trigger: "the story",
  title: "What if we met in another life?",
  paragraphs: [
    "Two points of consciousness, born into the same universe, moving through it on paths that were never quite the same.",
    "This is a story told without faces. The warm light and the pale light are two people — or two possibilities of the same two people — existing across different timelines.",
    "They notice each other. They are pulled together. For a moment, they connect — and the universe grows warm around them.",
    "But every universe has its own timing. They drift. They approach again. And at the last possible moment, they pass each other — not stopped by anything, simply never arriving at the same place at the same time.",
    "The universe collapses. Another life begins — warmer, different. They find each other again. Whether they stay is never quite answered.",
    "One light remains.",
  ],
  howTo: [
    "scroll slowly — or press watch and let the story carry you",
    "tap anywhere to send a wave through the dust",
    "play the soundtrack — each song reshapes the universe",
  ],
};