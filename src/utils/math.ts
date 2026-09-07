export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => t * t * (3 - 2 * t);

export type ScalarKey = [t: number, v: number];
export type Vec2Key = [t: number, x: number, y: number];

/** smoothstep-interpolated scalar keyframe track */
export function sampleScalar(keys: ScalarKey[], p: number): number {
  if (p <= keys[0][0]) return keys[0][1];
  const last = keys[keys.length - 1];
  if (p >= last[0]) return last[1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (p >= t0 && p <= t1) return lerp(v0, v1, smooth((p - t0) / (t1 - t0)));
  }
  return last[1];
}

export function sampleVec2(keys: Vec2Key[], p: number, out: { x: number; y: number }) {
  if (p <= keys[0][0]) { out.x = keys[0][1]; out.y = keys[0][2]; return out; }
  const last = keys[keys.length - 1];
  if (p >= last[0]) { out.x = last[1]; out.y = last[2]; return out; }
  for (let i = 0; i < keys.length - 1; i++) {
    const k0 = keys[i], k1 = keys[i + 1];
    if (p >= k0[0] && p <= k1[0]) {
      const t = smooth((p - k0[0]) / (k1[0] - k0[0]));
      out.x = lerp(k0[1], k1[1], t);
      out.y = lerp(k0[2], k1[2], t);
      return out;
    }
  }
  return out;
}

/** fade-in / hold / fade-out envelope inside [start,end] */
export function envelope(p: number, start: number, end: number, edge = 0.18): number {
  if (p < start || p > end) return 0;
  const t = (p - start) / (end - start);
  return clamp01(Math.min(t / edge, (1 - t) / edge, 1));
}