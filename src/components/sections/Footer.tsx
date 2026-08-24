"use client";

import { content } from "@/lib/content";
import { PARENT_COMPANY } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { RevealText } from "@/components/anim/RevealText";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";

export function Footer() {
  const { footer, close, brand } = content;
  const { scrollTo } = useSmoothScroll();
  const year = 2026; // PLACEHOLDER — update or compute at build time

  const onAnchor = (href: string) => (e: React.MouseEvent) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      scrollTo(href);
    }
  };

  return (
    /* on-dark re-points the ink and gradient tokens for everything inside, so
       the gradient wordmark and the closing highlight use the bright ramp
       rather than the darkened on-paper cut. */
    <footer className="footer on-dark" aria-label="Footer">
      <div className="wrap footer-cta">
        <RevealText as="p" className="footer-cta-text" text={close.heading} />
        <div className="footer-cta-side">
          <Button contact variant="grad" withArrow>
            {close.cta}
          </Button>
          <p className="footer-cta-sub">{close.sub}</p>
        </div>
      </div>

      <div className="wrap footer-grid">
        <div className="footer-brand">
          <a href="#top" className="footer-mark grad-text" onClick={onAnchor("#top")}>
            {brand}
          </a>
          <p className="footer-tagline">{footer.tagline}</p>
        </div>

        {footer.columns.map((col) => (
          <nav className="footer-col" key={col.title} aria-label={col.title}>
            <span className="footer-col-title">{col.title}</span>
            <ul>
              {col.links.map((l) => {
                const external = "external" in l && l.external;
                return (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      onClick={onAnchor(l.href)}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className="footer-link"
                    >
                      {l.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        ))}
      </div>

      <div className="wrap footer-base">
        <span>
          © {year} {brand}. An AI production studio by {PARENT_COMPANY}.
        </span>
      </div>
    </footer>
  );
}
