import { Link } from "@/i18n/navigation";
import React from "react";
import { Callout, H2, OL, P, Source, Sources, UL } from "@/components/guides/Prose";

/**
 * Guide #6 — brief: design/research/blog-keyword-briefs.md §4 #10, re-cut after
 * the 2026-08-04 keyword pass.
 *
 * The reason this page exists is the sentence in "What no report can see". Every
 * page ranking for this query sells a report, so none of them says the thing a
 * buyer in Oman most needs to hear: a VIN report describes a car's life in the
 * country that issued the records, and stops at the port. For an import that
 * landed six years ago, that is the smaller half of its history.
 *
 * Two live-search facts shaped the writing and should survive any edit:
 *
 *   1. "free" / مجاني is the modifier buyers attach in BOTH languages
 *      ("how to check car accident history in oman free", رقم الشاصي وارد امريكي
 *      مجاني, معرفة ضرر السيارة من رقم الشاصي مجانا). It is also the question a
 *      page selling reports cannot answer honestly. So the free checks come
 *      first here, in their own section, before paid reports are mentioned as an
 *      option.
 *   2. The Arabic demand is deeper than the English (رقم الشاصي returns a full
 *      completion set led by the وارد أمريكي cluster). The Arabic body is
 *      written at full length, not trimmed.
 *
 * Claims deliberately NOT made, because no primary source was found for them:
 * any price for a VIN report; any claim that ROP publishes accident history,
 * or exposes any lookup keyed on the chassis number; any statement about which
 * field of the mulkiya records import origin; any assertion that a specific US
 * database is reachable or complete from Oman. NICB VINCheck is described in
 * prose and deliberately not linked — the URL returned 403 to us on
 * 2026-08-04, which is consistent with bot filtering rather than the service
 * being gone, and we do not cite what we could not open.
 *
 * The "W means Gulf spec" correction belongs to
 * /guides/gcc-spec-vs-american-import and is linked, not restated. Two pages
 * making the same argument in slightly different words is how a correction gets
 * softened.
 *
 * NOT linked, deliberately: /used-cars/gcc-spec. The facet gates on
 * MIN_LISTINGS_FOR_FACET and production inventory is currently zero, so it
 * returns 404 — verified against www.autosouq.om on 2026-08-04, while the same
 * path returns 200 locally because .env.local enables the demo fallback. Add
 * the link back when there are listings behind it; a guide that ends by
 * pointing at a 404 is worse than one that ends at its own related reading.
 */
export default function ChassisNumberVinCheckOman() {
  return (
    <>
      <P>
        The chassis number is the one thing about a used car that cannot be
        talked up. Everything else in a listing — the mileage, the condition,
        the reason for selling — arrives through the seller. The seventeen
        characters stamped into the metal arrive from the factory, and they are
        the same seventeen characters printed on the{" "}
        <strong>mulkiya</strong> in the seller&apos;s hand, or they are not, and
        that is a fact you can establish yourself in about a minute.
      </P>
      <P>
        This page is about what those characters can prove and what they cannot.
        The short version, because it is the part most pages leave out: a
        chassis number will tell you a great deal about how a car was built and
        something about how it was treated in the country that kept records on
        it. It will tell you almost nothing about the years it has spent in
        Oman. For an import, those are usually the years you are actually
        buying.
      </P>

      <H2 id="where-it-is">Where to find it — on the car, and on the mulkiya</H2>
      <P>
        Look in three places, in this order. You want at least two of them to
        agree before you go any further.
      </P>
      <OL
        items={[
          "The driver’s side of the dashboard, seen through the windscreen from outside the car. A small plate at the bottom corner, easiest to read standing in front of the car rather than sitting in it.",
          "The driver’s door frame — open the door and look at the pillar and the door edge. On most cars the number is on the same label that carries the tyre pressures and the build date.",
          "The registration card (mulkiya) the seller is holding. The number printed there is what the vehicle is registered as.",
        ]}
      />
      <P>
        Photograph all of them. Not to check now — to check later, at home, with
        the seller not standing over you. A phone photograph of the dashboard
        plate and a photograph of the mulkiya, taken thirty seconds apart, are
        the single most useful thing you can leave a viewing with, and no seller
        with nothing to hide will mind you taking them.
      </P>

      <H2 id="seventeen">What the seventeen characters are</H2>
      <P>
        Since the early 1980s, cars built for most markets carry a
        seventeen-character number in a standard shape. The letters I, O and Q
        never appear in it — they are excluded precisely because they are read
        as 1 and 0 — so if you think you are reading an O, you are reading a
        zero.
      </P>
      <UL
        items={[
          "Characters 1–3 identify the manufacturer and the country of the plant. This is the part people misuse; see the section below.",
          "Characters 4–8 describe the vehicle: model line, body, engine, restraint system. What is encoded here differs by manufacturer.",
          "Character 9 is a check digit on vehicles built to the North American standard — arithmetic on the other sixteen. It is why a casually invented VIN usually fails a decoder.",
          "Character 10 is the model year. Character 11 is the assembly plant.",
          "Characters 12–17 are the serial number — this specific car, off that line, in that order.",
        ]}
      />
      <P>
        You do not need to decode this by hand. The United States government
        runs a free public decoder that takes a VIN and returns what the
        manufacturer encoded into it — make, model line, year, plant, body type,
        engine. It costs nothing, it wants no account, and it is the first thing
        to run on a car you are seriously considering. It is linked at the
        bottom of this page.
      </P>
      <Callout title="What a decoder proves, and what it does not">
        <P className="mb-0">
          A decoder reads the number. It does not know the car. If the seller
          says 1.6 litre and the decoder says 2.0, you have learned something
          real. If they agree, you have learned that the number is internally
          consistent with a car of that description — not that this car has been
          looked after, not that the odometer is honest, and not that it has
          never been hit.
        </P>
      </Callout>

      <H2 id="wmi">The first three characters, and the rule that is not a rule</H2>
      <P>
        You will be told, often and confidently, that a chassis number starting
        with a particular letter proves a car is GCC spec. It does not. Those
        first characters identify who built the car and where the plant was —
        not which market the finished car was sold into, which is the question
        actually being asked.
      </P>
      <P>
        That correction has its own page, with the checks that do settle the
        question — the door-frame label, the emissions label under the bonnet,
        and the speedometer. Read it before you use spec as a bargaining
        position:{" "}
        <Link className="fw-6" href="/guides/gcc-spec-vs-american-import">
          GCC spec or American import? How to tell, in Oman
        </Link>
        .
      </P>

      <H2 id="american-import">
        وارد أمريكي — what a US-side report actually contains
      </H2>
      <P>
        For a car that was originally sold in the United States, there is a
        genuine paper trail, and it is the reason people search for this in the
        first place. American states record a change in a vehicle&apos;s legal
        status on its title, insurers report total losses, salvage auctions
        publish what they sold and photograph it, and odometer readings get
        captured at sale and inspection. Commercial history reports assemble
        those sources.
      </P>
      <P>
        When such a report is worth its price, this is what it is worth it for:
      </P>
      <UL
        items={[
          "Title status and any brand on it — salvage, flood, rebuilt, junk. A brand is a strong signal and the main thing you are paying to find.",
          "Auction records, often with photographs. For a car that passed through a salvage auction, the photographs are more informative than any description of the damage.",
          "Reported accidents, meaning accidents that reached an insurer or a police report. Not all accidents do.",
          "Odometer readings captured on specific dates, which is how a rolled-back odometer is usually caught.",
        ]}
      />
      <P>
        Free US-side checks also exist and are worth running before you pay for
        anything. The National Insurance Crime Bureau operates a free VIN lookup
        covering theft and insurance total-loss records, funded by American
        insurers. We are describing it rather than linking it: the page did not
        open for us when we checked on 4 August 2026, which is the sort of thing
        an automated request gets rather than evidence the service has gone.
        Search for it by name, and treat &ldquo;no record found&rdquo; the way
        this page treats every negative — as an absence of a record, not as
        proof of a clean life.
      </P>

      <H2 id="clean-title">&ldquo;Clean title&rdquo; is not a description of the car</H2>
      <P>
        This is the most misunderstood phrase in the import market here, and it
        is worth being exact about, because it is used in Omani listings as
        though it were a condition report.
      </P>
      <P>
        A clean title means one thing: no American state has recorded a brand
        against this vehicle. That is a registry status. It is not an inspection,
        not an opinion about the bodywork, and not a statement that the car was
        never damaged. A car can have been hit hard, repaired privately without
        an insurance claim, and keep a perfectly clean title for its whole life.
        The threshold at which a car gets branded is a financial one — damage
        relative to value — and it varies between states. A cheap car reaches it
        after a modest accident. An expensive one can absorb a serious accident
        and never reach it at all.
      </P>
      <P>
        And there is the part that matters most here.{" "}
        <strong>
          A clean title says nothing whatever about what happened to the car
          after it left the United States.
        </strong>{" "}
        The record stops at export. Everything since — the shipping, the
        repairs done on arrival, the years on Omani roads — is outside it.
      </P>

      <H2 id="not-shown">What no report can see: the car&apos;s life in Oman</H2>
      <P>
        This is the section the pages selling reports do not write, and it is
        why we published this one.
      </P>
      <P>
        A history report is a record of the country whose institutions created
        the records. For an import, it describes the years before it arrived. A
        car that landed in 2019 has spent six or seven years here — six or seven
        summers, the dust, the roads, whatever happened to it in a car park in
        Ruwi — and none of that is in any report you can buy with a VIN.
        Specifically, a VIN report will not show you:
      </P>
      <UL
        items={[
          "Any accident that happened in Oman, whether or not anyone reported it.",
          "Repairs done here — the panel that was replaced, the paint that does not quite match in daylight.",
          "How the car has coped with heat: the battery, the air conditioning, the plastics and the coolant system, which is where this climate does its damage.",
          "Unpaid traffic fines, which follow the vehicle rather than the seller.",
          "An outstanding bank loan against the car, which is the one that stops the transfer at the counter.",
          "Whether the seller is actually the registered owner.",
        ]}
      />
      <P>
        Those last three are not minor. They are the ones that cost people money
        in this market, and every one of them is checkable here, for nothing.
      </P>

      <H2 id="omani-side">Check the Omani side — it is free and it is where the risk is</H2>
      <P>
        Before spending anything on a report about a car&apos;s life abroad, do
        the checks about its life here. They cost nothing and they catch the
        problems that actually end transfers.
      </P>
      <OL
        items={[
          "Fines and restrictions on the vehicle. These follow the car, not the person selling it, and they will stop the transfer.",
          "Whether there is finance outstanding against it.",
          "That the person selling it is the registered owner on the mulkiya, and that their ID matches.",
          "That the chassis number on the car matches the chassis number on the mulkiya.",
        ]}
      />
      <P>
        We have written the first three up properly, with the ROP process and
        the traps:{" "}
        <Link className="fw-6" href="/guides/check-fines-before-buying-oman">
          Check the car, not just the seller
        </Link>
        . The fourth one is the next section.
      </P>

      <H2 id="free-first">Free first, paid only when there is a reason</H2>
      <P>
        &ldquo;Free&rdquo; is the word people add to this search in both
        languages, and it deserves a straight answer rather than a sales page.
        Here is the order we would actually use.
      </P>
      <OL
        items={[
          "Read the number off the car and off the mulkiya and confirm they match. Free. Catches the worst problem there is.",
          "Run the free government decoder and check it agrees with what you were told the car is. Free.",
          "Run the free US theft and total-loss lookup, if the car is an American import. Free.",
          "Do the Omani checks — fines, finance, ownership. Free.",
          "Only then, and only for an American import you are close to buying, consider paying for a full history report.",
        ]}
      />
      <P>
        A paid report earns its money on one kind of car: an import, at the top
        of what you can afford, where a salvage or flood brand would change your
        mind. It earns nothing on a car that has been in Oman since it was new —
        there is no foreign record to buy — and it earns nothing at all if you
        have not first done the four free things above, because it cannot answer
        any of them.
      </P>

      <H2 id="mismatch">If the numbers do not match, the viewing is over</H2>
      <P>
        Everything else on this page is about weighing evidence. This part is
        not.
      </P>
      <P>
        If the chassis number stamped on the car does not match the one printed
        on the mulkiya, stop. Do not pay a deposit, do not agree to sort it out
        later, and do not accept an explanation on the spot. The same goes for a
        plate that looks disturbed — rivets that do not match, a surface that has
        been ground and restamped, digits at inconsistent depths, a label that
        has been peeled and replaced.
      </P>
      <P>
        There are innocent explanations for some of this. A car repaired after a
        heavy front impact can legitimately have had a section replaced. A
        clerical error on a registration card is possible. But none of those are
        things to resolve in a car park with money in your hand, and the pattern
        is common enough to appear in our{" "}
        <Link className="fw-6" href="/guides/used-car-scams-oman">
          guide to used-car scams in Oman
        </Link>
        . Walk away. There will be another car.
      </P>

      <Callout title="One honest limitation of this page">
        <P className="mb-0">
          We have not been able to confirm any Omani service that returns a
          vehicle&apos;s accident or repair history from a chassis number, and
          we are not going to imply one exists. What is verifiable here are
          fines, restrictions and registration details through the Royal Oman
          Police, plus what a garage can tell you from the car itself. If that
          changes, this page gets updated and re-dated.
        </P>
      </Callout>

      <H2 id="related">Read next</H2>
      <UL
        items={[
          <>
            <Link className="fw-6" href="/guides/gcc-spec-vs-american-import">
              GCC spec or American import? How to tell, in Oman
            </Link>{" "}
            — the checks that settle the spec question, and why the chassis
            number does not.
          </>,
          <>
            <Link className="fw-6" href="/guides/check-fines-before-buying-oman">
              Check the car, not just the seller
            </Link>{" "}
            — the free Omani-side checks a VIN report cannot do for you.
          </>,
          <>
            <Link className="fw-6" href="/blog/flood-salvage-imports-oman">
              Flood and salvage imports in Oman
            </Link>{" "}
            — what a branded history looks like by the time the car reaches a
            listing here.
          </>,
          <>
            <Link className="fw-6" href="/guides/used-car-scams-oman">
              Used-car scams in Oman
            </Link>{" "}
            — including restamped chassis numbers.
          </>,
        ]}
      />

      <Sources
        items={[
          {
            href: "https://vpic.nhtsa.dot.gov/decoder/",
            label: "US NHTSA — VIN decoder",
            note: "free, official, no account; decodes what the manufacturer encoded into the seventeen characters",
          },
          {
            href: "https://www.rop.gov.om/english/TrafficFinesPayment.aspx",
            label: "Royal Oman Police — traffic fines",
            note: "fines follow the vehicle, not the seller; check before you agree a price",
          },
          {
            href: "https://www.rop.gov.om/english/VehicleOwnershipTransfer.aspx",
            label: "Royal Oman Police — vehicle ownership transfer",
            note: "the conditions a transfer has to meet, including what will block it",
          },
        ]}
      />
      <P className="mb-0">
        Where this page describes what a commercial history report contains, it
        is describing the category rather than any one product, and we have not
        tested any of them from Oman. The{" "}
        <Source href="https://vpic.nhtsa.dot.gov/decoder/">
          NHTSA decoder
        </Source>{" "}
        we did open and use on 4 August 2026.
      </P>
    </>
  );
}
