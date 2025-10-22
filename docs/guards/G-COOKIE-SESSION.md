# G-COOKIE-SESSION — Guide

**Script:** `scripts/sec/cookie_session_lint.js`  
**Artifacts:** `reports/headers/staging.json`  
**Threshold:** Secure+HttpOnly+SameSite

## Run
```bash
# choose the right runner: node / ts-node / python
node scripts/sec/cookie_session_lint.js  # or: ts-node / python3
```

## Output
Writes: `reports/gates/G-COOKIE-SESSION.summary.json` with fields: gate_id, status, metrics, artifacts, timestamp, reason.

## PASS
- Threshold respected.

## FAIL
- Writes offenders and sets reason accordingly.
