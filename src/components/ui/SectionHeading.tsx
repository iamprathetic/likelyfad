import { RevealText } from "@/components/anim/RevealText";
import { Reveal } from "@/components/anim/Reveal";

type SectionHeadingProps = {
  kicker: string;
  heading: string;
  className?: string;
};

export function SectionHeading({ kicker, heading, className = "" }: SectionHeadingProps) {
  return (
    <div className={`section-head ${className}`}>
      <Reveal>
        <span className="kicker">{kicker}</span>
      </Reveal>
      <RevealText as="h2" className="display-lg section-head-title" text={heading} />
    </div>
  );
}
