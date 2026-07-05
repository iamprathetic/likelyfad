import { content } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/anim/Reveal";

export function Testimonials() {
  const { testimonials } = content;
  return (
    <section className="section testimonials" aria-label="Testimonials">
      <div className="wrap">
        <SectionHeading kicker={testimonials.kicker} heading={testimonials.heading} />

        <Reveal stagger className="testi-grid" start="top 82%">
          {testimonials.items.map((t) => (
            <figure className="testi" key={t.who} data-reveal-item>
              <span className="testi-mark" aria-hidden="true">
                &ldquo;
              </span>
              <blockquote>{t.quote}</blockquote>
              <figcaption className="testi-who">{t.who}</figcaption>
            </figure>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
