import React from "react";
import SiteHeader from "./SiteHeader";

/**
 * The home page header: transparent, sitting over the hero photo, resolving to
 * the solid white treatment once it sticks. See SiteHeader for why the four
 * headers are now one file.
 */
export default function Header1() {
  return <SiteHeader variant="hero" />;
}
