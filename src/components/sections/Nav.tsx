"use client";

import { useEffect, useRef, useState } from "react";
import { content } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";

/* Fixed bar that compacts once scrolled and retracts when scrolling down.
   Long class strings are pulled out as constants so the JSX stays readable. */
const NAV_BASE =
  "fixed top-0 left-0 right-0 z-[120] " +
  "[transition:transform_0.5s_var(--ease),background_0.4s_var(--ease)," +
  "padding_0.4s_var(--ease),box-shadow_0.4s_var(--ease),backdrop-filter_0.4s_var(--ease)]";

/* PERF: this backdrop-filter re-blurs the strip on every frame the page moves.
   If scroll ever feels heavy, this is the first thing to drop — raise the
   background to ~92% opaque and delete the two backdrop-* utilities. */
const NAV_SCROLLED =
  "py-[0.7rem] bg-[color-mix(in_srgb,var(--bg)_74%,transparent)] " +
  "backdrop-blur-[16px] backdrop-saturate-150 shadow-[0_1px_0_var(--line)]";

const NAV_LINK =
  "relative text-[0.95rem] font-normal text-ink-soft hover:text-ink " +
  // Gradient underline that grows from the left on hover.
  "after:content-[''] after:absolute after:left-0 after:-bottom-[3px] " +
  "after:w-full after:h-[1.5px] after:bg-[image:var(--grad)] " +
  "after:scale-x-0 after:origin-left " +
  "after:[transition:transform_0.4s_var(--ease-emphasis)] hover:after:scale-x-100";

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
    <header
      className={`${NAV_BASE} ${scrolled ? NAV_SCROLLED : "py-[1.1rem]"} ${
        hidden ? "-translate-y-[115%]" : ""
      }`}
    >
      <div className="w-full max-w-[var(--maxw)] mx-auto px-[var(--gutter)] flex items-center justify-between gap-6">
        <a href="#top" className="flex items-center" onClick={go("#top")}>
          <img src="/ls-icon.png" alt="Likelyfad Studio" className="w-30 h-10" />
        </a>

        {/* nav-links is the hook globals.css uses to drop the link row below
            760px, where the wordmark and the CTA already fill the bar. */}
        <nav className="nav-links flex gap-8 ml-auto mr-6" aria-label="Primary">
          {content.nav.links.map((l) => (
            <a key={l.label} href={l.href} className={NAV_LINK} onClick={go(l.href)}>
              {l.label}
            </a>
          ))}
        </nav>

        <Button contact variant="dark">
          {content.nav.cta}
        </Button>
      </div>
    </header>
  );
}
