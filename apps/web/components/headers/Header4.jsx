import React from "react";
import SiteHeader from "./SiteHeader";

/**
 * The dashboard header: the account menu replaces the language + CTA pair, and
 * the CTA shortcuts straight to /add-listing. See SiteHeader for why the four
 * headers are now one file, and for why the template's fabricated "Themesflat"
 * user and its photograph are gone.
 */
export default function Header4() {
  return <SiteHeader variant="account" />;
}
