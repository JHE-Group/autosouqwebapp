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

/**
 * Arabic-Indic and Persian digits folded to ASCII.
 *
 * JavaScript's `\d` is `[0-9]`, so `/\D/` treats ٠-٩ as punctuation and
 * deletes an Arabic seller's number entirely rather than cleaning it. The web
 * app folds in three places for exactly this reason; this copy was missed
 * because registration used to be reached through its own form, where the
 * number was typed into a Latin-defaulted field.
 *
 * It stopped being theoretical when the account moved to the END of the listing
 * form: the WhatsApp number now comes from a field that explicitly accepts
 * ٩١٢٣٤٥٦٧, so an Arabic seller filled in six sections and was refused with
 * "enter a valid Omani mobile number" for the number they had just entered.
 */
function foldDigits(value: string): string {
  return value
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06f0-\u06f9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

function normalizeMsisdn(raw: unknown): string | undefined {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  const digits = foldDigits(raw).replace(/\D/g, '');
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

/**
 * Patch ONE column on the published row, touching nothing else.
 *
 * `documents().update({ status: 'published' })` cannot be used for this, and
 * the reason is the whole point of this helper. In Strapi 5 that call does not
 * patch the published version — it takes the DRAFT's current content, applies
 * the data, and writes the result as the published version. So a seller who had
 * repriced their draft from OMR 2,000 to 5,555 and then pressed "mark sold"
 * pushed the unreviewed 5,555 live along with it. Reproduced exactly:
 * draft=5555 published=2000 before, draft=5555 published=5555 after.
 *
 * That defeats the entire review model. Editing goes to the draft precisely so
 * a moderator sees a change before a buyer does, and any status call was
 * silently promoting every pending edit.
 *
 * The query engine writes columns, not documents, so it changes the one field
 * asked for and leaves the rest of the published row alone.
 */
async function patchPublished(
  strapi: Core.Strapi,
  documentId: string,
  data: Record<string, unknown>,
) {
  await strapi.db.query('api::listing.listing').updateMany({
    where: { documentId, publishedAt: { $notNull: true } },
    data,
  });
}

/**
 * A slug base for a showroom name, in the shape the front end can route on.
 *
 * Latin-only for the same reason listing slugs are: an Arabic business name
 * reduces to nothing under [a-z0-9], and a slug that collapses is a page that
 * cannot be reached. The user id is appended by the caller, which also makes
 * two showrooms of the same name distinct without a collision check.
 */
function slugifyName(name: string): string {
  const base = String(name)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return base || 'showroom';
}

type ShowroomCtx = ListingsCtx & {
  request?: { method?: string; body?: { businessName?: string; crNumber?: string } };
  badRequest: (message: string) => unknown;
};

type ProfileCtx = ListingsCtx & {
  request?: { body?: { fullName?: string; whatsapp?: string } };
  badRequest: (message: string) => unknown;
};

type StatusCtx = ListingsCtx & {
  params?: { id?: string };
  request?: {
    body?: { listingStatus?: string; takeDown?: boolean; confirmAvailable?: boolean };
  };
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
  // Drives the "is this still for sale?" prompt on the seller's dashboard.
  'availabilityConfirmedAt',
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

      /*
       * A showroom application, if they made one.
       *
       * Validated here so a malformed one refuses the whole registration rather
       * than creating an account with a silently dropped application — a seller
       * who typed their business details and then found no trace of them would
       * reasonably conclude the site had lost them.
       *
       * `crNumber` is the commercial registration (السجل التجاري). The DOCUMENT
       * is deliberately not collected: Strapi serves uploaded media from public
       * URLs — verified, a direct request returns 200 — so storing a business
       * licence here would publish it. The number is enough to check against
       * Oman's public registry, and it is a `private` field that never leaves
       * the CMS. Anything further is asked for over WhatsApp during approval.
       */
      const wantsShowroom = body.accountType === 'showroom';
      const businessName = wantsShowroom
        ? requireString(body.businessName, 'Showroom name', 2, 80)
        : null;
      const crNumber = wantsShowroom
        ? requireString(body.crNumber, 'Commercial registration number', 4, 20)
        : null;

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

      /*
       * The application, as `pending` and nothing else.
       *
       * No badge, no public record, no slug anyone can reach — the controller
       * clamps public reads to `approved`, so this is invisible until a human
       * moves it. It is also not fatal: an account that exists without its
       * application is recoverable by a moderator, whereas an application
       * without an account is orphaned. So the user is created first and a
       * failure here is logged rather than thrown.
       */
      if (wantsShowroom && businessName && crNumber) {
        try {
          await strapi.documents('api::showroom.showroom').create({
            data: {
              name: businessName,
              slug: `${slugifyName(businessName)}-${user.id}`,
              crNumber,
              whatsapp: whatsapp ?? null,
              state: 'pending',
              owner: user.id,
            } as never,
          });
        } catch (err) {
          strapi.log.error(
            `Autosouq: showroom application for user ${user.id} failed — ${err}`,
          );
        }
      }

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
      /*
       * publishedAt too, not just the id.
       *
       * The rows above are DRAFT versions and their own publishedAt is null by
       * construction — the note above says so — so the draft cannot report when
       * the car went live. The dashboard needs that date to know how long a
       * listing has sat unconfirmed. See apps/web/lib/listingFreshness.js.
       */
      fields: ['id', 'publishedAt'] as never,
      status: 'published',
      limit: 100,
    });

    const livePublishedAt = new Map(
      (live ?? []).map((row: Record<string, unknown>) => [
        row.documentId,
        row.publishedAt,
      ]),
    );
    const liveIds = new Set(livePublishedAt.keys());

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
        // The published version's date, not the draft's null.
        publishedAt: livePublishedAt.get(row.documentId) ?? null,
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

    const { listingStatus, takeDown, confirmAvailable } = ctx.request?.body ?? {};

    if (!takeDown && !confirmAvailable && !SELLER_MAY_SET_STATUS.has(String(listingStatus))) {
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

    /*
     * Does a published version exist? Ask — do not infer from a thrown error.
     *
     * This code used to wrap the published write in try/catch on the assumption
     * that updating a version which does not exist throws. Strapi 5 CREATES it
     * instead, so the catch never ran and the write published the document.
     *
     * That turned "mark sold", "still available" and every other status call
     * into a self-publish button: a seller filed a draft, pressed one control,
     * and their car went live without a moderator ever seeing it — defeating
     * the forceVersion(ctx, 'draft') clamp that the rest of this API is built
     * around. Verified by calling the endpoint with a real seller token: one
     * row and published=0 before, two rows and published=1 after.
     */
    const liveVersion = await strapi.documents('api::listing.listing').findOne({
      documentId,
      status: 'published',
    });

    if (confirmAvailable) {
      /*
       * "Yes, it is still for sale."
       *
       * Stamped server-side from the clock, never from the request — a seller
       * who could send their own timestamp could keep a car that sold months
       * ago looking freshly confirmed, which is the exact decay this prompt
       * exists to stop.
       *
       * Written to both versions so the moderator's view and the buyer's agree
       * about when the seller last vouched for the car. It changes nothing a
       * buyer reads, so it needs no review.
       */
      const now = new Date().toISOString();
      const stamp = { availabilityConfirmedAt: now } as never;
      await strapi.documents('api::listing.listing').update({
        documentId,
        status: 'draft',
        data: stamp,
      });
      if (liveVersion) {
        await patchPublished(strapi, documentId, {
          availabilityConfirmedAt: now,
        });
      }
      ctx.body = { data: { documentId, availabilityConfirmedAt: now } };
      return;
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
    if (liveVersion) {
      // Only when one already exists, and only this column. A pending car can
      // still be marked sold — the draft carries it — but saying so must
      // neither publish the listing nor promote an unreviewed edit with it.
      await patchPublished(strapi, documentId, { listingStatus });
    }

    ctx.body = { data: { documentId, listingStatus } };
  },

  /**
   * Update the signed-in seller's own name and WhatsApp number.
   *
   * /my-profile rendered a seven-field form that posted nowhere, under a notice
   * saying "Accounts are not switched on yet, so nothing on this page is
   * saved". Accounts had been switched on for weeks.
   *
   * Two fields, because two is what the user model holds. The form also asked
   * for a phone, a city, an area and an "about" paragraph; none of them exist
   * on the content type and nothing renders a seller profile to buyers, so
   * they are gone from the form rather than given columns nobody reads.
   *
   * Deliberately NOT the users-permissions update route. That takes the whole
   * user object, so exposing it would let a seller write `role`, `confirmed`
   * or `blocked` on themselves. This writes exactly two fields and reads the
   * id from the token, never from the request.
   */
  async updateProfile(ctx: ProfileCtx) {
    const strapi = (global as unknown as { strapi: Core.Strapi }).strapi;
    const userId = ctx.state?.user?.id;
    if (!userId) {
      return ctx.unauthorized('You must be signed in.');
    }

    const { fullName, whatsapp } = ctx.request?.body ?? {};

    const name = typeof fullName === 'string' ? fullName.trim() : '';
    if (!name) {
      // `required: true` on the content type, and the seller's name is what a
      // buyer is told they are dealing with.
      return ctx.badRequest('Your name cannot be empty.');
    }
    if (name.length > 80) {
      return ctx.badRequest('That name is too long.');
    }

    const number = typeof whatsapp === 'string' ? whatsapp.trim() : '';
    if (number && !/^(?:\+?968)?[79]\d{7}$/.test(number.replace(/[\s-]/g, ''))) {
      // Same rule the listing form applies: Omani mobiles are eight digits
      // starting 7 or 9, and a landline cannot receive WhatsApp.
      return ctx.badRequest('That is not an Omani mobile number.');
    }

    await strapi.query('plugin::users-permissions.user').update({
      where: { id: userId },
      data: { fullName: name, whatsapp: number || null },
    });

    ctx.body = { data: { fullName: name, whatsapp: number || null } };
  },

  /**
   * The seller's own showroom application: read it, or make one.
   *
   * The upgrade path, and it is needed whether or not packages ever ship. A
   * private account could not become a showroom at all — the only way to apply
   * was to tick the box at signup — so the first dealers, who will almost
   * certainly arrive as private sellers and list one car to try the site, would
   * have had to make a second account and orphan the first one's listings.
   *
   * One application per seller, and an approved one is not re-openable from
   * here: a seller who could re-apply could reset a declined decision by
   * repeating it, and a moderator would have no record they had been turned
   * down. Changing an approved showroom's details is an admin job for the same
   * reason the badge is — it is a claim about a business, and the whole worth
   * of it is that the business did not write it.
   */
  async showroom(ctx: ShowroomCtx) {
    const strapi = (global as unknown as { strapi: Core.Strapi }).strapi;
    const userId = ctx.state?.user?.id;
    if (!userId) {
      return ctx.unauthorized('You must be signed in.');
    }

    const existing = (
      await strapi.documents('api::showroom.showroom').findMany({
        filters: { owner: { id: userId } } as never,
        limit: 1,
      })
    )?.[0] as Record<string, unknown> | undefined;

    if (ctx.request?.method === 'GET') {
      /*
       * Their own record, so the state and the moderator's note travel — those
       * are `private` to the PUBLIC api, not to the person they are about. A
       * decision with no reason attached is the dead end this whole flow exists
       * to avoid.
       */
      ctx.body = {
        data: existing
          ? {
              name: existing.name,
              state: existing.state,
              reviewNote: existing.reviewNote ?? null,
              slug: existing.slug,
            }
          : null,
      };
      return;
    }

    if (existing) {
      return ctx.badRequest(
        existing.state === 'declined'
          ? 'This account has already applied and was not approved. Contact us.'
          : 'This account has already applied.',
      );
    }

    const body = ctx.request?.body ?? {};
    const name = typeof body.businessName === 'string' ? body.businessName.trim() : '';
    const cr = typeof body.crNumber === 'string' ? body.crNumber.trim() : '';

    if (name.length < 2 || name.length > 80) {
      return ctx.badRequest('Enter the showroom name.');
    }
    if (cr.length < 4 || cr.length > 20) {
      return ctx.badRequest('Enter your commercial registration number.');
    }

    const user = (await strapi
      .plugin('users-permissions')
      .service('user')
      .fetch(userId)) as { whatsapp?: string } | null;

    await strapi.documents('api::showroom.showroom').create({
      data: {
        name,
        slug: `${slugifyName(name)}-${userId}`,
        crNumber: cr,
        whatsapp: user?.whatsapp ?? null,
        state: 'pending',
        owner: userId,
      } as never,
    });

    ctx.body = { data: { name, state: 'pending' } };
  },
};
