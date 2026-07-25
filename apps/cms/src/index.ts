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
async function findOrCreate(
  strapi: Core.Strapi,
  uid: "api::city.city" | "api::make.make" | "api::model.model",
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

async function seedDemoData(strapi: Core.Strapi) {
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

  // Anchored to real listings observed on Hatla2ee / OpenSooq / YallaMotor Oman.
  // Realism rules that keep this from reading as fake to an Omani buyer:
  // mileage in this band is brutal (200k–400k km is normal), colours are white
  // and silver, and prices are round-ish but never perfectly round.
  const listings = [
    {
      title: "تويوتا كورولا 2015 — XLI",
      slug: "toyota-corolla-2015-xli",
      importOrigin: "gcc",
      price: 2700, year: 2015, mileage: 216000,
      whatsapp: "96890000001", city: "muscat", make: "toyota", model: "corolla",
      featured: true, verified: true, address: "الخوير، مسقط",
      description: "كورولا XLI بحالة جيدة، صيانة دورية، صبغ وكالة. السيارة في الخوير وجاهزة للفحص.",
    },
    {
      title: "تويوتا يارس 2016",
      slug: "toyota-yaris-2016",
      importOrigin: "gcc",
      price: 2300, year: 2016, mileage: 228000,
      whatsapp: "96890000002", city: "muscat", make: "toyota", model: "yaris",
      featured: false, verified: true, address: "العذيبة، مسقط",
      description: "يارس اقتصادية في البنزين، مكيف بارد، الممشى عالي لكن الميكانيك ممتاز. شرط الفحص.",
    },
    {
      title: "تويوتا كامري 2013 — GL",
      slug: "toyota-camry-2013-gl",
      importOrigin: "gcc",
      price: 2450, year: 2013, mileage: 167000,
      whatsapp: "96890000003", city: "muscat", make: "toyota", model: "camry",
      featured: false, verified: true, address: "السيب، مسقط",
      description: "كامري GL بيضاء، وارد الوكالة، بدون حوادث. الملكية سارية والفحص جديد.",
    },
    {
      title: "نيسان صني 2019",
      slug: "nissan-sunny-2019",
      importOrigin: "gcc",
      price: 1950, year: 2019, mileage: 141000,
      whatsapp: "96890000004", city: "muscat", make: "nissan", model: "sunny",
      featured: true, verified: true, address: "الوادي الكبير، مسقط",
      description: "صني موديل حديث نسبياً بسعر مناسب، مناسبة كأول سيارة. أوتوماتيك، بنزين.",
    },
    {
      title: "هوندا سيفيك 2013",
      slug: "honda-civic-2013",
      importOrigin: "us-import",
      price: 2200, year: 2013, mileage: 297000,
      whatsapp: "96890000005", city: "sur", make: "honda", model: "civic",
      featured: false, verified: false, address: "صور",
      description: "سيفيك فضية، الممشى عالي — رش قطعتين. السعر قابل للتفاوض على الفحص.",
    },
    {
      title: "هيونداي توسان 2018",
      slug: "hyundai-tucson-2018",
      importOrigin: "gcc",
      price: 4300, year: 2018, mileage: 222000,
      whatsapp: "96890000006", city: "muscat", make: "hyundai", model: "tucson",
      featured: true, verified: true, address: "العذيبة، مسقط",
      description: "توسان عائلية، مساحة ممتازة، صيانة في الوكالة. بدون حوادث.",
    },
    {
      title: "ميتسوبيشي باجيرو 2014 — 3.5",
      slug: "mitsubishi-pajero-2014",
      importOrigin: "gcc",
      price: 3650, year: 2014, mileage: 230000,
      whatsapp: "96890000007", city: "barka", make: "mitsubishi", model: "pajero",
      featured: false, verified: true, address: "المعبيلة، بركاء",
      description: "باجيرو دفع رباعي، مناسبة للطلعات البرية. إطارات جديدة، مكيف بارد.",
    },
    {
      title: "تويوتا برادو 2008 — VX",
      slug: "toyota-prado-2008-vx",
      importOrigin: "gcc",
      price: 5200, year: 2008, mileage: 310000,
      whatsapp: "96890000008", city: "sohar", make: "toyota", model: "prado",
      featured: false, verified: true, address: "صحار",
      description: "برادو VX خليجي، الممشى عالي لكن المحرك والقير ممتازين. شرط الفحص.",
    },
    {
      title: "كيا بيكانتو 2016",
      slug: "kia-picanto-2016",
      importOrigin: "us-import",
      price: 1250, year: 2016, mileage: 378000,
      whatsapp: "96890000009", city: "muscat", make: "kia", model: "picanto",
      featured: false, verified: false, address: "روي، مسقط",
      description: "بيكانتو صغيرة واقتصادية جداً. الممشى عالي — تُباع كما هي، والسعر يعكس ذلك.",
    },
    {
      title: "سوزوكي سويفت ديزاير 2016",
      slug: "suzuki-swift-dzire-2016",
      importOrigin: "gcc",
      price: 1175, year: 2016, mileage: 224000,
      whatsapp: "96890000010", city: "muscat", make: "suzuki", model: "swift-dzire",
      featured: false, verified: false, address: "الخوض، مسقط",
      description: "سويفت ديزاير اقتصادية في البنزين. تحتاج صيانة بسيطة — تُباع كما هي.",
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
  },
};
