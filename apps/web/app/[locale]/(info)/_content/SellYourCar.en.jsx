import { Link } from "@/i18n/navigation";
import React from "react";
import BulletList from "../_components/BulletList";

export default function SellYourCarEn() {
  return (
    <>
      <h1 className="mb-20">Sell your used car in Oman</h1>
      <p className="font-2 fs-18 lh-28 mb-40">
        Autosouq is where people in Oman look for an affordable used car. If
        your car is priced in the band below, buyers who are ready to buy at
        that price will find it — and they will message you on WhatsApp
        directly. The buyer pays you — Autosouq never handles the money.{" "}
        <strong>Listing is free.</strong>
      </p>

      {/* The cost, said where the decision is made. This page existed to
          persuade someone to list a car and never said what listing cost. */}
      <p className="mb-40">
        <Link className="sc-button" href="/add-listing">
          <span>Add a listing</span>
        </Link>
        <span className="d-block mt-2 fs-14 text-color-2">Free to list.</span>
      </p>

      <h2 className="mb-20">The price band — please read this first</h2>
      <p className="font-2 fs-16 lh-26 mb-20">
        Autosouq only lists affordable used cars. That is the whole point of the
        site, and it is why buyers here are serious. There are three cases:
      </p>

      <h3 className="fs-18 mb-2">OMR 1,500 – 6,000</h3>
      <p className="font-2 fs-16 lh-26 mb-30">
        This is the core band. Your car is listed normally.
      </p>

      <h3 className="fs-18 mb-2">OMR 1,000 – 1,499</h3>
      <p className="font-2 fs-16 lh-26 mb-30">
        We accept these, and we publish them labelled{" "}
        <strong>sold as-is</strong>. That label is not a judgement on your car.
        It tells the buyer plainly that there is no warranty and no returns and
        that they are buying it in its current condition — which is normal at
        this price, and is exactly why the price is what it is. Being upfront
        about it brings you buyers who already accept those terms instead of
        buyers who walk away at the viewing.
      </p>

      <h3 className="fs-18 mb-2">Above OMR 6,000, or below OMR 1,000</h3>
      <p className="font-2 fs-16 lh-26 mb-40">
        We will not list it. This is not negotiable, and it is not personal —
        the site exists for one band, and stretching it would make Autosouq the
        same undifferentiated listings site everyone already has. If your car is
        worth more than 6,000, you will do better elsewhere.
      </p>

      <h2 className="mb-20">The rules</h2>
      <BulletList
        items={[
          "One real asking price. The price you publish is the price you will honour. Advertising low and quoting higher on WhatsApp gets the listing removed.",
          "The car must be yours to sell, and the registration (Mulkiya) must be in your name or you must be authorised to sell it.",
          "Photos must be of the actual car — not the same model from the internet, not the car before the damage.",
          "State the import origin: GCC spec, US import, Japan import or other. If you genuinely do not know, say so and we will publish it as not stated.",
          "Declare accident damage, a replaced engine or gearbox, and anything a buyer would be angry to discover at the viewing.",
          "One listing per car, and take it down when it sells.",
        ]}
      />

      <h2 className="mb-20">What you will need</h2>
      <BulletList
        items={[
          "Your Omani mobile number, on WhatsApp — this is how every buyer reaches you.",
          "Make, model, year, mileage and gearbox.",
          "Import origin (GCC spec, US import, Japan import or other).",
          "Your asking price in OMR.",
          "Clear photos in daylight: front three-quarter, rear three-quarter, both sides, the interior, the odometer, and any damage.",
          "The wilayat the car is in, so buyers nearby can find it.",
        ]}
      />

      <h2 className="mb-20">How to list a car</h2>
      <BulletList
        items={[
          "Fill in the listing form with the details and photos above.",
          "We review it against the rules on this page, mainly the price and that the photos match the description.",
          "It goes live, and buyers message you on WhatsApp with the car and your asking price already in the message.",
          "You arrange the viewing, agree the deal and complete the ownership transfer directly with the buyer.",
        ]}
      />

      <p className="font-2 fs-16 lh-26 mb-20">
        It takes a few minutes from your phone.
      </p>
      <p className="mb-40">
        <Link className="sc-button" href="/add-listing">
          <span>Add a listing</span>
        </Link>
      </p>

      <h2 className="mb-20">Selling safely</h2>
      <BulletList
        items={[
          "Meet in a public place in daylight, and bring someone with you.",
          "Do not hand over the keys or the Mulkiya until you have been paid in full and the payment has cleared.",
          "Be careful with anyone who wants to buy without seeing the car, offers more than you asked, or wants to pay through a third party holding the money.",
          "Settle outstanding fines and complete the ownership transfer properly — until it is transferred, the car is still legally yours.",
          "Autosouq will never ask you to transfer money to an individual, to pay a deposit, or to send payment over WhatsApp. If someone claiming to be us does, it is not us.",
        ]}
      />

      <h2 className="mb-20">What we do, and what we do not</h2>
      <p className="font-2 fs-16 lh-26 mb-20">
        We check your listing before it goes live and we can remove listings
        that break the rules. Beyond that, the sale is yours. We do not value
        cars, inspect them mechanically, hold payments, transport vehicles,
        transfer ownership on your behalf, or guarantee that your car will sell.
        The full picture is on{" "}
        <Link className="fw-6" href="/how-it-works">
          how it works
        </Link>
        .
      </p>
      <p className="font-2 fs-16 lh-26 mb-0">
        Stuck, or not sure whether your car fits the band?{" "}
        <Link className="fw-6" href="/contact">
          Contact us
        </Link>{" "}
        and we will tell you straight.
      </p>
    </>
  );
}
