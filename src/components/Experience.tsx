import { Canvas } from "@react-three/fiber";
import { Particles } from "./webgl/Particles";
import { Entity } from "./webgl/Entity";
import { ConnectionThread } from "./webgl/ConnectionThread";
import { Nebula } from "./webgl/Nebula";
import { CameraRig } from "./webgl/CameraRig";
import { Effects } from "./webgl/Effects";
import { PALETTE } from "../config/palette";
import { useQuality } from "../hooks/useQuality";
import { PointerField } from "./webgl/PointerField";
import { StardustFigures } from "./webgl/StardustFigures";

export function Experience({ reducedMotion }: { reducedMotion: boolean }) {
    const q = useQuality();
    const motionScale = reducedMotion ? 0.25 : 1;

    return (
        <div className="fixed inset-0 z-0">
            <Canvas
                dpr={q.dpr}
                gl={{ antialias: false, powerPreference: "high-performance" }}
                camera={{ position: [0, 0, 17], fov: 50, near: 0.1, far: 120 }}
            >
                <color attach="background" args={[PALETTE.void]} />
                <Nebula />
                <Particles dust={q.dust} stars={q.stars} motionScale={motionScale} />
                <ConnectionThread />
                <Entity which="a" color={PALETTE.entityA} colorEpoch2={PALETTE.entityAEpoch2} seed={0.31} />
                <Entity which="b" color={PALETTE.entityB} colorEpoch2={PALETTE.entityBEpoch2} seed={0.77} />
                <StardustFigures count={q.tier === "desktop" ? 900 : 500} />
                <CameraRig reducedMotion={reducedMotion} isTouch={q.isTouch} />
                <PointerField motionScale={motionScale} />
                <Effects enabled={q.postFx} />
            </Canvas>
        </div>
    );
}