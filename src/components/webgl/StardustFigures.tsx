import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getProgress } from "../../utils/progress";
import { sampleTimeline } from "../../scenes/timeline";
import { envelope } from "../../utils/math";

/*
  Two human figures made of living stardust.
  Skeleton joints are keyframed per pose; poses BLEND (morph) with scroll.
  Each particle lives on a body segment with its own jitter, shimmer and turbulence.
  Joint order: head, neck, chest, waist, footA, footB, elbowF, handF, elbowB, handB
*/

const POSES: Record<string, number[]> = {
    alone: [0.06, 0.98, 0.00, 0.80, 0.00, 0.60, -0.02, 0.10, -0.16, -1.15, 0.10, -1.18, 0.08, 0.30, 0.04, 0.00, -0.10, 0.32, -0.12, 0.02],
    yearning: [0.18, 1.02, 0.12, 0.82, 0.08, 0.60, 0.00, 0.12, -0.16, -1.15, 0.08, -1.18, 0.34, 0.52, 0.62, 0.60, -0.08, 0.30, -0.14, 0.02],
    reaching: [0.30, 1.00, 0.22, 0.80, 0.16, 0.58, 0.02, 0.10, -0.20, -1.15, 0.06, -1.18, 0.55, 0.66, 0.95, 0.72, -0.04, 0.28, -0.12, 0.00],
    turned: [-0.16, 0.98, -0.10, 0.80, -0.06, 0.60, 0.00, 0.12, -0.10, -1.16, 0.14, -1.18, -0.22, 0.34, -0.28, 0.06, 0.06, 0.32, 0.10, 0.04],
};

// when each pose is active on the scroll timeline
const POSE_RANGES: Record<string, [number, number][]> = {
    alone: [[0.00, 0.22], [0.960, 1.00]],
    yearning: [[0.19, 0.31], [0.790, 0.87]],
    reaching: [[0.28, 0.52], [0.600, 0.70], [0.845, 0.97]],
    turned: [[0.50, 0.625], [0.680, 0.78]],
};

// [jointA, jointB, thickness] — head is a disc (A === B)
const SEGMENTS: [number, number, number][] = [
    [0, 0, 0.16],   // head
    [1, 2, 0.075],  // neck
    [2, 3, 0.10],   // torso
    [3, 4, 0.06],   // leg A
    [3, 5, 0.06],   // leg B
    [2, 6, 0.05],   // upper arm (front / reaching)
    [6, 7, 0.04],   // forearm (front)
    [2, 8, 0.05],   // upper arm (back)
    [8, 9, 0.038],  // forearm (back)
];
const SEG_WEIGHTS = [1.5, 0.5, 1.1, 1.3, 1.3, 0.7, 0.7, 0.55, 0.5];

const FIGURE_SCALE = 1.15;
const CAMERA_DIST = 11;

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uFade;
  attribute float aSeed;
  attribute float aSize;
  varying float vSeed;
  void main() {
    vSeed = aSeed;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float shimmer = 0.8 + 0.35 * sin(uTime * (1.5 + aSeed * 2.0) + aSeed * 40.0);
    gl_PointSize = aSize * shimmer * (150.0 / -mv.z) * (0.4 + 0.6 * uFade);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uFade;
  uniform float uTime;
  varying float vSeed;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv) * 2.0;
    float a = exp(-d * d * 4.0);
    if (a < 0.015) discard;
    float tw = 0.7 + 0.3 * sin(uTime * (0.8 + vSeed) + vSeed * 30.0);
    gl_FragColor = vec4(uColor * (1.0 + a * 0.8), a * 0.45 * uFade * tw);
  }
`;

interface FigureData {
    points: THREE.Points;
    mat: THREE.ShaderMaterial;
    posAttr: THREE.BufferAttribute;
    seg: Uint8Array;
    t: Float32Array;
    off: Float32Array;   // -1..1 across thickness (or disc angle for head)
    rad: Float32Array;   // disc radius for head particles
    seed: Float32Array;
}

function buildFigure(count: number, color: string): FigureData {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    const seg = new Uint8Array(count);
    const t = new Float32Array(count);
    const off = new Float32Array(count);
    const rad = new Float32Array(count);

    let s = 4242;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };

    const totalW = SEG_WEIGHTS.reduce((a, b) => a + b, 0);
    const cum: number[] = [];
    SEG_WEIGHTS.reduce((acc, w, i) => { cum[i] = acc + w / totalW; return cum[i]; }, 0);

    for (let i = 0; i < count; i++) {
        const r = rnd();
        seg[i] = cum.findIndex((c) => r <= c);
        if (seg[i] < 0) seg[i] = SEGMENTS.length - 1;
        t[i] = rnd();
        off[i] = rnd() * 2 - 1;
        rad[i] = Math.sqrt(rnd()); // even disc distribution for the head
        seeds[i] = rnd();
        sizes[i] = 1.1 + rnd() * 1.6;
    }

    const geo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(positions, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("position", posAttr);
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
            uTime: { value: 0 },
            uFade: { value: 0 },
            uColor: { value: new THREE.Color(color) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    return { points, mat, posAttr, seg, t, off, rad, seed: seeds };
}

const POSE_NAMES = Object.keys(POSES);
const J = 10; // joints

export function StardustFigures({ count = 900 }: { count?: number }) {
    const groupRef = useRef<THREE.Group>(null!);
    const jx = useRef(new Float32Array(J));
    const jy = useRef(new Float32Array(J));

    const figures = useMemo(
        () => [buildFigure(count, "#ffdfb8"), buildFigure(count, "#c9d6ff")],
        [count]
    );

    const dir = useMemo(() => new THREE.Vector3(), []);

    useFrame(({ camera, clock }) => {
        const time = clock.elapsedTime;
        const p = getProgress();
        const st = sampleTimeline(p, time);
        const cam = camera as THREE.PerspectiveCamera;

        // ---- keep figures glued to the camera view (works at any aspect / camera z)
        const g = groupRef.current;
        dir.set(0, 0, -1).applyQuaternion(cam.quaternion);
        g.position.copy(cam.position).addScaledVector(dir, CAMERA_DIST);
        g.quaternion.copy(cam.quaternion);
        const halfH = Math.tan((cam.fov * Math.PI) / 360) * CAMERA_DIST;
        const halfW = halfH * cam.aspect;
        const edgeX = Math.min(halfW * 0.68, halfW - 1.1);
        const scale = Math.min(FIGURE_SCALE * 1.6, halfW * 0.62);

        // ---- blend skeleton poses by scroll position (this is the MORPH)
        let wSum = 0;
        jx.current.fill(0); jy.current.fill(0);
        for (const name of POSE_NAMES) {
            let w = 0;
            for (const [a, b] of POSE_RANGES[name]) w = Math.max(w, envelope(p, a, b, 0.3));
            if (w <= 0) continue;
            wSum += w;
            const pose = POSES[name];
            for (let j = 0; j < J; j++) {
                jx.current[j] += pose[j * 2] * w;
                jy.current[j] += pose[j * 2 + 1] * w;
            }
        }
        if (wSum > 0.001) {
            for (let j = 0; j < J; j++) { jx.current[j] /= wSum; jy.current[j] /= wSum; }
        }

        // breathing — chest, neck and head rise together, barely
        const breath = Math.sin(time * 0.85) * 0.018;
        jy.current[0] += breath * 1.4; jy.current[1] += breath * 1.2; jy.current[2] += breath;

        const globalFade = st.entityFade * (1 - st.darkness) * (p > 0.03 ? 1 : 0);

        figures.forEach((fig, side) => {
            const mirror = side === 0 ? 1 : -1;          // left faces right, right faces left
            const baseX = side === 0 ? -edgeX : edgeX;
            const sideFade = side === 1 ? st.bFade : 1;  // the right figure is the one who leaves
            const arr = fig.posAttr.array as Float32Array;

            for (let i = 0; i < count; i++) {
                const sIdx = fig.seg[i];
                const [a, b, thk] = SEGMENTS[sIdx];
                let x: number, y: number;

                if (a === b) {
                    // head — disc of stardust
                    const ang = fig.off[i] * Math.PI + fig.t[i] * Math.PI;
                    x = jx.current[a] + Math.cos(ang) * thk * fig.rad[i];
                    y = jy.current[a] + Math.sin(ang) * thk * fig.rad[i];
                } else {
                    const tt = fig.t[i];
                    const ax = jx.current[a], ay = jy.current[a];
                    const bx = jx.current[b], by = jy.current[b];
                    x = ax + (bx - ax) * tt;
                    y = ay + (by - ay) * tt;
                    // perpendicular thickness
                    const dx = bx - ax, dy = by - ay;
                    const len = Math.hypot(dx, dy) || 1;
                    x += (-dy / len) * fig.off[i] * thk;
                    y += (dx / len) * fig.off[i] * thk;
                }

                // living turbulence — the "boil"
                const sd = fig.seed[i];
                x += Math.sin(time * (0.9 + sd * 1.6) + sd * 50.0) * 0.022;
                y += Math.cos(time * (0.7 + sd * 1.3) + sd * 70.0) * 0.022;

                // collapse: the figure scatters into the universe
                const scatter = st.dissolve * (1.2 + sd * 2.5);
                x += x * scatter;
                y += y * scatter;

                arr[i * 3] = (x * mirror * scale) + baseX;
                arr[i * 3 + 1] = y * scale - 0.3;
                arr[i * 3 + 2] = Math.sin(sd * 90.0) * 0.15; // slight depth so bloom feels volumetric
            }
            fig.posAttr.needsUpdate = true;
            fig.mat.uniforms.uTime.value = time;
            fig.mat.uniforms.uFade.value = globalFade * sideFade;
        });
    });

    return (
        <group ref={groupRef}>
            <primitive object={figures[0].points} />
            <primitive object={figures[1].points} />
        </group>
    );
}