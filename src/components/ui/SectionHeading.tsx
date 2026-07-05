import { RevealText } from "@/components/anim/RevealText";
import { Reveal } from "@/components/anim/Reveal";

type SectionHeadingProps = {
  kicker: string;
  heading: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({ kicker, heading, align = "left", className = "" }: SectionHeadingProps) {
  return (
    <div className={`section-head ${align === "center" ? "is-center" : ""} ${className}`}>
      <Reveal>
        <span className="kicker">{kicker}</span>
      </Reveal>
      <RevealText as="h2" className="display-lg section-head-title" text={heading} />
    </div>
  );
}
