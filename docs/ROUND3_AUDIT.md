# INKLOOM AI — Round 3 Audit Verification Report

Re-verifying the 10 audit findings from Round 3 Improvement 1 against the codebase:

| # | Finding (Evidence from Codebase) | Verified Status | File & Line Reference | Severity |
| :-: | :--- | :---: | :--- | :---: |
| **1** | `server/db/repos.ts` holds data in module-level arrays (`let users = [...]`, `let submissions = []`). Supabase only checked in `checkHealth()`. Data resets on restart. | **CONFIRMED** | `server/db/repos.ts:15-35` | **Critical** |
| **2** | `src/api/client.ts` historically relied on local storage / store fallbacks; UI actions could bypass server guards. | **CONFIRMED** | `src/api/client.ts:35-180` | **Critical** |
| **3** | `db/migrate.ts` lists migration files but does not execute parameterized SQL via a `pg` pool; failures could report silent success. | **CONFIRMED** | `db/migrate.ts:20-50` | **High** |
| **4** | SQL schema uses UUID primary keys, while seed and in-memory IDs use text strings like `org-lumora-001`. | **CONFIRMED** | `db/migrations/001_init.sql:10`, `db/seed.ts:18` | **High** |
| **5** | RLS enabled on tables but lacks server GUC policy enforcement (`app.current_org`), relying on application-layer scoping. | **CONFIRMED** | `db/migrations/003_rls.sql:1-40` | **High** |
| **6** | `PATCH /api/suggestions/:id` looks up suggestion without strict `org_id` parameter, creating potential cross-org IDOR. | **CONFIRMED** | `server.ts:740`, `server/db/repos.ts:290` | **High** |
| **7** | `server/auth.ts` lacked database-backed session revocation table (`auth_sessions`), account lockout on 5 failed attempts, and token versioning. | **CONFIRMED** | `server/auth.ts:26-38` | **High** |
| **8** | `src/services/supabase.ts` contained hardcoded project fallback and anon key, violating the browser-server trust boundary. | **CONFIRMED** | `src/services/supabase.ts:1-25` | **High** |
| **9** | Social endpoints and comment endpoints lacked granular permission matrix checking (e.g. viewer write blocking). | **CONFIRMED** | `server.ts:965, 1109-1119` | **Medium** |
| **10** | Seed dataset had missing or unverified viewer persona (`Kavita Iyer`, `viewer@lumora.test`) in certain execution paths. | **CONFIRMED** | `db/seed.ts:80-90` | **Medium** |
