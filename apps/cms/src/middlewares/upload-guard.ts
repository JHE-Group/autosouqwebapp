import type { Core } from '@strapi/strapi';

/**
 * Refuse `?id=` on the content-API upload route.
 *
 * ## The hole this closes
 *
 * `plugin::upload.content-api.upload` was granted to the Authenticated role on
 * the reasoning that it is append-only, and that withholding `destroy` was
 * therefore enough. It is not. The upload plugin exposes a single `POST /`
 * route, and its handler multiplexes on the `id` query parameter:
 *
 *   - with `id` and a file      -> `replaceFile`
 *   - with `id` and no file     -> `updateFileInfo`
 *   - without `id`              -> `uploadFiles`
 *
 * Neither `replaceFile` nor `updateFileInfo` checks ownership — the per-file
 * permission helper is wired only to the admin routes — and `replace`
 * deliberately reuses the original record's hash and extension so the public URL
 * does not change. File ids are integers and the public listings endpoint hands
 * them out under `?populate=*`.
 *
 * So any account could overwrite any file. Reproduced before writing this:
 * account B posted to `/api/upload?id=1` and replaced account A's photo,
 * 200 OK, original deleted from disk, same URL now serving B's content. Looping
 * the ids would take out the brand assets too, irrecoverably.
 *
 * ## Why a middleware and not a plugin extension
 *
 * A `strapi-server` extension of users-permissions was tried earlier in this
 * codebase for the register controller: it loads, it runs, and the plugin's own
 * controller still answers the request. Silently inert code is worse than none,
 * so this sits in the global chain where its effect is observable.
 *
 * ## What this does not fix
 *
 * Any account can still upload *new* files, so the volume exposure documented
 * beside the grant in src/index.ts is unchanged. The stronger fix is to revoke
 * the grant entirely and have apps/web upload with a dedicated Strapi API token,
 * since the web route handler is the only uploader the product has. That needs a
 * token provisioned in the admin and an env var on OVH, so it is a deployment
 * change rather than a code one — worth doing, and tracked separately. This
 * closes the part that lets one account destroy another's data.
 */
export default (_config: unknown, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: any, next: () => Promise<void>) => {
    const isContentApiUpload =
      ctx.method === 'POST' && (ctx.path === '/api/upload' || ctx.path === '/api/upload/');

    // `id` is the only thing that turns an upload into a write over someone
    // else's row. Anything without it is an ordinary create and is left alone.
    if (isContentApiUpload && ctx.query?.id !== undefined) {
      strapi.log.warn(
        `Autosouq: refused content-API upload replace for file id ${ctx.query.id} ` +
          `from user ${ctx.state?.user?.id ?? 'anonymous'}.`,
      );
      ctx.status = 403;
      ctx.body = {
        error: {
          status: 403,
          name: 'ForbiddenError',
          message: 'Replacing an existing file is not permitted here.',
        },
      };
      return;
    }

    return next();
  };
};
