import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { INTRO } from "../../data/story";

export function Intro({ onEnter }: { onEnter: () => void }) {
    const root = useRef<HTMLDivElement>(null);
    const [gone, setGone] = useState(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
            tl.fromTo(".intro-dot", { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 2.4, delay: 1.1 })
                .fromTo(".intro-l1", { opacity: 0, y: 14, filter: "blur(6px)" },
                    { opacity: 1, y: 0, filter: "blur(0px)", duration: 2.2 }, "-=0.6")
                .fromTo(".intro-l2", { opacity: 0, y: 14, filter: "blur(6px)" },
                    { opacity: 1, y: 0, filter: "blur(0px)", duration: 2.2 }, "+=0.9")
                .fromTo(".intro-begin", { opacity: 0 }, { opacity: 0.9, duration: 1.8 }, "+=1.2");
        }, root);
        return () => ctx.revert();
    }, []);

    const enter = () => {
        gsap.to(root.current, {
            opacity: 0, duration: 2.2, ease: "power2.inOut",
            onComplete: () => { setGone(true); onEnter(); },
        });
    };

    if (gone) return null;

    return (
        <div ref={root} className="fixed inset-0 z-40 select-none">
            {/* title block — locked at optical center, same axis as story text */}
            <div className="absolute inset-x-6 top-[42%] -translate-y-1/2 flex flex-col items-center">
                <div
                    className="intro-dot mb-12 h-[4px] w-[4px] rounded-full bg-[#fff6e8]
            shadow-[0_0_12px_3px_rgba(255,240,220,0.9),0_0_40px_14px_rgba(255,235,210,0.4),0_0_90px_40px_rgba(200,180,255,0.12)]"
                />
                <h1 className="serif text-center font-normal leading-[1.25] tracking-wide">
                    <span className="intro-l1 story-text block text-[clamp(1.9rem,7vw,3.6rem)]">
                        {INTRO.line1}
                    </span>
                    <span className="intro-l2 story-text block italic text-[clamp(1.9rem,7vw,3.6rem)]">
                        {INTRO.line2}
                    </span>
                </h1>
            </div>

            {/* begin — alone in the lower third, like a film's "a24 presents" card */}
            <button
                onClick={enter}
                className="intro-begin ui-lit-gold absolute bottom-[26%] left-1/2 -translate-x-1/2 cursor-pointer
          border-b border-[#ffdfb8]/30 pb-1.5 text-[12px] uppercase tracking-[0.5em]
          text-[#ffdfb8]/90 transition-all hover:border-[#ffdfb8]/70 hover:text-[#ffdfb8]"
                style={{ opacity: 0 }}
            >
                {INTRO.action}
            </button>
        </div>
    );
}