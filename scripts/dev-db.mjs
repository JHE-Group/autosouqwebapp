#!/usr/bin/env node
/**
 * Create the local development database, so dev runs on the engine production
 * runs on.
 *
 * ## Why this exists
 *
 * Development defaulted to SQLite and production is OVH Managed PostgreSQL. The
 * cost of that split is not theoretical: every conclusion drawn locally is a
 * conclusion about SQLite, and some of them are load-bearing.
 *
 * A worked example from this repo. The listing submission path suffixes every
 * slug rather than retrying on collision, and the commit message justifies it
 * with "Strapi does not enforce `uid` uniqueness on a content-API create —
 * submitting the same car twice produced two rows and two 200s". That was
 * measured on SQLite. Had Postgres enforced the constraint, the shipped code
 * would have handed sellers a 500 on the most ordinary duplicate title on the
 * site. It happens not to — checked, on Postgres 16, no unique index on either
 * engine — but that was luck, discovered afterwards, not something the local
 * setup could tell anyone.
 *
 * SQLite still works and is still supported; see .env.example. It is just no
 * longer the thing findings get characterised against.
 *
 * ## Usage
 *
 *   pnpm db:dev            create it (idempotent)
 *   pnpm db:dev --reset    drop and recreate — a clean slate, as `rm .tmp/data.db` was
 *
 * Prints the block to paste into apps/cms/.env. It deliberately does not write
 * that file: .env holds real secrets on some machines and a script that edits it
 * unprompted is a script nobody trusts.
 */
import { execFileSync } from "node:child_process";
import process from "node:process";

const DB = process.env.AUTOSOUQ_DEV_DB ?? "autosouq_dev";
const reset = process.argv.includes("--reset");

/**
 * Is this binary on PATH?
 *
 * By running it, not by asking a shell. `execFileSync("command", ["-v", bin],
 * { shell: true })` works but earns DEP0190 on every invocation — args are
 * concatenated into the shell string rather than escaped — and a setup script
 * that prints a deprecation warning teaches people to ignore warnings.
 */
function has(bin) {
  try {
    execFileSync(bin, ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function run(bin, args, { allowFail = false } = {}) {
  try {
    return execFileSync(bin, args, { encoding: "utf8" }).trim();
  } catch (err) {
    if (allowFail) return null;
    throw err;
  }
}

if (!has("createdb") || !has("psql")) {
  console.error(
    [
      "PostgreSQL client tools were not found on PATH.",
      "",
      "  macOS:   brew install postgresql@16 && brew services start postgresql@16",
      "  Debian:  sudo apt install postgresql",
      "",
      "Or, without installing anything locally, use the compose file at the repo",
      "root:  docker compose up -d db",
      "",
      "Or keep using SQLite — it still works. See apps/cms/.env.example.",
    ].join("\n"),
  );
  process.exit(1);
}

// `psql -l` rather than a connection to DB itself: this has to work before the
// database exists, and the failure we want to report is "no server running",
// not "database missing".
const list = run("psql", ["-lqt"], { allowFail: true });
if (list === null) {
  console.error(
    [
      "Could not reach a PostgreSQL server.",
      "",
      "  macOS:  brew services start postgresql@16",
      "",
      "If it is running on a non-default host or port, set PGHOST / PGPORT.",
    ].join("\n"),
  );
  process.exit(1);
}

const exists = list
  .split("\n")
  .map((line) => line.split("|")[0]?.trim())
  .includes(DB);

if (exists && reset) {
  run("dropdb", ["--if-exists", DB]);
  console.log(`Dropped ${DB}.`);
}

if (!exists || reset) {
  run("createdb", [DB]);
  console.log(`Created ${DB}.`);
} else {
  console.log(`${DB} already exists. Use --reset for a clean slate.`);
}

const user = process.env.PGUSER ?? process.env.USER ?? "postgres";

console.log(
  [
    "",
    "Put this in apps/cms/.env (replacing the DATABASE_CLIENT=sqlite block):",
    "",
    "  DATABASE_CLIENT=postgres",
    "  DATABASE_HOST=localhost",
    `  DATABASE_PORT=${process.env.PGPORT ?? 5432}`,
    `  DATABASE_NAME=${DB}`,
    `  DATABASE_USERNAME=${user}`,
    "  DATABASE_PASSWORD=",
    // Local Postgres is not TLS by default, and production's CA handling is a
    // separate concern documented in .env.example. Saying so here stops someone
    // copying DATABASE_SSL=false into a production file.
    "  DATABASE_SSL=false        # local only — production requires true + the OVH CA",
    "",
    "Then: pnpm dev:cms",
    "",
  ].join("\n"),
);
