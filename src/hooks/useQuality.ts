import { useMemo } from "react";
import { QUALITY } from "../config/constants";

export function useQuality() {
  return useMemo(() => {
    const isTouch = matchMedia("(pointer: coarse)").matches;
    const smallScreen = Math.min(innerWidth, innerHeight) < 500;
    const lowCores = (navigator.hardwareConcurrency ?? 8) <= 4;
    if (isTouch && smallScreen && lowCores) return { tier: "low" as const, ...QUALITY.low, isTouch };
    if (isTouch || smallScreen) return { tier: "mobile" as const, ...QUALITY.mobile, isTouch };
    return { tier: "desktop" as const, ...QUALITY.desktop, isTouch };
  }, []);
}