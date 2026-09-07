import { useState } from "react";
import { audio } from "../../audio/engine";

export function SoundToggle() {
    const [on, setOn] = useState(false);

    const toggle = async () => {
        const next = !on;
        setOn(next);
        if (next) await audio.play();
        else audio.pause();
    };

    return (
        <button
            onClick={toggle}
            aria-label={on ? "mute sound" : "enable sound"}
            className="fixed right-5 top-5 z-50 flex h-9 w-9 cursor-pointer items-center justify-center opacity-100 transition-opacity hover:opacity-80"
        >
            <span className="flex h-3 items-end gap-[2px]">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className="w-[2px] bg-[#f7f1e3] transition-all duration-500"
                        style={{
                            height: on ? `${6 + i * 3}px` : "2px",
                            animation: on ? `soundbar 1.${2 + i}s ease-in-out infinite alternate` : "none",
                        }}
                    />
                ))}
            </span>
            <style>{`@keyframes soundbar { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }`}</style>
        </button>
    );
}