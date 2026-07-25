// Served at /manifest.webmanifest; Next injects the <link rel="manifest"> tag.
// Icons live under public/ rather than app/ so their URLs stay stable.
export default function manifest() {
  return {
    name: "Autosouq.om — Affordable used cars in Oman",
    short_name: "Autosouq",
    description:
      "Oman's marketplace for affordable used cars, OMR 1,500–6,000. Real prices, verified listings, GCC-spec or US-import shown honestly, and one WhatsApp tap to reach the seller.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F1E4C5",
    theme_color: "#262262",
    icons: [
      {
        src: "/assets/images/brand/pwa-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/assets/images/brand/pwa-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        // Full-bleed square — the launcher applies its own mask.
        src: "/assets/images/brand/pwa-icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
