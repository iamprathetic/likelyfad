"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setHidden(y > lastY.current && y > 400);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (href: string) => (e: React.MouseEvent) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      scrollTo(href);
    }
  };

  return (
    <header className={`nav ${scrolled ? "is-scrolled" : ""} ${hidden ? "is-hidden" : ""}`}>
      <div className="wrap nav-inner">
        <a href="#top" className="nav-brand grad-text" onClick={go("#top")}>
          {content.brand}
        </a>

        <nav className="nav-links" aria-label="Primary">
          {content.nav.links.map((l) => (
            <a key={l.label} href={l.href} className="nav-link" onClick={go(l.href)}>
              {l.label}
            </a>
          ))}
        </nav>

        <Button contact variant="dark" className="nav-cta">
          {content.nav.cta}
        </Button>
      </div>
    </header>
  );
}
