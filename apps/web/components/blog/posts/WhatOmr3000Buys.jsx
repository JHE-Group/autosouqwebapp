import { Link } from "@/i18n/navigation";
import { H2, P, UL } from "@/components/guides/Prose";

export default function WhatOmr3000Buys() {
  return (
    <>
      <P>
        Autosouq only lists affordable used cars between OMR 1,000 and 6,000.
        The middle of that band — around OMR 3,000 — is where many buyers in
        Oman actually stop scrolling. This note is about what that money
        usually means on the ground, not a promise that every OMR 3,000 car is
        a good one.
      </P>

      <H2>What you are usually looking at</H2>
      <P>
        In this band you will mostly see older GCC-spec or declared-import
        saloons and hatchbacks: Corolla, Sunny, Yaris, Accent, Civic, and the
        occasional small SUV that has already lived a hard life. Expect high
        kilometres — 180,000–300,000 km is normal here, not a scandal. Expect
        white or silver paint, automatic boxes, and A/C that must work in July.
      </P>
      <UL
        items={[
          "A usable daily car, not a “project” — if it needs a project budget, the price should say so",
          "Service history that is patchy or verbal; ask on WhatsApp before you drive across town",
          "Spec origin stated on the listing — if it is blank, treat that as a question, not a detail",
        ]}
      />

      <H2>What OMR 3,000 does not buy</H2>
      <P>
        It does not buy a low-mileage nearly-new car. It does not buy a
        warranty. It does not buy the right to skip the{" "}
        <Link className="fw-6" href="/guides/gcc-spec-vs-american-import">
          GCC-spec check
        </Link>{" "}
        or a look at{" "}
        <Link className="fw-6" href="/guides/check-fines-before-buying-oman">
          fines and restrictions
        </Link>
        . If a seller’s story sounds like a 2019 car with 40,000 km at OMR
        3,000, assume you are missing a fact until you have seen the mulkiya
        and the car in daylight.
      </P>

      <H2>How to use the band on Autosouq</H2>
      <P>
        Filter for what you can live with — city, automatic, price ceiling —
        then open the listing and read the asking price as the real ask. Message
        the seller on WhatsApp with the car and price already in the chat. If
        you need the longer “how to buy” walkthrough, start with our{" "}
        <Link className="fw-6" href="/guides">
          guides
        </Link>
        ; if you want to see what is live now,{" "}
        <Link className="fw-6" href="/used-cars">
          browse the catalogue
        </Link>
        .
      </P>
    </>
  );
}
