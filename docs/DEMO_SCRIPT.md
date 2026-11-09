# INKLOOM AI — Master Demo Walkthrough Script

Follow these steps to demonstrate the complete, reference-grounded governance workflow in under 4 minutes.

---

### Step 1: Secure Authentication & Brand Knowledge Hub (Admin Maya Rao)
1. **Login Page**:
   - Navigate to `http://localhost:3000`.
   - Point out the secure login interface supporting email/password or 1-click verified demo persona buttons.
   - Click **Maya Rao (Admin)**: logs in securely via bcrypt verification and receives an HS256 JWT.
2. **Brand Hub & Reference Registry**:
   - Click **Brand Hub** in the sidebar:
     - Review the 4 count tiles: 16 Guidelines, 14 Approved Facts, 8 Terminology rules, 2 Assets.
     - Note the 5 brand palette tokens (`#0B1B3A`, `#139A93`, `#3E5C8A`, `#E8F5F5`, `#FBFAF7`).
   - Switch to **Guidelines & Facts**:
     - Inspect **F-12**: "Lumora Pro includes 50 GB of workout-video storage".
     - Inspect **F-14**: Notice the **Expired** status badge (Spring discount offer has ended).
     - Inspect **T-04**: Preferred term "members"; avoid "customers" and "users".
     - Inspect **G-15**: Superlatives ban ("number one rated", "world's best" require substantiation).

---

### Step 2: Creator Ishaan Verma Submits Reference Draft
1. **Switch to Creator**:
   - In the sidebar or top banner, switch to **Ishaan Verma (Creator)**.
2. **New Submission**:
   - Click **New Submission** (or click the quick-launch draft button on the Dashboard).
   - In the editorial paper sheet editor, load or paste the reference draft:
     > *"Lumora Pro gives all customers unlimited cloud storage and is the number one rated fitness app!!!"*
   - Attach the reference promo banner image (`promo_banner.png`) without alt text.
3. **Execute AI Governance Analysis**:
   - Click **Submit for Analysis**.
   - Watch the 4 progress steps: Reference Retrieval -> Terminology Scanning -> Dynamic Fact Checking -> Validation Gate.

---

### Step 3: Inspect Findings & Curved Loom Thread Lines
1. **Results View**:
   - Notice the **5 detected issues** precisely highlighted in the draft:
     1. `[HIGH] VERIFIED CONFLICT (F-12)`: "unlimited cloud storage" contradicts 50 GB.
     2. `[MED] NO APPROVED SOURCE (G-15)`: "the number one rated fitness app" has no verified substantiation.
     3. `[LOW] RULE VIOLATION (T-04)`: "customers" should be "members".
     4. `[LOW] RULE VIOLATION (G-07)`: repeated exclamation marks "!!!" violate calm brand voice.
     5. `[MED] RULE VIOLATION (G-10)`: image missing accessibility alt text.
2. **Interactive Loom Motif Thread Lines**:
   - Hover over each finding card: notice the curved teal SVG thread line dynamically connecting the card to the highlighted excerpt in the draft.
3. **F-12 Evidence Chip**:
   - Click the **F-12** chip to reveal the full statement, source reference, and verified bounds.
   - Point out honest uncertainty: **VERIFIED CONFLICT** vs **NO APPROVED SOURCE**.

---

### Step 4: Correction Workspace & Self-Approval Block Demonstration
1. **Apply Corrections**:
   - On Finding 1 (Fact Conflict): Click **Accept** (`50 GB of workout-video storage`).
   - On Finding 2 (Unsupported Claim): Click **Accept** (removes unsubstantiated claim).
   - On Finding 3 (Terminology): Click **Accept** (`members`).
   - On Finding 4 (Tone): Click **Accept** (`!`).
   - On Finding 5 (Alt Text): Dismiss with justification: `"Alt text added in CMS asset manager"`.
2. **Save Version 2**:
   - Click **Save as v2**: creates an immutable version and runs incremental analysis.
3. **Self-Approval Guard Demonstration (Key Evaluator Moment)**:
   - As Ishaan Verma (Creator), try to approve the draft:
   - Notice that the approve button is disabled or, if attempted via API, the server returns **HTTP 403 Forbidden** (`SELF_APPROVAL_FORBIDDEN`).
4. **Send for Review**:
   - Click **Send for Review**: with all high findings resolved, status transitions to `in_review`.

---

### Step 5: Reviewer Neil D'Souza Inspects & Signs Off
1. **Switch to Reviewer**:
   - Switch persona to **Neil D'Souza (Reviewer)**.
2. **Review Queue**:
   - Open **Review Queue**: see the submission at the top of the queue.
3. **Approval Details & Diff**:
   - Click the submission to open **Approval Details**.
   - Switch to **Word Diff**: review side-by-side green additions and red deletions between v1 and v2.
   - Switch to **Visual Compare**: inspect logo clear space and overlay blend slider.
   - Fill in the compliance checklist (logo, clear space, brand colors).
4. **Human Sign-Off**:
   - Enter decision note (≥5 chars): `"Approved for publication. All facts and voice rules verified."`
   - Click **Approve Version**: status transitions to `approved`.
   - The decision is permanently recorded in the immutable `approval_records` table with timestamp and reviewer ID.

---

### Step 6: Governance Analytics & Split Evaluation
1. **Governance Analytics**:
   - Click **Governance Analytics** in the sidebar.
   - Inspect the **"Guidelines That May Be Unclear"** table: rules G-02 and G-11 flagged due to >50% dismissal rates and creator feedback.
2. **Honest Model Evaluation Modal**:
   - In the header or sidebar, click **Evaluation Benchmark**.
   - View the honest 30-case benchmark split:
     - **Dev Split (16 cases)**: Precision 76.2%, Recall 76.2%, F1 76.2%
     - **Holdout Split (14 cases)**: Precision 75.0%, Recall 60.0%, F1 66.7%
     - **Overall F1**: 73.3%, Median Latency: 0ms
   - Note the prominent disclosure caption: *"Small demonstration set across 3 companies; not a production accuracy claim"*.
