"use client";

import { content } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";

export function Footer() {
  const { footer, brand } = content;
  const { scrollTo } = useSmoothScroll();
  const year = 2026; // PLACEHOLDER — update or compute at build time

  const onAnchor = (href: string) => (e: React.MouseEvent) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      scrollTo(href);
    }
  };

  return (
    <footer className="footer" aria-label="Footer">
      <div className="wrap footer-cta">
        <p className="footer-cta-text">
          Ready to see believable work, fast? <span className="grad-text">Let&rsquo;s talk.</span>
        </p>
        <Button contact variant="grad" withArrow>
          {content.nav.cta}
        </Button>
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
                const placeholder = l.href === "#";
                return (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      onClick={onAnchor(l.href)}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      data-placeholder-link={placeholder ? "true" : undefined}
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
          © {year} {brand}. All rights reserved.
        </span>
        <span className="footer-legal">
          {footer.legal.map((l) => (
            <a key={l.label} href={l.href} data-placeholder-link="true">
              {l.label}
            </a>
          ))}
        </span>
      </div>
    </footer>
  );
}
