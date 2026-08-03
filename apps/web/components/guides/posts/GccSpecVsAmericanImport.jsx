import { Link } from "@/i18n/navigation";
import React from "react";
import { Callout, H2, H3, OL, P, Source, Sources, UL } from "@/components/guides/Prose";

/**
 * Guide #1 — brief: design/research/blog-keyword-briefs.md §4 #1.
 *
 * The whole reason this page exists is that every UAE page currently ranking for
 * this query repeats "check if the VIN starts with W", which is wrong: W is the
 * German WMI and identifies the manufacturer, not the market. If that correction
 * ever gets softened out of this file, the page has no reason to be published.
 *
 * Claims deliberately NOT made here, because they could not be verified against
 * a primary source: any OMR figure for the GCC-spec resale premium; what field
 * (if any) the Omani mulkiya uses to record import origin; any statement about
 * how insurers price imported cars.
 */
export default function GccSpecVsAmericanImport() {
  return (
    <>
      <P>
        In Oman, <strong>خليجي</strong> (GCC spec) and{" "}
        <strong>وارد أمريكي</strong> (American import) are not descriptions of
        where a car was built. They describe which market the car was originally
        sold into — and in the OMR 1,500–6,000 band, that difference is worth
        real money and a real argument.
      </P>
      <P>
        Almost everything written in English about how to tell them apart was
        written for buyers in the UAE, and a lot of it is wrong. The advice you
        will meet most often — “if the chassis number starts with W it is GCC
        spec” — is not a weak rule. It is not a rule at all. This page gives you
        the checks that genuinely prove something, in the order you can do them
        standing next to the car, and it is honest about which ones prove
        nothing.
      </P>

      <H2 id="why-it-matters">Why this matters more here than almost anywhere</H2>
      <P>
        Three reasons, in the order they will affect you.
      </P>
      <UL
        items={[
          "Resale. Buyers in this market ask “خليجي ولا وارد؟” before they ask about mileage. Whatever you paid, the next buyer will apply the same discount to you that you should be applying now.",
          "Specification. A car built for the United States and a car built for the Gulf can differ in cooling, trim, engine variant and equipment. That is usually manageable, but it can mean the part your garage reaches for first is not the part your car takes.",
          "History you cannot see. A car that spent eight years in Oman has a history someone here can ask about. A car that arrived on a ship two years ago has a history that happened somewhere you cannot check. That is the real risk with an import, and it is not the same thing as the car being bad.",
        ]}
      />
      <P>
        It matters most in exactly this price band. On 25 July 2026 we sampled
        150 car listings across the first five pages of OpenSooq Oman’s
        cars-for-sale section. Every one of them carried a regional-spec label,
        and American-spec listings clearly outnumbered GCC-spec ones on every
        page we counted. That is a sample of listings on one day, not a measure
        of the whole
        market and not a measure of what actually sells — but it tells you that
        if you are shopping at the affordable end here, imports are not the
        exception. They are most of what you will look at.
      </P>

      <H2 id="five-minute-check">The five-minute check, in order</H2>
      <P>
        Do these in this order. The first two settle it most of the time; the
        rest are for when they do not.
      </P>
      <OL
        items={[
          "Open the driver’s door and read the manufacturer’s label in the door frame.",
          "Open the bonnet and read the emissions label, usually on the underside of the bonnet or on the slam panel.",
          "Look at the speedometer: which number is the big one, km/h or mph?",
          "Write down the chassis number from the car itself and check it matches the registration card (mulkiya) the seller is holding.",
          "Ask the seller straight out, and listen to how the answer arrives.",
          "If the answer still matters to the price you are paying, ring the franchise dealer’s service desk with the chassis number and ask whether they hold any history for it.",
        ]}
      />

      <H2 id="door-label">The label in the door frame — read it, do not guess</H2>
      <P>
        This is the check nobody writes about properly, and it is the strongest
        one you can do with your own eyes.
      </P>
      <P>
        A car built to be sold new in the United States carries a certification
        label, normally in the driver’s door frame or on the door edge. It is
        printed in English, it carries the month and year of manufacture, and it
        contains a sentence to the effect that the vehicle{" "}
        <em>conforms to all applicable US Federal Motor Vehicle Safety
        Standards</em>. Under the bonnet there is usually a second label — the
        emission control information — which refers to United States EPA
        regulations. Those two sentences are not marketing. They are there
        because American law required them at the moment the car was built, and
        they are the closest thing to a signature on the question you are asking.
      </P>
      <P>
        A car supplied new through a Gulf distributor generally will not carry
        those sentences. Its label commonly carries Arabic alongside English, and
        the details it prints — weights, tyre pressures, the address of the
        responsible company — point to the region rather than to a US importer.
      </P>
      <P>
        Two honest qualifications. Label layouts differ between manufacturers and
        between model years, so what you are looking for is the{" "}
        <em>content</em> — an explicit reference to US federal standards — not a
        particular shape or colour of sticker. And labels can be missing on an
        older car, or painted over after body repair. A missing label is not
        proof of anything except that you need the next check.
      </P>
      <Callout title="What we cannot show you yet">
        <P className="mb-0">
          The right version of this section has photographs: a real Gulf-market
          door label and a real US-market one, side by side, taken on cars in
          Oman. We do not have them yet, so we have described what to read
          instead of showing it. When we have the photographs, they go here and
          this page gets re-dated.
        </P>
      </Callout>

      <H2 id="vin">
        The chassis number: what it tells you, and what it does not
      </H2>
      <P>
        A chassis number — the VIN — is 17 characters. The first three are the
        World Manufacturer Identifier, and they encode <em>who built the car and
        in which country</em>. They do not encode which market the car was built
        for.
      </P>
      <H3>Where “it starts with W” comes from, and why it is wrong</H3>
      <P>
        <strong>W is the German WMI range.</strong> A VIN beginning with W means
        a German manufacturer built the car — a Volkswagen, an Audi, a Mercedes,
        a BMW built in Germany. That is all it means. It is repeated across
        page after page of advice as a GCC-spec test, and as a test it fails in
        both directions at once:
      </P>
      <UL
        items={[
          "A German-built car sold new in Chicago has a VIN starting with W. It is an American-market car with a “GCC” letter on the front of its chassis number.",
          "A GCC-spec Toyota Corolla built in Japan has a VIN starting with J. A GCC-spec car assembled in Korea starts with K. Neither has ever been near a W.",
          "Manufacturers supply the same model to the Gulf from different plants in different years. The plant is a fact about a factory, not about a showroom.",
        ]}
      />
      <P>
        So: if someone tells you a car is GCC spec because of the first letter of
        its chassis number, they are repeating something they read. It is the
        single most common piece of wrong advice in this subject, and correcting
        it is most of the reason this page exists.
      </P>
      <H3>What the VIN is genuinely good for</H3>
      <UL
        items={[
          "Identity. Match the number stamped on the car to the number printed on the mulkiya, character by character. If they differ, stop — that is a finding that ends the deal, not one you negotiate about.",
          "Model year. The tenth character encodes the model year, which is a useful cross-check against what the seller told you and what the registration says.",
          "A North-American clue, used carefully. Vehicles built to be sold in the United States and Canada carry a check digit in the ninth position, calculated from the rest of the number. Working it out by hand is fiddly and getting it wrong is easy, so treat this as something that supports the door label — never as a substitute for reading the door label.",
        ]}
      />
      <P>
        And a warning about what a paid “VIN history report” buys you here: those
        services read North American records. For a car that was sold new in the
        United States, one can tell you about its American life. It cannot tell
        you what happened to the car after it landed in the Gulf, because no
        such database is being read. That limitation is rarely stated by the
        people selling the reports.
      </P>

      <H2 id="the-myths">Speedometer, mirror text and the air-conditioning story</H2>
      <P>Three popular tests, ranked by how much they actually prove.</P>
      <H3>The speedometer: useful, not conclusive</H3>
      <P>
        A car built for the American market shows mph as the dominant scale, with
        km/h smaller or on the digital display. A Gulf-market car reads km/h
        first. It is a good, fast signal — and it is a signal, not a proof,
        because instrument clusters get replaced and some markets print both
        scales at similar size.
      </P>
      <H3>Arabic on the mirror: weak</H3>
      <P>
        The warning etched on a passenger door mirror is printed in the language
        of the market the car was built for, so Arabic text is a genuine hint.
        But mirrors are one of the most commonly replaced parts on a used car,
        and a replacement is sourced from whatever the parts shop had. Do not
        build a decision on it.
      </P>
      <H3>“GCC cars have stronger air-conditioning”: half true, and misused</H3>
      <P>
        Cars specified for this region are generally built with hotter climates
        in mind. But the air-conditioning in the car in front of you tells you
        about that specific car’s maintenance far more than about the market it
        was sold into. A neglected Gulf-spec system blows warm; a maintained
        American-spec one can be perfectly cold. Test the air-conditioning
        because you need to know whether it works — not as a way of guessing the
        car’s origin.
      </P>

      <H2 id="asking">Asking the seller, and reading the answer</H2>
      <P>
        Ask directly: “خليجي ولا وارد؟” — is it Gulf-spec or imported? You will
        get one of four answers, and each one tells you something different
        about the rest of the conversation.
      </P>
      <UL
        items={[
          "“Imported, from America” — said without being pressed. The best answer there is. This person is pricing the car honestly and probably telling you the truth about the rest of it too.",
          "“GCC, one hundred per cent” — fine, and now check it. Confidence is not evidence, and a seller can be repeating what he was told when he bought it.",
          "“I do not know, I bought it like this” — completely reasonable on a fifteen-year-old car that has had four owners. Check it yourself and price it as an import unless the car says otherwise.",
          "“Why does it matter? The car is perfect.” — the answer to a different question. Note it, and check the car harder than you were going to.",
        ]}
      />
      <P>
        None of these is a reason to walk away on its own. The point of asking
        early is that it costs nothing, and the way somebody answers a simple
        factual question about their own car is the cheapest character reference
        you will get all day.
      </P>

      <H2 id="mulkiya">What the mulkiya tells you</H2>
      <P>
        Read the registration card with the seller. Match the chassis number, the
        plate, the model year and the owner’s name to the car and to the person
        standing in front of you. That much you should do on every car you look
        at, for reasons that have nothing to do with spec.
      </P>
      <P>
        On the specific question of whether the card records import origin, we
        are not going to tell you which field to look at, because we could not
        confirm on an official ROP source that it records one. If it matters to
        your decision, ask at an ROP service centre or through the ROP app rather
        than trusting a website — including this one.
      </P>

      <H2 id="import-risk">The risk that actually matters with an import</H2>
      <P>
        It is not the badge and it is not the spec sheet. It is that a portion of
        the cars exported out of North America are sold there because they are
        damaged — accident write-offs, flood cars, insurance salvage — and that
        the paperwork recording that damage does not travel with the vehicle.
        Once a car has been registered here, its American title status is not
        something you can look up locally.
      </P>
      <P>
        So the practical rule for an import is: assume nothing is recorded, and
        inspect harder. Damp or musty smell, silt in the spare-wheel well, rust
        on seat rails and seat-belt bolts, electrical faults that come and go,
        mismatched panel gaps, fresh underseal on an otherwise unremarkable car.
        If the car is worth OMR 3,000 to you, a paid inspection before you buy is
        a small proportion of that, and it is the best money in the process.
      </P>

      <H2 id="resale">What GCC spec is worth in real money</H2>
      <P>
        Here is where most articles give you a percentage. We are not going to,
        because we have not measured it, and a made-up number on this page would
        undermine everything else on it.
      </P>
      <P>What we can tell you honestly:</P>
      <UL
        items={[
          "The premium exists and it runs in one direction. GCC-spec cars ask more than comparable imports in this market. Nobody in Oman prices an import higher for being an import.",
          "It is larger on cars where buyers are nervous — European models, anything complicated, anything where a US-market variant differs mechanically — and smaller on the plainest, most common cars in this band.",
          "You pay it going in and you get it back going out. If you buy an import at the import price and sell at the import price, the discount cost you nothing. It costs you only if you paid a GCC price for a car that turns out not to be one.",
        ]}
      />
      <P>
        Which is exactly why the checks above matter more than the number. The
        loss is not “imports are worth less”. The loss is “I paid GCC money for
        an import”.
      </P>

      <H2 id="when-import-is-fine">When an import is the right buy</H2>
      <P>
        Plenty of the time. An import is not a defect, and anyone who tells you
        every US-import is a trap is selling something.
      </P>
      <UL
        items={[
          "You are buying for the cheapest sound transport you can find and you plan to keep the car for years. The resale discount only bites if you sell.",
          "The car is a common model with plentiful parts, it inspects clean, and the price genuinely reflects its status.",
          "The seller states it is an import without being asked. That is worth more than a spec label — it tells you what kind of person you are dealing with.",
          "The specific car is better than the GCC-spec alternative you can afford. A well-kept import at OMR 3,000 beats a tired Gulf-market car at the same money, every time.",
        ]}
      />
      <P>
        The one situation to walk away from is not “it is an import”. It is “it
        is an import and the seller told me it was not”. That is not a
        specification problem, it is an honesty problem, and it applies to
        everything else they told you.
      </P>

      <H2 id="what-we-do">What Autosouq does about this</H2>
      <P>
        Being accurate about our own position matters on a page about accuracy.
      </P>
      <P>
        Spec disclosure is not something the big platforms hide. OpenSooq labels
        regional spec on its car listings and Dubizzle has an explicit GCC /
        Import field — we checked both on 25 July 2026, and every OpenSooq
        listing in our 150-listing sample carried a spec label. What is true on
        those platforms, and on ours, is that the label starts life{" "}
        <em>seller-declared</em>. A field is not a check.
      </P>
      <P>
        What we will claim is narrower and we think it is worth more: every car
        on Autosouq is between OMR 1,000 and 6,000, we state the import origin —
        including when the seller has not stated it — and nothing gets promoted
        above anything else for money. That last one is not a small thing at this
        end of the market: when we sampled OpenSooq’s first three pages, they
        were entirely paid placements, and the median price rose the deeper we
        went. The affordable band is there; it is just underneath.
      </P>
      <P>
        You can see how the disclosure looks on{" "}
        <Link className="fw-6" href="/used-cars">
          every car on Autosouq
        </Link>
        , what we do and do not verify on{" "}
        <Link className="fw-6" href="/how-it-works">
          how it works
        </Link>
        , and the short answers on the{" "}
        <Link className="fw-6" href="/faq">
          FAQs
        </Link>
        .
      </P>

      <H2 id="next">Read next</H2>
      <UL
        className="mb-40"
        items={[
          <>
            <Link className="fw-6" href="/guides/check-fines-before-buying-oman">
              Check the car, not just the seller
            </Link>{" "}
            — fines and restrictions follow the vehicle and will block your
            transfer.
          </>,
          <>
            <Link className="fw-6" href="/guides/transfer-car-ownership-oman">
              How to transfer a car into your name
            </Link>{" "}
            — the ROP process, and the 24-hour window people get caught by.
          </>,
          <>
            <Link className="fw-6" href="/guides/used-car-scams-oman">
              Used-car scams in Oman
            </Link>{" "}
            — including the one where the car is sold as GCC spec and is not.
          </>,
        ]}
      />

      <Sources
        items={[
          {
            href: "https://www.rop.gov.om/english/VehicleOwnershipTransfer.aspx",
            label: "Royal Oman Police — Vehicle Ownership Transfer",
            note: "the conditions a transfer has to meet; read before you agree a price",
          },
          {
            href: "https://www.rop.gov.om/",
            label: "Royal Oman Police",
            note: "the authority on registration, inspection and import questions",
          },
        ]}
      />
      <P className="mb-0">
        The OpenSooq and Dubizzle observations on this page come from our own
        competitor research, run on 25 July 2026: 150 listings sampled across
        five pages of{" "}
        <Source href="https://om.opensooq.com/en/cars/cars-for-sale">
          om.opensooq.com
        </Source>
        , plus listing pages on{" "}
        <Source href="https://www.dubizzle.com.om/en/vehicles/cars-for-sale/">
          dubizzle.com.om
        </Source>
        . Listing counts and mixes on those sites change daily.
      </P>
    </>
  );
}
