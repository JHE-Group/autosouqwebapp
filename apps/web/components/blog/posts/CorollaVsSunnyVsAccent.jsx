import { Link } from "@/i18n/navigation";
import { H2, P, UL } from "@/components/guides/Prose";

export default function CorollaVsSunnyVsAccent() {
  return (
    <>
      <P>
        Around OMR 3,000 you will keep meeting the same three names: Toyota
        Corolla, Nissan Sunny, Hyundai Accent. This is not a dyno test. It is
        the ownership trade-offs buyers in Oman actually argue about.
      </P>

      <H2>Corolla</H2>
      <P>
        Parts are everywhere, resale is usually the least painful, and a tired
        Corolla still finds a next buyer. You pay for that reputation — and you
        still need A/C and gearbox checks like any other car in the heat.
      </P>

      <H2>Sunny</H2>
      <P>
        Often the cheaper seat in the same budget. Fine as a city car when the
        example in front of you is honest. Be stricter on rust in the usual
        places, on A/C performance, and on whether the price is low because the
        car is tired.
      </P>

      <H2>Accent</H2>
      <P>
        Can be the value pick when service has been regular. Parts are
        available, but the market’s emotional premium sits with Toyota — plan
        your exit price accordingly when you sell later.
      </P>

      <H2>How to choose</H2>
      <UL
        items={[
          "Pick the car you can inspect, not the badge you prefer on Instagram",
          <>
            Run the same{" "}
            <Link className="fw-6" href="/guides/gcc-spec-vs-american-import">
              spec
            </Link>{" "}
            and{" "}
            <Link className="fw-6" href="/guides/check-fines-before-buying-oman">
              fines
            </Link>{" "}
            checks on all three
          </>,
          <>
            Compare live asking prices on{" "}
            <Link className="fw-6" href="/used-cars">
              Autosouq
            </Link>
            , not a memory of last year’s OpenSooq scroll
          </>,
        ]}
      />
    </>
  );
}
