# Gates Map (Web Store)

| Gate | Script | Artifact | Threshold |
|---|---|---|---|
| G-HEADERS | `scripts/headers/lint_csp_cors_hsts.js` | `reports/headers/staging.json` | No unsafe*, CORS allowlist, HSTS on |
| G-COOKIE-SESSION | `scripts/sec/cookie_session_lint.js` | `reports/headers/staging.json` | Secure+HttpOnly+SameSite |
| G-FE-CACHE-CONTROL | `scripts/fe/cache_control_guard.js` | `reports/headers/staging.json` | no-store on protected pages |
| G-FE-BUNDLE-BUDGET | `scripts/fe/bundle_budget.js` | `dist/**` | Bundle ≤ 250KB each |
| G-FE-I18N-COVERAGE | `scripts/fe/i18n_coverage.ts` | `web/i18n/en.json, web/i18n/ar.json` | Missing keys = 0 |
| G-ALERT-RUNBOOK-LINK | `scripts/obs/alert_runbook_link.py` | `observability/alerts.json` | 100% alerts linked |
| G-BURN-RATE-FREEZE | `scripts/obs/burn_rate_freeze.py` | `reports/obs/slo_status.json` | Freeze if burn_rate>threshold |
| G-FEATURE-FLAGS | `scripts/release/flags_hygiene.py` | `evidence/flags/inventory.json` | No expired or ownerless flags |
| G-CONFIG-REQUIRED | `scripts/config/required_guard.py` | `settings/specs/required.json` | Missing env = 0 |
| G-EGRESS-ALLOWLIST | `scripts/sec/egress_allowlist_guard.py` | `policies/security/egress_allowlist.json` | No unexpected egress |
| G-RELEASE-ROLLBACK-FRESH | `scripts/release/rollback_freshness.py` | `evidence/release/rollback_tests.json` | Last rollback test ≤30d |
| G-PII-LOGS | `scripts/privacy/pii_logs_scan.py` | `logs/**` | Files with PII = 0 |
