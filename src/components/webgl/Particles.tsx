import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getProgress, getPointer, getPointerWorld, getRipple, triggerRippleAt } from "../../utils/progress";
import { sampleTimeline } from "../../scenes/timeline";
import { PALETTE } from "../../config/palette";
import { STORY } from "../../data/story";
import { envelope } from "../../utils/math";
import { advanceMusicVisual, getMusicVisual, musicBlend } from "../../music/musicController";

const vertex = /* glsl */ `
  uniform float uTime;
  uniform vec3 uEntityA;
  uniform vec3 uEntityB;
  uniform float uAttraction;
  uniform float uConnection;
  uniform float uOrbit;
  uniform float uDissolve;
  uniform float uMotion;
  uniform vec2 uPointer;
  uniform vec3 uPointerWorld;
  uniform float uPointerPull;
  uniform vec3 uRippleOrigin;
  uniform float uRippleAge;

  attribute float aSeed;
  attribute float aLayer;

  varying float vGlow;
  varying float vLayer;
  varying float vSeed;
  varying float vDepthFade;

  void main() {
    vec3 p = position;
    float s = aSeed * 6.2831;

        p.x += sin(uTime * 0.08 + s) * (0.18 + aLayer * 0.3) * uMotion;
    p.y += cos(uTime * 0.06 + s * 1.7) * (0.14 + aLayer * 0.28) * uMotion;
    p.z += sin(uTime * 0.05 + s * 2.3) * 0.22 * aLayer * uMotion;

    p.xy += uPointer * 0.12 * aLayer;

    float glow = 0.0;
    if (aLayer > 0.5) {
      vec3 dA = uEntityA - p;
      vec3 dB = uEntityB - p;
      float lA = max(length(dA), 0.001);
      float lB = max(length(dB), 0.001);
      float pullA = uAttraction / (1.0 + lA * lA * 0.8);
      float pullB = uAttraction / (1.0 + lB * lB * 0.8);
      p += normalize(dA) * pullA * 0.9 * uMotion;
      p += normalize(dB) * pullB * 0.9 * uMotion;

      vec3 c = (uEntityA + uEntityB) * 0.5;
      vec3 dc = p - c;
      float lc = max(length(dc.xy), 0.001);
      vec2 tang = vec2(-dc.y, dc.x) / lc;
      p.xy += tang * uOrbit * (0.5 / (1.0 + lc * lc * 0.5)) * uMotion;

      // pointer gravity — the visitor is a third presence
      vec3 dP = uPointerWorld - p;
      float lP = max(length(dP), 0.001);
      float pullP = uPointerPull / (1.0 + lP * lP * 1.4);
      p += normalize(dP) * pullP * 0.7 * uMotion;

      // ripple — slow gravitational wave (user tap or the miss itself)
      float rd = length(p.xy - uRippleOrigin.xy);
      float front = uRippleAge * 2.6;
      float band = exp(-pow(rd - front, 2.0) * 3.5) * exp(-uRippleAge * 0.8);
      p.xy += normalize(p.xy - uRippleOrigin.xy + vec2(0.0001)) * band * 0.45 * uMotion;

      glow = min(pullA + pullB + pullP * 0.8 + band * 0.7, 1.4);
    }

    p += normalize(p + vec3(0.001)) * uDissolve * (2.5 + aSeed * 4.0);

    vGlow = glow;
    vLayer = aLayer;
    vSeed = aSeed;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    // cinematic depth — distant particles fade
    vDepthFade = clamp(1.0 - (-mv.z - 8.0) / 30.0, 0.25, 1.0);

        float size = mix(1.1, 1.9, aLayer) * (0.7 + aSeed * 0.8) * (1.0 + glow * 1.3);
    gl_PointSize = size * (140.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  uniform float uWarmth;
  uniform float uEpoch;
  uniform float uFade;
  uniform float uQuiet;
  uniform vec3 uCold;
  uniform vec3 uWarm;
  uniform float uTime;

  varying float vGlow;
  varying float vLayer;
  varying float vSeed;
  varying float vDepthFade;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv) * 2.0;
    float a0 = exp(-d * d * 4.5);
    if (a0 < 0.01) discard;

    float twinkle = 0.88 + 0.12 * sin(uTime * (0.5 + vSeed * 1.2) + vSeed * 40.0);
    vec3 col = mix(uCold, uWarm, clamp(uWarmth + vGlow * 0.5, 0.0, 1.0));
    col = mix(col, col * vec3(1.06, 1.0, 0.92), uEpoch);

    float base = mix(0.14, 0.32, vLayer);
    float alpha = a0 * base * twinkle * uFade * (1.0 + vGlow * 0.6) * vDepthFade;
    alpha *= 1.0 - uQuiet * mix(0.4, 0.65, vLayer);
    alpha = min(alpha, 0.5);

    gl_FragColor = vec4(col, alpha);
  }
`;

export function Particles({ dust, stars, motionScale }: { dust: number; stars: number; motionScale: number }) {
    const matRef = useRef<THREE.ShaderMaterial>(null);
    const ptr = useRef(new THREE.Vector2());
    const lastProg = useRef(0);
    const missPoint = useRef(new THREE.Vector2());

    const { positions, seeds, layers } = useMemo(() => {
        const total = dust + stars;
        const positions = new Float32Array(total * 3);
        const seeds = new Float32Array(total);
        const layers = new Float32Array(total);
        let s = 1337;
        const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };

        for (let i = 0; i < total; i++) {
            const isDust = i < dust;
            // wider shell — the center keeps its negative space
            const r = isDust ? 3 + rnd() * 10 : 14 + rnd() * 22;
            const theta = rnd() * Math.PI * 2;
            const phi = Math.acos(2 * rnd() - 1);
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.65;
            positions[i * 3 + 2] = isDust ? r * Math.cos(phi) * 0.6 : -Math.abs(r * Math.cos(phi)) - 4;
            seeds[i] = rnd();
            layers[i] = isDust ? 1 : 0;
        }
        return { positions, seeds, layers };
    }, [dust, stars]);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uEntityA: { value: new THREE.Vector3() },
        uEntityB: { value: new THREE.Vector3() },
        uAttraction: { value: 0 },
        uConnection: { value: 0 },
        uOrbit: { value: 0 },
        uDissolve: { value: 0 },
        uWarmth: { value: 0 },
        uEpoch: { value: 0 },
        uFade: { value: 1 },
        uQuiet: { value: 0 },
        uMotion: { value: motionScale },
        uPointer: { value: new THREE.Vector2() },
        uPointerWorld: { value: new THREE.Vector3() },
        uPointerPull: { value: 0.55 },
        uRippleOrigin: { value: new THREE.Vector3() },
        uRippleAge: { value: 999 },
        uCold: { value: new THREE.Color(PALETTE.dustCold) },
        uWarm: { value: new THREE.Color(PALETTE.dustWarm) },
    }), [motionScale]);

    useFrame(({ clock }) => {
        const m = matRef.current;
        if (!m) return;
        const t = clock.elapsedTime;
        const prog = getProgress();
        const st = sampleTimeline(prog, t);
        const p = getPointer();
        const pw = getPointerWorld();
        const ripple = getRipple();

        // sole advancer of the music->visual smoothing (once per frame)
        advanceMusicVisual(t);
        const mv = getMusicVisual();

        ptr.current.x += (p.x - ptr.current.x) * 0.03;
        ptr.current.y += (p.y - ptr.current.y) * 0.03;

        // typography owns its moments — compute quiet from story cues
        let quiet = 0;
        for (const cue of STORY) {
            let e = envelope(prog, cue.start, cue.end);
            if (cue.id === "almost") e = Math.min(1, e * 1.5); // the miss gets deeper silence
            quiet = Math.max(quiet, e);
        }

        // near-contact: the environment holds its breath
        quiet = Math.max(quiet, st.tension * 0.6);
        // the hush after the miss — deep, then slowly lifting
        quiet = Math.max(quiet, st.tension * 0.6, st.aftermath * 0.4);

        // the universe notices the miss — and the space remembers
        if (lastProg.current < 0.695 && prog >= 0.695) {
            missPoint.current.set((st.a.x + st.b.x) / 2, (st.a.y + st.b.y) / 2);
            triggerRippleAt(missPoint.current.x, missPoint.current.y);
        }
        // a second, fainter disturbance — the almost-memory passing through the empty point
        if (lastProg.current < 0.748 && prog >= 0.748) {
            triggerRippleAt(missPoint.current.x, missPoint.current.y);
        }
        lastProg.current = prog;

        m.uniforms.uTime.value = t;
        m.uniforms.uEntityA.value.set(st.a.x, st.a.y, 0);
        m.uniforms.uEntityB.value.set(st.b.x, st.b.y, 0);
        m.uniforms.uAttraction.value = st.attraction;
        m.uniforms.uConnection.value = st.connection;
        m.uniforms.uOrbit.value = st.orbit;
        m.uniforms.uDissolve.value = st.dissolve;
        m.uniforms.uWarmth.value = musicBlend(st.warmth, mv.warmth);
        m.uniforms.uEpoch.value = st.epoch;
        m.uniforms.uQuiet.value = quiet;
        m.uniforms.uMotion.value =
            motionScale * (1 - mv.influence * (1 - mv.motion)) * (1 - st.aftermath * 0.45);

        // background yields during entity moments
        const entityMoment = Math.max(st.attraction, st.connection);
        m.uniforms.uFade.value = (1 - st.darkness) * (1 - entityMoment * 0.18);

        m.uniforms.uPointer.value.copy(ptr.current);
        m.uniforms.uPointerWorld.value.set(pw.x, pw.y, 0);
        m.uniforms.uRippleOrigin.value.set(ripple.x, ripple.y, 0);
        m.uniforms.uRippleAge.value = (performance.now() - ripple.time) / 1000;
    });

    return (
        <points frustumCulled={false}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
                <bufferAttribute attach="attributes-aLayer" args={[layers, 1]} />
            </bufferGeometry>
            <shaderMaterial
                ref={matRef}
                vertexShader={vertex}
                fragmentShader={fragment}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}