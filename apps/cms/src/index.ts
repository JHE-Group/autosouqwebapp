/**
 * Seed language rule: `title`/`description` hold ENGLISH, `titleAr`/`descriptionAr`
 * hold ARABIC. The first seed put Arabic in the base fields and left the *Ar ones
 * null, so `pick("en", …)` in apps/web/lib/strapi.js fell back to Arabic and every
 * English page rendered Arabic headings, <title> tags and WhatsApp messages.
 */
import type { Core } from "@strapi/strapi";

const PUBLIC_ACTIONS = [
  "api::listing.listing.find",
  "api::listing.listing.findOne",
  "api::city.city.find",
  "api::city.city.findOne",
  "api::make.make.find",
  "api::make.make.findOne",
  "api::model.model.find",
  "api::model.model.findOne",
  "api::body-type.body-type.find",
  "api::condition.condition.find",
  "api::transmission.transmission.find",
  "api::fuel-type.fuel-type.find",
  "api::car-color.car-color.find",
  "api::feature.feature.find",
] as const;

async function enablePublicPermissions(strapi: Core.Strapi) {
  const role = await strapi.db.query("plugin::users-permissions.role").findOne({
    where: { type: "public" },
  });

  if (!role) return;

  for (const action of PUBLIC_ACTIONS) {
    const existing = await strapi.db
      .query("plugin::users-permissions.permission")
      .findOne({
        where: { action, role: role.id },
      });

    if (!existing) {
      await strapi.db.query("plugin::users-permissions.permission").create({
        data: { action, role: role.id },
      });
    }
  }
}

/**
 * Look a document up by slug and create it only if it is missing.
 *
 * Every taxonomy `slug` is a `uid` field, so it is unique: a blind create on an
 * existing slug throws, and an unhandled throw in bootstrap stops Strapi from
 * booting. That happens as soon as someone clears the demo listings but leaves
 * the cities/makes/models behind — the listing guard below would not catch it.
 */
type TaxonomyUid =
  | "api::city.city"
  | "api::make.make"
  | "api::model.model"
  | "api::body-type.body-type"
  | "api::condition.condition"
  | "api::transmission.transmission"
  | "api::fuel-type.fuel-type"
  | "api::car-color.car-color"
  | "api::feature.feature";

async function findOrCreate(
  strapi: Core.Strapi,
  uid: TaxonomyUid,
  data: Record<string, unknown> & { slug: string },
) {
  const [existing] = await strapi.documents(uid).findMany({
    filters: { slug: data.slug },
    limit: 1,
  });

  if (existing) return existing.documentId;

  const created = await strapi.documents(uid).create({ data: data as never });
  return created.documentId;
}

/**
 * Should this boot seed the demo catalogue?
 *
 * The only guard used to be "does a listing already exist", which is the right
 * question for a local dev database and the wrong one for a hosted deployment:
 * a managed database starts empty, so the first production boot passed that
 * check and populated the site with demo rows. Those seed listings have no
 * gallery photos — the web app flags them as placeholders — and publishing
 * stand-ins as real listings is the exact thing NICHE.md exists to prevent.
 *
 * Rules, in order:
 *   SEED_DEMO_DATA=true   seed, even in production (useful right after a
 *                         deploy, to confirm the API and content types work)
 *   SEED_DEMO_DATA=false  never seed, even locally
 *   unset                 seed outside production only — so `pnpm dev:cms` on
 *                         a fresh machine still comes up with a catalogue and
 *                         nobody has to remember a flag
 */
function demoSeedingEnabled(): boolean {
  const flag = process.env.SEED_DEMO_DATA;
  if (flag === "true") return true;
  if (flag === "false") return false;
  return process.env.NODE_ENV !== "production";
}

async function seedDemoData(strapi: Core.Strapi) {
  if (!demoSeedingEnabled()) {
    strapi.log.info(
      "Autosouq: demo seeding skipped (production). Set SEED_DEMO_DATA=true to force it.",
    );
    return;
  }

  const existing = await strapi.documents("api::listing.listing").findMany({
    limit: 1,
  });

  if (existing.length > 0) return;

  const cities = [
    { name: "Muscat", nameAr: "مسقط", slug: "muscat" },
    { name: "Salalah", nameAr: "صلالة", slug: "salalah" },
    { name: "Sohar", nameAr: "صحار", slug: "sohar" },
    { name: "Nizwa", nameAr: "نزوى", slug: "nizwa" },
    { name: "Sur", nameAr: "صور", slug: "sur" },
    { name: "Barka", nameAr: "بركاء", slug: "barka" },
  ];

  const cityDocs: Record<string, string> = {};
  for (const city of cities) {
    cityDocs[city.slug] = await findOrCreate(strapi, "api::city.city", city);
  }

  const makes = [
    { name: "Toyota", nameAr: "تويوتا", slug: "toyota" },
    { name: "Nissan", nameAr: "نيسان", slug: "nissan" },
    { name: "Honda", nameAr: "هوندا", slug: "honda" },
    { name: "Hyundai", nameAr: "هيونداي", slug: "hyundai" },
    { name: "Kia", nameAr: "كيا", slug: "kia" },
    { name: "Mitsubishi", nameAr: "ميتسوبيشي", slug: "mitsubishi" },
    { name: "Suzuki", nameAr: "سوزوكي", slug: "suzuki" },
  ];

  const makeDocs: Record<string, string> = {};
  for (const make of makes) {
    makeDocs[make.slug] = await findOrCreate(strapi, "api::make.make", make);
  }

  const models = [
    { name: "Corolla", nameAr: "كورولا", slug: "corolla", make: "toyota" },
    { name: "Yaris", nameAr: "يارس", slug: "yaris", make: "toyota" },
    { name: "Camry", nameAr: "كامري", slug: "camry", make: "toyota" },
    { name: "Prado", nameAr: "برادو", slug: "prado", make: "toyota" },
    { name: "Sunny", nameAr: "صني", slug: "sunny", make: "nissan" },
    { name: "Civic", nameAr: "سيفيك", slug: "civic", make: "honda" },
    { name: "Tucson", nameAr: "توسان", slug: "tucson", make: "hyundai" },
    { name: "Picanto", nameAr: "بيكانتو", slug: "picanto", make: "kia" },
    { name: "Pajero", nameAr: "باجيرو", slug: "pajero", make: "mitsubishi" },
    { name: "Swift Dzire", nameAr: "سويفت ديزاير", slug: "swift-dzire", make: "suzuki" },
  ];

  const modelDocs: Record<string, string> = {};
  for (const model of models) {
    modelDocs[model.slug] = await findOrCreate(strapi, "api::model.model", {
      name: model.name,
      nameAr: model.nameAr,
      slug: model.slug,
      make: makeDocs[model.make],
    });
  }

  // Taxonomies, weighted to what this price band actually contains: almost
  // everything is an automatic petrol sedan or hatchback in white or silver.
  async function seedTaxonomy(
    uid: TaxonomyUid,
    rows: { name: string; nameAr: string; slug: string; hex?: string }[],
  ) {
    const docs: Record<string, string> = {};
    for (const row of rows) docs[row.slug] = await findOrCreate(strapi, uid, row);
    return docs;
  }

  const bodyTypeDocs = await seedTaxonomy("api::body-type.body-type", [
    { name: "Sedan", nameAr: "سيدان", slug: "sedan" },
    { name: "Hatchback", nameAr: "هاتشباك", slug: "hatchback" },
    { name: "SUV", nameAr: "دفع رباعي", slug: "suv" },
    { name: "Pickup", nameAr: "بيك أب", slug: "pickup" },
  ]);

  const conditionDocs = await seedTaxonomy("api::condition.condition", [
    { name: "Used", nameAr: "مستعملة", slug: "used" },
  ]);

  const transmissionDocs = await seedTaxonomy("api::transmission.transmission", [
    { name: "Automatic", nameAr: "أوتوماتيك", slug: "automatic" },
    { name: "Manual", nameAr: "عادي", slug: "manual" },
  ]);

  const fuelTypeDocs = await seedTaxonomy("api::fuel-type.fuel-type", [
    { name: "Petrol", nameAr: "بنزين", slug: "petrol" },
    { name: "Diesel", nameAr: "ديزل", slug: "diesel" },
  ]);

  const colorDocs = await seedTaxonomy("api::car-color.car-color", [
    { name: "White", nameAr: "أبيض", slug: "white", hex: "#FFFFFF" },
    { name: "Silver", nameAr: "فضي", slug: "silver", hex: "#C0C0C0" },
    { name: "Grey", nameAr: "رمادي", slug: "grey", hex: "#808080" },
    { name: "Beige", nameAr: "بيج", slug: "beige", hex: "#D9C9A8" },
    { name: "Black", nameAr: "أسود", slug: "black", hex: "#111111" },
    { name: "Blue", nameAr: "أزرق", slug: "blue", hex: "#1F3A93" },
  ]);

  const featureDocs = await seedTaxonomy("api::feature.feature", [
    { name: "Air conditioning", nameAr: "مكيف", slug: "air-conditioning" },
    { name: "Power steering", nameAr: "مقود باور", slug: "power-steering" },
    { name: "Power windows", nameAr: "زجاج كهربائي", slug: "power-windows" },
    { name: "Central locking", nameAr: "قفل مركزي", slug: "central-locking" },
    { name: "Driver airbag", nameAr: "وسادة هوائية للسائق", slug: "driver-airbag" },
    { name: "ABS", nameAr: "مكابح ABS", slug: "abs" },
    { name: "Rear camera", nameAr: "كاميرا خلفية", slug: "rear-camera" },
    { name: "Alloy wheels", nameAr: "جنوط", slug: "alloy-wheels" },
    { name: "Bluetooth", nameAr: "بلوتوث", slug: "bluetooth" },
    { name: "Cruise control", nameAr: "مثبت سرعة", slug: "cruise-control" },
    { name: "4WD", nameAr: "دفع رباعي", slug: "four-wd" },
    { name: "Agency service history", nameAr: "صيانة وكالة", slug: "agency-service" },
  ]);

  // Anchored to real listings observed on Hatla2ee / OpenSooq / YallaMotor Oman.
  // Realism rules that keep this from reading as fake to an Omani buyer:
  // mileage in this band is brutal (200k–400k km is normal), colours are white
  // and silver, and prices are round-ish but never perfectly round.
  const listings = [
    {
      title: "Toyota Corolla 2015 XLI",
      titleAr: "تويوتا كورولا 2015 — XLI",
      slug: "toyota-corolla-2015-xli",
      cylinders: 4,
      doors: 4,
      seats: 5,
      engineSize: 1.6,
      driveType: "fwd",
      bodyType: bodyTypeDocs["sedan"],
      condition: conditionDocs["used"],
      transmission: transmissionDocs["automatic"],
      fuelType: fuelTypeDocs["petrol"],
      color: colorDocs["white"],
      features: [featureDocs["air-conditioning"], featureDocs["power-steering"], featureDocs["power-windows"], featureDocs["central-locking"], featureDocs["agency-service"]],
      latitude: 23.5983,
      longitude: 58.4103,
      importOrigin: "gcc",
      price: 2700, year: 2015, mileage: 216000,
      whatsapp: "96890000001", city: "muscat", make: "toyota", model: "corolla",
      featured: true, verified: true, address: "الخوير، مسقط",
      description: "Corolla XLI in good condition, serviced regularly, agency paint. The car is in Al Khuwair and ready for inspection.",
      descriptionAr: "كورولا XLI بحالة جيدة، صيانة دورية، صبغ وكالة. السيارة في الخوير وجاهزة للفحص.",
    },
    {
      title: "Toyota Yaris 2016",
      titleAr: "تويوتا يارس 2016",
      slug: "toyota-yaris-2016",
      cylinders: 4,
      doors: 5,
      seats: 5,
      engineSize: 1.3,
      driveType: "fwd",
      bodyType: bodyTypeDocs["hatchback"],
      condition: conditionDocs["used"],
      transmission: transmissionDocs["automatic"],
      fuelType: fuelTypeDocs["petrol"],
      color: colorDocs["silver"],
      features: [featureDocs["air-conditioning"], featureDocs["power-steering"], featureDocs["power-windows"], featureDocs["bluetooth"]],
      latitude: 23.5992,
      longitude: 58.3707,
      importOrigin: "gcc",
      // Keep enough sub-2000 inventory for the /used-cars/under-2000-omr facet gate (≥5).
      price: 1780, year: 2016, mileage: 228000,
      whatsapp: "96890000002", city: "muscat", make: "toyota", model: "yaris",
      featured: false, verified: true, address: "العذيبة، مسقط",
      description: "Economical on fuel with cold A/C. High mileage, but mechanically excellent. Sold subject to inspection.",
      descriptionAr: "يارس اقتصادية في البنزين، مكيف بارد، الممشى عالي لكن الميكانيك ممتاز. شرط الفحص.",
    },
    {
      title: "Toyota Camry 2013 GL",
      titleAr: "تويوتا كامري 2013 — GL",
      slug: "toyota-camry-2013-gl",
      cylinders: 4,
      doors: 4,
      seats: 5,
      engineSize: 2.5,
      driveType: "fwd",
      bodyType: bodyTypeDocs["sedan"],
      condition: conditionDocs["used"],
      transmission: transmissionDocs["automatic"],
      fuelType: fuelTypeDocs["petrol"],
      color: colorDocs["white"],
      features: [featureDocs["air-conditioning"], featureDocs["power-steering"], featureDocs["power-windows"], featureDocs["central-locking"], featureDocs["driver-airbag"], featureDocs["abs"], featureDocs["agency-service"]],
      latitude: 23.6703,
      longitude: 58.1891,
      importOrigin: "gcc",
      price: 2450, year: 2013, mileage: 167000,
      whatsapp: "96890000003", city: "muscat", make: "toyota", model: "camry",
      featured: false, verified: true, address: "السيب، مسقط",
      description: "White Camry GL, agency import, no accident history. Mulkiya valid and recently inspected.",
      descriptionAr: "كامري GL بيضاء، وارد الوكالة، بدون حوادث. الملكية سارية والفحص جديد.",
    },
    {
      title: "Nissan Sunny 2019",
      titleAr: "نيسان صني 2019",
      slug: "nissan-sunny-2019",
      cylinders: 4,
      doors: 4,
      seats: 5,
      engineSize: 1.5,
      driveType: "fwd",
      bodyType: bodyTypeDocs["sedan"],
      condition: conditionDocs["used"],
      transmission: transmissionDocs["automatic"],
      fuelType: fuelTypeDocs["petrol"],
      color: colorDocs["white"],
      features: [featureDocs["air-conditioning"], featureDocs["power-steering"], featureDocs["power-windows"], featureDocs["bluetooth"], featureDocs["rear-camera"]],
      latitude: 23.5859,
      longitude: 58.5486,
      importOrigin: "gcc",
      price: 1950, year: 2019, mileage: 141000,
      whatsapp: "96890000004", city: "muscat", make: "nissan", model: "sunny",
      featured: true, verified: true, address: "الوادي الكبير، مسقط",
      description: "A relatively recent Sunny at a fair price — a sensible first car. Automatic, petrol.",
      descriptionAr: "صني موديل حديث نسبياً بسعر مناسب، مناسبة كأول سيارة. أوتوماتيك، بنزين.",
    },
    {
      title: "Honda Civic 2013",
      titleAr: "هوندا سيفيك 2013",
      slug: "honda-civic-2013",
      cylinders: 4,
      doors: 4,
      seats: 5,
      engineSize: 1.8,
      driveType: "fwd",
      bodyType: bodyTypeDocs["sedan"],
      condition: conditionDocs["used"],
      transmission: transmissionDocs["automatic"],
      fuelType: fuelTypeDocs["petrol"],
      color: colorDocs["silver"],
      features: [featureDocs["air-conditioning"], featureDocs["power-steering"], featureDocs["power-windows"], featureDocs["alloy-wheels"]],
      latitude: 22.5667,
      longitude: 59.5289,
      importOrigin: "us-import",
      // Second sub-2000 listing so the under-2000-omr facet clears the ≥5 gate.
      price: 1680, year: 2013, mileage: 297000,
      whatsapp: "96890000005", city: "sur", make: "honda", model: "civic",
      featured: false, verified: false, address: "صور",
      description: "Silver Civic, high mileage — two panels have been resprayed. Price negotiable after inspection.",
      descriptionAr: "سيفيك فضية، الممشى عالي — رش قطعتين. السعر قابل للتفاوض على الفحص.",
    },
    {
      title: "Hyundai Tucson 2018",
      titleAr: "هيونداي توسان 2018",
      slug: "hyundai-tucson-2018",
      cylinders: 4,
      doors: 5,
      seats: 5,
      engineSize: 2,
      driveType: "awd",
      bodyType: bodyTypeDocs["suv"],
      condition: conditionDocs["used"],
      transmission: transmissionDocs["automatic"],
      fuelType: fuelTypeDocs["petrol"],
      color: colorDocs["grey"],
      features: [featureDocs["air-conditioning"], featureDocs["power-steering"], featureDocs["power-windows"], featureDocs["central-locking"], featureDocs["abs"], featureDocs["rear-camera"], featureDocs["bluetooth"], featureDocs["agency-service"]],
      latitude: 23.5992,
      longitude: 58.3707,
      importOrigin: "gcc",
      price: 4300, year: 2018, mileage: 222000,
      whatsapp: "96890000006", city: "muscat", make: "hyundai", model: "tucson",
      featured: true, verified: true, address: "العذيبة، مسقط",
      description: "A family Tucson with plenty of room, serviced at the agency. No accident history.",
      descriptionAr: "توسان عائلية، مساحة ممتازة، صيانة في الوكالة. بدون حوادث.",
    },
    {
      title: "Mitsubishi Pajero 2014 3.5",
      titleAr: "ميتسوبيشي باجيرو 2014 — 3.5",
      slug: "mitsubishi-pajero-2014",
      cylinders: 6,
      doors: 5,
      seats: 7,
      engineSize: 3.5,
      driveType: "four_wd",
      bodyType: bodyTypeDocs["suv"],
      condition: conditionDocs["used"],
      transmission: transmissionDocs["automatic"],
      fuelType: fuelTypeDocs["petrol"],
      color: colorDocs["beige"],
      features: [featureDocs["air-conditioning"], featureDocs["power-steering"], featureDocs["power-windows"], featureDocs["four-wd"], featureDocs["alloy-wheels"], featureDocs["cruise-control"]],
      latitude: 23.7086,
      longitude: 57.8892,
      importOrigin: "gcc",
      price: 3650, year: 2014, mileage: 230000,
      whatsapp: "96890000007", city: "barka", make: "mitsubishi", model: "pajero",
      featured: false, verified: true, address: "المعبيلة، بركاء",
      description: "Four-wheel-drive Pajero, suited to weekend trips off the tarmac. New tyres, cold A/C.",
      descriptionAr: "باجيرو دفع رباعي، مناسبة للطلعات البرية. إطارات جديدة، مكيف بارد.",
    },
    {
      title: "Toyota Prado 2008 VX",
      titleAr: "تويوتا برادو 2008 — VX",
      slug: "toyota-prado-2008-vx",
      cylinders: 6,
      doors: 5,
      seats: 7,
      engineSize: 4,
      driveType: "four_wd",
      bodyType: bodyTypeDocs["suv"],
      condition: conditionDocs["used"],
      transmission: transmissionDocs["automatic"],
      fuelType: fuelTypeDocs["petrol"],
      color: colorDocs["silver"],
      features: [featureDocs["air-conditioning"], featureDocs["power-steering"], featureDocs["power-windows"], featureDocs["four-wd"], featureDocs["alloy-wheels"]],
      latitude: 24.3417,
      longitude: 56.7094,
      importOrigin: "gcc",
      price: 5200, year: 2008, mileage: 310000,
      whatsapp: "96890000008", city: "sohar", make: "toyota", model: "prado",
      featured: false, verified: true, address: "صحار",
      description: "GCC-spec Prado VX. High mileage, but the engine and gearbox are both excellent. Sold subject to inspection.",
      descriptionAr: "برادو VX خليجي، الممشى عالي لكن المحرك والقير ممتازين. شرط الفحص.",
    },
    {
      title: "Kia Picanto 2016",
      titleAr: "كيا بيكانتو 2016",
      slug: "kia-picanto-2016",
      cylinders: 4,
      doors: 5,
      seats: 5,
      engineSize: 1.2,
      driveType: "fwd",
      bodyType: bodyTypeDocs["hatchback"],
      condition: conditionDocs["used"],
      transmission: transmissionDocs["automatic"],
      fuelType: fuelTypeDocs["petrol"],
      color: colorDocs["white"],
      features: [featureDocs["air-conditioning"], featureDocs["power-steering"]],
      latitude: 23.5933,
      longitude: 58.5453,
      importOrigin: "us-import",
      price: 1250, year: 2016, mileage: 378000,
      whatsapp: "96890000009", city: "muscat", make: "kia", model: "picanto",
      featured: false, verified: false, address: "روي، مسقط",
      description: "A small, very economical Picanto. High mileage — sold as-is, and the price reflects that.",
      descriptionAr: "بيكانتو صغيرة واقتصادية جداً. الممشى عالي — تُباع كما هي، والسعر يعكس ذلك.",
    },
    {
      title: "Suzuki Swift Dzire 2016",
      titleAr: "سوزوكي سويفت ديزاير 2016",
      slug: "suzuki-swift-dzire-2016",
      cylinders: 4,
      doors: 4,
      seats: 5,
      engineSize: 1.2,
      driveType: "fwd",
      bodyType: bodyTypeDocs["sedan"],
      condition: conditionDocs["used"],
      transmission: transmissionDocs["manual"],
      fuelType: fuelTypeDocs["petrol"],
      color: colorDocs["silver"],
      features: [featureDocs["air-conditioning"], featureDocs["power-steering"], featureDocs["power-windows"]],
      latitude: 23.545,
      longitude: 58.175,
      importOrigin: "gcc",
      price: 1175, year: 2016, mileage: 224000,
      whatsapp: "96890000010", city: "muscat", make: "suzuki", model: "swift-dzire",
      featured: false, verified: false, address: "الخوض، مسقط",
      description: "Swift Dzire, economical on fuel. Needs minor servicing — sold as-is.",
      descriptionAr: "سويفت ديزاير اقتصادية في البنزين. تحتاج صيانة بسيطة — تُباع كما هي.",
    },
  ];

  for (const listing of listings) {
    const { city, make, model, ...rest } = listing;
    await strapi.documents("api::listing.listing").create({
      data: {
        ...rest,
        currency: "OMR",
        listingStatus: "available",
        city: cityDocs[city],
        make: makeDocs[make],
        model: modelDocs[model],
      } as never,
      status: "published",
    });
  }

  strapi.log.info(`Autosouq: seeded ${listings.length} in-band demo listings`);
}


/**
 * One-time repair for rows seeded before the language rule above existed.
 *
 * The first seed put Arabic in `title`/`description` and left `titleAr`/
 * `descriptionAr` null. `pick("en", …)` in apps/web/lib/strapi.js therefore fell
 * back to Arabic, so every English page rendered Arabic headings, <title> tags
 * and WhatsApp messages. Fixing the seed only helps a fresh database, so patch
 * existing rows too.
 *
 * Idempotent: it only touches rows where `titleAr` is empty AND `title` contains
 * Arabic script, so re-running it — or running it against a correctly seeded
 * database — does nothing.
 */
const ARABIC = /[\u0600-\u06FF]/;

// Trim and drivetrain codes are initialisms, not words — slug-casing turns
// "xli" into "Xli". Anything not listed here just gets normal title case.
const UPPERCASE_TOKENS = new Set([
  "xli", "gl", "vx", "gli", "se", "le", "sv", "ex", "lx", "dx", "gt",
  "4wd", "awd", "gcc", "abs", "ac",
]);

const DESCRIPTION_EN: Record<string, string> = {
  "كورولا XLI بحالة جيدة، صيانة دورية، صبغ وكالة. السيارة في الخوير وجاهزة للفحص.": "Corolla XLI in good condition, serviced regularly, agency paint. The car is in Al Khuwair and ready for inspection.",
  "يارس اقتصادية في البنزين، مكيف بارد، الممشى عالي لكن الميكانيك ممتاز. شرط الفحص.": "Economical on fuel with cold A/C. High mileage, but mechanically excellent. Sold subject to inspection.",
  "كامري GL بيضاء، وارد الوكالة، بدون حوادث. الملكية سارية والفحص جديد.": "White Camry GL, agency import, no accident history. Mulkiya valid and recently inspected.",
  "صني موديل حديث نسبياً بسعر مناسب، مناسبة كأول سيارة. أوتوماتيك، بنزين.": "A relatively recent Sunny at a fair price — a sensible first car. Automatic, petrol.",
  "سيفيك فضية، الممشى عالي — رش قطعتين. السعر قابل للتفاوض على الفحص.": "Silver Civic, high mileage — two panels have been resprayed. Price negotiable after inspection.",
  "توسان عائلية، مساحة ممتازة، صيانة في الوكالة. بدون حوادث.": "A family Tucson with plenty of room, serviced at the agency. No accident history.",
  "باجيرو دفع رباعي، مناسبة للطلعات البرية. إطارات جديدة، مكيف بارد.": "Four-wheel-drive Pajero, suited to weekend trips off the tarmac. New tyres, cold A/C.",
  "برادو VX خليجي، الممشى عالي لكن المحرك والقير ممتازين. شرط الفحص.": "GCC-spec Prado VX. High mileage, but the engine and gearbox are both excellent. Sold subject to inspection.",
  "بيكانتو صغيرة واقتصادية جداً. الممشى عالي — تُباع كما هي، والسعر يعكس ذلك.": "A small, very economical Picanto. High mileage — sold as-is, and the price reflects that.",
  "سويفت ديزاير اقتصادية في البنزين. تحتاج صيانة بسيطة — تُباع كما هي.": "Swift Dzire, economical on fuel. Needs minor servicing — sold as-is.",
};

async function repairListingLanguageFields(strapi: Core.Strapi) {
  const listings = await strapi.documents("api::listing.listing").findMany({
    fields: ["title", "titleAr", "slug", "description", "descriptionAr"] as never,
    limit: 500,
    status: "published",
  });

  let patched = 0;
  for (const listing of listings) {
    const title = (listing as { title?: string }).title ?? "";
    const titleAr = (listing as { titleAr?: string }).titleAr ?? "";
    // Run when the Arabic still sits in `title` (first pass), or when a
    // previous pass produced a slug-cased trim code like "Xli" (casing pass).
    // Only repair rows that still have Arabic sitting in the English base
    // fields. Do not slug-recase every English title on every boot — that
    // overwrites legitimate custom titles (trim codes, em dashes, etc.).
    const needsSplit = !titleAr && ARABIC.test(title);
    const descBase = (listing as { description?: string }).description ?? "";
    const descArField = (listing as { descriptionAr?: string }).descriptionAr ?? "";
    const descNeedsSplit =
      !descArField && ARABIC.test(descBase) && Boolean(DESCRIPTION_EN[descBase]);

    if (!needsSplit && !descNeedsSplit) continue;

    // The slug is already the English form ("toyota-corolla-2015-xli"), so the
    // English title is recovered from it rather than invented.
    const english = String((listing as { slug?: string }).slug ?? "")
      .split("-")
      .map((w) => {
        if (/^\d+$/.test(w)) return w;
        if (UPPERCASE_TOKENS.has(w)) return w.toUpperCase();
        return w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join(" ");

    await strapi.documents("api::listing.listing").update({
      documentId: (listing as { documentId: string }).documentId,
      data: {
        ...(needsSplit ? { title: english, titleAr: title } : {}),
        ...(descNeedsSplit
          ? { description: DESCRIPTION_EN[descBase], descriptionAr: descBase }
          : {}),
      } as never,
      status: "published",
    });
    patched += 1;
  }

  if (patched) {
    strapi.log.info(
      `Autosouq: moved Arabic titles to titleAr on ${patched} listing(s)`
    );
  }
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Neither of these is essential to serving the API, and an unhandled
    // rejection in bootstrap stops Strapi from starting at all. Log and carry
    // on rather than trading a seeding hiccup for a dead CMS.
    try {
      await enablePublicPermissions(strapi);
    } catch (err) {
      strapi.log.error(`Autosouq: could not set public permissions — ${err}`);
    }

    try {
      await seedDemoData(strapi);
    } catch (err) {
      strapi.log.error(`Autosouq: demo seeding failed — ${err}`);
    }

    // One-shot migration for the first-seed language mix-up. Off by default so
    // boots never rewrite listing titles; set REPAIR_LISTING_LANGUAGE=true to
    // run it deliberately against a database that still needs the fix.
    if (process.env.REPAIR_LISTING_LANGUAGE === "true") {
      try {
        await repairListingLanguageFields(strapi);
      } catch (err) {
        strapi.log.error(`Autosouq: language repair failed — ${err}`);
      }
    }
  },
};
