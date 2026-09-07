import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getProgress, getPointer } from "../../utils/progress";
import { sampleTimeline } from "../../scenes/timeline";
import { MOTION } from "../../config/constants";
import { getMusicVisual } from "../../music/musicController";

export function CameraRig({ reducedMotion, isTouch }: { reducedMotion: boolean; isTouch: boolean }) {
    const sway = useRef(new THREE.Vector2());

    useFrame(({ camera, clock }) => {
        const t = clock.elapsedTime;
        const st = sampleTimeline(getProgress(), t);
        const p = getPointer();
        const influence = reducedMotion ? 0 : isTouch ? MOTION.pointerInfluenceTouch : MOTION.pointerInfluence;

        sway.current.x += (p.x * influence - sway.current.x) * 0.02;
        sway.current.y += (p.y * influence - sway.current.y) * 0.02;

        // breathing drift — never static, never busy
        const mv = getMusicVisual();
        const driftAmp = 1 - mv.influence * (1 - mv.motion * 1.3);
        const driftX = reducedMotion ? 0 : Math.sin(t * 0.07) * 0.18 * driftAmp;
        const driftY = reducedMotion ? 0 : Math.cos(t * 0.05) * 0.12 * driftAmp;

        camera.position.x += (sway.current.x + driftX - camera.position.x) * 0.04;
        camera.position.y += (sway.current.y * 0.6 + driftY - camera.position.y) * 0.04;
        camera.position.z += ((st.cameraZ - st.attraction * 0.6) - camera.position.z) * 0.05;
        camera.lookAt(0, 0, 0);
    });

    return null;
}