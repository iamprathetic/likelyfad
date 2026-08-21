"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap, useGSAP } from "@/lib/gsap";
import { marqueeLoop } from "@/lib/marqueeLoop";
import { content } from "@/lib/content";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import type { Reel } from "@/lib/reels.generated";

/* Three-lane wall of autoplaying portrait reels, sitting beside the hero on
   laptop and below it on mobile.

     laptop  → three vertical columns:  down · up · down
     mobile  → three horizontal rows:   right · left · right

   Each lane is its own infinite marqueeLoop (items wrap individually, so
   there's no snap-back or edge gap at any size). gsap.matchMedia rebuilds the
   loops on the breakpoint so the axis always matches the layout.

   PLAYBACK BUDGET
   The bottleneck here is concurrent video decoding, not bytes. Every clip
   carries `preload="none"` and a poster still, so a cold load paints the whole
   wall from a handful of KB and downloads nothing else. An IntersectionObserver
   against the stage then plays only the cards actually on screen and pauses
   them the moment they scroll out — with MAX_PLAYING as a hard ceiling, since
   mid-range phones start dropping frames well before the element count does.

   Clicking a card opens it in a lightbox. While that's open the whole wall is
   suspended — lanes stopped, clips paused — because a backdrop-filter blur has
   to recomposite every frame that moves behind it, which is the one thing that
   would make the blur expensive.

   NOTE: by client request this section's motion plays even under
   prefers-reduced-motion (the rest of the site still respects the setting). */

const LANES = 3;
/* Distinct clips per lane. Six is enough for the track to outrun the tallest
   lane on its own, so no clip is duplicated within a lane — with a large Drive
   folder that means 18 different reels on the wall instead of 9. */
const PER_LANE = 6;
/* Ceiling on simultaneous playback — the wall's dominant cost. ~8 cards are on
   screen at 1440px, so this genuinely binds: the clips that miss out are the
   newest arrivals, and those are still inside the edge fade where a held
   poster frame is hard to notice. Raise it if the wall looks too static. */
const MAX_PLAYING = 6;
const DESKTOP = "(min-width: 961px)";

export function ReelWall() {
  const { reels } = content;
  const root = useRef<HTMLDivElement>(null);
  const { lenis } = useSmoothScroll();

  const [active, setActive] = useState<Reel | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Card that opened the lightbox, so focus can go back where it came from.
  const opener = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  // Set by the effects below so the lightbox can suspend both without either
  // of them having to re-run on every open/close.
  const suspended = useRef(false);
  const playback = useRef<{ pauseAll: () => void; resume: () => void } | null>(null);
  const marquee = useRef<{ stop: () => void; start: () => void } | null>(null);

  // Deal the clips out across lanes. The modulo keeps every lane full even when
  // the folder holds fewer clips than LANES * PER_LANE.
  const lanes = useMemo(
    () =>
      Array.from({ length: LANES }, (_, lane) =>
        Array.from(
          { length: PER_LANE },
          (_, i) => reels.videos[(lane * PER_LANE + i) % reels.videos.length]
        )
      ),
    [reels.videos]
  );

  const open = useCallback((clip: Reel, from: HTMLElement) => {
    opener.current = from;
    setActive(clip);
  }, []);
  const close = useCallback(() => setActive(null), []);

  /* Play what's visible, pause what isn't. */
  useEffect(() => {
    const stage = root.current?.querySelector<HTMLElement>(".reelwall-stage");
    if (!stage) return;

    const vids = Array.from(root.current!.querySelectorAll(".reel-track video"));
    vids.forEach((v) => {
      (v as HTMLVideoElement).muted = true; // autoplay is refused without this
    });
    const players = vids as HTMLVideoElement[];

    // On a metered connection the posters alone tell the story.
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;

    const visible = new Set<HTMLVideoElement>();
    const playing = new Set<HTMLVideoElement>();

    /* Incumbents keep their slot. Re-granting the budget purely in DOM order
       meant a card that just became visible could evict one already playing,
       so clips flapped play/pause continuously as the lanes moved — and a
       play() interrupted by pause() is exactly what makes decoding stutter.
       Only leftover budget goes to new arrivals. */
    const reconcile = () => {
      if (suspended.current) return;
      const keep = players.filter((v) => playing.has(v) && visible.has(v));
      const arriving = players.filter((v) => !playing.has(v) && visible.has(v));
      const wanted = new Set([...keep, ...arriving].slice(0, MAX_PLAYING));

      for (const v of players) {
        if (wanted.has(v) && !playing.has(v)) {
          playing.add(v);
          v.play().catch(() => playing.delete(v));
        } else if (!wanted.has(v) && playing.has(v)) {
          playing.delete(v);
          v.pause();
        }
      }
    };

    playback.current = {
      pauseAll: () => {
        playing.forEach((v) => v.pause());
        playing.clear();
      },
      resume: reconcile,
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) visible.add(v);
          else visible.delete(v);
        }
        reconcile();
      },
      // The lanes are in constant motion, so start a clip slightly before it
      // reaches the edge — it's decoding by the time it's actually visible.
      { root: stage, rootMargin: "15% 0px 15% 0px", threshold: 0 }
    );
    players.forEach((v) => io.observe(v));

    // A backgrounded tab keeps decoding otherwise.
    const onVisibility = () => {
      if (document.hidden) playback.current?.pauseAll();
      else reconcile();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      playing.forEach((v) => v.pause());
      playback.current = null;
    };
  }, []);

  /* Lightbox: suspend the wall, lock the page, wire Escape and focus. */
  useEffect(() => {
    if (!active) return;

    suspended.current = true;
    playback.current?.pauseAll();
    marquee.current?.stop();

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
      suspended.current = false;
      marquee.current?.start();
      playback.current?.resume();
      opener.current?.focus();
      opener.current = null;
    };
  }, [active, lenis, close]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(DESKTOP, () => build("y"));
      mm.add(`(max-width: 960px)`, () => build("x"));

      function build(axis: "x" | "y") {
        const tracks = Array.from(
          root.current!.querySelectorAll<HTMLElement>(".reel-track")
        );
        // Lane 1 runs with the timeline, lanes 0 and 2 run against it →
        // down / up / down vertically, right / left / right horizontally.
        const dirs = tracks.map((_, i) => (i === 1 ? 1 : -1));

        const loops = tracks.map((track, i) => {
          const gap = parseFloat(getComputedStyle(track).gap) || 16;
          return marqueeLoop(track.querySelectorAll(".reel"), {
            axis,
            speed: axis === "y" ? 0.62 : 0.85,
            padding: gap,
            reversed: dirs[i] === -1,
            startProgress: i * 0.17,
          });
        });

        // Hovering a lane halts that lane only — the other two keep running, so
        // the wall stays alive while the clip you're looking at holds still.
        // Eased rather than snapped, or the stop reads as a dropped frame.
        const unbind = tracks.map((track, i) => {
          const lane = track.parentElement;
          if (!lane) return () => {};
          const enter = () => {
            if (!suspended.current) gsap.to(loops[i], { timeScale: 0, duration: 0.4 });
          };
          const leave = () => {
            if (!suspended.current) gsap.to(loops[i], { timeScale: dirs[i], duration: 0.7 });
          };
          lane.addEventListener("pointerenter", enter);
          lane.addEventListener("pointerleave", leave);
          return () => {
            lane.removeEventListener("pointerenter", enter);
            lane.removeEventListener("pointerleave", leave);
          };
        });

        const stage = root.current!.querySelector(".reelwall-stage");
        const restoreAll = () => {
          if (suspended.current) return;
          loops.forEach((l, i) => gsap.to(l, { timeScale: dirs[i], duration: 0.7 }));
        };
        stage?.addEventListener("pointerleave", restoreAll);

        marquee.current = {
          stop: () => loops.forEach((l) => l.pause()),
          start: () =>
            loops.forEach((l, i) => {
              // resume(), not play(): these timelines run at a negative
              // timeScale and play() would flip them back to forward.
              const lane = tracks[i].parentElement;
              l.timeScale(lane?.matches(":hover") ? 0 : dirs[i]);
              l.resume();
            }),
        };

        return () => {
          unbind.forEach((off) => off());
          stage?.removeEventListener("pointerleave", restoreAll);
          loops.forEach((loop) => loop.kill());
          marquee.current = null;
        };
      }

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section className="reelwall" aria-label="Our work" ref={root}>
      <div className="reelwall-stage">
        {lanes.map((lane, li) => (
          <div className="reel-lane" key={li}>
            <div className="reel-track">
              {lane.map((clip, i) => (
                <div className="reel" key={`${li}-${i}`}>
                  <button
                    type="button"
                    className="reel-tilt"
                    aria-label={`Play reel ${li * PER_LANE + i + 1} full size`}
                    onClick={(e) => open(clip, e.currentTarget)}
                  >
                    <video
                      src={clip.src}
                      poster={clip.poster ?? undefined}
                      muted
                      loop
                      playsInline
                      preload="none"
                      tabIndex={-1}
                    />
                    <span className="reel-glow" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="reelwall-caption">{reels.caption}</p>

      {mounted &&
        active &&
        createPortal(
          <div
            className="reel-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Reel preview"
            onClick={close}
          >
            <button
              type="button"
              className="reel-lightbox-close"
              onClick={close}
              aria-label="Close preview"
              ref={closeBtn}
            >
              <span aria-hidden="true">×</span>
            </button>
            {/* Stop the click here so only the backdrop closes. */}
            <div className="reel-lightbox-frame" onClick={(e) => e.stopPropagation()}>
              <video
                src={active.src}
                poster={active.poster ?? undefined}
                autoPlay
                loop
                muted
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
