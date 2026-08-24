"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { content } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/anim/Reveal";
import { Button } from "@/components/ui/Button";

export function Faq() {
  const { faq } = content;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="section faq" id="faq" aria-label="Frequently asked questions">
      <div className="wrap faq-grid">
        <div className="faq-head">
          <SectionHeading kicker={faq.kicker} heading={faq.heading} />
          <Reveal delay={0.1} className="faq-cta">
            <Button contact variant="light" withArrow>
              {faq.cta}
            </Button>
          </Reveal>
        </div>

        <Reveal stagger className="faq-list" start="top 84%">
          {faq.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div className={`faq-item ${isOpen ? "is-open" : ""}`} key={item.q} data-reveal-item>
                <h3 className="faq-q-wrap">
                  <button
                    className="faq-q"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-q-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span>{item.q}</span>
                    <span className="faq-plus" aria-hidden="true">
                      <i /> <i />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`faq-q-${i}`}
                      className="faq-a"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <p>{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
