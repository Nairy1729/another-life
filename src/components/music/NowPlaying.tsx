import { useEffect, useRef } from "react";
import { musicApi, useMusicState } from "../../hooks/useYouTubePlayer";
import { currentSong, musicStore } from "../../music/musicController";
import { CHAPTERS } from "../../data/playlist";
import { WaveProgress } from "./WaveProgress";
import {
    PlayIcon,
    PauseIcon,
    NextIcon,
    PrevIcon,
    ConstellationIcon,
    OrbitRing,
} from "./MusicIcons";
import { getProgress } from "../../utils/progress";

function fmt(s: number) {
    if (!isFinite(s) || s <= 0) return "0:00";
    const m = Math.floor(s / 60);
    return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export function NowPlaying() {
    const ms = useMusicState();
    const song = currentSong();
    const chapter = CHAPTERS.find((c) => c.id === song.chapter);

    const timeRef = useRef<HTMLSpanElement>(null);
    const durRef = useRef<HTMLSpanElement>(null);
    const dockRef = useRef<HTMLDivElement>(null);

    // time labels + finale fade — rAF, throttled to ~4 Hz, zero re-renders
    useEffect(() => {
        let raf = 0, acc = 0;
        const loop = () => {
            if ((acc = (acc + 1) % 15) === 0) {
                if (timeRef.current) timeRef.current.textContent = fmt(musicApi.getCurrentTime());
                if (durRef.current) durRef.current.textContent = fmt(musicApi.getDuration());
                // the dock steps back for the finale
                if (dockRef.current) {
                    const p = getProgress();
                    dockRef.current.style.opacity = p > 0.955 ? "0.18" : "1";
                }
            }
            raf = requestAnimationFrame(loop);   // ← the line that was missing
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    // desktop keyboard
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.target as HTMLElement)?.tagName === "INPUT") return;
            if (e.code === "Space") { e.preventDefault(); musicApi.togglePlay(); }
            if (e.code === "ArrowRight" && e.shiftKey) musicApi.next();
            if (e.code === "ArrowLeft" && e.shiftKey) musicApi.previous();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    /* first meaningful interaction — nothing plays before this */
    if (!ms.loaded) {
        return (
            <button
                onClick={() => musicApi.select(0)}
                className="ui-lit-gold fixed bottom-0 left-1/2 z-40 -translate-x-1/2 cursor-pointer pb-[calc(env(safe-area-inset-bottom)+26px)]
          text-[11px] uppercase tracking-[0.45em] text-[#ffdfb8]/85 transition-colors hover:text-[#ffdfb8]"
            >
                play soundtrack
            </button>
        );
    }

    return (
        <div
            ref={dockRef}
            className="fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[calc(env(safe-area-inset-bottom)+14px)] transition-opacity duration-1000"
        >
            <div className="w-[min(92vw,420px)] select-none px-2 text-center">

                {ms.autoplayHint && (
                    <button
                        onClick={() => musicApi.play()}
                        className="serif ui-lit mb-2 block w-full cursor-pointer text-[12px] italic text-[#f7f1e3]/80"
                    >
                        Tap to begin the soundtrack
                    </button>
                )}
                {ms.unavailable && (
                    <p className="serif ui-lit-crimson mb-2 text-[12px] italic text-[#e8859a]">
                        This song isn&rsquo;t available here.
                    </p>
                )}

                {/* song identity */}
                <div className="mb-1 leading-tight">
                    <div className="serif ui-lit-gold text-[15px] tracking-[0.06em] text-[#ffdfb8]">
                        {song.title}
                    </div>
                    <div className="ui-lit mt-1 text-[10px] uppercase tracking-[0.3em] text-[#f7f1e3]/80">
                        {song.artist} · {song.albumOrFilm}
                    </div>
                    <div className="ui-lit-crimson mt-0.5 text-[9px] uppercase tracking-[0.35em] text-[#e8859a]/90">
                        {chapter?.numeral} — {chapter?.title} · {song.mood}
                    </div>
                </div>

                {/* progress — the light-wave */}
                <div className="flex items-center gap-2">
                    <span ref={timeRef} className="w-8 text-right text-[9px] tabular-nums text-[#f7f1e3]/55">0:00</span>
                    <WaveProgress />
                    <span ref={durRef} className="w-8 text-[9px] tabular-nums text-[#f7f1e3]/55">0:00</span>
                </div>

                {/* transport — recessed vessels, part of the artwork */}
                <div className="mt-2 flex items-center justify-center gap-6">
                    <button
                        aria-label="Previous"
                        onClick={() => musicApi.previous()}
                        className="vessel glow-violet flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[#b3a6f5]"
                    >
                        <PrevIcon />
                    </button>

                    <button
                        aria-label={ms.playing ? "Pause" : "Play"}
                        onClick={() => musicApi.togglePlay()}
                        className="vessel vessel-main glow-ember relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-[#ffdfb8]"
                    >
                        <OrbitRing spinning={ms.playing} />
                        {ms.playing ? <PauseIcon /> : <PlayIcon />}
                    </button>

                    <button
                        aria-label="Next"
                        onClick={() => musicApi.next()}
                        className="vessel glow-violet flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[#b3a6f5]"
                    >
                        <NextIcon />
                    </button>

                    <button
                        aria-label="Playlist"
                        onClick={() => musicStore.set({ drawerOpen: true })}
                        className="vessel glow-crimson flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[#e8859a]"
                    >
                        <ConstellationIcon />
                    </button>
                </div>
            </div>
        </div>
    );
}