import React from "react";

/**
 * Prose primitives for the guides.
 *
 * These exist for one reason: the guides are long, and repeating
 * `className="font-2 fs-16 lh-26 mb-30"` on four hundred paragraphs makes the
 * copy unreadable in source, which makes it harder to keep the copy honest.
 * They carry the same utility classes the information pages already use
 * (app/(info)/_components), so guides sit inside the site's type scale rather
 * than beside it.
 *
 * No colour, no new design tokens, no client-side JavaScript. The audience is
 * on budget Android handsets over metered data (NICHE.md); these are pages of
 * text and they should weigh what text weighs.
 */

/** Body paragraph. */
export function P({ children, className = "mb-30" }) {
  return <p className={`font-2 fs-16 lh-26 ${className}`}>{children}</p>;
}

/** Section heading. One h1 per page lives in GuideShell, so this starts at h2. */
export function H2({ id, children }) {
  return (
    <h2 id={id} className="mb-20">
      {children}
    </h2>
  );
}

/** Sub-heading inside a section. */
export function H3({ children }) {
  return <h3 className="fs-18 mb-2">{children}</h3>;
}

/**
 * The global reset in public/assets/scss/style.scss strips list-style from
 * every ul/li and bootstrap.css is imported above it, so bullets have to be
 * restored on the element. Same approach and same reasoning as
 * app/(info)/_components/BulletList — the SCSS is owned elsewhere this sprint.
 */
const BULLETS = { listStyle: "disc", paddingLeft: "1.25rem" };
const NUMBERS = { listStyle: "decimal", paddingLeft: "1.25rem" };

function Items({ items }) {
  return items.map((item, index) => (
    <li
      key={index}
      className="font-2 fs-16 lh-26 mb-2"
      style={{ display: "list-item" }}
    >
      {item}
    </li>
  ));
}

/** Bulleted list. */
export function UL({ items, className = "mb-30" }) {
  return (
    <ul className={className} style={BULLETS}>
      <Items items={items} />
    </ul>
  );
}

/** Numbered list, for anything that is genuinely a sequence of steps. */
export function OL({ items, className = "mb-30" }) {
  return (
    <ol className={className} style={NUMBERS}>
      <Items items={items} />
    </ol>
  );
}

/**
 * A boxed aside. Used for two things only, and both are trust furniture rather
 * than decoration: the "here is a number we are not going to print" notes, and
 * the sourcing notes. `bg-1` is the existing terracotta 6% tint; body text on it
 * is ink, because white on terracotta fails AA (see _variables.scss).
 */
export function Callout({ title, children }) {
  return (
    <div className="bg-1 border rounded-3 p-4 mb-40" role="note">
      {title ? (
        <p className="fs-16 fw-7 text-color-2 mb-2">{title}</p>
      ) : null}
      {children}
    </div>
  );
}

/**
 * An external source link. Guides cite official pages and named journalism, and
 * nothing else — if a claim about ROP procedure, customs, insurance or fees has
 * no link under it, it does not go on the page.
 *
 * `rel="nofollow"` is deliberately *not* set: these are editorial citations of
 * pages we want to endorse.
 */
export function Source({ href, children }) {
  return (
    <a
      className="fw-6"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

/**
 * The list of sources at the foot of a guide.
 *
 * `title` is a prop rather than a lookup because Prose is imported by both the
 * English and the Arabic bodies, and those are plain components with no
 * next-intl scope of their own. The Arabic bodies pass "المصادر".
 *
 * The `label`s themselves stay in the language of the page being cited — an
 * ROP page titled "Vehicle Ownership Transfer" is findable under that name,
 * and translating a link text into Arabic would send a reader looking for a
 * page that does not exist under that title.
 */
export function Sources({ items, title = "Sources" }) {
  return (
    <>
      <H2 id="sources">{title}</H2>
      <ul className="mb-0" style={BULLETS}>
        {items.map((item, index) => (
          <li
            key={index}
            className="font-2 fs-14 lh-24 mb-2"
            style={{ display: "list-item" }}
          >
            <Source href={item.href}>{item.label}</Source>
            {item.note ? ` — ${item.note}` : null}
          </li>
        ))}
      </ul>
    </>
  );
}
