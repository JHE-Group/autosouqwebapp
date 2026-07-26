import { Link } from "@/i18n/navigation";
import { H2, P, UL } from "@/components/guides/Prose";

export default function FloodSalvageImports() {
  return (
    <>
      <P>
        Some affordable cars in Oman arrive as imports. A good import can be a
        fair buy. A flood or salvage car sold as a clean story is how people
        lose money they cannot replace. US advice about CARFAX does not travel
        cleanly here — you still need eyes and honesty on the listing.
      </P>

      <H2>What to look for</H2>
      <UL
        items={[
          "Silt or tide lines in seat rails, spare-wheel well or under carpets",
          "Mismatched interior screws, fresh carpet glue, or a boot that smells damp after heat",
          "Electrical gremlins — windows, sensors, airbags lamps that will not clear",
          "Paperwork gaps: seller cannot explain import path or refuses the mulkiya until cash is paid",
        ]}
      />

      <H2>Spec origin is not the same as flood history</H2>
      <P>
        Knowing whether a car is{" "}
        <Link className="fw-6" href="/guides/gcc-spec-vs-american-import">
          GCC spec or an import
        </Link>{" "}
        matters for value and parts. It does not by itself prove the car was
        never underwater. Ask direct questions on WhatsApp and believe what the
        car shows you in daylight.
      </P>

      <H2>If the deal is “too good”</H2>
      <P>
        Inside a band where cars already sit at OMR 1,500–6,000, a further
        miracle discount needs a miracle explanation. No explanation, no deal.
        Browse listings that state origin up front on{" "}
        <Link className="fw-6" href="/used-cars">
          Autosouq
        </Link>
        .
      </P>
    </>
  );
}
