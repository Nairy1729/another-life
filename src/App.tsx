import { useCallback, useEffect, useRef, useState } from "react";
import { Experience } from "./components/Experience";
import { Intro } from "./components/ui/Intro";
import { StoryLayer } from "./components/ui/StoryLayer";
import { Whispers } from "./components/ui/Whispers";
import { Ending } from "./components/ui/Ending";
import { AutoPlay } from "./components/ui/AutoPlay";
import { StoryAbout } from "./components/ui/StoryAbout";
import { ScrollHint } from "./components/ui/ScrollHint";
import { YouTubePlayer } from "./components/music/YouTubePlayer";
import { NowPlaying } from "./components/music/NowPlaying";
import { PlaylistDrawer } from "./components/music/PlaylistDrawer";
import { SoundtrackFinale } from "./components/music/SoundtrackFinale";
import { useLenis } from "./hooks/useLenis";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { setPointer, triggerRipple, getProgress } from "./utils/progress";
import { SCROLL } from "./config/constants";
import { CustomCursor } from "./components/ui/CustomCursor";

const STORY_DURATION = 150; // seconds for the full auto-played story
const LOOP_HOLD = 1400;     // ms of black held between loops

export default function App() {
  const [entered, setEntered] = useState(false);
  const [watching, setWatching] = useState(false);
  const [looping, setLooping] = useState(false);
  const loopRef = useRef(false);
  const reducedMotion = useReducedMotion();
  const lenis = useLenis(entered);

  useEffect(() => { loopRef.current = looping; }, [looping]);

  const playStory = useCallback(function play(fromTop: boolean) {
    const l = lenis.current;
    if (!l) return;
    if (fromTop) l.scrollTo(0, { immediate: true });
    const limit = document.documentElement.scrollHeight - window.innerHeight;
    const remaining = fromTop ? 1 : Math.max(1 - getProgress(), 0.02);
    l.scrollTo(limit, {
      duration: STORY_DURATION * remaining, // constant narrative speed
      easing: (t: number) => t,
      onComplete: () => {
        if (loopRef.current) {
          // hold the final black, then begin another life
          // (skip the restart if the tab is hidden — Lenis's rAF is paused there)
          setTimeout(() => { if (loopRef.current && !document.hidden) play(true); }, LOOP_HOLD);
        } else {
          setWatching(false);
        }
      },
    });
    setWatching(true);
  }, [lenis]);

  const stopWatching = useCallback(() => {
    lenis.current?.scrollTo(window.scrollY, { immediate: true }); // kills the tween in place
    setWatching(false);
    setLooping(false); // manual control always wins
  }, [lenis]);

  const toggleWatch = useCallback(() => {
    if (watching) stopWatching();
    else playStory(false);
  }, [watching, stopWatching, playStory]);

  const toggleLoop = useCallback(() => {
    if (looping) {
      setLooping(false); // current run finishes, then stops
    } else {
      setLooping(true);
      if (!watching) playStory(false); // enabling loop starts the journey
    }
  }, [looping, watching, playStory]);

  // any manual scroll intent hands control back to the user
  useEffect(() => {
    if (!watching) return;
    const cancel = () => stopWatching();
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchmove", cancel, { passive: true });
    return () => {
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchmove", cancel);
    };
  }, [watching, stopWatching]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    setPointer((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    setPointer((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
    triggerRipple();
  }, []);

  const restart = useCallback(() => {
    lenis.current?.scrollTo(0, { duration: 3.5 });
  }, [lenis]);

  return (
    <div className="grain" onPointerMove={onPointerMove} onPointerDown={onPointerDown}>
      <Experience reducedMotion={reducedMotion} />
      <div className="atmosphere" />
      <Whispers />
      <StoryLayer />

      {!entered && <Intro onEnter={() => setEntered(true)} />}

      {entered && (
        <AutoPlay
          playing={watching}
          looping={looping}
          onToggle={toggleWatch}
          onToggleLoop={toggleLoop}
        />
      )}
      {entered && <StoryAbout />}
      {entered && <ScrollHint />}

      <Ending onRestart={restart} hidden={looping} />

      {/* music layer — only exists inside the universe */}
      {entered && (
        <>
          <YouTubePlayer />
          <NowPlaying />
        </>
      )}
      <PlaylistDrawer />
      <SoundtrackFinale />

      {/* the scroll track — dvh keeps composition stable under mobile browser chrome */}
      <div style={{ height: `${SCROLL.pages * 100}dvh` }} aria-hidden />
      <CustomCursor />
      <span className="sr-only">
        An interactive visual poem about two souls meeting across different lifetimes, with a soundtrack.
      </span>
    </div>
  );
}