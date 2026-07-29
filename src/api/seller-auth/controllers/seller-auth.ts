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
class RegisterError extends Error {}

/** Omani mobile numbers, with or without the 968 country code. */
const OMANI_MSISDN = /^(?:968)?[79]\d{7}$/;

function normalizeMsisdn(raw: unknown): string | undefined {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  const digits = raw.replace(/\D/g, '');
  if (!OMANI_MSISDN.test(digits)) {
    throw new RegisterError('Enter a valid Omani mobile number, e.g. 9123 4567.');
  }
  return digits.startsWith('968') ? digits : `968${digits}`;
}

function requireString(value: unknown, field: string, min: number, max: number) {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (trimmed.length < min || trimmed.length > max) {
    throw new RegisterError(`${field} must be between ${min} and ${max} characters.`);
  }
  return trimmed;
}

type RegisterCtx = {
  request: { body?: Record<string, unknown> };
  body?: unknown;
  badRequest: (message: string) => unknown;
};

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
        throw new RegisterError('That email cannot be used.');
      }

      const settings = (await strapi
        .store({ type: 'plugin', name: 'users-permissions', key: 'advanced' })
        .get()) as { default_role?: string } | null;

      const role = await strapi.db
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: settings?.default_role ?? 'authenticated' } });

      if (!role) {
        strapi.log.error('Autosouq: no default role — cannot register sellers.');
        throw new RegisterError('Registration is unavailable.');
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
      if (err instanceof RegisterError) return ctx.badRequest(err.message);
      // Anything else is ours, not the caller's: log it in full and say
      // nothing useful to a stranger probing the endpoint.
      strapi.log.error(`Autosouq: seller registration failed — ${err}`);
      return ctx.badRequest('Could not create your account. Please try again.');
    }
  },
};
