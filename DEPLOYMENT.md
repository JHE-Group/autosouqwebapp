# Deploying Autosouq.om

Two deployables, deployed separately:

| | What | Where |
|---|---|---|
| **`apps/cms`** | Strapi 5 — the content API and admin panel | OVH Cloud, behind a reverse proxy |
| **`apps/web`** | Next.js 16 — the public website | Vercel or self-hosted `next start` |

The web app talks to the CMS **server-side only**. Browsers never call the CMS
API directly — but they *do* load CMS **images** directly (the gallery lightbox
links straight at the media URL), which is why the CMS origin must be public and
must be HTTPS.

---

## Host: `www.autosouq.om`, and only that

The site is served from **`https://www.autosouq.om`**. Everything derived from
`NEXT_PUBLIC_SITE_URL` — every canonical, every hreflang annotation, every
sitemap `<loc>`, the `Sitemap:` line in robots.txt, and the Open Graph `url` —
uses that value verbatim. Point it at the apex while serving from `www` and
every page declares a canonical on a host it is not served from, which is the
one thing a canonical must never do.

**Redirect the apex to www with a 301** at the DNS/proxy layer:

```
https://autosouq.om/*  ->  301  ->  https://www.autosouq.om/*
```

Not a 302, and not both hosts answering 200 — two hosts serving identical
content splits every ranking signal between them and doubles the crawl. Verify
after deploying:

```bash
curl -sI https://autosouq.om | head -3        # expect 301 -> https://www.autosouq.om
curl -s https://www.autosouq.om/robots.txt    # Sitemap: must say www
```

The code's fallback is `https://www.autosouq.om` so a forgotten variable fails
toward the right host rather than the wrong one — but set the variable anyway,
because the fallback is a safety net, not configuration.

## The one rule that catches everyone

> **Every `NEXT_PUBLIC_*` variable is baked into the web app at BUILD time.**
> Changing one in a dashboard or a systemd unit and restarting does nothing.
> **You must rebuild and redeploy the web app.**

Next inlines these at compile time. Three of them end up in places that are easy
to miss:

- `images.remotePatterns` — the allowlist for `/_next/image`, compiled from
  `NEXT_PUBLIC_STRAPI_URL` (`apps/web/next.config.mjs`).
- The **Content-Security-Policy** — also compiled from it, and frozen into
  `routes-manifest.json`.
- Every canonical, hreflang, `<loc>` in the sitemap, and the `robots.txt`
  `Sitemap:` line — from `NEXT_PUBLIC_SITE_URL`.

So: **if the Strapi origin ever changes, the web app must be rebuilt**, or every
CMS photo 404s and the CSP still names the old host. Treat it as a deployment
step, not a note.

---

## 1. Strapi on OVH

### 1.1 Prerequisites

- **Node 20–26** (`apps/cms/package.json` `engines`). Node 22 LTS is the safe pick.
- **pnpm 10.12.1** (`packageManager`).
- **PostgreSQL.** Not SQLite — see 1.3.
- A **reverse proxy terminating TLS** (nginx / HAProxy / OVH load balancer) in
  front of Strapi on `app.autosouq.om` or similar.

### 1.2 Install and build

The CMS can be installed standalone (its own `.npmrc` and `pnpm-lock.yaml` exist
for exactly this):

```bash
cd apps/cms
pnpm install --frozen-lockfile --ignore-workspace
pnpm build                 # strapi build — compiles TS and the admin panel
NODE_ENV=production pnpm start
```

> **If you change `apps/cms/package.json`, regenerate the nested lockfile:**
> `pnpm install --lockfile-only --ignore-workspace` (run inside `apps/cms`).
> It is a second lockfile and does not update when the root one does. Skipping
> it means a frozen-lockfile install fails, or a loose one silently installs
> without the new dependency.

`strapi build` does **not** need database credentials. Only `strapi start` does.

### 1.3 Environment

Copy `apps/cms/.env.example` to `.env` and fill it in. **Regenerate every
secret** — the template ships `REPLACE_ME` placeholders, and it tells you the
command to generate each.

The four that are specific to running on OVH:

| Variable | Value | Why |
|---|---|---|
| `PUBLIC_URL` | `https://app.autosouq.om` | Without it Strapi derives absolute URLs from `HOST:PORT` and hands out **`http://0.0.0.0:1337`** as the base for admin links, password-reset emails and every media URL. |
| `TRUST_PROXY` | `true` | Makes Strapi trust `X-Forwarded-*`. Without it, it sees every request as plain http from the proxy's IP: wrong protocol in generated URLs, wrong client IP in logs, `secure` cookies may not set. Leave `false` if nothing proxies it, since a trusted `X-Forwarded-For` is otherwise spoofable. |
| `FRONTEND_URL` | `https://www.autosouq.om` | CORS allowlist. **The CMS refuses to boot in production without it** rather than silently fall back to a localhost-only list. |
| `DATABASE_CLIENT` + `DATABASE_*` | `postgres` + connection details | **The CMS refuses to boot on SQLite in production.** The SQLite default writes to a gitignored `.tmp/data.db` that does not survive a rebuild — a deploy that forgot this variable would accept listings and lose them all at the next restart, silently. |

**OVH Managed PostgreSQL specifics.** TLS is enforced and the certificate is
signed by OVH's own CA, which is not in Node's default trust store — so
`DATABASE_SSL=true` on its own fails with `SELF_SIGNED_CERT_IN_CHAIN`. Download
the CA from the OVH console and pass it as `DATABASE_SSL_CA`. Do not set
`DATABASE_SSL_REJECT_UNAUTHORIZED=false` to silence it: that keeps the
encryption and throws away the authentication. Two other things catch people —
OVH does not use port 5432 by default, and this server's IP must be on the
service's authorised-IP list or connections are refused before TLS starts.

The server logs a warning at startup for `PUBLIC_URL` and `TRUST_PROXY` if they
look wrong. Read the first twenty lines of the log after a deploy.

### 1.4 Reverse proxy

```nginx
server {
  server_name app.autosouq.om;
  # ... TLS config ...

  # Strapi's per-file upload limit is 12 MB (UPLOAD_SIZE_LIMIT_MB).
  # nginx defaults to 1 MB and the SMALLER wins — without this line, uploads
  # over 1 MB fail at the proxy with a 413 and never reach Strapi.
  client_max_body_size 12M;

  location / {
    proxy_pass http://127.0.0.1:1337;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;   # TRUST_PROXY depends on this

    # WebSocket upgrade. `strapi transfer` (the push/pull data migration) opens
    # a WebSocket against /admin, and without these three lines nginx answers
    # the upgrade with an ordinary response. The failure reads
    # `[FATAL] Failed to initialize the connection: Unexpected server response
    # 200` on the client, which does not mention proxies or sockets at all and
    # sends people looking at tokens instead.
    proxy_http_version 1.1;
    proxy_set_header Upgrade    $http_upgrade;
    proxy_set_header Connection "upgrade";

    # A data transfer streams the whole database through this connection; the
    # 60s default will kill a large one mid-flight.
    proxy_read_timeout 600s;
    proxy_send_timeout 600s;
  }
}
```

**Rate-limit `/api/`.** The listings endpoint is public, unauthenticated, and
returns every seller's phone and WhatsApp number. Per-listing that is deliberate
and disclosed to the seller; bulk machine-readable extraction is a different
thing and is what feeds scam-call operations. A `limit_req` zone on `/api/` (or
the equivalent at the OVH load balancer) is the control.

### 1.5 Uploads — decide this before launch

Strapi writes uploads to `apps/cms/public/uploads` on local disk.

- **Instance with a persistent volume** → fine. Make sure the volume is
  **backed up**: it holds every listing photo and nothing else does.
- **Anything rebuilt on deploy (containers, immutable images)** → uploads are
  **lost on every deploy**. You must move to object storage before launch.

For OVH Object Storage (S3-compatible), install
`@strapi/provider-upload-aws-s3`, configure it in `config/plugins.ts` against
the OVH S3 endpoint, and add the bucket host to the web app's
`images.remotePatterns` **and** its CSP `img-src` — both live in
`apps/web/next.config.mjs`, and both need a web rebuild.

### 1.6 Do not seed demo data

`SEED_DEMO_DATA` must stay **unset or `false`** in production. The demo
catalogue is AI-generated stand-ins with fake WhatsApp numbers. The guard
already refuses to seed when `NODE_ENV=production` unless explicitly overridden
— do not override it.

---

## 2. The web app

### 2.1 Build

```bash
pnpm install --frozen-lockfile          # at the REPO ROOT — the workspace hoists
pnpm --filter @autosouq/web build
pnpm --filter @autosouq/web start       # next start --port 3001
```

The web app is **not** independently installable: `pnpm-workspace.yaml` sets
`shamefullyHoist: true`, so its dependencies resolve to the root
`node_modules`. Copying only `apps/web/` will fail.

`output: "standalone"` is not configured, so self-hosting ships the full
monorepo `node_modules` (or runs an install on the box).

### 2.2 Required environment — at BUILD time

| Variable | Exact shape | Notes |
|---|---|---|
| `NEXT_PUBLIC_STRAPI_URL` | `https://app.autosouq.om` | **No trailing slash** — it is concatenated (`${STRAPI_URL}${path}`), so a slash yields `//uploads/…`. Must be the **public** hostname: a `127.0.0.1` or private address makes server fetches work while every image 400s, because Next refuses to optimise upstreams that resolve to a private IP. Must be **https** — see 2.3. |
| `NEXT_PUBLIC_SITE_URL` | `https://www.autosouq.om` | Origin only, no path, no trailing slash. Feeds canonicals, hreflang, sitemap, `robots.txt`, OG images and WhatsApp deep links. |
| `NEXT_PUBLIC_AUTOSOUQ_WHATSAPP` | `968XXXXXXXX` | **Digits only**, no `+`, no spaces. Omani mobile (7 or 9 after the country code). **Currently unset — see the launch checklist.** |
| `NEXT_PUBLIC_EMAILJS_*` | all three or none |
| `NEXT_PUBLIC_ALLOW_DEMO_LISTINGS` | `true` only while the CMS is empty | Any missing and the contact form is replaced by a notice. |

`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is **not needed**: the only map component is
reachable solely from routes that are permanently redirected, so no live page
loads the Maps SDK. The CSP no longer allows Google hosts.

### 2.3 HTTPS is not optional

The web app sends `upgrade-insecure-requests`. If the CMS is served over plain
http, the browser rewrites the gallery lightbox's image request to `https://`
and it fails — the full-size photo will not load. Server-side data fetching
still works, so the site *looks* fine until someone taps a photo.

Also: the site sends `Strict-Transport-Security: includeSubDomains; preload`.
Once a browser has seen that on `autosouq.om`, it will refuse plain http on
**every** `*.autosouq.om` host — including the Strapi admin panel. Get TLS on
the CMS host before, not after.

### 2.4 Self-hosted specifics

- **`sharp`** is what optimises images. It ships platform-specific binaries, so
  `pnpm install` must run **on the target Linux host** (or in a matching
  container). Copying a macOS `node_modules` gives you the darwin binary and
  image optimisation fails at runtime.
- **The ISR cache is on local disk** and is wiped on every deploy. It is also
  **not shared between workers** — running PM2 in cluster mode without a shared
  cache handler means consecutive requests can show different inventory. Use a
  single worker, or configure a shared cache handler.

On Vercel neither applies.

---

## 3. Pre-launch checklist

Code is ready; these are configuration and content decisions that are **not**
in the repo and cannot be.

- [ ] **`NEXT_PUBLIC_AUTOSOUQ_WHATSAPP` is set.** Until it is: the sell form
      cannot submit, "report this listing" does not render, and — if EmailJS is
      also unset — `/contact` offers **no way to contact anyone**. A buyer who
      spots a fraudulent listing has no channel, on the site whose whole
      proposition is trustworthiness.
- [ ] **Google Maps API key** restricted by HTTP referrer, or removed entirely.
- [ ] **EmailJS** domain allowlist + reCAPTCHA enabled in their dashboard. The
      three IDs are public by design; without those controls the quota is
      free to burn.
- [ ] **Legal pages completed.** `apps/web/app/[locale]/(info)/_content/`
      contains `[COMPANY LEGAL NAME — TO CONFIRM]` and
      `[REGISTERED ADDRESS — TO CONFIRM]` placeholders in Terms and Privacy, in
      both languages.
- [ ] **Listing photos are real.** `apps/web/public/assets/images/listings/`
      are AI-generated stand-ins, served whenever a listing's gallery is empty.
      Their own README says never to let them reach real buyers.
- [ ] **Strapi admin account** created with a strong password, and the
      `REPLACE_ME` secrets regenerated.
- [ ] **Database backups** configured, and the uploads volume backed up.
- [ ] **Rate limiting** on `/api/` at the proxy.

## 4. After deploying

```bash
curl -sI https://www.autosouq.om | grep -i content-security-policy   # names the real CMS host?
curl -s  https://www.autosouq.om/robots.txt | head                    # real domain, not localhost?
curl -s  https://www.autosouq.om/sitemap.xml | grep -c "<url>"        # ~80, real domain?
curl -sI https://app.autosouq.om/api/listings                     # 200, https, CORS as expected?
curl -s  https://app.autosouq.om/robots.txt                       # Disallow: / — CMS is not indexable
```

Then open a listing page and **tap a photo** — that exercises the one path where
the browser talks to the CMS directly, and it is the thing that breaks if the
CMS is http or on a private address.

Run the smoke tests against the deployed site:

```bash
BUY_FLOW_BASE=https://www.autosouq.om  node scripts/test-buy-flow.mjs
CAROUSEL_BASE=https://www.autosouq.om  node scripts/test-carousels.mjs
```

## 5. Known operational behaviour

- **Content changes take up to 30 seconds** to appear (ISR revalidation), and
  the request that triggers regeneration still gets the previous page. There is
  no on-demand revalidation endpoint; adding one plus a Strapi webhook is the
  obvious next improvement.
- **If the CMS is unreachable at runtime**, the browse and facet routes throw
  rather than render, so Next keeps serving the last good page instead of
  caching a page that says we have no inventory. During a *build* they degrade
  instead, so a build never fails on a CMS outage — but a build run while the
  CMS is down produces a sitemap with no listings and `noindex` on `/used-cars`.
  **Do not deploy the web app while the CMS is down.**
