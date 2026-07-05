"use client";

import { gsap } from "@/lib/gsap";

type LoopConfig = { speed?: number; paddingRight?: number; paused?: boolean };

/* Seamless, width-independent horizontal marquee. Each item wraps to the end
   individually as it scrolls off the left, so the loop is genuinely infinite
   with no snap-back and no gap regardless of viewport width or item count.
   (Adapted from GSAP's well-known horizontalLoop helper.) */
export function horizontalLoop(
  itemsInput: Element[] | NodeListOf<Element>,
  config: LoopConfig = {}
) {
  const items = gsap.utils.toArray(itemsInput) as HTMLElement[];
  const tl = gsap.timeline({ repeat: -1, paused: config.paused, defaults: { ease: "none" } });
  const length = items.length;
  if (!length) return tl;

  const startX = items[0].offsetLeft;
  const widths: number[] = [];
  const xPercents: number[] = [];
  const pixelsPerSecond = (config.speed || 1) * 100;
  const snap = gsap.utils.snap(1);

  gsap.set(items, {
    xPercent: (i: number, el: Element) => {
      const w = (widths[i] = parseFloat(gsap.getProperty(el, "width", "px") as string));
      xPercents[i] = snap(
        (parseFloat(gsap.getProperty(el, "x", "px") as string) / w) * 100 +
          (gsap.getProperty(el, "xPercent") as number)
      );
      return xPercents[i];
    },
  });
  gsap.set(items, { x: 0 });

  const last = items[length - 1];
  const totalWidth =
    last.offsetLeft +
    (xPercents[length - 1] / 100) * widths[length - 1] -
    startX +
    last.offsetWidth * (gsap.getProperty(last, "scaleX") as number) +
    (config.paddingRight || 0);

  for (let i = 0; i < length; i++) {
    const item = items[i];
    const curX = (xPercents[i] / 100) * widths[i];
    const distanceToStart = item.offsetLeft + curX - startX;
    const distanceToLoop = distanceToStart + widths[i] * (gsap.getProperty(item, "scaleX") as number);
    tl.to(
      item,
      { xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100), duration: distanceToLoop / pixelsPerSecond },
      0
    ).fromTo(
      item,
      { xPercent: snap(((curX - distanceToLoop + totalWidth) / widths[i]) * 100) },
      { xPercent: xPercents[i], duration: (totalWidth - distanceToLoop) / pixelsPerSecond, immediateRender: false },
      distanceToLoop / pixelsPerSecond
    );
  }

  return tl;
}
