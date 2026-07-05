"use client";

import { content } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/anim/Reveal";
import { RevealText } from "@/components/anim/RevealText";
import { Button } from "@/components/ui/Button";

export function WhyUs() {
  const { why } = content;
  return (
    <section className="section why" id="why" aria-label="Why us">
      <div className="wrap">
        <div className="why-head">
          <SectionHeading kicker={why.kicker} heading={why.heading} />
          <Reveal delay={0.1}>
            <p className="why-lead lead">{why.lead}</p>
          </Reveal>
        </div>

        <Reveal stagger className="why-grid" start="top 80%">
          {why.pillars.map((p, i) => (
            <article className="pillar" key={p.title} data-reveal-item>
              <span className="pillar-num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </Reveal>

        <div className="why-claim">
          <RevealText as="p" className="why-claim-text display-lg" text={why.claim} stagger={0.03} />
          <Reveal delay={0.1}>
            <Button contact variant="dark" withArrow>
              {why.claimCta}
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
