#!/usr/bin/env python3
import json, time, sys, os
path = "evidence/flags/inventory.json"
flags = json.load(open(path)) if os.path.exists(path) else []
expired = []; missing_owner=[]
today = time.strftime("%Y-%m-%d")
for f in flags:
  if f.get("expires_at","") and f["expires_at"] < today: expired.append(f.get("key","?"))
  if not f.get("owner"): missing_owner.append(f.get("key","?"))
status = "PASS" if not expired and not missing_owner else "FAIL"
out = {"gate_id":"G-FEATURE-FLAGS","status":status,"metrics":{"expired":len(expired),"missing_owner":len(missing_owner)},
       "artifacts":[path],"timestamp":time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
       "reason": "expired_or_ownerless" if status=="FAIL" else "ok",
       "expired":expired,"missing_owner":missing_owner}
open("reports/gates/G-FEATURE-FLAGS.summary.json","w").write(json.dumps(out,indent=2))
sys.exit(0 if status=="PASS" else 1)
