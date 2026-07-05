"use client";

import { useRef, type ElementType } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

type RevealTextProps = {
  text: string;
  as?: ElementType;
  className?: string;
  stagger?: number;
  delay?: number;
  immediate?: boolean;
};

type Token = { word: string; grad: boolean };

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  const segments = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  for (const seg of segments) {
    const grad = seg.startsWith("*") && seg.endsWith("*");
    const clean = grad ? seg.slice(1, -1) : seg;
    for (const word of clean.split(/(\s+)/)) {
      if (word === "") continue;
      tokens.push({ word, grad });
    }
  }
  return tokens;
}

/* Word-mask reveal — each word rises from behind its own clip. */
export function RevealText({
  text,
  as: Tag = "span",
  className = "",
  stagger = 0.045,
  delay = 0,
  immediate = false,
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const tokens = tokenize(text);

  useGSAP(
    () => {
      if (reduced) return;
      const inners = ref.current!.querySelectorAll(".rt-inner");
      gsap.set(inners, { yPercent: 118 });
      gsap.to(inners, {
        yPercent: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger,
        delay,
        scrollTrigger: immediate ? undefined : { trigger: ref.current, start: "top 88%", once: true },
      });
    },
    { scope: ref, dependencies: [reduced] }
  );

  return (
    <Tag ref={ref} className={`rt ${className}`}>
      {tokens.map((t, i) =>
        /\s+/.test(t.word) ? (
          <span key={i} className="rt-space">
            {" "}
          </span>
        ) : (
          <span key={i} className="rt-word">
            <span className={`rt-inner${t.grad ? " grad-text" : ""}`}>{t.word}</span>
          </span>
        )
      )}
    </Tag>
  );
}
