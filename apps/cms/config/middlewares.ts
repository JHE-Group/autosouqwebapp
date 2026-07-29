import type { Core } from '@strapi/strapi';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Origins allowed to call this API from a browser.
 *
 * `FRONTEND_URL` is the deployed web app (e.g. https://autosouq.om). The
 * localhost pair is development-only and deliberately absent in production: a
 * developer's browser talking to the *production* CMS from localhost is a real,
 * if narrow, exposure if that laptop visits a hostile page.
 *
 * The list used to be `[...localhost, FRONTEND_URL].filter(Boolean)`, which
 * fails safe but silently: a deploy that forgot FRONTEND_URL produced a
 * production CMS whose only permitted origins were two localhost URLs, and
 * nobody would find out until something browser-side broke. Fail the boot
 * instead — a CMS that refuses to start is a five-minute fix; one that starts
 * wrong is a bug hunt.
 */
const frontendOrigins = [process.env.FRONTEND_URL].filter(Boolean) as string[];

if (isProduction && frontendOrigins.length === 0) {
  throw new Error(
    'Refusing to start: FRONTEND_URL must be set in production so CORS permits ' +
      'the deployed web app (e.g. FRONTEND_URL=https://autosouq.om).'
  );
}

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: isProduction
        ? frontendOrigins
        : ['http://localhost:3001', 'http://127.0.0.1:3001', ...frontendOrigins],
      // Enumerated rather than `*`, which reflected back whatever a caller
      // asked for. The public API is read-only and unauthenticated, so a
      // browser never needs to send anything beyond these.
      headers: ['Content-Type', 'Origin', 'Accept'],
      // The public API uses no cookies, and the admin panel is same-origin.
      credentials: false,
    },
  },
  // 'strapi::poweredBy' removed: it sent `X-Powered-By: Strapi <strapi.io>` on
  // every response — a free version fingerprint for anyone scanning for known
  // Strapi advisories. It buys nothing operationally.
  'strapi::query',
  /**
   * After `strapi::query` so `ctx.query` is parsed, and before `strapi::body`
   * so a refused replace is rejected without its multipart payload being read
   * off the wire first. See src/middlewares/upload-guard.ts for what it stops.
   */
  'global::upload-guard',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
