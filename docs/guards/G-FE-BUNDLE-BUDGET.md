# G-FE-BUNDLE-BUDGET — Guide

**Script:** `scripts/fe/bundle_budget.js`  
**Artifacts:** `dist/**`  
**Threshold:** Bundle ≤ 250KB each

## Run
```bash
# choose the right runner: node / ts-node / python
node scripts/fe/bundle_budget.js  # or: ts-node / python3
```

## Output
Writes: `reports/gates/G-FE-BUNDLE-BUDGET.summary.json` with fields: gate_id, status, metrics, artifacts, timestamp, reason.

## PASS
- Threshold respected.

## FAIL
- Writes offenders and sets reason accordingly.
