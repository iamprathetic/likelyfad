"use client";

import { content } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/anim/Reveal";
import { Button } from "@/components/ui/Button";

export function Pricing() {
  const { pricing } = content;
  return (
    <section className="section pricing" id="pricing" aria-label="Pricing">
      <div className="wrap">
        <SectionHeading kicker={pricing.kicker} heading={pricing.heading} align="center" />

        <Reveal className="pricing-card">
          <div className="pricing-card-inner">
            <p className="pricing-body">{pricing.body}</p>

            <ul className="pricing-includes">
              {pricing.includes.map((it) => (
                <li key={it}>
                  <span className="pricing-tick" aria-hidden="true">
                    ✓
                  </span>
                  {it}
                </li>
              ))}
            </ul>

            <div className="pricing-cta">
              <Button contact variant="grad" withArrow>
                {pricing.cta}
              </Button>
              <p className="pricing-foot">{pricing.foot}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
