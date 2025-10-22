#!/usr/bin/env python3
import json, time, sys, os
from datetime import datetime
path = "evidence/release/rollback_tests.json"
data = json.load(open(path)) if os.path.exists(path) else [{"date":"1970-01-01","result":"FAIL"}]
last = max(datetime.strptime(x["date"], "%Y-%m-%d") for x in data)
days = (datetime.utcnow() - last).days
status = "PASS" if days <= 30 else "FAIL"
out = {"gate_id":"G-RELEASE-ROLLBACK-FRESH","status":status,"metrics":{"last_days":days},
       "artifacts":[path],"timestamp":datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
       "reason":"stale" if status=="FAIL" else "ok" }
open("reports/gates/G-RELEASE-ROLLBACK-FRESH.summary.json","w").write(json.dumps(out,indent=2))
sys.exit(0 if status=="PASS" else 1)
