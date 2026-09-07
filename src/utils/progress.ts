/** Global high-frequency state. No React state — zero re-renders per frame. */
const state = {
  progress: 0,
  pointer: { x: 0, y: 0 },        // normalized device coords -1..1
  pointerWorld: { x: 0, y: 0 },   // projected into the 3D scene (z=0 plane)
  ripple: { x: 0, y: 0, time: -Infinity },
  entered: false,
};

export const setProgress = (p: number) => { state.progress = p; };
export const getProgress = () => state.progress;

export const setPointer = (x: number, y: number) => { state.pointer.x = x; state.pointer.y = y; };
export const getPointer = () => state.pointer;

export const setPointerWorld = (x: number, y: number) => { state.pointerWorld.x = x; state.pointerWorld.y = y; };
export const getPointerWorld = () => state.pointerWorld;

/** ripple at the current pointer position (user tap) */
export const triggerRipple = () => {
  state.ripple.x = state.pointerWorld.x;
  state.ripple.y = state.pointerWorld.y;
  state.ripple.time = performance.now();
};

/** ripple at an explicit world position (narrative events — e.g. the miss) */
export const triggerRippleAt = (x: number, y: number) => {
  state.ripple.x = x;
  state.ripple.y = y;
  state.ripple.time = performance.now();
};

export const getRipple = () => state.ripple;

export const setEntered = (v: boolean) => { state.entered = v; };
export const getEntered = () => state.entered;