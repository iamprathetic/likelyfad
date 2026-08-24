import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { ReelWall } from "@/components/sections/ReelWall";
import { WhyUs } from "@/components/sections/WhyUs";
import { Work } from "@/components/sections/Work";
import { Pricing } from "@/components/sections/Pricing";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <SmoothScroll>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <div className="hero-split">
          <Hero />
          <ReelWall />
        </div>
        <WhyUs />
        <Work />
        <Pricing />
        <Testimonials />
        <Faq />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
