import { content } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/anim/Reveal";

/* Quotes as clients actually sent them.
   These are real, and the clients asked to stay unnamed, so the card leads
   with the quote and attributes by role and category. No handle, no avatar:
   inventing either to fill the layout would make a real quote read as a fake
   one, which is the exact opposite of what this section is for. */
export function Testimonials() {
  const { testimonials } = content;
  return (
    <section className="section testimonials" aria-label="Testimonials">
      <div className="wrap">
        <SectionHeading kicker={testimonials.kicker} heading={testimonials.heading} />

        <Reveal stagger className="testi-grid" start="top 82%">
          {testimonials.items.map((t) => (
            <figure className="testi" key={t.quote} data-reveal-item>
              <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="testi-who">{t.who}</figcaption>
            </figure>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
