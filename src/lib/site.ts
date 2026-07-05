/* ============================================================================
   Site constants + the one real outbound action: the X (Twitter) profile.
   Every other link in the UI is a clearly-marked placeholder.
   ========================================================================== */

export const SITE_URL = "https://likelyfad.example.com"; // PLACEHOLDER — set real domain
export const SITE_NAME = "Likelyfad";
export const SITE_TAGLINE = "AI content real enough to run";
export const SITE_DESCRIPTION =
  "Likelyfad is an AI production studio making photoreal video, UGC and ads that look shot on a real set — fast enough to test and clean enough to run straight into paid.";

/* Contact CTA → opens the X (Twitter) profile in a new tab. */
export const X_HANDLE = "amanxdesign";

export function contactUrl(): string {
  return `https://x.com/${X_HANDLE}`;
}
