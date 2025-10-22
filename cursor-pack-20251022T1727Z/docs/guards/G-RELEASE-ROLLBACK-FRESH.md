# G-RELEASE-ROLLBACK-FRESH — Guide

**Script:** `scripts/release/rollback_freshness.py`  
**Artifacts:** `evidence/release/rollback_tests.json`  
**Threshold:** Last rollback test ≤30d

## Run
```bash
# choose the right runner: node / ts-node / python
node scripts/release/rollback_freshness.py  # or: ts-node / python3
```

## Output
Writes: `reports/gates/G-RELEASE-ROLLBACK-FRESH.summary.json` with fields: gate_id, status, metrics, artifacts, timestamp, reason.

## PASS
- Threshold respected.

## FAIL
- Writes offenders and sets reason accordingly.
