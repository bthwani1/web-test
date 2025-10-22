# Orchestrator — Web Store (PAO v6.1)

Generated: 2025-10-22T17:27:28Z

## Quickstart (Cursor Terminal)
```bash
bash scripts/headers/snapshot_stage.sh https://staging.example.tld
node scripts/headers/lint_csp_cors_hsts.js
node scripts/sec/cookie_session_lint.js
node scripts/fe/cache_control_guard.js
node scripts/fe/bundle_budget.js
node scripts/ci/aggregate_gates.js > reports/gates/aggregate.json
node scripts/ci/fail_on_any_fail.js reports/gates/aggregate.json
```
See `docs/guards/*.md` for each gate.
