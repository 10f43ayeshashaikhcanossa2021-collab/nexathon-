# INKLOOM AI
### Reference-Grounded Brand Governance & Content Intelligence Platform

> **"Check every draft against what your company has actually approved. Explain every issue. Suggest a fix. Let a human make the final call."**

INKLOOM AI sits between *"draft written"* and *"content published"*. A creator submits a draft; the platform retrieves the organisation's active guidelines, approved facts, and terminology; each issue comes back with the exact excerpt, reason, cited reference code, and a minimal suggested fix; a human manager then approves the version or requests changes. **Nothing is approved on the AI's word.**

---

## 🏛️ Architecture Overview

INKLOOM AI is built as a full-stack, reference-grounded governance system:

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│   React 19 SPA + Tailwind CSS + Lucide + JWT Session Auth   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON (Bearer JWT)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Express TypeScript Backend                  │
│  - Helmet + CORS + Rate Limiting                            │
│  - HS256 JWT Authentication & RBAC (Admin, Creator, Review) │
│  - Domain Status Machines & Self-Approval Prevention Guard  │
│  - Mammoth Word (.docx) & Plain Text (.txt) Extraction     │
│  - Append-Only Audit Logging & Server-Side Security         │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────┐  ┌────────────────────────────┐
│   AI Governance Pipeline    │  │    Supabase PostgreSQL     │
│  - Generic Fact Checking    │  │  - 15 Relational Tables    │
│  - Dynamic Rule Verification│  │  - Row Level Security (RLS)│
│  - Validation Gate Defense  │  │  - Append-Only Triggers    │
│  - Server-Side Gemini API   │  │  - Org Scoping & Isolation │
└─────────────────────────────┘  └────────────────────────────┘
```

---

## ⚡ Seed Demo Credentials (Password: `Password123!`)

All seed users are pre-configured with secure bcrypt password hashes (cost 12) in the Supabase PostgreSQL database. Quick-login persona buttons are provided on the login page for evaluator convenience.

| Persona | Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Maya Rao** | `admin` | `admin@lumora.test` | `Password123!` | Brand Hub, Guidelines, Fact Registry, User Management, Audit Logs |
| **Ishaan Verma** | `creator` | `creator@lumora.test` | `Password123!` | Create Submissions, Upload Docs, AI Analysis, Revision Workspace |
| **Neil D'Souza** | `reviewer` | `reviewer@lumora.test` | `Password123!` | Review Queue, Visual Diff, Compliance Checklist, Approve / Request Changes |
| **Anita Joshi** | `reviewer` | `reviewer2@lumora.test` | `Password123!` | Secondary Reviewer for dual-signoff and conflict-of-interest checks |
| **Kavita Iyer** | `viewer` | `viewer@lumora.test` | `Password123!` | Read-only access to Governance Analytics and Approved Brand Assets |

---

## 🔑 Environment Variables

INKLOOM AI uses zero secrets in client bundles. All external keys and database credentials reside exclusively on the server.

| Variable | Description | Required | Default / Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Local server port for Express & Vite | No | `3000` |
| `APP_URL` | Application base URL | No | `http://localhost:3000` |
| `JWT_SECRET` | Secret key used to sign HS256 JWTs (min 32 chars) | Yes (in prod) | Configured in server env |
| `JWT_EXPIRES_IN` | Token expiration window | No | `2h` |
| `SUPABASE_URL` | Supabase project URL | Yes | `https://slsqtsnlsdxwbhfazbax.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) | Yes | Server environment secret |
| `GEMINI_API_KEY` | Google Gemini API key for analysis pipeline | Optional | Server environment secret |
| `GEMINI_MODEL` | Gemini model alias | No | `gemini-2.5-flash` |
| `VITE_API_BASE` | Client API endpoint prefix | No | `/api` |

---

## 🚀 Commands & Verification

```bash
# Start development server (serves API & React frontend on port 3000)
npm run dev

# Run automated test suite (23 unit & integration tests across 6 files)
npm test

# Run honest split evaluation runner (dev vs holdout splits with F1)
npm run eval

# Verify all 33 REST API contract endpoints against server router
npm run contract:check

# Run database migrations
npm run db:migrate

# Seed database with Lumora demo organisation & initial rules
npm run db:seed

# Production build and bundle check
npm run build
```

---

## 🛡️ Responsible AI & Honest Limitations

1. **Human-in-the-Loop Governance**: The AI system **never approves content**. Approval is an exclusive human action recorded in the immutable `approval_records` table with reviewer credentials and timestamps.
2. **Conflict of Interest Guard**: Authors (creators and admins alike) are strictly forbidden from approving submissions they authored (`403 Forbidden`).
3. **Validation Gate**: All findings generated by the LLM pass through an automated validation gate that discards any findings where the excerpt does not match the draft verbatim or cites unsent reference codes.
4. **Honest Evaluation**: Benchmark metrics report separate `dev` (16 cases) and `holdout` (14 cases) splits with Precision, Recall, and F1. Small demonstration testset results are clearly labelled as demonstration benchmarks without fabricated 100% claims.
5. **Zero-Key Heuristic Mode**: If `GEMINI_API_KEY` is omitted, the engine executes deterministic rule and fact checks locally without crashing, clearly displaying an "AI analysis unavailable" status banner.
6. **Social Publishing Simulation**: Social media publishing and scheduling features are clearly marked as simulated sandboxes with real character limits.
7. **Document Ingestion**: Supports `.docx` and `.txt` files; uploading unsupported binary formats like `.pdf` returns a clear HTTP 415 response.
