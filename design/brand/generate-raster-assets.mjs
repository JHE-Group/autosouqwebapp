/**
 * Rasterise the Autosouq brand mark into the browser-chrome and social-preview
 * assets that SVG cannot cover: favicon/ICO, apple-touch-icon, PWA icons, and the
 * Open Graph card (WhatsApp and friends will not render an SVG in a link preview).
 *
 * Companion to generate.mjs, which builds the vector lockups this consumes.
 * Uses `sharp` (hoisted transitive Next.js dep) for SVG rasterising.
 *
 *   node design/brand/generate-raster-assets.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const require = createRequire(path.join(ROOT, "package.json"));
const sharp = require("sharp");

const WEB = path.join(ROOT, "apps/web");
const BRAND = path.join(WEB, "public/assets/images/brand");
const APP = path.join(WEB, "app");
const OUT_PUBLIC = path.join(BRAND);

const INDIGO = "#262262";
const TERRACOTTA = "#E97451";
const CREAM = "#F1E4C5";

// ---------------------------------------------------------------- mark path
const markSvg = fs.readFileSync(path.join(BRAND, "icon-terracotta.svg"), "utf8");
const d = markSvg.match(/ d="([^"]+)"/)[1];
if (!d || d.length < 500) throw new Error("could not extract mark path");

const VB = 566.9;
const C = VB / 2;

// The mark's own bbox spans ~77% of its viewBox. 0.94 lands it at ~72.5% of the
// tile, which keeps it inside both the iOS mask and the PWA maskable safe zone.
function tile({ radius, scale = 0.94, bg = INDIGO, fg = TERRACOTTA }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB} ${VB}" width="${VB}" height="${VB}" role="img" aria-label="Autosouq.om">
  <rect width="${VB}" height="${VB}" rx="${radius}" ry="${radius}" fill="${bg}"/>
  <g transform="translate(${C},${C}) scale(${scale}) translate(${-C},${-C})">
    <path fill="${fg}" d="${d}"/>
  </g>
</svg>
`;
}

const roundedSvg = tile({ radius: 124 }); // browser tab / PWA "any"
const squareSvg = tile({ radius: 0 }); // apple-icon + maskable (host masks it)

const png = (svg, size) =>
  sharp(Buffer.from(svg), { density: 600 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

// ------------------------------------------------------------------ ico
// 32-bit BGRA DIB entries (not embedded PNG) so pre-Vista-era and old Android
// WebView icon parsers can read it too.
async function ico(svg, sizes) {
  const imgs = [];
  for (const size of sizes) {
    const { data } = await sharp(Buffer.from(svg), { density: 600 })
      .resize(size, size)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const xor = Buffer.alloc(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const s = (y * size + x) * 4;
        const dst = ((size - 1 - y) * size + x) * 4; // DIBs are bottom-up
        xor[dst] = data[s + 2]; // B
        xor[dst + 1] = data[s + 1]; // G
        xor[dst + 2] = data[s]; // R
        xor[dst + 3] = data[s + 3]; // A
      }
    }
    const maskRow = Math.ceil(size / 32) * 4;
    const and = Buffer.alloc(maskRow * size); // fully opaque -> all zero

    const hdr = Buffer.alloc(40);
    hdr.writeUInt32LE(40, 0);
    hdr.writeInt32LE(size, 4);
    hdr.writeInt32LE(size * 2, 8); // XOR + AND stacked
    hdr.writeUInt16LE(1, 12);
    hdr.writeUInt16LE(32, 14);
    hdr.writeUInt32LE(0, 16);
    hdr.writeUInt32LE(xor.length + and.length, 20);

    imgs.push({ size, buf: Buffer.concat([hdr, xor, and]) });
  }

  const dir = Buffer.alloc(6);
  dir.writeUInt16LE(0, 0);
  dir.writeUInt16LE(1, 2);
  dir.writeUInt16LE(imgs.length, 4);

  let offset = 6 + imgs.length * 16;
  const entries = imgs.map(({ size, buf }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size === 256 ? 0 : size, 0);
    e.writeUInt8(size === 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(buf.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += buf.length;
    return e;
  });

  return Buffer.concat([dir, ...entries, ...imgs.map((i) => i.buf)]);
}

// --------------------------------------------------------------- og image
const AR_HEAD = "سيارات مستعملة بأسعار معقولة في عُمان";
const AR_SANS = "Geeza Pro, Al Bayan, Baghdad, Arial";
const LAT_SANS = "Helvetica Neue, Helvetica, Arial, sans-serif";

async function openGraph() {
  const W = 1200;
  const H = 630;

  const logo = await sharp(
    fs.readFileSync(path.join(BRAND, "logo-horizontal-om-primary.svg")),
    { density: 600 }
  )
    .resize({ width: 600 })
    .png()
    .toBuffer();
  const logoMeta = await sharp(logo).metadata();

  const text = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${CREAM}"/>
  <rect x="0" y="${H - 14}" width="${W}" height="14" fill="${TERRACOTTA}"/>
  <text x="${W / 2}" y="408" text-anchor="middle" font-family="${AR_SANS}" font-size="54" fill="${INDIGO}">${AR_HEAD}</text>
  <text x="${W / 2}" y="492" text-anchor="middle" font-family="${LAT_SANS}" font-weight="700" font-size="44" fill="${INDIGO}">Affordable used cars in Oman</text>
  <text x="${W / 2}" y="556" text-anchor="middle" font-family="${LAT_SANS}" font-weight="600" font-size="30" letter-spacing="0.5" fill="${TERRACOTTA}">OMR 1,500 – 6,000 &#160;·&#160; Verified listings &#160;·&#160; One WhatsApp tap</text>
</svg>`;

  // Render the type at 4x and downsample -- librsvg's own AA at 1200px is
  // coarse on the Arabic. Must be resized to the final canvas BEFORE the logo
  // is composited, or the logo lands at 1/4 scale in the corner.
  const base = await sharp(Buffer.from(text), { density: 96 * 4 })
    .resize(W, H)
    .png()
    .toBuffer();

  return sharp(base)
    .composite([
      {
        input: logo,
        top: 110,
        left: Math.round((W - logoMeta.width) / 2),
      },
    ])
    .png({ compressionLevel: 9, palette: true, quality: 100 })
    .toBuffer();
}

// ------------------------------------------------------------------ write
const writes = [];
const put = (p, buf) => {
  fs.writeFileSync(p, buf);
  writes.push([p, buf.length]);
};

put(path.join(APP, "icon.svg"), Buffer.from(roundedSvg));
put(path.join(APP, "icon.png"), await png(roundedSvg, 512));
put(path.join(APP, "apple-icon.png"), await png(squareSvg, 180));
put(path.join(APP, "favicon.ico"), await ico(roundedSvg, [16, 32, 48]));

const og = await openGraph();
put(path.join(APP, "opengraph-image.png"), og);
put(path.join(APP, "twitter-image.png"), og);

put(path.join(OUT_PUBLIC, "pwa-icon-192.png"), await png(roundedSvg, 192));
put(path.join(OUT_PUBLIC, "pwa-icon-512.png"), await png(roundedSvg, 512));
put(path.join(OUT_PUBLIC, "pwa-icon-maskable-512.png"), await png(squareSvg, 512));

for (const [p, n] of writes) console.log(String(n).padStart(8), p);
