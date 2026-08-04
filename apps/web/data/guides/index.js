/**
 * The guides registry — one record per published guide.
 *
 * This file is deliberately *pure data*: no JSX, no imports. Three consumers
 * read it and none of them should have to pull a React tree in to do their job:
 *
 *   - app/(guides)/guides/page.jsx        the index
 *   - app/(guides)/guides/[slug]/page.jsx the route, its metadata and its JSON-LD
 *   - app/sitemap.js                      the XML sitemap
 *
 * The bodies live in components/guides/posts and are joined to these records by
 * slug in components/guides/posts/index.js.
 *
 * Dates
 * -----
 * `datePublished` and `dateModified` are ISO-8601 dates (YYYY-MM-DD). They are
 * hand-maintained, and that is on purpose: a build-time `new Date()` would stamp
 * every guide as modified on every deploy, which is a freshness claim we would
 * not be able to defend. **Bump `dateModified` when you change the words, not
 * when you change the CSS.**
 *
 * `verifiedOn` is a *different and stronger* claim than `dateModified`: it is
 * the day someone last re-read the cited ROP / official pages and confirmed the
 * procedure on this guide still matches them. Guides that make no procedural
 * claim have no `verifiedOn`. Both are rendered visibly on the page — a reader
 * making a decision about OMR 3,000 is entitled to know how old our information
 * is, and a guide to a process the ROP changed in 2023 and may change again is
 * exactly the kind of page that rots quietly.
 *
 * Ordering
 * --------
 * `order` is the research priority from design/research/blog-keyword-briefs.md
 * §6, not publication date. The index renders in this order.
 *
 * Language
 * --------
 * `title`, `h1`, `description` and `summary` are `{ en, ar }` pairs, the same
 * shape data/usedCarsFacets.js uses. Read them through `guideText()` rather
 * than indexing directly, so an unexpected locale falls back to a real string
 * instead of rendering `undefined` into a <title>.
 */

/** ISO date the whole current set was last checked against its sources. */
export const GUIDES_VERIFIED_ON = "2026-07-25";

export const guides = [
  {
    order: 1,
    slug: "gcc-spec-vs-american-import",
    // Metadata title. The root layout appends " | Autosouq.om" — never repeat it.
    title: {
      en: "GCC spec or American import? How to tell, in Oman",
      ar: "خليجي أم وارد أمريكي؟ كيف تعرف الفرق في عُمان",
    },
    h1: {
      en: "GCC spec or American import? How to tell, in Oman",
      ar: "خليجي أم وارد أمريكي؟ كيف تعرف الفرق في عُمان",
    },
    description: {
      en: "A checklist you can run in the car park before you pay: what the door-jamb label proves, what the chassis number does and does not tell you, and why “the VIN starts with W” is wrong.",
      ar: "قائمة فحص تنفّذها في الموقف قبل أن تدفع: ماذا تُثبت لصيقة عمود الباب، وماذا يقول رقم الهيكل وما لا يقوله، ولماذا قاعدة «رقم الهيكل يبدأ بحرف W» خاطئة.",
    },
    summary: {
      en: "The checks that actually prove where a car was built to be sold — and the popular VIN rule that proves nothing at all.",
      ar: "الفحوصات التي تُثبت فعلاً لأي سوق صُنعت السيارة — والقاعدة الشائعة عن رقم الهيكل التي لا تُثبت شيئاً.",
    },
    datePublished: "2026-07-25",
    dateModified: "2026-07-25",
  },
  {
    order: 2,
    slug: "transfer-car-ownership-oman",
    title: {
      en: "How to transfer car ownership in Oman (Mulkiya)",
      ar: "كيف تنقل ملكية سيارة في عُمان (الملكية)",
    },
    h1: {
      en: "How to transfer car ownership in Oman (Mulkiya)",
      ar: "كيف تنقل ملكية سيارة في عُمان (الملكية)",
    },
    description: {
      en: "The ROP mulkiya transfer in plain language: the conditions that must be true first, the 24-hour signing window, and the three situations that stop a transfer dead after you have paid.",
      ar: "نقل الملكية لدى شرطة عُمان السلطانية بلغة واضحة: الشروط التي يجب أن تتحقق أولاً، ومهلة التوقيع خلال 24 ساعة، والحالات الثلاث التي توقف النقل تماماً بعد أن تكون قد دفعت.",
    },
    summary: {
      en: "What the ROP’s own page tells you, plus the parts it leaves out: the 24-hour window, unpaid fines, older cars and mortgaged cars.",
      ar: "ما تقوله صفحة شرطة عُمان السلطانية نفسها، وما تتركه: مهلة الـ24 ساعة، والمخالفات غير المسددة، والسيارات الأقدم، والسيارات المرهونة.",
    },
    datePublished: "2026-07-25",
    dateModified: "2026-07-26",
    verifiedOn: "2026-07-25",
  },
  {
    order: 3,
    slug: "used-car-scams-oman",
    title: {
      en: "Used-car scams in Oman: the patterns and how to shut each one down",
      ar: "احتيال السيارات المستعملة في عُمان: الأنماط وكيف توقف كل واحد منها",
    },
    h1: {
      en: "Used-car scams in Oman: the patterns, and how to shut each one down",
      ar: "احتيال السيارات المستعملة في عُمان: الأنماط، وكيف توقف كل واحد منها",
    },
    description: {
      en: "The scam patterns that run on car listings in Oman, what each one sounds like, and the sentence to send back — including the phishing case Oman Observer documented in October 2025.",
      ar: "أنماط الاحتيال التي تدور حول إعلانات السيارات في عُمان، وكيف يبدو كل نمط، والجملة التي ترد بها — بما في ذلك حالة التصيّد التي وثّقتها Oman Observer في أكتوبر 2025.",
    },
    summary: {
      en: "One rule defeats most of them. Here is the rule, the patterns it defeats, and what to reply when you meet one.",
      ar: "قاعدة واحدة تُبطل معظمها. إليك القاعدة، والأنماط التي تُبطلها، وبماذا ترد حين تصادف واحداً.",
    },
    datePublished: "2026-07-25",
    dateModified: "2026-07-25",
  },
  {
    order: 4,
    slug: "check-fines-before-buying-oman",
    title: {
      en: "Check the car, not just the seller: fines, restrictions and loans",
      ar: "افحص السيارة لا البائع فقط: المخالفات والقيود والقروض",
    },
    h1: {
      en: "Check the car, not just the seller: fines, restrictions and loans in Oman",
      ar: "افحص السيارة لا البائع فقط: المخالفات والقيود والقروض في عُمان",
    },
    description: {
      en: "Fines and restrictions follow the vehicle, not the person, and they will block your transfer after you have paid. How to check all three with the seller standing next to you.",
      ar: "المخالفات والقيود تتبع المركبة لا الشخص، وستوقف نقل الملكية بعد أن تكون قد دفعت. كيف تفحص الثلاثة كلها والبائع واقف بجانبك.",
    },
    summary: {
      en: "Three things can block your transfer after the money has moved. All three are checkable in about ten minutes, before it does.",
      ar: "ثلاثة أمور قد توقف نقل الملكية بعد أن ينتقل المال. وكلها يمكن فحصها في نحو عشر دقائق، قبل أن ينتقل.",
    },
    datePublished: "2026-07-25",
    dateModified: "2026-07-25",
    verifiedOn: "2026-07-25",
  },
  {
    order: 5,
    slug: "first-car-oman-expat",
    title: {
      en: "Your first car in Oman: the complete expat walkthrough",
      ar: "سيارتك الأولى في عُمان: الدليل الكامل للمقيمين",
    },
    h1: {
      en: "Your first car in Oman: the complete expat walkthrough",
      ar: "سيارتك الأولى في عُمان: الدليل الكامل للمقيمين",
    },
    description: {
      en: "Buying your first car in Oman on a resident visa: what to sort before you start, where people actually buy, what to inspect, and the paperwork order that trips up first-time buyers.",
      ar: "شراء سيارتك الأولى في عُمان بتأشيرة إقامة: ما ترتّبه قبل أن تبدأ، وأين يشتري الناس فعلاً، وماذا تفحص، وترتيب الأوراق الذي يوقع المشترين لأول مرة.",
    },
    summary: {
      en: "Start to finish for a first car in the OMR 1,500–6,000 band, written for someone who has not done this in Oman before.",
      ar: "من البداية إلى النهاية لسيارة أولى ضمن نطاق 1,500–6,000 ر.ع، مكتوب لمن لم يفعل هذا في عُمان من قبل.",
    },
    datePublished: "2026-07-25",
    dateModified: "2026-07-25",
  },
  {
    order: 6,
    slug: "chassis-number-vin-check-oman",
    /**
     * The Arabic here is not a translation of the English — it is the side with
     * the demand. On 2026-08-04, رقم الشاصي returned a full completion set led
     * by the وارد أمريكي cluster, deeper than anything the English seeds
     * returned. Hence الشاصي rather than the رقم الهيكل the other guides use,
     * which stays correct as the formal term: both complete, but الهيكل's
     * completions are generic while الشاصي's carry this page's exact intent.
     */
    title: {
      en: "What a chassis number can and can’t tell you in Oman",
      ar: "رقم الشاصي في عُمان: ماذا يكشف وماذا لا يكشف",
    },
    h1: {
      en: "What a chassis number can and can’t tell you in Oman",
      ar: "رقم الشاصي في عُمان: ماذا يكشف وماذا لا يكشف",
    },
    description: {
      en: "Where to find the chassis number, what a VIN report shows about an American import, why a clean title is not a clean car — and the free checks to run before you pay for anything.",
      ar: "أين تجد رقم الشاصي، وماذا يكشف تقرير الوارد الأمريكي، ولماذا «كلين تايتل» ليست سيارة نظيفة — والفحوصات المجانية قبل أن تدفع مقابل أي شيء.",
    },
    summary: {
      en: "A VIN report describes the years before the car reached Oman. This is what it covers, what it cannot, and which free checks to do first.",
      ar: "تقرير الشاصي يصف السنوات التي سبقت وصول السيارة إلى عُمان. وهذا ما يغطيه، وما لا يغطيه، وأي الفحوصات المجانية تبدأ بها.",
    },
    datePublished: "2026-08-04",
    dateModified: "2026-08-04",
  },
];

/** Index order for the hub and the sitemap. */
export const guidesInOrder = [...guides].sort((a, b) => a.order - b.order);

/** One guide by slug, or undefined — the route turns that into a 404. */
export function getGuide(slug) {
  return guides.find((guide) => guide.slug === slug);
}

/** "/guides/gcc-spec-vs-american-import" */
export function guidePath(slug) {
  return `/guides/${slug}`;
}

/**
 * Read one `{ en, ar }` field off a guide.
 *
 * Falls back to English rather than to `undefined`: a missing Arabic string
 * should show the English sentence, not print "undefined" into a <title>.
 */
export function guideText(guide, field, locale = "en") {
  const value = guide?.[field];
  if (!value) return "";
  if (typeof value === "string") return value;
  return (locale === "ar" ? value.ar : value.en) || value.en || value.ar || "";
}

/**
 * "25 July 2026" / "25 يوليو 2026" — the form used in the page furniture.
 *
 * `-u-nu-latn` forces Latin digits in the Arabic output. Arabic-Indic numerals
 * (٢٥) are correct Arabic but wrong for this audience: Omani buyers read prices
 * and years in Latin digits, and the strategy doc (§4) makes Latin numerals a
 * site-wide rule so a date never disagrees with the price next to it.
 */
export function formatGuideDate(iso, locale = "en") {
  if (!iso) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(
    locale === "ar" ? "ar-OM-u-nu-latn" : "en-GB",
    { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" },
  ).format(date);
}
