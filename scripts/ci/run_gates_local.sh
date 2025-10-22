#!/usr/bin/env bash
set -euo pipefail
echo "▶ Running local gates (web-store)"
bash scripts/headers/snapshot_stage.sh "${STAGE_URL:-https://staging.example.tld}" || true
node scripts/headers/lint_csp_cors_hsts.js || true
node scripts/sec/cookie_session_lint.js || true
node scripts/fe/cache_control_guard.js || true
node scripts/fe/bundle_budget.js || true
echo "✅ Done (see reports/gates/**)"
