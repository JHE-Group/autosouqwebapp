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
        /**
         * Ten attempts per address per fifteen minutes.
         *
         * The obvious sizing — five per hour — was tried and is wrong twice
         * over. The limiter counts *attempts*, not accounts, so a seller who
         * fumbles the form five times (mistyped email, password too short,
         * malformed number) is locked out for an hour having created nothing.
         * And an hour's lockout paired with a message saying "a few minutes"
         * is a support call.
         *
         * Ten in fifteen minutes leaves room to get the form wrong repeatedly
         * while still capping a loop at forty accounts an hour from one
         * address, down from unbounded. Sized for the shared case too: an
         * office or a café behind a single NAT is one address here.
         */
        middlewares: [
          { name: 'global::rate-limit', config: { max: 10, windowMs: 15 * 60 * 1000 } },
        ],
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
      {
        method: 'PUT',
        path: '/seller/listings/:id/status',
        handler: 'seller-auth.setStatus',
        config: {
          /**
           * Authenticated, and scoped to the caller by the controller — the
           * same rule as the GET above, and it matters more here because this
           * writes.
           *
           * `:id` is a document id and is treated as a claim, not a fact: the
           * controller loads the document, reads its seller, and answers
           * notFound when it is not the caller's. A 403 would confirm the id
           * exists, which is an inventory oracle for anyone with an account.
           */
          policies: [],
          middlewares: [],
        },
      },
  ],
};
