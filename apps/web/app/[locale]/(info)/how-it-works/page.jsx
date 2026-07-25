import { Link } from "@/i18n/navigation";
import React from "react";
import BulletList from "../_components/BulletList";
import InfoShell from "../_components/InfoShell";

export const metadata = {
  title: "How it works",
  description:
    "How buying and selling an affordable used car on Autosouq.om works in Oman: browse OMR 1,500–6,000 listings, check the GCC-spec or import disclosure, then one WhatsApp tap to the seller.",
};

export default function page() {
  return (
    <InfoShell breadcrumb="How it works">
      <h1 className="mb-20">How Autosouq works</h1>
      <p className="font-2 fs-18 lh-28 mb-40">
        Autosouq.om is a marketplace for affordable used cars in Oman, priced
        between OMR 1,500 and 6,000. We put buyers and sellers in touch and we
        are honest about what we know. We are not the seller, and we are not in
        the middle of the deal. This page explains exactly what happens.
      </p>

      <h2 className="mb-20">If you are buying</h2>

      <h3 className="fs-18 mb-2">1. Browse cars in your budget</h3>
      <p className="font-2 fs-16 lh-26 mb-30">
        Every car on the site is inside the band. Nothing above OMR 6,000 is
        ever listed, so you are not scrolling past cars you were never going to
        buy. Start with{" "}
        <Link className="fw-6" href="/listing-grid">
          used cars in Oman
        </Link>{" "}
        or find what is close to you on the{" "}
        <Link className="fw-6" href="/listing-grid-map">
          map view
        </Link>
        .
      </p>

      <h3 className="fs-18 mb-2">2. Read the price and the spec disclosure</h3>
      <p className="font-2 fs-16 lh-26 mb-20">
        The price on the listing is the price the seller is asking. It is not a
        teaser and it is not there to get you to call. Every listing also shows
        where the car came from, because in Oman that changes what a car is
        worth and what it costs to insure and repair:
      </p>
      <BulletList
        items={[
          "GCC spec (خليجي) — built for this region.",
          "US import (وارد أمريكي) or Japan import (وارد اليابان) — imported, which is completely normal and often good value.",
          "Spec not stated by seller — we mark this too, rather than quietly leaving the field blank.",
        ]}
      />
      <p className="font-2 fs-16 lh-26 mb-30">
        A stated import origin is never shown as a warning. Only withholding it
        is flagged. Cars priced under OMR 1,500 carry a{" "}
        <strong>sold as-is</strong> label: no warranty, no returns, buy it in
        its current condition.
      </p>

      <h3 className="fs-18 mb-2">3. One WhatsApp tap</h3>
      <p className="font-2 fs-16 lh-26 mb-30">
        There is no messaging system to sign up for. Tap the WhatsApp button and
        you are in a normal chat with the seller, with the car, the listed price
        and the listing link already written for you. The price is in the chat
        from the first message, timestamped, so it is awkward for anyone to
        raise it later.
      </p>

      <h3 className="fs-18 mb-2">4. Go and see the car</h3>
      <p className="font-2 fs-16 lh-26 mb-40">
        Agree a time and a public place. Inspect the car, or bring a mechanic —
        at this end of the market that is the single best OMR you will spend.
        Check the Mulkiya (registration) matches the person selling it, check
        the chassis number, and ask about outstanding fines before any money
        moves. You pay the seller directly.
      </p>

      <h2 className="mb-20">If you are selling</h2>
      <p className="font-2 fs-16 lh-26 mb-40">
        You submit the car, we check the listing, and buyers message you on
        WhatsApp. There is a price band and a small number of rules — the full
        explanation is on{" "}
        <Link className="fw-6" href="/sell-your-car">
          sell your car
        </Link>
        .
      </p>

      <h2 className="mb-20">What we check before a listing goes live</h2>
      <BulletList
        items={[
          "That the asking price is inside the band, and is a real asking price.",
          "That the car, the photos and the description are actually the same car.",
          "That the seller's contact number is a valid Omani mobile that can receive WhatsApp.",
          "That the import origin is stated — and if it is not, that the listing says so.",
        ]}
      />

      <h2 className="mb-20">What we do not do</h2>
      <p className="font-2 fs-16 lh-26 mb-20">
        Being clear about this is the point of the site. Autosouq:
      </p>
      <BulletList
        items={[
          "does not sell cars — every car belongs to the person listed on it;",
          "does not hold, transfer or escrow your money, ever;",
          "does not deliver cars or arrange transport;",
          "does not inspect vehicles mechanically, and does not certify condition or mileage;",
          "does not offer finance, loans or insurance;",
          "does not guarantee anything we have not verified, and we tell you what we verified.",
        ]}
      />
      <p className="font-2 fs-16 lh-26 mb-30">
        If anyone claims to be Autosouq and asks you to pay a deposit, transfer
        money to hold a car, or pay any fee to us, it is not us.{" "}
        <Link className="fw-6" href="/contact">
          Tell us
        </Link>{" "}
        and we will pull the listing.
      </p>

      <h2 className="mb-20">More questions</h2>
      <p className="font-2 fs-16 lh-26 mb-0">
        The{" "}
        <Link className="fw-6" href="/faq">
          FAQs
        </Link>{" "}
        cover costs, safety and the practical steps of transferring ownership in
        Oman. If your question is not there,{" "}
        <Link className="fw-6" href="/contact">
          contact us
        </Link>
        .
      </p>
    </InfoShell>
  );
}
