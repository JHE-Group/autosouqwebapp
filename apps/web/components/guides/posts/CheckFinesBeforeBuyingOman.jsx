import { Link } from "@/i18n/navigation";
import React from "react";
import { Callout, H2, OL, P, Source, Sources, UL } from "@/components/guides/Prose";

/**
 * Guide #4 — brief: design/research/blog-keyword-briefs.md §4 #4.
 *
 * The reframe that justifies the page: every page currently ranking explains how
 * to pay *your own* fines. None is written for a buyer checking somebody else's
 * car before handing over money.
 *
 * Sourcing discipline: the "clear of fines and restrictions" condition and the
 * fines-check service are both cited to ROP pages. What a restriction *is* in
 * law, how it is lifted, and the ten-year inspection threshold are all
 * deliberately hedged — we could not confirm them against a primary source, and
 * this is a page people act on in a car park.
 */
export default function CheckFinesBeforeBuyingOman() {
  return (
    <>
      <P>
        Fines and restrictions attach to the vehicle and to the people involved,
        not to whoever happens to be holding the keys. That single fact is why a
        deal can collapse <em>after</em> you have paid — and why ten minutes of
        checking, with the seller standing next to you, is the highest-value part
        of buying a used car in Oman.
      </P>
      <P>
        Every guide you will find on this subject explains how to pay your own
        fines. This one is for the other situation: you have found a car, you are
        close to buying it, and you want to know what could stop the transfer
        before your money is on the wrong side of it.
      </P>

      <H2 id="three-blockers">Three things that can block your transfer</H2>
      <P>
        The ROP’s own{" "}
        <Source href="https://www.rop.gov.om/english/VehicleOwnershipTransfer.aspx">
          Vehicle Ownership Transfer
        </Source>{" "}
        page sets out the conditions a transfer has to meet. Two of them are
        where deals die, and a third sits alongside them:
      </P>
      <OL
        items={[
          "Unpaid fines — on the vehicle and on the parties to the transfer.",
          "Restrictions on the vehicle or on a party. The ROP names these in the same breath as fines, and they are not the same thing.",
          "A loan, mortgage or pledge registered against the car, which means the seller is not the only party with an interest in it.",
        ]}
      />
      <P>
        None of the three is exotic. All three are ordinary, and all three are
        checkable before you commit.
      </P>

      <H2 id="fines">Fines: check by plate, before you agree the price</H2>
      <P>
        The ROP publishes a{" "}
        <Source href="https://www.rop.gov.om/english/TrafficFinesPayment.aspx">
          traffic fines service
        </Source>{" "}
        that takes a plate number and an ID, and the same check is available in
        the ROP app. It is free, it is quick, and it is the check the seller can
        run in front of you on their own phone.
      </P>
      <P>
        Do it before you talk about price, not after you have shaken hands.
        Outstanding fines are a real cost sitting on the car you are about to buy,
        and they are far easier to discuss while the price is still open.
      </P>
      <P>
        A clean result does not mean “clean forever”. Fines can be issued for
        something that happened last week and has not appeared yet, which is one
        more reason not to leave a long gap between checking and transferring.
      </P>

      <H2 id="restrictions">Restrictions: why they are worse than fines</H2>
      <P>
        A fine is a bill. Somebody pays it and it goes away. A restriction is a
        block — the ROP lists being clear of restrictions as a condition of
        transfer, and the point of one is precisely that the transaction does not
        proceed while it stands.
      </P>
      <P>
        We are not going to tell you what every kind of restriction means, how
        each one is lifted, or how long it takes, because we could not confirm
        that against an official source and this is not a subject to guess at.
        What matters for your decision is the shape of it:
      </P>
      <UL
        items={[
          "A restriction is not necessarily something the seller can clear by paying at a machine on the way home.",
          "It may have nothing to do with driving, and the seller may not be able to explain it.",
          "Only the ROP can tell you what it is and what clears it. Not the seller, not a broker, not us.",
        ]}
      />
      <P>
        So if a check comes back showing a restriction, that is not a haggling
        position — it is a stop. Wait until it is resolved and re-checked, or walk
        away. Do not accept an explanation and a discount instead.
      </P>

      <H2 id="loans">Loans, mortgages and pawned cars</H2>
      <P>
        A car can carry finance. If it does, the institution holding that interest
        has to be dealt with before ownership can move, and “it is nearly paid
        off” is not a document.
      </P>
      <P>
        Ask before you view the car — it is a normal question and it saves
        everyone an afternoon. Ask it in a form that is hard to answer vaguely:
      </P>
      <Callout title="What to ask">
        <P className="mb-0">
          “Is there any bank loan, finance or mortgage registered on this car? If
          there is, what has to be produced to clear it, and who is getting it?”
        </P>
      </Callout>
      <P>
        Then confirm what the ROP actually requires — through the ROP app, at a
        service centre, or through the{" "}
        <Source href="https://omanportal.gov.om/">
          government services portal
        </Source>
        , which is where the ROP’s vehicle services live. What we will say plainly
        is the part that protects you: your money does not move until the car is
        clear and the transfer is running.
      </P>

      <H2 id="routine">The ten-minute routine, with the seller present</H2>
      <P>
        The real obstacle to all of this is not technical. It is that running
        checks on somebody’s car in front of them feels like calling them a liar.
        It is not, and the way you avoid the awkwardness is to make it routine and
        cheerful rather than a sudden demand at the end.
      </P>
      <P>Say at the start, before you have looked at the car:</P>
      <Callout title="How to open it">
        <P className="mb-0">
          “Before we talk about price — do you mind if we check the fines and the
          registration on the app together? I do it on every car, it takes two
          minutes.”
        </P>
      </Callout>
      <P>Then, in order:</P>
      <OL
        items={[
          "Read the mulkiya. Check the name against the person selling the car, and the chassis number against the number on the car itself. Not a photograph of the card — the card.",
          "Check fines by plate and ID, on the ROP app or the fines service, with the seller doing their own side of it.",
          "Ask about restrictions and about any loan, finance or mortgage, and see what comes back — the words and the manner both.",
          "Ask about inspection: whether the car has been inspected, when, and who is taking it if it needs to be done before the transfer.",
          "Agree the sequence out loud: money and transfer at the same time, insurance in your name arranged first.",
        ]}
      />
      <P>
        In our experience of how these conversations go, the seller’s reaction to
        step one tells you more than the result of steps two and three. A
        straight seller is mildly bored by this. Anyone who is offended by a
        two-minute check on a transaction worth thousands of rials is telling you
        something for free.
      </P>

      <H2 id="bad-result">When a check comes back bad</H2>
      <P>Three different situations, and they are not equally serious.</P>
      <UL
        items={[
          "Fines, small and explainable: normal. This is a conversation about who pays, not a reason to leave. Most sellers know about them.",
          "A restriction: stop. Not a discount, not a promise, not “my cousin knows someone at the office”. Resolved and re-checked, or no deal.",
          "Finance against the car: proceed only with the clearing arrangement understood, documented and done before your money moves. If any part of that is vague, the answer is no.",
        ]}
      />
      <P>
        And a fourth, which is not about the car at all: if the seller becomes
        angry or evasive when a check comes back badly, that is the finding. You
        are about to hand a stranger a large amount of cash. How they behave when
        something goes slightly wrong is genuinely useful information.
      </P>

      <H2 id="limits">What these checks do not tell you</H2>
      <P>
        Worth being clear, because a clean set of results can make people relax
        about the wrong things.
      </P>
      <UL
        items={[
          "They say nothing about the car’s condition. A vehicle with no fines and no restrictions can still need a gearbox.",
          "They say nothing about accident history. Fines are traffic offences, not a damage record.",
          "They are a snapshot. Something issued yesterday may not have appeared yet, which is why you check close to the transfer and not a fortnight before it.",
          "They do not confirm the seller is the owner. That is the registration card, read in person, matched to the person.",
        ]}
      />
      <P>
        So run these checks and then still look at the car properly, and still
        pay somebody to inspect it if you are serious. The checks protect the
        transaction. They do not protect you from the car.
      </P>

      <H2 id="who-pays">Who pays? Negotiating fines off the price</H2>
      <P>
        Outstanding fines are the seller’s to clear — the transfer will not run
        otherwise. But that is a fact, not a weapon, and treating it as a gotcha
        usually costs you the car you wanted.
      </P>
      <P>The version that works:</P>
      <Callout title="What to say">
        <P className="mb-0">
          “There is OMR X of fines on it, and it cannot transfer until they are
          cleared. Either you clear them before we do the transfer, or we take it
          off the price and I deal with it. Whichever is easier for you.”
        </P>
      </Callout>
      <P>
        Notice what that does: it makes the fines a scheduling problem you are
        helping to solve rather than an accusation. Most sellers take the second
        option, and you have moved the price by the exact amount of a real,
        documented cost. That is the only kind of haggling worth doing — the sort
        where both people can see the number.
      </P>

      <H2 id="inspection">The inspection question</H2>
      <P>
        Passing inspection is one of the ROP’s listed conditions for transferring
        a vehicle, so it belongs on your checklist.
      </P>
      <P>
        You will also hear everywhere that cars over ten years old need a
        technical inspection before renewal or transfer. We could not confirm that
        threshold on an ROP source and are not going to state it as a rule. In
        this price band the practical answer is the same either way: assume an
        older car will need inspecting, ask the ROP or check the app rather than
        the internet, and settle with the seller in advance who is taking it and
        when. A car that fails is a repair bill, and you want to know whose it is
        before, not after.
      </P>

      <H2 id="timing">When to run the checks</H2>
      <P>
        Twice, and the second time matters more than people expect.
      </P>
      <UL
        items={[
          "Once when you first see the car, before the price is agreed — so that anything outstanding is part of the negotiation rather than a surprise at the end.",
          "Once again immediately before the transfer, with the seller, on the day. Fines can be issued in between, and a check from ten days ago proves nothing about today.",
        ]}
      />
      <P>
        If several days pass between agreeing a price and completing the
        transfer, treat the second check as compulsory. It costs two minutes, and
        it is the difference between finding a problem while your money is still
        yours and finding it afterwards.
      </P>

      <H2 id="why-this-matters-here">Why we bang on about this</H2>
      <P>
        Because it is the most common way a straightforward deal turns into a
        month of messages, and because it is completely preventable with two
        minutes of phone work. Every car on Autosouq is priced between OMR 1,500
        and 6,000 — at that end of the market people pay in cash, often most of
        what they have saved, and there is no comfortable way to unwind a payment
        after the fact.
      </P>
      <P>
        We check that a listing’s price is real and that the car matches the
        listing, and we state the import origin.{" "}
        <Link className="fw-6" href="/how-it-works">
          How it works
        </Link>{" "}
        is explicit about what that does and does not cover — we do not check
        anybody’s fines, and we could not: those are the ROP’s records and they
        change daily. That check is yours to run, and now you know how.{" "}
        <Link className="fw-6" href="/listing-grid">
          Browse the cars
        </Link>{" "}
        or read the{" "}
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
            <Link className="fw-6" href="/guides/transfer-car-ownership-oman">
              How to transfer a car into your name
            </Link>{" "}
            — the full ROP process these checks feed into.
          </>,
          <>
            <Link className="fw-6" href="/guides/used-car-scams-oman">
              Used-car scams in Oman
            </Link>{" "}
            — including the ambush where the fines only surface after payment.
          </>,
          <>
            <Link className="fw-6" href="/guides/first-car-oman-expat">
              Your first car in Oman
            </Link>{" "}
            — where these checks sit in the whole process.
          </>,
        ]}
      />

      <Sources
        items={[
          {
            href: "https://www.rop.gov.om/english/TrafficFinesPayment.aspx",
            label: "Royal Oman Police — Traffic Fines",
            note: "check by plate and ID; also in the ROP app",
          },
          {
            href: "https://www.rop.gov.om/english/VehicleOwnershipTransfer.aspx",
            label: "Royal Oman Police — Vehicle Ownership Transfer",
            note: "the conditions, including clear of fines and restrictions; checked 25 July 2026",
          },
          {
            href: "https://omanportal.gov.om/",
            label: "Oman Government Services Portal",
            note: "ROP vehicle services, including transfers involving mortgaged vehicles",
          },
        ]}
      />
    </>
  );
}
