import React from "react";

/**
 * The global reset in public/assets/scss/style.scss strips list-style from
 * every ul/li, and bootstrap.css is @imported above it so it cannot win it
 * back. Prose pages genuinely need bullets, so they are restored here on the
 * element rather than by adding a rule to the SCSS (owned elsewhere this
 * sprint). Layout only — no colour, no new tokens.
 */
const LIST_STYLE = { listStyle: "disc", paddingLeft: "1.25rem" };

export default function BulletList({ items, className = "mb-30" }) {
  return (
    <ul className={className} style={LIST_STYLE}>
      {items.map((item, index) => (
        <li
          key={index}
          className="font-2 fs-16 lh-26 mb-2"
          style={{ display: "list-item" }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
