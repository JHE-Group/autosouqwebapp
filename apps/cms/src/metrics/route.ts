import type { Core } from "@strapi/strapi";
import { createMetricsController } from "./controller";

/**
 * `GET /autosouq/metrics` — aggregates for the admin homepage widgets.
 *
 * ## Why this is not under src/api/
 *
 * It cannot be. `registerAPIRoutes` in @strapi/core does
 * `router.type = 'content-api'` — a plain assignment, not a default, unlike the
 * admin and plugin loaders which do `router.type = router.type || 'admin'`. So
 * ANY route file under src/api/ is content-api no matter what it declares, and
 * a content-api route is reachable with a seller's users-permissions token.
 *
 * `src/metrics/` is inert to Strapi's loader — it walks only src/index.ts,
 * src/api, src/components, src/middlewares, src/policies, src/extensions and
 * src/admin — while still being compiled by the root tsconfig. So the route is
 * mounted deliberately, from bootstrap, and nowhere else.
 *
 * ## READ THIS BEFORE CHANGING THE POLICIES
 *
 * `admin::isAuthenticatedAdmin` is **not an admin check**. The whole policy is:
 *
 *     (policyCtx) => Boolean(policyCtx.state.isAuthenticated)
 *
 * and @strapi/core sets `ctx.state.isAuthenticated = true` for ANY strategy
 * that authenticates — including users-permissions authenticating an ordinary
 * seller. Its name is a lie about its scope; it means "some strategy accepted
 * this request".
 *
 * The thing that actually keeps sellers out is `type: 'admin'` on this router,
 * which selects the admin auth strategy. That was proven rather than assumed:
 * registering this exact route group through a content-api router and hitting
 * it with a real seller's JWT returns 200 and the whole dashboard.
 *
 * Which is why `admin::hasPermissions` stays. It gates less than it appears to
 * — every stock role including Author holds
 * `plugin::content-manager.explorer.read` on listings, and CASL's `can()`
 * ignores the row conditions that normally limit an Author — but it is the
 * guard that FAILS CLOSED if this route is ever moved: on a content-api router
 * it dereferences an undefined `ctx.state.userAbility` and 500s, where the
 * single-policy variant quietly returns 200 to every account holder. Do not
 * "simplify" this to one policy.
 *
 * A missing `type` is also safe: `strapi.server.routes()` falls through to the
 * default router, no strategy matches, and everyone including the owner gets a
 * 401. It fails closed and loudly.
 *
 * ## And it needs no permission row
 *
 * PUBLIC_ACTIONS / AUTHENTICATED_ACTIONS in src/index.ts write rows into
 * `plugin::users-permissions.permission`, which only the content-api strategy
 * reads. An admin route never consults them. Adding one here would not "enable"
 * this endpoint — it would create a users-permissions action of the same name
 * that grants nothing here, while being one file-move away from granting
 * everything. The absence is deliberate.
 */
export function mountMetricsRoute(strapi: Core.Strapi) {
  const controller = createMetricsController(strapi);

  strapi.server.routes({
    type: "admin",
    routes: [
      {
        method: "GET",
        path: "/autosouq/metrics",
        handler: controller.metrics,
        config: {
          policies: [
            "admin::isAuthenticatedAdmin",
            {
              name: "admin::hasPermissions",
              config: {
                /*
                 * The tuple form, not a bare string, and that distinction is
                 * load-bearing.
                 *
                 * `hasPermissions` ends in `ability.can(action, subject)`, and a
                 * bare string passes `subject: undefined`. Every permission row
                 * this role holds carries a subject — the super-admin's 136 rows
                 * include `explorer.read` against `api::listing.listing`,
                 * `plugin::upload.file` and so on, but none with a null subject
                 * — so CASL finds no matching rule and the OWNER gets a 403 on
                 * their own dashboard. That is exactly what happened on the
                 * first run of this widget.
                 */
                actions: [
                  [
                    "plugin::content-manager.explorer.read",
                    "api::listing.listing",
                  ],
                ],
              },
            },
          ],
        },
      },
    ],
  } as never);
}
