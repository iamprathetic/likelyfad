"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { content, type WorkClip } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/anim/Reveal";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { usePrefersReducedMotion } from "@/lib/useReducedMotion";

/* Six curated clips on a dark band, driven by the visitor.
   Hover previews muted in place; click opens the clip full size WITH SOUND —
   the only audio anywhere on the site, which is why the section header says so.

   PLAYBACK
   Every card ships `preload="none"` and paints from its poster, so a cold load
   downloads no video at all. The src is attached on first hover, not at mount:
   six portrait mp4s speculatively fetched would cost more than the rest of the
   page combined, and most visitors hover two or three.

   Reduced motion suppresses the hover preview (it is decorative, and it is
   motion the visitor did not ask for) but never the click — that is an
   explicit request, and refusing it would just break the section. */

const { work } = content;

export function Work() {
  const { lenis } = useSmoothScroll();
  const reduced = usePrefersReducedMotion();

  const [active, setActive] = useState<WorkClip | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Card that opened the lightbox, so focus can return where it came from.
  const opener = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setActive(null), []);

  /* Lightbox: lock the page, wire Escape, move and restore focus. */
  useEffect(() => {
    if (!active) return;

    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    closeBtn.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lenis?.start();
      opener.current?.focus();
      opener.current = null;
    };
  }, [active, lenis, close]);

  const preview = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (reduced) return;
    const video = e.currentTarget.querySelector("video");
    if (!video) return;
    if (!video.getAttribute("src")) {
      video.preload = "auto";
      video.setAttribute("src", video.dataset.src ?? "");
    }
    video.currentTime = 0;
    video.play().then(
      () => video.classList.add("is-playing"),
      () => {
        /* Autoplay refused, or the card was left before the fetch landed.
           The poster is already on screen, so there is nothing to fall back to. */
      }
    );
  };

  const stopPreview = (e: React.MouseEvent<HTMLButtonElement>) => {
    const video = e.currentTarget.querySelector("video");
    if (!video) return;
    video.pause();
    video.classList.remove("is-playing");
  };

  return (
    <section className="section work on-dark" id="work" aria-label="The work">
      <div className="wrap">
        <div className="work-head">
          <SectionHeading kicker={work.kicker} heading={work.heading} />
          <Reveal delay={0.1}>
            <p className="work-hint text-center">{work.hint}</p>
          </Reveal>
        </div>

        <Reveal stagger className="work-grid" start="top 82%">
          {work.clips.map((clip) => (
            <button
              type="button"
              className="work-clip"
              key={clip.src}
              data-reveal-item
              style={{ backgroundImage: `url(${clip.poster})` }}
              aria-label={`Play ${clip.title} with sound`}
              onMouseEnter={preview}
              onMouseLeave={stopPreview}
              onClick={(e) => {
                opener.current = e.currentTarget;
                setActive(clip);
              }}
            >
              <video data-src={clip.src} muted loop playsInline preload="none" tabIndex={-1} />
              <span className="work-play" aria-hidden="true">
                <span />
              </span>
              <span className="work-clip-title">{clip.title}</span>
            </button>
          ))}
        </Reveal>
      </div>

      {mounted &&
        active &&
        createPortal(
          <div
            className="reel-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={active.title}
            onClick={close}
          >
            <button
              type="button"
              className="reel-lightbox-close"
              onClick={close}
              aria-label="Close player"
              ref={closeBtn}
            >
              <span aria-hidden="true">×</span>
            </button>
            {/* Stop the click here so only the backdrop closes. */}
            <div className="reel-lightbox-frame" onClick={(e) => e.stopPropagation()}>
              {/* Not muted: this is the one place the site plays audio. */}
              <video
                src={active.src}
                poster={active.poster}
                autoPlay
                loop
                controls
                playsInline
                preload="auto"
              />
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
