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
const SELLER_MAY_NOT_SET = [
  'verified',
  'featured',
  'seller',
  'publishedAt',
  // The moderator's decision and the note explaining it. A seller who
  // could set these could mark their own car approved, or erase the
  // reason it was turned down.
  'moderationState',
  'moderationNote',
  // Set only by the confirm-available endpoint, which stamps it server-side.
  // A seller who could write it directly could keep a sold car looking fresh.
  'availabilityConfirmedAt',
] as const;

function stripPrivilegedFields(data: Record<string, unknown>) {
  for (const field of SELLER_MAY_NOT_SET) delete data[field];
}

/**
 * A slug the front end can resolve, or nothing.
 *
 * `slug` is deliberately NOT in SELLER_MAY_NOT_SET: apps/web mints it from the
 * resolved taxonomy so an Arabic-filed car gets a Latin URL, and stripping it
 * here would hand slug generation back to Strapi's uid, which derives from the
 * title — and "تويوتا كورولا 2015" reduces to the year, which 404s.
 *
 * But a seller holds a JWT and this API is on the public internet, so what
 * arrives is not necessarily what our form sent. Two shapes break things:
 *
 *   · a leading digit — lib/resolveListing reads /^(\d+)(?:-|$)/ as a numeric
 *     listing id, misses, and the car 404s on its own URL
 *   · anything outside [a-z0-9-] — the value becomes a path segment
 *
 * A bad slug is dropped, not rejected. The listing is still a real car from a
 * real seller, and Strapi's uid will derive something usable from the title;
 * refusing the whole submission over a field the seller never saw would be the
 * worse failure. Collisions are handled by the unique index in
 * database/migrations, because shape and uniqueness are different problems.
 */
const SLUG_SHAPE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

function dropUnusableSlug(data: Record<string, unknown>) {
  const slug = data.slug;
  if (slug === undefined || slug === null) return;
  const value = String(slug);
  if (!SLUG_SHAPE.test(value) || value.length > 120) {
    strapi.log.warn(
      `listing create: dropped unusable slug ${JSON.stringify(value)}`
    );
    delete data.slug;
  }
}

/** The stored document, narrowed to the part ownership checks care about. */
type OwnedListing = { seller?: { id?: number } | null } | null;

/**
 * Query keys that decide which version of a document a request sees.
 *
 * All three are on Strapi's own allowlist (`ALLOWED_QUERY_PARAM_KEYS` in
 * @strapi/utils), so `api.rest.strictParams` does not stop them and they reach
 * the document service intact. Every handler below therefore has to strip the
 * whole set and state the version itself — clamping only `status` leaves two
 * other doors into the same cohort logic.
 */
const VERSION_QUERY_KEYS = ['status', 'publicationFilter', 'hasPublishedVersion'] as const;

/**
 * Force which version of a document this request may act on.
 *
 * The reason this is a helper rather than a line in `create` is a real bug that
 * shipped in this file: `create` clamped the state and `update` did not, so a
 * seller could file a draft and then `PUT /api/listings/<id>?status=published`
 * to publish it themselves — straight past the review queue that is the entire
 * point of the draft. Reproduced against a running instance before fixing.
 *
 * The same omission applied to `find` and `findOne`, which were left stock in
 * the belief that the public API returns published documents only. It does not:
 * `CoreService.getFetchParams` spreads the caller's params *after* its own
 * `status: 'published'` default, so `?status=draft` overrides it and every
 * unreviewed submission — with the seller's phone number in it — was readable by
 * anyone. Also reproduced.
 *
 * One helper, called by all five handlers, so the next handler added to this
 * file has an obvious thing to call rather than a comment to notice.
 */
function forceVersion(ctx: { query?: Record<string, unknown> }, status: 'draft' | 'published') {
  stripVersion(ctx);
  ctx.query = { ...ctx.query, status };
}

/**
 * Strip the version keys without naming a version.
 *
 * For `delete`, which must not state one. The document service throws outright
 * on `status: 'draft'`:
 *
 *   if (hasDraftAndPublish && params.status === 'draft') {
 *     throw new Error('Cannot delete a draft document');
 *   }
 *
 * — @strapi/core 5.51.0, services/document-service/repository.js. So the
 * `forceVersion(ctx, 'draft')` that used to sit in `delete` made every delete a
 * 500, and no seller could remove their own listing. Reproduced against
 * production on 2026-08-02: three DELETEs, three 500s, while an UPDATE of the
 * same row returned 200 and a DELETE of somebody else's row correctly 404'd.
 *
 * The clamp was there against a risk that does not exist. `deleteDocument`
 * builds both its lookup and its selection query through `omit('status')`, so
 * the parameter cannot narrow what is removed: a delete always takes every
 * entry carrying that documentId, draft and published alike. There is no
 * version for the caller to steer, which is why stripping is the whole job —
 * `publicationFilter` and `hasPublishedVersion` still go, so nothing the client
 * sends reaches the cohort logic.
 *
 * Deleting a listing therefore removes it outright, live version included. That
 * is the intended behaviour for a seller retiring a car, and it is gated by the
 * ownership check above rather than by this helper.
 */
function stripVersion(ctx: { query?: Record<string, unknown> }) {
  const query = { ...(ctx.query ?? {}) };
  for (const key of VERSION_QUERY_KEYS) delete query[key];
  ctx.query = query;
}

export default factories.createCoreController('api::listing.listing', ({ strapi }) => ({
  /**
   * Read: published only, whatever the caller asks for.
   *
   * These were stock, on the assumption stated elsewhere in this file that the
   * public API returns published documents by default. It does — until a caller
   * passes `?status=draft`, which overrides the default and returned every
   * unreviewed submission, WhatsApp number included, to anyone who asked.
   *
   * A seller reading their own drafts is served by `GET /api/seller/listings`,
   * which scopes to the token instead of trusting a query parameter.
   */
  async find(ctx) {
    forceVersion(ctx, 'published');
    return await super.find(ctx);
  },

  async findOne(ctx) {
    forceVersion(ctx, 'published');
    return await super.findOne(ctx);
  },

  /**
   * Create: always owned by the caller, always a draft.
   *
   * The draft is the review queue. `draftAndPublish` is already on for this
   * content type and `find` above is now clamped to published documents, so the
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
    dropUnusableSlug(data);
    ctx.request.body.data = data;

    // Strapi 5 honours `?status=published` on the content API, so without this
    // a caller could publish by query string and walk straight past the queue.
    forceVersion(ctx, 'draft');

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

    // The bug this file shipped with: without it, a seller edits their own draft
    // with `?status=published` and publishes it themselves.
    forceVersion(ctx, 'draft');

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

    // Strip, do not clamp — naming a version here is what threw. See stripVersion.
    stripVersion(ctx);

    return await super.delete(ctx);
  },
}));
