/* ============================================================================
   LIKELYFAD V4 - content.js
   ----------------------------------------------------------------------------
   THIS IS THE ONLY FILE YOU EDIT FOR WORDS.

   Every line of text on the page lives here. Change a value, save, refresh.
   You never touch the design or the code.

   GOLDEN RULES (so nothing breaks):
   1. Only change the text INSIDE the "quotes". Keep the quotes.
   2. Keep every comma at the end of a line.
   3. If it breaks, you removed a quote, a comma, or a bracket. Undo and retry.

   THE *STARS* TRICK (gradient colour):
   Anything wrapped in *asterisks* turns into the brand gradient.
      "nobody asks *if they're AI.*"  ->  gradient on "if they're AI."
   Always use the stars in pairs.

   HOUSE RULES already applied in this copy (keep them when you edit):
   - No em dashes anywhere. Use a period or a comma instead.
   - No dollar amounts anywhere on the site.
   - Only REAL client quotes. Never invent a quote or a number.
   ========================================================================== */

window.LIKELYFAD_V4 = {

  /* --- Where every CTA button sends people, and what it says. --- */
  xUrl: "https://x.com/amanxdesign",
  ctaLabel: "DM us your product",

  /* --- 1. HERO (headline + CTA left, live proof wall right) --- */
  hero: {
    kicker: "AI production studio",
    headline: "Ads so real, nobody asks *if they're AI.*",
    sub: "Likelyfad makes AI video, UGC and statics that look shot on a real set. Fast enough to test every week, clean enough to run straight into paid.",
    secondaryCta: "Why us",              // scrolls to the Why us section
    // The small trust line under the buttons. True facts only.
    microTrust: "First concepts in 48 hours · A human checks every frame",
    wallCaption: "Real client work. Every frame is AI.",
  },

  /* --- The proof wall (right side of the hero). One still per real clip.
         To add more: drop a jpg in assets/wall/ and add a line here. --- */
  wall: [
    "assets/wall/n02.jpg", "assets/wall/n14.jpg", "assets/wall/n05.jpg",
    "assets/wall/n21.jpg", "assets/wall/n03.jpg", "assets/wall/n26.jpg",
    "assets/wall/n07.jpg", "assets/wall/n31.jpg", "assets/wall/n04.jpg",
    "assets/wall/n24.jpg", "assets/wall/n06.jpg", "assets/wall/n33.jpg",
    "assets/wall/n01.jpg", "assets/wall/n16.jpg", "assets/wall/n29.jpg",
  ],

  /* --- 2. WHY US (the value proposition: six reasons to believe) --- */
  why: {
    kicker: "Why us",
    heading: "The reason brands *actually keep us.*",
    sub: "One question decides this: why trust an AI studio with the creative that spends your money. Here is the honest case.",
    cards: [
      { title: "It looks real, or it doesn't ship", body: "Every frame is built to pass as a real shoot. Natural skin, hands, lighting, lip-sync. If it reads AI, we cut it before you ever see it." },
      { title: "Days, not weeks",                   body: "Send a brief today, review first concepts in about 48 hours. Create at the speed your ad account actually moves." },
      { title: "A fraction of the cost",            body: "No crew, no location, no reshoots. You pay for the output, not the overhead, so you can finally afford to test more." },
      { title: "Angles, not one bet",               body: "20 to 40 distinct variants a month, so you learn what wins before you pour real money into media." },
      { title: "Built to run",                      body: "Hook-first, sized for every placement, and exported ready to drop straight into your ad manager." },
      { title: "One DM to start",                   body: "No forms, no onboarding maze. Send a product link and the angle you want. We handle the rest." },
    ],
    // The big statement band between the cards and the work.
    statement: "If your best ad is six months old, you don't have a creative problem. You have a *volume problem.*",
  },

  /* --- 3. THE WORK (playable proof). Clips live in assets/work/. --- */
  work: {
    kicker: "The work",
    heading: "Don't trust stills. *Press play.*",
    hint: "Sound on. Every clip is AI.",
    clips: [
      { title: "Podcast style ad",     src: "assets/work/ai-ugc-06.mp4", poster: "assets/work/ai-ugc-06.jpg" },
      { title: "Gym perfume ad",       src: "assets/work/ai-ugc-01.mp4", poster: "assets/work/ai-ugc-01.jpg" },
      { title: "Live stage expert",    src: "assets/work/ai-ugc-07.mp4", poster: "assets/work/ai-ugc-07.jpg" },
      { title: "Doctor spokesperson",  src: "assets/work/ai-ugc-03.mp4", poster: "assets/work/ai-ugc-03.jpg" },
      { title: "Health product UGC",   src: "assets/work/ai-ugc-05.mp4", poster: "assets/work/ai-ugc-05.jpg" },
      { title: "Expert review",        src: "assets/work/ai-ugc-04.mp4", poster: "assets/work/ai-ugc-04.jpg" },
    ],
  },

  /* --- 4. PRICING (structure without numbers: quote per brief) --- */
  pricing: {
    kicker: "Pricing",
    heading: "Priced to your brief, *not a package.*",
    blurb: "Every brand's scope is different. Formats, volume, turnaround. Tell us what you need and we'll send a straight number, no fine print. Most brands then move to a monthly retainer sized to how much they test.",
    checks: [
      "A fixed quote before anything starts",
      "Revisions until you sign off",
      "Every ratio your channels need",
      "Full commercial usage, yours to run anywhere",
    ],
    ctaLabel: "Get your quote",
    note: "Most brands get a number back the same day.",
  },

  /* --- 5. WHAT CLIENTS SAY (REAL quotes only, identities kept private) --- */
  testimonials: {
    kicker: "What clients say",
    heading: "Real reactions, *as sent.*",
    items: [
      { quote: "Looks great. Let's do the next one in German.",                      who: "Founder, EU fashion brand · after the first batch" },
      { quote: "You cooked on this edit. The AI looks so real. Very convincing.",    who: "DTC brand owner · on a podcast-style ad" },
      { quote: "Insane realism.",                                                    who: "Creative lead · health brand" },
    ],
  },

  /* --- 6. FAQ (objections, in the order founders raise them) --- */
  faq: {
    kicker: "Questions",
    heading: "The stuff founders ask *before they reach out.*",
    items: [
      { q: "Will people be able to tell it's AI?", a: "That's the bar we build to. Look at the work above and judge for yourself. Every frame is checked by a person before it leaves us. If it reads fake, it doesn't ship." },
      { q: "How fast is the first batch?", a: "First concepts in about 48 hours. Then we iterate until you'd run it." },
      { q: "What do you need from us?", a: "A product link and a rough idea of the angle. Footage and past ads help but aren't required. A DM is enough to start." },
      { q: "Who owns the work?", a: "You do. Full commercial rights, no watermarks, yours to run anywhere. Every winning hook and asset stays yours, even if you leave." },
      { q: "How do you stay on-brand?", a: "We lock your colors, product, and tone up front, then a strategist reviews every output against it. No drift." },
      { q: "What if I don't like the first batch?", a: "Start with one paid test. If you wouldn't run it, full refund. You only keep paying once it works." },
      { q: "How much does it cost?", a: "It depends on how much creative you run a month. Tell us your volume in a DM and we'll send a plan that fits, same day." },
      { q: "Video, static, or both?", a: "Both. Video, UGC, spokesperson and podcast ads, statics. If it runs on a feed, we make it." },
    ],
  },

  /* --- 7. FINAL CTA + FOOTER --- */
  close: {
    heading: "Ready to run ads nobody clocks as AI? *Let's talk.*",
    sub: "No forms. No calls unless you want one. We reply within 24 hours.",
  },
  footer: {
    tagline: "An AI production studio for brands that ship.",
    legal: "Likelyfad. An AI production studio by Bright Life Creations.",
    year: "2026",
  },

};
