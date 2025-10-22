#!/usr/bin/env node
import fs from "fs"; import path from "node:path";
const budgetKB = Number(process.env.BUNDLE_BUDGET_KB || 250);
const dist = process.env.DIST_DIR || "dist";
let offenders=[];
if (fs.existsSync(dist)) {
  for (const f of fs.readdirSync(dist)) {
    if (f.endsWith(".js") || f.endsWith(".mjs")) {
      const kb = Math.ceil(fs.statSync(path.join(dist, f)).size/1024);
      if (kb > budgetKB) offenders.push({file:f,kb});
    }
  }
}
const out = { gate_id:"G-FE-BUNDLE-BUDGET", status: offenders.length? "FAIL":"PASS",
  metrics:{ offenders: offenders.length, budget_kb: budgetKB }, artifacts:[`${dist}/**`],
  timestamp:new Date().toISOString(), reason: offenders.length? "bundle_exceeds":"ok", offenders };
fs.mkdirSync("reports/gates",{recursive:true});
fs.writeFileSync("reports/gates/G-FE-BUNDLE-BUDGET.summary.json", JSON.stringify(out,null,2));
process.exit(offenders.length?1:0);
