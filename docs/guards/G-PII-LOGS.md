# G-PII-LOGS — Guide

**Script:** `scripts/privacy/pii_logs_scan.py`  
**Artifacts:** `logs/**`  
**Threshold:** Files with PII = 0

## Run
```bash
# choose the right runner: node / ts-node / python
node scripts/privacy/pii_logs_scan.py  # or: ts-node / python3
```

## Output
Writes: `reports/gates/G-PII-LOGS.summary.json` with fields: gate_id, status, metrics, artifacts, timestamp, reason.

## PASS
- Threshold respected.

## FAIL
- Writes offenders and sets reason accordingly.
