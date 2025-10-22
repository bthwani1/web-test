# G-HEADERS — Guide

**Script:** `scripts/headers/lint_csp_cors_hsts.js`  
**Artifacts:** `reports/headers/staging.json`  
**Threshold:** No unsafe*, CORS allowlist, HSTS on

## Run
```bash
# choose the right runner: node / ts-node / python
node scripts/headers/lint_csp_cors_hsts.js  # or: ts-node / python3
```

## Output
Writes: `reports/gates/G-HEADERS.summary.json` with fields: gate_id, status, metrics, artifacts, timestamp, reason.

## PASS
- Threshold respected.

## FAIL
- Writes offenders and sets reason accordingly.
