import { createRequire } from "node:module";
const require = createRequire("/Users/joshheywood/Autosouq.om/package.json");
const sharp = require("sharp");

const SRC = "hero-4k-a.png";
const W = 5504, H = 3072;

// The generated number plate reads "OMAKI" with garbled Arabic — a visible
// fabrication artifact. Blur it out: classified sites blur plates for privacy
// anyway, so this reads as correct rather than as a cover-up.
const PLATE = { left: 4240, top: 2235, width: 480, height: 165 };

// PASS 1 — blur the plate on the full-size frame.
// sharp fixes its pipeline order (extract -> resize -> composite), so doing the
// composite and the crop in one chain silently applies the overlay to the
// already-cropped image. Two passes keeps the coordinates honest.
const plate = await sharp(SRC).extract(PLATE).blur(22).toBuffer();
await sharp(SRC)
  .composite([{ input: plate, left: PLATE.left, top: PLATE.top }])
  .png()
  .toFile("hero-blurred.png");
console.log("pass 1: plate blurred at", JSON.stringify(PLATE));

// PASS 2 — 5504x3072 is 16:9; the hero slot is 2:1. Trim 320px of height,
// most of it off the top (sky), so the car and road stay intact.
const CROP = { left: 0, top: 240, width: W, height: 2752 };

// The headline renders in white (`text-color-1`) over the left of the frame and
// _slider.scss has no scrim, so white lands on sunlit sandstone at 4.02:1 —
// large-text only, and the smaller spec text under it fails outright. Bake a
// left-to-right wash in brand indigo so the type has a guaranteed ground.
const SCRIM = Buffer.from(
  `<svg width="${CROP.width}" height="${CROP.height}" xmlns="http://www.w3.org/2000/svg">
     <defs>
       <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
         <stop offset="0"    stop-color="#141230" stop-opacity="0.86"/>
         <stop offset="0.30" stop-color="#141230" stop-opacity="0.62"/>
         <stop offset="0.55" stop-color="#141230" stop-opacity="0.24"/>
         <stop offset="0.78" stop-color="#141230" stop-opacity="0"/>
       </linearGradient>
     </defs>
     <rect width="100%" height="100%" fill="url(#g)"/>
   </svg>`
);

// Ship at 2560 wide, not 3840: next.config.mjs sets images.unoptimized = true,
// so whatever we ship is exactly what a metered-data user downloads.
// Crop first, then scrim — again in two passes, for the pipeline-order reason
// above: a composite chained after extract would be applied to the wrong frame.
await sharp("hero-blurred.png").extract(CROP).png().toFile("hero-cropped.png");
await sharp("hero-cropped.png")
  .composite([{ input: SCRIM, left: 0, top: 0 }])
  .png()
  .toFile("hero-scrimmed.png");
console.log("pass 2: cropped to 2:1 and scrimmed");

for (const [name, width] of [["hero-1", 2560], ["hero-1@sm", 1280]]) {
  const info = await sharp("hero-scrimmed.png")
    .resize(width, Math.round(width / 2))
    .jpeg({ quality: 72, mozjpeg: true, chromaSubsampling: "4:2:0" })
    .toFile(`${name}.jpg`);
  console.log(`pass 3: ${name}.jpg  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}

// Verification crop around where the plate ends up in the 2560px output.
await sharp("hero-1.jpg")
  .extract({ left: 1900, top: 880, width: 420, height: 180 })
  .resize(840)
  .toFile("plate-check.png");
console.log("wrote plate-check.png");
