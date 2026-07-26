import { errors } from "@strapi/utils";

const { ValidationError } = errors;

/**
 * The OMR 1,500–6,000 band is the identity of the business, not a preference.
 * See NICHE.md: "Nothing above 6,000 is ever listed. Cars from 1,000–1,499 may
 * be accepted but are labelled 'sold as-is'."
 *
 * schema.json enforces the hard min/max. These hooks own the part a schema
 * cannot express: the sold-as-is label is derived from the price, never chosen
 * by whoever is filling in the form.
 */
export const BAND = {
  ASIS_MIN: 1000,
  ASIS_MAX: 1499,
  STANDARD_MIN: 1500,
  MAX: 6000,
} as const;

function applyBand(data: Record<string, unknown>, currentPrice?: number) {
  const raw = data.price === undefined ? currentPrice : Number(data.price);

  // Nothing to enforce on a partial update that does not touch the price —
  // but never trust a client-supplied soldAsIs in that case either.
  if (raw === undefined || raw === null || Number.isNaN(Number(raw))) {
    if ("soldAsIs" in data) delete data.soldAsIs;
    return;
  }

  const price = Number(raw);

  if (price > BAND.MAX) {
    throw new ValidationError(
      `Autosouq lists cars up to OMR ${BAND.MAX.toLocaleString()} only — ` +
        `OMR ${price.toLocaleString()} is above the band. See NICHE.md.`,
    );
  }

  if (price < BAND.ASIS_MIN) {
    throw new ValidationError(
      `OMR ${price.toLocaleString()} is below the OMR ${BAND.ASIS_MIN.toLocaleString()} floor.`,
    );
  }

  // Derived, not chosen: 1,000–1,499 is always "sold as-is", and anything at
  // or above 1,500 never carries the label.
  data.soldAsIs = price <= BAND.ASIS_MAX;
}

async function resolveStoredPrice(where: Record<string, unknown> | undefined) {
  if (!where) return undefined;

  const id = where.id ?? where.documentId;
  if (id == null) return undefined;

  const existing = await strapi.db.query("api::listing.listing").findOne({
    where: where.documentId ? { documentId: where.documentId } : { id: where.id },
    select: ["price"],
  });

  return existing?.price as number | undefined;
}

export default {
  beforeCreate(event: { params: { data: Record<string, unknown> } }) {
    applyBand(event.params.data);
  },

  async beforeUpdate(event: {
    params: { data: Record<string, unknown>; where?: Record<string, unknown> };
  }) {
    const { data, where } = event.params;

    let currentPrice: number | undefined;
    if (data.price === undefined) {
      currentPrice = await resolveStoredPrice(where);
    }

    applyBand(data, currentPrice);
  },
};
