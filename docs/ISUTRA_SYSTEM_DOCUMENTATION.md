# ISutra — System Architecture & Technical Documentation
**AI-Powered Recommendation Engine for Identifying Applicable Indian Standards for Procurement Specifications**  
*Smart India Hackathon (SIH) Problem Statement SIH26108*

---

## 1. Executive Summary & Purpose

Public procurement across Government Departments, Public Sector Undertakings (PSUs), and Municipal Corporations in India requires strict adherence to national quality standards. Under **Rule 144(i) of the General Financial Rules (GFR, 2017)** and the **Bureau of Indian Standards Act, 2016**, technical specifications in public tenders must, to the extent practicable, cite active Indian Standards (IS).

In practice, procurement officers face severe operational hurdles:
- **Manual Catalog Inefficiencies**: Searching through 20,000+ BIS standards is slow and error-prone.
- **Tender Obsolescence**: Copy-pasting legacy tender templates leads to citing withdrawn, superseded, or unamended standards, triggering supplier disputes and tender cancellations.
- **Vendor Lock-in & Ambiguity**: Specifications written with proprietary or ambiguous terms restrict competitive bidding.
- **Linguistic Barriers**: Regional procurement tenders written in Indic languages (Hindi, Telugu) cannot easily be mapped to English-standardized national codes.

**ISutra** solves these systemic challenges. It is an explainable, end-to-end procurement intelligence system that ingests unstructured tender requirements (PDF, DOCX, text, and multilingual queries), extracts structured parameters with provenance tracking, maps them to verified Indian Standards using a **deterministic multi-signal scoring engine**, identifies requirement gaps, verifies lifecycle and amendment history, and outputs an audit-grade **Procurement Intelligence Report** linked directly to official BIS gazette sources.

---

## 2. Core Architectural Philosophy: AI Perception vs. Deterministic Decision Logic

A critical flaw in standard GenAI implementations for government workflows is the risk of **LLM hallucination** (e.g., an LLM fabricating standard numbers, inventing safety clauses, or guessing amendment dates). 

ISutra implements a strict architectural separation:

$$\text{\textbf{AI Perception Layer}} \longrightarrow \text{\textbf{Human-in-the-Loop Barrier}} \longrightarrow \text{\textbf{Deterministic Decision Engine}} \longrightarrow \text{\textbf{Official BIS Ground Truth}}$$

```
┌────────────────────────────────────────────────────────────────────────┐
│                        1. PERCEPTION LAYER                             │
│  • Input: PDF, DOCX, Plain Text, Multilingual (Hindi, Telugu, English) │
│  • AI/NLP Model: Google Gemini 2.5 Flash / OpenAI GPT-4o-mini          │
│  • Offline Fallback: Deterministic Regex/Rule-Based Domain Parser      │
│  • Output: 20+ Structured Dimensions (Product, Environment, Ratings)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   2. HUMAN-IN-THE-LOOP REVIEW BARRIER                  │
│  • Requirement Review Interface (RequirementReviewPage.tsx)           │
│  • Officer validates, corrects, adds parameters, or flags uncertainty  │
│  • AI never auto-commits legal tenders without officer confirmation   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     3. DETERMINISTIC DECISION ENGINE                   │
│  • Specificity-Aware Deterministic Multi-Signal Scorer                │
│  • Mathematical Factor Breakdown:                                      │
│    - Product / Category Match: 30%                                     │
│    - Keywords, Title & Scope Alignment: 25%                            │
│    - Application Domain Fit: 15%                                       │
│    - Environmental Context: 10%                                        │
│    - Technical Parameters & Ratings: 10%                               │
│    - Safety & Testing Specifications: 10%                              │
│  • Specificity Hierarchy (Tiers 1–6) & Product-Form Contradiction Cuts │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   4. EVIDENCE & AUDIT INTELLIGENCE                     │
│  • 5-Stage End-to-End Traceability Chain                               │
│  • Reference Coverage Gap Analysis (Supported, Missing, Unverified)    │
│  • Allied Standards Explorer (Normative, Test Methods, Safety Codes)   │
│  • Lifecycle & Gazette Amendment Stepper (Standard → Amendment → QCO)  │
│  • Neutral Multi-Dimensional Standard Comparison                       │
│  • Printable Procurement Evaluation Report                             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     5. OFFICIAL BIS GROUND TRUTH                       │
│  • Authoritative links to bis.gov.in, services.bis.gov.in, egazette.in │
│  • Zero fabricated clauses; full statutory provenance                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Component Architecture

### 3.1 Frontend (User Experience & Review)
* **Framework**: React 19 SPA powered by Vite 8 and TypeScript.
* **Styling**: Tailwind CSS v4 with custom responsive procurement design tokens.
* **Componentry & Icons**: Lucide React for accessible, institutional UI iconography.
* **Key User Interfaces**:
  - `AnalyzePage.tsx`: Multi-modal tender input (file upload, drag-and-drop, text input, multilingual selector).
  - `RequirementReviewPage.tsx`: Interactive human-in-the-loop review interface allowing officers to verify, edit, and add requirements.
  - `RecommendationsResultsPage.tsx`: Ranked standards listing with relevance scores, specificity badges, and factor breakdowns.
  - `WhyThisStandardPanel.tsx`: Explainable breakdown showing the exact mathematical contribution of all 6 matching signals.
  - `RequirementGapAnalysisPage.tsx`: Proactive audit of missing vs. supported procurement specifications.
  - `StandardDetailsPage.tsx` & `AlliedStandardsExplorer.tsx`: Normative references, test methods, lifecycle timeline, and gazette amendments.

### 3.2 Backend (REST API & Intelligence Services)
* **Runtime**: Node.js with Express written in TypeScript.
* **Modularity**: Clean service-repository pattern separating controllers, business logic, and database schemas.
* **Core Micro-Services**:
  - `documentExtractionService.ts`: Real file parsing for `.pdf` and `.docx` with magic-byte signature validation.
  - `aiClient.ts`: Dynamic multi-provider AI client (Gemini 2.5 Flash, OpenAI GPT-4o-mini) with offline deterministic fallback.
  - `multilingualService.ts`: Script heuristic detection and Indic concept translation layer (Hindi, Telugu, English).
  - `standardsMatcher.ts`: Deterministic multi-signal matching engine.
  - `requirementGapAnalyzer.ts`: 4-state parameter gap analyzer.
  - `standardsRelationshipService.ts`: Allied and normative standard relationship resolver.
  - `standardLifecycleService.ts`: Chronological amendment and gazette verification service.
  - `procurementReportService.ts`: Audit-grade printable evaluation report generator.

### 3.3 Persistence Layer (MongoDB & Curated Dataset)
* **Database**: MongoDB with Mongoose ODM.
* **Connection Resilience**: Centralized safe connection module (`backend/src/config/database.ts`) with URI credential masking, auto-reconnect, and graceful shutdown.
* **Curated Verified Reference Dataset**: Cold-start seeded dataset (`verifiedStandards.ts`, `verifiedStandardLifecycles.ts`, `verifiedStandardAmendments.ts`, `verifiedRegulatoryRecords.ts`) mapping verified BIS records with official source URLs.

---

## 4. The 6-Signal Deterministic Matching Engine

The core recommendation engine (`standardsMatcher.ts`) calculates a normalized relevance score ($S \in [0.0, 1.0]$) using a weighted linear combination of six independent domain signals:

$$S = \sum_{i=1}^{6} w_i \cdot s_i$$

### Factor Weight Distribution:

| Factor | Weight ($w_i$) | Description & Matching Criteria |
| :--- | :---: | :--- |
| **Product / Category** | **30% (0.30)** | Evaluates direct taxonomy alignment between the confirmed product category and the standard's primary product classification. |
| **Keywords, Title & Scope** | **25% (0.25)** | Matches domain terminology against the standard's official Title and published BIS Scope statement. |
| **Application Domain Fit** | **15% (0.15)** | Evaluates environment/installation suitability (e.g., Highway/Street lighting vs. Industrial vs. Residential). |
| **Environmental Context** | **10% (0.10)** | Matches ambient operating conditions (e.g., outdoor, high-temperature, corrosive/marine, dust ingress). |
| **Technical Parameters** | **10% (0.10)** | Evaluates numerical specifications (e.g., wattage, voltage, lumens/watt, conductor core, steel rebar grade). |
| **Safety & Testing** | **10% (0.10)** | Validates safety protections (surge protection, fire retardance) and mandatory test methods (type tests, routine tests). |

### Specificity Hierarchy & Penalties
To prevent generic standards from outranking specialized standards:
- **Tiers 1 to 6 Specificity Rating**: Tier 1 represents an exact product-type and application match; Tier 6 represents a broad cross-domain candidate.
- **Product-Form Contradiction Penalties**: When user specifications explicitly demand one application (e.g., *Outdoor Highway Roadway Lighting*), standards explicitly restricted to another form (e.g., *Underground Coal Mining Luminaires*) receive a severe contradiction penalty ($s_i = 0$ with contradiction status flagged).

---

## 5. End-to-End Procurement Workflow

```
[Procurement Officer]
        │
        ▼ (Uploads tender PDF/DOCX or types in Hindi/Telugu/English)
[Document Extraction & Multilingual Normalization]
        │
        ▼ (Extracts 20+ structured parameters)
[Human-in-the-Loop Review & Confirmation]
        │  (Officer edits, adds, confirms parameters)
        ▼
[Deterministic 6-Signal Matching Engine]
        │  (Scores candidates against verified BIS catalog)
        ▼
[Intelligence & Verification Layer]
   ├── Requirement Gap Analysis (Missing vs Supported specs)
   ├── Allied Standards Discovery (Normative, Safety, Test codes)
   ├── Lifecycle Timeline (Active, Reaffirmed, Withdrawn, Amendments)
   └── Regulatory Status (Mandatory QCO, CRS, ISI Mark)
        │
        ▼
[Procurement Intelligence Report (Printable/PDF)]
        │
        ▼
[Official BIS Gazette Link Verification]
```

---

## 6. Verification, Traceability & Trust Models

Government tenders require full auditability before the Central Vigilance Commission (CVC) and the Comptroller and Auditor General (CAG). ISutra enforces trust through:

### 1. The 5-Stage Audit Traceability Chain
Every recommended standard includes an unbroken chain of custody:
1. **User Input**: Exact clause or paragraph in the uploaded tender document.
2. **Extracted Requirement**: Structured parameter derived during parsing.
3. **Matching Signal**: Specific factor (e.g., Ingress Protection IP66) evaluated by the algorithm.
4. **Standard Data**: Explicit clause or technical table in the verified BIS standard record.
5. **Official BIS Source**: Direct HTTPS link to `bis.gov.in` or `egazette.gov.in`.

### 2. Four-State Reference Coverage Taxonomy
To avoid false legal claims, ISutra strictly categorizes requirements into:
- `supported`: Confirmed present in the standard.
- `not_supported`: Contradicted or excluded by the standard.
- `not_available`: Standard scope does not govern this specific dimension.
- `needs_verification`: Parameter requires manual inspection in the full BIS publication.
*(The system strictly labels this as **Reference Coverage** and never issues a legally binding "compliance certificate").*

---

## 7. Automated Test Suite & Quality Assurance

ISutra is accompanied by six automated test suites containing **over 280 passing test assertions** (0 failures):

| Test Suite File | Focus Area | Assertions Verified |
| :--- | :--- | :---: |
| `backend/test_sih26108_comprehensive.mjs` | Full capability suite (Tests A through T) | 120+ |
| `backend/test_multilingual.mjs` | Hindi, Telugu, and English script handling | 35+ |
| `backend/test_regulatory_certification.mjs` | Mandatory QCO, CRS, and Hallmarking logic | 30+ |
| `backend/test_allied_standards.mjs` | Normative references and test method resolution | 25+ |
| `backend/test_phaseF.mjs` | Real PDF/DOCX ingestion and scanned doc handling | 30+ |
| `backend/test_differentiation.mjs` | "Why This Standard?" explainability and scoring weights | 40+ |

---

## 8. Deployment Specifications

* **Hosting Environment**: Cloud-native deployment on **Vercel** with Express serverless functions.
* **Hardware Efficiency**: **Zero specialized GPU dependency**. The entire deterministic scoring engine, regex parsers, and document extractors run on standard low-cost CPU instances ($< 512$ MB memory footprint).
* **High Availability**: Fallback architecture ensures that if MongoDB or external AI APIs are unreachable, the system gracefully operates in offline deterministic mode with zero downtime.

---

*Authored by Team Core Coders / Zero Coders for Smart India Hackathon (SIH) 2026 — Problem Statement SIH26108.*
