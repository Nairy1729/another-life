import { useEffect } from "react";
import { musicApi, useMusicState } from "../../hooks/useYouTubePlayer";
import { musicStore } from "../../music/musicController";
import { CHAPTERS, PLAYLIST } from "../../data/playlist";

export function PlaylistDrawer() {
    const ms = useMusicState();

    // esc to close
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") musicStore.set({ drawerOpen: false });
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <div
            className="fixed inset-0 z-[60] overflow-y-auto bg-[#050508]/[0.96] transition-opacity duration-700"
            style={{
                opacity: ms.drawerOpen ? 1 : 0,
                pointerEvents: ms.drawerOpen ? "auto" : "none",
            }}
            aria-hidden={!ms.drawerOpen}
        >
            <div className="mx-auto flex min-h-full w-[min(92vw,460px)] flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+40px)] pt-[calc(env(safe-area-inset-top)+52px)]">

                <button
                    aria-label="Close"
                    onClick={() => musicStore.set({ drawerOpen: false })}
                    className="absolute right-6 top-[calc(env(safe-area-inset-top)+18px)] h-11 w-11 cursor-pointer text-[18px] text-[#f7f1e3]/50 transition-colors hover:text-[#f7f1e3]"
                >
                    ×
                </button>

                <h2 className="text-center text-[13px] uppercase tracking-[0.55em] text-[#f7f1e3]">
                    The Soundtrack
                </h2>
                <p className="serif mt-2 text-center text-[13px] italic text-[#f7f1e3]/50">
                    The songs that stayed.
                </p>

                <button
                    onClick={() => musicApi.startSoundtrack()}
                    className="serif mx-auto mt-8 cursor-pointer border-b border-[#c05a68]/40 pb-1 text-[12px] italic tracking-[0.1em] text-[#c05a68]/90 transition-colors hover:text-[#c05a68]"
                >
                    tonight&rsquo;s soundtrack — for nights you can&rsquo;t sleep
                </button>

                <div className="mt-10 space-y-10">
                    {CHAPTERS.map((ch) => (
                        <section key={ch.id}>
                            <h3 className="mb-4 text-[10px] uppercase tracking-[0.45em] text-[#f7f1e3]/40">
                                {ch.numeral} — {ch.title}
                            </h3>
                            <ul className="space-y-1">
                                {PLAYLIST.map((song, i) =>
                                    song.chapter !== ch.id ? null : (
                                        <li key={song.id}>
                                            <button
                                                onClick={() => {
                                                    musicApi.select(i);
                                                    musicStore.set({ drawerOpen: false, soundtrackMode: false });
                                                }}
                                                className="group flex w-full cursor-pointer items-baseline gap-4 py-2.5 text-left"
                                            >
                                                <span className="w-6 text-[10px] tabular-nums text-[#f7f1e3]/25">
                                                    {String(i + 1).padStart(2, "0")}
                                                </span>
                                                <span
                                                    className={`serif flex-1 text-[16px] transition-colors ${ms.index === i && ms.loaded
                                                        ? "text-[#c05a68]"
                                                        : "text-[#f7f1e3]/85 group-hover:text-[#f7f1e3]"
                                                        }`}
                                                >
                                                    {song.title}
                                                </span>
                                                <span className="text-[9px] uppercase tracking-[0.2em] text-[#f7f1e3]/35">
                                                    {song.albumOrFilm}
                                                </span>
                                            </button>
                                        </li>
                                    )
                                )}
                            </ul>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}