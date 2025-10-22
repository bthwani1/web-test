#!/usr/bin/env python3
import json, re, glob, time, sys, os
allow = set(json.load(open("policies/security/egress_allowlist.json"))) if os.path.exists("policies/security/egress_allowlist.json") else set()
calls = []
for f in glob.glob("**/*.[jt]s*", recursive=True):
  if "node_modules" in f: continue
  try:
    t=open(f,'r',errors='ignore').read()
    for m in re.findall(r'https?://([^/"\')]+)', t):
      calls.append((f,m))
  except: pass
viol=[]
for f,host in calls:
  base = host.lower()
  if allow and not any(base.endswith(a.lower()) for a in allow):
    viol.append({"file":f,"host":host})
status = "PASS" if not viol else "FAIL"
out = {"gate_id":"G-EGRESS-ALLOWLIST","status":status,"metrics":{"violations":len(viol)},
       "artifacts":["policies/security/egress_allowlist.json"],"timestamp":time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
       "reason":"unexpected_egress" if viol else "ok","offenders":viol[:50]}
open("reports/gates/G-EGRESS-ALLOWLIST.summary.json","w").write(json.dumps(out,indent=2))
sys.exit(0 if status=="PASS" else 1)
