import { Link } from "@/i18n/navigation";
import { H2, P, UL } from "@/components/guides/Prose";

export default function HighMileageCorolla() {
  return (
    <>
      <P>
        In Oman’s affordable band, a Corolla with 200,000 km is a common car,
        not a rare warning. The question is not “is the number high?” — it is
        “has this car been looked after in this climate?”
      </P>

      <H2>Why high km is normal here</H2>
      <P>
        Daily driving, highway runs to the interior, and long ownership cycles
        push odometers hard. A Corolla that reaches 200,000 km and still cools
        the cabin, shifts cleanly and shows honest paint wear can be a better
        buy than a prettier car with a quieter story and a louder problem.
      </P>

      <H2>What to check before you WhatsApp “deal”</H2>
      <UL
        items={[
          "Cold A/C after ten minutes at idle — not a blast that fades",
          "Gearbox behaviour when warm; delayed engagement is a budget killer",
          "Underside and boot for damp, mud lines or fresh underseal that smells like a cover-up",
          "Service evidence for timing belt / chain work if the year calls for it — ask, do not assume",
          <>
            Spec origin on the listing —{" "}
            <Link className="fw-6" href="/guides/gcc-spec-vs-american-import">
              GCC vs import
            </Link>{" "}
            changes what the car is worth next year
          </>,
        ]}
      />

      <H2>Price sanity</H2>
      <P>
        Inside Autosouq’s OMR 1,500–6,000 band, a high-km Corolla should still
        look like a Corolla price — not a fantasy discount that only works if
        you skip inspection. See live examples on{" "}
        <Link className="fw-6" href="/used-cars">
          used cars
        </Link>
        .
      </P>
    </>
  );
}
