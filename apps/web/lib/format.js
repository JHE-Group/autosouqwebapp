export const DEFAULT_CURRENCY = "OMR";

/**
 * Money as the marketplace shows it: "6,250 OMR".
 *
 * The theme hardcodes a `$` in front of every price, which is wrong for Omani
 * listings — route all price rendering through here instead.
 */
export function formatPrice(value, currency = DEFAULT_CURRENCY) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return `${amount.toLocaleString("en-US")} ${currency}`;
}
