/*
  Celestial control icons v3 — bold strokes, filled cores, real presence.
*/

const base = {
    width: 21,
    height: 21,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
};

/** a comet — bold head, sweeping tails */
export function PlayIcon() {
    return (
        <svg {...base} className="music-icon">
            <circle cx="16" cy="12" r="3" fill="currentColor" stroke="none" />
            <path d="M12.5 10 C9 8.4 6.5 8 4 8.8" opacity="0.9" />
            <path d="M12.5 12 C9 11.7 6 12.2 3 13.4" opacity="0.55" strokeWidth="1.3" />
            <path d="M12.5 14 C10 15.3 7.5 15.8 5.5 15.4" opacity="0.9" />
            <circle cx="5" cy="6" r="0.8" fill="currentColor" stroke="none" opacity="0.8" />
        </svg>
    );
}

/** the two of them — solid twin lifelines, bound */
export function PauseIcon() {
    return (
        <svg {...base} className="music-icon">
            <path d="M9.3 7 C8.7 10 8.7 14 9.3 17" strokeWidth="2.4" />
            <path d="M14.7 7 C15.3 10 15.3 14 14.7 17" strokeWidth="2.4" />
            <path d="M6.5 9.5 C8.5 6.5 15.5 6.5 17.5 9.5" opacity="0.5" strokeWidth="1.2" />
            <path d="M6.5 14.5 C8.5 17.5 15.5 17.5 17.5 14.5" opacity="0.5" strokeWidth="1.2" />
        </svg>
    );
}

/** shooting star arcing forward */
export function NextIcon() {
    return (
        <svg {...base} className="music-icon">
            <circle cx="16.5" cy="8.5" r="2.6" fill="currentColor" stroke="none" />
            <path d="M14 10.2 C10.5 13.5 7 13.8 3.8 11" opacity="0.9" />
            <path d="M14.8 12 C12.5 15.2 9 16.5 5.8 16" opacity="0.5" strokeWidth="1.3" />
            <circle cx="20.5" cy="5" r="0.9" fill="currentColor" stroke="none" opacity="0.85" />
        </svg>
    );
}

/** mirrored */
export function PrevIcon() {
    return (
        <svg {...base} className="music-icon" style={{ transform: "scaleX(-1)" }}>
            <circle cx="16.5" cy="8.5" r="2.6" fill="currentColor" stroke="none" />
            <path d="M14 10.2 C10.5 13.5 7 13.8 3.8 11" opacity="0.9" />
            <path d="M14.8 12 C12.5 15.2 9 16.5 5.8 16" opacity="0.5" strokeWidth="1.3" />
            <circle cx="20.5" cy="5" r="0.9" fill="currentColor" stroke="none" opacity="0.85" />
        </svg>
    );
}

/** constellation — bold stars, bright four-point center */
export function ConstellationIcon() {
    return (
        <svg {...base} className="music-icon" strokeWidth={1.2}>
            <path d="M4.5 17.5 L10.5 9 L16.5 13.5 L20 5.5" opacity="0.5" />
            <path d="M10.5 5 L10.5 13 M6.5 9 L14.5 9" strokeWidth="1.6" />
            <circle cx="10.5" cy="9" r="1.4" fill="currentColor" stroke="none" />
            <circle cx="4.5" cy="17.5" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="16.5" cy="13.5" r="1.4" fill="currentColor" stroke="none" />
            <circle cx="20" cy="5.5" r="1.1" fill="currentColor" stroke="none" opacity="0.85" />
        </svg>
    );
}

/** orbit ring — now sized to the button vessel */
export function OrbitRing({ spinning }: { spinning: boolean }) {
    return (
        <span className="pointer-events-none absolute inset-[-6px]" aria-hidden>
            <svg width="100%" height="100%" viewBox="0 0 52 52" fill="none"
                className={spinning ? "orbit-spinning" : ""}
                style={{ position: "absolute", inset: 0, transition: "opacity 1.2s ease", opacity: spinning ? 0.8 : 0.25 }}>
                <circle cx="26" cy="26" r="24.5" stroke="currentColor" strokeWidth="1"
                    strokeDasharray="3 8" strokeLinecap="round" />
                <circle cx="26" cy="1.5" r="1.8" fill="currentColor" />
            </svg>
        </span>
    );
}