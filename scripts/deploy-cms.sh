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
[[ -f package.json && -d src && -d config ]] \
  && ok "looks like the CMS branch (src/ and config/ at the root)" \
  || bad "this does not look like the CMS branch — expected src/ and config/ at the root"

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
  grep -q '^DATABASE_CLIENT=postgres' .env \
    && ok "DATABASE_CLIENT=postgres" \
    || bad "DATABASE_CLIENT is not postgres — check .env"
  if grep -qE '^SEED_DEMO_DATA=true' .env; then
    bad "SEED_DEMO_DATA=true in .env — this will publish demo cars"
  else
    ok "SEED_DEMO_DATA is not true"
  fi
else
  bad ".env is missing — copy it from the previous checkout before deploying"
fi

command -v pnpm >/dev/null && ok "pnpm on PATH" || bad "pnpm not found on PATH"

if [[ $FAILED == 1 ]]; then
  echo
  echo "Preflight failed. Nothing has changed."
  exit 1
fi

# ── What is about to be deployed ─────────────────────────────────────────────
echo
echo "Revision"
git fetch origin --quiet
LOCAL=$(git rev-parse --short HEAD)
REMOTE=$(git rev-parse --short origin/CMS)
info "checked out: $LOCAL  $(git log -1 --pretty=%s | cut -c1-56)"
info "origin/CMS:  $REMOTE  $(git log -1 --pretty=%s origin/CMS | cut -c1-56)"
[[ "$LOCAL" == "$REMOTE" ]] && ok "already current" || info "will fast-forward to $REMOTE"

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
git pull --ff-only origin CMS
ok "pulled $(git rev-parse --short HEAD)"

pnpm install --frozen-lockfile
ok "dependencies installed"

# `strapi start` runs dist/, never src/. Skipping this is why a pull can appear
# to do nothing at all.
pnpm build
ok "built"

if command -v systemctl >/dev/null && systemctl list-units --all 2>/dev/null | grep -q "$SERVICE"; then
  sudo systemctl restart "$SERVICE"
  ok "restarted $SERVICE"
else
  bad "no systemd unit named $SERVICE — start it yourself, and NOT with a bare 'pnpm start'"
  echo "        A foreground start dies with your SSH session. That is what took"
  echo "        the CMS down for a day. See the unit file in the project notes."
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

# The security fix from 1e331d6. If this returns rows, an older build is running.
leak=$(curl -sS "$PUBLIC_URL/api/listings?status=draft" --max-time 15 2>/dev/null \
       | grep -o '"documentId"' | wc -l | tr -d ' ')
[[ "$leak" == "0" ]] \
  && ok "drafts are not publicly readable" \
  || bad "$leak draft(s) readable anonymously — an older build is running"

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
