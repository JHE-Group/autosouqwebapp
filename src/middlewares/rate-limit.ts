import type { Core } from '@strapi/strapi';

/**
 * A small fixed-window rate limiter for the endpoints anyone can reach.
 *
 * ## Why this exists
 *
 * `POST /api/seller/register` is unauthenticated by necessity — it is the thing
 * that creates the account — and until it existed the CMS had no
 * unauthenticated write at all. src/index.ts revoked the plugin's own register
 * for exactly that reason. Reopening it without a limit means a loop can fill
 * `up_users` as fast as the network allows.
 *
 * The damage is bounded already: an account only buys a draft that a human must
 * publish, and the listing controller refuses to let one seller touch another's
 * rows. So this is about table growth and disk, not about anyone reaching data
 * they should not. It is still worth closing, because "someone filled the users
 * table overnight" is a bad morning.
 *
 * ## What this is not
 *
 * In-memory and per-process. It does not survive a restart, and if the CMS is
 * ever run as more than one process each gets its own allowance. That is
 * honest for the current deployment — a single Strapi behind nginx on one OVH
 * instance — and it is the first thing to revisit if that changes. A shared
 * store (Redis) or a limit at the proxy is the real answer at scale; this is
 * the version that costs nothing and closes the obvious hole today.
 *
 * ## The proxy caveat
 *
 * `ctx.ip` is only meaningful if Strapi is told to trust the proxy in front of
 * it. TRUST_PROXY is documented in .env.example and set on OVH; without it
 * every request appears to come from the proxy's own address, all callers share
 * one bucket, and legitimate sellers start seeing 429s. That failure is loud
 * rather than silent, which is the right way round, but it is worth knowing
 * where to look.
 */

type Bucket = { count: number; resetAt: number };

/**
 * Cap on distinct keys held at once.
 *
 * Without this, an attacker rotating source addresses turns the limiter itself
 * into the memory leak it was added to prevent. When full, the oldest windows
 * are dropped first — they are the ones closest to expiring anyway.
 */
const MAX_TRACKED_KEYS = 10_000;

export default (config: { max?: number; windowMs?: number }, { strapi }: { strapi: Core.Strapi }) => {
  const max = config?.max ?? 5;
  const windowMs = config?.windowMs ?? 60 * 60 * 1000;
  const buckets = new Map<string, Bucket>();

  return async (ctx: any, next: () => Promise<void>) => {
    const now = Date.now();
    /*
     * The seller's address if apps/web sent one, otherwise the socket's.
     *
     * Every request from the site arrives through the Next route handlers, so
     * `ctx.ip` is Vercel's egress address for every seller alive. Keying on it
     * meant /seller/register's 10-per-15-minutes was 10 registrations per 15
     * minutes for the WHOLE SITE — the eleventh real seller of the quarter hour
     * refused, with nothing to tell them why. A launch-day cap nobody chose.
     *
     * Be clear about what this header is: something the CMS chooses to believe.
     * It is not proof of origin, and anyone posting here directly can set it to
     * whatever they like, which makes the limiter bypassable by a determined
     * caller. That is a real weakness and it is the honest trade — before this
     * the limiter could not distinguish one client from another at all, so it
     * throttled the legitimate and the abusive together and mostly hurt the
     * legitimate. Binding it properly wants a shared secret between the two
     * apps, which is a deployment change and not this one.
     *
     * A malformed or absurd value falls back to ctx.ip rather than being
     * trusted as a bucket of its own, so the header cannot be used to mint
     * unlimited fresh windows.
     */
    const forwarded = String(ctx.request?.header?.['x-autosouq-client-ip'] ?? '').trim();
    const usable = forwarded.length > 0 && forwarded.length <= 45 && !/[^0-9a-fA-F:.]/.test(forwarded);
    const key = (usable ? forwarded : ctx.ip) ?? 'unknown';

    if (buckets.size > MAX_TRACKED_KEYS) {
      for (const [k, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(k);
      }
      // Still full: everything present is live, so drop the oldest windows
      // rather than let the map grow without bound.
      if (buckets.size > MAX_TRACKED_KEYS) {
        const oldest = [...buckets.entries()]
          .sort((a, b) => a[1].resetAt - b[1].resetAt)
          .slice(0, Math.floor(MAX_TRACKED_KEYS / 2));
        for (const [k] of oldest) buckets.delete(k);
      }
    }

    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (bucket.count >= max) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      ctx.set('Retry-After', String(retryAfter));
      strapi.log.warn(
        `Autosouq: rate limit hit on ${ctx.method} ${ctx.path} from ${key}.`,
      );
      /**
       * 429 with a sentence, not Strapi's default shape — and a sentence whose
       * timescale matches `Retry-After`.
       *
       * A hardcoded "wait a few minutes" beside a `Retry-After: 3600` is worse
       * than no message: it is a promise the server has already contradicted in
       * its own headers, and the person reading it has usually done nothing
       * wrong beyond sharing an office NAT with someone who has.
       */
      const minutes = Math.ceil(retryAfter / 60);
      ctx.status = 429;
      ctx.body = {
        error: {
          status: 429,
          name: 'TooManyRequests',
          message:
            minutes <= 1
              ? 'Too many attempts. Please try again in a minute.'
              : `Too many attempts. Please try again in about ${minutes} minutes.`,
        },
      };
      return;
    }

    bucket.count += 1;
    return next();
  };
};
