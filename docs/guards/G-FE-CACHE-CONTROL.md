# G-FE-CACHE-CONTROL — Guide

**Script:** `scripts/fe/cache_control_guard.js`  
**Artifacts:** `reports/headers/staging.json`  
**Threshold:** no-store on protected pages

## Run
```bash
# choose the right runner: node / ts-node / python
node scripts/fe/cache_control_guard.js  # or: ts-node / python3
```

## Output
Writes: `reports/gates/G-FE-CACHE-CONTROL.summary.json` with fields: gate_id, status, metrics, artifacts, timestamp, reason.

## PASS
- Threshold respected.

## FAIL
- Writes offenders and sets reason accordingly.
