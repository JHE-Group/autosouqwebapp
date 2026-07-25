import React from "react";

/**
 * Features the seller actually declared.
 *
 * The theme hardcoded 14 features onto every listing — claiming airbags, a
 * touchscreen and climate control for cars that may have none of them — and
 * then rendered FAQ lorem ipsum underneath in an accordion labelled as
 * features. Both are claims about someone else's car that we cannot support,
 * so this now renders the CMS list or nothing at all.
 */
export default function Features({ carItem }) {
  const features = Array.isArray(carItem?.features) ? carItem.features : [];

  if (!features.length) return null;

  return (
    <div className="features-inner tf-collapse-content">
      <div className="inner">
        {features.map((feature, i) => (
          <div className="listing-feature-wrap flex" key={i}>
            <i className="icon-autodeal-check" aria-hidden="true" />
            <p>{feature}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
