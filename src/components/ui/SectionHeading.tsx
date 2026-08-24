import { RevealText } from "@/components/anim/RevealText";
import { Reveal } from "@/components/anim/Reveal";

type SectionHeadingProps = {
  kicker: string;
  heading: string;
  className?: string;
};

/* The title is `display: inline` (RevealText splits it into word spans), so a
   max-width can't sit on it — the wrap is decided on the container. A ch/em cap
   would resolve against the BODY font size rather than the title's, so the
   measure is derived from --title-size instead: ~11.5 title-em is wide enough
   that every heading breaks over two lines rather than three, and far too
   narrow to collapse onto one.
   --title-size is set here so a section can override just that one number
   (see Faq, which runs a smaller heading). */
const HEAD =
  "[--title-size:clamp(3.2rem,1.5rem+4.9vw,5.1rem)] " +
  "max-w-[calc(var(--title-size)*11.5)] mx-auto text-center " +
  "mb-[clamp(1.7rem,3.2vw,2.6rem)]";

/* Section kickers sit above a big heading, so they carry more presence than a
   standalone .kicker — bigger type and a longer rule. */
/* .section-kicker is a styling hook, not a utility: dark sections need to
   re-colour this (see .on-dark .section-kicker in globals.css), and an
   unlayered rule can override a Tailwind utility while a utility cannot. */
const KICKER =
  "section-kicker inline-flex items-center gap-[0.65em] font-mono font-medium uppercase " +
  "tracking-[0.22em] text-pink-deep text-[clamp(1.3rem,0.82rem+0.3vw,1.05rem)] " +
  "before:content-[''] before:w-[2.2em] before:h-px before:bg-current before:opacity-55";

export function SectionHeading({ kicker, heading, className = "" }: SectionHeadingProps) {
  return (
    <div className={`${HEAD} ${className}`}>
      <Reveal>
        <span className={KICKER}>{kicker}</span>
      </Reveal>
      <RevealText
        as="h2"
        /* Larger than the base display-lg so section headings carry weight. */
        className="mt-[0.85rem] font-serif font-semibold leading-[1.06] tracking-[-0.012em] text-[length:var(--title-size)]"
        text={heading}
      />
    </div>
  );
}
