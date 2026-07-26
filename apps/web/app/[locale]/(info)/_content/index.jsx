import React from "react";
import HowItWorksEn from "./HowItWorks.en";
import HowItWorksAr from "./HowItWorks.ar";
import SellYourCarEn from "./SellYourCar.en";
import SellYourCarAr from "./SellYourCar.ar";
import TermsEn from "./Terms.en";
import TermsAr from "./Terms.ar";
import PrivacyEn from "./Privacy.en";
import PrivacyAr from "./Privacy.ar";

/**
 * Per-locale bodies for the information pages.
 *
 * Why these are components and not message entries
 * ------------------------------------------------
 * The rest of the UI goes through next-intl, and should. These four pages do
 * not, because they are 750–1,400 words of structured prose each: headings,
 * bullet lists, inline links to five other routes, and `<strong>` runs inside
 * sentences. Expressed as ICU messages that becomes either one unreadable
 * string per paragraph with `t.rich` tag callbacks threaded through it, or a
 * hundred fragment keys that no translator can order correctly.
 *
 * As JSX per locale, an Arabic writer edits Arabic sentences in their natural
 * order and the structure is visible while they do it. This is the same split
 * the codebase already makes for guides and blog posts, where the registry is
 * data and the body is a component (components/guides/posts, components/blog/posts).
 *
 * The trade-off is that en/ar parity is not machine-checkable here the way a
 * key diff is. That is accepted deliberately: parity of *structure* is what
 * matters on a prose page, and a missing paragraph is visible on the page in a
 * way a missing key is not.
 *
 * A switch, not an object lookup — same reason as components/blog/posts/index.jsx:
 * a looked-up component type reads as created-in-render to the lint rule.
 */
export function InfoBody({ page, locale }) {
  const ar = locale === "ar";
  switch (page) {
    case "how-it-works":
      return ar ? <HowItWorksAr /> : <HowItWorksEn />;
    case "sell-your-car":
      return ar ? <SellYourCarAr /> : <SellYourCarEn />;
    case "terms":
      return ar ? <TermsAr /> : <TermsEn />;
    case "privacy":
      return ar ? <PrivacyAr /> : <PrivacyEn />;
    default:
      return null;
  }
}
