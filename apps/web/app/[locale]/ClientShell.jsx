"use client";
import { useEffect } from "react";
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

  // Sticky header lives in SiteHeader as React-managed markup. Imperatively
  // splicing a spacer beside React siblings (header-lower / mobile-menu, or
  // header-fixed / tf-banner) caused hydration mismatches on browse.
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
