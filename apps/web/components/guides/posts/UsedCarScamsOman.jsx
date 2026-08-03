import { Link } from "@/i18n/navigation";
import React from "react";
import { Callout, H2, H3, P, Source, Sources, UL } from "@/components/guides/Prose";

/**
 * Guide #3 — brief: design/research/blog-keyword-briefs.md §4 #3.
 *
 * Legal care, per the brief and per design/research/competitor-analysis.md §0:
 *
 *  - Describe scam *patterns* that run on platforms. Never say or imply that
 *    OpenSooq or Dubizzle are themselves fraudulent — they are platforms hosting
 *    bad actors, both ship verification and spec disclosure, and the evidence
 *    does not support the "full of scams" framing at all. The page says so
 *    explicitly, because a reader who uses those sites daily will know it.
 *  - Never name an individual seller.
 *  - The only documented, local, dated case is the Oman Observer column of
 *    6 October 2025. It is cited by name, author and date, and described for
 *    what it actually is: seller-side phishing during the sale of a guitar.
 *    Do not let it drift into "a car scam" in a future edit.
 *  - No victim counts, no loss figures, no "studies show". None exist.
 */
export default function UsedCarScamsOman() {
  return (
    <>
      <P>
        Most of what is written about used-car scams was written for America, and
        it sends you to registries that do not cover a car registered in Oman.
        This page is about the patterns that actually run here, what each one
        sounds like when it is happening to you, and what to send back.
      </P>
      <P>
        One thing before the list, because it is more useful than the list.
      </P>

      <H2 id="the-rule">The rule that defeats most of them</H2>
      <Callout title="No money before the mulkiya moves">
        <P className="mb-0">
          Not a deposit. Not a holding fee. Not half now. Not “just something
          small so I know you are serious”. The money and the transfer happen at
          the same time, in the same place, or they do not happen.
        </P>
      </Callout>
      <P>
        Almost every pattern below is an attempt to get money to move before
        ownership does. Once you hold that line, most of them have nothing left
        to do. The rest of this page is really about recognising the pressure
        early enough to enjoy holding it.
      </P>
      <P>
        The second rule is smaller and nearly as useful:{" "}
        <strong>urgency is the product</strong>. Another buyer on the way, a
        flight tomorrow, a price that expires this evening — the pressure is not
        a coincidence, it is the mechanism. A real seller with a fairly priced
        car does not need you to decide in ten minutes.
      </P>

      <H2 id="deposit">The deposit hold</H2>
      <P>
        <em>“Someone else is coming to see it at six. Send OMR 100 and I will
        hold it for you.”</em>
      </P>
      <P>
        The oldest one, and the one that still works, because it asks for an
        amount small enough that losing it would be annoying rather than
        catastrophic. Sometimes there is no car. Sometimes there is a car, it
        belongs to somebody else, and its photographs are being used by three
        people at once. Sometimes the car exists, the seller is real, and he is
        collecting deposits from four buyers for the same vehicle and will
        return three of them slowly, or not at all.
      </P>
      <P>
        There is no situation in a private used-car sale in Oman that requires
        you to send money to someone you have not met, for a car you have not
        seen.
      </P>
      <Callout title="What to say">
        <P className="mb-0">
          “I do not pay deposits, but I can come now. If it sells before I get
          there, no problem.”
        </P>
      </Callout>
      <P>
        A genuine seller is pleased — you are the buyer who turns up. A scammer
        stops replying, and you have lost nothing but a message.
      </P>

      <H2 id="bait-pricing">Bait pricing: the car that is always just sold</H2>
      <P>
        A clean car, a couple of thousand rials below anything comparable, good
        photographs. You message. It has just gone — but there is another one,
        slightly more, and could you come and see it.
      </P>
      <P>
        The listing was never a car for sale. It was an advertisement for the
        conversation you are now having. Sometimes it is a dealer generating
        walk-ins; sometimes it is the opening of a longer story that ends with a
        transfer request.
      </P>
      <P>
        The tell is arithmetic. Spend twenty minutes looking at what similar
        cars — same model, same rough year, same rough mileage — are actually
        listed at, on more than one site. Prices in this market are not secret,
        and a car priced well below every comparable one is either a story or a
        problem: accident damage, a rolled-back odometer, finance against it, or
        a seller who cannot legally sell it.
      </P>
      <P>
        Being underpriced is not proof of a scam. But it is always a question, and
        a straight seller has a straight answer: leaving the country, needs a
        gearbox, wife has a new car, sitting since Ramadan. Vagueness where an
        answer should be is the signal.
      </P>

      <H2 id="still-available">The “still available?” runaround</H2>
      <P>
        Less a scam than a tax on your week. You ask a question about the car and
        get back a question about you: are you serious, where are you based, can
        you talk on another app. The conversation moves platforms, then moves
        again, and somewhere in the third app the subject changes to a payment
        method.
      </P>
      <P>
        Notice the shape rather than the words: <strong>if the conversation
        keeps moving and the car never gets closer, it is not about the
        car.</strong> Ask something only the owner of that specific vehicle could
        answer — a photograph of the chassis number, the current odometer
        reading, a picture of the car with today’s date written on paper on the
        windscreen. The request is polite, it is normal, and it ends most of
        these conversations immediately.
      </P>

      <H2 id="phishing">The phishing QR code — the one documented Oman case</H2>
      <P>
        This is the only local, dated, named case we can point you at, and it is
        worth reading in the original.
      </P>
      <P>
        On 6 October 2025 the Oman Observer published a first-person column by
        Tariq Al Barwani,{" "}
        <Source href="https://www.omanobserver.om/article/1177678/opinion/business/be-aware-of-opensooq-scams">
          “Be aware of Opensooq scams”
        </Source>
        . His son had listed an item for sale — a guitar, not a car. A supposed
        buyer sent a QR code, presented as part of the platform’s payment system.
        The code led to a site built to look like the real one: the same logo,
        the same colours, similar buttons and fonts. It asked for bank details,
        and finally for the CVV from the back of the card. His son stopped in
        time. The column notes that others he knows did not.
      </P>
      <P>Three things to take from it, stated precisely:</P>
      <UL
        items={[
          "The target was the seller, not the buyer. If you are selling a car, you are in this pattern’s sights as much as any buyer is.",
          "The attack happened off-platform. A cloned website is not the marketplace, and the marketplace could not have stopped a payment it never saw.",
          "The giveaway was the ask, not the design. No legitimate payment for a private car sale in Oman needs the CVV from the back of your card. Nobody pays you by making you enter your card details.",
        ]}
      />
      <P>
        The general form: any QR code, short link or “verification page” that
        arrives in a chat about a car sale and asks for card numbers, a CVV, an
        OTP, or your online banking login. Type addresses yourself. Never enter
        card details to <em>receive</em> money.
      </P>

      <H2 id="odometer">Odometer rollback: when the wear does not match the number</H2>
      <P>
        A digital dashboard is not a certificate. The number can be changed, and
        in a market where mileage moves the price, sometimes it is.
      </P>
      <P>What actually gives it away is that the rest of the car does not agree:</P>
      <UL
        items={[
          "The driver’s seat bolster, the steering-wheel rim, the gear selector and the pedal rubbers are the four things that wear on a schedule. A shiny worn wheel on an “80,000 km” car is a contradiction.",
          "Service stickers in the door frame or under the bonnet, and any stamps in a service book, carry readings and dates. Compare them to what the dash says now.",
          "Ask the franchise dealer’s service desk whether they hold records against the chassis number. If the car was serviced with an agent, there may be a readings history.",
          "Tyres, brake discs and a windscreen that has been replaced tell you about distance too, though they are noisier signals.",
        ]}
      />
      <P>
        A very low reading on a ten-year-old car is not automatically a lie —
        some cars genuinely sit. It just moves the burden of proof onto the
        seller, and a genuine one will have something to show you.
      </P>

      <H2 id="undisclosed-import">Sold as GCC spec, and it is not</H2>
      <P>
        You pay Gulf-market money for a car that was originally sold in North
        America, and find out when you come to sell it and the next buyer runs
        the check you did not.
      </P>
      <P>
        This one is worth understanding properly rather than fearing, because an
        import is not a defect — it is a different car with a different price. The
        checks take five minutes: read the certification label in the driver’s
        door frame, read the emissions label under the bonnet, look at whether
        the speedometer leads in mph or km/h. And ignore the advice you will find
        everywhere that a chassis number starting with W proves the car is GCC
        spec. It does not. W identifies a German manufacturer — where the car was
        built, not the market it was built for.{" "}
        <Link className="fw-6" href="/guides/gcc-spec-vs-american-import">
          The full checklist is here
        </Link>
        .
      </P>
      <P>
        And note who the misinformation costs. A seller who believes the W myth
        is not lying to you when he repeats it; he is wrong. You still overpay.
      </P>

      <H2 id="fines-ambush">The fines and restrictions ambush</H2>
      <P>
        You agree a price, you pay, and the transfer will not run because the car
        or the seller is not clear of fines and restrictions. Now you are the
        person asking for your money back from someone who already has it.
      </P>
      <P>
        The ROP lists being clear of fines and restrictions among its conditions
        for a transfer — it is on their{" "}
        <Source href="https://www.rop.gov.om/english/VehicleOwnershipTransfer.aspx">
          own page
        </Source>
        , and it is not negotiable. Fines are checkable by plate and ID through
        the{" "}
        <Source href="https://www.rop.gov.om/english/TrafficFinesPayment.aspx">
          ROP fines service
        </Source>{" "}
        and the ROP app, with the seller standing beside you, before you agree
        anything.
      </P>
      <P>
        Sometimes this is not a scam at all — the seller genuinely did not know.
        The outcome for your money is identical, which is why you check rather
        than judge.{" "}
        <Link className="fw-6" href="/guides/check-fines-before-buying-oman">
          The ten-minute routine is here
        </Link>
        .
      </P>

      <H2 id="mortgaged">The mortgaged car: the seller is not the only owner</H2>
      <P>
        A car with finance or a mortgage registered against it cannot simply be
        signed over — another party has an interest in it, and clearing that is
        part of the process. The version that hurts is the one where you are told
        afterwards, or told “it is nearly paid off” in a tone that suggests it is
        a detail.
      </P>
      <P>
        Ask before you view: is there any loan, finance or mortgage on this car?
        The question is completely normal and costs you nothing. If the answer is
        yes, the next question is what has to be produced to clear it, and who is
        producing it — and none of your money moves until it is done.
      </P>

      <H2 id="remote-car">The car that is somewhere else</H2>
      <P>
        The car is in another city, or in another country, or “with my brother in
        Dubai”. It can be shipped, delivered, or brought up on a truck — once you
        have paid, or paid something towards it.
      </P>
      <P>
        There is a legitimate version of this: cars really are bought between
        cities in Oman, and people really do import from the UAE. What makes the
        scam version recognisable is that the distance is used as the reason you
        cannot do the ordinary things — see it, inspect it, check the mulkiya,
        meet the owner, transfer and pay in the same sitting.
      </P>
      <P>
        If a car is genuinely worth the trip, take the trip. If it is not worth
        the trip, it is not worth a transfer to a stranger either.
      </P>

      <H2 id="fake-escrow">The “protected payment” that does not exist</H2>
      <P>
        A newer pattern and a persuasive one, because it borrows the language of
        safety. You are told the payment will be held by an escrow service, a
        delivery company, or the marketplace itself, and released when you accept
        the car. A link arrives. The page looks professional.
      </P>
      <P>Two things make this easy to defeat:</P>
      <UL
        items={[
          "Private car sales in Oman are not settled through escrow. If someone introduces a payment intermediary you have never heard of, the intermediary is the scam.",
          "Never reach a payment page through a link somebody sent you. Type the address yourself, or use an app you already had installed before this conversation started.",
        ]}
      />
      <P>
        Autosouq will never hold your money, never take a deposit, and never send
        you a payment link. Neither will any other listings site in this market
        for a private car sale. Anyone claiming otherwise, in our name or in
        anyone else’s, is not who they say they are.
      </P>

      <H2 id="no-address">The dealer with no address</H2>
      <P>
        An account with good photographs, a phone number and no premises. It may
        be an entirely legitimate small trader working from home — plenty are.
        The risk is not that they are all fraudulent; it is that if something
        goes wrong, there is nowhere to go back to.
      </P>
      <UL
        items={[
          "Meet at the car, in daylight, in a public place. If every proposed meeting point is a car park nowhere near where the seller says they are based, ask why.",
          "The name on the mulkiya should be the person selling you the car, or there should be a clear, documented reason it is not. “I am selling it for my friend” is where a great many bad afternoons start.",
          "Take a photograph of the registration card and the seller’s ID together with the car, with the seller’s agreement. A person who will not be photographed alongside the car they are selling has told you something.",
        ]}
      />

      <H2 id="photo-scams">Stolen photographs, and the twenty-second check</H2>
      <P>
        Many fake listings are assembled from photographs taken from a real
        listing somewhere else, sometimes in another country. They look better
        than genuine listings, because a real seller photographs a car in a
        car park with a phone.
      </P>
      <P>
        Save one of the pictures and run a reverse image search on it — long-press
        the image, search the web for it, and see where else it appears. If the
        same car turns up on a dealer’s site in another country, or in a listing
        from 2019, you are done in under a minute.
      </P>
      <P>
        The stronger version of the same check costs nothing: ask for a
        photograph taken right now, with something specific in it — the odometer
        with the engine running, the chassis number, the car next to today’s
        newspaper. Stolen-photo listings cannot produce it.
      </P>

      <H2 id="selling">If you are the one selling</H2>
      <P>
        The documented Oman case above happened to a seller, and sellers get less
        warning than buyers do. The patterns aimed at you are different:
      </P>
      <UL
        items={[
          "The overpayment. A “buyer” sends more than the asking price, or claims to have, and asks you to refund the difference. The original payment is fake, reversed or never existed; the refund is real.",
          "The payment screenshot. A picture of a completed transfer is not a transfer. Do not release the car, the keys or the paperwork until the money is in your account, checked in your own banking app — not in a message, not in an email that looks like your bank.",
          "The QR code or “payment verification” link, which is the pattern the Oman Observer documented. Nothing that pays you should ever ask for your card number, your CVV, an OTP, or your banking password.",
          "The buyer who wants to “complete the transfer later” — the mirror image of the buyer-side trap, and just as bad for you. Until the car leaves your name, its fines and its liabilities are still yours.",
          "The test drive that leaves alone. Go with the car, keep your documents, and photograph the driver’s licence of anyone driving it.",
        ]}
      />
      <P>
        And one that is not fraud but costs sellers money anyway: agreeing a price
        on the phone, then being ground down in person by a buyer who was always
        going to. Decide your lowest number before anybody arrives, and say it
        out loud when they ask.
      </P>

      <H2 id="protocol">The day itself: a short protocol</H2>
      <P>
        None of this is dramatic. It is the ordinary version of being careful, and
        it makes almost everything above impossible.
      </P>
      <UL
        items={[
          "Daylight, a public place, and take somebody with you if you can. Two people are harder to hurry.",
          "See the mulkiya itself, not a photograph, and match the name to the person and the chassis number to the car.",
          "Run the fines check together, before the price is agreed.",
          "Pay in a way that leaves a record. A bank transfer you can point at later is worth more than the small convenience of cash.",
          "Money and transfer in the same sitting. If the transfer cannot happen today, the payment does not happen today either.",
          "Tell somebody where you are going and how much you are carrying. This is not paranoia; it is what you would tell a friend to do.",
        ]}
      />

      <H2 id="read-a-listing">Reading a listing in one minute</H2>
      <UL
        items={[
          "Is the price sane against four comparable cars, or is it the outlier? Outliers always have a reason, and you want to hear it before you travel.",
          "Do the photographs look like a person photographed a car, or like a catalogue? Too good is a flag; so is a set where no two pictures share the same background.",
          "Is there a photograph of the odometer and one of the car’s front, with a plate you can read? Both missing on an otherwise detailed listing is a choice somebody made.",
          "Does the text describe this car — a fault, a repair, a reason for selling — or could it be about any car of that model?",
          "Does the listing state the spec, and does the seller repeat it when asked?",
        ]}
      />
      <P>
        None of these is proof of anything by itself. Two or three of them
        together is a reason to ask the question that ends most fake listings:
        send me a photograph of the car right now with the odometer showing.
      </P>

      <H2 id="already-paid">If you have already paid</H2>
      <P>
        First, stop the bleeding. Do not send more money to fix it — the
        “release fee”, “clearance payment” or “refund processing charge” is the
        second half of the same scam, and it is aimed at people who are already
        committed.
      </P>
      <UL
        items={[
          "Contact your bank immediately if a transfer or card payment is involved. Speed matters more than anything else you will do today.",
          "Change any password or banking credential you entered on a page someone sent you, and do it from a different device if you can.",
          "Keep everything: the listing, the chat, the phone number, the account name, the payment reference, the account you paid into. Screenshot it before anyone deletes anything.",
          "Report it to the Royal Oman Police. Reporting channels change, so start from the ROP directly rather than from a link someone sends you.",
          "Report the listing and the account to the platform it ran on, so the next person meets a dead account instead of an active one.",
        ]}
      />
      <P>
        We deliberately do not print a specific hotline number or online
        fraud-reporting URL here, because we could not verify one that we are
        confident is current, and an out-of-date number costs an hour to somebody
        who does not have one to lose. Start at{" "}
        <Source href="https://www.rop.gov.om/">rop.gov.om</Source> or a police
        station.
      </P>

      <H2 id="fair">What we are not going to tell you about the other sites</H2>
      <P>
        There is a version of this page that says the big marketplaces are full
        of fakes. It would be good for us and it would not be true, and you would
        know it was not true, which is the more important reason not to write it.
      </P>
      <P>What is actually the case, as of our own checks on 25 July 2026:</P>
      <UL
        items={[
          "OpenSooq labels regional spec on its car listings and runs seller verification levels. Dubizzle has an explicit GCC / Import field, verified-seller badges, member-since dates and a filter to show verified accounts first. Both have one-tap WhatsApp.",
          "Both have large, long-established user bases in Oman and most transactions on them are ordinary sales between ordinary people.",
          "The spec labels and the verification badges are, on every platform including ours, a starting point rather than an audit. A field is not a check.",
          "The one documented Oman case above describes phishing that happened off-platform, to a seller, during the sale of a guitar. It is not evidence that car listings are fraudulent.",
        ]}
      />
      <P>
        Scams run wherever buyers and sellers meet, and they run hardest at the
        affordable end, where people are paying cash and can least afford to lose
        it. That is a market condition, not an accusation against a company.
      </P>

      <H2 id="why-we-are-built-this-way">Why Autosouq is built the way it is</H2>
      <P>
        Our honest claim is narrow. Every car on Autosouq is priced between OMR
        1,000 and 6,000, we check that the asking price is a real asking price
        and that the listing matches the car, we state the import origin —
        including when the seller has not stated it — and nothing is promoted
        above anything else because someone paid.
      </P>
      <P>
        That last point is the one we would defend hardest. When we sampled
        OpenSooq’s cars-for-sale section on 25 July 2026, the first three pages
        were entirely paid placements and the median price climbed the further in
        we went. Affordable cars are there; they are just not what the front page
        is for. A site where the OMR 1,500–6,000 band is simply what you get,
        in price order, is a different experience — and it is the only thing we
        are claiming to be.
      </P>
      <P>
        We never hold your money, we are never in the middle of your deal, and we
        cannot make a stranger honest.{" "}
        <Link className="fw-6" href="/how-it-works">
          How it works
        </Link>{" "}
        sets out precisely what we check and what we do not, the{" "}
        <Link className="fw-6" href="/faq">
          FAQs
        </Link>{" "}
        cover the practical questions, and if anyone claims to be Autosouq and
        asks you for a deposit or a fee, it is not us —{" "}
        <Link className="fw-6" href="/contact">
          tell us
        </Link>{" "}
        and the listing comes down.
      </P>
      <P>
        Seen a pattern that is not on this page? Send it to us. This page is
        meant to be updated when the scripts change, and the date at the top is
        how you will know whether it has been.
      </P>

      <H2 id="next">Read next</H2>
      <UL
        className="mb-40"
        items={[
          <>
            <Link className="fw-6" href="/guides/check-fines-before-buying-oman">
              Check the car, not just the seller
            </Link>{" "}
            — fines, restrictions and hidden loans, before you pay.
          </>,
          <>
            <Link className="fw-6" href="/guides/transfer-car-ownership-oman">
              How to transfer a car into your name
            </Link>{" "}
            — the process the whole “no money before the mulkiya moves” rule
            depends on.
          </>,
          <>
            <Link className="fw-6" href="/guides/gcc-spec-vs-american-import">
              GCC spec or American import?
            </Link>{" "}
            — the five-minute check, and the VIN myth to ignore.
          </>,
        ]}
      />

      <Sources
        items={[
          {
            href: "https://www.omanobserver.om/article/1177678/opinion/business/be-aware-of-opensooq-scams",
            label:
              "Tariq Al Barwani, “Be aware of Opensooq scams”, Oman Observer, 6 October 2025",
            note: "the documented Oman phishing case described above",
          },
          {
            href: "https://www.rop.gov.om/english/VehicleOwnershipTransfer.aspx",
            label: "Royal Oman Police — Vehicle Ownership Transfer",
            note: "the conditions a transfer must meet, including fines and restrictions",
          },
          {
            href: "https://www.rop.gov.om/english/TrafficFinesPayment.aspx",
            label: "Royal Oman Police — Traffic Fines",
            note: "check by plate and ID",
          },
          {
            href: "https://www.rop.gov.om/",
            label: "Royal Oman Police",
            note: "start here to report fraud; do not use a link sent to you in a chat",
          },
        ]}
      />
    </>
  );
}
