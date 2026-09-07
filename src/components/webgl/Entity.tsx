import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getProgress } from "../../utils/progress";
import { sampleTimeline } from "../../scenes/timeline";
import { getMusicVisual, musicBlend } from "../../music/musicController";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uColorEpoch;
  uniform float uEpoch;
  uniform float uIntensity;
  uniform float uTime;
  uniform float uSeed;
  uniform float uSync;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  void main() {
    vec2 c = vUv - 0.5;
    float ang = atan(c.y, c.x);
    float wobble = noise(vec2(ang * 1.8 + uSeed * 10.0, uTime * 0.18)) * 0.11;
    float d = length(c) * 2.0 + wobble;

    float core = exp(-d * d * 34.0);
    float inner = exp(-d * d * 10.0) * 0.6;
    float wisp = 1.0 + 0.5 * noise(vec2(ang * 3.0 + uSeed * 20.0, uTime * 0.1));
    float halo = exp(-d * (3.4 / wisp)) * 0.22;

    float breath = 0.92 + 0.08 * sin(uTime * 0.7 + uSeed * 20.0);
    float phase = uSeed * 6.0 * (1.0 - uSync);
    float pulse = 1.0 + 0.22 * pow(max(sin(uTime * 0.31 + phase), 0.0), 3.0);

    vec3 col = mix(uColor, uColorEpoch, uEpoch);
    vec3 finalCol = col * (core * 2.8 + inner * 1.3) + col * halo * 1.0;
    float alpha = (core * 1.2 + inner + halo) * uIntensity * breath * pulse;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(finalCol, alpha);
  }
`;

interface EntityProps {
    which: "a" | "b";
    color: string;
    colorEpoch2: string;
    seed: number;
}

export function Entity({ which, color, colorEpoch2, seed }: EntityProps) {
    const mesh = useRef<THREE.Mesh>(null);
    const mat = useRef<THREE.ShaderMaterial>(null);
    const aware = useRef(0);

    const uniforms = useMemo(() => ({
        uColor: { value: new THREE.Color(color) },
        uColorEpoch: { value: new THREE.Color(colorEpoch2) },
        uEpoch: { value: 0 },
        uIntensity: { value: 0 },
        uTime: { value: 0 },
        uSeed: { value: seed },
        uSync: { value: 0 },
    }), [color, colorEpoch2, seed]);

    useFrame(({ clock }) => {
        if (!mesh.current || !mat.current) return;
        const t = clock.elapsedTime;
        const st = sampleTimeline(getProgress(), t);
        const pos = which === "a" ? st.a : st.b;
        const other = which === "a" ? st.b : st.a;

        // awareness — plus the residual trace after the miss (the second pull)
        const target = st.attraction * (1 - st.darkness) + st.echo * 0.25;
        aware.current += (target - aware.current) * (which === "a" ? 0.03 : 0.016);



        // the lean — a tiny subconscious tendency toward the other
        const dx = other.x - pos.x, dy = other.y - pos.y;
        const len = Math.hypot(dx, dy) || 1;
        mesh.current.position.set(
            pos.x + (dx / len) * aware.current * 0.14,
            pos.y + (dy / len) * aware.current * 0.14,
            0
        );

        // organic asymmetry — neither is ever a perfect circle
        const s = 1.05 + st.warmth * 0.3 + st.connection * 0.12;
        mesh.current.scale.set(
            s * (which === "a" ? 1.045 : 0.985),
            s * (which === "a" ? 0.975 : 1.05),
            1
        );

        const fade = st.entityFade * (which === "b" ? st.bFade : 1) * (1 - st.darkness);
        const mv = getMusicVisual();
        const w = musicBlend(st.warmth, mv.warmth);

        // awareness quietly brightens the presence
        mat.current.uniforms.uIntensity.value =
            fade * (0.75 + w * 0.32) * (1 + aware.current * 0.16) *
            (1 + mv.influence * (mv.glow - 0.5) * 0.8);
        mat.current.uniforms.uEpoch.value = st.epoch;
        mat.current.uniforms.uTime.value = t;
        mat.current.uniforms.uSync.value = st.tension;
        // sync ebbs rather than dying — the encounter leaves a rhythm behind
        mat.current.uniforms.uSync.value = Math.max(st.tension, st.echo * 0.5);
    });

    return (
        <mesh ref={mesh} frustumCulled={false}>
            <planeGeometry args={[4.6, 4.6]} />
            <shaderMaterial
                ref={mat}
                vertexShader={vertex}
                fragmentShader={fragment}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
}