import { PlayIcon, PauseIcon } from "../music/MusicIcons";

/** endless orbit — a cycle with no arrival */
function LoopIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="music-icon">
            <path d="M19.5 12 A7.5 7.5 0 1 1 12 4.5" />
            <path d="M12 4.5 L14.6 3.2" />
            <path d="M12 4.5 L14.4 6.4" />
            <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
        </svg>
    );
}

interface AutoPlayProps {
    playing: boolean;
    looping: boolean;
    onToggle: () => void;
    onToggleLoop: () => void;
}

export function AutoPlay({ playing, looping, onToggle, onToggleLoop }: AutoPlayProps) {
    return (
        <div className="fixed left-1/2 top-[calc(env(safe-area-inset-top)+16px)] z-40 flex -translate-x-1/2 items-start gap-4">
            <button
                onClick={onToggle}
                aria-label={playing ? "Pause the story" : "Watch the story play automatically"}
                className="flex cursor-pointer flex-col items-center gap-1.5"
            >
                <span className={`vessel glow-ember relative flex h-10 w-10 items-center justify-center rounded-full text-[#ffdfb8] ${playing ? "orbit-spinning-slow" : ""}`}>
                    {playing ? <PauseIcon /> : <PlayIcon />}
                </span>
                <span className="ui-lit-gold text-[8px] uppercase tracking-[0.45em] text-[#ffdfb8]/70">
                    {playing ? "pause" : "watch"}
                </span>
            </button>

            <button
                onClick={onToggleLoop}
                aria-label={looping ? "Stop looping the story" : "Play the story on loop"}
                className="flex cursor-pointer flex-col items-center gap-1.5"
            >
                <span
                    className={`vessel glow-violet relative flex h-10 w-10 items-center justify-center rounded-full text-[#b3a6f5] ${looping ? "orbit-spinning-slow" : ""}`}
                    style={{ opacity: looping ? 1 : undefined }}
                >
                    <LoopIcon />
                </span>
                <span className="ui-lit text-[8px] uppercase tracking-[0.45em] text-[#b3a6f5]/70">
                    {looping ? "looping" : "loop"}
                </span>
            </button>
        </div>
    );
}