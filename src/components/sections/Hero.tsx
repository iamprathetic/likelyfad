"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { content } from "@/lib/content";
import { RevealText } from "@/components/anim/RevealText";
import { Button } from "@/components/ui/Button";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

const { hero } = content;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      gsap.from(root.current!.querySelectorAll("[data-hero-fade]"), {
        opacity: 0,
        y: 22,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.09,
        delay: 0.15,
      });
      // Ambient drift on the aura. Opacity ONLY, deliberately: the aura carries
      // a wide blur, and scaling it would re-rasterise that blur every frame
      // for as long as the page is open. Opacity is a compositor-only property,
      // so the breathe is effectively free.
      gsap.fromTo(
        root.current!.querySelector(".hero-aura"),
        { opacity: 0.78 },
        { opacity: 1, duration: 9, ease: "sine.inOut", repeat: -1, yoyo: true }
      );
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true }
  );

  return (
    <header className="hero" id="top" ref={root}>
      {/* <div className="hero-aura" aria-hidden="true" /> */}
      <div className="wrap hero-inner">
        <span className="kicker" data-hero-fade>
          {hero.eyebrow}
        </span>

        <h1 className="display-xl hero-headline">
          <RevealText text={hero.headline} immediate delay={0.2} />
        </h1>

        <p className="lead hero-sub" data-hero-fade>
          {hero.subline}
        </p>

        <div className="hero-ctas" data-hero-fade>
          <Button contact variant="grad" withArrow>
            {hero.primaryCta}
          </Button>
          <Button href={hero.secondaryHref} variant="ghost">
            {hero.secondaryCta}
          </Button>
        </div>

        <p className="hero-reassure" data-hero-fade>
          {hero.reassurance}
        </p>
      </div>
    </header>
  );
}
