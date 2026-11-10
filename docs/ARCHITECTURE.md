# INKLOOM AI — System Architecture Specification

## 1. Executive Summary

INKLOOM AI is an enterprise-grade brand governance and content intelligence platform designed to bridge the gap between creative draft drafting and publication. Unlike unconstrained generative AI tools that hallucinate claims or attempt autonomous approval, INKLOOM AI operates under strict deterministic reference-grounding: drafts are verified against an organisation's approved brand guidelines, verified facts, and terminology. The platform enforces human-in-the-loop decision-making with multi-tier role-based access control (RBAC), self-approval prevention, and an immutable append-only audit trail.

---

## 2. End-to-End System Topology

```mermaid
graph TD
    subgraph Client ["Client Browser Tier (React 19 + Tailwind CSS)"]
        UI[App Shell & Views]
        AuthContext[Session & Auth State]
        ApiClient[Authenticated HTTP Client]
        LoomLines[SVG Thread Lines Engine]
    end

    subgraph Server ["Server Tier (Node.js + Express + TypeScript)"]
        SecMW[Helmet, CORS, Rate Limiters]
        AuthMW[JWT Verification & Fresh DB Lookup]
        RBAC[Role Authorization Guard (Admin, Creator, Reviewer, Viewer)]
        DomainEngine[Status Machine & Self-Approval Guard]
        Mammoth[Mammoth .docx & .txt Text Extractor]
    end

    subgraph AI ["AI & Evaluation Tier"]
        RefRetrieval[Dynamic Reference Retriever (max 20 refs)]
        Deterministic[Deterministic Rule & Fact Verifier]
        Gemini[Google Gemini 2.5 Flash API]
        ValGate[Validation Gate: Verbatim Excerpt & Quota Checker]
    end

    subgraph Data ["Persistence Tier (Supabase PostgreSQL)"]
        PG[(PostgreSQL 15 Tables)]
        RLS[Row Level Security & Org Scoping]
        Triggers[Immutability & Append-Only Audit Triggers]
    end

    UI --> AuthContext
    AuthContext --> ApiClient
    ApiClient -->|HTTP JSON + Bearer JWT| SecMW
    SecMW --> AuthMW
    AuthMW --> RBAC
    RBAC --> DomainEngine
    DomainEngine --> Mammoth
    DomainEngine --> RefRetrieval
    RefRetrieval --> Deterministic
    RefRetrieval --> Gemini
    Gemini --> ValGate
    Deterministic --> ValGate
    ValGate --> DomainEngine
    DomainEngine --> RLS
    RLS --> PG
    PG --> Triggers
```

---

## 3. Tier Breakdown

### 3.1 Client Tier (Browser)
- **Framework**: React 19 SPA running on Vite 8.
- **Styling**: Tailwind CSS v4 design tokens.
- **State Management**: React state hooks (`useState`, `useEffect`, `useCallback`) with persistent session management via browser `sessionStorage`.
- **Loom Motif Visual Engine**: Interactive SVG curved thread lines dynamically connecting detected issue cards to verbatim text highlights in the editorial paper sheet.
- **Zero Secrets**: Client bundle contains zero API keys or backend connection strings. All requests route through `/api/*` with `Authorization: Bearer <jwt>`.

### 3.2 Backend Tier (Express on Node.js)
- **Entry Point**: `server.ts` running Express 4 on port 3000.
- **Security Middlewares**:
  - `helmet`: Secure HTTP headers (CSP, frameguard, XSS protection).
  - `cors`: Restricted cross-origin resource sharing.
  - `express-rate-limit`: Rate limiting on auth endpoints (max 10 requests per 15 minutes per IP) and analysis endpoints.
- **Authentication**:
  - Password hashing using `bcryptjs` with cost factor 12.
  - Signed HS256 JWT tokens with secret key validation (`JWT_SECRET` min 32 chars).
  - User session verified against fresh database record on every protected request.
- **Domain Logic & Governance Guards**:
  - **Self-Approval Guard**: Returns HTTP 403 Forbidden with code `SELF_APPROVAL_FORBIDDEN` if a creator or admin attempts to approve their own submission.
  - **Unresolved High Findings Guard**: Returns HTTP 409 Conflict if high-severity findings have not been accepted or dismissed with rationale before sending for review.
  - **Comment Length Enforcement**: Approvals require ≥5 characters; change requests require ≥10 characters.
  - **Last-Admin Protection**: Demoting or deactivating the last active administrator returns HTTP 409 Conflict.
  - **Document Extraction**: `.docx` handled via `mammoth`, `.txt` via utf-8 decoder; unsupported binary formats like `.pdf` return HTTP 415 with descriptive messaging.

### 3.3 AI Governance & Validation Tier
- **Pipeline Orchestrator**: `src/services/aiPipeline.ts`.
- **Dynamic Reference Retrieval**: Automatically indexes brand guidelines, approved facts, and terminology without hardcoded brand strings, selecting the top 20 most relevant references based on lexical draft overlap.
- **Deterministic Checking Engine**:
  - Parses facts for numbers, units (e.g. GB, rupees, % APY), and bounds.
  - Detects terminology violations using case-sensitive and case-insensitive boundary regexes.
  - Flags prompt injection attempts (`ignore all instructions`, `approve this draft`) as high-severity security violations (`SEC-01`).
- **Validation Gate (`runValidationGate`)**:
  - Excerpt Verification: Verifies that the LLM's cited excerpt exists verbatim in the draft at specified offsets.
  - Reference Code Check: Confirms that the cited reference was actually provided in the retrieval context.
  - Category Taxonomy Validation: Enforces allowed category codes (`fact_conflict`, `unsupported_claim`, `rule_violation`, etc.).
  - Fix Length Bounds: Discards suggestions attempting full-document rewriting (>3x excerpt length).
- **Graceful Fallback Mode**: If Gemini API is unreachable or key is missing, the engine executes deterministic checks and flags `ai_status: 'fallback'`.

### 3.4 Automated Image Brand Checking & Computer Vision Tier
- **Engine**: `src/services/imageAnalysisEngine.ts` & `src/components/AutomatedBrandVisualCheck.tsx`.
- **Perceptual Color Science (CIE Delta E 2000)**:
  - Converts sRGB color stops to linear RGB, CIE XYZ (D65 illuminant), and CIE L*a*b*.
  - Implements the complete CIE $\Delta E_{2000}$ formula with chroma weighting $S_C$, hue rotation term $R_T$, and luminance compensation $S_L$ to calculate human-perceptible color difference.
  - Automatically identifies dominant color clusters and benchmarks against the approved brand palette tokens (`#0B1B3A`, `#139A93`, `#FBFAF7`, `#FFFFFF`, `#E65100`).
  - Distinguishes acceptable tint variations ($\Delta E \le 4.0$) from off-brand color violations ($\Delta E > 6.0$).
- **Logo Detection & Geometric Distortion Engine**:
  - Compares detected logo regions against approved vector and bitmap logos in Brand Hub (`brand_assets`).
  - Detects non-uniform scaling, aspect ratio skew (e.g. 1.48:1 vs approved 1.00:1), and horizontal/vertical stretch factors.
  - Identifies unapproved logo color variations, gradient fills, and missing mandatory brand marks.
  - Generates pixel/percentage bounding boxes (`region: { x, y, width, height }`) for interactive visual overlay highlighting on uploaded creative designs.
- **Multimodal AI Vision Support**:
  - Automatically harnesses `@google/genai` with `gemini-3.8-flash` on the server when `GEMINI_API_KEY` is present.
  - Gracefully falls back to high-precision local computer vision and Delta E algorithms when running offline or in restricted environments.
- **Human-in-the-Loop Visual Confirmation**:
  - Reviewers can confirm issues (`confirmed`), mark false positives (`false_positive`), or flag items needing correction (`needs_correction`).
  - Preserves existing manual logo overlay comparison slider and visual compliance checklists.

### 3.5 Data Tier (Supabase PostgreSQL)
- **Database Engine**: Hosted PostgreSQL instance at `https://slsqtsnlsdxwbhfazbax.supabase.co`.
- **15 Structured Relational Tables**:
  1. `organisations`
  2. `users`
  3. `brand_profiles`
  4. `brand_guidelines`
  5. `approved_facts`
  6. `terminology_items`
  7. `brand_assets`
  8. `content_submissions`
  9. `content_versions`
  10. `analysis_reports`
  11. `detected_issues`
  12. `suggestions`
  13. `review_comments`
  14. `approval_records`
  15. `audit_logs`
- **Security & Integrity**:
  - Row Level Security (RLS) policies scoped by `org_id`.
  - Database-level triggers preventing updates or deletes on `audit_logs` and `approval_records`.
  - Foreign key constraints with cascading logic for child records.

---

## 4. Multi-Tenant Organization Isolation

All data queries are strictly scoped to the authenticated user's `org_id`. Cross-tenant data leakage is prevented at both the application repository layer and PostgreSQL RLS layer. Demo records are isolated with `is_demo = true` flags to prevent corruption of production data.
