/**
 * Generate every Autosouq brand lockup from five geometry templates.
 *
 * The path data is identical across colourways, so each lockup is stored once
 * with `__TEXT__` / `__MARK__` tokens and expanded here. Add a colourway to the
 * tables below rather than hand-editing the generated SVGs.
 *
 *   node design/brand/generate.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "templates");
const OUT = join(HERE, "../../apps/web/public/assets/images/brand");
mkdirSync(OUT, { recursive: true });

// Brand palette, read straight off the supplied artwork.
const C = {
  terracotta: "#E97451",
  indigo: "#262262",
  cream: "#F1E4C5",
  ink: "#231F20",
  white: "#FFFFFF",
};

// [suffix, textColour, markColour]
const LOCKUPS = [
  ["primary", C.indigo, C.terracotta],
  ["ink-terracotta", C.ink, C.terracotta],
  ["terracotta", C.terracotta, C.terracotta],
  ["indigo", C.indigo, C.indigo],
  ["cream-terracotta", C.cream, C.terracotta],
  ["indigo-cream", C.indigo, C.cream],
  ["ink-cream", C.ink, C.cream],
  ["white", C.white, C.white],
  ["ink", C.ink, C.ink],
];

const ICONS = [
  ["terracotta", C.terracotta],
  ["indigo", C.indigo],
  ["cream", C.cream],
  ["ink", C.ink],
  ["white", C.white],
];

const GEOMETRIES = ["horizontal", "horizontal-om", "vertical", "vertical-om"];

// Illustrator wraps `d` attributes over many lines; collapse to keep files small.
function tidy(svg) {
  return svg.replace(/\s*\n\s*/g, " ").replace(/> </g, ">\n  <").trim() + "\n";
}

let n = 0;
for (const geo of GEOMETRIES) {
  const tpl = readFileSync(join(SRC, `${geo}.svg`), "utf8");
  for (const [name, text, mark] of LOCKUPS) {
    const svg = tpl.replaceAll("__TEXT__", text).replaceAll("__MARK__", mark);
    writeFileSync(join(OUT, `logo-${geo}-${name}.svg`), tidy(svg));
    n++;
  }
}

const iconTpl = readFileSync(join(SRC, "icon.svg"), "utf8");
for (const [name, mark] of ICONS) {
  writeFileSync(join(OUT, `icon-${name}.svg`), tidy(iconTpl.replaceAll("__MARK__", mark)));
  n++;
}

console.log(`wrote ${n} SVGs to ${OUT}`);
