# G-ALERT-RUNBOOK-LINK — Guide

**Script:** `scripts/obs/alert_runbook_link.py`  
**Artifacts:** `observability/alerts.json`  
**Threshold:** 100% alerts linked

## Run
```bash
# choose the right runner: node / ts-node / python
node scripts/obs/alert_runbook_link.py  # or: ts-node / python3
```

## Output
Writes: `reports/gates/G-ALERT-RUNBOOK-LINK.summary.json` with fields: gate_id, status, metrics, artifacts, timestamp, reason.

## PASS
- Threshold respected.

## FAIL
- Writes offenders and sets reason accordingly.
