# G-CONFIG-REQUIRED — Guide

**Script:** `scripts/config/required_guard.py`  
**Artifacts:** `settings/specs/required.json`  
**Threshold:** Missing env = 0

## Run
```bash
# choose the right runner: node / ts-node / python
node scripts/config/required_guard.py  # or: ts-node / python3
```

## Output
Writes: `reports/gates/G-CONFIG-REQUIRED.summary.json` with fields: gate_id, status, metrics, artifacts, timestamp, reason.

## PASS
- Threshold respected.

## FAIL
- Writes offenders and sets reason accordingly.
