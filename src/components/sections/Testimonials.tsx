import Image from "next/image";
import { content } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/anim/Reveal";

/* Two initials from the handle, for the no-photo fallback: "@northcut.co" → NC.
   Splits on the separators handles actually use so the second letter is the
   start of the second word, not just the next character. */
function initials(username: string) {
  const parts = username.replace(/^@/, "").split(/[.\-_\s]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0]?.slice(0, 2) ?? "";
  return letters.toUpperCase();
}

export function Testimonials() {
  const { testimonials } = content;
  return (
    <section className="section testimonials" aria-label="Testimonials">
      <div className="wrap">
        <SectionHeading kicker={testimonials.kicker} heading={testimonials.heading} />

        <Reveal stagger className="testi-grid" start="top 82%">
          {testimonials.items.map((t) => (
            <figure className="testi" key={t.username} data-reveal-item>
              <figcaption className="testi-head">
                <span className="testi-dp" aria-hidden={t.avatar ? undefined : "true"}>
                  {t.avatar ? (
                    <Image src={t.avatar} alt="" width={88} height={88} />
                  ) : (
                    initials(t.username)
                  )}
                </span>
                <span className="testi-id">
                  <span className="testi-user">{t.username}</span>
                  <span className="testi-who">{t.who}</span>
                </span>
              </figcaption>

              <blockquote>{t.quote}</blockquote>
            </figure>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
