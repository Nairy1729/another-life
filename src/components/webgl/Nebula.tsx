import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getProgress } from "../../utils/progress";
import { sampleTimeline } from "../../scenes/timeline";
import { PALETTE } from "../../config/palette";
import { getMusicVisual, musicBlend } from "../../music/musicController";

const fragment = /* glsl */ `
  uniform float uTime;
  uniform float uWarmth;
  uniform float uEpoch;
  uniform float uFade;
  uniform float uHurt;
  uniform vec3 uNavy;
  uniform vec3 uViolet;
  uniform vec3 uCrimson;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.1; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv * 3.0;
    float n = fbm(uv + uTime * 0.008 + uEpoch * 7.3);
    float n2 = fbm(uv * 0.6 - uTime * 0.005);

        vec3 col = uNavy * 0.85;
    col += uViolet * smoothstep(0.42, 0.85, n) * 0.26;
    col += uCrimson * smoothstep(0.52, 0.9, n2) * (0.07 + uWarmth * 0.28 + uHurt * 0.35);
    col *= 0.4 + 0.35 * n;

    gl_FragColor = vec4(col * uFade, 1.0);
  }
`;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export function Nebula() {
    const mat = useRef<THREE.ShaderMaterial>(null);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uWarmth: { value: 0 },
        uEpoch: { value: 0 },
        uFade: { value: 1 },
        uHurt: { value: 0 },
        uNavy: { value: new THREE.Color(PALETTE.deepNavy) },
        uViolet: { value: new THREE.Color(PALETTE.violet) },
        uCrimson: { value: new THREE.Color(PALETTE.crimson) },
    }), []);

    useFrame(({ clock }) => {
        if (!mat.current) return;
        const t = clock.elapsedTime;
        const p = getProgress();
        const st = sampleTimeline(p, t);

        // crimson wound — blooms only around the missed connection (~p = 0.70)
        const hurt = Math.max(0, 1 - Math.abs(p - 0.70) / 0.05);

        mat.current.uniforms.uTime.value = t;
        const mv = getMusicVisual();
        mat.current.uniforms.uWarmth.value = musicBlend(st.warmth, mv.warmth);
        mat.current.uniforms.uEpoch.value =
            Math.min(1, st.epoch + mv.colorShift * mv.influence); // song shifts the cloud pattern
        mat.current.uniforms.uFade.value = 1 - st.darkness;
        mat.current.uniforms.uHurt.value = hurt * hurt * 0.7;
    });

    return (
        <mesh position={[0, 0, -22]} frustumCulled={false}>
            <planeGeometry args={[90, 60]} />
            <shaderMaterial
                ref={mat}
                vertexShader={vertexShader}
                fragmentShader={fragment}
                uniforms={uniforms}
                depthWrite={false}
            />
        </mesh>
    );
}