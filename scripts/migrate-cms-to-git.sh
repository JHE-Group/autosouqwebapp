#!/usr/bin/env bash
#
# Move the production CMS from an uploaded directory to a real git checkout.
#
#   ./migrate-cms-to-git.sh            survey only — changes nothing
#   ./migrate-cms-to-git.sh --stage    build the new checkout alongside the old
#   ./migrate-cms-to-git.sh --switch   point PM2 at it, verify, roll back on failure
#
# Run it with bash or via ./ so the shebang applies. `sh migrate-cms-to-git.sh`
# uses POSIX sh, which has no `[[`, and fails with a syntax error saying nothing.
#
# ## Why this exists
#
# /home/nomadtours/domains/autosouq.om/public_html/app is not a git repository.
# Code arrives out of band and ~/deploy.sh only rebuilds and restarts whatever
# is on disk. So nothing on the server records a revision, and on 2026-08-02 a
# fix sat on origin/CMS for hours while production ran without it and no command
# existed that could say so. A `git pull` there answers "not a git repository";
# that is the problem this removes.
#
# ## Why blue/green rather than converting in place
#
# `git init` in the live directory, then fetch and reset --hard, is fewer steps
# and has no undo: it rewrites the directory that is currently serving. This
# builds the replacement beside it and leaves the original untouched, so
# --switch is the only moment traffic is at risk and rollback is one command.
#
# ## Why outside public_html
#
# The app currently sits inside a WordPress document root, with a .env holding
# the database password and APP_KEYS. Whether a vhost actually serves that path
# is checked below, but the durable answer is to not keep it there. Nothing
# requires it: the reverse proxy targets a PORT, not a filesystem path.

set -euo pipefail

MODE="${1:-survey}"

OLD="${AUTOSOUQ_OLD_DIR:-/home/nomadtours/domains/autosouq.om/public_html/app}"
NEW="${AUTOSOUQ_NEW_DIR:-/home/nomadtours/apps/autosouq-cms}"
REPO="${AUTOSOUQ_REPO:-git@github.com:JHE-Group/autosouqwebapp.git}"
BRANCH="${AUTOSOUQ_BRANCH:-CMS}"
SERVICE="${AUTOSOUQ_CMS_SERVICE:-autosouq-cms}"
PUBLIC_URL="${AUTOSOUQ_CMS_URL:-https://app.autosouq.om}"

ok()   { printf "  \033[32mok\033[0m    %s\n" "$1"; }
bad()  { printf "  \033[31mFAIL\033[0m  %s\n" "$1"; FAILED=1; }
warn() { printf "  \033[33mwarn\033[0m  %s\n" "$1"; }
info() { printf "  ...   %s\n" "$1"; }
FAILED=0

echo
echo "Autosouq CMS — migrate to a git checkout"
echo "  mode: $MODE"
echo "  from: $OLD"
echo "  to:   $NEW"
echo

# ── Survey ───────────────────────────────────────────────────────────────────
echo "Survey"

[[ -d "$OLD" ]] && ok "source directory exists" \
                || bad "source directory missing: $OLD"

if [[ -d "$OLD" ]]; then
  [[ -f "$OLD/.env" ]] && ok ".env present in the source" \
                       || bad ".env missing — it is gitignored, so a clone cannot supply it"
  [[ -f "$OLD/package.json" && -d "$OLD/src" ]] && ok "source looks like the CMS" \
                                                || bad "source has no package.json/src"
fi

# Uploads live on local disk: config/plugins.ts configures no S3 provider, and
# public/uploads/* is gitignored. A clone brings .gitkeep and nothing else, so
# forgetting this step is every listing image on the site.
# `.gitkeep` is excluded on both sides throughout. It is tracked on the branch,
# so a clone creates one and the destination legitimately holds one more file
# than the source — which the first version of this check reported as a failed
# copy. Counting a placeholder as a missing image is the sort of false alarm
# that gets a real integrity check ignored.
if [[ -d "$OLD/public/uploads" ]]; then
  n=$(find "$OLD/public/uploads" -type f ! -name '.gitkeep' 2>/dev/null | wc -l | tr -d ' ')
  sz=$(du -sh "$OLD/public/uploads" 2>/dev/null | cut -f1)
  ok "uploads to migrate: $n file(s), $sz"
else
  warn "no public/uploads directory — nothing to migrate, which is worth a second look"
fi

command -v git   >/dev/null && ok "git on PATH ($(git --version | awk '{print $3}'))" || bad "git not found"
command -v pnpm  >/dev/null && ok "pnpm on PATH"  || bad "pnpm not found"
command -v node  >/dev/null && ok "node $(node -v)" || bad "node not found"
command -v pm2   >/dev/null && ok "pm2 on PATH"   || bad "pm2 not found"

# Free space must cover a second node_modules and a second build, not just the
# source tree. Strapi's admin build is the bulk of it.
avail=$(df -Pk "$HOME" | tail -1 | awk '{print $4}')
availh=$(df -Ph "$HOME" | tail -1 | awk '{print $4}')
if [[ "$avail" -gt 2000000 ]]; then
  ok "disk free: $availh"
else
  bad "disk free: $availh — want >2G for a second node_modules and admin build"
fi

# The reason for moving out of the document root. A 200 here means the database
# password is downloadable.
code=$(curl -sS -o /dev/null -w "%{http_code}" "$PUBLIC_URL/.env" --max-time 10 2>/dev/null || echo 000)
if [[ "$code" == "200" ]]; then
  bad "$PUBLIC_URL/.env returns 200 — SECRETS ARE PUBLICLY READABLE, rotate them after this"
else
  ok "$PUBLIC_URL/.env is not served ($code)"
fi

# Read-only deploy key. A token would end up in git config and shell history;
# a read-only key cannot push even if this box is compromised.
gh_out=$(ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=8 -T git@github.com 2>&1 || true)
if grep -q "successfully authenticated" <<<"$gh_out"; then
  ok "GitHub SSH authenticates ($(grep -o 'Hi [^!]*' <<<"$gh_out" | head -1))"
elif grep -qiE "permission denied|could not resolve|connection timed out|network is unreachable" <<<"$gh_out"; then
  bad "GitHub SSH not usable: $(head -1 <<<"$gh_out")"
  echo
  echo "        Fix before --stage:"
  if [[ ! -f "$HOME/.ssh/id_ed25519.pub" ]]; then
    echo "          ssh-keygen -t ed25519 -C 'autosouq-cms deploy' -f ~/.ssh/id_ed25519 -N ''"
  fi
  echo "          cat ~/.ssh/id_ed25519.pub"
  echo "        Add that key at:"
  echo "          github.com/JHE-Group/autosouqwebapp/settings/keys  →  Add deploy key"
  echo "        Leave 'Allow write access' UNCHECKED."
else
  warn "GitHub SSH result unclear: $(head -1 <<<"$gh_out")"
fi

if [[ $FAILED == 1 ]]; then
  echo
  echo "Survey failed. Nothing has changed."
  exit 1
fi

if [[ "$MODE" == "survey" ]]; then
  echo
  echo "Survey passed. Nothing changed."
  echo "Next: ./migrate-cms-to-git.sh --stage   (builds $NEW, does not touch traffic)"
  exit 0
fi

# ── Stage ────────────────────────────────────────────────────────────────────
if [[ "$MODE" == "--stage" ]]; then
  echo
  echo "Staging"

  # Refuse rather than clobber. A half-built previous attempt is something to
  # look at, not something to silently overwrite.
  if [[ -e "$NEW" ]]; then
    echo "  FAIL  $NEW already exists. Inspect it, then remove it deliberately:"
    echo "          rm -rf $NEW"
    exit 1
  fi

  mkdir -p "$(dirname "$NEW")"
  git clone --branch "$BRANCH" "$REPO" "$NEW"
  ok "cloned $BRANCH to $NEW"

  cd "$NEW"
  git rev-parse HEAD > .deployed-revision
  ok "revision $(git rev-parse --short HEAD)  $(git log -1 --pretty=%s | cut -c1-52)"

  # Copy, never move. If any of this turns out wrong, the originals are still
  # in the directory that is still serving.
  cp -a "$OLD/.env" "$NEW/.env"
  ok ".env copied"

  if [[ -d "$OLD/public/uploads" ]]; then
    mkdir -p "$NEW/public/uploads"
    cp -a "$OLD/public/uploads/." "$NEW/public/uploads/"
    a=$(find "$OLD/public/uploads" -type f ! -name '.gitkeep' | wc -l | tr -d ' ')
    b=$(find "$NEW/public/uploads" -type f ! -name '.gitkeep' | wc -l | tr -d ' ')
    [[ "$a" == "$b" ]] && ok "uploads copied ($b files, counts match)" \
                       || bad "upload count mismatch: source $a, copy $b"
  fi

  pnpm install --frozen-lockfile
  ok "dependencies installed"

  NODE_ENV=production pnpm build
  ok "built"

  if [[ $FAILED == 1 ]]; then
    echo
    echo "Staging finished with problems. Traffic is UNCHANGED — $OLD is still live."
    exit 1
  fi

  echo
  echo "Staged. Traffic is unchanged; $OLD is still serving."
  echo "Next: ./migrate-cms-to-git.sh --switch"
  echo
  echo "Before you do: take a database snapshot. The first boot on a new"
  echo "revision can alter the schema and write permission rows."
  exit 0
fi

# ── Switch ───────────────────────────────────────────────────────────────────
if [[ "$MODE" == "--switch" ]]; then
  echo
  echo "Switching"

  [[ -d "$NEW/dist" ]] || { echo "  FAIL  $NEW has no dist/ — run --stage first"; exit 1; }
  [[ -f "$NEW/.env" ]] || { echo "  FAIL  $NEW has no .env — run --stage first"; exit 1; }

  # Both processes would bind the same PORT, so the old one has to go first.
  # This is the only moment of downtime in the whole migration.
  pm2 delete "$SERVICE" >/dev/null 2>&1 || true
  ok "stopped the old process"

  # NODE_ENV is set HERE, at create time, because that is what PM2 records and
  # replays on every later restart. Getting this wrong is what published ten
  # fabricated cars on 2026-07-31.
  NODE_ENV=production pm2 start npm --name "$SERVICE" --cwd "$NEW" -- run start
  pm2 save --force >/dev/null 2>&1
  ok "started from $NEW"

  info "waiting for the API"
  live=0
  for _ in $(seq 1 45); do
    c=$(curl -sS -o /dev/null -w "%{http_code}" "$PUBLIC_URL/api/listings" --max-time 8 2>/dev/null || echo 000)
    [[ "$c" == "200" ]] && { live=1; break; }
    sleep 2
  done

  if [[ "$live" != "1" ]]; then
    echo
    bad "the API did not come back — rolling back to $OLD"
    pm2 delete "$SERVICE" >/dev/null 2>&1 || true
    NODE_ENV=production pm2 start npm --name "$SERVICE" --cwd "$OLD" -- run start
    pm2 save --force >/dev/null 2>&1
    for _ in $(seq 1 45); do
      c=$(curl -sS -o /dev/null -w "%{http_code}" "$PUBLIC_URL/api/listings" --max-time 8 2>/dev/null || echo 000)
      [[ "$c" == "200" ]] && break
      sleep 2
    done
    echo
    echo "Rolled back. Check 'pm2 logs $SERVICE --lines 100' for why the new"
    echo "checkout would not boot. $NEW is left in place for inspection."
    exit 1
  fi
  ok "API responding"

  # NODE_ENV again, from the process rather than from intent — the whole point.
  running_env=$(pm2 jlist 2>/dev/null | node -e "
    let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
      try{const p=(JSON.parse(d)||[]).find(x=>x.name===process.argv[1]);
        process.stdout.write(p?.pm2_env?.NODE_ENV ?? '');}catch{process.stdout.write('')}
    })" "$SERVICE" 2>/dev/null || echo '')
  [[ "$running_env" == "production" ]] \
    && ok "live process has NODE_ENV=production" \
    || bad "live process has NODE_ENV='${running_env:-unset}' — the seeder is armed"

  leak=$(curl -sS "$PUBLIC_URL/api/listings?status=draft" --max-time 15 2>/dev/null \
         | grep -o '"publishedAt":null' | wc -l | tr -d ' ')
  [[ "$leak" == "0" ]] && ok "drafts are not publicly readable" \
                       || bad "$leak unpublished listing(s) readable anonymously"

  makes=$(curl -sS "$PUBLIC_URL/api/makes" --max-time 15 2>/dev/null | grep -o '"id"' | wc -l | tr -d ' ')
  [[ "$makes" -gt 0 ]] && ok "taxonomies present ($makes makes)" || bad "no makes"

  up=$(find "$NEW/public/uploads" -type f 2>/dev/null | wc -l | tr -d ' ')
  info "uploads in the live directory: $up"

  echo
  if [[ $FAILED == 1 ]]; then
    echo "Switched, but the checks above found problems. Do not walk away."
    echo "Roll back with:"
    echo "  pm2 delete $SERVICE && cd $OLD && NODE_ENV=production pm2 start npm --name $SERVICE --cwd $OLD -- run start && pm2 save"
    exit 1
  fi

  echo "Done. $PUBLIC_URL is served from $NEW at $(cd "$NEW" && git rev-parse --short HEAD)."
  echo
  echo "$OLD is untouched and still your rollback. Keep it until you have seen"
  echo "a normal day's traffic, then remove it deliberately."
  echo
  echo "From now on:  cd $NEW && ./scripts/deploy-cms.sh --run"
  exit 0
fi

echo "Unknown mode: $MODE"
echo "Use: (no argument) | --stage | --switch"
exit 1
