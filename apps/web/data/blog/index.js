/**
 * Blog post registry — pure data, same pattern as data/guides/index.js.
 *
 * Bodies live in components/blog/posts and join by slug.
 * Bump dateModified when the words change, not when CSS changes.
 */

import { blogCategoriesInOrder, getBlogCategory } from "./categories.js";

export const posts = [
  {
    order: 1,
    slug: "what-omr-3000-buys-oman-2026",
    category: "buying-in-budget",
    title: {
      en: "What OMR 3,000 actually buys you in Oman in 2026",
      ar: "ماذا تشتري لك فعلاً 3,000 ر.ع في عُمان عام 2026",
    },
    h1: {
      en: "What OMR 3,000 actually buys you in Oman in 2026",
      ar: "ماذا تشتري لك فعلاً 3,000 ر.ع في عُمان عام 2026",
    },
    description: {
      en: "A plain look at the mid-band on Autosouq: what kind of car, mileage and condition OMR 3,000 usually means in Oman — and what it does not buy.",
      ar: "نظرة صريحة على وسط النطاق في أوتوسوق: أي نوع سيارة، وكم ممشى، وأي حالة تعني 3,000 ر.ع عادةً في عُمان — وما الذي لا تشتريه.",
    },
    summary: {
      en: "The middle of our band is where most buyers land. Here is what that money typically gets you, and what it does not.",
      ar: "وسط نطاقنا هو حيث يستقر معظم المشترين. إليك ما يشتريه هذا المبلغ عادةً، وما لا يشتريه.",
    },
    datePublished: "2026-07-26",
    dateModified: "2026-07-26",
  },
  {
    order: 2,
    slug: "cars-under-1500-sold-as-is",
    category: "buying-in-budget",
    title: {
      en: "Cars under OMR 1,500: when sold as-is is fair",
      ar: "سيارات بأقل من 1,500 ر.ع: متى يكون «تُباع كما هي» عادلاً",
    },
    h1: {
      en: "Cars under OMR 1,500: when “sold as-is” is fair, and when it isn’t",
      ar: "سيارات بأقل من 1,500 ر.ع: متى يكون «تُباع كما هي» عادلاً، ومتى لا يكون",
    },
    description: {
      en: "Autosouq accepts OMR 1,000–1,499 cars only with a sold-as-is label. What that label means for the buyer, and when to walk away.",
      ar: "يقبل أوتوسوق سيارات 1,000–1,499 ر.ع بعلامة «تُباع كما هي» فقط. ماذا تعني هذه العلامة للمشتري، ومتى تنسحب.",
    },
    summary: {
      en: "Below OMR 1,500 the price is the warning. Here is how to read it without pretending the car is something it is not.",
      ar: "تحت 1,500 ر.ع يكون السعر نفسه هو التحذير. إليك كيف تقرأه دون أن تتظاهر بأن السيارة غير ما هي عليه.",
    },
    datePublished: "2026-07-26",
    dateModified: "2026-07-26",
  },
  {
    order: 3,
    slug: "high-mileage-corolla-oman",
    category: "models-worth-buying",
    title: {
      en: "Is a 200,000 km Corolla still worth buying in Oman?",
      ar: "هل تستحق كورولا بممشى 200,000 كم الشراء في عُمان؟",
    },
    h1: {
      en: "Is a 200,000 km Corolla still worth buying in Oman?",
      ar: "هل تستحق كورولا بممشى 200,000 كم الشراء في عُمان؟",
    },
    description: {
      en: "High kilometres are normal in Oman’s affordable band. What to check on a well-used Corolla before you WhatsApp the seller.",
      ar: "الممشى العالي أمر طبيعي في نطاق الأسعار المتناولة في عُمان. ما الذي تفحصه في كورولا مستهلكة قبل أن تراسل البائع على واتساب.",
    },
    summary: {
      en: "Mileage alone is not a no. The checks that matter on a Corolla that has lived an Omani life.",
      ar: "الممشى وحده ليس سبباً للرفض. الفحوصات التي تهم في كورولا عاشت عمرها في عُمان.",
    },
    datePublished: "2026-07-26",
    dateModified: "2026-07-26",
  },
  {
    order: 4,
    slug: "corolla-vs-sunny-vs-accent-omr-3000",
    category: "models-worth-buying",
    title: {
      en: "Corolla vs Sunny vs Accent at OMR 3,000",
      ar: "كورولا وصني وأكسنت عند 3,000 ر.ع",
    },
    h1: {
      en: "Corolla vs Sunny vs Accent at OMR 3,000",
      ar: "كورولا وصني وأكسنت عند 3,000 ر.ع",
    },
    description: {
      en: "Three common sedans in Autosouq’s band compared for ownership in Oman — parts, A/C expectations and resale, not brochure specs.",
      ar: "ثلاث سيارات سيدان شائعة ضمن نطاق أوتوسوق، مقارنة من زاوية الامتلاك في عُمان — قطع الغيار، وتوقعات المكيّف، وإعادة البيع، لا مواصفات الكتيّب.",
    },
    summary: {
      en: "Same budget, three different ownership stories. Pick the trade-offs you can live with.",
      ar: "الميزانية نفسها، وثلاث تجارب امتلاك مختلفة. اختر المقايضة التي تستطيع التعايش معها.",
    },
    datePublished: "2026-07-26",
    dateModified: "2026-07-26",
  },
  {
    order: 5,
    slug: "testing-used-car-ac-oman",
    category: "heat-and-condition",
    title: {
      en: "Testing a used car’s A/C in Oman",
      ar: "كيف تفحص مكيّف سيارة مستعملة في عُمان",
    },
    h1: {
      en: "Testing a used car’s A/C in Oman",
      ar: "كيف تفحص مكيّف سيارة مستعملة في عُمان",
    },
    description: {
      en: "A parking-lot A/C check for Oman’s summer — what “cold” means here, and why a weak compressor is an OMR 300+ problem.",
      ar: "فحص مكيّف في الموقف يناسب صيف عُمان — ماذا تعني كلمة «بارد» هنا، ولماذا الكمبروسر الضعيف مشكلة بـ300 ر.ع فأكثر.",
    },
    summary: {
      en: "In this climate, A/C is not a comfort option. A five-minute check before you pay.",
      ar: "في هذا المناخ، المكيّف ليس رفاهية. فحص من خمس دقائق قبل أن تدفع.",
    },
    datePublished: "2026-07-26",
    dateModified: "2026-07-26",
  },
  {
    order: 6,
    slug: "used-car-running-costs-oman",
    category: "running-costs",
    title: {
      en: "What a used car really costs to run in Oman",
      ar: "كم تكلّف سيارة مستعملة فعلاً في عُمان",
    },
    h1: {
      en: "What a used car really costs to run in Oman",
      ar: "كم تكلّف سيارة مستعملة فعلاً في عُمان",
    },
    description: {
      en: "Fuel, third-party insurance and a repair fund for cars in the OMR 1,500–6,000 band — dated figures, not a dealership quote.",
      ar: "الوقود، والتأمين ضد الغير، وصندوق إصلاح للسيارات ضمن نطاق 1,500–6,000 ر.ع — أرقام مؤرَّخة، لا عرض سعر من وكالة.",
    },
    summary: {
      en: "The sticker price is not the monthly cost. Three lines every buyer should budget.",
      ar: "سعر الشراء ليس التكلفة الشهرية. ثلاثة بنود يجب أن يحسبها كل مشترٍ.",
    },
    datePublished: "2026-07-26",
    dateModified: "2026-07-26",
  },
  {
    order: 7,
    slug: "selling-affordable-car-oman",
    category: "selling",
    title: {
      en: "Selling your affordable car in Oman without getting scammed",
      ar: "بيع سيارتك في عُمان دون أن تقع في الاحتيال",
    },
    h1: {
      en: "Selling your affordable car in Oman without getting scammed",
      ar: "بيع سيارتك في عُمان دون أن تقع في الاحتيال",
    },
    description: {
      en: "Seller-side safety for cars in Autosouq’s band: pricing honestly, meeting safely, and not falling for fake-buyer patterns.",
      ar: "أمان البائع للسيارات ضمن نطاق أوتوسوق: التسعير بصدق، واللقاء الآمن، وعدم الوقوع في أنماط المشتري الوهمي.",
    },
    summary: {
      en: "Supply matters here. How to sell without lowballing yourself or walking into a scam.",
      ar: "المعروض مهم هنا. كيف تبيع دون أن تبخس سيارتك أو تقع في عملية احتيال.",
    },
    datePublished: "2026-07-26",
    dateModified: "2026-07-26",
  },
  {
    order: 8,
    slug: "flood-salvage-imports-oman",
    category: "heat-and-condition",
    title: {
      en: "Flood-damaged and salvage imports: how to spot one",
      ar: "الواردات المتضررة من الفيضانات والمشطوبة: كيف تكتشفها",
    },
    h1: {
      en: "Flood-damaged and salvage imports: how to spot one before you buy",
      ar: "الواردات المتضررة من الفيضانات والمشطوبة: كيف تكتشفها قبل أن تشتري",
    },
    description: {
      en: "US and other imports in the affordable band can hide flood or salvage history. What to look for in Oman before you pay cash.",
      ar: "قد تُخفي الواردات الأمريكية وغيرها ضمن النطاق المتناول تاريخ فيضان أو شطب. ما الذي تبحث عنه في عُمان قبل أن تدفع نقداً.",
    },
    summary: {
      en: "Foreign damage reports do not travel cleanly. A practical look-over when the story sounds too good.",
      ar: "تقارير الضرر الأجنبية لا تصل كاملة. فحص عملي حين تبدو القصة أجمل من اللازم.",
    },
    datePublished: "2026-07-26",
    dateModified: "2026-07-26",
  },
];

export const postsInOrder = [...posts].sort((a, b) => a.order - b.order);

export function getPost(slug) {
  return posts.find((post) => post.slug === slug);
}

export function postsForCategory(categorySlug) {
  return postsInOrder.filter((post) => post.category === categorySlug);
}

export function blogPath(slug) {
  return `/blog/${slug}`;
}

/** Read one `{ en, ar }` field off a post. Falls back to English, never undefined. */
export function postText(post, field, locale = "en") {
  const value = post?.[field];
  if (!value) return "";
  if (typeof value === "string") return value;
  return (locale === "ar" ? value.ar : value.en) || value.en || value.ar || "";
}

/** Latin digits in both languages — see `formatGuideDate` and §4 of the strategy doc. */
export function formatBlogDate(iso, locale = "en") {
  if (!iso) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(
    locale === "ar" ? "ar-OM-u-nu-latn" : "en-GB",
    { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" },
  ).format(date);
}

export function postCategory(post) {
  return getBlogCategory(post?.category);
}

/**
 * Inventory gate for categories, the blog's version of
 * `facetClearsGate()` in data/usedCarsFacets.js.
 *
 * A category with no posts renders a heading, one sentence of taxonomy prose
 * and "nothing here yet" — thin by any reading, and `market-notes` is in
 * exactly that state today. An empty category stays reachable for anyone
 * holding the URL, but it is not nominated in the sitemap (app/sitemap.js),
 * not linked from the category nav (components/blog/BlogCategoryNav.jsx), and
 * serves `noindex, follow` — so it becomes indexable the moment it earns it,
 * with no further code change.
 */
export function categoryHasPosts(categorySlug) {
  return posts.some((post) => post.category === categorySlug);
}

/** Categories that currently clear that gate, in display order. */
export const liveBlogCategories = blogCategoriesInOrder.filter((category) =>
  categoryHasPosts(category.slug),
);
