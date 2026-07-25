"use client";
import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import BackToTop from "@/components/common/BacktoTop";

/**
 * The Login and SignUp modals used to be mounted here, on every route.
 *
 * They are gone, and no fake replacement was built, because there is no
 * authentication backend. Both were fully styled forms that took a name, an
 * email and a password, called `preventDefault()` on submit and discarded
 * everything — plus "or login with" Google and Facebook buttons pointing at
 * "#". NICHE.md's entire proposition is that Autosouq is the trustworthy end
 * of a market full of scams; a password field that silently eats the password
 * is precisely the behaviour a phishing page has, and asking someone to type a
 * password they reuse elsewhere into a form that does nothing with it is a
 * real harm, not a cosmetic one. They also cost every visitor two decorative
 * photographs and the Font Awesome face used to draw their close buttons.
 *
 * They come back when there is a session to create. Restore them from git
 * history (components/modals/) at that point rather than rebuilding.
 */

// Everything in the root layout that needs the browser lives here, so that
// app/layout.js can stay a server component and export `metadata` / `viewport`.
export default function ClientShell({ children }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Import the script only on the client side
      import("bootstrap/dist/js/bootstrap.esm").then(() => {
        // Module is imported, you can access any exported functionality if
      });
    }
  }, []);
  const pathname = usePathname();
  /**
   * Sticky header.
   *
   * This used to have two thresholds: `is-fixed` at 200px and `is-small` at
   * 300px. The stylesheet parked `is-fixed` at `top: -150px; opacity: 0`, so
   * between 200 and 300 the header was fixed, off-screen and transparent while
   * its placeholder held the space open — the header simply vanished for 100px
   * of scrolling and then snapped back in. One threshold now, with 60px of
   * hysteresis so a header that lands exactly on the boundary doesn't flicker
   * when the page moves by a pixel.
   *
   * Reads are batched into a rAF and the listener is passive, which on the
   * budget Android devices NICHE.md describes is the difference between smooth
   * scrolling and a janky one — the old handler ran a `querySelector` sweep on
   * every scroll event.
   */
  useEffect(() => {
    if (!document.querySelector(".header-fixed")) return undefined;

    const nav = document.querySelector(".header-lower");
    if (!nav) return undefined;

    // Holds the space the header vacates when it goes fixed. Created per
    // mount and removed on cleanup — the previous version appended a fresh one
    // on every navigation and never took any of them away.
    const spacer = document.createElement("div");
    spacer.className = "header-lower-after-div";
    spacer.style.height = `${nav.offsetHeight}px`;
    spacer.hidden = true;
    nav.after(spacer);

    const ENTER = 200;
    const EXIT = 140;
    let stuck = false;
    let frame = 0;

    const apply = () => {
      frame = 0;
      const y = window.scrollY;
      const next = stuck ? y > EXIT : y > ENTER;
      if (next === stuck) return;
      stuck = next;
      // `is-small` is kept in sync purely so any stylesheet still keyed on it
      // agrees with `is-fixed`; nothing in _header.scss reads it any more.
      nav.classList.toggle("is-fixed", stuck);
      nav.classList.toggle("is-small", stuck);
      spacer.hidden = !stuck;
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      spacer.remove();
      nav.classList.remove("is-fixed", "is-small");
    };
  }, [pathname]);
  // wowjs removed: it was configured `mobile: false`, and its own `disabled()`
  // returns true for any mobile UA — so on the budget Android devices NICHE.md
  // describes it downloaded ~11 KB gz plus 37 KB of animate.css and did nothing.
  // The `wow fadeInUp*` classes left in the markup are inert and harmless.
  return (
    <>
      <div id="wrapper">
        <div id="pagee" className="clearfix">
          {children}
        </div>
      </div>
      <BackToTop />
    </>
  );
}
