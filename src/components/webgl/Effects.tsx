import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

export function Effects({ enabled }: { enabled: boolean }) {
    if (!enabled) return null;
    return (
        <EffectComposer multisampling={0}>
            <Bloom
                intensity={0.9}
                luminanceThreshold={0.18}
                luminanceSmoothing={0.6}
                mipmapBlur
                radius={0.65}
            />
            <ChromaticAberration offset={[0.0005, 0.0003]} />   {/* was 0.0012 — subliminal */}
            <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.3} />
            <Vignette eskil={false} offset={0.2} darkness={0.9} />
        </EffectComposer>
    );
}