/**
 * When a listing stops being trustworthy on its own.
 *
 * Nothing in this product expires a car. A listing published today is still
 * live and still says "available" in two years, because there is no expiry
 * field, no scheduled job and no way to contact a seller — checked, not
 * assumed: the content type has no date column beyond Strapi's own, the CMS has
 * no cron config, and no email provider is configured.
 *
 * That is the standard decay curve for classifieds and it is worse here than
 * most. A seller whose car sells privately has no reason to come back and say
 * so; they simply stop thinking about the site. Six months in, a real share of
 * the inventory is cars that went long ago, buyers message sellers who never
 * reply, and the listings stop being believed — on a site whose entire
 * proposition is that its listings are real.
 *
 * This is the cheapest thing that arrests it: ask the seller, on their own
 * dashboard, when a car has been sitting a while. No email, no provider
 * decision, no scheduled job. It only reaches sellers who visit — that is the
 * honest limit of it, and the reason a WhatsApp nudge is the obvious next step
 * rather than a replacement.
 */

/**
 * Thirty days.
 *
 * Long enough that a normally-selling car in this band is never asked, short
 * enough that a sold one is caught inside a month. NICHE.md's band is
 * OMR 1,000–6,000, where cars move in weeks rather than days — a fortnight
 * would nag honest sellers and train them to ignore it, which is the failure
 * mode of every reminder ever built.
 */
export const STALE_AFTER_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * When the seller last vouched for this car, or when it went live.
 *
 * `availabilityConfirmedAt` is stamped server-side by the confirm endpoint.
 * Falling back to `publishedAt` is what makes the first prompt appear at all —
 * a listing nobody has confirmed yet is measured from the day it went up.
 */
function vouchedAt(listing) {
  const value = listing?.availabilityConfirmedAt ?? listing?.publishedAt;
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

/**
 * Whether to ask the seller if this car is still for sale.
 *
 * `now` is a parameter rather than a call to Date.now() so this is testable and
 * so a server render and a client render of the same row cannot disagree about
 * the date and produce a hydration mismatch.
 *
 * Only live, available cars are asked. A pending or declined listing has no
 * buyer to mislead, and one already marked sold or reserved has answered.
 */
export function needsAvailabilityCheck(listing, now = Date.now()) {
  if (!listing) return false;
  if (listing.state !== "live") return false;
  if (listing.listingStatus && listing.listingStatus !== "available") return false;

  const since = vouchedAt(listing);
  if (since === null) return false;

  return now - since >= STALE_AFTER_DAYS * DAY_MS;
}

/** Whole days since the seller last vouched, for the prompt's wording. */
export function daysSinceVouched(listing, now = Date.now()) {
  const since = vouchedAt(listing);
  if (since === null) return null;
  return Math.max(0, Math.floor((now - since) / DAY_MS));
}
