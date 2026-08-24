"use client";

import type { ReactNode } from "react";
import { contactUrl } from "@/lib/site";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";

type Variant = "grad" | "dark" | "ghost" | "light";

/* Styling lives here rather than in globals.css. The design tokens (--grad,
   --shadow-pink, --dur, --ease) still come from :root — Tailwind reaches them
   through arbitrary values, so the palette stays in one place while the layout
   sits with the component.

   Buttons hold still. Hover changes colour, border and shadow only — nothing
   moves, slides or wipes, so the CTA reads as a control rather than a toy. */
const BASE =
  "relative inline-flex items-center justify-center gap-[0.55em] " +
  "px-[1.65rem] py-[0.95rem] rounded-full overflow-hidden border border-transparent " +
  // 700, not 600: Lato has no 600, so the browser resolves it up to 700 anyway.
  "font-sans font-bold text-[0.96rem] tracking-[-0.01em] " +
  "[transition:color_var(--dur)_var(--ease),border-color_var(--dur)_var(--ease)," +
  "background-color_var(--dur)_var(--ease),box-shadow_var(--dur)_var(--ease)]";

const VARIANTS: Record<Variant, string> = {
  grad:
    "bg-[image:var(--grad)] text-white " +
    "shadow-[0_12px_30px_-12px_rgba(236,72,153,0.6)] hover:shadow-[var(--shadow-pink)]",
  dark: "bg-ink text-paper hover:shadow-[var(--shadow-pink)]",
  ghost: "bg-transparent text-ink border-line hover:border-pink hover:text-pink-deep",
  light:
    "bg-white text-ink border-line hover:border-pink hover:text-pink-deep " +
    "hover:shadow-[var(--shadow-sm)]",
};

type ButtonProps = {
  children: ReactNode;
  /** Placeholder href, or an in-page anchor (#id). Ignored when `contact` is set. */
  href?: string;
  variant?: Variant;
  className?: string;
  withArrow?: boolean;
  /** When true, this becomes the DM CTA → opens the X profile in a new tab. */
  contact?: boolean;
  ariaLabel?: string;
};

export function Button({
  children,
  href = "#", // PLACEHOLDER LINK
  variant = "grad",
  className = "",
  withArrow = false,
  contact = false,
  ariaLabel,
}: ButtonProps) {
  const { scrollTo } = useSmoothScroll();

  const isContact = contact;
  const finalHref = isContact ? contactUrl() : href;
  const isAnchor = !isContact && finalHref.startsWith("#");

  const onClick = (e: React.MouseEvent) => {
    if (isAnchor) {
      e.preventDefault();
      scrollTo(finalHref);
    }
    // Contact just follows its href (opens the X profile in a new tab).
  };

  return (
    <a
      href={finalHref}
      className={`${BASE} ${VARIANTS[variant]} ${className}`}
      onClick={onClick}
      target={isContact ? "_blank" : undefined}
      rel={isContact ? "noopener noreferrer" : undefined}
      aria-label={ariaLabel ?? (isContact ? "Send us a DM on X" : undefined)}
      data-placeholder-link={!isContact && !isAnchor ? "true" : undefined}
    >
      <span>{children}</span>
      {withArrow && <span aria-hidden="true">→</span>}
    </a>
  );
}
