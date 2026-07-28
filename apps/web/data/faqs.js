/**
 * FAQ content for /faq.
 *
 * The template shipped 30 questions about "AutoDecar.com", every one answered
 * with the *same* boilerplate paragraph, plus a billing FAQ about invoices and
 * refunds and a developer FAQ about API integration — none of which describes
 * this business. Rewritten against NICHE.md.
 *
 * Rule for anything added here: state only what is actually true of Autosouq.
 * Where a question needs a business decision nobody has made yet — listing
 * fees, sale commission, the formal reporting channel — the question is LEFT
 * OUT rather than answered with a guess. A missing answer is a gap; an
 * invented one is the exact thing this marketplace exists to sell against.
 *
 * `features`, `toggleItems2` and `toggleItems3` used to live here as three more
 * blocks of lorem. Nothing imported them once the car-detail spec accordions
 * were rebuilt from real listing data, so they are gone rather than translated.
 *
 * Language
 * --------
 * Every `title` and `content` is an `{ en, ar }` pair. These answers are the
 * trust copy — the strategy doc (§8) names the FAQ as one of the surfaces a
 * native speaker must sign off before Arabic is indexed, because a stilted
 * answer about what "verified" means undoes the thing the answer is claiming.
 * Read them through `faqText()`.
 */

/** Pick one side of an `{ en, ar }` pair, falling back to English. */
export function faqText(value, locale = "en") {
  if (!value) return "";
  if (typeof value === "string") return value;
  return (locale === "ar" ? value.ar : value.en) || value.en || value.ar || "";
}

/** Resolve a whole FAQ list to plain `{ title, content }` for the accordion. */
export function localiseFaqs(items, locale = "en") {
  return items.map((item) => ({
    title: faqText(item.title, locale),
    content: faqText(item.content, locale),
  }));
}

// General — "About Autosouq".
export const toggleItems = [
  {
    title: {
      en: "What is Autosouq.om?",
      ar: "ما هو Autosouq.om؟",
    },
    content: {
      en: "Autosouq is a marketplace for affordable used cars in Oman. Every car listed is between OMR 1,500 and 6,000 — the range most people here actually buy in. You browse, you check the details, and you message the seller directly on WhatsApp.",
      ar: "أوتوسوق منصة للسيارات المستعملة بأسعار في المتناول في عُمان. كل سيارة معروضة بسعر بين 1,500 و6,000 ر.ع — وهو النطاق الذي يشتري فيه معظم الناس هنا فعلاً. تتصفّح، وتقرأ التفاصيل، وتراسل البائع مباشرة على واتساب.",
    },
  },
  {
    title: {
      en: "Why is every car between OMR 1,500 and 6,000?",
      ar: "لماذا كل السيارات بين 1,500 و6,000 ر.ع؟",
    },
    content: {
      en: "Because that is the part of the market we know, and we would rather do one band properly than cover everything badly. A site that lists a 2,000 rial Corolla next to a 40,000 rial Land Cruiser ends up serving neither buyer well. Keeping to one band means the search, the prices and the advice all stay relevant to you.",
      ar: "لأن هذا هو الجزء الذي نعرفه من السوق، ونفضّل أن نتقن نطاقاً واحداً على أن نغطي كل شيء بشكل رديء. فالموقع الذي يعرض كورولا بـ2,000 ريال بجانب لاند كروزر بـ40,000 ريال لا يخدم أياً من المشتريين جيداً. والالتزام بنطاق واحد يجعل البحث والأسعار والنصائح كلها ذات صلة بك.",
    },
  },
  {
    title: {
      en: "Do you ever list cars above OMR 6,000?",
      ar: "هل تعرضون سيارات بأكثر من 6,000 ر.ع؟",
    },
    content: {
      en: "No. Not as a promotion, not as an exception. If a car is worth more than 6,000 rials it belongs somewhere else, and we will say so.",
      ar: "لا. لا كعرض ترويجي ولا كاستثناء. فإن كانت السيارة تساوي أكثر من 6,000 ريال فمكانها في موقع آخر، وسنقول لك ذلك.",
    },
  },
  {
    title: {
      en: "What does “sold as-is” mean?",
      ar: "ماذا تعني «تُباع كما هي»؟",
    },
    content: {
      en: "We accept a small number of cars between OMR 1,000 and 1,499, and every one of them carries a “sold as-is” label. It means the car is being sold in its current condition, faults included, and the seller is not fixing anything before the sale. It is not a warning that the car is bad — plenty of honest, inexpensive cars just need work. It is there so nobody is surprised.",
      ar: "نقبل عدداً قليلاً من السيارات بين 1,000 و1,499 ر.ع، وكل واحدة منها تحمل علامة «تُباع كما هي». وهي تعني أن السيارة تُباع بحالتها الحالية بعيوبها، وأن البائع لن يصلح شيئاً قبل البيع. وليست تحذيراً من أن السيارة سيئة — فكثير من السيارات الرخيصة الصادقة تحتاج فقط إلى عمل. هي موجودة كي لا يُفاجأ أحد.",
    },
  },
  {
    title: {
      en: "What does “verified” mean on a listing?",
      ar: "ماذا تعني كلمة «محقَّق منه» في الإعلان؟",
    },
    content: {
      en: "It means we checked the listing before publishing it: that the details are internally consistent, that the price is a real asking price rather than bait, and that the seller is reachable on the number given. It is not a mechanical inspection and it is not a guarantee about the car. See the car yourself, and have it checked by a workshop you chose, before you pay anything.",
      ar: "تعني أننا تحققنا من الإعلان قبل نشره: أن التفاصيل متسقة فيما بينها، وأن السعر سعر مطلوب حقيقي لا طُعم، وأن البائع يمكن الوصول إليه على الرقم المذكور. وهي ليست فحصاً ميكانيكياً وليست ضماناً بشأن السيارة. عاين السيارة بنفسك، واطلب فحصها في ورشة تختارها أنت، قبل أن تدفع أي مبلغ.",
    },
  },
  {
    title: {
      en: "What is the difference between GCC spec and an import?",
      ar: "ما الفرق بين الخليجي والمستورد؟",
    },
    content: {
      en: "A GCC-spec car was built for this region, with the cooling and trim suited to the heat and the dust. An imported car — most often from the United States — was built for a different climate, and any accident or flood history behind it is harder to trace once it is here. Neither is automatically bad, but they are not worth the same money, and buyers are often told an import is GCC spec. Every Autosouq listing says which it is, or says plainly that the seller has not told us.",
      ar: "السيارة الخليجية صُنعت لهذه المنطقة، بتبريد وتجهيزات تناسب الحرارة والغبار. أما المستوردة — وغالباً من الولايات المتحدة — فصُنعت لمناخ مختلف، ويصعب تتبّع تاريخ حوادثها أو تعرّضها للفيضانات بعد وصولها إلى هنا. ولا واحدة منهما سيئة تلقائياً، لكنهما لا تساويان المبلغ نفسه، وكثيراً ما يُقال للمشتري إن المستوردة خليجية. وكل إعلان في أوتوسوق يوضّح أيهما، أو يقول بصراحة إن البائع لم يخبرنا.",
    },
  },
  {
    title: {
      en: "Is the price shown the real price?",
      ar: "هل السعر المعروض هو السعر الحقيقي؟",
    },
    content: {
      en: "Yes. The number on the listing is the seller's asking price in Omani rials. There is no separate “on the road” price, no compulsory extras, and no car priced low just to make you call. If you find one that is not right, tell us and we will take it down.",
      ar: "نعم. الرقم في الإعلان هو السعر الذي يطلبه البائع بالريال العُماني. لا يوجد سعر منفصل «على الطريق»، ولا إضافات إلزامية، ولا سيارة سُعّرت بأقل من قيمتها لتدفعك إلى الاتصال. وإن وجدت إعلاناً غير صحيح، أخبرنا وسنسحبه.",
    },
  },
  {
    title: {
      en: "How do I contact a seller?",
      ar: "كيف أتواصل مع البائع؟",
    },
    content: {
      en: "Tap the WhatsApp button on the listing. It opens a message to that seller with the car and its listed price already filled in, so you both start from the same number. There is no account to create and no bidding.",
      ar: "اضغط زر واتساب في الإعلان. يفتح لك رسالة إلى ذلك البائع والسيارة وسعرها المعروض مكتوبان فيها مسبقاً، فتبدآن من الرقم نفسه. لا حساب تنشئه ولا مزايدة.",
    },
  },
];

// Buying and selling. Replaces the template's invoice / refund / accounting FAQ.
export const feeItems = [
  {
    title: {
      en: "Do I need an account to browse or message a seller?",
      ar: "هل أحتاج حساباً للتصفّح أو لمراسلة بائع؟",
    },
    content: {
      en: "No. Browsing is open and the WhatsApp button works without signing in. You only need an account to list a car of your own.",
      ar: "لا. التصفّح مفتوح وزر واتساب يعمل دون تسجيل دخول. وتحتاج حساباً فقط لعرض سيارة خاصة بك.",
    },
  },
  {
    title: {
      en: "Does Autosouq handle the money?",
      ar: "هل يتعامل أوتوسوق مع المال؟",
    },
    content: {
      en: "No. Autosouq is a place to find the car and reach the seller — nothing more. Payment is arranged directly between you and the seller. We never ask a buyer to send a deposit through us, so if anyone claiming to be from Autosouq asks you to, it is not us.",
      ar: "لا. أوتوسوق مكان لتجد فيه السيارة وتصل إلى البائع — لا أكثر. والدفع يُرتَّب مباشرة بينك وبين البائع. ونحن لا نطلب من أي مشترٍ إرسال عربون عبرنا إطلاقاً، فإن طلب منك ذلك أحد مدّعياً أنه من أوتوسوق، فهو ليس نحن.",
    },
  },
  {
    title: {
      en: "Who transfers the mulkiya?",
      ar: "من ينقل الملكية؟",
    },
    content: {
      en: "The buyer and seller do, between themselves, through the Royal Oman Police. Autosouq is not part of that process. Agree who is settling any outstanding fines before money changes hands — that is where most disputes start.",
      ar: "المشتري والبائع، فيما بينهما، عبر شرطة عُمان السلطانية. وأوتوسوق ليس جزءاً من هذا الإجراء. واتفقا على من سيسدّد المخالفات غير المدفوعة قبل أن ينتقل المال — فمن هنا تبدأ معظم النزاعات.",
    },
  },
  {
    title: {
      en: "How do I sell my car on Autosouq?",
      ar: "كيف أبيع سيارتي على أوتوسوق؟",
    },
    content: {
      en: "List it from your dashboard: the car's details, honest mileage in kilometres, whether it is GCC spec or an import, and your asking price. The price has to be between OMR 1,500 and 6,000. Between 1,000 and 1,499 we will still take it, but it publishes with a “sold as-is” label.",
      ar: "اعرضها من لوحة التحكم: تفاصيل السيارة، والممشى الحقيقي بالكيلومترات، وهل هي خليجية أم مستوردة، وسعرك المطلوب. ويجب أن يكون السعر بين 1,500 و6,000 ر.ع. وبين 1,000 و1,499 ر.ع سنقبلها أيضاً، لكنها تُنشر بعلامة «تُباع كما هي».",
    },
  },
  {
    title: {
      en: "Why would a listing be rejected?",
      ar: "لماذا قد يُرفض إعلان؟",
    },
    content: {
      en: "Most often the price: above OMR 6,000 we cannot list the car at all. The other common reason is missing information — we will not publish a car without its mileage, or without saying whether it is GCC spec or an import.",
      ar: "غالباً بسبب السعر: فوق 6,000 ر.ع لا نستطيع عرض السيارة أصلاً. والسبب الشائع الآخر هو نقص المعلومات — فلن ننشر سيارة بلا ممشى، أو بلا توضيح إن كانت خليجية أم مستوردة.",
    },
  },
];

// Safety and support. Replaces the template's API-integration FAQ.
export const supportItems = [
  {
    title: {
      en: "What languages does Autosouq support?",
      ar: "ما اللغات التي يدعمها أوتوسوق؟",
    },
    content: {
      en: "Arabic and English, equally. Nothing that matters is available in one language only.",
      ar: "العربية والإنجليزية، بالتساوي. ولا شيء مهم متاح بلغة واحدة فقط.",
    },
  },
  {
    title: {
      en: "What should I check before buying?",
      ar: "ما الذي يجب أن أفحصه قبل الشراء؟",
    },
    content: {
      en: "See the car in daylight. Check the chassis number on the car matches the mulkiya. Look for mismatched paint and uneven panel gaps, which suggest accident repair. Take it to a workshop you chose — not one the seller recommends — before you pay. And confirm there are no outstanding fines against the car.",
      ar: "عاين السيارة في ضوء النهار. وتأكّد أن رقم الهيكل على السيارة يطابق الملكية. وابحث عن اختلاف في لون الطلاء وعن فجوات غير متساوية بين القطع، فهي تدل على إصلاح بعد حادث. وخذها إلى ورشة تختارها أنت — لا ورشة يرشّحها البائع — قبل أن تدفع. وتأكّد من عدم وجود مخالفات غير مسددة على السيارة.",
    },
  },
  {
    title: {
      en: "How do I know a seller is genuine?",
      ar: "كيف أعرف أن البائع جادّ وصادق؟",
    },
    content: {
      en: "We check the seller is reachable on the number given before the listing goes live, and the WhatsApp thread stays between the two of you. Beyond that, judge them as you would at the souq: a seller who will not let you inspect the car, who pushes for a deposit before you have seen it, or whose story keeps changing, is telling you something.",
      ar: "نتأكد أن البائع يمكن الوصول إليه على الرقم المذكور قبل نشر الإعلان، وتبقى محادثة واتساب بينكما وحدكما. وما عدا ذلك، احكم عليه كما تفعل في السوق: البائع الذي يرفض أن تفحص السيارة، أو يلحّ على عربون قبل أن تراها، أو تتغيّر روايته باستمرار — كل هذا يخبرك بشيء.",
    },
  },
  {
    title: {
      en: "A listing looks wrong. What should I do?",
      ar: "إعلان يبدو غير صحيح. ماذا أفعل؟",
    },
    content: {
      en: "Tell us, and stop dealing with that seller until you hear back. Fake listings and bait prices are the reason this site exists, so we would far rather hear about one too many than one too few.",
      ar: "أخبرنا، وتوقّف عن التعامل مع ذلك البائع حتى يصلك ردّنا. فالإعلانات الوهمية وأسعار الطُّعم هي سبب وجود هذا الموقع، ونفضّل كثيراً أن نسمع عن بلاغ زائد على أن يفوتنا بلاغ ناقص.",
    },
  },
];
