#!/bin/sh
set -eu

wrangler() {
  node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js "$@"
}

d1() {
  wrangler d1 execute site-creator-d1 --local --persist-to /var/lib/adaptly/state --config dist/server/wrangler.json "$@"
}

# Add a migration ledger so future SQL files are applied once, before the app
# starts. Existing AWS POC databases were initialized with these three files;
# record that baseline without replaying destructive CREATE statements.
d1 --command 'CREATE TABLE IF NOT EXISTS adaptly_schema_migrations (name TEXT PRIMARY KEY NOT NULL, applied_at INTEGER NOT NULL DEFAULT 0)'
if d1 --command 'SELECT 1 FROM families, login_limits, pilot_profiles, pilot_sessions LIMIT 0' >/dev/null 2>&1; then
  for migration in 0000_slow_human_fly.sql 0001_neat_kang.sql 0002_mixed_shadow_king.sql; do
    d1 --command "INSERT OR IGNORE INTO adaptly_schema_migrations(name, applied_at) VALUES ('$migration', strftime('%s','now'))"
  done
fi

for migration in drizzle/[0-9]*.sql; do
  [ -f "$migration" ] || continue
  name=${migration##*/}
  applied=$(d1 --json --command "SELECT EXISTS(SELECT 1 FROM adaptly_schema_migrations WHERE name='$name') AS applied")
  if printf '%s' "$applied" | node -e 'let input="";process.stdin.on("data",chunk=>input+=chunk).on("end",()=>{try{const data=JSON.parse(input);const rows=(Array.isArray(data)?data:[data]).flatMap(item=>item.results||[]);process.exit(rows.some(row=>Number(row.applied)===1)?0:1)}catch{process.exit(2)}})'; then
    continue
  else
    result=$?
    if [ "$result" -ne 1 ]; then
      echo "Could not read migration status for $name." >&2
      exit "$result"
    fi
  fi
  echo "Applying database migration: $name"
  d1 --file "$migration"
  d1 --command "INSERT INTO adaptly_schema_migrations(name, applied_at) VALUES ('$name', strftime('%s','now'))"
done

exec node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js dev --config dist/server/wrangler.json --local --persist-to /var/lib/adaptly/state --ip 0.0.0.0 --port 8787 --inspector-port 0
