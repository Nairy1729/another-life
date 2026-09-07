// src/components/ui/ScrollHint.tsx
import { useEffect, useRef } from "react";
import { getProgress } from "../../utils/progress";

export function ScrollHint() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        let raf = 0;
        const loop = () => {
            if (ref.current) {
                const show = getProgress() < 0.005;
                ref.current.style.opacity = show ? "0.5" : "0";
            }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);
    return (
        <div ref={ref}
            className="pointer-events-none fixed bottom-[30%] left-1/2 z-30 -translate-x-1/2 text-[9px] uppercase tracking-[0.5em] text-[#f7f1e3] transition-opacity duration-1000"
            style={{ opacity: 0 }}>
            scroll
        </div>
    );
}