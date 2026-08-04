"use strict";

/**
 * One published listing per slug.
 *
 * `slug` is declared `uid` in the content type, which reads as unique — and on
 * production it had no unique constraint and no index of any kind. Checked
 * against the live database on 2026-08-04: `pg_constraint` and `pg_indexes`
 * both returned nothing for listings.slug.
 *
 * That matters because `slug` is not in SELLER_MAY_NOT_SET. A seller holds a
 * JWT and the CMS is on the public internet, so a request that does not come
 * from our own form can set it to anything — including a slug another seller's
 * car already uses. lib/resolveListing resolves a URL with `.find()`, which
 * returns the first match, so the second car simply stops being reachable at
 * its own address. Nothing errors and nothing is logged.
 *
 * **Partial, not plain.** Strapi 5 draft & publish stores two rows per
 * document, and they share a slug: publishing a listing adds a row with the
 * same slug and a non-null published_at. A unique index on `slug` alone would
 * therefore make publishing fail — which is worse than the bug, and is why
 * this index is restricted to rows that are actually published.
 *
 * Drafts may still collide, harmlessly: an unpublished listing has no public
 * URL to steal. The constraint bites exactly where a URL exists.
 */

const INDEX = "listings_slug_published_unique";

module.exports = {
  async up(knex) {
    /*
     * Any existing collision has to go first or the index cannot be built.
     * There are none today — verified on production, 10 documents, 10 distinct
     * slugs — but a migration that assumes its own preconditions is a
     * migration that fails on the one database that mattered.
     *
     * Suffixing rather than deleting: a slug is a URL, and the right answer to
     * two cars claiming one is to give the later car a different address, not
     * to remove it.
     */
    const dupes = await knex("listings")
      .select("slug")
      .whereNotNull("slug")
      .whereNotNull("published_at")
      .groupBy("slug")
      .havingRaw("count(*) > 1");

    for (const { slug } of dupes) {
      const rows = await knex("listings")
        .select("id")
        .where({ slug })
        .whereNotNull("published_at")
        .orderBy("id", "asc");

      // The first keeps the slug; the rest are renamed by their own id, which
      // is unique by construction and stable.
      for (const row of rows.slice(1)) {
        await knex("listings")
          .where({ id: row.id })
          .update({ slug: `${slug}-${row.id}` });
      }
    }

    await knex.raw(
      `CREATE UNIQUE INDEX IF NOT EXISTS ${INDEX}
         ON listings (slug)
         WHERE published_at IS NOT NULL AND slug IS NOT NULL`,
    );
  },

  async down(knex) {
    await knex.raw(`DROP INDEX IF EXISTS ${INDEX}`);
  },
};
