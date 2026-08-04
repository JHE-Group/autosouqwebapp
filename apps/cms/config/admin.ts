import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET')!,
  },
  apiToken: {
    salt: env('API_TOKEN_SALT')!,
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT')!,
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY')!,
  },
  /*
   * Do not fling a browser tab at whoever runs `strapi develop`.
   *
   * On a database with no admin user, Strapi opens
   * /admin/auth/register-admin automatically on every boot. That is helpful
   * exactly once and hostile every time after — and a local CMS gets restarted
   * a dozen times in an afternoon of debugging, each restart stealing focus and
   * opening another tab. BROWSER=none does not stop it; this does.
   *
   * The panel is still at http://localhost:1337/admin whenever it is wanted.
   */
  autoOpen: false,
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    docLinks: env.bool('FLAG_DOC_LINKS', true),
  },
});

export default config;
