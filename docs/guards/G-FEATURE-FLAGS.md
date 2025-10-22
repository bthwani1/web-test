# G-FEATURE-FLAGS — Guide

**Script:** `scripts/release/flags_hygiene.py`  
**Artifacts:** `evidence/flags/inventory.json`  
**Threshold:** No expired or ownerless flags

## Run
```bash
# choose the right runner: node / ts-node / python
node scripts/release/flags_hygiene.py  # or: ts-node / python3
```

## Output
Writes: `reports/gates/G-FEATURE-FLAGS.summary.json` with fields: gate_id, status, metrics, artifacts, timestamp, reason.

## PASS
- Threshold respected.

## FAIL
- Writes offenders and sets reason accordingly.
