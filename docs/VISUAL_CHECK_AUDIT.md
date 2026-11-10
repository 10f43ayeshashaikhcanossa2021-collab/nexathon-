# INKLOOM AI — Automated Brand Visual Check Audit

This document records the pre-implementation audit of the initial prototype and details the architectural transformation from heuristic simulation to pixel-grounded, computer-vision verification.

---

## 1. Prototype Flaws Identified in Audit

| # | Component / Location | Prototype Issue | Replacement in Production Engine |
|---|----------------------|-----------------|----------------------------------|
| **1** | `extractColorsFromData()` | **Zero pixel decoding.** Used regex searching for `#RRGGBB` in data URLs or filenames. Fell back to a hardcoded 5-color palette (`#0B1B3A`, `#E74C3C`, `#139A93`, `#FFFFFF`, `#2C3E50`) with fixed coverage `[42, 26, 18, 9, 5]`. | **Real pixel quantization.** Uses `sharp` to decode raw RGBA pixels into CIE L\*a\*b\* color space. Implements 5-bit color bucketing, k-means clustering, and computes actual pixel count and coverage percentage directly from decoded pixel buffers. |
| **2** | Logo analysis in `runAutomatedImageBrandCheck()` | **Filename gated.** Triggered logo distortion checks only if filename matched `/promo|banner/i`. No shape detection or pixel analysis was performed. | **Edge & contour template matching.** Prepares 64×64 normalized binary shape masks of approved Brand Hub logos. Runs multi-scale edge and contour matching across the design canvas to detect candidate marks and compute pixel-accurate aspect ratio, stretch factor, and bounding boxes. |
| **3** | Confidence calculation | **Hardcoded constants.** Hardcoded static integers (`94%`, `91%`, `92%`, `86%`, `100%`) without mathematical derivation. | **Deterministic mathematical formula.** Confidence is computed via documented continuous function: `0.5 + 0.25*min(1, (ΔE-12)/30) + 0.15*min(1, cov/20) + 0.09*min(1, (C*-25)/40)`, clamped to [0.50, 0.99]. All input factors (`delta_e`, `coverage`, `chroma`, `iou`) are returned in `confidence_basis` for transparency. |
| **4** | Color finding evaluation | **Hardcoded defaults.** Always assumed expected color was `#139A93` with hardcoded region `[15, 40, 70, 35]`. Rule `isRedOrNeon` was a crude `delta_e > 10` filter. | **Perceptual cluster matching.** For every extracted pixel cluster, calculates minimum CIE Delta E 2000 ($\Delta E_{00}$) distance to the entire approved brand palette. Expected color is dynamically chosen as the closest approved palette item. Highlights the exact connected component bounding box of the violating cluster. |
| **5** | Multimodal Vision AI | **Label without model call.** If `GEMINI_API_KEY` was present, the code only changed the provider string to `"gemini_vision"` without making any API request. | **Real Gemini 3.8 Flash Vision integration with validation gate.** Issues structured JSON schema prompts to Gemini 3.8 Flash when configured and permitted by profile (`external_ai_allowed`). Outputs pass through a strict validation gate that rejects hallucinated bounding boxes or off-palette hex codes before fusing with deterministic findings. Gracefully falls back to pure deterministic analysis offline. |
| **6** | Reference brand logos | **External Unsplash links.** Approved logos in `SEED_ASSETS` pointed to external Unsplash photo URLs that could not be decoded offline or used as vector/raster logo masks. | **Local offline reference assets.** Shipped local PNG logo assets in `/demo-assets/logos/` (`ast-01` Teal Lumora Spiral and `ast-03` White on Navy), cached by SHA-256 with pre-computed 64×64 shape masks, foreground color signatures, and aspect ratios. |
| **7** | Validation & Error Handling | **Missing validation.** No magic-byte sniffing, no dimension bounds, and standard 1MB JSON body limit caused large uploads to fail with unhelpful errors. | **Strict security & image validation.** Magic-byte inspection for PNG, JPEG, and WebP (`image/png`, `image/jpeg`, `image/webp`). Max file size 10MB, dimension limits (min 200px, max 8000px), and protection against decompression bombs via `sharp({ limitInputPixels: 64000000 })`. Returns proper HTTP 413, 415, and 422 error codes. |
| **8** | Authorization & Tenant Scoping | **Weak RBAC & Cross-Tenant IDOR.** `POST` and `GET` visual-check endpoints allowed any authenticated role. `PATCH /api/visual-issues/:id` lacked org scoping, and submission authors were not blocked from reviewing their own submissions. | **Strict RBAC & Self-Review Blocking.** `POST /api/versions/:id/visual-check` restricted to `reviewer` and `admin`. `PATCH /api/visual-issues/:id` and comments enforce org scoping and block submission authors (`403 author_cannot_review`). |
| **9** | Persistence & Data Model | **Ephemeral in-memory array.** Stored in a process-level array that disappeared on server restarts. No database schema existed. | **Relational schema & append-only reviews.** `006_visual_checks.sql` migration adds `visual_check_reports`, `visual_issues`, and append-only `visual_issue_reviews` tables with RLS and index optimizations. Synchronized in-memory fallback preserves identical schema and org isolation in demo mode. |
| **10** | Tests & Assertions | **Tests verified fake behavior.** `test/visualCheck.test.ts` asserted the fake outputs (e.g. filename "promo" triggering distortion). | **Comprehensive golden tests.** Replaced with `test/visualGolden.test.ts` running real pixel decodes across 12 distinct test cases in `demo-data/manifest.json`. Verifies that renaming files has zero effect on pixel analysis results. |

---

## 2. Audit Verification & Compliance Guarantee

Every measurement displayed in the INKLOOM AI visual check interface is now backed by:
1. **Decoded pixel buffers** processed by the server-side `sharp` image engine.
2. **CIE L\*a\*b\* & CIE Delta E 2000** standard formulas for color difference.
3. **Connected component analysis** for color cluster spatial localization.
4. **Normalized 64×64 shape mask IoU** for logo recognition and aspect ratio preservation.
5. **Full engine trace disclosure** providing SHA-256 hash, image dimensions, execution timings per stage, and mathematical confidence basis.
