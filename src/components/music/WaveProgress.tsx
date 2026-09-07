import { useEffect, useRef, useState } from "react";
import { musicApi } from "../../hooks/useYouTubePlayer";

/* one gentle sine wave, 20 half-periods across 300 units */
const WAVE_PATH =
    "M0 12 Q7.5 4 15 12 T30 12 T45 12 T60 12 T75 12 T90 12 T105 12 T120 12 " +
    "T135 12 T150 12 T165 12 T180 12 T195 12 T210 12 T225 12 T240 12 " +
    "T255 12 T270 12 T285 12 T300 12";

export function WaveProgress() {
    const wrapRef = useRef<HTMLDivElement>(null);
    const fillRef = useRef<SVGPathElement>(null);
    const measureRef = useRef<SVGPathElement>(null);
    const dotRef = useRef<SVGCircleElement>(null);
    const [dragging, setDragging] = useState(false);
    const dragFrac = useRef(0);

    useEffect(() => {
        let raf = 0;
        const loop = () => {
            const d = musicApi.getDuration();
            const frac = dragging
                ? dragFrac.current
                : d > 0 ? musicApi.getCurrentTime() / d : 0;

            const fill = fillRef.current, measure = measureRef.current, dot = dotRef.current;
            if (fill && measure && dot) {
                const total = measure.getTotalLength();
                fill.style.strokeDasharray = `${frac * total} ${total}`;
                const pt = measure.getPointAtLength(frac * total);
                dot.setAttribute("cx", String(pt.x));
                dot.setAttribute("cy", String(pt.y));
            }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, [dragging]);

    const fracFromEvent = (e: React.PointerEvent) => {
        const r = wrapRef.current!.getBoundingClientRect();
        return Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
    };
    const onPointerDown = (e: React.PointerEvent) => {
        setDragging(true);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        dragFrac.current = fracFromEvent(e);
    };
    const onPointerMove = (e: React.PointerEvent) => {
        if (dragging) dragFrac.current = fracFromEvent(e);
    };
    const onPointerUp = (e: React.PointerEvent) => {
        dragFrac.current = fracFromEvent(e);
        setDragging(false);
        musicApi.seek(dragFrac.current); // single seek on release
    };

    return (
        <div
            ref={wrapRef}
            role="slider" aria-label="Seek" tabIndex={0}
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
            className="relative h-11 flex-1 cursor-pointer touch-none"
        >
            <svg
                className="absolute inset-x-0 top-1/2 h-6 w-full -translate-y-1/2 overflow-visible"
                viewBox="0 0 300 24" preserveAspectRatio="none" fill="none"
            >
                <defs>
                    <linearGradient id="waveGrad" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#8b7fd4" />
                        <stop offset="0.45" stopColor="#c05a68" />
                        <stop offset="1" stopColor="#ffd9ae" />
                    </linearGradient>
                </defs>

                {/* dim violet wave — the road not yet travelled */}
                <path d={WAVE_PATH} stroke="#8b7fd4" strokeOpacity="0.16" strokeWidth="1.1" />
                {/* invisible measuring twin */}
                <path ref={measureRef} d={WAVE_PATH} stroke="none" />
                {/* the played light — cold past to warm now */}
                <path
                    ref={fillRef}
                    d={WAVE_PATH}
                    stroke="url(#waveGrad)" strokeWidth="1.3" strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 5px rgba(192,90,104,0.7))", strokeDasharray: "0 9999" }}
                />
                {/* the travelling ember */}
                <circle
                    ref={dotRef}
                    cx="0" cy="12" r="2.1" fill="#ffd9ae"
                    style={{ filter: "drop-shadow(0 0 7px rgba(255,180,120,0.95)) drop-shadow(0 0 14px rgba(192,90,104,0.5))" }}
                />
            </svg>
        </div>
    );
}