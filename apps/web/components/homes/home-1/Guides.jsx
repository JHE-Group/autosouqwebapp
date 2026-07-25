import { Link } from "@/i18n/navigation";
import { guidePath, guidesInOrder } from "@/data/guides";

/**
 * Three of the buying guides, on the home page.
 *
 * This replaces two template sections that could not survive contact with the
 * real business — a "brands we work with" logo carousel built from
 * `data/categories.js`, where every entry carried an invented "271 Car" count
 * and a dead `href="#"`, and a body-type carousel whose every tile was also
 * `href="#"`. Both were catalogue navigation for a catalogue that does not yet
 * need subdividing: at ~10 listings, splitting the inventory six ways puts one
 * or two cars behind each door.
 *
 * The guides are the opposite kind of section. They are real, already written,
 * already fact-checked against the ROP's own pages, and they do not get thinner
 * as the catalogue gets thinner — a first-time buyer needs "how do I know this
 * is GCC spec" whether we have ten cars or a thousand. They are also the brand
 * voice as a section rather than as a claim: the knowledgeable friend telling
 * you what to watch for, not a dealership telling you it is trustworthy.
 *
 * Text-only by design: no images, no carousel, no client JavaScript. On a
 * metered connection this section costs a few hundred bytes.
 */
export default function Guides({ limit = 3 }) {
  const shown = guidesInOrder.slice(0, limit);
  if (shown.length === 0) return null;

  return (
    <section className="hp-section hp-guides">
      <div className="container">
        <div className="hp-section-head">
          <div>
            <h2 className="hp-section-title">Before you buy</h2>
            <p className="hp-section-lede">
              The things that go wrong when you buy a used car in Oman, and how
              to stop each one — written for a first car, not for a collector.
            </p>
          </div>
          <Link href="/guides" className="hp-link hp-link--btn">
            All guides
          </Link>
        </div>

        <ul className="hp-guides__list">
          {shown.map((guide) => (
            <li key={guide.slug} className="hp-guide">
              <h3 className="hp-guide__title">
                <Link href={guidePath(guide.slug)}>{guide.title}</Link>
              </h3>
              <p className="hp-guide__summary">{guide.summary}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
