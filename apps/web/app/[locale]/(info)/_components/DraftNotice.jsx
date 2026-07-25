import { Link } from "@/i18n/navigation";
import React from "react";

/**
 * Draft-status banner for the two legal pages.
 *
 * These texts were written by a non-lawyer to describe honestly what the
 * service does. They are NOT legal advice and are NOT in force. This banner
 * sits directly under the h1 and must stay there until counsel has reviewed
 * and signed off the wording — deleting it is a launch-blocking change.
 *
 * bg-1 is the existing terracotta 6% tint token; body text on it is ink
 * (white on terracotta is 2.97:1 and fails AA — see _variables.scss).
 */
export default function DraftNotice() {
  return (
    <div className="bg-1 border rounded-3 p-4 mb-40" role="note">
      <p className="fs-16 fw-7 text-color-2 mb-2">
        Draft — pending legal review. Not yet in force.
      </p>
      <p className="font-2 fs-14 lh-24 mb-0">
        This page is a plain-language draft describing how Autosouq.om actually
        works. It has not been checked by a qualified lawyer, it has not been
        approved, and it does not yet form an agreement between you and us. It
        must be reviewed by counsel before launch. Please do not rely on it, and
        tell us via{" "}
        <Link className="fw-6" href="/contact">
          contact us
        </Link>{" "}
        if anything on it looks wrong.
      </p>
    </div>
  );
}
