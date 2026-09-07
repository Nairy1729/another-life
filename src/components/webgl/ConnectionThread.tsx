import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getProgress } from "../../utils/progress";
import { sampleTimeline } from "../../scenes/timeline";
import { PALETTE } from "../../config/palette";

const SEGMENTS = 96;

const vertex = /* glsl */ `
  uniform vec3 uA;
  uniform vec3 uB;
  uniform float uTime;
  uniform float uStrength;
  attribute float aT;
  varying float vT;

  void main() {
    vT = aT;
    vec3 p = mix(uA, uB, aT);

    vec3 dir = normalize(uB - uA + vec3(0.0001));
    vec3 perp = normalize(cross(dir, vec3(0.0, 0.0, 1.0)));
    float envelope = sin(aT * 3.14159);
    // calmed undulation — a breath, not a vibration
    float wave = sin(aT * 9.0 - uTime * 1.1) * 0.10
               + sin(aT * 23.0 + uTime * 1.6) * 0.035;
    p += perp * wave * envelope * (0.4 + uStrength);
    p.z += sin(aT * 6.0 + uTime * 0.9) * 0.06 * envelope;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform float uTime;
  uniform float uStrength;
  uniform vec3 uColor;
  varying float vT;

  void main() {
    float envelope = sin(vT * 3.14159);
    float flow = 0.55 + 0.45 * sin(vT * 26.0 - uTime * 2.2);
    float fraying = clamp(1.0 - uStrength * 1.6, 0.0, 1.0);
    float breakup = mix(1.0, 0.4 + 0.6 * sin(vT * 34.0 + uTime * 1.3), fraying);
    float alpha = uStrength * envelope * (0.24 + 0.3 * flow) * breakup;
    if (alpha < 0.005) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

export function ConnectionThread() {
    const matRef = useRef<THREE.ShaderMaterial>(null!);

    const lineObject = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(SEGMENTS * 3);
        const ts = new Float32Array(SEGMENTS);
        for (let i = 0; i < SEGMENTS; i++) ts[i] = i / (SEGMENTS - 1);
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geo.setAttribute("aT", new THREE.BufferAttribute(ts, 1));

        const material = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            uniforms: {
                uA: { value: new THREE.Vector3() },
                uB: { value: new THREE.Vector3() },
                uTime: { value: 0 },
                uStrength: { value: 0 },
                uColor: { value: new THREE.Color(PALETTE.thread) },
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        matRef.current = material;

        const line = new THREE.Line(geo, material);
        line.frustumCulled = false;
        return line;
    }, []);

    useEffect(() => {
        return () => {
            lineObject.geometry.dispose();
            (lineObject.material as THREE.ShaderMaterial).dispose();
        };
    }, [lineObject]);

    useFrame(({ clock }) => {
        const m = matRef.current;
        if (!m) return;
        const t = clock.elapsedTime;
        const st = sampleTimeline(getProgress(), t);

        m.uniforms.uA.value.set(st.a.x, st.a.y, 0);
        m.uniforms.uB.value.set(st.b.x, st.b.y, 0);
        m.uniforms.uTime.value = t;

        // filaments that exist before the connection — felt, not seen
        const pre = st.attraction * 0.12;
        m.uniforms.uStrength.value = Math.max(st.connection, pre) * (1 - st.darkness);
    });

    return <primitive object={lineObject} />;
}