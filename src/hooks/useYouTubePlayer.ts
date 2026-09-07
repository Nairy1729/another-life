import { useEffect } from "react";
import { PLAYLIST } from "../data/playlist";
import { musicStore} from "../music/musicController";

let apiPromise: Promise<void> | null = null;
let player: any = null;
let initStarted = false;
let playerReady = false;
let errorSkipTimer: number | undefined;

function loadAPI(): Promise<void> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if (window.YT?.Player) { resolve(); return; }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      document.head.appendChild(s);
    }
  });
  return apiPromise;
}

function onStateChange(e: { data: number }) {
  const YT = window.YT;
  if (!YT) return;
  if (e.data === YT.PlayerState.PLAYING) {
    musicStore.set({ playing: true, loaded: true, autoplayHint: false, unavailable: false });
  } else if (e.data === YT.PlayerState.PAUSED) {
    musicStore.set({ playing: false });
  } else if (e.data === YT.PlayerState.ENDED) {
    handleEnded();
  }
}

function onError() {
  musicStore.set({ unavailable: true });
  // quietly move on after a moment — never crash the experience
  clearTimeout(errorSkipTimer);
  errorSkipTimer = window.setTimeout(() => {
    if (musicStore.get().unavailable) musicApi.next();
  }, 3000);
}

function handleEnded() {
  const s = musicStore.get();
  const last = s.index >= PLAYLIST.length - 1;
  if (last) {
    if (s.soundtrackMode) {
      musicStore.set({ playing: false, finished: true });
    } else {
      musicStore.set({ playing: false }); // no auto-loop
    }
  } else {
    musicApi.select(s.index + 1);
  }
}

async function initPlayer(containerId: string) {
  if (initStarted) return;       // StrictMode / remount safe
  initStarted = true;
  await loadAPI();
  player = new window.YT.Player(containerId, {
    width: 200,
    height: 200,
    playerVars: { playsinline: 1, rel: 0, controls: 1, fs: 0, iv_load_policy: 3 },
    events: {
      onReady: () => { playerReady = true; },
      onStateChange,
      onError,
    },
  });
}

/* detect autoplay block: we asked to play but nothing happens */
function verifyPlaybackStarted() {
  window.setTimeout(() => {
    const YT = window.YT;
    if (!player || !YT) return;
    const st = player.getPlayerState?.();
    if (st !== YT.PlayerState.PLAYING && st !== YT.PlayerState.BUFFERING) {
      musicStore.set({ autoplayHint: true });
    }
  }, 1600);
}

export const musicApi = {
  /** load + play a playlist index (call from a user gesture) */
    select(i: number) {
    const idx = Math.max(0, Math.min(PLAYLIST.length - 1, i));
    // unfilled song: mark unavailable, drift to the next filled one
    if (!PLAYLIST[idx].youtubeId) {
      musicStore.set({ index: idx, unavailable: true, loaded: true });
      const nextFilled = PLAYLIST.findIndex((s, j) => j > idx && s.youtubeId);
      if (nextFilled !== -1) setTimeout(() => musicApi.select(nextFilled), 1200);
      return;
    }
    musicStore.set({ index: idx, unavailable: false, finished: false, loaded: true });
    if (playerReady && player) {
      player.loadVideoById(PLAYLIST[idx].youtubeId);
      verifyPlaybackStarted();
    }
  },
  play() {
    if (!playerReady || !player) return;
    if (!musicStore.get().loaded) { musicApi.select(musicStore.get().index); return; }
    player.playVideo();
    verifyPlaybackStarted();
  },
  pause() { player?.pauseVideo?.(); },
  togglePlay() { musicStore.get().playing ? musicApi.pause() : musicApi.play(); },
  next() {
    const s = musicStore.get();
    musicApi.select(s.index >= PLAYLIST.length - 1 ? 0 : s.index + 1);
  },
  previous() {
    const s = musicStore.get();
    musicApi.select(s.index <= 0 ? PLAYLIST.length - 1 : s.index - 1);
  },
  seek(fraction: number) {
    if (!playerReady || !player) return;
    const d = player.getDuration?.() ?? 0;
    if (d > 0) player.seekTo(d * fraction, true);
  },
  setVolume(v: number) { player?.setVolume?.(Math.round(v * 100)); },
  getCurrentTime: () => (playerReady && player?.getCurrentTime?.()) || 0,
  getDuration: () => (playerReady && player?.getDuration?.()) || 0,
  /** Tonight's Soundtrack — guided sequence from the beginning */
  startSoundtrack() {
    musicStore.set({ soundtrackMode: true, finished: false, drawerOpen: false });
    musicApi.select(0);
  },
};

/** mounts the persistent engine exactly once */
export function useYouTubeEngine(containerId: string) {
  useEffect(() => { initPlayer(containerId); }, [containerId]);
}

/** subscribe React components to music state */
import { useSyncExternalStore } from "react";
export function useMusicState(): ReturnType<typeof musicStore.get> {
  return useSyncExternalStore(musicStore.subscribe, musicStore.get);
}