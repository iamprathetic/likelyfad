/* ============================================================================
   LIKELYFAD V4 - app.js
   Fills the page from content.js, builds the hero wall / why cards / clips /
   pricing / testimonials / FAQ, and runs the light motion (fade-ins, wall
   drift is pure CSS). No libraries. You should not need to edit this file:
   words live in content.js.
   ============================================================================ */
(function () {
  "use strict";
  const C = window.LIKELYFAD_V4;
  if (!C) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s) => document.querySelector(s);

  /* *stars* -> gradient span */
  const grad = (s) => String(s == null ? "" : s).replace(/\*([^*]+)\*/g, '<span class="grad">$1</span>');
  const set = (id, val) => { if (val == null) return; const el = document.getElementById(id); if (el) el.innerHTML = grad(val); };
  const link = (id, label, url) => { const el = document.getElementById(id); if (!el) return; if (label != null) el.textContent = label; if (url) el.setAttribute("href", url); };

  /* ------------------------------ CONTENT FILL ------------------------------ */
  ["navCta", "heroCta", "closeCta", "faqCta"].forEach((id) => link(id, C.ctaLabel, C.xUrl));
  if (C.pricing) link("priceCta", C.pricing.ctaLabel, C.xUrl);
  const fx = document.getElementById("footerX"); if (fx && C.xUrl) fx.setAttribute("href", C.xUrl);

  if (C.hero) {
    set("heroKicker", C.hero.kicker);
    set("heroTitle", C.hero.headline);
    set("heroSub", C.hero.sub);
    set("heroTrust", C.hero.microTrust);
    set("wallCaption", C.hero.wallCaption);
    const sec = document.getElementById("heroSecondary");
    if (sec && C.hero.secondaryCta != null) sec.textContent = C.hero.secondaryCta;
  }

  /* Hero wall: split the stills across 3 columns; each column's stack is
     doubled so the CSS drift loops seamlessly. */
  const cols = document.getElementById("wallCols");
  if (cols && Array.isArray(C.wall) && C.wall.length) {
    const buckets = [[], [], []];
    C.wall.forEach((src, i) => buckets[i % 3].push(src));
    cols.innerHTML = buckets.map((b) => {
      const tiles = b.map((src) => '<div class="wall-tile" style="background-image:url(' + src + ')"></div>').join("");
      return '<div class="wall-col">' + tiles + tiles + "</div>";
    }).join("");
  }

  if (C.why) {
    set("whyKicker", C.why.kicker);
    set("whyHeading", C.why.heading);
    set("whySub", C.why.sub);
    set("whyStatement", C.why.statement);
    const g = document.getElementById("whyGrid");
    if (g && Array.isArray(C.why.cards)) {
      g.innerHTML = C.why.cards.map((c, i) =>
        '<article class="why-card io-fade"><div class="num">' + String(i + 1).padStart(2, "0") + "</div><h3>" + grad(c.title) + "</h3><p>" + grad(c.body) + "</p></article>").join("");
    }
  }

  if (C.work) {
    set("workKicker", C.work.kicker);
    set("workHeading", C.work.heading);
    set("workHint", C.work.hint);
    const g = document.getElementById("clipsGrid");
    if (g && Array.isArray(C.work.clips)) {
      g.innerHTML = C.work.clips.map((v, i) =>
        '<button class="clip io-fade" data-i="' + i + '" style="background-image:url(' + (v.poster || "") + ')" aria-label="Play ' + (v.title || "clip") + '">' +
        '<video muted loop playsinline preload="none"></video>' +
        '<span class="play" aria-hidden="true"><span></span></span>' +
        '<span class="clip-title">' + (v.title || "") + "</span></button>").join("");
    }
  }

  if (C.pricing) {
    set("priceKicker", C.pricing.kicker);
    set("priceHeading", C.pricing.heading);
    set("priceBlurb", C.pricing.blurb);
    set("priceNote", C.pricing.note);
    const ul = document.getElementById("priceChecks");
    if (ul && Array.isArray(C.pricing.checks)) {
      ul.innerHTML = C.pricing.checks.map((c) => '<li><span class="tick" aria-hidden="true">✓</span>' + grad(c) + "</li>").join("");
    }
  }

  if (C.testimonials) {
    set("testiKicker", C.testimonials.kicker);
    set("testiHeading", C.testimonials.heading);
    const g = document.getElementById("testiGrid");
    if (g && Array.isArray(C.testimonials.items)) {
      g.innerHTML = C.testimonials.items.map((t) =>
        '<article class="testi-card io-fade"><p>"' + grad(t.quote) + '"</p><div class="who">' + grad(t.who) + "</div></article>").join("");
    }
  }

  if (C.faq) {
    set("faqKicker", C.faq.kicker);
    set("faqHeading", C.faq.heading);
    const l = document.getElementById("faqList");
    if (l && Array.isArray(C.faq.items)) {
      l.innerHTML = C.faq.items.map((f, i) =>
        '<div class="faq-item"><button class="faq-q" aria-expanded="false" aria-controls="faq-a-' + i + '">' + grad(f.q) +
        '<span class="plus" aria-hidden="true">+</span></button><div class="faq-a" id="faq-a-' + i + '" inert><p>' + grad(f.a) + "</p></div></div>").join("");
      l.querySelectorAll(".faq-q").forEach((btn) => {
        btn.addEventListener("click", () => {
          const item = btn.parentElement, ans = item.querySelector(".faq-a");
          const open = item.classList.toggle("open");
          btn.setAttribute("aria-expanded", open ? "true" : "false");
          if (open) { ans.inert = false; ans.style.maxHeight = ans.scrollHeight + "px"; }
          else { ans.style.maxHeight = "0"; ans.inert = true; }
        });
      });
      window.addEventListener("resize", () => {
        document.querySelectorAll(".faq-item.open .faq-a").forEach((a) => { a.style.maxHeight = a.scrollHeight + "px"; });
      }, { passive: true });
    }
  }

  if (C.close) { set("closeHeading", C.close.heading); set("closeSub", C.close.sub); }
  if (C.footer) {
    set("footerTagline", C.footer.tagline);
    const legal = document.getElementById("footerLegal");
    if (legal) legal.textContent = "© " + (C.footer.year || "2026") + " " + (C.footer.legal || "Likelyfad.");
  }

  /* ------------------------- WORK CLIPS: preview + player ------------------------- */
  const player = $("#player");
  const playerVideo = $("#player-video");
  let lastFocus = null;

  function openPlayer(clip) {
    if (!clip) return;
    lastFocus = document.activeElement;          // capture BEFORE anything moves focus
    playerVideo.src = clip.src;
    player.setAttribute("aria-label", "Playing " + (clip.title || "clip"));
    player.classList.add("open");
    document.body.style.overflow = "hidden";
    const main = document.getElementById("main"), nav = document.getElementById("nav");
    if (main) main.inert = true; if (nav) nav.inert = true;
    requestAnimationFrame(() => $("#player-close").focus());
    playerVideo.play().catch(() => {});
  }
  function closePlayer() {
    player.classList.remove("open");
    playerVideo.pause();
    playerVideo.removeAttribute("src");
    playerVideo.load();
    document.body.style.overflow = "";
    const main = document.getElementById("main"), nav = document.getElementById("nav");
    if (main) main.inert = false; if (nav) nav.inert = false;
    if (lastFocus) { lastFocus.focus(); lastFocus = null; }
  }
  if (player) {
    $("#player-close").addEventListener("click", closePlayer);
    player.addEventListener("click", (e) => { if (e.target === player) closePlayer(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && player.classList.contains("open")) closePlayer(); });
  }

  document.querySelectorAll(".clip").forEach((card) => {
    const data = C.work && C.work.clips ? C.work.clips[Number(card.dataset.i)] : null;
    const vid = card.querySelector("video");
    if (!data) return;
    card.addEventListener("mouseenter", () => {
      if (reduce) return;
      if (!vid.src) { vid.preload = "auto"; vid.src = data.src; }
      vid.currentTime = 0;
      vid.play().then(() => vid.classList.add("playing")).catch(() => {});
    });
    card.addEventListener("mouseleave", () => { vid.pause(); vid.classList.remove("playing"); });
    card.addEventListener("click", () => openPlayer(data));
  });

  /* ------------------------------ SCROLL FADES ------------------------------ */
  if ("IntersectionObserver" in window && !reduce) {
    document.documentElement.classList.add("io-ready");   // only hide once JS is confirmed running
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".io-fade").forEach((el) => io.observe(el));
  }
})();
