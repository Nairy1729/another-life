import { useEffect, useRef } from "react";
import { WHISPERS } from "../../data/story";
import { getProgress } from "../../utils/progress";
import { envelope } from "../../utils/math";

const TONE: Record<string, string> = {
    warm: "#f2e2c8",
    cold: "#aab4d4",
    crimson: "#c05a68",
};

export function Whispers() {
    const refs = useRef<(HTMLSpanElement | null)[]>([]);

    useEffect(() => {
        let raf = 0;
        const loop = () => {
            const p = getProgress();
            WHISPERS.forEach((w, i) => {
                const el = refs.current[i];
                if (!el) return;
                const o = envelope(p, w.start, w.end, 0.3);
                // drift progresses across the word's lifetime
                const life = Math.min(Math.max((p - w.start) / (w.end - w.start), 0), 1);
                el.style.opacity = String(o * 0.3);
                el.style.visibility = o > 0.001 ? "visible" : "hidden";
                el.style.transform =
                    `translate(${life * w.drift}px, ${life * -14}px)`;
                el.style.filter = `blur(${(1 - o) * 4}px)`;
            });
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 z-20 select-none" aria-hidden>
            {WHISPERS.map((w, i) => (
                <span
                    key={`${w.word}-${i}`}
                    ref={(el) => { refs.current[i] = el; }}
                    className="serif absolute italic font-light tracking-[0.08em] text-[clamp(0.85rem,2.6vw,1.15rem)]"
                    style={{
                        left: `${w.x}%`,
                        top: `${w.y}%`,
                        color: TONE[w.tone],
                        opacity: 0,
                        visibility: "hidden",
                        textShadow: "0 0 18px rgba(236,230,218,0.25)",
                    }}
                >
                    {w.word}
                </span>
            ))}
        </div>
    );
}