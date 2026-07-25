import React from "react";

/**
 * Listing description.
 *
 * The theme hardcoded two paragraphs of lorem ipsum here and never looked at
 * the listing, plus a "Download brochure" link to nowhere — private sellers
 * don't have brochures. Sellers write real copy in the CMS ("صبغ وكالة",
 * "شرط الفحص"); show that, or show nothing.
 */
export default function Description({ carItem }) {
  const text = carItem?.description?.trim();

  if (!text) return null;

  return (
    <div className="tfcl-listing-info mt-30">
      {text.split(/\n{2,}/).map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  );
}
