"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap, useGSAP } from "@/lib/gsap";
import { marqueeLoop } from "@/lib/marqueeLoop";
import { content } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/anim/Reveal";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import type { Reel } from "@/lib/reels.generated";

/* THE WORK — the volume wall, ported from v3's SCENE 3.

   Three full-bleed rows of clips gliding in alternating directions:

     row 1 → right
     row 2 → left
     row 3 → right

   Sheer count is the argument this section makes, which is why it is a wall
   rather than a curated grid: you are meant to lose track of how many there
   are. Hovering a row halts that row only and dims the tiles either side of
   the one under the pointer, so you can hold a single clip still and read it
   without the other two rows going dead.

   Each row is a marqueeLoop rather than v3's CSS keyframe track. The CSS
   version scrolls a doubled set by -50%, which means every clip exists twice
   in the DOM — fine for v3's still images, wasteful for 48 <video> elements.
   marqueeLoop wraps items individually instead, so one element per clip.

   PLAYBACK BUDGET
   The bottleneck is concurrent video decoding, not bytes. Every tile carries
   `preload="none"` and paints from its poster, so a cold load downloads no
   video at all. An IntersectionObserver then plays only the tiles actually on
   screen, with MAX_PLAYING as a hard ceiling — 48 tiles decoding at once would
   drop frames on anything short of a desktop. */

const { work, reels } = content;

const ROWS = 3;
/* Enough tiles that a row's track outruns the widest realistic viewport on its
   own — at ~172px a tile that means 16 clears 2560px with room to spare. Short
   of that the loop shows a gap where the track ends. */
const PER_ROW = 16;
/* The hero wall shows the first LANES * PER_LANE (18) clips. Starting past
   them keeps the two walls from running the same footage on one page. */
const OFFSET = 18;
/* Ceiling on simultaneous playback. Lower than it looks: the rows are wide, so
   only a handful of tiles are on screen and unfaded at any moment anyway. */
const MAX_PLAYING = 5;
/* Cold-start tiles one at a time. Each play() on a preload="none" element is a
   fetch + demux + decoder spin-up, and firing five into one frame is what
   makes a wall hitch as it appears. */
const START_STAGGER = 180;
const START_WARMUP = 350;

export function Work() {
  const root = useRef<HTMLDivElement>(null);
  const { lenis } = useSmoothScroll();

  const [active, setActive] = useState<Reel | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Tile that opened the lightbox, so focus can return where it came from.
  const opener = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  // Set by the effects below so the lightbox can suspend both without either
  // of them having to re-run on every open/close.
  const suspended = useRef(false);
  const playback = useRef<{ pauseAll: () => void; resume: () => void } | null>(null);
  const marquee = useRef<{ stop: () => void; start: () => void } | null>(null);

  /* Deal the clips out across the rows, interleaved so consecutive tiles in a
     row aren't neighbours in the source list. The modulo keeps every row full
     however many clips the Drive folder currently holds. */
  const rows = useMemo(
    () =>
      Array.from({ length: ROWS }, (_, row) =>
        Array.from(
          { length: PER_ROW },
          (_, i) => reels.videos[(OFFSET + i * ROWS + row) % reels.videos.length]
        )
      ),
    []
  );

  const close = useCallback(() => setActive(null), []);

  /* Play what's visible, pause what isn't. */
  useEffect(() => {
    const players = Array.from(
      root.current!.querySelectorAll<HTMLVideoElement>(".work-tile video")
    );
    if (!players.length) return;
    players.forEach((v) => {
      v.muted = true; // autoplay is refused without this
    });

    // On a metered connection the posters alone tell the story.
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;

    const visible = new Set<HTMLVideoElement>();
    // Holds a playback slot — granted synchronously by reconcile() so the
    // budget maths stays exact, even though the clip may not have started yet.
    const playing = new Set<HTMLVideoElement>();
    // Slot-holders still waiting their turn to actually spin up a decoder.
    let pending: HTMLVideoElement[] = [];
    let starting = false;
    let timer = 0;
    let warmed = false;

    const drain = () => {
      timer = 0;
      if (starting || suspended.current) return;
      let v: HTMLVideoElement | undefined;
      // Skip anything that lost its slot while it sat in the queue.
      while ((v = pending.shift()) && !playing.has(v)) {
        /* keep draining */
      }
      if (!v) return;
      starting = true;
      const next = () => {
        starting = false;
        if (pending.length) timer = window.setTimeout(drain, START_STAGGER);
      };
      v.play().then(next, () => {
        playing.delete(v!);
        next();
      });
    };

    const schedule = (delay: number) => {
      if (timer || starting || !pending.length) return;
      timer = window.setTimeout(drain, delay);
    };

    /* Incumbents keep their slot. Re-granting the budget purely in DOM order
       would let a tile that just became visible evict one already playing, so
       clips would flap play/pause continuously as the rows moved — and a
       play() interrupted by pause() is exactly what makes decoding stutter.
       Only leftover budget goes to new arrivals. */
    const reconcile = () => {
      if (suspended.current) return;
      const keep = players.filter((v) => playing.has(v) && visible.has(v));
      const arriving = players.filter((v) => !playing.has(v) && visible.has(v));
      const wanted = new Set([...keep, ...arriving].slice(0, MAX_PLAYING));

      for (const v of players) {
        if (wanted.has(v) && !playing.has(v)) {
          playing.add(v); // takes the slot now...
          pending.push(v); // ...but starts on its turn
        } else if (!wanted.has(v) && playing.has(v)) {
          playing.delete(v);
          v.pause();
        }
      }
      schedule(warmed ? START_STAGGER : START_WARMUP);
      warmed = true;
    };

    const stopQueue = () => {
      if (timer) clearTimeout(timer);
      timer = 0;
      pending = [];
    };

    playback.current = {
      pauseAll: () => {
        stopQueue();
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
      // The rows are in constant motion, so start a tile slightly before it
      // reaches the edge — it's decoding by the time it's actually visible.
      { rootMargin: "0px 10% 0px 10%", threshold: 0 }
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
      stopQueue();
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

  /* The rows themselves. Row 1 runs with the timeline, rows 0 and 2 against
     it → right / left / right, matching v3. */
  useGSAP(
    () => {
      const tracks = Array.from(root.current!.querySelectorAll<HTMLElement>(".work-wall-track"));
      const dirs = tracks.map((_, i) => (i === 1 ? 1 : -1));
      /* Rows run at slightly different speeds so the wall never settles into a
         visible column rhythm — v3 did this with per-row durations. */
      const speeds = [0.34, 0.26, 0.3];

      const loops = tracks.map((track, i) => {
        const gap = parseFloat(getComputedStyle(track).gap) || 12;
        return marqueeLoop(track.querySelectorAll(".work-tile"), {
          axis: "x",
          speed: speeds[i],
          padding: gap,
          reversed: dirs[i] === -1,
          startProgress: i * 0.17,
        });
      });

      /* Hovering a row halts that row only — the other two keep running, so
         the wall stays alive while the clip you're looking at holds still.
         Eased rather than snapped, or the stop reads as a dropped frame. */
      const unbind = tracks.map((track, i) => {
        const row = track.parentElement;
        if (!row) return () => {};
        const enter = () => {
          if (!suspended.current) gsap.to(loops[i], { timeScale: 0, duration: 0.4 });
        };
        const leave = () => {
          if (!suspended.current) gsap.to(loops[i], { timeScale: dirs[i], duration: 0.7 });
        };
        row.addEventListener("pointerenter", enter);
        row.addEventListener("pointerleave", leave);
        return () => {
          row.removeEventListener("pointerenter", enter);
          row.removeEventListener("pointerleave", leave);
        };
      });

      marquee.current = {
        stop: () => loops.forEach((l) => l.pause()),
        start: () =>
          loops.forEach((l, i) => {
            // resume(), not play(): these timelines run at a negative
            // timeScale and play() would flip them back to forward.
            const row = tracks[i].parentElement;
            l.timeScale(row?.matches(":hover") ? 0 : dirs[i]);
            l.resume();
          }),
      };

      return () => {
        unbind.forEach((off) => off());
        loops.forEach((loop) => loop.kill());
        marquee.current = null;
      };
    },
    { scope: root }
  );

  return (
    <section className="section work on-dark" id="work" aria-label="The work" ref={root}>
      <div className="wrap">
        <div className="work-head">
          <SectionHeading kicker={work.kicker} heading={work.heading} />
          <Reveal delay={0.1}>
            <p className="work-sub text-center">{work.sub}</p>
          </Reveal>
        </div>
      </div>

      {/* Full-bleed: the rows run edge to edge, outside .wrap's cap. */}
      <div className="work-wall">
        {rows.map((row, ri) => (
          <div className="work-wall-row" key={ri}>
            <div className="work-wall-track">
              {row.map((clip, i) => (
                <button
                  type="button"
                  className="work-tile"
                  key={`${ri}-${i}`}
                  style={clip.poster ? { backgroundImage: `url(${clip.poster})` } : undefined}
                  aria-label={`Play reel ${ri * PER_ROW + i + 1} full size`}
                  onClick={(e) => {
                    opener.current = e.currentTarget;
                    setActive(clip);
                  }}
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
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="sr-only">{work.description}</p>

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
