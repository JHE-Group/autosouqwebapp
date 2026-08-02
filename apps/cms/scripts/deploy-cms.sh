#!/usr/bin/env bash
#
# Deploy the CMS on the OVH box. Run it THERE, not on your laptop.
#
#   cd /path/to/autosouq-cms
#   export NODE_ENV=production
#   ./scripts/deploy-cms.sh              check everything, change nothing
#   ./scripts/deploy-cms.sh --run        actually deploy
#
# Run it with bash, or via ./ so the shebang applies. `sh scripts/deploy-cms.sh`
# ignores the shebang and uses POSIX sh, which does not support the `[[` tests
# below, and fails with a syntax error that says nothing useful.
#
# ## Why this lives under apps/cms and not in the repo's scripts/
#
# The CMS branch is `git subtree split --prefix=apps/cms`, so only what is
# inside apps/cms reaches the server. A deploy script at the repo root is a
# deploy script the deploy target never sees — which is exactly where this was
# first written.
#
# ## Why this exists
#
# Deployment was a sequence in DEPLOYMENT.md that a person followed by hand. On
# 2026-07-31 that produced an outage worth encoding against: the process came up
# without NODE_ENV=production, so `demoSeedingEnabled()` returned true and seeded
# ten fabricated cars — invented prices, AI-generated photos — straight onto the
# live site. The same deploy also landed a commit older than the security fixes,
# leaving every unreviewed draft readable by anyone who asked.
#
# Neither was a hard step. Both were a step nobody checked. So each check below
# corresponds to something that has actually gone wrong here, not to a
# generic best practice.
#
# It refuses to proceed rather than warning and continuing. A deploy that stops
# is five minutes; a deploy that carries on wrong is what happened.

set -euo pipefail

RUN=0
[[ "${1:-}" == "--run" ]] && RUN=1

REPO_DIR="${AUTOSOUQ_CMS_DIR:-$(pwd)}"
SERVICE="${AUTOSOUQ_CMS_SERVICE:-autosouq-cms}"
PUBLIC_URL="${AUTOSOUQ_CMS_URL:-https://app.autosouq.om}"

ok()   { printf "  \033[32mok\033[0m    %s\n" "$1"; }
bad()  { printf "  \033[31mFAIL\033[0m  %s\n" "$1"; FAILED=1; }
info() { printf "  ...   %s\n" "$1"; }
FAILED=0

echo
echo "Autosouq CMS deploy — $([[ $RUN == 1 ]] && echo 'LIVE RUN' || echo 'dry run, nothing will change')"
echo "  directory: $REPO_DIR"
echo "  service:   $SERVICE"
echo

# Before anything else. `set -e` would abort on a failed `cd` anyway, but it
# does so after the banner has printed, which reads as "the deploy started and
# then something went wrong" rather than "you pointed it at nothing".
if [[ ! -d "$REPO_DIR" ]]; then
  echo "  FAIL  no such directory: $REPO_DIR"
  echo
  echo "Set AUTOSOUQ_CMS_DIR, or run this from inside the CMS checkout."
  exit 1
fi

cd "$REPO_DIR"

# ── Preflight ────────────────────────────────────────────────────────────────
echo "Preflight"

# The CMS branch is a subtree artifact: its contents sit at the repo root, so a
# monorepo checkout here means someone deployed the wrong branch.
#
# `package.json + src/ + config/` alone does NOT establish that. The monorepo's
# apps/cms has all three, so this check passed cleanly when run there on
# 2026-08-02 — the exact "wrong branch" case it exists to catch. It only stopped
# because that laptop had no pm2. On a host with pm2 and a monorepo checkout it
# would have sailed through to `git pull --ff-only origin CMS`, run against the
# wrong branch.
#
# The discriminator is the workspace root two levels up: pnpm-workspace.yaml
# exists in the monorepo and not on the CMS branch. Note `apps/` cannot be used
# — the CMS branch carries apps/web/README.md as a Vercel placeholder, so the
# obvious "no apps/ directory here" test would fail on the real branch.
if [[ -f package.json && -d src && -d config ]]; then
  if [[ -f ../../pnpm-workspace.yaml ]]; then
    bad "this is apps/cms inside the monorepo, not a CMS-branch checkout"
    echo "        Deploying from here would pull origin/CMS over your monorepo."
  elif [[ -d .git ]] && git rev-parse --git-dir >/dev/null 2>&1 \
       && git rev-parse --verify --quiet origin/CMS >/dev/null 2>&1 \
       && ! git merge-base --is-ancestor HEAD origin/CMS 2>/dev/null \
       && ! git merge-base --is-ancestor origin/CMS HEAD 2>/dev/null; then
    bad "HEAD is unrelated to origin/CMS — wrong branch or wrong repository"
  else
    ok "looks like the CMS branch (src/ and config/ at the root)"
  fi
else
  bad "this does not look like the CMS branch — expected src/ and config/ at the root"
fi

# The single cause of the 2026-07-31 incident. `demoSeedingEnabled()` returns
# true whenever NODE_ENV is not exactly "production", and seeds demo listings.
if [[ "${NODE_ENV:-}" == "production" ]]; then
  ok "NODE_ENV=production in this shell"
else
  bad "NODE_ENV is '${NODE_ENV:-unset}' — must be 'production', or the seeder will publish demo cars"
fi

# A fresh clone has no .env, and without DATABASE_CLIENT the config falls back to
# sqlite; the production guard then refuses to boot. Better to say so here.
if [[ -f .env ]]; then
  ok ".env present"
  # Anchored to the start of the line, this read `^DATABASE_CLIENT=postgres` and
  # failed the production .env, which indents the line by three spaces:
  #
  #     60:   DATABASE_CLIENT=postgres$      (grep -n | cat -A, 2026-08-02)
  #
  # dotenv trims that, so Strapi was on Postgres the whole time and the check was
  # simply wrong — it blocked a real deploy on a healthy host. Same mistake as the
  # draft-leak check below had: asserting on the shape of a file rather than on
  # what the file means. Leading and trailing space and optional quotes are all
  # legal dotenv and all have to pass.
  if grep -qE '^[[:space:]]*DATABASE_CLIENT[[:space:]]*=[[:space:]]*"?'"'"'?postgres'"'"'?"?[[:space:]]*$' .env; then
    ok "DATABASE_CLIENT=postgres"
  else
    bad "DATABASE_CLIENT is not postgres — check .env"
  fi
  # Same tolerance here. A commented `#SEED_DEMO_DATA=true` must NOT trip it,
  # which is why the anchor allows whitespace but not a '#'.
  if grep -qE '^[[:space:]]*SEED_DEMO_DATA[[:space:]]*=[[:space:]]*"?'"'"'?true' .env; then
    bad "SEED_DEMO_DATA=true in .env — this will publish demo cars"
  else
    ok "SEED_DEMO_DATA is not true"
  fi

  # A boot-blocker, and one that only bites in production — which is the mode
  # this script exists to enforce, so it has to be checked before the restart
  # rather than discovered from a dead API afterwards.
  #
  # config/middlewares.ts throws "Refusing to start: FRONTEND_URL must be set in
  # production so CORS permits the deployed web app" when NODE_ENV=production and
  # FRONTEND_URL is empty. In development it instead falls back to the localhost
  # pair and boots fine — so a process that has been running happily WITHOUT
  # NODE_ENV=production can refuse to come back up the first time it is set
  # correctly. That is the sharp edge here: fixing the env can look like it broke
  # the site.
  if grep -qE '^[[:space:]]*FRONTEND_URL[[:space:]]*=[[:space:]]*"?'"'"'?https?://' .env; then
    ok "FRONTEND_URL set — production CORS will have an origin"
  else
    bad "FRONTEND_URL is not set to a URL — a production boot will REFUSE to start"
  fi
else
  bad ".env is missing — copy it from the previous checkout before deploying"
fi

command -v pnpm >/dev/null && ok "pnpm on PATH" || bad "pnpm not found on PATH"

# Checked here, not at the restart step, because the restart step runs *after*
# the pull, the install and the build. Discovering there is nothing to restart
# at that point leaves the checkout on the new revision with the old code still
# serving — the worst of both, and precisely what the systemd-only version of
# this script did on a PM2 host.
if command -v pm2 >/dev/null && pm2 describe "$SERVICE" >/dev/null 2>&1; then
  ok "pm2 is managing $SERVICE"
elif command -v systemctl >/dev/null && systemctl list-units --all 2>/dev/null | grep -q "$SERVICE"; then
  ok "systemd unit $SERVICE present"
else
  bad "nothing manages $SERVICE — expected a pm2 process or a systemd unit by that name"
fi

if [[ $FAILED == 1 ]]; then
  echo
  echo "Preflight failed. Nothing has changed."
  exit 1
fi

# ── What is about to be deployed ─────────────────────────────────────────────
#
# The production directory is NOT a git checkout. Confirmed 2026-08-02:
# `git rev-parse --show-toplevel` there answers "not a git repository", there is
# no .git anywhere under the home directory, and files are updated out of band —
# ~/deploy.sh only runs install, build and restart against whatever is on disk.
#
# So this section cannot assume git, and the earlier version's bare `git fetch`
# aborted the whole script under `set -e` the moment it ran there. Where git is
# absent the honest thing is to say what cannot be checked rather than imply it
# was: without a revision on disk, nothing here can tell you what is deployed.
# That is exactly why an evening was spent unable to answer "did the fix ship".
echo
echo "Revision"
if [[ -d .git ]] && git rev-parse --git-dir >/dev/null 2>&1; then
  IS_GIT=1
  git fetch origin --quiet
  LOCAL=$(git rev-parse --short HEAD)
  REMOTE=$(git rev-parse --short origin/CMS)
  info "checked out: $LOCAL  $(git log -1 --pretty=%s | cut -c1-56)"
  info "origin/CMS:  $REMOTE  $(git log -1 --pretty=%s origin/CMS | cut -c1-56)"
  [[ "$LOCAL" == "$REMOTE" ]] && ok "already current" || info "will fast-forward to $REMOTE"
else
  IS_GIT=0
  info "not a git checkout — code is uploaded here out of band"
  if [[ -f .deployed-revision ]]; then
    info "last recorded revision: $(cut -c1-72 < .deployed-revision)"
  else
    info "no .deployed-revision stamp — this script cannot tell you what is running"
  fi
  info "upload the files you want live BEFORE running this; it will not fetch them"
fi

if [[ $RUN == 0 ]]; then
  echo
  echo "Dry run finished. Nothing changed. Re-run with --run to deploy."
  echo
  echo "Before you do: take a database snapshot. The first boot on a new"
  echo "revision can alter the schema and write permission rows."
  exit 0
fi

# ── Deploy ───────────────────────────────────────────────────────────────────
echo
echo "Deploying"
if [[ $IS_GIT == 1 ]]; then
  git pull --ff-only origin CMS
  ok "pulled $(git rev-parse --short HEAD)"
  git rev-parse HEAD > .deployed-revision
else
  info "skipping pull — not a git checkout, deploying what is on disk"
fi

pnpm install --frozen-lockfile
ok "dependencies installed"

# `strapi build` needs NODE_ENV=production explicitly. It is set for this whole
# script, but stating it here keeps the build honest if the block is ever lifted
# out — and it is the one place ~/deploy.sh got right.
#
# `strapi start` runs dist/, never src/. Skipping this is why an upload can
# appear to do nothing at all.
NODE_ENV=production pnpm build
ok "built"

# PM2 first, because PM2 is what the production box actually runs. This block
# used to be systemd-only, which meant the script aborted here — after pulling
# and building — on the one host it exists to serve.
if command -v pm2 >/dev/null && pm2 describe "$SERVICE" >/dev/null 2>&1; then
  # `--update-env` is not a tidiness flag, it is the point.
  #
  # A bare `pm2 restart` re-execs the process with the environment PM2 recorded
  # when it was FIRST started, not the environment of this shell. So the
  # NODE_ENV=production checked in preflight above can be entirely correct here
  # and entirely absent in the process that comes back up — and
  # `demoSeedingEnabled()` keys off exactly that, which is how ten fabricated
  # cars reached the live site on 2026-07-31. Preflight checks this shell;
  # `--update-env` is what makes the two the same thing.
  pm2 restart "$SERVICE" --update-env
  ok "restarted $SERVICE under pm2, env refreshed from this shell"

  # Survives a reboot. Without it the dump still holds the pre-deploy process
  # list, and the box comes back on whatever was saved last.
  pm2 save --force >/dev/null 2>&1 && ok "pm2 process list saved" || bad "pm2 save failed"

  # Ask the RUNNING process what it thinks NODE_ENV is, rather than trusting
  # that --update-env did what it says. This is the assertion the outage wanted.
  running_env=$(pm2 jlist 2>/dev/null | node -e "
    let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
      try{
        const p=(JSON.parse(d)||[]).find(x=>x.name===process.argv[1]);
        process.stdout.write(p?.pm2_env?.NODE_ENV ?? '');
      }catch{process.stdout.write('')}
    })" "$SERVICE" 2>/dev/null || echo '')
  if [[ "$running_env" == "production" ]]; then
    ok "live process has NODE_ENV=production"
  else
    bad "live process has NODE_ENV='${running_env:-unset}' — the seeder will publish demo cars"
  fi

  # A process that boots, throws and is restarted by PM2 looks 'online' if you
  # glance at the wrong moment. Compare the restart count either side of a pause.
  r1=$(pm2 jlist 2>/dev/null | node -e "
    let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
      try{
        const p=(JSON.parse(d)||[]).find(x=>x.name===process.argv[1]);
        process.stdout.write(String(p?.pm2_env?.restart_time ?? -1));
      }catch{process.stdout.write('-1')}
    })" "$SERVICE" 2>/dev/null || echo -1)
  sleep 8
  r2=$(pm2 jlist 2>/dev/null | node -e "
    let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
      try{
        const p=(JSON.parse(d)||[]).find(x=>x.name===process.argv[1]);
        process.stdout.write(String(p?.pm2_env?.restart_time ?? -1));
      }catch{process.stdout.write('-1')}
    })" "$SERVICE" 2>/dev/null || echo -1)
  if [[ "$r1" != "-1" && "$r1" == "$r2" ]]; then
    ok "process stable (no restarts in 8s)"
  else
    bad "restart count moved $r1 -> $r2 — the process is crash-looping; check 'pm2 logs $SERVICE'"
  fi

elif command -v systemctl >/dev/null && systemctl list-units --all 2>/dev/null | grep -q "$SERVICE"; then
  sudo systemctl restart "$SERVICE"
  ok "restarted $SERVICE under systemd"
else
  bad "no pm2 process or systemd unit named $SERVICE — start it yourself, and NOT with a bare 'pnpm start'"
  echo "        A foreground start dies with your SSH session. That is what took"
  echo "        the CMS down for a day. Under pm2 the first start is:"
  echo "          NODE_ENV=production pm2 start 'pnpm start' --name $SERVICE && pm2 save"
  exit 1
fi

# ── Verify against the public surface, not the logs ───────────────────────────
echo
echo "Verifying $PUBLIC_URL"
for _ in $(seq 1 30); do
  curl -sS -o /dev/null "$PUBLIC_URL/api/listings" --max-time 10 2>/dev/null && break
  sleep 2
done

code=$(curl -sS -o /dev/null -w "%{http_code}" "$PUBLIC_URL/api/listings" --max-time 15 2>/dev/null || echo 000)
[[ "$code" == "200" ]] && ok "API responding" || bad "API returned $code"

# The security fix from 1e331d6.
#
# This check used to count `"documentId"` here and demand zero, on the reading
# that a patched build returns nothing for `?status=draft`. It does not. The fix
# is `forceVersion` (src/api/listing/controllers/listing.ts), which STRIPS the
# status parameter and forces `published` — so a patched build answers this URL
# with the published set, exactly as if the parameter were absent. The old check
# therefore counted healthy published rows as leaked drafts and failed every
# deploy that had any inventory at all, which is every real deploy.
#
# A guard that fails when nothing is wrong is worse than no guard: it is the
# line people learn to scroll past, on a script whose whole purpose is that
# somebody checks. Observed on 2026-08-02, reporting "10 draft(s) readable
# anonymously" against a correctly patched production.
#
# What actually distinguishes a leak is an UNPUBLISHED row coming back. Every
# document Strapi returns carries `publishedAt`; on a patched build each one is
# a timestamp, and on an unpatched build the drafts arrive with it set to null.
# So count the nulls, not the rows.
draft_body=$(curl -sS "$PUBLIC_URL/api/listings?status=draft" --max-time 15 2>/dev/null || echo '')
leak=$(printf '%s' "$draft_body" | grep -o '"publishedAt":null' | wc -l | tr -d ' ')
rows=$(printf '%s' "$draft_body" | grep -o '"documentId"' | wc -l | tr -d ' ')
if ! printf '%s' "$draft_body" | grep -q '"data"'; then
  # An error payload or an empty body would otherwise score zero nulls and pass.
  bad "could not read /api/listings?status=draft — got: $(printf '%s' "${draft_body:-<empty>}" | head -c 120)"
elif [[ "$leak" == "0" ]]; then
  ok "drafts are not publicly readable ($rows published row(s) checked)"
else
  bad "$leak unpublished listing(s) readable anonymously — an older build is running"
fi

makes=$(curl -sS "$PUBLIC_URL/api/makes" --max-time 15 2>/dev/null | grep -o '"id"' | wc -l | tr -d ' ')
[[ "$makes" -gt 0 ]] && ok "taxonomies present ($makes makes)" || bad "no makes — the seed did not run"

pub=$(curl -sS "$PUBLIC_URL/api/listings" --max-time 15 2>/dev/null | grep -o '"documentId"' | wc -l | tr -d ' ')
info "published listings: $pub"

echo
if [[ $FAILED == 1 ]]; then
  echo "Deployed, but the checks above found problems. Do not walk away."
  exit 1
fi
echo "Done."
