import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Cormorant_Garamond, JetBrains_Mono, Lato } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});
/* Big headings only — see --font-serif in globals.css. Cormorant is a display
   face: its hairlines thin out badly below ~24px, so it is deliberately NOT
   wired to the small display-font uses (nav brand, footer mark, FAQ questions).
   400 is for the light editorial setting, 600 where a heading needs weight. */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  // Variable (wght 300-700) — one file for every weight the headings use,
  // rather than four static cuts.
  variable: "--font-cormorant",
  display: "swap",
});
/* Body copy. Lato ships only 100/300/400/700/900 — there is no 500 or 600 and
   no variable axis — so the stylesheet sticks to 400 and 700 rather than
   asking for weights that would silently resolve to one of them anyway. */
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "AI production studio",
    "AI ads",
    "photoreal AI video",
    "AI UGC",
    "performance creative",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${SITE_NAME} — ${SITE_TAGLINE}` }], // PLACEHOLDER
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: ["/og.png"], // PLACEHOLDER
    creator: "@amanxdesign",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#fffdfe",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  slogan: SITE_TAGLINE,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${cormorant.variable} ${lato.variable} ${jetbrains.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
