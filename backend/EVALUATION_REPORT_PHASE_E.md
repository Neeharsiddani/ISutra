# ISutra — Phase E Evaluation Report: Specificity-Aware Ranking & Recommendation Quality

## Executive Summary

Phase E addresses the primary ranking weakness observed during Phase D: broad standards (e.g. general concrete codes, general mix proportioning, generic power cables) tying with or outranking more specific, dedicated Indian Standards when procurement requirements contained clear evidence to distinguish them.

Phase E introduces a **deterministic, explainable specificity layer** and **multi-criterion tie-breaking hierarchy** that operates directly on standard metadata (scopes, product forms, product types) without altering or distorting the mathematical integrity of the six core matching factors.

All assertions, benchmarks, and regression suites from Phase 4, Phase 6, Phase 7, Phase A, Phase B, Phase C, and Phase D remain 100% green.

---

## 1. Before vs After Benchmark Metrics

### A. Phase D Benchmark (34 Cases: 27 Standard Procurement, 4 Ambiguous, 3 Contradiction)

| Metric | Phase D Baseline | Phase E Measured | Delta |
| :--- | :---: | :---: | :---: |
| **Top-1 Match Rate** | **77.8%** (21/27) | **100.0%** (27/27) | **+22.2%** |
| **Top-3 Retrieval Rate** | **100.0%** (27/27) | **100.0%** (27/27) | — |
| **Top-5 Retrieval Rate** | **100.0%** (27/27) | **100.0%** (27/27) | — |
| **Overall Retrieval Rate** | **100.0%** (27/27) | **100.0%** (27/27) | — |
| **Readiness Accuracy** | **100.0%** (34/34) | **100.0%** (34/34) | — |
| **Ambiguous Cases Blocked** | **100.0%** (4/4) | **100.0%** (4/4) | — |
| **Contradictions Flagged** | **66.7%** (2/3) | **66.7%** (2/3) | — |

### B. Combined Benchmark (Phase D + Phase E: 46 Cases Total, 42 Matching-Ready Cases)

| Metric | Combined Benchmark Result | Benchmark Quality Gate | Gate Status |
| :--- | :---: | :---: | :---: |
| **Top-1 Match Rate** | **92.9%** (39/42) | $\ge 90.0\%$ | **PASS** |
| **Top-3 Retrieval Rate** | **100.0%** (42/42) | $\ge 98.0\%$ | **PASS** |
| **Top-5 Retrieval Rate** | **100.0%** (42/42) | $\ge 98.0\%$ | **PASS** |
| **Ambiguous Blocked Rate** | **100.0%** (4/4) | $100.0\%$ | **PASS** |
| **Determinism (30 runs)** | **100.0%** | $100.0\%$ | **PASS** |

---

## 2. Ranking Improvements on Previously Sub-Optimal Cases

In Phase D, 6 specific cases tied in raw score (0.40 vs 0.40) with broader standards and fell back to standard-number alphabetical sorting, causing broad standards to outrank specific standards. Phase E resolves all 6 cases:

| Case ID | Procurement Requirement | Expected Specific Standard | Previous Competing Broad Standard | Phase D Rank | Phase E Rank | Technical Reason for Improvement |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **eval-cable-02** | XLPE insulated power cables (11kV distribution) | **IS 7098 (Part 2):2011** | IS 1554 (Part 1):1988 (PVC heavy duty) | #2 | **#1** | Specific XLPE product form match (Tier 2) awarded to IS 7098; broad PVC cable recognized as allied category (Tier 5). |
| **eval-cable-05** | Flexible copper PVC cords for domestic appliances | **IS 694:2010** | IS 1554 (Part 1):1988 (PVC heavy duty) | #2 | **#1** | Specific flexible cord product form detected; IS 694 categorized as Tier 2, while industrial heavy duty cable IS 1554 relegated to Tier 5. |
| **eval-civil-05** | Precast reinforced concrete pipes (NP3 culvert) | **IS 458:2021** | IS 10262:2019 / IS 456:2000 (Mix / Code) | #2 | **#1** | Precast concrete pipes identified as finished manufactured product; IS 458 earns Tier 2 Exact Form match, while mix proportioning standard IS 10262 recognized as Tier 5 material reference. |
| **eval-civil-06** | Precast concrete masonry blocks (solid & hollow) | **IS 2185 (Part 1):2005** | IS 10262:2019 / IS 1077:2025 | #2 | **#1** | Entity disambiguation identifies concrete blocks over clay bricks and mix design; IS 2185 ranks #1 in Tier 2. |
| **eval-civil-09** | Liquid retaining concrete water tanks & reservoirs | **IS 3370 (Part 1):2021** | IS 10262:2019 / IS 456:2000 (Mix / Code) | #2 | **#1** | Aqueous structure recognized; IS 3370 (Part 1) awarded Tier 2 exact structure match over generic plain/reinforced concrete codes. |
| **eval-safety-02** | Mechanical risk protective gloves (abrasion/cut) | **IS 6994 (Part 6):2021** | IS 16874:2018 (Firefighter gloves) | #2 | **#1** | Mechanical hazard classification distinguishes industrial workshop gloves from structural firefighting gloves; IS 6994 earns Tier 2 exact hazard match. |

---

## 3. Cases Intentionally Unchanged

The following cases already exhibited optimal, verified rankings and were preserved without disturbance:

1. **LED Street Lighting (`eval-light-01`, `eval-light-07`)**:
   - `IS 10322 (Part 5/Sec 3):2026` already outranked generic lamp standards (`IS 16102`) with 80% relevance score and Tier 1 (Product Form + Application). Preserved at Rank #1.
2. **Emergency Lighting (`eval-light-02`)**:
   - `IS 10322 (Part 5/Sec 8):2026` correctly retrieved at Rank #1 based on autonomous battery and emergency lighting application alignment.
3. **Floodlighting Luminaires (`eval-light-03`)**:
   - `IS 10322 (Part 5/Sec 5):2026` correctly retrieved at Rank #1 for outdoor high-illumination stadium/yard lighting.
4. **Concrete Mix Proportioning (`eval-civil-08`, `eval-e-12`)**:
   - When a procurement requirement specifically requests concrete mix design guidelines or mix proportioning, `IS 10262:2019` legitimately ranks #1 because mix design is the explicit subject matter.
5. **Structural Concrete Multi-Storey Building Works (`eval-civil-01`)**:
   - `IS 456:2000` (Plain and Reinforced Concrete — Code of Practice) legitimately ranks #1 when general structural building construction is requested.
6. **Safety Footwear (`eval-safety-01`)**:
   - `IS 15298 (Part 2):2024` correctly ranks #1 for industrial safety footwear with steel toe caps.

---

## 4. Safety & Contradiction Dominance Verification

A strict core architectural requirement of Phase E is that **contradictions must always dominate specificity**. Specificity must NEVER rescue or elevate a contradicted standard.

### Verification Results

1. **Score Capping Invariant**:
   - Any standard with at least one factor marked as `contradiction` is hard-capped at $\text{score} \le 0.20$.
   - A contradiction prevents the standard from ever reaching `HIGH RELEVANCE` ($\ge 0.55$) or `RELATED` ($\ge 0.35$).
2. **Tier Relegation**:
   - Contradicted standards are immediately assigned to **Tier 6: Generic / Contradicted Match** (`specificityTier = 6`), regardless of whether keyword or phrase tokens match.
3. **Sorting Hierarchy Invariant**:
   - In `scoredList.sort()`, non-contradicted candidates strictly outrank contradicted candidates ($0 \text{ contradictions} < 1 \text{ contradiction} < 2 \text{ contradictions}$).
   - Product form alignment bonuses (`aFormMatch`) are strictly prohibited from applying to contradicted standards.
4. **Adversarial Verification (`eval-e-11`)**:
   - Requirement: *"Procure self-contained emergency luminaires specifically intended for outdoor street lighting illumination on municipal expressways."*
   - Outcome: `IS 10322 (Part 5/Sec 8)` (Emergency Luminaires) matches the product phrase but contradicts the outdoor highway road application. It received score $0.20$, Tier 6, and was prevented from ranking #1 over non-contradicted road lighting standards.

---

## 5. Ranking Architecture & Explainability

### Deterministic Specificity Tiers

| Tier | Designation | Description & Trigger Conditions |
| :---: | :--- | :--- |
| **Tier 1** | Exact Product Form & Application Match | Exact product form match (`reqForm === stdForm`) AND application factor is `matched`. Subscore: $1.0$. |
| **Tier 2** | Exact Product Form Match | Exact product form match (`reqForm === stdForm`) OR exact product_type match with standard metadata. Subscore: $0.85$. |
| **Tier 3** | Specific Product Family Match | Standard aligns with requested product family (`prodFactor.score >= 0.85`). Subscore: $0.70$. |
| **Tier 4** | Related Product / Component Match | Allied component or related specification within domain (`prodFactor.score >= 0.40`). Subscore: $0.50$. |
| **Tier 5** | Broad Domain Standard | General code of practice, mix design, or allied material reference when specific finished products are requested. Subscore: $0.30$. |
| **Tier 6** | Generic / Contradicted Match | Contradicted standard or distant generic reference. Subscore: $\le 0.15$. |

### Transparent Evidence Strings (Plain English)

Specificity evidence exposed to procurement officers includes:
- *"Exact product form match"*
- *"Standard scope directly covers requested product"*
- *"Application aligns with standard scope"*
- *"Broad domain standard; product form is less specific than requested procurement item."*

No internal jargon (`regex`, `token_count`, `internal_id`) is exposed.

---

## 6. Dataset & Test Suite Integrity

- **Verified Standards Dataset**: Exactly 40 official Bureau of Indian Standards reference records. Zero modifications, zero fabrications.
- **Evaluation Cases**: 34 Phase D cases + 12 dedicated Phase E cases = 46 total evaluation cases.
- **Zero Optimization Hacks**: Zero evaluation case IDs, zero hardcoded input checks, zero expected-answer lookups in matcher logic.
