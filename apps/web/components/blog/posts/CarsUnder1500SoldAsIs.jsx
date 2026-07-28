import { Link } from "@/i18n/navigation";
import { H2, P, UL } from "@/components/guides/Prose";

export default function CarsUnder1500SoldAsIs() {
  return (
    <>
      <P>
        Autosouq’s main band is OMR 1,500–6,000. Cars from OMR 1,000–1,499 can
        still be listed, but only with a clear <strong>sold as-is</strong>{" "}
        label. That label is not decoration — it is how we keep the site honest
        at the bottom of the market.
      </P>

      <H2>What “sold as-is” means here</H2>
      <P>
        The seller is not offering a warranty, a return, or a promise that
        everything works. You buy the car in the condition you find it after
        you have inspected it. At this price that is often fair: the number is
        low because the risk is real. It is unfair only when the listing hides
        that risk or the seller talks as if the label does not apply.
      </P>
      <UL
        items={[
          "Read the as-is notice on the listing before you leave home",
          "Budget for immediate work — tyres, A/C gas, batteries fail in the heat",
          "Bring someone who knows cars, or walk away; there is no “try it for a week”",
        ]}
      />

      <H2>When to walk away</H2>
      <P>
        Walk away if the seller will not meet in a public place, will not show
        the mulkiya, or pressures you to pay a deposit before you have seen the
        car. Walk away if the price is “OMR 1,200” but the chat suddenly becomes
        “OMR 2,400 for the good one.” Our{" "}
        <Link className="fw-6" href="/guides/used-car-scams-oman">
          scam patterns guide
        </Link>{" "}
        covers the common scripts.
      </P>

      <H2>If you are selling one</H2>
      <P>
        Price it honestly and accept the as-is label. Buyers in this tier expect
        candour. Start at{" "}
        <Link className="fw-6" href="/sell-your-car">
          sell your car
        </Link>{" "}
        or{" "}
        <Link className="fw-6" href="/add-listing">
          add a listing
        </Link>
        .
      </P>
    </>
  );
}
