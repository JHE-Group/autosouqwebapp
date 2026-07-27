"use client";
import { toggleItems } from "@/data/faqs";
import { useId, useState } from "react";

/**
 * A disclosure list, built from real buttons.
 *
 * What was here before could not be operated by keyboard at all. The header
 * carried `role="button"` with no `tabIndex` — so it was never in the tab order
 * — no `onKeyDown`, no `aria-expanded` and no `aria-controls`, and the click
 * handler sat on the wrapping `<div>` rather than on the thing claiming to be a
 * button. This renders /faq and /ar/faq, three accordions and seventeen
 * questions, so the entire FAQ was mouse-only. WCAG 2.1.1 and 4.1.2, Level A.
 *
 * Collapsing was also done by writing `height: 0; overflow: hidden` onto the
 * panel from an effect. That hides a panel visually but leaves it in the
 * accessibility tree and in the tab order, so a screen reader announced every
 * answer regardless of state and any link inside a closed answer was still
 * tabbable. The `hidden` attribute does the whole job — visually, for assistive
 * tech, and for focus — and it keeps the text in the HTML source, so it is
 * still there for a crawler.
 *
 * The heading is an `<h3>` wrapping the button: the page is `h1` → `h2` →
 * accordion, and the old `<h5>` skipped two levels. A heading cannot go inside
 * a `<button>` (buttons take phrasing content only), so the button goes inside
 * the heading, which is the standard disclosure pattern.
 */
export default function Accordion({
  faqData = toggleItems,
  parentClass = "flat-toggle style-2",
}) {
  // Index of the open item, or -1 for all closed. First item starts open, as
  // it did before.
  const [openIndex, setOpenIndex] = useState(0);
  const baseId = useId();

  return (
    <>
      {faqData.map((item, index) => {
        const open = openIndex === index;
        const buttonId = `${baseId}-q${index}`;
        const panelId = `${baseId}-a${index}`;

        return (
          <div
            className={`${open ? "activ" : ""} ${parentClass} `}
            key={item.title ?? index}
          >
            <h3 className="toggle-title__heading">
              <button
                type="button"
                id={buttonId}
                className={`toggle-title flex align-center${open ? " active" : ""}`}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? -1 : index)}
              >
                <span className="toggle-title__text fw-6">{item.title}</span>
                {/* Decorative: the +/- marker duplicates what aria-expanded
                    already says, so it must not be announced twice. */}
                <span className="btn-toggle" aria-hidden="true" />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="toggle-content section-desc"
              hidden={!open}
            >
              <p className="texts">{item.content}</p>
            </div>
          </div>
        );
      })}
    </>
  );
}
