import { factories } from '@strapi/strapi';

/**
 * Seller-owned writes over the content API.
 *
 * ## Why this exists before anyone can reach it
 *
 * The Authenticated role has no `create` permission today, so none of the
 * overrides below are reachable yet. That is deliberate. src/index.ts warns:
 *
 *   "The plan on record is to give the Authenticated role write access to
 *    listings. On the day that lands, every junk account created in the
 *    meantime becomes a valid listing-creation credential."
 *
 * Granting the permission and then writing the enforcement is the wrong order —
 * it leaves a window where `POST /api/listings` is an open, unowned,
 * self-publishing write endpoint. So the enforcement lands first, reviewed, and
 * the permission is flipped on top of it later.
 *
 * ## What the admin panel does instead
 *
 * Nothing here touches it. The Strapi admin writes through the admin API, not
 * `/api/listings`, so a human entering a car in the panel still sets `seller`,
 * `verified` and publish state freely. These rules bind the public API only.
 */

/**
 * Fields a seller may never set on themselves.
 *
 * `verified` and `featured` are editorial claims the business makes about a
 * car, not properties of the submission — `verified` in particular is the whole
 * value of the Verified badge, so a seller setting it would be self-certifying.
 * `seller` is assigned from the session, never from the body, or one account
 * could file listings under another. `publishedAt` is how draft/publish is
 * represented on the document, so accepting it from a client would let a
 * submission skip the review queue entirely.
 */
const SELLER_MAY_NOT_SET = ['verified', 'featured', 'seller', 'publishedAt'] as const;

function stripPrivilegedFields(data: Record<string, unknown>) {
  for (const field of SELLER_MAY_NOT_SET) delete data[field];
}

/** The stored document, narrowed to the part ownership checks care about. */
type OwnedListing = { seller?: { id?: number } | null } | null;

export default factories.createCoreController('api::listing.listing', ({ strapi }) => ({
  /**
   * Create: always owned by the caller, always a draft.
   *
   * The draft is the review queue. `draftAndPublish` is already on for this
   * content type and the public `find` only returns published documents, so the
   * admin panel's Publish button is the approval step — no bespoke moderation
   * state, and no way for a new listing to reach an indexed page before a human
   * has looked at it.
   */
  async create(ctx) {
    const user = ctx.state?.user;
    if (!user) {
      return ctx.unauthorized('You must be signed in to create a listing.');
    }

    const data = (ctx.request.body?.data ?? {}) as Record<string, unknown>;
    stripPrivilegedFields(data);
    ctx.request.body.data = data;

    // Not merely the default: Strapi 5 honours `?status=published` on the
    // content API, so leaving this alone would let a caller publish by query
    // string and walk straight past the queue.
    ctx.query = { ...ctx.query, status: 'draft' };

    const response = await super.create(ctx);

    /**
     * Ownership is stamped after creation, not in the body.
     *
     * `seller` is `private` in the schema so it never appears in an API
     * response — without that, any caller could read the owning account off a
     * listing with `?populate=seller`. But `private` also removes the field
     * from *input*, and the content API answers `400 Invalid key seller` to
     * anything that tries to set it, this controller included. Verified
     * against a running instance; it is not a theoretical restriction.
     *
     * The document service is the internal path and applies no content-API
     * sanitisation, so it can write the field the public route cannot. The
     * listing is a draft for the whole of this window, so it is never
     * reachable from the site while it is briefly unowned.
     */
    const documentId = (response as { data?: { documentId?: string } })?.data?.documentId;
    if (documentId) {
      try {
        await strapi.documents('api::listing.listing').update({
          documentId,
          status: 'draft',
          data: { seller: user.id } as never,
        });
      } catch (err) {
        // An unowned draft is worse than no draft: nothing in the admin would
        // say who filed it, and the seller could never edit it. Roll back.
        await strapi.documents('api::listing.listing').delete({ documentId });
        strapi.log.error(`Autosouq: could not attribute new listing — ${err}`);
        return ctx.internalServerError('Could not save your listing. Please try again.');
      }
    }

    return response;
  },

  /**
   * Update: the owning seller only.
   *
   * Ownership is read from the stored document, never from the request — the
   * body's `seller` is stripped above, so a caller cannot reassign a listing to
   * themselves and then edit it.
   */
  async update(ctx) {
    const user = ctx.state?.user;
    if (!user) {
      return ctx.unauthorized('You must be signed in to edit a listing.');
    }

    const existing = (await strapi.documents('api::listing.listing').findOne({
      documentId: ctx.params.id,
      populate: { seller: true },
      status: 'draft',
    })) as OwnedListing;

    // `notFound`, not `forbidden`: a 403 confirms the listing exists, which
    // turns ids into an inventory oracle for anyone holding an account.
    const ownerId = existing?.seller?.id;
    if (!existing || !ownerId || ownerId !== user.id) {
      return ctx.notFound('Listing not found.');
    }

    const data = (ctx.request.body?.data ?? {}) as Record<string, unknown>;
    stripPrivilegedFields(data);
    ctx.request.body.data = data;

    return await super.update(ctx);
  },

  /**
   * Delete: the owning seller only, same ownership rule as update.
   */
  async delete(ctx) {
    const user = ctx.state?.user;
    if (!user) {
      return ctx.unauthorized('You must be signed in to delete a listing.');
    }

    const existing = (await strapi.documents('api::listing.listing').findOne({
      documentId: ctx.params.id,
      populate: { seller: true },
      status: 'draft',
    })) as OwnedListing;

    const ownerId = existing?.seller?.id;
    if (!existing || !ownerId || ownerId !== user.id) {
      return ctx.notFound('Listing not found.');
    }

    return await super.delete(ctx);
  },
}));
