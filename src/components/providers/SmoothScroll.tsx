"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

type ScrollAPI = {
  lenis: Lenis | null;
  scrollTo: (target: string | HTMLElement | number, offset?: number) => void;
};

const ScrollContext = createContext<ScrollAPI>({ lenis: null, scrollTo: () => {} });
export const useSmoothScroll = () => useContext(ScrollContext);

/* Lenis smooth scroll synced to the GSAP ticker. Disabled under reduced-motion. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [api, setApi] = useState<ScrollAPI>({ lenis: null, scrollTo: () => {} });
  const reduced = usePrefersReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reduced) {
      setApi({
        lenis: null,
        scrollTo: (t) => {
          const el = typeof t === "string" ? document.querySelector(t) : null;
          if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
        },
      });
      return;
    }

    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.6 });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    setApi({
      lenis,
      scrollTo: (target, offset = -72) => lenis.scrollTo(target as never, { offset, duration: 1.15 }),
    });

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 350);

    return () => {
      gsap.ticker.remove(update);
      window.removeEventListener("load", onLoad);
      window.clearTimeout(id);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}
