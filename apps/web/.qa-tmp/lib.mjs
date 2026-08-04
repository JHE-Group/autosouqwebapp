import { chromium } from "playwright-core";

export const BASE = "http://localhost:3050";
export const CMS = "http://localhost:1337";

const POP = [
  "populate[gallery]=true",
  "populate[make]=true",
  "populate[model]=true",
  "populate[bodyType]=true",
  "populate[condition]=true",
  "populate[transmission]=true",
  "populate[fuelType]=true",
  "populate[color]=true",
  "populate[city]=true",
  "populate[features]=true",
].join("&");

const lab = (rel, locale) =>
  rel ? (locale === "ar" ? rel.nameAr || rel.name : rel.name || rel.nameAr) : null;

export async function cmsCars(locale = "ar") {
  const res = await fetch(
    `${CMS}/api/listings?${POP}&sort=createdAt:desc&pagination[pageSize]=100`,
  );
  const json = await res.json();
  return (json.data ?? []).map((l) => ({
    raw: l,
    id: l.slug,
    slug: l.slug,
    price: Number(l.price) || 0,
    year: l.year,
    km: l.mileage,
    make: lab(l.make, locale),
    model: lab(l.model, locale),
    body: lab(l.bodyType, locale),
    fuelType: lab(l.fuelType, locale),
    transmission: lab(l.transmission, locale),
    color: lab(l.color, locale),
    location: lab(l.city, locale),
    citySlug: l.city?.slug ?? null,
    features: (l.features ?? []).map((f) => lab(f, locale)).filter(Boolean),
    door: l.doors ?? null,
    cylinder: l.cylinders ?? null,
    importOrigin: l.importOrigin || null,
    soldAsIs: Boolean(l.soldAsIs),
    verified: Boolean(l.verified),
    whatsapp: l.whatsapp || null,
    phone: l.phone || null,
    listingStatus: l.listingStatus || "available",
    currency: l.currency || "OMR",
  }));
}

const slugPart = (v) =>
  String(v ?? "")
    .trim()
    .replace(/[’'"]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

export function listingSlug(car) {
  const base = slugPart(car.slug);
  const city = car.citySlug ? slugPart(car.citySlug) : "";
  if (city && base !== city && !base.endsWith(`-${city}`)) return `${base}-${city}`;
  return base;
}

export async function browser() {
  return chromium.launch({ channel: "chrome", headless: true });
}

/** Rendered listing slugs on a browse page, in DOM order. */
export async function renderedSlugs(page) {
  return page.$$eval("article.asq-card .asq-card__title a", (as) =>
    as.map((a) => a.getAttribute("href").split("/car/")[1]),
  );
}

export async function chipTexts(page) {
  return page.$$eval('button[aria-label^="إزالة الفلتر"], button[aria-label^="Remove"]', (bs) =>
    bs.map((b) => b.parentElement.textContent.replace(/×\s*$/, "").trim()),
  );
}

/** Choose an option in the DropdownSelect named `name`. */
export async function pick(page, name, optionText, nth = 0) {
  const combo = page.locator(`div.nice-select[aria-label="${name}"]`).nth(nth);
  await combo.click();
  const opt = combo.locator("li[role=option]", { hasText: optionText });
  await opt.filter({ hasText: new RegExp(`^${escapeRe(optionText)}$`) }).first().click();
  await page.waitForTimeout(250);
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function optionsOf(page, name, nth = 0) {
  return page
    .locator(`div.nice-select[aria-label="${name}"]`)
    .nth(nth)
    .locator("li[role=option]")
    .allTextContents();
}

export const eq = (a, b) =>
  a.length === b.length && [...a].sort().join("|") === [...b].sort().join("|");
