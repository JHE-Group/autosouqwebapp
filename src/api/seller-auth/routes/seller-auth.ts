/**
 * Seller registration, on our own route rather than the plugin's.
 *
 * ## Why not extend `plugin::users-permissions.auth.register`
 *
 * That was tried first. A `src/extensions/users-permissions/strapi-server.ts`
 * reassigning `plugin.controllers.auth.register` does load and run — verified
 * with a probe, the extension body executes once at boot — but the plugin's own
 * controller still answers the request. So the override is silently inert,
 * which is worse than not working: it looks correct in the tree and does
 * nothing at runtime.
 *
 * The stock endpoint cannot serve this product regardless. It accepts exactly
 * `username`, `email` and `password` and answers `400 Invalid parameters` to
 * anything else, while the User content type makes `fullName` required — so it
 * fails whether the field is sent or omitted. There is no configuration that
 * reconciles those two.
 *
 * Owning the route removes the argument. `POST /api/seller/register` is ours,
 * its contract is ours, and when phone OTP replaces email and password only
 * this controller changes. The browser never sees the difference either way:
 * apps/web talks to its own Next route handlers, never to Strapi directly —
 * the CSP has `connect-src 'self'` precisely so it cannot.
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/seller/register',
      handler: 'seller-auth.register',
      config: {
        // Public by design — this is the endpoint that creates an account, so
        // requiring one would be circular. `auth: false` rather than a Public
        // role grant keeps it out of the permissions table, where it would look
        // like an ordinary content permission somebody could toggle off.
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/seller/listings',
      handler: 'seller-auth.listings',
      config: {
        /**
         * Authenticated, and scoped to the caller by the controller.
         *
         * A seller has to be able to see their own drafts, and the ordinary
         * content API cannot serve that: `find` returns published documents
         * only, and `seller` is `private`, so it cannot even be filtered on.
         * Adding a filter would be the wrong fix anyway — a client-supplied
         * `filters[seller]` is a request to be lied to. The owner comes from
         * the token here and from nowhere else.
         */
        policies: [],
        middlewares: [],
      },
    },
  ],
};
