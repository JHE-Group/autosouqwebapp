import { Link } from "@/i18n/navigation";

/**
 * The four promises from NICHE.md, given the weight of a proposition rather
 * than the weight of a template feature row.
 *
 * Replaces `Process.jsx`, which was wrong in three ways at once:
 *
 * - It rendered all four promises **twice** — once inside a Swiper for
 *   <=1200px and once as a static grid for >1200px, with `style.scss` hiding
 *   whichever was not in use. Every visitor downloaded both copies, including
 *   eight ~3 KB inline SVG paths they would never see, and Swiper was pulled in
 *   to lay out four boxes that fit a grid.
 * - Three of the four linked to `/faq`, which does not answer them.
 *   `/how-it-works` publishes the actual check list, the spec labels and the
 *   price band, so that is where all four now go — a badge whose definition is
 *   one tap away is the difference between our verification and OpenSooq's.
 * - It sat fourth on the page, below two listing grids. With ~10 listings the
 *   proposition has to arrive before the inventory does, because the
 *   proposition is the part that is already at full strength.
 *
 * Colour: cream #F1E4C5 band — the one brand surface the site was not using,
 * and a deliberate light break after the dark hero. Ink on cream is 12.93:1,
 * $color-7 body on cream is 4.84:1, and the numerals are ink on a terracotta
 * chip at 5.50:1 (white on terracotta is 2.97:1 and is never used).
 */

const PROMISES = [
  {
    title: "Real prices",
    body: "The number on the card is the price the seller is asking, in OMR. No bait figures, no “price on request”.",
  },
  {
    title: "Verified listings",
    body: "We check a listing before it goes live, and we publish exactly what that check covers. If we have not checked it, the card says so.",
  },
  {
    title: "GCC spec or import, stated",
    body: "Every car says whether it is GCC spec, a US import or a Japan import — and says so plainly when the seller has not told us.",
  },
  {
    title: "One WhatsApp tap",
    body: "Message the seller straight from the listing. The car and its listed price are already written into the message.",
  },
];

export default function TrustPromises() {
  return (
    <section className="hp-band hp-band--cream hp-promises">
      <div className="container">
        <div className="hp-promises__head">
          <h2 className="hp-section-title">What Autosouq promises</h2>
          <p className="hp-section-lede">
            Four things, on every car. They are the reason this site exists, and
            you can hold any listing to all four.
          </p>
        </div>

        <ol className="hp-promises__list">
          {PROMISES.map((promise, i) => (
            <li key={promise.title} className="hp-promise">
              <span className="hp-promise__num" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="hp-promise__title">{promise.title}</h3>
              <p className="hp-promise__body">{promise.body}</p>
            </li>
          ))}
        </ol>

        <p className="hp-promises__foot">
          <Link href="/how-it-works" className="hp-link">
            How we check a listing
          </Link>
        </p>
      </div>
    </section>
  );
}
