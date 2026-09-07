import { useState } from "react";
import { useYouTubeEngine } from "../../hooks/useYouTubePlayer";

export function YouTubePlayer() {
    useYouTubeEngine("yt-engine");
    const [tucked, setTucked] = useState(true);

    return (
        <div
            className="fixed bottom-28 right-0 z-40 flex items-center transition-transform duration-700"
            style={{ transform: tucked ? "translateX(200px)" : "translateX(0)" }}
        >
            <button
                onClick={() => setTucked(!tucked)}
                aria-label={tucked ? "show video player" : "hide video player"}
                className="flex h-12 w-7 cursor-pointer items-center justify-center rounded-l-md
          border border-r-0 border-[#f7f1e3]/15 bg-[#050508]/80 text-[10px] text-[#f7f1e3]/60"
            >
                {tucked ? "‹" : "›"}
            </button>
            <div className="overflow-hidden rounded-l-sm border border-r-0 border-[#f7f1e3]/15 opacity-90">
                <div id="yt-engine" style={{ width: 200, height: 200 }} />
            </div>
        </div>
    );
}