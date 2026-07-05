"use client";

import type { ReactNode } from "react";
import { Magnetic } from "@/components/anim/Magnetic";
import { contactUrl } from "@/lib/site";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";

type Variant = "grad" | "dark" | "ghost" | "light";

type ButtonProps = {
  children: ReactNode;
  /** Placeholder href, or an in-page anchor (#id). Ignored when `contact` is set. */
  href?: string;
  variant?: Variant;
  className?: string;
  withArrow?: boolean;
  /** When true, this becomes the "Contact us" CTA → opens the pre-filled X DM. */
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
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      target={isContact ? "_blank" : undefined}
      rel={isContact ? "noopener noreferrer" : undefined}
      aria-label={ariaLabel ?? (isContact ? "Contact us on X" : undefined)}
      data-placeholder-link={!isContact && !isAnchor ? "true" : undefined}
    >
      <span className="btn-label">{children}</span>
      {withArrow && (
        <span className="btn-arrow" aria-hidden="true">
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
