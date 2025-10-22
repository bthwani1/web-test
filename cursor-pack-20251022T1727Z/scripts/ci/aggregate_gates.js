#!/usr/bin/env node
import fs from "node:fs";
import glob from "glob";
const summaries = glob.sync("reports/gates/*.summary.json").map(p => JSON.parse(fs.readFileSync(p, "utf8")));
const violations = summaries.filter(s => s.status === "FAIL").map(s => ({ gate_id: s.gate_id, reason: s.reason||"unknown", metrics: s.metrics||{} }));
const pick = (id, key, def) => { const g = summaries.find(s => s.gate_id===id); return g && g.metrics && g.metrics[key]!==undefined ? g.metrics[key] : def; };
const flag = (id, reason) => { const g = summaries.find(s => s.gate_id===id); return g && g.status==="FAIL" && (g.reason===reason || !g.reason); };
const input = {
  perf: { web_lcp_p75_ms: pick("G-WEB-VITALS-BUDGETS","lcp_p75_ms", 99999), web_inp_p75_ms: pick("G-WEB-VITALS-BUDGETS","inp_p75_ms", 99999) },
  a11y: { critical: pick("G-FE-A11Y","critical",0), score: pick("G-FE-A11Y","score",1) },
  contracts: { consistency: pick("G-API-OAS-CONSISTENCY","consistency", 0), parity_gap: pick("G-API-OAS-CONSISTENCY","parity_gap", 100), routes_dup: pick("G-API-ROUTES-UNIQ","duplicates", 0) },
  security: { secrets_found: pick("G-SEC-SECRETS","count",0), csp_has_unsafe: pick("G-HEADERS","csp_unsafe", false), cors_allowlist_ok: !flag("G-HEADERS","cors_violation"), hsts_ok: !flag("G-HEADERS","hsts_missing") },
  privacy: { pii_in_logs: pick("G-PII-LOGS","files_with_pii",0) }
};
fs.mkdirSync("reports/gates",{recursive:true});
fs.writeFileSync("reports/gates/aggregate.json", JSON.stringify({ ok: violations.length===0, violations }, null, 2));
fs.writeFileSync("reports/gate_input.json", JSON.stringify(input, null, 2));
console.log(JSON.stringify({ ok: violations.length===0, violations }, null, 2));
