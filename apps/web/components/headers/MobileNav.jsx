"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { buildNavTree, isBranchCurrent, isCurrent } from "./navItems";

/**
 * Offcanvas navigation.
 *
 * The template version measured `scrollHeight`, wrote inline `height` and
 * `padding` onto the `<ul>`, and toggled a class — so the open state lived in
 * the DOM, could not be read back, and was announced to a screen reader as an
 * unlabelled `<div>`. React owns it now, and the control is a real `<button>`
 * carrying `aria-expanded` and `aria-controls`.
 *
 * Sizing is set for a 360px budget Android screen (see NICHE.md): top-level
 * rows are 52px tall, submenu rows 48px, and the disclosure arrow is its own
 * 48×48 target beside the link rather than an invisible overlay covering the
 * whole row — the template's `.dropdown2-btn` was `width: 100%` and sat on top
 * of the link, so tapping "Browse" expanded it instead of going there.
 */
export default function MobileNav({ onNavigate }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const items = buildNavTree(t);

  // The branch containing the current page is open by default, so the panel
  // opens showing where you are rather than fully collapsed. `override` is
  // what the visitor has since chosen: null means "still following the page",
  // "" means they closed everything. Derived rather than held in an effect, so
  // it stays correct across a back/forward navigation.
  const [override, setOverride] = useState(null);
  const currentBranch =
    items.find((item) => item.children && isBranchCurrent(item, pathname))
      ?.href ?? "";
  const openHref = override === null ? currentBranch : override;

  return (
    <div className="menu-outer">
      <ul className="navigation">
        {items.map((item) => {
          const hasChildren = Boolean(item.children?.length);
          const open = openHref === item.href;
          const panelId = `mobile-nav-${item.href.replace(/\W+/g, "-")}`;

          return (
            <li
              key={item.href}
              className={`${hasChildren ? "dropdown2" : ""} ${
                open ? "open" : ""
              } ${isBranchCurrent(item, pathname) ? "current" : ""}`.trim()}
            >
              <div className="mobile-nav-row">
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={
                    isCurrent(item.href, pathname) ? "page" : undefined
                  }
                >
                  {item.label}
                </Link>

                {hasChildren ? (
                  <button
                    type="button"
                    className="dropdown2-btn"
                    aria-expanded={open}
                    aria-controls={panelId}
                    aria-label={t(open ? "collapseSection" : "expandSection", {
                      section: item.label,
                    })}
                    onClick={() => setOverride(open ? "" : item.href)}
                  />
                ) : null}
              </div>

              {hasChildren ? (
                <ul id={panelId} hidden={!open}>
                  {item.children.map((child) => (
                    <li
                      key={child.href}
                      className={
                        isCurrent(child.href, pathname) ? "current" : ""
                      }
                    >
                      <Link
                        href={child.href}
                        onClick={onNavigate}
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
      </ul>
    </div>
  );
}
