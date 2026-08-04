import { factories } from '@strapi/strapi';

/**
 * Public reads only, and only of approved showrooms.
 *
 * A showroom record is deliberately a separate content type from the user who
 * owns it. The users-permissions user carries an email, a password hash and a
 * WhatsApp number, and none of that can be exposed to satisfy a public
 * /showrooms/{slug} page. So the business lives here and the account stays
 * private — `owner`, `crNumber` and `reviewNote` are all `private` in the
 * schema and never leave the CMS.
 *
 * Creating and approving happen elsewhere: a seller applies through
 * /seller/register (which writes a `pending` record and nothing more), and a
 * human moves it to `approved` in the admin. There is no seller-facing write
 * path to this collection at all, which is why `create`, `update` and `delete`
 * are not granted to the authenticated role.
 */
export default factories.createCoreController('api::showroom.showroom', () => ({
  /**
   * Only approved showrooms, whatever the caller asks for.
   *
   * Clamped rather than filtered-by-default: a caller supplying their own
   * `filters[state]` would otherwise be able to enumerate pending and declined
   * applications, which are a record of who applied and was turned down.
   */
  async find(ctx) {
    ctx.query = {
      ...(ctx.query ?? {}),
      filters: { ...((ctx.query as any)?.filters ?? {}), state: 'approved' },
    } as never;
    return await super.find(ctx);
  },

  async findOne(ctx) {
    const response = await super.findOne(ctx);
    const state = (response as { data?: { state?: string } })?.data?.state;
    if (state !== 'approved') {
      // notFound, not forbidden: a 403 would confirm that a slug belongs to a
      // real application, which is the thing being kept private.
      return ctx.notFound('Showroom not found.');
    }
    return response;
  },
}));
