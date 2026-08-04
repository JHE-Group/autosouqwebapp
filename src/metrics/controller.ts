import type { Core } from "@strapi/strapi";
import {
  LISTING_METRICS_SQL,
  SELLER_METRICS_SQL,
  SHOWROOM_METRICS_SQL,
} from "./queries";

/**
 * Aggregates for the admin homepage. Integers only — never rows.
 *
 * ## Why integers only, said plainly, because the temptation is real
 *
 * The obvious design is richer: show the moderation queue as a LIST of the cars
 * waiting, oldest first, each linking to its edit page. That is a better widget
 * and it is the one this deliberately does not build.
 *
 * The moderation queue is, by definition, DRAFTS. A draft's `whatsapp`, `phone`,
 * `address`, `latitude`/`longitude` and `vin` are not public — `forceVersion`
 * pins the content API to the published version, and a draft simply cannot be
 * read through it. Returning draft rows here would move pre-publication seller
 * data into a brand-new endpoint that has **no sanitization of any kind**:
 * `private: true` is enforced by the core-API controllers' `sanitizeOutput`,
 * and a raw `strapi.db.connection.raw` result passes through none of it. One
 * later edit that adds "and the title, so the list is readable" is all it takes.
 *
 * So the widgets show counts and link into the content manager, which already
 * knows how to redact. The number tells you there is work; the content manager
 * shows you the work, under the permissions it already enforces.
 *
 * ## No PII can be inferred from what this returns
 *
 * Every field below is a count over the whole table. None is scoped to a
 * seller, none can be narrowed by a query parameter — this endpoint takes no
 * input at all beyond the staleness constant.
 */

/** Mirrors apps/web/lib/listingFreshness.js. Changing one without the other
 *  puts a different number on the dashboard than in the seller's own nudge. */
const STALE_AFTER_DAYS = 30;

/**
 * node-postgres returns int8 as a STRING.
 *
 * `count()` and `sum()` are both int8, and pg maps that to a JavaScript string
 * to avoid silently losing precision past 2^53. So `row.live_total` arrives as
 * "16", `a + b` produces "1610", and a widget's number formatter renders NaN.
 * Coerced once, here at the boundary, rather than in every widget.
 */
const int = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

type Row = Record<string, unknown>;

const firstRow = (result: unknown): Row => {
  const rows = (result as { rows?: Row[] })?.rows;
  return Array.isArray(rows) && rows.length ? rows[0] : {};
};

export function createMetricsController(strapi: Core.Strapi) {
  return {
    async metrics(ctx: { body?: unknown; throw?: unknown }) {
      const knex = strapi.db.connection;

      /*
       * Three queries rather than one join: listings, showrooms and up_users
       * are unrelated tables and joining them would multiply rows. Run
       * concurrently, so it is one round trip of latency.
       */
      const [listings, showrooms, sellers] = await Promise.all([
        knex.raw(LISTING_METRICS_SQL, [STALE_AFTER_DAYS]),
        knex.raw(SHOWROOM_METRICS_SQL),
        knex.raw(SELLER_METRICS_SQL),
      ]);

      const l = firstRow(listings);
      const s = firstRow(showrooms);
      const u = firstRow(sellers);

      ctx.body = {
        data: {
          queue: {
            awaitingFirstReview: int(l.awaiting_first_review),
            editsAwaitingReview: int(l.edits_awaiting_review),
            showroomsPending: int(s.showrooms_pending),
          },
          inventory: {
            liveTotal: int(l.live_total),
            liveAvailable: int(l.live_available),
            liveNotAvailable: int(l.live_not_available),
            /* The honest number: a car a buyer can act on has a photograph. */
            liveAvailableWithPhotos:
              int(l.live_available) - int(l.live_available_no_photos),
            liveAvailableNoPhotos: int(l.live_available_no_photos),
          },
          quality: {
            unverified: int(l.live_unverified),
            specUnstated: int(l.live_spec_unstated),
            stale: int(l.stale_live),
            staleAfterDays: STALE_AFTER_DAYS,
            /* Should be zero forever — a lifecycle hook derives soldAsIs from
               price on every write, so anything here means a direct DB edit. */
            outOfBand: int(l.out_of_band),
          },
          supply: {
            newSubmissions7d: int(l.new_submissions_7d),
            sellersTotal: int(u.sellers_total),
            sellersNew7d: int(u.sellers_new_7d),
            showroomsApproved: int(s.showrooms_approved),
          },
        },
      };
    },
  };
}
