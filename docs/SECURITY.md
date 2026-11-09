# INKLOOM AI — Security & Threat Modeling Specification

## 1. Security Invariants

INKLOOM AI enforces five non-negotiable security invariants across all operational tiers:
1. **Zero Secret Leakage**: No secret tokens, database service role keys, or Gemini API keys are ever bundled into client-side JavaScript or returned in API responses.
2. **Mandatory Authenticated Identity**: Every protected endpoint requires a cryptographically valid HS256 JSON Web Token signed with a high-entropy secret.
3. **Role-Based Authorization (RBAC)**: Route permissions are enforced server-side; client UI role state is treated as purely cosmetic.
4. **Conflict-of-Interest Prevention**: Authors are physically blocked by server domain logic from approving their own submissions (`SELF_APPROVAL_FORBIDDEN`).
5. **Immutable Audit Trail**: Audit logs and human approval records cannot be mutated or deleted by any user or administrator.

---

## 2. Authentication Architecture

- **Password Storage**: User passwords are encrypted using `bcryptjs` with 12 salt rounds before persisting to Supabase PostgreSQL.
- **Session Tokens**: Authentication issues signed HS256 JWTs containing `userId`, `orgId`, and `role`. Tokens expire after 2 hours.
- **Client Storage**: Tokens are stored exclusively in browser `sessionStorage`, mitigating persistence across browser restarts and isolating tokens from cross-origin tabs.
- **Token Verification**: Middleware validates the JWT signature, expiration, and looks up the live user record from the database to ensure deactivated users are instantly denied access (`403 Forbidden`).
- **Enumeration Defense**: Failed login requests return identical generic error messages (`"Invalid email or password"`) for both incorrect passwords and non-existent email addresses.

---

## 3. Role-Based Access Control (RBAC) Matrix

| Endpoint Group | Method | Admin | Creator | Reviewer | Viewer |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Auth & Me** | `GET /api/auth/me` | ✅ | ✅ | ✅ | ✅ |
| **Brand Profile Edit** | `PATCH /api/brand-profiles/:id` | ✅ | ❌ | ❌ | ❌ |
| **Guidelines & Facts** | `POST /api/brand-profiles/:id/*` | ✅ | ❌ | ❌ | ❌ |
| **User Management** | `GET / POST / PATCH /api/users` | ✅ | ❌ | ❌ | ❌ |
| **Create Submission** | `POST /api/submissions` | ✅ | ✅ | ❌ | ❌ |
| **Run Analysis** | `POST /api/submissions/:id/analyse` | ✅ | ✅ | ❌ | ❌ |
| **Edit / Save Version** | `POST /api/submissions/:id/versions` | ✅ | ✅ | ❌ | ❌ |
| **Send for Review** | `POST /api/submissions/:id/send-for-review` | ✅ | ✅ | ❌ | ❌ |
| **Review Queue** | `GET /api/review-queue` | ✅ | ❌ | ✅ | ❌ |
| **Approve / Request Changes** | `POST /api/versions/:id/decision` | ✅* | ❌ | ✅* | ❌ |
| **Audit Logs** | `GET /api/audit-logs` | ✅ | ❌ | ❌ | ❌ |
| **Governance Analytics** | `GET /api/analytics/summary` | ✅ | ✅ | ✅ | ✅ |

*\*Subject to the Anti-Self-Approval Guard: Reviewers and Admins cannot approve submissions they authored.*

---

## 4. Specific Governance Guards

### 4.1 Anti-Self-Approval Guard
- **Rule**: If `submission.creator_id === req.auth.userId`, any approval or change request decision on any version of that submission is rejected.
- **HTTP Response**: `403 Forbidden`
- **Error Code**: `self_approval_forbidden`
- **Audit Action**: Security alert event logged to `audit_logs`.

### 4.2 Unresolved High-Severity Findings Guard
- **Rule**: A submission version cannot transition to `in_review` if any high-severity finding has `status: 'pending'`.
- **Requirement**: The creator must either accept the suggested fix, provide an edited text replacement, or explicitly dismiss the finding with a justification of at least 5 characters.
- **HTTP Response**: `409 Conflict`
- **Error Code**: `unresolved_high_findings`

### 4.3 Last-Admin Protection Guard
- **Rule**: An administrator cannot deactivate their own account or demote their role if they are the sole remaining active administrator in the organisation.
- **HTTP Response**: `409 Conflict`
- **Error Code**: `last_admin_protection`

---

## 5. Injection & Attack Mitigation

| Threat Vector | Mitigation Strategy |
| :--- | :--- |
| **Prompt Injection** | Deterministic regex intercepts instruction-override patterns (`ignore instructions`, `approve draft`). LLM output is filtered through the Validation Gate. |
| **LLM Hallucination** | Validation Gate drops any finding where `excerpt` does not appear verbatim in draft or cites an unsupplied reference code. |
| **SQL Injection** | All repository operations use parameterized queries or Supabase client query builders; zero raw string SQL interpolation. |
| **Cross-Site Scripting (XSS)** | React automatic JSX escaping, Helmet security headers, sanitized text rendering. |
| **Brute-Force & Denial of Service** | Express rate limiters applied to `/api/auth/login` (max 10 requests per 15 min) and `/api/submissions/:id/analyse`. |
| **Secret Exfiltration** | Production startup check verifies `JWT_SECRET` length (≥32 chars). Working tree contains zero `.env` files. |

---

## 6. Audit Trail Immutability

Every significant administrative and governance action generates an append-only event in the `audit_logs` table:
- Actor ID, User IP hash, and User Agent
- Action type (`login`, `submission_created`, `analysis_run`, `decision_approved`, `user_created`, etc.)
- Entity type, Entity ID, and change metadata
- PostgreSQL database triggers prevent `UPDATE` or `DELETE` operations on `audit_logs` and `approval_records`.
