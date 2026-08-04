"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

/**
 * The map, not loaded until someone asks for it.
 *
 * The embed was an `<iframe loading="lazy">`, which sounds like it defers and
 * measurably does not. Instrumented on /ar/car/… at 390×844 with zero scroll
 * and no interaction: **469 KB from maps.googleapis.com and maps.gstatic.com,
 * against 172 KB for the entire rest of the site** — HTML, JS, CSS, fonts and
 * logos combined. Nearly three quarters of the page's first load was a map
 * nobody had scrolled to. `loading="lazy"` is a hint, and Chrome loads an
 * iframe anyway when the document is short enough that it falls inside the
 * viewport-distance threshold.
 *
 * On a metered Omani mobile connection that is the single most expensive thing
 * on the page, spent before the buyer has seen the price.
 *
 * So: a facade. The address and a link are what most people actually want —
 * "where is this car" is usually answered by the district name — and the
 * interactive map arrives on tap for the few who want to pan around it. The
 * link out to Google Maps is a plain anchor, so it works whether or not the
 * embed is ever mounted, and on a phone it opens the Maps app.
 *
 * Once mounted the iframe stays mounted; there is no unload path, because
 * someone who opened the map is not helped by it disappearing.
 */
export default function MapFacade({ latitude, longitude, address }) {
  const t = useTranslations("listing.section");
  const [shown, setShown] = useState(false);

  if (latitude == null || longitude == null) return null;

  const coords = `${latitude},${longitude}`;

  if (shown) {
    return (
      <iframe
        className="map-content"
        title={t("map")}
        src={`https://www.google.com/maps?q=${coords}&z=14&output=embed`}
        allowFullScreen=""
      />
    );
  }

  return (
    <div className="asq-map-facade">
      <p className="asq-map-facade__where">{address ?? coords}</p>
      <div className="asq-map-facade__actions">
        <button
          type="button"
          className="second-btn asq-map-facade__load"
          onClick={() => setShown(true)}
        >
          {t("showMap")}
        </button>
        {/*
          A real link, not a second button. It survives the embed never being
          loaded, it is the thing a phone hands to the Maps app, and it is what
          a buyer wants when the answer to "where" is "give me directions".
        */}
        <a
          className="asq-map-facade__out"
          href={`https://maps.google.com/?q=${coords}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("openInMaps")}
        </a>
      </div>
    </div>
  );
}
