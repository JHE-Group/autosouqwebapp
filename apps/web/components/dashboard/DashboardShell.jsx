"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import Header4 from "../headers/Header4";
import Sidebar from "./Sidebar";

/**
 * The frame every dashboard route renders inside.
 *
 * All eight routes used to paste the same six lines of shell markup into their
 * own page.jsx, including a `<div className="dashboard-toggle">Menu</div>` — a
 * div, so it could not be reached by keyboard, carried no state, and told a
 * screen reader nothing about the drawer it opened. Opening was done by a
 * useEffect inside Sidebar that queried the document and added classes by hand,
 * which meant nothing else in the app could know whether the drawer was open.
 *
 * Here the open state is React's, and everything that should close the drawer
 * does: the overlay, the close button, Escape, and — the one the DOM version
 * missed entirely — navigating to another page. A seller who taps "My listings"
 * on a phone should land on the page, not on the menu they just used.
 */
export default function DashboardShell({ children }) {
  // The drawer records the route it was opened on rather than a plain boolean,
  // so "close when the seller navigates" falls out of the render instead of
  // needing an effect that fights the router. Tapping "My listings" on a phone
  // should land on the page, not on the menu that was just used.
  const pathname = usePathname();
  const [openedFor, setOpenedFor] = useState(null);
  const open = openedFor !== null && openedFor === pathname;

  const toggleRef = useRef(null);
  const closeRef = useRef(null);

  const close = useCallback(() => setOpenedFor(null), []);

  // Escape closes, and focus goes back to the control that opened it.
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenedFor(null);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Move focus into the drawer when it opens, so the next Tab is inside it and
  // not somewhere behind the overlay.
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  // Stop the page behind the drawer from scrolling under it.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <Sidebar open={open} onClose={close} closeRef={closeRef} />
      <div id="wrapper-dashboard">
        <div id="pagee" className="clearfix">
          <Header4 />
        </div>
        <div id="themesflat-content" />
        <button
          type="button"
          ref={toggleRef}
          className="dashboard-toggle"
          aria-expanded={open}
          aria-controls="dashboard-sidebar"
          onClick={() => setOpenedFor(pathname)}
        >
          <svg width={22} height={22} viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <path
              d="M3 6h16M3 11h16M3 16h16"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
          Menu
        </button>
        {children}
      </div>
    </>
  );
}
