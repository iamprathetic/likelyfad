"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { horizontalLoop } from "@/lib/horizontalLoop";
import { content } from "@/lib/content";

/* Horizontal 3D perspective wall of autoplaying portrait reels. A genuinely
   infinite marquee: each reel wraps individually (horizontalLoop), so there's
   no snap-back or edge gap at any width. The 3D tilt + hover live on an inner
   node so they never fight the loop's transform.

   NOTE: by client request this section's motion plays even under
   prefers-reduced-motion (the rest of the site still respects the setting). */
export function ReelWall() {
  const { reels } = content;
  const root = useRef<HTMLDivElement>(null);
  const doubled = [...reels.videos, ...reels.videos];

  useEffect(() => {
    const vids = root.current?.querySelectorAll("video") ?? [];
    vids.forEach((v) => {
      v.muted = true;
      v.play().catch(() => {});
    });
  }, []);

  useGSAP(
    () => {
      const track = root.current!.querySelector(".reelwall-track") as HTMLElement;
      const reelEls = root.current!.querySelectorAll(".reel");
      const gap = parseFloat(getComputedStyle(track).columnGap || "20") || 20;

      const loop = horizontalLoop(reelEls, { speed: 1.1, paddingRight: gap });

      // Slow (not stop) while hovering the band.
      const stage = root.current!.querySelector(".reelwall-stage")!;
      const enter = () => gsap.to(loop, { timeScale: 0.28, duration: 0.6 });
      const leave = () => gsap.to(loop, { timeScale: 1, duration: 0.6 });
      stage.addEventListener("pointerenter", enter);
      stage.addEventListener("pointerleave", leave);

      // Gentle parallax on the whole band as the page scrolls.
      gsap.fromTo(
        stage,
        { xPercent: 4 },
        {
          xPercent: -4,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        }
      );

      return () => {
        stage.removeEventListener("pointerenter", enter);
        stage.removeEventListener("pointerleave", leave);
        loop.kill();
      };
    },
    { scope: root }
  );

  return (
    <section className="reelwall" aria-label="Our work" ref={root}>
      <div className="reelwall-stage">
        <div className="reelwall-track">
          {doubled.map((src, i) => (
            <div className="reel" key={i} aria-hidden={i >= reels.videos.length}>
              <div className="reel-tilt">
                <video src={src} muted loop playsInline autoPlay preload="auto" tabIndex={-1} />
                <span className="reel-glow" aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="reelwall-caption">{reels.caption}</p>
    </section>
  );
}
