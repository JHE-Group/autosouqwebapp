"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LocaleSwitcher from "@/components/common/LocaleSwitcher";
import Nav from "./Nav";
import MobileNav from "./MobileNav";

/**
 * The site header. One component, three variants.
 *
 * It replaces Header1–Header4, which were four near-identical copies of the
 * same 300-line file: the diff between Header1 and Header2 was the wrapper's
 * class name and which logo colourway was used, and Header3 was not imported
 * anywhere at all. Four copies meant four places to fix every bug — the dead
 * search field, the fabricated topbar and the RTL breakage were all present in
 * each of them, and had drifted apart slightly in each.
 *
 * `Header1`, `Header2` and `Header4` remain as one-line wrappers so no page
 * under app/ has to change; they are the variants, not the implementation.
 *
 *   hero    — sits over the home hero photo. Transparent, cream logo, and it
 *             resolves to the solid treatment once it sticks.
 *   solid   — every other public page. White surface, indigo/terracotta logo.
 *   account — the dashboard shell. Same surface as `solid`, with the account
 *             menu in place of the language + CTA pair.
 *
 * Removed from all of them, deliberately:
 *
 * - **The search field.** It called `preventDefault()` and threw the query
 *   away — no listing route reads a search parameter. A search box that eats
 *   what you type is the single worst control to ship on a site whose whole
 *   proposition is that it is honest. It comes back when browse can filter.
 * - **The favourites heart.** `href="#"`, and there is no account to save a
 *   car to.
 * - **Login / Register.** There is no authentication backend. See the note in
 *   app/[locale]/ClientShell.jsx.
 * - **The topbar.** "Muscat, Sultanate of Oman", "Sat – Thu, 8:00 – 18:00" and
 *   the phone number +968 9000 0000 were all unverified, and the last is
 *   plainly a placeholder. The five social icons all pointed at "#".
 */

const VARIANTS = {
  hero: {
    className: "main-header style2",
    // Two lockups, cross-faded by _header.scss as the header sticks: cream
    // over the hero photo, indigo/terracotta once the surface turns white.
    logo: "/assets/images/brand/logo-horizontal-om-cream-terracotta.svg",
    stickyLogo: "/assets/images/brand/logo-horizontal-om-primary.svg",
  },
  solid: {
    className: "main-header",
    logo: "/assets/images/brand/logo-horizontal-om-primary.svg",
    stickyLogo: null,
  },
  account: {
    className: "main-header",
    logo: "/assets/images/brand/logo-horizontal-om-primary.svg",
    stickyLogo: null,
  },
};

// 566.9 × 196.1 in the artwork = 2.89:1. Anything else squashes the mark; see
// public/assets/images/brand/README.md.
const LOGO_WIDTH = 231;
const LOGO_HEIGHT = 80;

/** The "sell" pictogram on the primary CTA, at both sizes it is used. */
function SellIcon() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2.5 12.5h15M4.6 12.5 6.3 7.9A2 2 0 0 1 8.2 6.6h3.6a2 2 0 0 1 1.9 1.3l1.7 4.6M2.5 12.5V16a1 1 0 0 0 1 1h1.4a1 1 0 0 0 1-1v-1M17.5 12.5V16a1 1 0 0 1-1 1h-1.4a1 1 0 0 1-1-1v-1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.8 14.8h.8M13.4 14.8h.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * The dashboard account menu.
 *
 * The template rendered a photograph of a stranger and the name "Themesflat"
 * here, plus a "Logout" link to "#". With no auth there is no session to show
 * and nothing to log out of, so the identity is gone and what is left is what
 * it actually is: a menu of the dashboard's own pages.
 */
function AccountMenu({ label }) {
  return (
    <div className="header-account-menu">
      <button
        type="button"
        className="box-avatar dropdown-toggle"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <span className="box-avatar__icon" aria-hidden="true">
          <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <path
              d="M10 10a3.1 3.1 0 1 0 0-6.2A3.1 3.1 0 0 0 10 10ZM3.9 16.9a6.1 6.1 0 0 1 12.2 0"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="name">{label}</span>
      </button>
      <div className="dropdown-menu dashboard-menu mt-3">
        <Link className="dropdown-item" href="/dashboard">
          Dashboard
        </Link>
        <Link className="dropdown-item" href="/my-listing">
          My listings
        </Link>
        <Link className="dropdown-item" href="/my-favorite">
          Saved cars
        </Link>
        <Link className="dropdown-item" href="/message">
          Messages
        </Link>
        <Link className="dropdown-item" href="/my-review">
          Reviews
        </Link>
        <Link className="dropdown-item" href="/my-profile">
          Profile
        </Link>
        <Link className="dropdown-item" href="/change-password">
          Change password
        </Link>
      </div>
    </div>
  );
}

export default function SiteHeader({ variant = "solid" }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const panelId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [spacerHeight, setSpacerHeight] = useState(0);
  const lowerRef = useRef(null);

  const { className, logo, stickyLogo } = VARIANTS[variant] ?? VARIANTS.solid;

  // This used to point at /sell-your-car so a cold visitor met the OMR
  // 1,500–6,000 band before the form. That was right when the form said nothing
  // about the band — but the form now opens with it stated in full and checks
  // the price in four states as it is typed, so the safeguard is inside the
  // thing it was guarding.
  //
  // What was left was the site's most prominent button promising "Sell your
  // car" and delivering ~700 words of rules. Supply is the binding constraint
  // (NICHE.md), so the primary action does the thing it says. Anyone who wants
  // the rules first still has "Sell your car" in the nav, which is the same
  // label pointing at the page that explains it.
  /*
   * Both labels come from the catalogue.
   *
   * The signed-in one was the literal "Add listing" — so the largest, most
   * prominent control in the header rendered in Latin on the Arabic site, but
   * only once you signed in. Signed out, the same button correctly read
   * «بيع سيارتك». The one seller who never saw the bug was the one testing it
   * while logged out.
   */
  const cta =
    variant === "account"
      ? { href: "/add-listing", label: t("addListing") }
      : { href: "/add-listing", label: t("sellYourCar") };

  // The offcanvas is driven by a class on <body> because the backdrop, the
  // scroll lock and the close button all live outside this subtree in the
  // stylesheet. React owns the state; the class is the side effect.
  useEffect(() => {
    document.body.classList.toggle("mobile-menu-visible", menuOpen);
    return () => document.body.classList.remove("mobile-menu-visible");
  }, [menuOpen]);

  // Close on navigation, including a back/forward that this component did not
  // initiate. Adjusted during render rather than in an effect: an effect would
  // paint the new page with the panel still over it for one frame, and the
  // React compiler rejects a synchronous setState in an effect body outright.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  // Escape closes it, as every dialog-like overlay should.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  /**
   * Sticky header. One threshold with hysteresis (enter 200 / exit 140).
   * Spacer is React-owned so it never appears as a surprise DOM sibling
   * between server-rendered nodes (that was the browse hydration mismatch).
   */
  useEffect(() => {
    // Only pages that opt into sticky chrome (`.header-fixed` wrapper).
    if (!lowerRef.current?.closest(".header-fixed")) return undefined;

    const ENTER = 200;
    const EXIT = 140;
    let frame = 0;
    let currentlyStuck = false;

    const measure = () => lowerRef.current?.offsetHeight ?? 0;

    const apply = () => {
      frame = 0;
      const y = window.scrollY;
      const next = currentlyStuck ? y > EXIT : y > ENTER;
      if (next === currentlyStuck) return;
      currentlyStuck = next;
      setStuck(next);
      if (next) setSpacerHeight(measure());
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    setSpacerHeight(measure());
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={className}>
      <div
        ref={lowerRef}
        className={`header-lower${stuck ? " is-fixed is-small" : ""}`}
      >
        <div className="container2">
          <div className="row">
            <div className="col-lg-12">
              <div className="inner-container flex justify-space align-center">
                <div className="logo-box flex">
                  <div className="logo">
                    <Link href="/" aria-label="Autosouq.om">
                      <Image
                        className="img-none"
                        src={logo}
                        alt="Autosouq.om"
                        width={LOGO_WIDTH}
                        height={LOGO_HEIGHT}
                        priority
                        // SVG. next/image refuses it unless `dangerouslyAllowSVG`
                        // is set, and that flag is not an option here: Strapi
                        // accepts SVG uploads, so it would turn /_next/image into
                        // a stored-XSS vector. A fixed-size logo gains nothing
                        // from the optimiser in any case.
                        unoptimized
                      />
                      {stickyLogo ? (
                        <Image
                          className="img-is-fixed"
                          src={stickyLogo}
                          alt=""
                          aria-hidden="true"
                          width={LOGO_WIDTH}
                          height={LOGO_HEIGHT}
                          // Not `priority`: this one is cross-faded in only after
                          // the header sticks past 200px of scroll, so it is never
                          // in the first viewport — and its preload was competing
                          // with the LCP hero's.
                          loading="lazy"
                          unoptimized
                        />
                      ) : null}
                    </Link>
                  </div>
                </div>

                <div className="nav-outer flex align-center">
                  <nav
                    className="main-menu show navbar-expand-md"
                    aria-label={t("primary")}
                  >
                    <div className="navbar-collapse collapse clearfix">
                      <ul className="navigation clearfix">
                        <Nav />
                      </ul>
                    </div>
                  </nav>
                </div>

                <div className="header-account flex align-center">
                  {variant === "account" ? (
                    <AccountMenu label={t("account")} />
                  ) : null}
                  <LocaleSwitcher className="header-locale" />
                  <div className="flat-bt-top">
                    <Link className="sc-button" href={cta.href}>
                      <SellIcon />
                      <span>{cta.label}</span>
                    </Link>
                  </div>
                </div>

                <button
                  type="button"
                  className="mobile-nav-toggler mobile-button"
                  aria-expanded={menuOpen}
                  aria-controls={panelId}
                  onClick={() => setMenuOpen(true)}
                >
                  <span className="sr-only-text">{t("openMenu")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="header-lower-after-div"
        hidden={!stuck}
        style={{ height: stuck ? spacerHeight : 0 }}
        aria-hidden="true"
      />

      {/* Offcanvas navigation. Slides from the inline start, so it comes in
          from the left in English and the right in Arabic — see the
          inset-inline-start rules in _header.scss. */}
      <div className="mobile-menu" id={panelId}>
        <div
          className="menu-backdrop"
          onClick={closeMenu}
          role="presentation"
        />
        <nav className="menu-box" aria-label={t("primary")}>
          <div className="nav-logo">
            <Link href="/" aria-label="Autosouq.om" onClick={closeMenu}>
              <Image
                src="/assets/images/brand/logo-horizontal-om-primary.svg"
                alt="Autosouq.om"
                width={LOGO_WIDTH}
                height={LOGO_HEIGHT}
                unoptimized
              />
            </Link>
            <button
              type="button"
              className="close-btn"
              onClick={closeMenu}
              aria-label={t("closeMenu")}
            >
              <span aria-hidden="true" />
            </button>
          </div>

          <div className="bottom-canvas">
            {/* The language toggle is the first control in the panel, not the
                last. The default locale is Arabic and roughly a quarter of the
                country reads English first, so for a large share of visitors
                switching language is the very first thing they need — and
                below 576px there is no room for the pill in the bar itself
                without crowding the logo off a 360px screen. */}
            <div className="mobile-menu-locale">
              <LocaleSwitcher className="locale-switcher--block" />
            </div>

            <MobileNav onNavigate={closeMenu} />

            <div className="mobile-menu-cta">
              <Link
                className="sc-button btn-icon center"
                href={cta.href}
                onClick={closeMenu}
              >
                <SellIcon />
                <span>{cta.label}</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
