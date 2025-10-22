# G-EGRESS-ALLOWLIST — Guide

**Script:** `scripts/sec/egress_allowlist_guard.py`  
**Artifacts:** `policies/security/egress_allowlist.json`  
**Threshold:** No unexpected egress

## Run
```bash
# choose the right runner: node / ts-node / python
node scripts/sec/egress_allowlist_guard.py  # or: ts-node / python3
```

## Output
Writes: `reports/gates/G-EGRESS-ALLOWLIST.summary.json` with fields: gate_id, status, metrics, artifacts, timestamp, reason.

## PASS
- Threshold respected.

## FAIL
- Writes offenders and sets reason accordingly.
