"use client";

import { gsap } from "@/lib/gsap";

type Axis = "x" | "y";

type LoopConfig = {
  /** "x" = horizontal marquee, "y" = vertical marquee. Default "x". */
  axis?: Axis;
  speed?: number;
  /** Trailing gap so the wrap-around spacing matches the flex gap. */
  padding?: number;
  /** Play the loop backwards (right→left becomes left→right, up becomes down). */
  reversed?: boolean;
  /** 0–1 offset so sibling lanes don't start in lockstep. */
  startProgress?: number;
};

/* Seamless, size-independent marquee on either axis. Each item wraps to the
   end individually as it scrolls off, so the loop is genuinely infinite with
   no snap-back and no gap regardless of viewport size or item count.
   (Adapted from GSAP's well-known horizontalLoop helper, generalised to y.) */
export function marqueeLoop(
  itemsInput: Element[] | NodeListOf<Element>,
  config: LoopConfig = {}
) {
  const items = gsap.utils.toArray(itemsInput) as HTMLElement[];
  const tl = gsap.timeline({ repeat: -1, defaults: { ease: "none" } });
  const length = items.length;
  if (!length) return tl;

  const vertical = config.axis === "y";
  const pctProp = vertical ? "yPercent" : "xPercent";
  const sizeProp = vertical ? "height" : "width";
  const scaleProp = vertical ? "scaleY" : "scaleX";
  const posProp = vertical ? "y" : "x";
  const offsetOf = (el: HTMLElement) => (vertical ? el.offsetTop : el.offsetLeft);
  const outerOf = (el: HTMLElement) => (vertical ? el.offsetHeight : el.offsetWidth);

  const sizes: number[] = [];
  const pcts: number[] = [];
  const offsets: number[] = [];
  const pixelsPerSecond = (config.speed || 1) * 100;
  const snap = gsap.utils.snap(1);

  /* READ PASS — every layout query first, in one go.
     This used to be a single gsap.set() with a function value, which computes
     and WRITES one element at a time. Reading `height` right after writing a
     transform invalidates layout, so the browser had to reflow once per item,
     per lane, on a subtree holding eighteen <video> elements — a burst of
     forced synchronous layout exactly as the wall mounted. Measuring everything
     up front and writing afterwards costs one reflow instead of N.
     (Safe to hoist: offsetTop/offsetHeight are unaffected by the transforms
     written below, so the values are identical either way.) */
  for (let i = 0; i < length; i++) {
    const el = items[i];
    offsets[i] = offsetOf(el);
    sizes[i] = parseFloat(gsap.getProperty(el, sizeProp, "px") as string);
    pcts[i] = snap(
      (parseFloat(gsap.getProperty(el, posProp, "px") as string) / sizes[i]) * 100 +
        (gsap.getProperty(el, pctProp) as number)
    );
  }
  const lastOuter = outerOf(items[length - 1]);
  const startPos = offsets[0];

  // WRITE PASS — no layout reads past this point.
  gsap.set(items, { [pctProp]: (i: number) => pcts[i] });
  gsap.set(items, { [posProp]: 0 });

  const last = items[length - 1];
  const totalSize =
    offsets[length - 1] +
    (pcts[length - 1] / 100) * sizes[length - 1] -
    startPos +
    lastOuter * (gsap.getProperty(last, scaleProp) as number) +
    (config.padding || 0);

  for (let i = 0; i < length; i++) {
    const item = items[i];
    const cur = (pcts[i] / 100) * sizes[i];
    const distanceToStart = offsets[i] + cur - startPos;
    const distanceToLoop =
      distanceToStart + sizes[i] * (gsap.getProperty(item, scaleProp) as number);
    tl.to(
      item,
      {
        [pctProp]: snap(((cur - distanceToLoop) / sizes[i]) * 100),
        duration: distanceToLoop / pixelsPerSecond,
      },
      0
    ).fromTo(
      item,
      { [pctProp]: snap(((cur - distanceToLoop + totalSize) / sizes[i]) * 100) },
      {
        [pctProp]: pcts[i],
        duration: (totalSize - distanceToLoop) / pixelsPerSecond,
        immediateRender: false,
      },
      distanceToLoop / pixelsPerSecond
    );
  }

  const offset = (config.startProgress || 0) * tl.duration();
  const iteration = tl.duration();
  if (config.reversed && iteration > 0) {
    /* A repeat:-1 timeline runs forever forwards but stops dead when a negative
       timeScale walks totalTime back to 0 — so a reversed lane needs runway,
       and any fixed amount of it eventually runs out. (That was this file's
       bug: the lane simply halted mid-session while the un-reversed middle lane
       kept going.) Park it far ahead, then hop it forward again whenever it
       nears the start. The timeline is periodic, so a jump of whole iterations
       lands on an identical frame and is invisible; suppressEvents keeps the
       seek from re-entering this callback. */
    const RUNWAY = 500;
    tl.timeScale(-1);
    tl.totalTime(iteration * RUNWAY - offset);
    tl.eventCallback("onUpdate", () => {
      const t = tl.totalTime();
      if (t < iteration * 2) tl.totalTime(t + iteration * (RUNWAY - 4), true);
    });
  } else if (offset) {
    tl.time(offset);
  }

  return tl;
}
