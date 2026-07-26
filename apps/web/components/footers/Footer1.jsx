"use client";

import React, { useId, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { footerData } from "@/data/footerLinks";
import LocaleSwitcher from "@/components/common/LocaleSwitcher";

/**
 * Site footer.
 *
 * Three things were wrong with the one this replaces.
 *
 * 1. **The four-box strip at the top was invented.** "Top 1 Americas /
 *    Largest Auto portal" is false twice over for a marketplace that only
 *    operates in Oman; "Car Sold / Every 5 minute" is a traffic statistic
 *    nobody has measured, on a site with no listings live yet; "Offers / Stay
 *    updated pay less" describes a discount programme that does not exist.
 *    All of it is gone. What is in its place is not a replacement claim — it
 *    is the four promises the business actually makes, stated in NICHE.md and
 *    already used verbatim in the browse page's meta description. They are
 *    commitments about how the site works, not assertions about the world.
 *
 * 2. **The newsletter took email addresses nowhere.** It posted through
 *    EmailJS using three `NEXT_PUBLIC_EMAILJS_*` variables that are present
 *    but empty in .env.local, so every submission rejected into a `catch` that
 *    logged to the console — and the success banner was initialised to `true`,
 *    so the only outcome the component could ever render was "You have
 *    successfully subscribed." Collecting an email address and dropping it is
 *    worse than not asking. NICHE.md's channel is WhatsApp, not a mailing
 *    list, so it is removed rather than repaired. (EmailJS is still a real
 *    dependency — components/otherPages/Contact.jsx uses it.)
 *
 * 3. **The link columns were invisible on phones.** responsive.scss hides
 *    `.tf-collapse-content` outright below 576px and the accordion only ever
 *    set `height`, never `display` — so on the budget Android screens this
 *    site is built for, the footer was four headings and nothing else. The
 *    accordion is React state now and _footer.scss restores the open state.
 *
 * Also gone: five social icons all pointing at "#". We have no verified
 * accounts to link to; empty social links on a trust-led marketplace read as
 * either broken or abandoned.
 */

/**
 * The promises, in the site's own words.
 *
 * Deliberately phrased as rules we hold ourselves to — "nothing above OMR
 * 6,000 is listed" is a description of the product, checkable by anyone who
 * looks at the listings. Nothing here claims a ranking, a volume or an award.
 *
 * Only the icon geometry lives here now. The words come from the `footer`
 * namespace so the strip reads in the page's language instead of rendering
 * English inside dir="rtl".
 */
const PROMISES = [
  {
    id: "band",
    icon: (
      <>
        <path
          d="M12 3.5v17M8 7.5h5.6a2.6 2.6 0 0 1 0 5.2h-3.2a2.6 2.6 0 0 0 0 5.2H16"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  {
    id: "price",
    icon: (
      <>
        <path
          d="M3.5 12.5 11 5h8v8l-7.5 7.5a1.6 1.6 0 0 1-2.3 0l-5.7-5.7a1.6 1.6 0 0 1 0-2.3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="15.2" cy="8.8" r="1.4" fill="currentColor" />
      </>
    ),
  },
  {
    id: "spec",
    icon: (
      <>
        <path
          d="M12 3.2 4.8 6v6c0 4.3 3 7.6 7.2 8.8 4.2-1.2 7.2-4.5 7.2-8.8V6L12 3.2Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="m9 12 2.2 2.2L15.4 10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  {
    id: "whatsapp",
    icon: (
      <>
        <path
          d="M20.2 11.7a8.2 8.2 0 0 1-12.1 7.2L3.8 20.2l1.3-4.3A8.2 8.2 0 1 1 20.2 11.7Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
];

function FooterColumn({ headingKey, menuItems }) {
  const t = useTranslations("footer");
  const panelId = useId();
  const [open, setOpen] = useState(false);

  return (
    <div className={`widget widget-menu footer-col-block ${open ? "open" : ""}`}>
      <div className="footer-heading-desktop">
        <h4>{t(headingKey)}</h4>
      </div>
      {/* Same class names the ≤575px rules in responsive.scss key on, so the
          collapsed layout there keeps working — but a real button, so it is
          reachable by keyboard and announces its state. */}
      <h4 className="footer-heading-mobie">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          {t(headingKey)}
        </button>
      </h4>
      <ul id={panelId} className="box-menu tf-collapse-content">
        {menuItems.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>{t(item.textKey)}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer1({ columns = footerData }) {
  const t = useTranslations("footer");

  return (
    <footer id="footer" className="clearfix home">
      <div className="container">
        <div className="footer-promise">
          <ul>
            {PROMISES.map((promise) => (
              <li key={promise.id}>
                <span className="footer-promise__icon" aria-hidden="true">
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    {promise.icon}
                  </svg>
                </span>
                <span className="footer-promise__body">
                  <span className="footer-promise__title">
                    {t(`promise.${promise.id}Title`)}
                  </span>
                  <span className="footer-promise__text">
                    {t(`promise.${promise.id}Text`)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-main">
          <div className="row">
            {/* Four link columns + brand: brand takes 4, each menu column 2. */}
            <div className="col-lg-4 col-12">
              <div className="footer-brand">
                <Link href="/" aria-label="Autosouq.om">
                  <Image
                    src="/assets/images/brand/logo-horizontal-om-cream-terracotta.svg"
                    alt="Autosouq.om"
                    width={231}
                    height={80}
                  />
                </Link>
                <p>{t("tagline")}</p>
                <LocaleSwitcher />
              </div>
            </div>
            {columns.map((column) => (
              <div className="col-lg-2 col-sm-6 col-12" key={column.id}>
                <FooterColumn
                  headingKey={column.headingKey}
                  menuItems={column.menuItems}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          {/* Hardcoded: this is a client component, so a computed year would be
              baked in at prerender and could disagree with the client's clock
              on hydration. Bump it each January. */}
          <p className="title-bottom">{t("copyright")}</p>
          {/* The only other thing said here is a fact about the site itself.
              No address, no opening hours, no phone number and no social
              accounts: none of those are verified, and inventing them is
              exactly the failure mode this footer is being cleaned up from. */}
          <p className="title-bottom">{t("currencyNote")}</p>
        </div>
      </div>
    </footer>
  );
}
