/* ============================================================================
   LIKELYFAD V3 - content.js
   ----------------------------------------------------------------------------
   THIS IS THE ONLY FILE YOU EDIT FOR WORDS.

   Every line of text on the V3 page lives here. Change a value, save the file,
   refresh the page. You never touch the design or the code.

   GOLDEN RULES (so nothing breaks):
   1. Only change the text INSIDE the "quotes". Keep the quotes.
   2. Keep every comma at the end of a line.
   3. If it breaks, you removed a quote, a comma, or a bracket. Undo and retry.

   THE *STARS* TRICK (gradient colour):
   Anything wrapped in *asterisks* turns into the pink-orange gradient colour.
      "That was AI. *Every frame.*"   ->   Every frame. is gradient
   Remove the stars to make it plain. Add stars around other words to highlight
   them instead. Always use them in pairs.

   WHAT IS *NOT* HERE:
   - The clips/folders on the page come from your video files, not this file.
     To change those, edit the "Videos to use" folder and run the build script
     (see v3/tools/build-portfolio.sh and build-wall.sh).
   ========================================================================== */

window.LIKELYFAD_V3 = {

  /* --- Where every "DM" button sends people. Change the handle if you make a
         Likelyfad account. The label is the button text. --- */
  xUrl: "https://x.com/amanxdesign",
  ctaLabel: "DM us your product",

  /* --- SCENE 1: the opening reveal (clips that un-render to show they're AI) --- */
  reveal: {
    kicker: "A real shoot?",          // small line above the hook
    hook: "Watch closely.",            // big line over the video
    payoff: "That was AI. *Every frame.*",   // the line that lands after the reveal
    scrollCue: "scroll",               // the little prompt at the bottom
    aiTag: "AI · 100%",                // the badge in the corner of each clip
  },

  /* --- SCENE 2: the turn --- */
  claim: {
    kicker: "The point",
    heading: "Real enough your customers *won't question it*.",
    sub: "And we don't make one. We make a flood.",
  },

  /* --- SCENE 3: the wall of clips (every one is AI) --- */
  wall: {
    kicker: "The work",
    heading: "Every one of these *is AI.*",
    sub: "Different products, different sectors. Not one of them filmed.",
  },

  /* --- SCENE 4: the folders (browse the real work) --- */
  finder: {
    kicker: "See for yourself",
    heading: "Open a folder. *Watch the work.*",
    hint: "Click any folder. Every clip is AI.",          // shown on computers
    hintTouch: "Tap any folder. Every clip is AI.",       // shown on phones
    windowTitle: "Likelyfad · The work",                  // title in the window bar
  },

  /* --- SCENE 5: how it works --- */
  pipeline: {
    kicker: "How it works",
    heading: "One brief in. *A month of ads out.*",
    sub: "You send the idea. We do the rest. You get a stack of ads ready to run.",
    // The numbered steps. Add or remove a { } block to change how many there are.
    steps: [
      { title: "Brief",       body: "Send your product and a rough idea. A DM is enough to start." },
      { title: "Generate",    body: "We build variants from what already works. Your product, your footage, your voice. Not random AI actors." },
      { title: "Human check", body: "A person checks every frame. Color, texture, motion. Nothing fake ships." },
      { title: "Delivered",   body: "Ready-to-run files in about 48 hours. Then we iterate." },
    ],
    // The three numbers under the steps.
    stats: [
      { value: "48h",      label: "to first cuts" },
      { value: "20 to 40", label: "ad variants a month" },
      { value: "100%",     label: "human-checked" },
    ],
  },

  /* --- SCENE 6: where we fit (comparison table) ---
         Each row: label + the three columns. The last column (likelyfad) is the
         highlighted one. Add/remove a row by copying a { } block. --- */
  comparison: {
    kicker: "Where we fit",
    heading: "Faster than an agency. Safer than raw AI.",
    columns: ["Pure AI tools", "An agency", "Likelyfad"],
    rows: [
      { label: "Speed",        ai: "Fast",                      agency: "Slow. Weeks per round.", likelyfad: "First concepts in 48 hours" },
      { label: "Volume",       ai: "High, but generic",         agency: "Low. A few a month.",    likelyfad: "20 to 40 variants a month" },
      { label: "Brand safety", ai: "Risky. It hallucinates.",   agency: "Safe, but slow",         likelyfad: "Human check on every frame" },
      { label: "Strategy",     ai: "None. You prompt it.",      agency: "Yes, at agency rates",   likelyfad: "A strategist on every brief" },
    ],
  },

  /* --- SCENE 7: testimonials (real client words, names kept private) --- */
  testimonials: {
    kicker: "What clients say",
    heading: "They came for fast. They stayed for real.",
    items: [
      { quote: "Looks great. Let's do the next one in German.",            who: "Founder, EU brand" },
      { quote: "You cooked on this edit. The AI looks so real. Very convincing.", who: "Brand owner" },
      { quote: "Insane realism.",                                          who: "Creative lead" },
    ],
  },

  /* --- SCENE 8: FAQ (objections, in the order founders raise them) --- */
  faq: {
    kicker: "Questions",
    heading: "The stuff founders ask before they reach out.",
    items: [
      { q: "Does it actually look real, or does it look AI?", a: "Look at the work above and judge for yourself. Every frame is checked by a person before it leaves us. If it reads as fake, it doesn't ship." },
      { q: "Who owns the work?", a: "You do. Full commercial rights, no watermarks, yours to run anywhere. Every winning hook and asset stays yours, even if you leave." },
      { q: "How do you stay on-brand?", a: "We lock your colors, product, and tone up front, then a strategist reviews every output against it. No drift." },
      { q: "What if I don't like the first batch?", a: "Start with one paid test. If it's not usable, you get a full refund. You only keep paying once it works." },
      { q: "What does it cost?", a: "It depends on how much creative you run a month. Tell us your volume in a DM and we'll send a plan that fits. Most brands start with one paid test before committing." },
      { q: "Video, static, or both?", a: "Both. Video, UGC, spokesperson and podcast ads, statics, animation. If it runs on a feed, we make it." },
      { q: "What tools do you use?", a: "Whatever ships the best result. The tools change every month. The judgment behind them doesn't." },
      { q: "How do we start?", a: "DM on X with your product and your biggest creative bottleneck. We reply within 24 hours. No long sales call." },
    ],
  },

  /* --- SCENE 9: guarantee (risk reversal) --- */
  guarantee: {
    kicker: "Your risk, removed",
    heading: "One paid test. If it's not usable, full refund.",
    items: [
      { title: "Start with one paid test",     body: "One paid test video to begin. Not usable? Full refund. You only keep paying once it works." },
      { title: "Real, or we remake it",        body: "If it doesn't look real, we redo it free. Realism is the job, and we stand behind it." },
      { title: "Revisions until you sign off", body: "We iterate until it's right, at no extra charge. You approve it, not us." },
    ],
  },

  /* --- SCENE 10: the close (the ask). Heading is two lines. --- */
  close: {
    kicker: "Your move",
    headingLine1: "Tell us what's in your head.",
    headingLine2: "We'll turn it into *creative you can&nbsp;run.*",   /* &nbsp; stops "run." orphaning on its own line */
    sub: "No forms. No calls unless you want one. We reply within 24 hours.",
    foot: "Likelyfad. An AI production studio by Bright Life Creations.",
  },

};
