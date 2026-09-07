import { useEffect, useState } from "react";
import { ABOUT } from "../../data/story";

export function StoryAbout() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <>
            {/* the spine — vertical credit along the right edge */}
            <div className="pointer-events-none fixed right-2 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-6 [writing-mode:vertical-rl]">
                <button
                    onClick={() => setOpen(true)}
                    aria-label="About this story"
                    className="ui-lit-gold pointer-events-auto cursor-pointer text-[9px] uppercase tracking-[0.5em] text-[#ffdfb8]/60 transition-colors hover:text-[#ffdfb8]"
                >
                    {ABOUT.trigger}
                </button>
                <span className="text-[8px] uppercase tracking-[0.45em] text-[#f7f1e3]/30 select-none">
                    {ABOUT.byline}
                </span>
            </div>

            {/* the story — a quiet page inside the universe */}
            <div
                className="fixed inset-0 z-[80] overflow-y-auto bg-[#050508]/[0.97] transition-opacity duration-700"
                style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
                aria-hidden={!open}
            >
                <div className="mx-auto flex min-h-full w-[min(90vw,540px)] flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+48px)] pt-[calc(env(safe-area-inset-top)+56px)]">
                    <button
                        aria-label="Close"
                        onClick={() => setOpen(false)}
                        className="absolute right-6 top-[calc(env(safe-area-inset-top)+18px)] h-11 w-11 cursor-pointer text-[18px] text-[#f7f1e3]/50 transition-colors hover:text-[#f7f1e3]"
                    >
                        ×
                    </button>

                    <h2 className="serif story-text text-center text-[clamp(1.3rem,5vw,1.9rem)] italic">
                        {ABOUT.title}
                    </h2>

                    <div className="mt-10 space-y-6">
                        {ABOUT.paragraphs.map((p, i) => (
                            <p key={i} className="serif text-center text-[14px] leading-[1.9] text-[#f7f1e3]/75">
                                {p}
                            </p>
                        ))}
                    </div>

                    <div className="mx-auto mt-12 h-px w-16 bg-[#f7f1e3]/20" />

                    <div className="mt-10 space-y-3">
                        {ABOUT.howTo.map((h, i) => (
                            <p key={i} className="text-center text-[10px] uppercase tracking-[0.3em] text-[#b3a6f5]/60">
                                {h}
                            </p>
                        ))}
                    </div>

                    <p className="mt-14 text-center text-[9px] uppercase tracking-[0.45em] text-[#f7f1e3]/30">
                        {ABOUT.byline}
                    </p>
                </div>
            </div>
        </>
    );
}