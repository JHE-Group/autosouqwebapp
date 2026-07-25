import { useTranslations } from "next-intl";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { DEFAULT_LOCALE } from "@/lib/locale";

/**
 * "Report this listing" — previously static text with no handler.
 *
 * A non-functional report link on a trust-led site is a promise with nothing
 * behind it, which is worse than no link at all: it invites a buyer who has
 * spotted a scam to tell us, and then drops them. At ten listings moderation
 * is a human reading WhatsApp, so the report is a click-to-chat message
 * carrying the listing id — no backend, no queue, no ticket system.
 *
 * When NEXT_PUBLIC_AUTOSOUQ_WHATSAPP is unset the control is absent rather
 * than dead. Absent is honest; dead is a lie about what we will do.
 */
export default function ReportListing({ carItem, locale = DEFAULT_LOCALE }) {
  const t = useTranslations("listing.report");
  const ops = process.env.NEXT_PUBLIC_AUTOSOUQ_WHATSAPP;
  const id = carItem?.id;

  // Composed in the reader's language: this is the message they send under
  // their own name, so it must not arrive half in a language they did not pick.
  const message = [
    t("greeting"),
    t("intro"),
    t("listingId", { id: id ?? "—" }),
    carItem?.title ?? "",
    "",
    t("reason"),
  ].join("\n");

  const href = buildWhatsAppUrl(ops, message);
  if (!href) return null;

  const label = t("cta");

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="list-icon-pf gap-8 flex-three mb-40"
      // #BD4B2B on white is 4.99:1. White on terracotta #E97451 is 2.97:1 and
      // is never used for text.
      style={{ color: "#BD4B2B", minHeight: 48, fontWeight: 600 }}
    >
      {/* Inline, not `far fa-flag`: font-awesome.css is never imported, so that
          class drew a blank box next to the label. */}
      <svg
        width={16}
        height={16}
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        focusable="false"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M3.5 14.5V2.2m0 0c2.4-1.1 4.8 1.1 7.2 0 .9-.4 1.8-.4 1.8-.4v7.4s-.9 0-1.8.4c-2.4 1.1-4.8-1.1-7.2 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-1">{label}</span>
    </a>
  );
}
