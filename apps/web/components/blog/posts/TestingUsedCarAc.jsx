import { Link } from "@/i18n/navigation";
import { H2, P, UL } from "@/components/guides/Prose";

export default function TestingUsedCarAc() {
  return (
    <>
      <P>
        In Oman, air conditioning is not a luxury trim detail. A weak compressor
        or a system that only blows cool for two minutes can cost hundreds of
        rials — money that matters when the car itself is OMR 1,500–6,000.
      </P>

      <H2>A five-minute check in a car park</H2>
      <UL
        items={[
          "Start the car, A/C on max cold, windows up, fan on medium then high",
          "Wait at least eight to ten minutes at idle — short blasts lie",
          "Feel the centre vents: properly cold, not “less hot than outside”",
          "Listen for grinding or screaming from the compressor clutch",
          "Ask when gas was last added — frequent top-ups mean a leak",
        ]}
      />

      <H2>What “needs gas” often means</H2>
      <P>
        A single recharge can be a cheap fix. A recharge every summer is a leak.
        Do not accept “it will be fine after gas” as a closing argument unless
        you have priced the repair and still like the car.
      </P>

      <H2>Before you pay</H2>
      <P>
        Pair the A/C check with the rest of a serious look —{" "}
        <Link className="fw-6" href="/guides/gcc-spec-vs-american-import">
          spec origin
        </Link>
        , paper trail, and a drive when the engine is hot. Then message from the
        listing on{" "}
        <Link className="fw-6" href="/used-cars">
          Autosouq
        </Link>{" "}
        so the asking price is in the WhatsApp thread.
      </P>
    </>
  );
}
