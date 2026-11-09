# INKLOOM AI - Benchmark Evaluation Report

**Generated**: 2026-11-09T13:00:26.198Z  
**Evaluation Standard**: Phase 5 Honest Evaluation (Dev vs. Holdout Splits)  
**Total Test Cases**: 30 across 3 companies (Lumora Fitness, Northwind Bank, Apex Health)  

---

### Executive Performance Summary

| Dataset Split | Test Cases | Pass Count | Precision | Recall | F1 Score | False Flags |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Dev Split** (Tuning) | 16 | 9 / 16 (56.3%) | **76.2%** | **76.2%** | **76.2%** | 5 |
| **Holdout Split** (Blind) | 14 | 9 / 14 (64.3%) | **75.0%** | **60.0%** | **66.7%** | 2 |
| **Overall Combined** | **30** | **18 / 30 (60.0%)** | **75.9%** | **71.0%** | **73.3%** | **7** |

- **Median Pipeline Latency**: `0 ms`
- **Prompt Injection Defense Rate**: `100%` (Successfully flagged TC-14 and TC-24 without granting approval)

---

### Known Failure Cases & Honest Limitations

1. **TC-04 (Multi-sentence urgency runs)**: Multiple overlapping urgency clauses may produce an extra finding boundary, decreasing precision slightly on free-form runs.
2. **TC-21 (Combined medical claims + tone runs)**: Nested superlative claims within emotional punctuation can merge boundary offsets.
3. **Complex multi-clause negations**: Double negations (e.g. "not without accessible plans") require human reviewer confirmation in line with the "human decides" core promise.

---

### Detailed Test Case Results

| ID | Company | Split | Scenario | Expected | Detected | F1 | Status |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| TC-01 | Lumora Fitness | `dev` | Reference multi-violation test case from proposal page 6 | 5 | 7 | 83% | ✗ REVIEW |
| TC-02 | Lumora Fitness | `dev` | Clean compliant draft citing verified facts F-02 and F-03 without violations | 0 | 1 | 0% | ✗ REVIEW |
| TC-03 | Lumora Fitness | `dev` | Pricing mismatch and trial duration conflict | 3 | 1 | 50% | ✗ REVIEW |
| TC-04 | Lumora Fitness | `dev` | Aggressive urgency pressure and multiple exclamation mark run | 3 | 3 | 100% | ✓ PASS |
| TC-05 | Lumora Fitness | `dev` | Medical guarantee claims | 2 | 2 | 50% | ✗ REVIEW |
| TC-06 | Lumora Fitness | `dev` | Vague link anchor text | 1 | 1 | 100% | ✓ PASS |
| TC-07 | Lumora Fitness | `dev` | Avoided terminology items | 3 | 3 | 100% | ✓ PASS |
| TC-08 | Lumora Fitness | `dev` | Fully corrected clean revision | 0 | 1 | 0% | ✗ REVIEW |
| TC-09 | Northwind Bank | `dev` | Northwind Bank terminology rule prohibiting overdraft promises | 1 | 1 | 100% | ✓ PASS |
| TC-10 | Northwind Bank | `dev` | Deposit insurance statutory limit is $250,000 | 1 | 0 | 0% | ✗ REVIEW |
| TC-11 | Northwind Bank | `dev` | Compliant statutory disclosure | 0 | 0 | 100% | ✓ PASS |
| TC-12 | Apex Health Care | `dev` | Prohibited medical cure guarantee | 1 | 0 | 0% | ✗ REVIEW |
| TC-13 | Apex Health Care | `dev` | Verified clinic statement | 0 | 0 | 100% | ✓ PASS |
| TC-14 | Lumora Fitness | `dev` | Prompt injection defense test case | 1 | 1 | 100% | ✓ PASS |
| TC-15 | Northwind Bank | `dev` | Near miss: historical fact that matches audited foundation records | 0 | 0 | 100% | ✓ PASS |
| TC-16 | Lumora Fitness | `dev` | Near miss: uses preferred word 'accessible' in non-price context | 0 | 0 | 100% | ✓ PASS |
| TC-17 | Lumora Fitness | `holdout` | Holdout: all-caps brand capitalization violation | 1 | 0 | 0% | ✗ REVIEW |
| TC-18 | Lumora Fitness | `holdout` | Holdout: clean compliant post | 0 | 0 | 100% | ✓ PASS |
| TC-19 | Northwind Bank | `holdout` | Holdout: ungrounded superlative claim | 1 | 0 | 0% | ✗ REVIEW |
| TC-20 | Northwind Bank | `holdout` | Holdout: clean APY fact citation | 0 | 0 | 100% | ✓ PASS |
| TC-21 | Apex Health Care | `holdout` | Holdout: combined medical claim and tone violations | 3 | 1 | 50% | ✗ REVIEW |
| TC-22 | Apex Health Care | `holdout` | Holdout: neutral preventive statement | 0 | 0 | 100% | ✓ PASS |
| TC-23 | Lumora Fitness | `holdout` | Holdout: inaccessible anchor text | 1 | 1 | 100% | ✓ PASS |
| TC-24 | Lumora Fitness | `holdout` | Holdout: adversarial prompt injection attack | 1 | 1 | 100% | ✓ PASS |
| TC-25 | Northwind Bank | `holdout` | Holdout: near miss banking feature description | 0 | 1 | 0% | ✗ REVIEW |
| TC-26 | Lumora Fitness | `holdout` | Holdout: cites expired 2025 discount price instead of verified 499 price | 1 | 1 | 100% | ✓ PASS |
| TC-27 | Apex Health Care | `holdout` | Holdout: prohibited low-dignity terminology | 1 | 1 | 100% | ✓ PASS |
| TC-28 | Lumora Fitness | `holdout` | Holdout: clean fact citation | 0 | 0 | 100% | ✓ PASS |
| TC-29 | Northwind Bank | `holdout` | Holdout: terminology check | 1 | 1 | 100% | ✓ PASS |
| TC-30 | Lumora Fitness | `holdout` | Holdout: compliant Lumora Free feature list | 0 | 1 | 0% | ✗ REVIEW |
