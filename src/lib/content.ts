/* ============================================================================
   CONTENT — single source of truth for all copy. Original wording.
   Wrap a phrase in *asterisks* to gradient-highlight it in headings.

   The only real outbound link is the Contact CTA (see lib/site.ts → contactUrl).
   Every other href is a PLACEHOLDER. Testimonials are DUMMY — swap later.
   ========================================================================== */

import { X_HANDLE } from "./site";
import { reelVideos } from "./reels.generated";

export const content = {
  brand: "Likelyfad",

  nav: {
    links: [
      { label: "Why us", href: "#why" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
    cta: "Contact us",
  },

  hero: {
    eyebrow: "AI production studio",
    headline: "Ads so real, *nobody asks if they're AI.*",
    subline:
      "Likelyfad makes AI video, UGC and stills that look shot on a real set — fast enough to test every week, clean enough to run straight into paid.",
    primaryCta: "Contact us",
    secondaryCta: "Why us",
    secondaryHref: "#why",
    reassurance: "First concepts in 72 hours · No retainers · No fine print.",
  },

  /* 3D reel wall — the clip list is generated from the Google Drive folder by
     `npm run sync:videos`, so add or remove reels in Drive, not here. */
  reels: {
    caption: "Real work, not renders — every frame generated.",
    videos: reelVideos,
  },

  why: {
    kicker: "Why us",
    heading: "The reason brands actually keep us.",
    lead: "Everything below exists to answer one question — why trust an AI studio with the creative that spends your money. Here's the honest case.",
    pillars: [
      {
        title: "It looks real, or it doesn't ship",
        body: "Every frame is built to pass as a real shoot — natural skin, hands, lighting and lip-sync. If it reads AI, we cut it before you ever see it.",
      },
      {
        title: "Days, not weeks",
        body: "Send a brief today, review a batch of concepts within 72 hours. Create at the speed your ad account actually moves.",
      },
      {
        title: "A fraction of a studio day",
        body: "No crew, no location, no reshoots. You pay for the output, not the overhead — so you can finally afford to test more.",
      },
      {
        title: "Ten angles, not one bet",
        body: "We ship many distinct concepts per batch, so you learn what wins before you pour real money into media.",
      },
      {
        title: "Built to run, not just to look nice",
        body: "Hook-first, sized for every placement, and exported ready to drop straight into ad manager.",
      },
      {
        title: "One message to start",
        body: "No retainers, no lengthy onboarding. Send a product link and the angle you want — we handle the rest.",
      },
    ],
    claim: "If your best-performing ad is six months old, that isn't a creative problem — it's a *volume problem.* We fix that.",
    claimCta: "Contact us",
  },

  pricing: {
    kicker: "Pricing",
    heading: "Priced to your brief, not a package.",
    body: "Every brand's scope is different — formats, volume, turnaround — so we don't do fixed tiers. Tell us what you need and we'll send a straight number, with no retainers and no fine print.",
    includes: [
      "A fixed quote before anything starts",
      "Revisions included",
      "Every ratio your channels need",
      "Full commercial usage",
    ],
    cta: "Find out — contact us",
    foot: "Most brands get a quote back the same day.",
  },

  testimonials: {
    kicker: "Signal",
    heading: "What teams say after the first batch.",
    // DUMMY testimonials — replace with real ones later.
    items: [
      { quote: "Our cost per concept dropped 80% and we finally test more than two ideas a month.", who: "Growth lead, skincare brand" },
      { quote: "Briefed on Monday, running ads by Thursday. It changed how often we ship.", who: "Founder, supplements" },
      { quote: "We A/B tested it against a real shoot. The AI won on hold rate.", who: "Performance lead, beverage" },
      { quote: "The talent stays consistent across a whole campaign. That alone sold our brand team.", who: "Creative director, apparel" },
    ],
  },

  faq: {
    kicker: "Questions",
    heading: "The things teams ask before starting.",
    items: [
      {
        q: "Will people be able to tell it's AI?",
        a: "That's the bar we build to. Anything that reads synthetic gets cut before it reaches you. In blind tests, our work holds up against live footage.",
      },
      {
        q: "How fast is the first batch?",
        a: "First concepts land within 72 hours of a complete brief. Most brands review a full batch inside the first week.",
      },
      {
        q: "What do you need from us?",
        a: "A product link, a couple of references, and the angle you want to test. We handle talent, set, lighting, motion and the edit.",
      },
      {
        q: "Do we own the final files?",
        a: "Yes — full commercial usage and the source exports for every approved cut, in all the ratios you run.",
      },
      {
        q: "How much does it cost?",
        a: "It depends on scope and volume, so we quote per project with no retainers. Contact us and we'll send a fixed number the same day.",
      },
    ],
  },

  footer: {
    tagline: "An AI production studio for brands that ship.",
    columns: [
      {
        title: "Studio",
        links: [
          { label: "Why us", href: "#why" },
          { label: "Pricing", href: "#pricing" },
          { label: "FAQ", href: "#faq" },
        ],
      },
      {
        title: "Connect",
        links: [
          { label: "X / Twitter", href: `https://x.com/${X_HANDLE}`, external: true },
          { label: "Instagram", href: "#", external: true }, // PLACEHOLDER LINK
          { label: "Email", href: "#" }, // PLACEHOLDER LINK
        ],
      },
    ],
    legal: [
      { label: "Privacy", href: "#" }, // PLACEHOLDER
      { label: "Terms", href: "#" }, // PLACEHOLDER
    ],
  },
} as const;

export type Content = typeof content;
