import type { Core } from '@strapi/strapi';

/**
 * What an editor may upload.
 *
 * Enumerated, not `image/*`. That wildcard admits `image/svg+xml`, and an SVG
 * is a script container: gallery images are rendered as navigable links
 * (`target="_blank"` in components/carDetails/sliders/Slider1.jsx), so opening
 * one as a top-level document executes whatever is inside it, on this origin.
 * Strapi's security middleware happens to block inline script via CSP today,
 * but that is a framework default a future middlewares.ts edit could weaken
 * without anyone connecting the two.
 *
 * These are the formats a phone camera and a scanner actually produce.
 */
const allowedMediaTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/heic',
  'image/heif',
  'application/pdf',
];

const deniedExecutableTypes = [
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      jwtManagement: 'refresh',
      sessions: {
        httpOnly: true,
      },
    },
  },
  upload: {
    config: {
      /**
       * 12 MB per file, down from Strapi's default of **1 GB**.
       *
       * On OVH the uploads directory is a real disk on a real instance, and
       * the default lets one authenticated editor — or one mistake — write a
       * gigabyte per file until the volume fills and the CMS stops accepting
       * anything. A modern phone photo is 3–8 MB, so 12 MB leaves headroom for
       * a high-resolution shot without leaving the door open.
       *
       * Raise `UPLOAD_SIZE_LIMIT_MB` if a genuine need appears. Note the
       * reverse proxy has its own body limit (nginx `client_max_body_size`
       * defaults to 1 MB) and the smaller of the two wins — see DEPLOYMENT.md.
       */
      sizeLimit: env.int('UPLOAD_SIZE_LIMIT_MB', 12) * 1024 * 1024,
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes: deniedExecutableTypes,
      },
    },
  },
});

export default config;
