import { Link } from "@/i18n/navigation";
import { H2, P, UL } from "@/components/guides/Prose";

export default function SellingAffordableCar() {
  return (
    <>
      <P>
        Autosouq needs sellers as much as buyers. If you are moving a car in the
        OMR 1,500–6,000 band — or leaving Oman — the goal is a fair price and a
        safe handover, not a bidding war that never ends.
      </P>

      <H2>Price like a human</H2>
      <P>
        Look at what similar cars actually ask on honest listings, not the
        highest fantasy price on a general classifieds site. State GCC-spec or
        import truthfully. If the car is OMR 1,000–1,499 territory, expect the
        sold-as-is path — that is how this site stays clear.
      </P>

      <H2>Seller-side safety</H2>
      <UL
        items={[
          "Meet in a public place; do not deliver to a stranger’s compound first",
          "Never pay to “release” a payment or scan a random QR for a buyer",
          <>
            Complete transfer through the proper ROP flow — see our{" "}
            <Link className="fw-6" href="/guides/transfer-car-ownership-oman">
              mulkiya guide
            </Link>
          </>,
          "Clear fines and know if the car is under lien before you promise a date",
        ]}
      />

      <H2>List on Autosouq</H2>
      <P>
        Read the band rules on{" "}
        <Link className="fw-6" href="/sell-your-car">
          sell your car
        </Link>
        , then{" "}
        <Link className="fw-6" href="/add-listing">
          add a listing
        </Link>
        . Buyers message you on WhatsApp with the car and price already filled
        in — that is the point.
      </P>
    </>
  );
}
