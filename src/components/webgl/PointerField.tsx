import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getPointer, setPointerWorld } from "../../utils/progress";

const TRAIL = 28;

const vertex = /* glsl */ `
  attribute float aIndex;
  varying float vFade;
  void main() {
    vFade = 1.0 - aIndex / ${TRAIL}.0;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (2.0 + vFade * 7.0) * (140.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  uniform float uOpacity;
  varying float vFade;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv) * 2.0;
    float a = exp(-d * d * 5.0) * vFade * vFade * uOpacity;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vec3(0.95, 0.90, 0.82), a * 0.35);
  }
`;

export function PointerField({ motionScale }: { motionScale: number }) {
    const geoRef = useRef<THREE.BufferGeometry>(null!);
    const matRef = useRef<THREE.ShaderMaterial>(null!);

    const { trailObject, positions } = useMemo(() => {
        const positions = new Float32Array(TRAIL * 3);
        const indices = new Float32Array(TRAIL);
        for (let i = 0; i < TRAIL; i++) indices[i] = i;

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geo.setAttribute("aIndex", new THREE.BufferAttribute(indices, 1));

        const mat = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            uniforms: { uOpacity: { value: 0 } },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        geoRef.current = geo;
        matRef.current = mat;

        const pts = new THREE.Points(geo, mat);
        pts.frustumCulled = false;
        return { trailObject: pts, positions };
    }, []);

    const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
    const raycaster = useMemo(() => new THREE.Raycaster(), []);
    const ndc = useMemo(() => new THREE.Vector2(), []);
    const hit = useMemo(() => new THREE.Vector3(), []);
    const speed = useRef(0);
    const last = useRef(new THREE.Vector2());

    useFrame(({ camera }) => {
        const p = getPointer();
        ndc.set(p.x, p.y);
        raycaster.setFromCamera(ndc, camera);

        if (raycaster.ray.intersectPlane(plane, hit)) {
            setPointerWorld(hit.x, hit.y);

            // trail: shift history back, head follows pointer
            for (let i = TRAIL - 1; i > 0; i--) {
                positions[i * 3] = positions[(i - 1) * 3];
                positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
                positions[i * 3 + 2] = positions[(i - 1) * 3 + 2];
            }
            positions[0] = hit.x;
            positions[1] = hit.y;
            positions[2] = 0.5;
            geoRef.current.attributes.position.needsUpdate = true;

            // trail only visible while moving — invisible when still (restraint)
            const moved = Math.hypot(hit.x - last.current.x, hit.y - last.current.y);
            last.current.set(hit.x, hit.y);
            const target = Math.min(moved * 6.0, 1.0) * motionScale;
            speed.current += (target - speed.current) * 0.06;
            matRef.current.uniforms.uOpacity.value = speed.current;
        }
    });

    return <primitive object={trailObject} />;
}