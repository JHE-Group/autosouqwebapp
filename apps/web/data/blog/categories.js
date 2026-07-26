/**
 * Blog category taxonomy.
 *
 * Research: design agents + content research (OMR 1,500–6,000 niche).
 * Guides stay evergreen YMYL procedure; blog is editorial / decision /
 * dated notes. Do not invent inventory SEO categories (under-3000, city farms).
 */

/** @typedef {{ slug: string, name: { en: string, ar: string }, description: { en: string, ar: string }, order: number }} BlogCategory */

/** @type {BlogCategory[]} */
export const BLOG_CATEGORIES = [
  {
    order: 1,
    slug: "buying-in-budget",
    name: { en: "Buying in Budget", ar: "الشراء بميزانية محدودة" },
    description: {
      en: "What OMR 1,500–6,000 actually buys in Oman — trade-offs, not inventory lists.",
      ar: "ماذا تشتري فعلاً بميزانية 1,500–6,000 ر.ع في عُمان — مقايضات، لا قوائم مخزون.",
    },
  },
  {
    order: 2,
    slug: "models-worth-buying",
    name: { en: "Models Worth Buying", ar: "موديلات تستاهل" },
    description: {
      en: "Honest picks and comparisons for cars that trade in this band.",
      ar: "اختيارات ومقارنات صادقة للسيارات التي تُباع في هذا النطاق.",
    },
  },
  {
    order: 3,
    slug: "heat-and-condition",
    name: { en: "Heat & Condition", ar: "الحرارة وحالة السيارة" },
    description: {
      en: "Oman-specific checks — A/C, heat, flood and salvage — where foreign advice fails.",
      ar: "فحوصات خاصة بعُمان — المكيّف والحرارة والفيضان والاستيراد — حيث تفشل النصائح الأجنبية.",
    },
  },
  {
    order: 4,
    slug: "running-costs",
    name: { en: "Running Costs", ar: "تكلفة التشغيل" },
    description: {
      en: "Fuel, insurance choices and a repair fund for an affordable used car.",
      ar: "الوقود وخيارات التأمين وصندوق إصلاح لسيارة مستعملة بأسعار في المتناول.",
    },
  },
  {
    order: 5,
    slug: "selling",
    name: { en: "Selling", ar: "البيع" },
    description: {
      en: "Pricing and safe handovers for sellers in this band — including leaving Oman.",
      ar: "التسعير والتسليم الآمن للبائعين في هذا النطاق — بما في ذلك مغادرة عُمان.",
    },
  },
  {
    order: 6,
    slug: "market-notes",
    name: { en: "Market Notes", ar: "ملاحظات السوق" },
    description: {
      en: "Dated snapshots — fuel, fees, band mix — not evergreen law.",
      ar: "لمحات مؤرَّخة — الوقود والرسوم ومزيج النطاق — وليست قوانين دائمة.",
    },
  },
];

export const blogCategoriesInOrder = [...BLOG_CATEGORIES].sort(
  (a, b) => a.order - b.order,
);

export function getBlogCategory(slug) {
  return BLOG_CATEGORIES.find((category) => category.slug === slug);
}

export function blogCategoryPath(slug) {
  return slug ? `/blog/category/${slug}` : "/blog";
}

export function categoryLabel(category, locale = "en") {
  if (!category) return "";
  return locale === "ar" ? category.name.ar : category.name.en;
}
