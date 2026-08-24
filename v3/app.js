/* ============================================================================
   LIKELYFAD V3 - Scene 0 -> 1 reveal (3 clips on desktop, 1 on mobile).
   Vanilla + GSAP + Lenis. Scroll drives one timeline:
   "Watch closely" -> all clips un-render to the AI treatment -> "That was AI."
   Degrades to a clean static state if GSAP is missing or reduced-motion is on.
   ============================================================================ */
/* ============================================================================
   CONTENT FILL - pulls every line of copy from content.js (window.LIKELYFAD_V3)
   into the page, so all text is edited in ONE file. *stars* become the gradient
   highlight. Runs first and always (no GSAP needed). If content.js is missing,
   the page keeps whatever text is baked into index.html.
   ============================================================================ */
(function () {
  "use strict";
  const C = window.LIKELYFAD_V3;
  if (!C) return;

  const grad = (s) => String(s == null ? "" : s).replace(/\*([^*]+)\*/g, '<span class="grad">$1</span>');
  const set = (id, val) => { if (val == null) return; const el = document.getElementById(id); if (el) el.innerHTML = grad(val); };
  const link = (id, label, url) => { const el = document.getElementById(id); if (!el) return; if (label != null) el.textContent = label; if (url) el.setAttribute("href", url); };

  link("navCta", C.ctaLabel, C.xUrl);
  link("closeCta", C.ctaLabel, C.xUrl);

  if (C.reveal) {
    set("cueKicker", C.reveal.kicker);
    set("line1", C.reveal.hook);
    set("line2", C.reveal.payoff);
    const sc = document.querySelector("#scrollCue span");
    if (sc && C.reveal.scrollCue != null) sc.textContent = C.reveal.scrollCue;
    if (C.reveal.aiTag != null) document.querySelectorAll(".ai-tag").forEach((t) => { t.innerHTML = "<i></i>" + grad(C.reveal.aiTag); });
  }
  if (C.claim) { set("claimKicker", C.claim.kicker); set("claimHeading", C.claim.heading); set("claimSub", C.claim.sub); }
  if (C.wall) { set("wallKicker", C.wall.kicker); set("wallTitle", C.wall.heading); set("wallSub", C.wall.sub); }
  if (C.finder) { set("finderKicker", C.finder.kicker); set("finderTitle", C.finder.heading); set("workHint", C.finder.hint); set("finderWindowTitle", C.finder.windowTitle); }

  if (C.pipeline) {
    set("pipeKicker", C.pipeline.kicker);
    set("pipeTitle", C.pipeline.heading);
    set("pipeSub", C.pipeline.sub);
    const ol = document.getElementById("pipeSteps");
    if (ol && Array.isArray(C.pipeline.steps) && C.pipeline.steps.length) {
      ol.innerHTML = '<span class="pipe-line" aria-hidden="true"></span>' + C.pipeline.steps.map((s, i) =>
        '<li class="pipe-step"><div class="pipe-node"><span>' + String(i + 1).padStart(2, "0") +
        '</span></div><h3>' + grad(s.title) + '</h3><p>' + grad(s.body) + '</p></li>').join("");
    }
    const st = document.getElementById("pipeStats");
    if (st && Array.isArray(C.pipeline.stats) && C.pipeline.stats.length) {
      st.innerHTML = C.pipeline.stats.map((s) =>
        '<div class="pipe-stat"><b>' + grad(s.value) + '</b><span>' + (s.label || "") + '</span></div>').join("");
    }
  }
  if (C.close) {
    set("closeKicker", C.close.kicker);
    const ct = document.getElementById("closeTitle");
    if (ct) ct.innerHTML = grad(C.close.headingLine1 || "") + "<br>" + grad(C.close.headingLine2 || "");
    set("closeSub", C.close.sub);
    set("closeFoot", C.close.foot);
  }

  // Comparison table (last column = Likelyfad, highlighted). Valid ARIA rowgroups.
  if (C.comparison && Array.isArray(C.comparison.columns) && Array.isArray(C.comparison.rows)) {
    set("cmpKicker", C.comparison.kicker);
    set("cmpTitle", C.comparison.heading);
    const t = document.getElementById("compareTable");
    if (t) {
      const cols = C.comparison.columns, last = cols.length - 1;
      // The first header cell must be a real columnheader (not presentation) so
      // screen readers map values to the right columns (4 cells in every row).
      const head = '<div class="compare-row compare-head" role="row"><span class="compare-label" role="columnheader"><span class="sr-only">Compared on</span></span>' +
        cols.map((c, i) => '<span role="columnheader"' + (i === last ? ' class="compare-win"' : "") + ">" + grad(c) + (i === last ? ' <span class="sr-only">(recommended)</span>' : "") + "</span>").join("") + "</div>";
      const body = C.comparison.rows.map((r) => '<div class="compare-row" role="row">' +
        '<span class="compare-label" role="rowheader">' + grad(r.label) + "</span>" +
        '<span role="cell" data-col="' + cols[0] + '">' + grad(r.ai) + "</span>" +
        '<span role="cell" data-col="' + cols[1] + '">' + grad(r.agency) + "</span>" +
        '<span class="compare-win" role="cell" data-col="' + cols[2] + '"><i class="cw-tick" aria-hidden="true">✓</i><span class="cw-val">' + grad(r.likelyfad) + "</span></span>" +
        "</div>").join("");
      t.innerHTML = '<div role="rowgroup">' + head + '</div><div role="rowgroup">' + body + "</div>";
    }
  }

  // Testimonials
  if (C.testimonials && Array.isArray(C.testimonials.items)) {
    set("testiKicker", C.testimonials.kicker);
    set("testiTitle", C.testimonials.heading);
    const g = document.getElementById("testiGrid");
    if (g) g.innerHTML = C.testimonials.items.map((t) => '<article class="testi"><p>"' + grad(t.quote) + '"</p><div class="who">' + grad(t.who) + "</div></article>").join("");
  }

  // FAQ (accordion)
  if (C.faq && Array.isArray(C.faq.items)) {
    set("faqKicker", C.faq.kicker);
    set("faqTitle", C.faq.heading);
    const l = document.getElementById("faqList");
    if (l) {
      l.innerHTML = C.faq.items.map((f, i) => '<div class="faq-item"><button class="faq-q" aria-expanded="false" aria-controls="faq-a-' + i + '">' + grad(f.q) + '<span class="plus" aria-hidden="true">+</span></button><div class="faq-a" id="faq-a-' + i + '" inert><p>' + grad(f.a) + "</p></div></div>").join("");
      l.querySelectorAll(".faq-q").forEach((btn) => {
        btn.addEventListener("click", () => {
          const item = btn.parentElement, ans = item.querySelector(".faq-a");
          const open = item.classList.toggle("open");
          btn.setAttribute("aria-expanded", open ? "true" : "false");
          // inert keeps collapsed answers out of tab order + the AT tree, while staying in flow so max-height can animate
          if (open) { ans.inert = false; ans.style.maxHeight = ans.scrollHeight + "px"; }
          else { ans.style.maxHeight = "0"; ans.inert = true; }
        });
      });
      window.addEventListener("resize", () => {
        document.querySelectorAll(".faq-item.open .faq-a").forEach((a) => { a.style.maxHeight = a.scrollHeight + "px"; });
      }, { passive: true });
    }
  }

  // Guarantee
  if (C.guarantee && Array.isArray(C.guarantee.items)) {
    set("gteKicker", C.guarantee.kicker);
    set("gteTitle", C.guarantee.heading);
    const g = document.getElementById("gteList");
    if (g) g.innerHTML = C.guarantee.items.map((it) => '<div class="guarantee-item"><span class="check" aria-hidden="true">✓</span><div><h3>' + grad(it.title) + "</h3><p>" + grad(it.body) + "</p></div></div>").join("");
  }
})();


/* ============================================================================
   LIKELYFAD V3 - Scene 0 -> 1 reveal + the rest of the motion.
   ============================================================================ */
(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const vids = Array.prototype.slice.call(document.querySelectorAll(".vid"));
  const aiLayers = document.querySelectorAll(".ai-layer");
  const line2 = document.getElementById("line2");

  // Footage should be "live" (looks like a real shoot). Fades in once it can play.
  // Reduced-motion users get a clean paused first frame instead of looping video
  // (WCAG 2.2.2). hero2/hero3 ship as data-src and only hydrate where shown.
  vids.forEach((v) => {
    v.addEventListener("loadeddata", () => v.classList.add("ready"));
    v.addEventListener("playing", () => v.classList.add("ready"));
    if (reduce) {
      v.removeAttribute("autoplay");
      v.addEventListener("loadeddata", () => v.pause(), { once: true });
    } else if (v.getAttribute("src")) {
      v.play().catch(() => {});
    }
  });

  // Hydrate a lazy hero clip (src lives in data-src until a context needs it).
  function hydrateVid(v, autoplay) {
    if (v.getAttribute("src") || !v.dataset.src) return;
    v.preload = "auto";
    v.src = v.dataset.src;
    if (autoplay && !reduce) v.play().catch(() => {});
  }

  // Fallback: no motion library (either file) or reduced-motion -> show the end
  // state cleanly: scrimmed video with the payoff centered on it (CSS handles
  // the styling via body.reveal-static).
  if (!window.gsap || !window.ScrollTrigger || reduce) {
    document.body.classList.add("reveal-static");
    aiLayers.forEach((l) => (l.style.clipPath = "none"));
    const l1 = document.getElementById("line1"); if (l1) l1.style.display = "none";
    const cue = document.getElementById("cueKicker"); if (cue) cue.style.display = "none";
    document.querySelectorAll(".ai-tag").forEach((t) => (t.style.opacity = "1"));
    if (line2) line2.style.opacity = "1";
    vids.forEach((v) => hydrateVid(v, false));   // show all frames as stills
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Smooth scroll (mouse wheel; native touch on phones)
  if (window.Lenis) {
    const lenis = new Lenis({ lerp: 0.12, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Initial states
  gsap.set("#line1", { opacity: 0, y: 16 });
  gsap.set("#line2", { opacity: 0, y: 18 });
  gsap.set("#cueKicker", { opacity: 0 });
  gsap.set("#scrollCue", { opacity: 0 });
  gsap.set(".ai-tag", { opacity: 0, y: -6 });
  gsap.set(".seam", { top: "0%", autoAlpha: 0 });
  gsap.set(".ai-layer", { clipPath: "inset(0 0 100% 0)" });
  gsap.set(".frame-row", { scale: 1, yPercent: 0 });   // full-bleed at start
  gsap.set(".frame", { borderRadius: 0, autoAlpha: 0, yPercent: 9 });   // hidden, for the entry

  // ENTRY (on load): the clips assemble in, then the hook appears. So it never
  // just pops in blank, it has a deliberate entrance.
  gsap.timeline({ defaults: { ease: "power3.out" } })
    .to(".frame", { autoAlpha: 1, yPercent: 0, duration: 1.1, stagger: 0.14 }, 0.15)
    .to("#cueKicker", { opacity: 0.85, duration: 0.5 }, "-=0.55")
    .to("#line1", { opacity: 1, y: 0, duration: 0.6 }, "-=0.35")
    .to("#scrollCue", { opacity: 1, duration: 0.5 }, "-=0.3");

  // SCROLL timeline. matchMedia builds a different version per screen size (and
  // rebuilds on breakpoint change):
  //   DESKTOP: the 3 clips shrink to free white space, un-render to AI, payoff lands in the space.
  //   MOBILE : the video stays full-bleed and above the fold; the AI treatment un-renders OVER it,
  //            a black scrim builds, and the payoff fades up ON the darkened video (no shrink).
  const stConf = { trigger: "#revealScene", start: "top top", end: "bottom bottom", scrub: true };
  const mm = gsap.matchMedia();

  mm.add("(min-width: 761px)", () => {
    // Desktop shows all three clips: load the two lazy ones now.
    vids.forEach((v) => hydrateVid(v, true));
    gsap.timeline({ scrollTrigger: stConf })
      .to({}, { duration: 0.16 })                                         // hold: full-screen, clear footage
      .addLabel("go")
      .to("#cueKicker", { opacity: 0, duration: 0.05 }, "go")
      .to("#line1", { opacity: 0, y: -12, duration: 0.06 }, "go")
      .to(".frame-row", { scale: 0.6, yPercent: -6, ease: "power2.inOut", duration: 0.4 }, "go")  // shrink to make room
      .to(".frame", { borderRadius: 22, ease: "power2.inOut", duration: 0.4 }, "go")
      .to(".frame-row", { gap: 18, ease: "power2.inOut", duration: 0.4 }, "go")                    // clips separate
      .to(".ai-layer", { clipPath: "inset(0 0 0% 0)", ease: "none", duration: 0.3, stagger: 0.04 }, "go+=0.1")  // un-render
      .to(".seam", { autoAlpha: 1, duration: 0.03 }, "go+=0.1")
      .to(".seam", { top: "100%", ease: "none", duration: 0.3, stagger: 0.04 }, "go+=0.1")
      .to(".seam", { autoAlpha: 0, duration: 0.05 }, "go+=0.36")
      .to(".ai-tag", { opacity: 1, y: 0, duration: 0.06, stagger: 0.04 }, "go+=0.26")
      .to("#line2", { opacity: 1, y: 0, duration: 0.12 }, "go+=0.34")     // payoff in the freed white space
      .to({}, { duration: 0.16 });                                        // hold on the payoff
  });

  // 760.99 (not 760) so fractional viewport widths from browser zoom / display
  // scaling can't fall between the mobile and desktop contexts and get NO timeline.
  mm.add("(max-width: 760.99px)", () => {
    gsap.timeline({ scrollTrigger: stConf })
      .to({}, { duration: 0.16 })                                         // hold: clean full-bleed video
      .addLabel("go")
      .to("#cueKicker", { opacity: 0, duration: 0.05 }, "go")
      .to("#line1", { opacity: 0, y: -12, duration: 0.08 }, "go")         // hook fades out
      .to(".ai-layer", { clipPath: "inset(0 0 0% 0)", ease: "none", duration: 0.34 }, "go+=0.04")  // AI un-renders over the full video
      .to(".seam", { autoAlpha: 1, duration: 0.03 }, "go+=0.04")
      .to(".seam", { top: "100%", ease: "none", duration: 0.34 }, "go+=0.04")
      .to(".ai-tag", { opacity: 1, y: 0, duration: 0.06 }, "go+=0.12")    // proof badge lands before the scrim
      .to(".seam", { autoAlpha: 0, duration: 0.05 }, "go+=0.35")
      .to(".reveal-scrim", { opacity: 0.75, ease: "none", duration: 0.28 }, "go+=0.32")            // black scrim builds
      .to("#line2", { opacity: 1, y: 0, duration: 0.2 }, "go+=0.44")      // payoff fades up ON the darkened video
      .to({}, { duration: 0.18 });                                        // hold on the payoff
  });

  // Hide the scroll cue once the user starts.
  ScrollTrigger.create({
    trigger: "#revealScene", start: "top+=40 top",
    onEnter: () => gsap.to("#scrollCue", { opacity: 0, duration: 0.3 }),
    onLeaveBack: () => gsap.to("#scrollCue", { opacity: 1, duration: 0.3 }),
  });

  /* --------------------------------------------------------------------------
     SCENE 3 - THE WORK (wall). The tiles are built + revealed in a standalone
     block at the bottom of this file (so they work even without GSAP). Here we
     just fade the headline in as the section arrives.
     -------------------------------------------------------------------------- */
  if (document.getElementById("volumeScene")) {
    gsap.from(".volume-head", {
      autoAlpha: 0, y: 24, duration: 0.8, ease: "power3.out",
      scrollTrigger: { trigger: "#volumeScene", start: "top 80%", once: true },
    });
  }

  /* --------------------------------------------------------------------------
     SCENE 5 - PIPELINE. Steps rise in, the connector line draws across them,
     the stats fade up. (No-GSAP/reduced-motion users never reach this code and
     see everything at its normal CSS state.)
     -------------------------------------------------------------------------- */
  if (document.getElementById("pipeline")) {
    gsap.from(".pipe-head", {
      autoAlpha: 0, y: 20, duration: 0.7, ease: "power3.out",
      scrollTrigger: { trigger: "#pipeline", start: "top 72%", once: true },
    });
    gsap.from(".pipe-step", {
      autoAlpha: 0, y: 24, duration: 0.6, stagger: 0.15, ease: "power3.out",
      scrollTrigger: { trigger: ".pipe-steps", start: "top 78%", once: true },
    });
    gsap.to(".pipe-line", {
      scaleX: 1, ease: "none",
      scrollTrigger: { trigger: ".pipe-steps", start: "top 72%", end: "center center", scrub: true },
    });
    gsap.from(".pipe-stat", {
      autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.12, ease: "power3.out",
      scrollTrigger: { trigger: ".pipe-stats", start: "top 82%", once: true },
    });
  }

  /* --------------------------------------------------------------------------
     CONVERSION BLOCKS - comparison / testimonials / FAQ / guarantee rise in as
     each section enters. (Built by the content fill above; if GSAP is absent
     this code never runs and they're just visible.)
     -------------------------------------------------------------------------- */
  [
    ["#compare", ".compare-row:not(.compare-head)"],
    ["#testimonials", ".testi"],
    ["#faq", ".faq-item"],
    ["#guarantee", ".guarantee-item"],
  ].forEach((pair) => {
    const sec = pair[0], item = pair[1];
    if (!document.querySelector(sec)) return;
    gsap.from(sec + " .sec-head", {
      autoAlpha: 0, y: 20, duration: 0.6, ease: "power3.out",
      scrollTrigger: { trigger: sec, start: "top 78%", once: true },
    });
    gsap.from(sec + " " + item, {
      autoAlpha: 0, y: 24, duration: 0.55, stagger: 0.08, ease: "power3.out",
      scrollTrigger: { trigger: sec, start: "top 72%", once: true },
    });
  });

  // The fixed nav swaps to a dark frosted fill while it floats over the two
  // dark bands (wall + finder), instead of a washed light strip.
  if (document.getElementById("volumeScene") && document.getElementById("work")) {
    ScrollTrigger.create({
      trigger: "#volumeScene", start: "top 70px",
      endTrigger: "#work", end: "bottom 70px",
      toggleClass: { targets: "#nav", className: "on-dark" },
    });
  }

  // Refresh trigger positions after the things that shift layout late: web
  // fonts settling and all media loading. Otherwise downstream triggers (the
  // pipeline) keep stale start/end positions and never fire.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh());
  ScrollTrigger.refresh();
})();


/* ============================================================================
   THE WORK - macOS Finder portfolio.
   Self-contained (does NOT depend on GSAP/Lenis) so the work always browses,
   even with reduced motion. Folders + clips come from window.LIKELYFAD_FOLDERS
   (assets/work/folders.js), which build-portfolio.sh generates from the
   "Videos to use" tree. Posters show instantly; the clip loads on hover/click.
   ============================================================================ */
(function () {
  "use strict";
  const FOLDERS = window.LIKELYFAD_FOLDERS || [];
  const desktop = document.getElementById("desktop");
  if (!desktop || !FOLDERS.length) return;

  const $ = (s) => document.querySelector(s);
  const isTouch = window.matchMedia("(hover: none)").matches || window.matchMedia("(pointer: coarse)").matches;
  const overlay = $("#overlay");
  const assetGrid = $("#asset-grid");
  const player = $("#player");
  const playerVideo = $("#player-video");
  let lastFocus = null, lastFocusPlayer = null;

  const CV = window.LIKELYFAD_V3;
  const hint = document.getElementById("workHint");
  if (hint && isTouch) hint.textContent = (CV && CV.finder && CV.finder.hintTouch) || "Tap any folder. Every clip is AI.";

  // When a modal is open, freeze the page (works with or without Lenis) and make
  // the background inert so keyboard/AT users can't wander behind the dialog.
  function setBgInert(on) {
    const main = document.getElementById("main"), nav = document.getElementById("nav");
    if (main) main.inert = on;
    if (nav) nav.inert = on;
  }
  function lockScroll() { if (window.__lenis) window.__lenis.stop(); document.body.style.overflow = "hidden"; setBgInert(true); }
  function unlockScroll() {
    if (overlay.classList.contains("open") || player.classList.contains("open")) return;
    if (window.__lenis) window.__lenis.start();
    document.body.style.overflow = "";
    setBgInert(false);
  }

  /* 1. Folders on the Finder desktop */
  desktop.innerHTML = FOLDERS.map((f, i) => `
    <button class="folder" data-index="${i}" aria-label="Open ${f.name} folder">
      <div class="folder-shape" data-accent="${f.accent || "pink"}">
        <span class="folder-count">${f.videos.length} clip${f.videos.length === 1 ? "" : "s"}</span>
      </div>
      <div class="folder-name">${f.name}</div>
      <div class="folder-sub">${isTouch ? "Tap to open" : "Click to open"}</div>
    </button>`).join("");
  desktop.querySelectorAll(".folder").forEach((el) => {
    const open = () => openFolder(Number(el.dataset.index));
    el.addEventListener("click", open);
    el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });

  /* 2. Folder window (grid of clip cards) */
  function openFolder(index) {
    const folder = FOLDERS[index];
    if (!folder) return;
    const n = folder.videos.length;
    $("#window-title").innerHTML = folder.name + " <small>" + n + " clip" + (n === 1 ? "" : "s") + "</small>";

    assetGrid.innerHTML = folder.videos.map((v, vi) => `
      <article class="asset" role="button" tabindex="0" data-folder="${index}" data-video="${vi}" aria-label="Play ${v.title}">
        <div class="asset-thumb" style="background-image:url(${v.poster || ""})">
          <video muted loop playsinline preload="none"></video>
          <div class="asset-play"><span></span></div>
        </div>
        <div class="asset-meta"><b>${v.title}</b><small>${v.duration || ""}</small></div>
      </article>`).join("");

    assetGrid.querySelectorAll(".asset").forEach((card) => {
      const vid = card.querySelector("video");
      const data = FOLDERS[Number(card.dataset.folder)].videos[Number(card.dataset.video)];
      card.addEventListener("mouseenter", () => {
        if (!vid.src) vid.src = data.src;     // load the clip only on hover
        vid.currentTime = 0;
        vid.play().then(() => vid.classList.add("playing")).catch(() => {});
      });
      card.addEventListener("mouseleave", () => { vid.pause(); vid.classList.remove("playing"); });
      const play = () => openPlayer(data);
      card.addEventListener("click", play);
      card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); play(); } });
    });

    // Capture focus BEFORE lockScroll: inerting #main blurs the focused folder
    // button, so grabbing activeElement after would capture <body> and focus
    // would never return to the folder on close (WCAG 2.4.3).
    lastFocus = document.activeElement;
    overlay.classList.add("open");
    lockScroll();
    // Focus next frame: in this tick the overlay's visibility transition hasn't
    // started, so it's not focusable yet and .focus() would silently no-op.
    requestAnimationFrame(() => $("#window-close").focus());
  }
  function closeFolder() {
    overlay.classList.remove("open");
    assetGrid.querySelectorAll("video").forEach((v) => v.pause());
    unlockScroll();
    if (lastFocus) { lastFocus.focus(); lastFocus = null; }
  }
  $("#window-close").addEventListener("click", closeFolder);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeFolder(); });

  /* 3. Fullscreen player (sound + controls) */
  function openPlayer(v) {
    if (!v) return;
    lastFocusPlayer = document.activeElement;   // capture before any inert/blur
    playerVideo.src = v.src;
    player.setAttribute("aria-label", "Playing " + v.title);
    player.classList.add("open");
    assetGrid.querySelectorAll("video").forEach((vid) => vid.pause());
    overlay.setAttribute("aria-hidden", "true");
    lockScroll();
    requestAnimationFrame(() => $("#player-close").focus());
    playerVideo.play().catch(() => {});
  }
  function closePlayer() {
    player.classList.remove("open");
    player.setAttribute("aria-label", "Video player");
    overlay.removeAttribute("aria-hidden");
    playerVideo.pause();
    playerVideo.removeAttribute("src");
    playerVideo.load();
    unlockScroll();
    if (lastFocusPlayer) { lastFocusPlayer.focus(); lastFocusPlayer = null; }
  }
  $("#player-close").addEventListener("click", closePlayer);
  player.addEventListener("click", (e) => { if (e.target === player) closePlayer(); });

  /* 4. Escape closes; keep Tab inside the open dialog */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (player.classList.contains("open")) closePlayer();
    else if (overlay.classList.contains("open")) closeFolder();
  });
  function trapTab(dialog) {
    dialog.addEventListener("keydown", (e) => {
      if (e.key !== "Tab" || !dialog.classList.contains("open")) return;
      const f = dialog.querySelectorAll('button, [href], video[controls], [tabindex]:not([tabindex="-1"])');
      const list = Array.prototype.filter.call(f, (el) => el.offsetParent !== null);
      if (!list.length) return;
      const first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
  trapTab(overlay);
  trapTab(player);

  // Building the folders changed the page height, so any ScrollTrigger anims
  // below the Finder (the pipeline) had stale positions. Recompute them.
  if (window.ScrollTrigger) window.ScrollTrigger.refresh();
})();


/* ============================================================================
   THE WALL - "Every one of these is AI." A cinematic auto-scrolling reel: the
   clips (assets/wall/manifest.js) are split across 3 rows that glide in
   alternating directions. CSS does the scrolling; this just builds the rows
   (each set doubled for a seamless loop). Self-contained, no GSAP needed.
   ============================================================================ */
(function () {
  "use strict";
  const reel = document.getElementById("reel");
  const wall = window.LIKELYFAD_WALL || [];
  if (!reel || !wall.length) return;

  const ROWS = 3;
  const rows = Array.from({ length: ROWS }, () => []);
  wall.forEach((it, i) => rows[i % ROWS].push(it));   // interleave for variety per row

  const tile = (it) => '<div class="reel-tile" style="background-image:url(' + it.src + ')"></div>';
  function build() {
    reel.innerHTML = rows.map((items, r) => {
      const set = items.map(tile).join("");
      const dir = r % 2 === 0 ? "right" : "left";
      return '<div class="reel-row" data-dir="' + dir + '"><div class="reel-track">' + set + set + "</div></div>";
    }).join("");
  }
  // Lazy-build so the ~33 wall stills don't compete with the hero on first load.
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, obs) => {
      if (entries.some((e) => e.isIntersecting)) {
        build();
        // The tiles just added ~700px of page height. Without a refresh every
        // ScrollTrigger below the wall keeps stale positions and fires off-screen.
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        obs.disconnect();
      }
    }, { rootMargin: "900px 0px" });
    io.observe(reel);
  } else {
    build();
  }
})();
