import { useEffect, useRef } from "react";
import { getProgress } from "../../utils/progress";
import { ENDING } from "../../data/story";

interface EndingProps {
    onRestart: () => void;
    hidden?: boolean; // suppressed while the story loops itself
}

export function Ending({ onRestart, hidden = false }: EndingProps) {
    const ref = useRef<HTMLButtonElement>(null);
    const hiddenRef = useRef(hidden);

    useEffect(() => { hiddenRef.current = hidden; }, [hidden]);

    useEffect(() => {
        let raf = 0;
        const loop = () => {
            if (ref.current) {
                const show = getProgress() > 0.988 && !hiddenRef.current;
                ref.current.style.opacity = show ? "0.75" : "0";
                ref.current.style.pointerEvents = show ? "auto" : "none";
            }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <button
            ref={ref}
            onClick={onRestart}
            className="ui-lit fixed left-1/2 top-[62%] z-30 -translate-x-1/2 cursor-pointer
        border-b border-[#f7f1e3]/25 pb-1 text-[11px] uppercase tracking-[0.5em]
        text-[#f7f1e3] transition-opacity duration-1000 hover:!opacity-100"
            style={{ opacity: 0, pointerEvents: "none" }}
        >
            {ENDING.action}
        </button>
    );
}