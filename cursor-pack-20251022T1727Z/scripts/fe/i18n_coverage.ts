#!/usr/bin/env ts-node
import fs from "fs";
const basePath = process.env.I18N_BASE || "web/i18n/en.json";
const arPath   = process.env.I18N_AR   || "web/i18n/ar.json";
let status="FAIL", missing=0, reason="missing_files";
try {
  const base = JSON.parse(fs.readFileSync(basePath,"utf8"));
  const ar   = JSON.parse(fs.readFileSync(arPath,"utf8"));
  const keys = Object.keys(base);
  missing = keys.filter(k => ar[k] === undefined).length;
  status = missing===0 ? "PASS":"FAIL";
  reason = missing? "missing_keys":"ok";
} catch(e) { /* keep FAIL */ }
const out = { gate_id:"G-FE-I18N-COVERAGE", status, metrics:{ missing }, artifacts:[basePath,arPath],
  timestamp:new Date().toISOString(), reason };
fs.mkdirSync("reports/gates",{recursive:true});
fs.writeFileSync("reports/gates/G-FE-I18N-COVERAGE.summary.json", JSON.stringify(out,null,2));
process.exit(status==="PASS"?0:1);
