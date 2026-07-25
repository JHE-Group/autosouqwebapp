"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { buildNavTree, isBranchCurrent, isCurrent } from "./navItems";

/**
 * Desktop navigation.
 *
 * What this replaces: the template's three-dropdown demo index — "Home" (whose
 * list was empty once the ten demo home pages were deleted, so it rendered a
 * labelled chevron opening onto nothing), "Listing Car" as a 750px-wide mega
 * menu holding three links, and "Page" holding the entire real site, with
 * "Contact" repeated both inside it and beside it.
 *
 * Now it renders the actual information architecture, flat: Browse (with the
 * alternate views under it), Sell your car, Guides, About, FAQs, Contact.
 *
 * Accessibility notes:
 *
 * - Every item is a real `Link`. The template's parents were `href="#"`, which
 *   scrolls to the top and cannot be reached by keyboard as a menu at all.
 * - The submenu opens on `:focus-within` as well as `:hover` (see
 *   _header.scss), so tabbing through Browse reveals its children.
 * - `aria-current="page"` marks the current item, which is what a screen
 *   reader announces; the `.current` class is only the colour.
 */
export default function Nav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const items = buildNavTree(t);

  return (
    <>
      {items.map((item) => {
        const active = isBranchCurrent(item, pathname);
        const hasChildren = Boolean(item.children?.length);

        return (
          <li
            key={item.href}
            className={`${hasChildren ? "dropdown2" : ""} ${
              active ? "current" : ""
            }`.trim()}
          >
            <Link
              href={item.href}
              aria-current={isCurrent(item.href, pathname) ? "page" : undefined}
            >
              {item.label}
            </Link>

            {hasChildren ? (
              <ul>
                {item.children.map((child) => (
                  <li
                    key={child.href}
                    className={isCurrent(child.href, pathname) ? "current" : ""}
                  >
                    <Link
                      href={child.href}
                      aria-current={
                        isCurrent(child.href, pathname) ? "page" : undefined
                      }
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        );
      })}
    </>
  );
}
