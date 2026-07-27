import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),

  /**
   * The PUBLIC origin this Strapi is reached on — e.g. https://cms.autosouq.om.
   *
   * Required on OVH, where Strapi runs behind a reverse proxy that terminates
   * TLS. Without it Strapi derives absolute URLs from `host` and `port`
   * (@strapi/core configuration/urls.js): outside development it does not
   * special-case bind addresses, so with `HOST=0.0.0.0` it emits
   * **`http://0.0.0.0:1337`** as the base for admin links, password-reset and
   * email-confirmation URLs, and for the absolute media URLs the upload plugin
   * hands out. Every one of those is unreachable from a browser.
   *
   * Left empty in development so the localhost defaults keep working.
   */
  url: env('PUBLIC_URL', ''),

  proxy: {
    /**
     * Trust `X-Forwarded-*` from the reverse proxy in front of us.
     *
     * Strapi's default is `proxy: false`, which leaves Koa's `app.proxy` off —
     * so behind nginx/HAProxy on OVH, Strapi believes every request arrived
     * over plain http from the proxy's own IP. That breaks protocol detection
     * in generated URLs, puts the proxy's address in every log line and in
     * anything that rate-limits by IP, and can stop `secure` session cookies
     * being set on an https site.
     *
     * Behind an env switch rather than hardcoded `true`, because trusting
     * `X-Forwarded-For` on a server that is directly internet-facing lets a
     * client spoof its own address.
     */
    koa: env.bool('TRUST_PROXY', false),
  },

  app: {
    keys: env.array('APP_KEYS')!,
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});

export default config;
