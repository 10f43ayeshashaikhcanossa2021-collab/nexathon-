# INKLOOM AI - 3-Minute Demo Script (Part L.1)

Follow these steps to demonstrate all 15 features of INKLOOM AI end to end.

---

### Step 1: Admin Maya Rao Shows Brand Hub (Feature 1, 2)
1. In the sidebar, verify active persona is **Maya Rao (Admin)**.
2. Click **Brand Hub**:
   - Point out the 4 count tiles: 16 Guidelines, 14 Approved Facts, 8 Terminology rules, 2 Assets.
   - Point out the 5-color palette tokens (`#0B1B3A`, `#139A93`, `#3E5C8A`, `#E8F5F5`, `#FBFAF7`).
   - Point out the **Knowledge Completeness Checklist** (100% complete).
3. Click **Guidelines & Facts**:
   - Inspect rule **G-15** (substantiation required for superlatives/ranking claims).
   - Inspect rule **G-07** (tone: avoid repeated exclamation marks, calm voice).
   - Switch to **Approved Facts** tab: inspect **F-12** (Lumora Pro includes 50 GB of workout-video storage) and the **Expired** badge on **F-14** (Spring offer).
   - Switch to **Terminology** tab: inspect **T-04** (use "members", avoid "customers" and "users").

---

### Step 2: Creator Ishaan Verma Submits Reference Draft (Feature 3)
1. In the bottom-left sidebar, switch persona to **Ishaan Verma (Creator)**.
2. Click **New Submission** or the dashboard quick launcher.
3. Click **Load Reference Draft (TS-01)**:
   - Notice the paper sheet editor displaying:
     > *"Lumora Pro gives all customers unlimited cloud storage and is the number one rated fitness app!!!"*
   - Notice the attached media item `promo_banner.png` flagged with **No alt text (will flag G-10)**.
4. Click **Submit for Analysis**:
   - Watch the 4 progress steps: Collecting references -> Checking terms -> Comparing facts -> Validating.

---

### Step 3: Results Screen & Thread Lines (Feature 4, 5, 6, 7, 9)
1. The analysis completes and renders the Results screen:
   - Exactly **5 findings** detected:
     1. `[HIGH] VERIFIED CONFLICT (F-12)`: "unlimited cloud storage" contradicts 50 GB.
     2. `[MED] NO APPROVED SOURCE (G-15)`: "the number one rated fitness app" has no verified source.
     3. `[LOW] RULE VIOLATION (T-04)`: "customers" should be "members".
     4. `[LOW] RULE VIOLATION (G-07)`: "!!!" violates calm brand voice.
     5. `[MED] RULE VIOLATION (G-10)`: image missing alt text.
2. **Loom Motif Thread Lines**:
   - Hover over each finding card: notice the thin curved teal SVG thread line dynamically connecting the card to the highlighted excerpt in the draft!
3. Click the **F-12** evidence chip: notice the popover showing full statement and source reference.
4. Note the honest uncertainty distinction: **VERIFIED CONFLICT** vs **NO APPROVED SOURCE** (never claims unsupported claims are "false").

---

### Step 4: Correction Workspace & Revision Generation (Feature 10, 13)
1. On Finding 1 (Fact Conflict): Click **Accept** (`50 GB of workout-video storage`).
2. On Finding 2 (Unsupported Claim): Click **Accept** (removal of unverified claim).
3. On Finding 3 (Terminology): Click **Accept** (`members`).
4. On Finding 4 (Tone): Click **Accept** (`!`).
5. On Finding 5 (Accessibility): Dismiss or leave note.
6. Toggle **Corrected Preview** in the top-right of the paper sheet:
   - Notice the green additions and red deletions, producing the exact reference revision:
     > *"Lumora Pro gives all members 50 GB of workout-video storage!"*
7. Click **Save as v2**:
   - Creates immutable version 2 and auto-runs analysis.
8. Click **Send for Review**:
   - Verifies all high-severity findings have been resolved and transitions status to `in_review`.

---

### Step 5: Reviewer Neil D'Souza Inspects & Approves (Feature 8, 11, 12)
1. Switch persona to **Neil D'Souza (Reviewer)**.
2. Open **Review Queue**: see the submission at the top of the queue.
3. Click to open **Approval Details**:
   - Switch to **Visual Compare** tab:
     - Compare approved logo against submitted asset.
     - Move the interactive **Overlay Blend Slider**.
     - Check off the reviewer compliance checklist (logo, clear space, colours).
     - Review the **Advisory Palette Distance Check** (honest label: "Advisory - not a verdict").
4. Point out the **Self-Approval Guard**: reviewers cannot approve their own drafts.
5. Enter comment: `"Approved for publication. Copy matches all guidelines."`
6. Click **Approve Version**.

---

### Step 6: Governance Analytics & Labelled Benchmark Runner (Feature 14, 15)
1. Open **Governance Analytics**:
   - Inspect **Category Distribution** stacked bars and top 8 rules.
   - Point out **"Guidelines That May Be Unclear"**: rules G-02 and G-11 flagged due to >50% dismissal rates and creator reasons.
2. In the sidebar, click **Labelled Test Runner (TS-01..08)**:
   - Click **Run All Tests Now**.
   - Verify 100% accuracy across all 8 test cases, including zero false flags on the clean control (TS-02) and prompt injection test (TS-08).
