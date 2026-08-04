import type { Core } from '@strapi/strapi';

/**
 * Account creation for sellers.
 *
 * Deliberately narrow: it makes an account and returns a token, and does
 * nothing else. Login stays on `POST /api/auth/local`, which works as shipped
 * because it only reads `identifier` and `password` — the problem was only ever
 * with *creating* a user carrying our required profile fields.
 *
 * ## Where OTP lands
 *
 * Everything below the credential check is mechanism-independent: uniqueness,
 * role lookup, the profile write, the token. Phone OTP replaces `password` with
 * a verified number and a one-time code, and nothing else in this file — or
 * anywhere in apps/web — has to move.
 */

/**
 * Rejections a caller is allowed to see.
 *
 * Deliberately a local class rather than `ValidationError` from
 * `@strapi/utils`. Those were tried and produced **500s**: Strapi's error
 * middleware maps them by `instanceof`, and under pnpm the copy of
 * `@strapi/utils` this file resolves is not always the copy the middleware
 * holds, so the check silently fails and a clean 400 becomes an Internal Server
 * Error. The messages were correct in the log and useless to the client.
 *
 * A class declared here has one identity by construction, and `ctx.badRequest`
 * sets the status directly rather than relying on the middleware to infer it.
 */
class RegisterError extends Error {
  /**
   * A stable machine code alongside the message.
   *
   * The English sentence stays: it is the log line, and the fallback if the web
   * app ever meets a code it has no translation for — a missing translation
   * should degrade to the wrong language, not to no message.
   *
   * But the sentence cannot be the contract. Arabic is the default locale, so
   * every error an Arabic seller could actually reach was English prose. The
   * CMS still owns *which* thing went wrong; the web app owns how it is said,
   * and in whose language. Codes are transport-agnostic, so they survive the
   * phone-OTP swap — only the set changes.
   */
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/** Omani mobile numbers, with or without the 968 country code. */
const OMANI_MSISDN = /^(?:968)?[79]\d{7}$/;

function normalizeMsisdn(raw: unknown): string | undefined {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  const digits = raw.replace(/\D/g, '');
  if (!OMANI_MSISDN.test(digits)) {
    throw new RegisterError(
      'bad_msisdn',
      'Enter a valid Omani mobile number, e.g. 9123 4567.',
    );
  }
  return digits.startsWith('968') ? digits : `968${digits}`;
}

function requireString(value: unknown, field: string, min: number, max: number) {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (trimmed.length < min || trimmed.length > max) {
    throw new RegisterError(
      field === 'Password' ? 'weak_password' : 'missing_fields',
      `${field} must be between ${min} and ${max} characters.`,
    );
  }
  return trimmed;
}

type RegisterCtx = {
  request: { body?: Record<string, unknown> };
  body?: unknown;
  // Strapi's second argument lands on `error.details`, which is where the web
  // app reads the machine code from.
  badRequest: (message: string, details?: Record<string, unknown>) => unknown;
};

type ListingsCtx = {
  state?: { user?: { id?: number } };
  body?: unknown;
  unauthorized: (message: string) => unknown;
};

type StatusCtx = ListingsCtx & {
  params?: { id?: string };
  request?: { body?: { listingStatus?: string; takeDown?: boolean } };
  notFound: (message: string) => unknown;
  badRequest: (message: string) => unknown;
};

/**
 * The only states a seller may move their own car between.
 *
 * Not the whole enum by accident — it is the whole enum on purpose, and it is
 * written out so that adding a fourth value to the content type does not
 * silently become something a seller can set without anyone deciding it should
 * be.
 */
const SELLER_MAY_SET_STATUS = new Set(['available', 'reserved', 'sold']);

/** What a seller is shown about their own car. */
const SELLER_LISTING_FIELDS = [
  'title',
  // The moderator's decision, and what they want the seller to do about it.
  // Both are in SELLER_MAY_NOT_SET, so they are readable here and writable
  // only from the admin.
  'moderationState',
  'moderationNote',
  'slug',
  'price',
  'currency',
  'year',
  'mileage',
  'listingStatus',
  'soldAsIs',
  'verified',
  'featured',
  'importOrigin',
  'createdAt',
  'updatedAt',
  /**
   * Needed to tell a live listing from a pending one.
   *
   * Omitting it did not fail loudly — it made `state` below read 'pending' for
   * every row, so a seller's published car would have been labelled "Pending
   * review" on /my-listing indefinitely. Phase-4 testing only ever had drafts,
   * so nothing in it could have caught this.
   */
  'publishedAt',
] as const;

export default {
  async register(ctx: RegisterCtx) {
    const strapi = (global as unknown as { strapi: Core.Strapi }).strapi;
    const users = strapi.plugin('users-permissions');
    const body = ctx.request.body ?? {};

    try {
      const email = requireString(body.email, 'Email', 6, 254).toLowerCase();
      const password = requireString(body.password, 'Password', 8, 72);
      const fullName = requireString(body.fullName, 'Full name', 2, 80);
      // Optional at signup. A seller gives a number on the listing itself, and
      // demanding it twice adds a field for nothing. Phone OTP will make this
      // the primary identifier instead.
      const whatsapp = normalizeMsisdn(body.whatsapp);

      /**
       * Username is derived from the email, never asked for.
       *
       * users-permissions requires it and enforces uniqueness, but it means
       * nothing to a seller — a field whose only job is to collide with someone
       * else's. The email is already unique, so it serves as both.
       */
      const username = email;

      const existing = await strapi.db
        .query('plugin::users-permissions.user')
        .findOne({ where: { $or: [{ email }, { username }] } });

      if (existing) {
        // Deliberately vague. Confirming which addresses hold accounts turns
        // this into a membership oracle, on a site whose sellers are
        // identifiable individuals.
        throw new RegisterError('email_unavailable', 'That email cannot be used.');
      }

      const settings = (await strapi
        .store({ type: 'plugin', name: 'users-permissions', key: 'advanced' })
        .get()) as { default_role?: string } | null;

      const role = await strapi.db
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: settings?.default_role ?? 'authenticated' } });

      if (!role) {
        strapi.log.error('Autosouq: no default role — cannot register sellers.');
        throw new RegisterError(
          'registration_unavailable',
          'Registration is unavailable.',
        );
      }

      const user = await users.service('user').add({
        username,
        email,
        password,
        fullName,
        ...(whatsapp ? { whatsapp } : {}),
        provider: 'local',
        /**
         * Confirmed on creation, because the alternative is worse.
         *
         * No email provider is configured, so a confirmation mail would never
         * arrive and every account would be permanently locked out. This is not
         * a claim the address is real — it is not verified, and nothing here
         * pretends otherwise. Phone OTP is the step that will establish the
         * person exists; until then an account proves only that someone filled
         * in a form, which is why their listing still lands as a draft for a
         * human to approve.
         */
        confirmed: true,
        blocked: false,
        role: role.id,
      });

      /**
       * `issue()` must be awaited, even though it reads as synchronous.
       *
       * In 5.51 its return type depends on `plugin::users-permissions.
       * jwtManagement`: the legacy path returns a signed string, the `refresh`
       * path a Promise for one. Unawaited, the response serialised the Promise
       * and shipped `"jwt": {}` — a 200 with a token-shaped hole the client
       * would only discover on its next request.
       */
      ctx.body = {
        jwt: await users.service('jwt').issue({ id: user.id }),
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          whatsapp: user.whatsapp ?? null,
        },
      };
    } catch (err) {
      if (err instanceof RegisterError) {
        // `badRequest(message, details)` puts `details` on error.details, which
        // is where the web app reads the code from.
        return ctx.badRequest(err.message, { code: err.code });
      }
      // Anything else is ours, not the caller's: log it in full and say
      // nothing useful to a stranger probing the endpoint.
      strapi.log.error(`Autosouq: seller registration failed — ${err}`);
      return ctx.badRequest('Could not create your account. Please try again.', {
        code: 'registration_failed',
      });
    }
  },

  /**
   * The caller's own listings, drafts included.
   *
   * Scoped by `ctx.state.user`, never by anything in the request. There is no
   * pagination or filtering parameter on purpose: every input this endpoint
   * could accept is an input that could widen the scope, and a seller with
   * enough cars to need paging is a conversation, not a bug.
   *
   * `status: 'draft'` is the Strapi 5 way of asking for every document in its
   * working state — a published listing still has a draft version, so this
   * returns the seller's whole shelf rather than only their unpublished cars.
   * `publishedAt` distinguishes the two for the caller.
   */
  async listings(ctx: ListingsCtx) {
    const strapi = (global as unknown as { strapi: Core.Strapi }).strapi;
    const userId = ctx.state?.user?.id;

    if (!userId) {
      return ctx.unauthorized('You must be signed in.');
    }

    /**
     * `status: 'draft'` asks for every document in its working state — a
     * published listing still has a draft version — so this returns the
     * seller's whole shelf rather than only their unpublished cars.
     *
     * But the draft version's own `publishedAt` is null by construction, so it
     * cannot be what distinguishes the two. The published version is fetched
     * separately below and the document ids compared.
     */
    const rows = await strapi.documents('api::listing.listing').findMany({
      filters: { seller: { id: userId } } as never,
      fields: SELLER_LISTING_FIELDS as never,
      status: 'draft',
      sort: { createdAt: 'desc' } as never,
      limit: 100,
    });

    const live = await strapi.documents('api::listing.listing').findMany({
      filters: { seller: { id: userId } } as never,
      fields: ['id'] as never,
      status: 'published',
      limit: 100,
    });

    const liveIds = new Set(
      (live ?? []).map((row: Record<string, unknown>) => row.documentId),
    );

    ctx.body = {
      data: (rows ?? []).map((row: Record<string, unknown>) => ({
        ...row,
        /**
         * Derived rather than exposed raw.
         *
         * `publishedAt` is a Strapi implementation detail, and what the seller
         * wants to know is whether anyone can see the car yet. "pending" is the
         * honest word for a draft: it is with us, it is not live, and nobody has
         * to know what draftAndPublish is to read it.
         *
         * Keyed on whether a published version of this document exists, NOT on
         * the row's own `publishedAt` — that is always null here, because these
         * rows are the draft versions. Reading it directly is the bug this
         * replaces, which labelled every listing "pending" forever.
         */
        /*
         * Three states, not two.
         *
         * This read `live : pending`, so a car a moderator had turned down was
         * indistinguishable from one nobody had looked at yet — and since
         * declining a listing is just "leave it unpublished", the seller waited
         * on a decision that had already been made, with no way to learn what
         * was wrong or that anything had been decided at all.
         *
         * Published still wins: a live listing is live whatever the moderation
         * field says, because what a buyer can see is the fact that matters.
         */
        state: liveIds.has(row.documentId)
          ? 'live'
          : row.moderationState === 'declined'
            ? 'declined'
            : 'pending',
      })),
    };
  },

  /**
   * Mark a car sold or reserved, or take it down. The owning seller only.
   *
   * This is the one seller write that deliberately reaches the PUBLISHED
   * version, and it needs its own endpoint precisely because of that.
   *
   * The listing controller's `update` calls forceVersion(ctx, 'draft') so a
   * seller cannot edit live content past review — otherwise a car published at
   * OMR 2,000 could have its price rewritten the moment it went up. That guard
   * is right, and it is exactly why "mark sold" could not go through it: the
   * edit would land on the draft while the live page kept telling buyers the
   * car was available.
   *
   * A seller who cannot say "this is sold" is the classifieds failure everyone
   * knows — a board of cars that went weeks ago, and buyers who stop trusting
   * any of it. So these two operations skip review, and only these two. Both
   * only ever REDUCE what a listing claims: sold and reserved withdraw
   * availability, taking it down withdraws the car. Nothing here can make a
   * listing say more than a moderator already approved.
   *
   * Price, description and photos still edit the draft and still go back
   * through review.
   */
  async setStatus(ctx: StatusCtx) {
    const strapi = (global as unknown as { strapi: Core.Strapi }).strapi;
    const userId = ctx.state?.user?.id;
    if (!userId) {
      return ctx.unauthorized('You must be signed in.');
    }

    const documentId = ctx.params?.id;
    if (!documentId) {
      return ctx.badRequest('Which listing?');
    }

    const { listingStatus, takeDown } = ctx.request?.body ?? {};

    if (!takeDown && !SELLER_MAY_SET_STATUS.has(String(listingStatus))) {
      return ctx.badRequest('Not a status you can set.');
    }

    /*
     * Ownership from the stored document, never from the request. `status:
     * 'draft'` because every document has a draft version — a published one has
     * both — so this finds the car whether it is live or still pending.
     */
    const existing = (await strapi.documents('api::listing.listing').findOne({
      documentId,
      populate: { seller: true },
      status: 'draft',
    })) as { seller?: { id?: number } | null } | null;

    const ownerId = existing?.seller?.id;
    if (!existing || !ownerId || ownerId !== userId) {
      // notFound rather than forbidden: a 403 confirms the id exists, which
      // turns document ids into an inventory oracle for anyone with an account.
      return ctx.notFound('Listing not found.');
    }

    if (takeDown) {
      /*
       * Unpublish, not delete. The car leaves the site immediately and the
       * draft survives — so the seller can ask for it back, and so a moderator
       * can still see what was up there. Deleting would also destroy the
       * evidence in a dispute.
       */
      await strapi.documents('api::listing.listing').unpublish({ documentId });
      ctx.body = { data: { documentId, state: 'pending', takenDown: true } };
      return;
    }

    /*
     * Both versions, deliberately. The draft is what the seller edits and a
     * moderator reviews; the published version is what a buyer reads. Writing
     * only the draft is the exact bug this endpoint exists to avoid.
     */
    const data = { listingStatus } as never;
    await strapi.documents('api::listing.listing').update({
      documentId,
      status: 'draft',
      data,
    });
    try {
      await strapi.documents('api::listing.listing').update({
        documentId,
        status: 'published',
        data,
      });
    } catch {
      // Not published yet — nothing live to update, and not an error. A pending
      // car can still be marked sold before anyone has approved it.
    }

    ctx.body = { data: { documentId, listingStatus } };
  },
};
