import { Car } from "@strapi/icons";
import type { StrapiApp } from "@strapi/strapi/admin";

/**
 * Admin panel customisation.
 *
 * ## Three traps, all of which typecheck cleanly before failing at runtime
 *
 * **1. It must be `register`, not `bootstrap`.** Both hooks are typed
 * `(app: StrapiApp) => void`, so writing this in `bootstrap` compiles without
 * a murmur — and then throws `Cannot read properties of undefined (reading
 * 'register')` at boot and blanks the whole admin panel. The reason is that
 * `StrapiApp.register` calls `customRegister(this)` — the real instance, which
 * owns `this.widgets` — whereas `StrapiApp.bootstrap` calls its callback with a
 * plain eight-key object (`addComponents`, `addFields`, `addMenuLink`,
 * `addReducers`, `addSettingsLink(s)`, `getPlugin`, `registerHook`) that has no
 * `widgets` on it at all.
 *
 * **2. `icon` is required at runtime even though the type marks it optional.**
 * `Widgets.checkWidgets` runs an `invariant()` on id, component, title AND
 * icon. Omitting it compiles and then throws `An icon must be provided`. It
 * wants the component reference — `Car`, not `<Car />`.
 *
 * **3. `roles: ['strapi-super-admin']` is dead config.** It appears in the type
 * and in Strapi's own built-in widget, and nothing in the shipped admin bundle
 * ever reads it. Access is filtered on `permissions` only. Copying `roles` from
 * the built-ins buys exactly no access control.
 *
 * ## The id is permanent
 *
 * Widget uids are `global::<id>` for app-level widgets, and that uid is written
 * into each admin user's saved homepage layout. Renaming `marketplace` later
 * orphans the saved entry and the widget silently disappears for anyone who has
 * ever rearranged their homepage.
 *
 * ## If it does not show up after deploying
 *
 * That is the expected first outcome, not a bug. Strapi saves a per-user
 * homepage layout the moment anyone drags, resizes or removes a widget, and on
 * load it keeps only widgets already named in that saved layout. A widget
 * registered today is invisible to a user who has customised their homepage
 * until they add it from the "+ Add Widget" panel.
 */
export default {
  register(app: StrapiApp) {
    /*
     * A reducer, not an array — because this also REMOVES a widget.
     *
     * Strapi's own "Key statistics" tile calls
     * /content-manager/homepage/count-documents, which sums every content type
     * the admin can read. On this project that is ~159 "published" documents,
     * of which 145 are reference taxonomy — 69 car models, 24 cities, 23 makes,
     * 12 features — and 14 are actual cars. On production, where inventory is
     * genuinely zero, it would still report over a hundred.
     *
     * A number that says "159 published" to someone with no cars for sale is
     * not merely unhelpful, it is the opposite of the truth, on the one screen
     * that is supposed to tell them how the business is doing. Leaving it
     * beside an honest tile would just make the honest one look wrong.
     *
     * The same objection applies to the content-manager plugin's `chart-entries`
     * donut, which renders "190 entries" here for the same reason — it counts
     * every content type, so a marketplace with 13 live cars gets a big green
     * ring reading 190. Both go.
     *
     * `last-edited-entries` and `last-published-entries` stay: they list actual
     * rows with their real status, so they are useful rather than misleading.
     *
     * Ordering makes this possible. StrapiApp.register does the built-ins
     * first, then every plugin's own register, and only then this callback — so
     * both are present to filter by the time we run. Matched on id AND pluginId
     * because ids are only unique within a plugin.
     */
    /*
     * `pluginId` matters and is easy to get wrong: the built-in statistics
     * widget declares `pluginId: 'admin'` even though it ships with the core
     * admin, so matching it against `undefined` silently keeps it. That is what
     * happened on the first attempt — the donut disappeared, the grid stayed,
     * and a boolean check that searched for the wrong display string ("Key
     * statistics"; it renders as "Project statistics") reported success.
     */
    const REMOVE = [
      { id: "key-statistics", pluginId: "admin" },
      { id: "chart-entries", pluginId: "content-manager" },
    ];

    app.widgets.register((existing) => [
      ...existing.filter(
        (w) =>
          !REMOVE.some((r) => r.id === w.id && r.pluginId === w.pluginId),
      ),
      {
        id: "marketplace",
        icon: Car,
        title: {
          id: "autosouq.widget.marketplace.title",
          defaultMessage: "Marketplace",
        },
        component: async () =>
          (await import("./widgets/MarketplaceWidget")).MarketplaceWidget,
        /*
         * Gates on the same action the built-in content-manager widgets use.
         * It admits every stock role — including Author, because CASL's `can()`
         * ignores the row conditions that normally limit an Author to their own
         * entries — so it is a coarse gate, not a fine one. That is acceptable
         * only because this widget returns aggregates and never rows; see the
         * docblock in src/metrics/controller.ts for why that distinction is
         * doing the real work.
         */
        permissions: [{ action: "plugin::content-manager.explorer.read" }],
      },
    ]);
  },
};
