import React from "react";
import SiteHeader from "./SiteHeader";

/**
 * The header for every public page other than the home page: white surface,
 * indigo/terracotta lockup. See SiteHeader for why the four headers are now
 * one file.
 */
export default function Header2() {
  return <SiteHeader variant="solid" />;
}
