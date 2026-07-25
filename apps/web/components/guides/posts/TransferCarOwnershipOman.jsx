import { Link } from "@/i18n/navigation";
import React from "react";
import { Callout, H2, H3, OL, P, Source, Sources, UL } from "@/components/guides/Prose";

/**
 * Guide #2 — brief: design/research/blog-keyword-briefs.md §4 #2.
 *
 * The highest-risk page on the site. Every procedural statement here is taken
 * from the ROP's own Vehicle Ownership Transfer page, fetched 2026-07-25, and
 * the link is on the page so a reader can check us.
 *
 * Three things are deliberately NOT stated, and none of them should be added
 * without a primary source in hand:
 *
 *  1. **The transfer fee.** The ROP page shows a figure of 5 without restating
 *     a currency; secondary reporting says OMR 5; other secondary sources put
 *     the cost far higher. That conflict is unresolved, so no number is printed
 *     here — the page tells the reader to confirm it with the ROP instead.
 *  2. **The "over 10 years old" inspection threshold.** Widely repeated in local
 *     press; not confirmable on an ROP page. The ROP condition that the vehicle
 *     must pass inspection *is* sourced, so the page states the condition and
 *     explicitly declines to state the age.
 *  3. **Mortgage clearance detail.** The official portal describes a clearance
 *     requirement for mortgaged vehicles; we could not re-verify the specifics,
 *     so the page says what to ask and who to ask, not what the answer is.
 */
export default function TransferCarOwnershipOman() {
  return (
    <>
      <P>
        Transferring a car in Oman is done electronically through the Royal Oman
        Police, and when everything is in order it takes minutes. What catches
        people is not the process. It is the four conditions that have to be true
        before the process will run at all — and the fact that the money usually
        moves before anyone checks them.
      </P>
      <P>
        This page is the ROP’s procedure in plain language, plus the parts a
        nervous buyer actually needs and the official page does not cover: what
        happens when the seller has fines, what the 24-hour window means if you
        are standing in a car park at six in the evening, and what to say when
        someone asks for cash today and paperwork next week.
      </P>

      <H2 id="not-real-until">
        First principle: it is not your car until the mulkiya says your name
      </H2>
      <P>
        A signed paper, a WhatsApp message, a handshake, keys in your hand and
        the car parked outside your building are not ownership. The registration
        record is ownership. Until the transfer has gone through and the
        registration is in your name, the car is legally the seller’s — and so
        is anything that attaches to it.
      </P>
      <P>
        Everything else on this page follows from that one sentence. Plan the
        money around the transfer, not the other way round.
      </P>

      <H2 id="conditions">What must be true before a transfer will go through</H2>
      <P>
        The ROP sets these out on its own{" "}
        <Source href="https://www.rop.gov.om/english/VehicleOwnershipTransfer.aspx">
          Vehicle Ownership Transfer
        </Source>{" "}
        page. In plain language, at the time we checked it on 25 July 2026:
      </P>
      <UL
        items={[
          "The vehicle’s registration has to be valid. An expired registration is a job to be done before the transfer, not during it.",
          "Insurance has to be transferred to the new owner, from an approved company. In practice this means your cover, in your name, is arranged before the transfer — not after you drive away.",
          "The vehicle has to pass inspection.",
          "All parties and the vehicle must be clear of fines and restrictions. Not “mostly clear”, and not “the seller says he will pay them”.",
          "Both the seller and the buyer sign the transaction digitally, each from their own side.",
        ]}
      />
      <P>
        Read that list again as a buyer, because it is really a list of things
        that can stop you after you have paid. Three of them get their own
        section below.
      </P>

      <H2 id="ask-first">Five questions to ask before you drive across town</H2>
      <P>
        Every one of these is about whether a transfer can happen at all. Asking
        them on WhatsApp, before you arrange to meet, saves both of you an
        afternoon and costs nothing.
      </P>
      <UL
        items={[
          "Is the registration currently valid? Not “it is fine”, but valid until when.",
          "Are there fines on the car or on you? We can check together when I come, but is there anything you already know about?",
          "Is there any loan, finance or mortgage registered against it?",
          "Is the car in your name on the mulkiya? If not, whose name is it in, and will that person be there?",
          "Has it been inspected recently, or does it need inspecting before a transfer?",
        ]}
      />
      <P>
        The last two are the ones people forget. A car being sold by someone
        other than the registered owner is not automatically a problem — families
        sell each other’s cars all the time — but the registered owner has to be
        part of the transfer, and finding that out on the day is how a Thursday
        evening gets wasted.
      </P>

      <H2 id="24-hours">The 24-hour window</H2>
      <P>
        The ROP states that once the seller creates the transaction, the buyer
        must complete it <strong>within 24 hours</strong>. Miss it and the
        transaction has to be created again from the start.
      </P>
      <P>
        Treat that as a scheduling constraint, not a footnote. What it means in
        practice:
      </P>
      <UL
        items={[
          "Do not let the seller create the transaction until you are ready, with your insurance sorted and your phone in your hand.",
          "Do not start one late in the evening on the assumption you will finish tomorrow afternoon, and be careful across a weekend.",
          "If something in the chain needs a service centre or another person’s signature, the clock is still running while you wait for them.",
        ]}
      />
      <P>
        None of this is dangerous — a lapsed transaction can be recreated. But a
        lapsed transaction with your money already in the seller’s account is a
        different feeling entirely, and the fix is simply not to be in that
        position.
      </P>

      <H2 id="steps">Doing it, step by step</H2>
      <P>
        The transfer runs through the ROP’s services, including its app. The two
        sides of it, as the ROP describes them:
      </P>
      <H3>The seller’s side</H3>
      <OL
        items={[
          "Create a transfer request.",
          "Enter the new owner’s details.",
          "Confirm identity.",
          "Create the transaction.",
          "Sign it, and notify the buyer.",
        ]}
      />
      <H3>Your side, as the buyer</H3>
      <OL
        items={[
          "Open your applications and find the transaction waiting for you.",
          "Sign it.",
          "Pay.",
          "Collect the mulkiya — from a service centre or a self-service machine.",
        ]}
      />
      <Callout title="What we cannot show you yet">
        <P className="mb-0">
          The version of this page we want has annotated screenshots of each of
          those screens, in Arabic and English, taken during a real transfer. We
          do not have them yet, and we are not going to draw them from memory.
          When we have run a transfer and captured it properly, the screenshots
          go here and the page gets re-dated.
        </P>
      </Callout>

      <H3>What to have ready before you start</H3>
      <UL
        items={[
          "Your identity documents and your ROP app access, working, on a phone with charge and data. Not your friend’s phone.",
          "Insurance arranged for that specific car, in your name, ready to start.",
          "The car’s details in front of you: plate, chassis number, and the mulkiya itself rather than a photograph of it.",
          "The money ready to move the moment the transfer does — and a payment method that leaves a record.",
          "An hour that is genuinely free, in case something needs a service centre.",
        ]}
      />
      <P>
        If you are buying from a dealer, they will normally drive the paperwork
        and it will be quicker. Do not let that speed carry you past the checks:
        the name on the mulkiya, the chassis number against the car, the fines,
        and the insurance in your name are yours to confirm regardless of who is
        doing the typing.
      </P>

      <H2 id="fee">The fee — the one number we are not going to print</H2>
      <P>
        You will find a figure for the transfer fee on a lot of websites. We are
        not adding to them, and it is worth explaining why rather than just
        leaving a gap.
      </P>
      <P>
        The ROP’s own page shows a transfer fee, but does not restate the
        currency alongside it. Secondary sources read that figure in
        contradictory ways, and the amounts people quote differ by several times
        over. We could not settle that against a primary source — so rather than
        pick the version that suits us, we are leaving it out. A wrong fee in
        somebody’s budget is exactly the small dishonesty this site exists to
        avoid.
      </P>
      <P>
        So: <strong>confirm the fee with the ROP</strong> — in the app at the
        point of payment, at a service centre, or on the{" "}
        <Source href="https://www.rop.gov.om/english/VehicleOwnershipTransfer.aspx">
          official transfer page
        </Source>
        . What we can say without a number is that the fee is not the expensive
        part of buying a car here, and it should never be the reason a deal is
        rushed.
      </P>

      <H2 id="inspection">Inspection: a stated condition, and an age question we could not settle</H2>
      <P>
        Passing inspection is one of the ROP’s listed conditions for a transfer,
        so build it into your plan for any car you are buying.
      </P>
      <P>
        You will also hear, constantly, that vehicles over ten years old need a
        technical inspection before renewal or transfer. It is repeated in local
        press and by people who buy and sell cars for a living. We could not
        confirm the ten-year figure on an ROP source, so we are not going to
        assert it as a rule — and in this price band it hardly matters whether
        the number is ten or something else, because a large share of the cars
        are old enough to be caught either way.
      </P>
      <P>
        The practical version: assume an older car will need inspecting, ask the
        ROP or check the app before you plan a same-day handover around it, and
        agree with the seller in advance who is taking the car for it.
      </P>

      <H2 id="expired">If the registration has already expired</H2>
      <P>
        Valid registration is one of the ROP’s conditions, so an expired one is a
        job that has to be finished before the transfer rather than something to
        sort out afterwards. It is common on cars that have been sitting for a
        while, and on cars whose owner had already stopped using them before
        deciding to sell.
      </P>
      <P>
        Treat it as part of the price conversation, because it takes somebody’s
        time and may involve an inspection and cover being in place:
      </P>
      <UL
        items={[
          "Ask when it expired. A month is a different situation from two years.",
          "Agree explicitly who is renewing it, and confirm what the ROP requires before you assume it is quick.",
          "Do not pay for the car on the understanding that the seller will renew afterwards. Same rule as everything else on this page.",
        ]}
      />

      <H2 id="fines">If the seller has unpaid fines, nothing happens</H2>
      <P>
        The ROP’s conditions require all parties and the vehicle to be clear of
        fines and restrictions. There is no version of this where you pay now and
        sort the fines later — the transfer will not run.
      </P>
      <P>
        This is the most common way a deal dies after money has changed hands,
        and it is entirely avoidable. Fines are checkable by plate and ID through
        the{" "}
        <Source href="https://www.rop.gov.om/english/TrafficFinesPayment.aspx">
          ROP’s traffic fines service
        </Source>{" "}
        and in the ROP app, with the seller standing next to you, before any
        money moves. It takes a couple of minutes.
      </P>
      <P>
        Outstanding fines are also a legitimate thing to talk about on price. They
        are a real cost attached to the car you are buying, and asking who is
        paying them is not an insult — it is the same question as asking who is
        paying for the tyres.{" "}
        <Link className="fw-6" href="/guides/check-fines-before-buying-oman">
          The full checking routine is here
        </Link>
        .
      </P>

      <H2 id="mortgaged">If the car is mortgaged or pawned</H2>
      <P>
        A vehicle with finance or a mortgage registered against it cannot simply
        be signed over, because the seller is not the only party with an interest
        in it. Clearance from the institution holding that interest is part of
        the process.
      </P>
      <P>
        We are deliberately not describing that procedure step by step, because
        we could not verify the current detail against a primary source, and this
        is precisely the kind of thing that changes. What to do instead:
      </P>
      <UL
        items={[
          "Ask the seller directly whether there is any finance, loan or mortgage against the car. Ask before you view it — it saves everyone an afternoon.",
          "If there is, ask what has to be produced to clear it and who is producing it. “It is nearly paid off” is not a document.",
          "Confirm what the ROP requires — through the ROP app, at a service centre, or via the government services portal.",
          "Do not part with money against a promise to clear a loan later. The car secures somebody else’s debt until it does not.",
        ]}
      />

      <H2 id="insurance">Insurance goes in your name first, not afterwards</H2>
      <P>
        This trips up more first-time buyers than anything else on the page,
        because it feels backwards: you are arranging insurance for a car you do
        not own yet. But the ROP lists the transfer of insurance to the new owner
        from an approved company among the conditions, so it belongs before the
        transfer in your sequence, not after.
      </P>
      <P>
        We are not printing premium figures here. Insurer pricing moves, it
        depends on your age, your licence history and the vehicle, and a stale
        number would be worse than none. Get your own quotes for the specific car
        — you will need the chassis number and the registration details, so ask
        the seller for them early — and have cover ready to start on the day you
        plan to transfer.
      </P>

      <H2 id="cash-now">“Give me the cash now and I will transfer it next week”</H2>
      <P>
        No. Not with a discount attached, not because the seller is travelling,
        not because his brother has the app on his phone, not for a car that
        seems like a bargain.
      </P>
      <P>
        Sometimes the person asking is disorganised rather than dishonest. It
        does not matter: the risk to you is identical either way. Until the
        registration moves, the car is theirs, the fines are theirs, and anything
        registered against it stays attached to it.
      </P>
      <P>Something like this is enough, and it is not rude:</P>
      <Callout title="What to say">
        <P className="mb-0">
          “No problem — let us do the transfer and I will pay at the same time.
          I can meet you at the service centre, or we can do it on the app
          together. When suits you?”
        </P>
      </Callout>
      <P>
        A genuine seller shrugs and picks a time. A refusal to complete the
        transfer alongside the payment is the answer to a question you had not
        thought to ask.
      </P>

      <H2 id="not-the-owner">If the person selling is not the registered owner</H2>
      <P>
        This is common and it is not automatically suspicious. A brother sells a
        car for a brother; a company sells a car that is registered to the
        company; somebody sells a car for a friend who has already left the
        country. What matters is that the transfer needs the registered owner’s
        side of it, signed by them.
      </P>
      <UL
        items={[
          "Ask early who is on the mulkiya, and arrange for that person to be available when you transfer — in person or through whatever the ROP accepts.",
          "“He will sign it later, he is in Salalah” is the same problem as “I will transfer it next week”. It is not about trust; it is about the transfer not existing yet.",
          "If the registered owner has left Oman, be careful and ask the ROP what is required before you agree a price, not after.",
          "For a company-owned car, expect company paperwork and the authority of whoever signs. Ask what that consists of before you commit.",
        ]}
      />
      <P>
        The generous version of this rule is also the safe one: nobody is being
        accused of anything, you simply cannot buy something from a person who
        does not yet have the ability to sell it to you.
      </P>

      <H2 id="if-it-fails">If the transfer fails after you have paid</H2>
      <P>
        It should not happen if you have followed the order above. If it has:
      </P>
      <UL
        items={[
          "Do not accept a new promise as a solution. “Come back on Sunday and it will be sorted” is how weeks pass. Ask what specifically is blocking it and what evidence there is that it is being cleared.",
          "Keep everything: the chats, the listing, the payment record, the plate number, the seller’s identity details, and the exact wording of what you were told and when.",
          "If you paid by transfer, tell your bank early rather than late.",
          "Ask the ROP what is blocking the transfer and what has to happen. They are the only party that can tell you, and the answer is usually specific and fixable.",
          "Do not hand over any further money to unblock it. A payment to clear somebody else’s obligation is not a step towards owning the car; it is a second loss.",
        ]}
      />
      <P>
        And keep the car’s status in mind while it is unresolved: until the
        transfer completes, it is not registered to you, whatever is parked
        outside your building.
      </P>

      <H2 id="after">After the transfer: what to keep</H2>
      <UL
        items={[
          "The new mulkiya, with your name on it, checked character by character against the car’s chassis number before you leave.",
          "Your insurance documents, in your name, with the start date.",
          "Proof of what you paid and to whom — a bank transfer record is better than cash for exactly this reason.",
          "Whatever service history came with the car. It is worth real money when you sell.",
          "The seller’s number, kept for a few months. Most questions after a sale are innocent ones.",
        ]}
      />
      <P>
        Then check the fines service once more, a week later. Anything that
        appears after the transfer is yours, and you want to know about it early
        rather than at the next renewal.
      </P>

      <H2 id="worked-example">What a well-run purchase actually looks like</H2>
      <P>
        Put together, the whole thing is one afternoon rather than a project.
        Here is the sequence, in the order that keeps your money safe:
      </P>
      <OL
        items={[
          "Days before: you ask the five questions above on WhatsApp. Registration valid, no finance, car in the seller’s name, no fines he knows of.",
          "You see the car in daylight, drive it, and — if you are serious — have it inspected. You now know what you are buying and what it needs.",
          "You agree a price, adjusted for anything the inspection found and for any fines still outstanding. You also agree, out loud, that payment and transfer happen together.",
          "You get insurance quotes for that specific car and arrange cover in your name, ready to start.",
          "You pick a time when you both have a clear hour, and only then does the seller create the transfer request.",
          "Fines and restrictions are checked one final time, together, on the ROP app.",
          "The seller signs. You sign, you pay the fee, and the money for the car moves at the same moment — by a method that leaves a record.",
          "You collect the new mulkiya, check your name and the chassis number on it, and drive home in a car that is actually yours.",
        ]}
      />
      <P>
        Nothing in that list is difficult. What makes it work is that no step
        happens on the strength of a promise that a later step will happen.
      </P>

      <H2 id="how-we-fit">Where Autosouq fits in this</H2>
      <P>
        We are not part of the transfer and we never hold your money. What we do
        is narrower: every car listed is between OMR 1,500 and 6,000, we check
        that the asking price is real and that the listing matches the car, and
        we state the import origin — including when the seller has not.{" "}
        <Link className="fw-6" href="/how-it-works">
          How it works
        </Link>{" "}
        sets out exactly what we check and what we do not, and the{" "}
        <Link className="fw-6" href="/faq">
          FAQs
        </Link>{" "}
        cover the rest. When you are ready to look,{" "}
        <Link className="fw-6" href="/listing-grid">
          here are the cars
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
            — the ten-minute routine for fines, restrictions and hidden loans.
          </>,
          <>
            <Link className="fw-6" href="/guides/gcc-spec-vs-american-import">
              GCC spec or American import?
            </Link>{" "}
            — what to check before you agree the price this process transfers.
          </>,
          <>
            <Link className="fw-6" href="/guides/used-car-scams-oman">
              Used-car scams in Oman
            </Link>{" "}
            — including the ones built entirely around delaying the transfer.
          </>,
        ]}
      />

      <Sources
        items={[
          {
            href: "https://www.rop.gov.om/english/VehicleOwnershipTransfer.aspx",
            label: "Royal Oman Police — Vehicle Ownership Transfer",
            note: "conditions, the 24-hour window, and both sides of the flow; checked 25 July 2026",
          },
          {
            href: "https://www.rop.gov.om/english/TrafficFinesPayment.aspx",
            label: "Royal Oman Police — Traffic Fines",
            note: "check fines by plate and ID before you commit",
          },
          {
            href: "https://omanportal.gov.om/",
            label: "Oman Government Services Portal",
            note: "the entry point for ROP vehicle services, including mortgaged-vehicle transfers",
          },
        ]}
      />
      <P className="mb-0">
        Oman moved this process online in 2023 and vehicle rules here have
        changed since. If anything on this page no longer matches what the ROP
        tells you,{" "}
        <Link className="fw-6" href="/contact">
          tell us
        </Link>{" "}
        — we would rather correct it than defend it.
      </P>
    </>
  );
}
