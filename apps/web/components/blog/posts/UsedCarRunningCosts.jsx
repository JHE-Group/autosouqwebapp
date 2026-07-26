import { Link } from "@/i18n/navigation";
import { H2, P, UL } from "@/components/guides/Prose";

export default function UsedCarRunningCosts() {
  return (
    <>
      <P>
        The asking price on Autosouq is the real ask for the car. It is not your
        monthly cost. Buyers in the OMR 1,500–6,000 band get hurt when they
        budget only for the transfer fee and nothing for fuel, insurance or the
        first repair.
      </P>

      <H2>Three lines to budget</H2>
      <UL
        items={[
          <>
            <strong>Fuel</strong> — prices move; check the current month’s
            announcement, not a blog from 2020. A small petrol daily driver is
            still a weekly cash habit.
          </>,
          <>
            <strong>Insurance</strong> — third-party is the floor many buyers
            choose on affordable cars; comprehensive is a separate decision. Get
            a live quote for <em>this</em> plate and year — published “from OMR
            X” figures go stale.
          </>,
          <>
            <strong>Repair fund</strong> — keep a few hundred rials you can
            spend in the first months (battery, tyres, A/C). If you cannot, you
            are not ready for a car at the bottom of the band.
          </>,
        ]}
      />

      <H2>Transfer is not “free”</H2>
      <P>
        Ownership transfer has its own steps, window and fees. Read{" "}
        <Link className="fw-6" href="/guides/transfer-car-ownership-oman">
          how to transfer car ownership in Oman
        </Link>{" "}
        before you agree a day and a place to meet.
      </P>

      <H2>Keep the car inside the band’s logic</H2>
      <P>
        If running costs force you into debt for a car that was only “a little”
        above what you can sustain, step down in price or wait. Browse within
        your ceiling on{" "}
        <Link className="fw-6" href="/used-cars">
          used cars
        </Link>
        .
      </P>
    </>
  );
}
