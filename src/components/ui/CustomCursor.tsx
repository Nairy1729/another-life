import { useEffect, useRef } from "react";

export function CustomCursor() {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const pos = useRef({ x: -100, y: -100 });        // actual pointer
    const dot = useRef({ x: -100, y: -100 });        // ember (fast follow)
    const ring = useRef({ x: -100, y: -100 });       // ring (slow follow)
    const overInteractive = useRef(false);
    const visible = useRef(false);

    useEffect(() => {
        // touch devices: no custom cursor at all
        if (window.matchMedia("(pointer: coarse)").matches) return;

        const onMove = (e: MouseEvent) => {
            pos.current.x = e.clientX;
            pos.current.y = e.clientY;
            visible.current = true;
            const target = e.target as HTMLElement;
            overInteractive.current = !!target.closest('button, a, [role="slider"]');
        };
        const onLeave = () => { visible.current = false; };
        const onEnter = () => { visible.current = true; };

        window.addEventListener("mousemove", onMove, { passive: true });
        document.documentElement.addEventListener("mouseleave", onLeave);
        document.documentElement.addEventListener("mouseenter", onEnter);

        let raf = 0;
        const loop = () => {
            // ember follows closely; ring drifts behind — two layers of inertia
            dot.current.x += (pos.current.x - dot.current.x) * 0.35;
            dot.current.y += (pos.current.y - dot.current.y) * 0.35;
            ring.current.x += (pos.current.x - ring.current.x) * 0.12;
            ring.current.y += (pos.current.y - ring.current.y) * 0.12;

            const d = dotRef.current, r = ringRef.current;
            if (d && r) {
                const op = visible.current ? 1 : 0;
                d.style.opacity = String(op);
                r.style.opacity = String(op * (overInteractive.current ? 0.9 : 0.35));
                d.style.transform = `translate(${dot.current.x}px, ${dot.current.y}px) translate(-50%, -50%)`;
                const scale = overInteractive.current ? 1.6 : 1;
                r.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px) translate(-50%, -50%) scale(${scale})`;
            }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);

        document.documentElement.classList.add("no-native-cursor");

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("mousemove", onMove);
            document.documentElement.removeEventListener("mouseleave", onLeave);
            document.documentElement.removeEventListener("mouseenter", onEnter);
            document.documentElement.classList.remove("no-native-cursor");
        };
    }, []);

    return (
        <>
            <div
                ref={ringRef}
                aria-hidden
                className="pointer-events-none fixed left-0 top-0 z-[100] h-8 w-8 rounded-full border border-[#f7f1e3]/50 transition-[opacity] duration-300"
                style={{ opacity: 0 }}
            />
            <div
                ref={dotRef}
                aria-hidden
                className="pointer-events-none fixed left-0 top-0 z-[100] h-[5px] w-[5px] rounded-full bg-[#fff3e0]
          shadow-[0_0_8px_2px_rgba(255,235,210,0.8),0_0_22px_8px_rgba(255,220,180,0.25)]
          transition-[opacity] duration-300"
                style={{ opacity: 0 }}
            />
        </>
    );
}