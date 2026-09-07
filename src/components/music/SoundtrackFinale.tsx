import { useEffect, useState } from "react";
import { useMusicState } from "../../hooks/useYouTubePlayer";
import { musicStore } from "../../music/musicController";

export function SoundtrackFinale() {
    const ms = useMusicState();
    const [line2, setLine2] = useState(false);

    useEffect(() => {
        if (!ms.finished) { setLine2(false); return; }
        const t = setTimeout(() => setLine2(true), 3200);
        return () => clearTimeout(t);
    }, [ms.finished]);

    if (!ms.finished) return null;

    return (
        <div
            className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-[#050508]/95 px-8 text-center"
            onClick={() => musicStore.set({ finished: false, soundtrackMode: false })}
        >
            <p className="serif story-text text-[clamp(1.2rem,4.6vw,1.9rem)] italic text-[#f7f1e3] transition-opacity duration-[2500ms]">
                Maybe the songs weren&rsquo;t about them.
            </p>
            <p
                className="serif story-text mt-6 text-[clamp(1rem,3.8vw,1.5rem)] italic text-[#f7f1e3]/80 transition-opacity duration-[2500ms]"
                style={{ opacity: line2 ? 1 : 0 }}
            >
                Maybe they were about us.
            </p>
            {/* no auto-restart — a tap anywhere quietly dismisses */}
        </div>
    );
}