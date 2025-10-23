# Web Store — Scope & Guards Bundle (Single MD)

- Generated: 2025-10-22T21:35:44Z


## روابط مباشرة

- **SCOPE.md**: [فتح](sandbox:/mnt/data/audit_run/webstore/docs/orchestrator/SCOPE.md)
- **gates_scope.json**: [فتح](sandbox:/mnt/data/audit_run/webstore/settings/specs/gates_scope.json)
- **IMPLEMENT_NOW.md**: [فتح](sandbox:/mnt/data/audit_run/webstore/docs/orchestrator/IMPLEMENT_NOW.md)
- **.env.example**: [فتح](sandbox:/mnt/data/audit_run/webstore/.env.example)
- **perf/lhci.json**: [فتح](sandbox:/mnt/data/audit_run/webstore/perf/lhci.json)
- **perf/pa11y.json**: [فتح](sandbox:/mnt/data/audit_run/webstore/perf/pa11y.json)
- **reports/headers/staging.sample.json**: [فتح](sandbox:/mnt/data/audit_run/reports/headers/staging.sample.json)
- **scripts/headers/snapshot_stage.sh**: [فتح](sandbox:/mnt/data/audit_run/webstore/scripts/headers/snapshot_stage.sh)
- **الحِزمة المجمعة**: [تحميل](sandbox:/mnt/data/audit_run/outputs/scope-pack-20251022T2131Z.zip)


## SCOPE.md

# SCOPE — Web Store (No payments, No mobile)
Timestamp: 2025-10-22T21:31:41Z

## Required Gates
- G-SEC-SECRETS — أسرار=0.
- G-HEADERS — CSP/CORS/HSTS سليمة.
- G-COOKIE-SESSION — أعلام Secure+HttpOnly+SameSite للكوكيز.
- G-FE-BUNDLE-BUDGET — أحجام الحزم ضمن الميزانية.
- G-FE-CACHE-CONTROL — للصفحات المحمية فقط (حساب/عربة/خروج).
- G-FE-A11Y — WCAG 2.2 AA، critical=0.
- G-WEB-VITALS-BUDGETS — LCP≤2.5s، INP≤200ms على Stage.
- G-CONFIG-REQUIRED — .env.example يحوي APP_ENV, APP_URL.

## N/A (غير منطبق الآن)
- G-API-* / Parity / OpenAPI — لا Backend مملوك.
- G-PAY-* — لا دفع.
- Mobile Store/ATT — لا تطبيقات.
- Observability: G-BURN-RATE-FREEZE — لا نظام مراقبة مُفعّل.
- Release Hygiene: G-RELEASE-ROLLBACK-FRESH — لا نشر آلي.
- Exceptions: G-EXCEPTIONS-VALID — لا استثناءات قائمة.
- Privacy Logs: G-PII-LOGS — لا سجلات خادمية. إن وجدت لاحقًا يصبح Required.
- i18n: G-FE-I18N-COVERAGE — N/A إن كان المتجر أحادي اللغة.

## Conditional
- i18n يصبح Required عند توفر أكثر من لغة.
- G-FE-CACHE-CONTROL Required عند وجود صفحات محمية.



## gates_scope.json

```json
{
  "timestamp": "2025-10-22T21:31:41Z",
  "profile": "web-store-minimal",
  "required_gates": [
    "G-SEC-SECRETS",
    "G-HEADERS",
    "G-COOKIE-SESSION",
    "G-FE-BUNDLE-BUDGET",
    "G-FE-CACHE-CONTROL",
    "G-FE-A11Y",
    "G-WEB-VITALS-BUDGETS",
    "G-CONFIG-REQUIRED"
  ],
  "na_gates": [
    "G-API-*",
    "G-PAY-*",
    "G-STORE-*",
    "G-BURN-RATE-FREEZE",
    "G-RELEASE-ROLLBACK-FRESH",
    "G-EXCEPTIONS-VALID",
    "G-PII-LOGS",
    "G-FE-I18N-COVERAGE"
  ],
  "conditional": {
    "G-FE-I18N-COVERAGE": "Require if multi-language",
    "G-FE-CACHE-CONTROL": "Require if protected pages exist"
  }
}
```


## IMPLEMENT_NOW.md

# IMPLEMENT-NOW — لإغلاق 100%
1) تنظيف الأسرار → شغّل G-SEC-SECRETS.
2) التقاط الرؤوس: `bash scripts/headers/snapshot_stage.sh $STAGE_URL` ثم شغّل G-HEADERS وG-COOKIE-SESSION وG-FE-CACHE-CONTROL.
3) الأداء: شغّل Lighthouse/Pa11y باستخدام perf/*.json وارفع التقارير.
4) إنشاء build وتشغيل G-FE-BUNDLE-BUDGET.
5) `.env.example` موجود؛ أضف أي مفاتيح أخرى لازمة.
6) علّم N/A بحسب `settings/specs/gates_scope.json`.



## .env.example

APP_ENV=production
APP_URL=https://staging.example.tld



## perf/lhci.json

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "url": [
        "https://staging.example.tld/"
      ],
      "settings": {
        "preset": "desktop"
      }
    },
    "assert": {
      "assertions": {
        "largest-contentful-paint": [
          "error",
          {
            "maxNumericValue": 2500
          }
        ],
        "interactive": [
          "warn",
          {
            "maxNumericValue": 3500
          }
        ]
      }
    }
  }
}
```


## perf/pa11y.json

```json
{
  "defaults": {
    "standard": "WCAG2AA",
    "timeout": 60000,
    "hideElements": ".cookie, .ads"
  },
  "urls": [
    "https://staging.example.tld/",
    "https://staging.example.tld/checkout"
  ]
}
```


## reports/headers/staging.sample.json

```json
[
  {
    "url": "https://staging.example.tld/",
    "headers": {
      "content-security-policy": "default-src 'self'",
      "access-control-allow-origin": "",
      "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
      "set-cookie": "sid=REDACTED; Path=/; Secure; HttpOnly; SameSite=Lax",
      "cache-control": "no-store"
    }
  }
]
```


## scripts/headers/snapshot_stage.sh

```bash
#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-https://staging.example.tld}"
mkdir -p reports/headers
urls=("$BASE/" "$BASE/account" "$BASE/cart")
jq -n '[]' > reports/headers/staging.json
for u in "${urls[@]}"; do
  out=$(curl -s -D - -o /dev/null "$u" | tr -d '\r')
  csp=$(echo "$out" | awk -F': ' 'tolower($1)=="content-security-policy"{print $2}' | tail -n1)
  cors=$(echo "$out" | awk -F': ' 'tolower($1)=="access-control-allow-origin"{print $2}' | tail -n1)
  hsts=$(echo "$out" | awk -F': ' 'tolower($1)=="strict-transport-security"{print $2}' | tail -n1)
  setc=$(echo "$out" | awk -F': ' 'tolower($1)=="set-cookie"{print $2}' | tail -n1)
  cc=$(echo "$out" | awk -F': ' 'tolower($1)=="cache-control"{print $2}' | tail -n1)
  jq --arg url "$u" --arg csp "$csp" --arg cors "$cors" --arg hsts "$hsts" --arg setc "$setc" --arg cc "$cc"      '. += [{{"url":$url,"headers":{{"content-security-policy":$csp,"access-control-allow-origin":$cors,"strict-transport-security":$hsts,"set-cookie":$setc,"cache-control":$cc}}}}]'      reports/headers/staging.json > reports/headers/tmp.json
  mv reports/headers/tmp.json reports/headers/staging.json
done
echo "OK → reports/headers/staging.json"

```