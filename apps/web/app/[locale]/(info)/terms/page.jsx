import { Link } from "@/i18n/navigation";
import React from "react";
import BulletList from "../_components/BulletList";
import DraftNotice from "../_components/DraftNotice";
import InfoShell from "../_components/InfoShell";

export const metadata = {
  title: "Terms & Conditions",
  description:
    "The terms for using Autosouq.om, Oman's marketplace for affordable used cars. Plain-language draft pending legal review before launch.",
};

export default function page() {
  return (
    <InfoShell breadcrumb="Terms & Conditions">
      <h1 className="mb-20">Terms &amp; Conditions</h1>
      <DraftNotice />

      <p className="font-2 fs-16 lh-26 mb-40">
        <strong>Effective date:</strong>{" "}
        <em>[EFFECTIVE DATE — TO CONFIRM AT LAUNCH]</em>
        <br />
        <strong>Last updated:</strong>{" "}
        <em>[LAST UPDATED DATE — TO CONFIRM AT LAUNCH]</em>
      </p>

      <h2 className="mb-20">1. Who we are</h2>
      <p className="font-2 fs-16 lh-26 mb-30">
        Autosouq.om (&quot;Autosouq&quot;, &quot;we&quot;, &quot;us&quot;) is a
        website that lists affordable used cars for sale in Oman. It is operated
        by <em>[COMPANY LEGAL NAME — TO CONFIRM]</em>, registered at{" "}
        <em>[REGISTERED ADDRESS — TO CONFIRM]</em>. Registration details:{" "}
        <em>[COMMERCIAL REGISTRATION / TAX DETAILS — TO CONFIRM]</em>. You can
        reach us at <em>[CONTACT EMAIL — TO CONFIRM]</em> or through{" "}
        <Link className="fw-6" href="/contact">
          our contact page
        </Link>
        .
      </p>

      <h2 className="mb-20">2. What these terms cover</h2>
      <p className="font-2 fs-16 lh-26 mb-30">
        These terms apply to everyone who uses the site — whether you are
        browsing cars, listing a car, or contacting a seller. By using
        Autosouq.om you accept them. If you do not accept them, please do not
        use the site.
      </p>

      <h2 className="mb-20">3. What Autosouq is — and is not</h2>
      <p className="font-2 fs-16 lh-26 mb-20">
        Autosouq is a marketplace. Sellers publish their own cars and buyers
        contact them directly. We are not a party to any sale. Specifically, we:
      </p>
      <BulletList
        items={[
          "do not own, sell, or take possession of any car listed on the site;",
          "do not hold, transfer, escrow or refund money between buyers and sellers;",
          "do not deliver cars or arrange transport;",
          "do not carry out mechanical inspections and do not certify a car's condition, mileage, accident history or roadworthiness;",
          "do not offer finance, loans, insurance or any related financial service;",
          "do not act as an agent for either the buyer or the seller.",
        ]}
      />
      <p className="font-2 fs-16 lh-26 mb-30">
        Any contract for the sale of a car is between the buyer and the seller
        alone.
      </p>

      <h2 className="mb-20">4. The price band</h2>
      <p className="font-2 fs-16 lh-26 mb-30">
        Autosouq only publishes cars priced between OMR 1,500 and OMR 6,000.
        Cars priced from OMR 1,000 to OMR 1,499 may be accepted and are
        published labelled <strong>sold as-is</strong>. We decline anything
        outside those ranges. We may remove a listing that is repriced outside
        the band. Full detail is on{" "}
        <Link className="fw-6" href="/sell-your-car">
          sell your car
        </Link>
        .
      </p>

      <h2 className="mb-20">5. Prices must be real</h2>
      <p className="font-2 fs-16 lh-26 mb-30">
        The price shown on a listing must be the price the seller is genuinely
        asking. Publishing a price you do not intend to honour, in order to
        attract enquiries and then quote higher, is a breach of these terms and
        we will remove the listing and may close the account. This rule is the
        reason the site exists; we enforce it.
      </p>

      <h2 className="mb-20">6. Specification and import origin</h2>
      <p className="font-2 fs-16 lh-26 mb-30">
        Sellers must state where the car came from — GCC spec, US import, Japan
        import or other. Where a seller has not stated it, the listing says so
        rather than leaving the field blank. This information comes from the
        seller. We publish it as given and we do not independently verify a
        vehicle&apos;s specification or country of origin. Buyers should check
        it themselves before paying.
      </p>

      <h2 className="mb-20">7. What &quot;verified&quot; means here</h2>
      <p className="font-2 fs-16 lh-26 mb-20">
        Where a listing is marked as checked or verified, that means we have
        reviewed the listing itself — for example that the asking price sits in
        the band, that the photos and description appear to describe the same
        car, and that the seller&apos;s contact number is a valid Omani mobile.
        It does <strong>not</strong> mean:
      </p>
      <BulletList
        items={[
          "that we have inspected the car, or seen it at all;",
          "that we have confirmed the mileage, service history or accident history;",
          "that we have confirmed the seller's legal ownership of the vehicle;",
          "that the car is roadworthy, free of finance, or free of outstanding fines.",
        ]}
      />
      <p className="font-2 fs-16 lh-26 mb-30">
        We will not claim to have verified something we have not verified.
        Please inspect any car, or have it inspected, before you pay.
      </p>

      <h2 className="mb-20">8. Contacting sellers</h2>
      <p className="font-2 fs-16 lh-26 mb-30">
        Contacting a seller opens a WhatsApp conversation directly with them,
        using WhatsApp&apos;s own service. That conversation is between you and
        the seller — it does not run through Autosouq and we do not see it. Your
        use of WhatsApp is governed by WhatsApp&apos;s own terms and privacy
        policy, not ours. Contact details on the site are provided so that
        buyers and sellers can reach each other about a specific car; collecting
        or using them for marketing, bulk messaging or resale is prohibited.
      </p>

      <h2 className="mb-20">9. Listing a car</h2>
      <p className="font-2 fs-16 lh-26 mb-20">
        If you list a car, you confirm that:
      </p>
      <BulletList
        items={[
          "the car is yours to sell, or you are authorised by the owner to sell it;",
          "the details, mileage and photographs are accurate and are of the actual car;",
          "you have disclosed accident damage, replaced major components and anything else material to the sale;",
          "the asking price is genuine;",
          "you are legally able to sell the vehicle in Oman and will complete the ownership transfer properly.",
        ]}
      />
      <p className="font-2 fs-16 lh-26 mb-30">
        You remain responsible for your listing and for the sale.{" "}
        <em>
          [LISTING FEES AND ANY PAID PLACEMENT — TO CONFIRM AND SET OUT HERE
          BEFORE LAUNCH.]
        </em>
      </p>

      <h2 className="mb-20">10. Content you upload</h2>
      <p className="font-2 fs-16 lh-26 mb-30">
        You keep ownership of the photos and text you upload. By uploading them
        you give us permission to host, display and reproduce them on
        Autosouq.om and in promotion of the site, for as long as the listing is
        live and for a reasonable period afterwards. You must not upload content
        you do not have the right to use.
      </p>

      <h2 className="mb-20">11. Things you must not do</h2>
      <BulletList
        items={[
          "Post a car you do not have, or a price you will not honour.",
          "Post a car outside the price band, or relist a rejected car to get around it.",
          "Impersonate someone else, or use a contact number that is not yours.",
          "Ask a buyer or seller to transfer money before they have seen the car, or pose as Autosouq to do so.",
          "Scrape, copy or bulk-extract listings or contact details.",
          "Interfere with the site, or attempt to access accounts or data that are not yours.",
          "Post anything unlawful, abusive, or discriminatory.",
        ]}
      />

      <h2 className="mb-20">12. Removing listings and accounts</h2>
      <p className="font-2 fs-16 lh-26 mb-30">
        We may edit, decline, suspend or remove any listing, and suspend or
        close any account, where we believe these terms have been broken or a
        listing is misleading. Where it is practical and appropriate we will
        tell you why. You may ask us to remove your listing or close your
        account at any time.
      </p>

      <h2 className="mb-20">13. Availability of the site</h2>
      <p className="font-2 fs-16 lh-26 mb-30">
        We work to keep the site up and accurate, but we do not promise it will
        be available without interruption or free of errors. We may change,
        suspend or withdraw features.
      </p>

      <h2 className="mb-20">14. Limits on our responsibility</h2>
      <p className="font-2 fs-16 lh-26 mb-30">
        Because we are not a party to the sale, we are not responsible for the
        condition, legality, description or value of any car, for a
        seller&apos;s or buyer&apos;s conduct, or for whether a sale completes.
        Content in listings comes from users. Nothing in these terms limits
        liability that cannot lawfully be limited.{" "}
        <em>
          [SCOPE AND CAP OF LIABILITY — TO BE DRAFTED AND CONFIRMED BY LEGAL
          COUNSEL.]
        </em>
      </p>

      <h2 className="mb-20">15. Other sites</h2>
      <p className="font-2 fs-16 lh-26 mb-30">
        The site links to services we do not control, including WhatsApp and
        mapping services. We are not responsible for them, and their own terms
        apply when you use them.
      </p>

      <h2 className="mb-20">16. Changes to these terms</h2>
      <p className="font-2 fs-16 lh-26 mb-30">
        We may update these terms. The current version is always the one on this
        page, with the date at the top. If a change is significant we will make
        that clear on the site.
      </p>

      <h2 className="mb-20">17. Governing law</h2>
      <p className="font-2 fs-16 lh-26 mb-30">
        <em>
          [GOVERNING LAW AND JURISDICTION — TO CONFIRM WITH LEGAL COUNSEL. Do
          not fill this in with an assumption.]
        </em>
      </p>

      <h2 className="mb-20">18. Contact</h2>
      <p className="font-2 fs-16 lh-26 mb-0">
        Questions about these terms: <em>[LEGAL CONTACT EMAIL — TO CONFIRM]</em>
        , or use{" "}
        <Link className="fw-6" href="/contact">
          our contact page
        </Link>
        . See also our{" "}
        <Link className="fw-6" href="/privacy">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link className="fw-6" href="/how-it-works">
          how it works
        </Link>
        .
      </p>
    </InfoShell>
  );
}
