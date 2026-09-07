import { useEffect, useRef } from "react";
import { STORY } from "../../data/story";
import { getProgress } from "../../utils/progress";
import { envelope, clamp01 } from "../../utils/math";

const SIZE: Record<string, string> = {
    lg: "text-[clamp(1.7rem,6.4vw,3.2rem)]",
    md: "text-[clamp(1.35rem,5vw,2.4rem)]",
    sm: "text-[clamp(0.95rem,3.4vw,1.3rem)] tracking-[0.14em] opacity-80",
};

export function StoryLayer() {
    const refs = useRef<(HTMLDivElement | null)[]>([]);
    const lineRefs = useRef<HTMLSpanElement[][]>([]);
    const scrimRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let raf = 0;
        const loop = () => {
            const p = getProgress();

            STORY.forEach((cue, i) => {
                const el = refs.current[i];
                if (!el) return;
                const o = envelope(p, cue.start, cue.end);
                el.style.opacity = String(o);
                el.style.visibility = o > 0.001 ? "visible" : "hidden";

                // line-by-line reveal inside the cue window
                const lines = lineRefs.current[i] ?? [];
                const span = cue.end - cue.start;
                lines.forEach((line, li) => {
                    const lineStart = cue.start + (span * 0.55 * li) / Math.max(lines.length, 1);
                    const lo = clamp01((p - lineStart) / (span * 0.16));
                    line.style.opacity = String(lo);
                    line.style.transform = `translateY(${(1 - lo) * 10}px)`;
                    line.style.filter = `blur(${(1 - lo) * 5}px)`;
                });
            });

            // scrim: quiet pocket of darkness behind whichever cue is strongest
            let maxO = 0;
            STORY.forEach((cue) => {
                maxO = Math.max(maxO, envelope(p, cue.start, cue.end));
            });
            if (scrimRef.current) scrimRef.current.style.opacity = String(maxO);

            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center">
            <div ref={scrimRef} className="text-scrim" />
            {STORY.map((cue, i) => (
                <div
                    key={cue.id}
                    ref={(el) => { refs.current[i] = el; }}
                    className="absolute inset-x-8 top-[42%] -translate-y-1/2 text-center"
                    style={{ opacity: 0, visibility: "hidden" }}
                >
                    {cue.lines.map((line, li) => (
                        <span
                            key={li}
                            ref={(el) => {
                                if (!el) return;
                                (lineRefs.current[i] ??= [])[li] = el;
                            }}
                            className={`serif story-text block font-normal leading-[1.55] ${SIZE[cue.size ?? "md"]}`}
                            style={{ opacity: 0 }}
                        >
                            {line}
                        </span>
                    ))}
                </div>
            ))}
        </div>
    );
}