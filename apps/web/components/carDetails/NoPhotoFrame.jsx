"use client";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppGlyph } from "@/components/common/WhatsAppButton";

/**
 * What a listing with no photographs shows where the gallery would be.
 *
 * The gallery returned `null`, so a car with no photos had no image element on
 * the page at all — no picture, no placeholder, and nothing anywhere saying
 * "no photos yet". On mobile the page opened with a breadcrumb and then a text
 * card; on desktop the gallery column simply collapsed, leaving roughly two
 * thirds of the page as blank white beside a narrow strip of text. It read as
 * a broken page rather than an incomplete listing.
 *
 * This is not an edge case. Production inventory is zero and most sellers file
 * a car before they have taken photographs, so at launch this is the state
 * MOST listings are in. It deserves a designed answer.
 *
 * The answer is a request, not an apology. A buyer looking at a car with no
 * photos has exactly one question, and it is one the seller can act on in ten
 * seconds — so the frame asks it for them, with a WhatsApp message already
 * written. That turns the emptiest page on the site into the thing most likely
 * to make a seller upload, which is the supply problem NICHE.md names as the
 * binding constraint.
 *
 * Cream rather than indigo: ink on cream is 11.19:1, and this is a large calm
 * surface rather than the small dense band the CARD uses. Outlined rather than
 * green — the primary WhatsApp CTA lives beside the price, and two green
 * buttons competing on one screen is the mistake the sticky bar already made.
 */
export default function NoPhotoFrame({ car }) {
  const t = useTranslations("listing.section");
  const locale = useLocale();

  // A sold car needs no photographs and its seller should not be messaged —
  // the same rule WhatsAppButton applies.
  const canAsk = car?.listingStatus !== "sold";
  const href = canAsk
    ? buildWhatsAppUrl(car?.whatsapp, t("askForPhotosMessage"))
    : null;

  return (
    <div className="mb-40">
      <div className="asq-nophoto" lang={locale}>
        <Image
          className="asq-nophoto__mark"
          src="/assets/images/brand/icon-indigo.svg"
          alt=""
          width={56}
          height={56}
          unoptimized
        />
        <p className="asq-nophoto__caption">{t("noPhotosYet")}</p>
        {href ? (
          <a
            className="asq-nophoto__ask"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppGlyph size={18} />
            <span>{t("askForPhotos")}</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}
