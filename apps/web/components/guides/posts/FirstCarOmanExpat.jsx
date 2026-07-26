import { Link } from "@/i18n/navigation";
import React from "react";
import { Callout, H2, H3, OL, P, Source, Sources, UL } from "@/components/guides/Prose";

/**
 * Guide #5 — brief: design/research/blog-keyword-briefs.md §4 #5.
 *
 * The hub for the expat segment: it links out to the other four guides rather
 * than repeating them.
 *
 * Editorial constraint from the brief, and it is a real one: plain English, no
 * idioms, short paragraphs, phone-first. The reader may be reading in their
 * third language on a small screen.
 *
 * Deliberately absent, because none of it could be verified against a primary
 * source: residency/licence requirements (pointed at the ROP instead), any OMR
 * price table, insurance premiums, fuel prices, registration and inspection
 * fees, and any monthly running-cost total. The page gives the reader a
 * worksheet and tells them where to get their own numbers.
 */
export default function FirstCarOmanExpat() {
  return (
    <>
      <P>
        Buying your first car in Oman is mostly straightforward. The parts that
        catch people out are the order things have to happen in, and a handful of
        checks that are easy to run and expensive to skip.
      </P>
      <P>
        This walkthrough is written for someone on a resident visa buying an
        affordable used car — the OMR 1,500–6,000 band this site covers. It goes
        in the order you will actually do it, and it links to the detailed guides
        where a step deserves its own page.
      </P>

      <H2 id="before-you-start">Before you start: what you need</H2>
      <P>
        You need to be able to register a car in your name and to drive it
        legally. In practice that means your residency status, your identity
        documents and your driving licence all need to be sorted first.
      </P>
      <P>
        We are not going to list the exact requirements here. They depend on your
        residency status and on which country issued your licence, and they are
        set by the Royal Oman Police — not by a marketplace. Getting this wrong
        costs you a wasted trip at best, so check it with the source:{" "}
        <Source href="https://www.rop.gov.om/">rop.gov.om</Source>, the ROP app,
        or an ROP licensing office. Employers with a lot of expatriate staff
        usually know the current process well too, and asking a colleague who did
        it recently is not a bad first step.
      </P>
      <P>
        One thing you can settle early regardless: an Omani mobile number that
        works with WhatsApp. Practically every car conversation in this country
        happens there.
      </P>

      <H2 id="what-your-money-buys">What your budget realistically buys</H2>
      <P>
        Here is where most guides print a table of prices. We are not going to,
        because we have not measured one, and an invented table would be the
        single most misleading thing we could put on this page. Prices move,
        condition varies enormously at this end of the market, and two cars of
        the same year and model can be a thousand rials apart for good reasons.
      </P>
      <P>What we can tell you is the shape of the market you are entering.</P>
      <H3>The cars you will actually be looking at</H3>
      <P>
        From our own sampling of Omani listings in July 2026, the models that
        turn up most often in this band are unglamorous and that is the point:
        Nissan Altima and Sunny, Toyota Camry, Corolla and Yaris, Honda Accord,
        Hyundai Elantra and Accent, Mitsubishi Lancer and Pajero. Ordinary
        sedans, mostly a decade or more old, mostly with a lot of kilometres on
        them.
      </P>
      <P>
        That is good news for a first car. Parts are everywhere, every garage in
        the country has worked on them, and nothing about them is a mystery.
      </P>
      <H3>What changes as you move up the band</H3>
      <UL
        items={[
          "Towards the bottom of the band, you are buying condition and service history far more than you are buying a model or a year. A well-kept older car beats a neglected newer one, every time.",
          "In the middle, you start getting a choice: the same money buys either a newer car with high mileage or an older one that has done less.",
          "Nothing above OMR 6,000 is listed here at all — that is the whole point of this site — so if your budget goes past it, you are shopping somewhere else and this guide still applies to the checks.",
        ]}
      />
      <P>
        The way to build your own price sense is boring and it works: spend an
        evening looking at listings for one model, in one rough year range, on
        more than one site. After forty cars you will know when something is
        underpriced, and — more usefully — you will start asking why.
      </P>

      <H2 id="which-car">Choosing the car: what matters more than the badge</H2>
      <P>
        For a first car in this band, four things decide whether you enjoy owning
        it. The model name is not one of them.
      </P>
      <UL
        items={[
          "Parts and garages. A car that every garage in the country knows is cheaper to keep on the road than a rarer, nicer one. This is the single biggest running-cost decision you will make, and you make it before you buy.",
          "The air conditioning. In an Omani summer a weak air conditioner does not make a car uncomfortable, it makes it unusable — and on an affordable car the repair can be a serious fraction of what you paid. Test it hard, in the afternoon.",
          "Condition and history over year and mileage. Two identical cars from the same year can be a thousand rials and three years of trouble apart.",
          "Size and use. If your driving is Muscat traffic and a monthly run out of the city, a plain sedan is cheaper to buy, cheaper to fuel and easier to sell than a large four-wheel drive bought for trips you might take.",
        ]}
      />
      <P>
        And think about the end at the beginning. If there is a chance you will
        leave Oman in a couple of years, you are going to sell this car —
        probably in a hurry, possibly to another expat. Common models in ordinary
        colours with clean paperwork sell in days. Anything unusual sits.
      </P>

      <H2 id="where-to-buy">Where people actually buy</H2>
      <P>Four routes, with honest trade-offs.</P>
      <H3>Online marketplaces</H3>
      <P>
        The biggest inventory by a wide margin, and where most people start. The
        trade-off is that you are doing all the filtering yourself, listings can
        sit long after a car has sold, and on the largest sites paid promotion
        decides what you see first — when we sampled OpenSooq’s cars-for-sale
        section on 25 July 2026, the first three pages were entirely promoted
        listings and the median price rose the further in we went.
      </P>
      <H3>The dealer areas</H3>
      <P>
        People will point you at the used-car areas around Al Wattayah, Wadi
        Kabir, Rusayl and Al Khuwair. Going in person is the fastest way to see a
        lot of cars in an afternoon and to learn what your money looks like in
        metal. Prices are negotiable, and the first number is not the number.
      </P>
      <H3>Private sellers</H3>
      <P>
        Usually the best prices, and you get to meet the person who drove the car
        and ask how it has been treated. It also puts every check on you: fines,
        restrictions, finance, spec and condition. That is manageable, and this
        guide is largely about how.
      </P>
      <H3>Friends, colleagues and community groups</H3>
      <P>
        A large share of affordable cars in Oman change hands inside expat
        communities, particularly when somebody is leaving the country. The car
        comes with a known history, which is genuinely valuable. Run the same
        checks anyway — a friendly seller can be as unaware of a restriction on
        their car as a stranger.
      </P>

      <H2 id="vocabulary">The words you will see in listings</H2>
      <P>
        A lot of car listings in Oman are written in Arabic even on
        English-language sites, and a handful of words carry most of the meaning.
        Knowing these six will save you a great deal of guessing.
      </P>
      <UL
        items={[
          "خليجي (khaleeji) — GCC spec. The car was originally supplied to this region.",
          "وارد (wared) — imported. Usually followed by where from: وارد أمريكي is an American import, وارد اليابان a Japanese one.",
          "الممشى (al-mamsha) — the mileage, literally how far it has walked. This is the everyday Gulf word; you will see it far more often than “kilometres”.",
          "الموديل (al-moudail) — the model year.",
          "مستعملة (musta’mala) — used.",
          "كسر زيرو (kasr zero) — literally “broken zero”: nearly new, barely driven. You will not see much of this in the OMR 1,500–6,000 band.",
        ]}
      />
      <P>
        Two phrases to read carefully rather than trust. “بدون حوادث” — no
        accidents — is the seller’s claim, not a record, and there is no
        accident-history database you can check it against here. And a spec label
        of any kind, on any site including this one, starts life as something the
        seller typed. It is a starting point for your own five-minute check, not
        a substitute for it.
      </P>
      <P>
        If you are messaging in English and the seller replies in Arabic, keep
        going — most sellers are used to it, phone keyboards translate, and a
        deal in this band has been done in worse conditions than a language gap.
      </P>

      <H2 id="private-vs-dealer">Private seller or dealer: what changes for you</H2>
      <UL
        items={[
          "Price: a private seller is usually cheaper, because there is no business to run on the margin.",
          "Paperwork: a dealer does this every week and it will probably be smoother. A private seller may be doing it for the first time, like you.",
          "Recourse: at this end of the market, assume there is none in either case unless something is written down. Cars are sold as they are.",
          "Pressure: dealers are professionals at closing and you are not. It is fine to say you will think about it and come back. A car that is only a good deal if you decide today is not a good deal.",
        ]}
      />

      <H2 id="shortlisting">Shortlisting without losing every weekend</H2>
      <P>
        The most tiring part of buying a first car here is travelling across
        Muscat to look at something you could have ruled out in three messages.
        Ask these before you agree to meet:
      </P>
      <OL
        items={[
          "Is it GCC spec or imported? However they answer, you will check yourself — but ask.",
          "What is the current mileage today, and can you send a photograph of the odometer?",
          "Is the registration valid, and are there any fines on the car?",
          "Is there any loan or finance registered against it?",
          "Is the car in your name on the mulkiya?",
          "What has been replaced or repaired in the last year, and is there any service history?",
          "Why are you selling it?",
        ]}
      />
      <P>
        Seven questions, two minutes to type, and they eliminate most of a
        shortlist. A seller who answers all seven plainly is worth driving to see
        even if the car is slightly dearer than the next one — you are buying the
        car and the information about it, and the second part is what stops the
        first part from being a gamble.
      </P>
      <P>
        Keep a note of what you saw, what it was priced at and what it needed.
        After five cars the market stops being a wall of listings and starts
        being a set of comparisons, which is the moment you stop overpaying.
      </P>

      <H2 id="inspection">Looking at the car: what to check yourself, what to pay for</H2>
      <P>
        Do your own look first. It is not about being an expert — it is about
        deciding whether to spend money on a proper inspection.
      </P>
      <H3>Twenty minutes, on your own</H3>
      <OL
        items={[
          "Look at it in daylight, and never in the rain. Wet paint hides a great deal.",
          "Panel gaps and paint texture: mismatched gaps or a slightly different finish on one panel means a repair. A repair is not a disaster; not being told about it is a question.",
          "Test the air conditioning properly. In an Omani summer this is not a comfort feature. Run it for ten minutes, at idle and while moving, in the afternoon rather than the cool of the morning, and satisfy yourself it is genuinely cold.",
          "Under the bonnet, cold: check the oil, look for leaks, look at the coolant. Then start it and listen before it warms up.",
          "Smell the interior. A strong air freshener in a car being sold is a question, not a courtesy — damp and mould smell are the two things it hides.",
          "Wear versus the odometer: the seat, the steering wheel, the pedals and the gear selector wear on a schedule. If they disagree with the number on the dash, believe them.",
          "Drive it. On a straight road, hands loose: does it pull? Does it brake straight? Does the gearbox change without hunting or jerking?",
        ]}
      />
      <H3>Then pay somebody</H3>
      <P>
        If the car survives your look and you are serious, get it inspected by a
        garage or an inspection service before you pay. On a car costing several
        thousand rials this is a small proportion of the purchase and it is the
        best money in the entire process.
      </P>
      <P>
        We are not printing inspection prices, because we have not called around
        and confirmed them. Ring three places, ask what is included and whether
        you get a written report, and ask whether they will do it where the car
        is or whether it has to come to them.
      </P>
      <P>
        One more thing, and it is the most useful sentence in this section: a
        seller who will not let you have the car inspected has answered your
        question. You do not need the report.
      </P>

      <H2 id="spec">GCC spec or import — check it, do not guess</H2>
      <P>
        In this price band, a large share of cars were originally sold in North
        America and imported afterwards. That is not a defect and it is not a
        reason to walk away — but it changes what the car is worth, and you
        should know which one you are buying before you agree a price.
      </P>
      <P>
        Ignore the advice you will meet everywhere that a chassis number starting
        with W means GCC spec. It does not — W identifies a German manufacturer,
        which is a fact about the factory, not about the market the car was built
        for.{" "}
        <Link className="fw-6" href="/guides/gcc-spec-vs-american-import">
          The checks that actually prove something are here
        </Link>{" "}
        and they take five minutes with the door open.
      </P>

      <H2 id="paperwork">The paperwork, in the right order</H2>
      <P>
        This is the part first-time buyers get wrong, and it is nearly always a
        sequencing mistake rather than a documents mistake.
      </P>
      <OL
        items={[
          "Check fines and restrictions with the seller, before you agree the price.",
          "Ask whether there is any loan or mortgage on the car — before you view it, ideally.",
          "Agree the price, and agree out loud that payment and transfer happen together.",
          "Arrange your insurance, in your name, for that specific car. It comes before the transfer, not after.",
          "Do the transfer through the ROP, with the money moving at the same time.",
          "Collect the new registration with your name on it, and check the chassis number on it against the car before you leave.",
        ]}
      />
      <P>
        The two guides that cover this properly:{" "}
        <Link className="fw-6" href="/guides/check-fines-before-buying-oman">
          checking fines, restrictions and hidden loans
        </Link>
        , and{" "}
        <Link className="fw-6" href="/guides/transfer-car-ownership-oman">
          the ROP transfer itself
        </Link>{" "}
        — including the 24-hour window between the seller creating the
        transaction and you completing it, which is the single most common
        practical trip-up.
      </P>
      <Callout title="The rule that protects you">
        <P className="mb-0">
          No money before the mulkiya moves. No deposit to hold a car, no cash
          today with paperwork next week, no exceptions for a good story. Until
          the registration is in your name, the car is not yours — and neither
          are its problems, which is exactly why they stay with it.
        </P>
      </Callout>

      <H2 id="insurance">Insurance: how to think about it</H2>
      <P>
        Cover has to be in your name before the transfer, so this is not a
        job for afterwards. Two practical decisions.
      </P>
      <H3>Third-party or comprehensive?</H3>
      <P>
        The honest way to think about it on an affordable car is arithmetic
        rather than instinct. Comprehensive cover pays towards your own car;
        third-party does not. So the question is what your car is actually worth,
        against what the extra cover costs each year, and how much of a claim you
        would have to pay yourself before the policy starts paying.
      </P>
      <P>
        On a car worth a few thousand rials, that sum can go either way, and it
        depends on numbers only you can get — your quotes, for your car, with
        your details. What we will say is that nobody selling you a policy is
        neutral about the answer, so do the sum yourself. And whichever you
        choose, the legal minimum is not optional and the cover has to be real
        before you drive.
      </P>
      <H3>Getting quotes</H3>
      <UL
        items={[
          "Have the car’s details ready: chassis number, model year, registration details. Ask the seller for them while you are still deciding.",
          "Get more than one quote. Prices for the same car and the same driver are not the same everywhere.",
          "Ask what is excluded and what you pay per claim, not only what the annual figure is.",
          "Ask what happens if you leave Oman mid-policy — it is a normal question here and the answer varies.",
        ]}
      />
      <P>
        We are not printing premium figures on this page. Insurer pricing moves,
        it varies with your age and licence history, and a number copied from a
        page written last year is worse than no number at all.
      </P>

      <H2 id="running-costs">What it costs to run</H2>
      <P>
        We are not going to give you a monthly figure, and we would rather explain
        why than quietly leave it out. Fuel prices in Oman are set monthly and the
        pages that rank when you search for them are frequently years out of date
        — we found one still ranking with prices from 2020. Insurance depends on
        your age, your licence history and the car. Registration and inspection
        fees we could not confirm from an official source. Multiplying four
        uncertain numbers together produces a confident-looking total that is
        wrong.
      </P>
      <P>
        So here is the worksheet instead. Fill it in with your own numbers before
        you buy, not after.
      </P>
      <UL
        items={[
          "Fuel: your realistic kilometres per month, divided by the car’s consumption, times the current pump price. Take the price from this month’s official announcement, not from an article you found in a search.",
          "Insurance: get two or three real quotes for the specific car you are considering, with your details. Quotes are free and take minutes.",
          "Registration renewal, and inspection if the car needs one: confirm these with the ROP rather than a website.",
          "Servicing: ask a garage what a basic service costs for that model, and how often it is due.",
          "Tyres: check the date codes on the ones fitted. Tyres age in this heat whether or not you drive on them, and four tyres is a real number.",
          "A repair fund. Nobody budgets for this and everybody needs it. On an affordable used car, set aside something every month and be pleasantly surprised in the months you do not use it.",
        ]}
      />
      <P>
        The reassuring part: for most people in this band, the car itself is the
        big number and the running is manageable. But you want to know that from
        your own arithmetic, not from a stranger’s table.
      </P>

      <H2 id="first-week">Your first week with the car</H2>
      <P>
        A used car at this end of the market has usually been maintained to
        “running”, not to “looked after”. A small amount of work in the first
        week buys you a quiet year.
      </P>
      <UL
        items={[
          "Check the registration card again: your name, the chassis number, the plate. Mistakes are rare and much easier to fix immediately.",
          "Run the fines check once more a week after the transfer, so anything that surfaces is a surprise you catch rather than one that waits for renewal.",
          "Change the oil and the oil filter unless you have a receipt showing when it was last done. It is the cheapest insurance there is.",
          "Look at the air filter and the cabin filter. Dust here fills both far faster than the service book assumes, and a blocked cabin filter is one of the reasons an air conditioner feels weak.",
          "Check the tyre date codes, the pressures and the spare. Heat ages tyres whether or not you drive on them.",
          "Check the coolant and the battery. Both live hard lives in this climate, and both strand you when they fail.",
          "Put the ROP app on your phone, and keep a photograph of your registration and insurance where you can find them offline.",
        ]}
      />

      <H2 id="timeline">A realistic timeline</H2>
      <P>
        People underestimate this and then rush the last step, which is the only
        one where rushing costs money. From a standing start, allow:
      </P>
      <UL
        items={[
          "A week or two of looking at listings before you see anything in person. This is where you learn what your budget is worth, and it is not wasted time.",
          "Two or three weekends of viewings. Five cars is a reasonable number before you commit; three is thin.",
          "A few days between finding the car and completing: inspection, insurance quotes, and a time when you and the seller both have a clear hour.",
          "One afternoon for the transfer itself, plus the twenty-four-hour window between the seller creating the transaction and you completing it.",
        ]}
      />
      <P>
        If you need a car urgently — you have started a job in Rusayl and there is
        no bus — the honest advice is to hire or borrow for a fortnight rather
        than compress the search. Every expensive mistake on the list below is
        made faster by being in a hurry.
      </P>

      <H2 id="mistakes">Mistakes first-time buyers make here</H2>
      <UL
        items={[
          "Paying a deposit to hold a car they have not seen. There is never a reason.",
          "Buying the first car they look at, because the search is tiring and the seller is nice. Look at five.",
          "Testing the air conditioning at nine in the morning in the shade, and discovering the truth in August.",
          "Believing the odometer instead of the seat and the steering wheel.",
          "Taking “I will transfer it next week” at face value, because the price was good and the seller seemed decent. Decent people also travel, get busy, and stop answering.",
          "Skipping the inspection to save a small amount on a purchase costing thousands.",
          "Arranging insurance after the transfer instead of before, then finding the transfer will not run.",
          "Paying GCC-spec money for an import because a website said the VIN starts with W.",
        ]}
      />

      <H2 id="where-we-fit">Where Autosouq fits</H2>
      <P>
        We are a listings site, not a dealer. We do not sell cars, we never hold
        your money, and we are not in the middle of your deal. What we do is
        narrow and we would rather state it plainly than dress it up: every car
        listed is between OMR 1,500 and 6,000, we check the asking price is real
        and the listing matches the car, we state the import origin — including
        when the seller has not — and nothing gets pushed up the page because
        somebody paid for it.
      </P>
      <P>
        Cars listed under OMR 1,500 carry a <strong>sold as-is</strong> label:
        no warranty, no returns, bought in the condition it is in.{" "}
        <Link className="fw-6" href="/how-it-works">
          How it works
        </Link>{" "}
        sets out exactly what we check and what we do not. When you are ready,{" "}
        <Link className="fw-6" href="/used-cars">
          the cars are here
        </Link>{" "}
        and the{" "}
        <Link className="fw-6" href="/faq">
          FAQs
        </Link>{" "}
        answer most of what is left. If you are selling rather than buying, start
        at{" "}
        <Link className="fw-6" href="/sell-your-car">
          sell your car
        </Link>
        .
      </P>

      <H2 id="next">Read next</H2>
      <UL
        className="mb-40"
        items={[
          <>
            <Link className="fw-6" href="/guides/gcc-spec-vs-american-import">
              GCC spec or American import?
            </Link>{" "}
            — the five-minute check in the car park.
          </>,
          <>
            <Link className="fw-6" href="/guides/check-fines-before-buying-oman">
              Check the car, not just the seller
            </Link>{" "}
            — fines, restrictions and hidden loans.
          </>,
          <>
            <Link className="fw-6" href="/guides/transfer-car-ownership-oman">
              How to transfer a car into your name
            </Link>{" "}
            — the ROP process, start to finish.
          </>,
          <>
            <Link className="fw-6" href="/guides/used-car-scams-oman">
              Used-car scams in Oman
            </Link>{" "}
            — the patterns, and what to send back.
          </>,
        ]}
      />

      <Sources
        items={[
          {
            href: "https://www.rop.gov.om/",
            label: "Royal Oman Police",
            note: "licensing, registration and vehicle services — the authority on what you need",
          },
          {
            href: "https://www.rop.gov.om/english/VehicleOwnershipTransfer.aspx",
            label: "Royal Oman Police — Vehicle Ownership Transfer",
            note: "the transfer conditions and the 24-hour window; checked 25 July 2026",
          },
          {
            href: "https://www.rop.gov.om/english/TrafficFinesPayment.aspx",
            label: "Royal Oman Police — Traffic Fines",
            note: "check a car’s fines by plate and ID before you commit",
          },
        ]}
      />
    </>
  );
}
