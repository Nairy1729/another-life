import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { setProgress } from "../utils/progress";
import { SCROLL } from "../config/constants";

export function useLenis(enabled: boolean) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({ lerp: SCROLL.lerp, smoothWheel: true });
    lenisRef.current = lenis;

    lenis.on("scroll", ({ scroll, limit }: { scroll: number; limit: number }) => {
      setProgress(limit > 0 ? scroll / limit : 0);
    });

    let raf = 0;
    const loop = (time: number) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);

    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);

  useEffect(() => {
    if (!lenisRef.current) return;
    if (enabled) lenisRef.current.start();
    else lenisRef.current.stop();
  }, [enabled]);

  return lenisRef;
}