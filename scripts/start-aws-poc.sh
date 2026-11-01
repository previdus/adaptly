#!/bin/sh
set -eu

wrangler() {
  node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js "$@"
}

# Reuse the persistent D1 schema on container restarts. Apply the initial
# schema only when one of the app's core tables is missing.
if ! wrangler d1 execute site-creator-d1 --local --persist-to /var/lib/adaptly/state --config dist/server/wrangler.json --command 'SELECT 1 FROM families, login_limits, pilot_profiles, pilot_sessions LIMIT 0' >/dev/null 2>&1; then
  wrangler d1 execute site-creator-d1 --local --persist-to /var/lib/adaptly/state --config dist/server/wrangler.json --file drizzle/0000_slow_human_fly.sql
  wrangler d1 execute site-creator-d1 --local --persist-to /var/lib/adaptly/state --config dist/server/wrangler.json --file drizzle/0001_neat_kang.sql
  wrangler d1 execute site-creator-d1 --local --persist-to /var/lib/adaptly/state --config dist/server/wrangler.json --file drizzle/0002_mixed_shadow_king.sql
fi

exec node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js dev --config dist/server/wrangler.json --local --persist-to /var/lib/adaptly/state --ip 0.0.0.0 --port 8787 --inspector-port 0
