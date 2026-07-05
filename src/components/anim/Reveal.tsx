"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  y?: number;
  delay?: number;
  stagger?: boolean;
  start?: string;
};

/* Soft fade + lift on scroll. In stagger mode it choreographs [data-reveal-item] children. */
export function Reveal({
  children,
  as: Tag = "div",
  className = "",
  y = 26,
  delay = 0,
  stagger = false,
  start = "top 86%",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const targets = stagger ? ref.current!.querySelectorAll("[data-reveal-item]") : [ref.current!];
      gsap.from(targets, {
        opacity: 0,
        y,
        duration: 0.95,
        ease: "power3.out",
        delay,
        stagger: stagger ? 0.09 : 0,
        scrollTrigger: { trigger: ref.current, start, once: true },
      });
    },
    { scope: ref, dependencies: [reduced] }
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
