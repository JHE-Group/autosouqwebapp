/**
 * The numbers behind the admin homepage widgets.
 *
 * One SQL pass for everything about listings, plus two tiny queries for the
 * other two tables. Each metric is a different predicate over the same rows, so
 * running them as separate `count()` calls would be a dozen round trips and a
 * dozen scans of a table that only grows.
 *
 * ## The counting trap this file exists to avoid
 *
 * Strapi 5 stores a published document as TWO rows sharing a `document_id`: the
 * draft (`published_at IS NULL`) and the published one. So the obvious query
 * for "waiting to be moderated" —
 *
 *     SELECT count(*) FROM listings WHERE published_at IS NULL
 *
 * counts the draft row of every ALREADY-PUBLISHED listing as well. Measured on
 * the development database: it answers 26 where the real queue is 10. It is
 * wrong in the worst possible direction — plausible, and only ever too big — so
 * nobody notices until they compare it against the content manager and stop
 * trusting the page.
 *
 * Every listing metric below therefore groups by `document_id` first and then
 * asks whether the document has any published row.
 *
 * ## And a second one: moderationState is decorative
 *
 * The listing schema carries a `moderation_state` enum, but nothing in either
 * app ever writes it — grep finds only reads and two blocklist entries. Four of
 * the ten queued drafts have it NULL. So `WHERE moderation_state = 'pending'`
 * silently drops 40% of the queue. The queue is defined structurally, by the
 * absence of a published row, not by that field.
 */

/**
 * Everything derived from `listings`, in one pass.
 *
 * `related_type` is the model uid rather than a table name: Strapi puts every
 * media relation in the single polymorphic `files_related_mph` table, so the
 * join predicate has to name `api::listing.listing` explicitly or it counts
 * photos attached to showrooms and taxonomies too.
 */
export const LISTING_METRICS_SQL = `
WITH docs AS (
  SELECT
    document_id,
    bool_or(published_at IS NOT NULL)                        AS is_live,
    max(id)  FILTER (WHERE published_at IS NOT NULL)         AS live_id,
    max(id)  FILTER (WHERE published_at IS NULL)             AS draft_id,
    min(created_at)                                          AS created_at,
    max(price) FILTER (WHERE published_at IS NULL)           AS draft_price,
    max(price) FILTER (WHERE published_at IS NOT NULL)       AS live_price,
    max(updated_at) FILTER (WHERE published_at IS NULL)      AS draft_updated_at,
    max(updated_at) FILTER (WHERE published_at IS NOT NULL)  AS live_updated_at
  FROM listings
  GROUP BY document_id
),
live AS (
  SELECT d.document_id, d.live_id, d.draft_updated_at, d.live_updated_at,
         l.listing_status, l.price, l.verified, l.import_origin,
         COALESCE(l.availability_confirmed_at, l.published_at) AS vouched_at
  FROM docs d
  JOIN listings l ON l.id = d.live_id
  WHERE d.is_live
),
photos AS (
  SELECT related_id, count(*) AS n
  FROM files_related_mph
  WHERE related_type = 'api::listing.listing'
  GROUP BY related_id
)
SELECT
  /*
   * The queue: a document with no published row AND a real seller behind it.
   *
   * The seller check is not decoration. Strapi's "never published" predicate
   * cannot distinguish a car nobody has reviewed from one that was DELIBERATELY
   * UNPUBLISHED — both simply have no published row. The ten seeded demo cars
   * were unpublished on production on 2026-08-03, which means without this
   * clause the first thing the owner sees is ten invented Corollas presented as
   * sellers waiting on a decision, on a marketplace with no real submissions
   * yet. Precisely the misleading headline this whole file exists to avoid.
   *
   * Seeded listings carry no 'seller' relation and a real submission always
   * does — the unpublish script itself relies on that distinction.
   */
  (SELECT count(*) FROM docs d
    WHERE NOT d.is_live
      AND EXISTS (SELECT 1 FROM listings_seller_lnk s WHERE s.listing_id = d.draft_id))
                                                                       AS awaiting_first_review,

  /*
   * The queue nobody is watching: a seller edited a car that is already live.
   * listing.ts forces seller updates onto the draft, so the buyer keeps seeing
   * the old published version until a human presses Publish again.
   *
   * Compared by CONTENT, not by timestamp, and that is the whole point. The
   * obvious test — draft.updated_at > published.updated_at — misses the real
   * case: the one document in the development database with a genuinely
   * unreviewed edit carries a draft price of 5,555 against a published 2,000
   * and its draft timestamp is EARLIER, so a timestamp test reports zero while
   * a buyer is looking at the wrong price. Publishing rewrites the published
   * row's timestamp, so the two clocks say nothing reliable about which
   * content is newer.
   *
   * Price only. It is the field that changes most, the field a seller edits
   * most, and the one where showing a stale value is worst — a buyer who
   * messages about a price that is no longer real is the exact experience this
   * marketplace exists to be better than.
   */
  (SELECT count(*) FROM docs
    WHERE is_live AND draft_price IS DISTINCT FROM live_price)          AS edits_awaiting_review,

  (SELECT count(*) FROM live)                                          AS live_total,
  (SELECT count(*) FROM live WHERE listing_status = 'available')       AS live_available,
  (SELECT count(*) FROM live WHERE listing_status <> 'available')      AS live_not_available,

  /*
   * The one that matters most at launch. A car with no photograph is a car
   * nobody messages about, and the web app already treats this as the expected
   * state — components/carDetails/NoPhotoFrame.jsx renders a pre-written
   * "please send photos" WhatsApp message because of it.
   */
  (SELECT count(*) FROM live
     WHERE listing_status = 'available'
       AND COALESCE((SELECT n FROM photos WHERE photos.related_id = live.live_id), 0) = 0)
                                                                       AS live_available_no_photos,

  -- Buyer-visible trust gaps. Both render a negative badge on the card today.
  (SELECT count(*) FROM live WHERE listing_status = 'available' AND verified IS NOT TRUE)
                                                                       AS live_unverified,
  (SELECT count(*) FROM live WHERE listing_status = 'available' AND import_origin IS NULL)
                                                                       AS live_spec_unstated,

  /*
   * Stale, mirroring apps/web/lib/listingFreshness.js exactly: measured from
   * availabilityConfirmedAt falling back to publishedAt, and only for a live,
   * still-available car. Diverging from that file would put a different number
   * on the dashboard than the one the seller's own "still available?" nudge
   * uses.
   */
  (SELECT count(*) FROM live
     WHERE listing_status = 'available'
       AND vouched_at < now() - ($1::int * interval '1 day'))          AS stale_live,

  -- Out of band. Should always be zero: a lifecycle hook derives soldAsIs from
  -- price on every write, so a violation means a direct database edit.
  (SELECT count(*) FROM live WHERE price < 1000 OR price > 6000)       AS out_of_band,

  (SELECT count(*) FROM docs WHERE created_at > now() - interval '7 days')
                                                                       AS new_submissions_7d
`;

export const SHOWROOM_METRICS_SQL = `
  SELECT
    count(*) FILTER (WHERE state = 'pending')  AS showrooms_pending,
    count(*) FILTER (WHERE state = 'approved') AS showrooms_approved
  FROM showrooms
`;

export const SELLER_METRICS_SQL = `
  SELECT
    count(*)                                                        AS sellers_total,
    count(*) FILTER (WHERE created_at > now() - interval '7 days')  AS sellers_new_7d
  FROM up_users
`;
