"use client";

import type { ReactNode } from "react";
import { Magnetic } from "@/components/anim/Magnetic";
import { contactUrl } from "@/lib/site";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";

type Variant = "grad" | "dark" | "ghost" | "light";

/* Styling lives here rather than in globals.css. The design tokens (--grad,
   --shadow-pink, --dur, --ease) still come from :root — Tailwind reaches them
   through arbitrary values, so the palette stays in one place while the layout
   sits with the component. */
const BASE =
  "group relative inline-flex items-center justify-center gap-[0.55em] " +
  "px-[1.65rem] py-[0.95rem] rounded-full overflow-hidden border border-transparent " +
  // 700, not 600: Lato has no 600, so the browser resolves it up to 700 anyway.
  "font-sans font-bold text-[0.96rem] tracking-[-0.01em] will-change-transform " +
  "[transition:color_var(--dur)_var(--ease),border-color_var(--dur)_var(--ease)," +
  "background_var(--dur)_var(--ease),box-shadow_var(--dur)_var(--ease)]";

const VARIANTS: Record<Variant, string> = {
  // The gradient is oversized and slid on hover rather than cross-faded.
  grad:
    "bg-[image:var(--grad)] bg-[length:150%_100%] bg-[position:0%_0%] text-white " +
    "shadow-[0_12px_30px_-12px_rgba(236,72,153,0.6)] " +
    "hover:bg-[position:100%_0%] hover:shadow-[var(--shadow-pink)]",
  // Gradient wipes up from below the button on hover.
  dark:
    "bg-ink text-paper hover:shadow-[var(--shadow-pink)] " +
    "after:content-[''] after:absolute after:inset-0 after:z-0 " +
    "after:bg-[image:var(--grad)] after:translate-y-[101%] " +
    "after:[transition:transform_var(--dur)_var(--ease-emphasis)] " +
    "hover:after:translate-y-0",
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
  magnetic?: boolean;
};

export function Button({
  children,
  href = "#", // PLACEHOLDER LINK
  variant = "grad",
  className = "",
  withArrow = false,
  contact = false,
  ariaLabel,
  magnetic = true,
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

  const anchor = (
    <a
      href={finalHref}
      className={`${BASE} ${VARIANTS[variant]} ${className}`}
      onClick={onClick}
      target={isContact ? "_blank" : undefined}
      rel={isContact ? "noopener noreferrer" : undefined}
      aria-label={ariaLabel ?? (isContact ? "Send us a DM on X" : undefined)}
      data-placeholder-link={!isContact && !isAnchor ? "true" : undefined}
    >
      {/* z-1 keeps both above the `dark` variant's wiping ::after layer. */}
      <span className="relative z-[1]">{children}</span>
      {withArrow && (
        <span
          className="relative z-[1] [transition:transform_var(--dur)_var(--ease)] group-hover:translate-x-[4px]"
          aria-hidden="true"
        >
          →
        </span>
      )}
    </a>
  );

  return magnetic ? (
    <Magnetic strength={0.4} radius={70}>
      {anchor}
    </Magnetic>
  ) : (
    anchor
  );
}
