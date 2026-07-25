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

function applyBand(data: Record<string, any>, currentPrice?: number) {
  const price = data.price === undefined ? currentPrice : Number(data.price);

  // Nothing to enforce on a partial update that does not touch the price.
  if (price === undefined || price === null || Number.isNaN(price)) return;

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

export default {
  beforeCreate(event: any) {
    applyBand(event.params.data);
  },

  async beforeUpdate(event: any) {
    const { data, where } = event.params;

    // A partial update may omit price while flipping soldAsIs, so read the
    // stored price before deciding.
    let currentPrice: number | undefined;
    if (data.price === undefined && where?.id) {
      const existing = await strapi.db
        .query("api::listing.listing")
        .findOne({ where: { id: where.id }, select: ["price"] });
      currentPrice = existing?.price;
    }

    applyBand(data, currentPrice);
  },
};
