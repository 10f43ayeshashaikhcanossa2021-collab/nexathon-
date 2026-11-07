# INKLOOM AI
### Brand Governance and Content Intelligence Platform

> **"Check every draft against what your company has actually approved. Explain every issue. Suggest a fix. Let a human make the final call."**

INKLOOM AI sits between *"draft written"* and *"content published"*. A creator submits a draft; the platform checks it against the organisation's own approved guidelines, facts, and terminology; each issue comes back with the exact excerpt, a reason, the rule or fact behind it, and a minimal suggested fix; a human manager then approves the version or requests changes. **Nothing is approved on the AI's word.**

---

## ⚡ Seed Demo Credentials (Part H)

All data is fictional and flagged *Demo data* in the application.

| Name | Role | Email | Password (demo only) | Main Screens |
| :--- | :--- | :--- | :--- | :--- |
| **Maya Rao** | `admin` | `admin@lumora.test` | `Admin@12345` | Brand Hub, Guidelines, Users, Analytics |
| **Ishaan Verma** | `creator` | `creator@lumora.test` | `Creator@12345` | Submission, Results, Correction, History |
| **Zoya Khan** | `creator` | `creator2@lumora.test` | `Creator@12345` | Submission, Results, Team Drafts |
| **Neil D'Souza** | `reviewer` | `reviewer@lumora.test` | `Reviewer@12345` | Review Queue, Approval Details, Diff |
| **Anita Joshi** | `viewer` | `viewer@lumora.test` | `Viewer@12345` | Governance Analytics, Audit Logs (read-only) |

*Tip: You can switch between any of these personas with 1 click directly in the bottom-left sidebar of the running app!*

---

## 🎯 3-Minute Demo Script (Part L.1)

1. **Admin Knowledge Inspection (Maya Rao)**:
   - Navigate to **Brand Hub** and **Guidelines & Facts**.
   - Show voice notes, brand palette tokens (`#0B1B3A`, `#139A93`, `#3E5C8A`), F-12 (50 GB storage), G-15 (superlatives ban), T-04 (use "members", avoid "customers"), and the Expired badge on F-14.
2. **Draft Submission (Ishaan Verma)**:
   - Click "New Draft" (or click "Reference Scenario Quick Launch" on the dashboard).
   - Pastes the Lumora test draft:
     > *"Lumora Pro gives all customers unlimited cloud storage and is the number one rated fitness app!!!"* (image attached without alt text)
   - Click **Submit for Analysis**. Watch the 4-step progress verification.
3. **AI Results & Thread Lines**:
   - On the Results page, hover over findings:
     - Notice the **curved teal thread lines** dynamically drawn from the card to the highlighted excerpt in the paper sheet!
     - Click **F-12** chip to inspect approved spec popover.
     - Note the difference between **VERIFIED CONFLICT** (contradicts approved fact) and **NO APPROVED SOURCE** (unsupported claim).
4. **Correction Workspace**:
   - Accept the term replacement (`customers` -> `members`).
   - Accept the fact correction (`unlimited cloud storage` -> `50 GB of workout-video storage`).
   - Accept removal of unverified ranking claim.
   - Accept reduction of `!!!` to `!`.
   - Toggle **Corrected Preview**: inspect the generated reference revision:
     > *"Lumora Pro gives all members 50 GB of workout-video storage!"*
   - Click **Save as v2**, then **Send for Review**.
5. **Reviewer Decision & Visual Compare (Neil D'Souza)**:
   - Switch user to reviewer Neil D'Souza.
   - Open **Review Queue**: see the submission sorted at the top.
   - Open **Approval Details**:
     - Inspect the **Visual Compare** tab: side-by-side logo comparison, interactive overlay blend slider, and reviewer compliance checklist.
     - Verify self-approval guard prevents creators from approving their own work.
     - Enter approval comment and click **Approve Version**.
6. **Governance Analytics & "Rules That May Be Unclear"**:
   - Open **Governance Analytics**: see live chart distributions, approvals vs requests, and the **"Rules That May Be Unclear"** table (flagging G-02 and G-11 with high dismissal rates and creator reasons).
   - Inspect **Audit Trail** showing immutable append-only events.
7. **Labelled Benchmark Runner (TS-01 to TS-08)**:
   - Click **Labelled Test Runner** in the sidebar to benchmark accuracy across all 8 test cases, including the clean control (TS-02) and prompt injection test (TS-08).

---

## 🛠️ Quickstart

Run in development mode:
\`\`\`bash
npm run dev
\`\`\`
The application starts at `http://localhost:3000`.

To run the automated benchmark suite:
\`\`\`bash
npm run eval
\`\`\`

---

## 🔒 Responsible AI & Honest Limitations (Part I)

- **AI Never Approves**: No code path exists where the AI sets status to Approved. Approval requires a recorded human decision.
- **Reference-Grounded**: The AI compares drafts ONLY against backend-supplied references.
- **Honest Uncertainty**: Differentiates between *Verified Conflict* (contradicts an approved fact) and *Unsupported Claim* (no approved source exists).
- **Zero-Key Heuristic Mode**: Runs 100% offline with zero external API keys using deterministic code rules, and seamlessly engages Gemini when `GEMINI_API_KEY` is present.
