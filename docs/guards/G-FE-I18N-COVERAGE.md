# G-FE-I18N-COVERAGE — Guide

**Script:** `scripts/fe/i18n_coverage.ts`  
**Artifacts:** `web/i18n/en.json, web/i18n/ar.json`  
**Threshold:** Missing keys = 0

## Run
```bash
# choose the right runner: node / ts-node / python
node scripts/fe/i18n_coverage.ts  # or: ts-node / python3
```

## Output
Writes: `reports/gates/G-FE-I18N-COVERAGE.summary.json` with fields: gate_id, status, metrics, artifacts, timestamp, reason.

## PASS
- Threshold respected.

## FAIL
- Writes offenders and sets reason accordingly.
