# G-BURN-RATE-FREEZE — Guide

**Script:** `scripts/obs/burn_rate_freeze.py`  
**Artifacts:** `reports/obs/slo_status.json`  
**Threshold:** Freeze if burn_rate>threshold

## Run
```bash
# choose the right runner: node / ts-node / python
node scripts/obs/burn_rate_freeze.py  # or: ts-node / python3
```

## Output
Writes: `reports/gates/G-BURN-RATE-FREEZE.summary.json` with fields: gate_id, status, metrics, artifacts, timestamp, reason.

## PASS
- Threshold respected.

## FAIL
- Writes offenders and sets reason accordingly.
