# Likelyfad — landing page

A simple, conversion-first single-page site for the Likelyfad AI production studio.
Pink + white, premium but restrained. The whole page builds one thing — the reason
to believe — and funnels to a single action: contacting on X.

## Stack
Next.js 15 · React 19 · TypeScript · Tailwind v4 · GSAP + ScrollTrigger · Lenis · Framer Motion

## Run
```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Page order
1. **Hero** — headline + Contact CTA
2. **3D reel wall** — horizontal, auto-scrolling perspective video band (placeholder clips)
3. **Why us** — the value-proposition spine (6 reason-to-believe pillars + claim + CTA)
4. **Pricing** — no numbers; "find out by contacting us" + CTA
5. **Testimonials** — dummy quotes (swap later)
6. **FAQ** — accordion
7. **Footer** — final CTA, links, legal

## The Contact CTA
Every "Contact us" button opens an **X (Twitter) DM compose** window with a pre-typed
message (it does not send). Configured in `src/lib/site.ts`:
- `X_USER_ID = "1781216205363175424"` (@amanxdesign)
- `X_DM_MESSAGE` — the pre-typed text

## What to replace later (all marked)
| Item | Where |
|---|---|
| **Real work videos** | drop clips into `public/videos/` replacing `reel-01…08.mp4` (portrait 9:16). Currently pink placeholder gradients. |
| **Logo** | add a wordmark; currently the text "Likelyfad" |
| **Testimonials** | `src/lib/content.ts` → `testimonials` (marked DUMMY) |
| **Domain / OG image** | `src/lib/site.ts` (`SITE_URL`) + add `public/og.png` |
| **Instagram / Email / legal links** | `src/lib/content.ts` (all `href: "#"` are placeholders) |

## Notes
- Fully responsive; the reel wall becomes a manual horizontal scroll and all motion
  is disabled under `prefers-reduced-motion`.
- Only real outbound link is the X DM CTA and the X profile in the footer; everything
  else is a clearly-marked placeholder.
