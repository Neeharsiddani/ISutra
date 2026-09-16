# ISutra — AI-Powered Indian Standards Intelligence

> **Know the Standard. Specify with Confidence.**
> 
> *AI-Powered Procurement Intelligence for Identifying Applicable Indian Standards*
> 
> **Smart India Hackathon (SIH) Prototype**

---

## 📋 Problem Statement

Government departments, Public Sector Enterprises (PSUs), municipal corporations, and private procurement agencies frequently need to identify applicable Indian Standards (IS) when drafting procurement specifications and tender schedules.

Today, procurement teams often rely on manual catalog lookups or copy-pasting from outdated tenders, leading to obsolete standard citations, restrictive specifications, vendor disputes, and tender cancellations.

**ISutra** addresses this challenge through an explainable, end-to-end procurement intelligence workflow. It ingests procurement requirements, extracts structured parameters with provenance tracking, maps them to verified Indian Standards using deterministic multi-signal scoring, performs conservative requirement gap analysis, and provides side-by-side comparison across complementary standards.

---

## 📌 Implementation Status: Phases 1–7 Completed

ISutra implements a complete, 7-phase procurement intelligence lifecycle:

```
Procurement Specification
        ↓
Phase 2: AI Requirement Extraction & Provenance Tracking
        ↓
Phase 2: Human-in-the-Loop Requirement Review & Confirmation
        ↓
Phase 4: Specificity-Aware Deterministic BIS Matching (6-Factor Scoring)
        ↓
Phase 4: Ranked BIS Recommendations
        ↓
Phase 5: 5-Stage Traceability Chain & Factor Score Transparency
        ↓
Phase 6: Procurement Requirement Gap Analysis ("Reference Coverage")
        ↓
Phase 7: Procurement Standards Comparison Workspace (Side-by-Side 11-Dimension Matrix)
        ↓
Official BIS Portal Records (bis.gov.in)
```

### Summary of Completed Phases

1. **Phase 1 — Core Foundation & Standards Directory**:
   - Modern enterprise procurement interface with responsive navigation.
   - Searchable directory of verified Indian Standards with category filtering.

2. **Phase 2 — AI Requirement Understanding**:
   - Extraction of structured procurement requirements across 20 dimensions (Product, Category, Application, Industry, Technical Parameters, Environment, Installation, Safety, and Constraints).
   - Provenance tracking preserving exact source text snippets for every extracted parameter.
   - Interactive clarification flow pinpointing missing technical dimensions.
   - Human-in-the-loop review allowing procurement officers to edit, add, and verify parameters before matching.

3. **Phase 3 — Verified BIS Reference Dataset**:
   - 40 strictly verified BIS reference records across three critical public procurement sectors:
     - **Electrical & Lighting**: Road & street lighting luminaires, LED lamps, LED modules, floodlights, emergency lighting.
     - **Cables & Power Distribution**: PVC insulated cables, XLPE insulated cables, heavy-duty industrial cables.
     - **Civil Construction & Safety**: Plain and reinforced concrete (IS 456), high-strength deformed steel bars (IS 1786), structural steel, Portland and slag cements, industrial safety helmets, and safety footwear.
   - Every standard contains authenticated metadata, scopes, and direct links to official BIS portals (`bis.gov.in` and `services.bis.gov.in`).

4. **Phase 4 — Specificity-Aware Deterministic BIS Matching Engine**:
   - Multi-signal scoring engine combining 6 weighted factors:
     - Product & Category Match (30%)
     - Keywords, Title & Scope Alignment (25%)
     - Application Domain Fit (15%)
     - Environmental Conditions (10%)
     - Technical Parameter Ratings (10%)
     - Safety & Testing Specifications (10%)
   - Specificity-aware ranking: Distinguishes finished assemblies from subcomponents (e.g. dedicated street light luminaires strictly outrank generic LED lamps for street lighting tenders).
   - Mathematical score transparency: Total relevance percentage is the exact sum of weighted factor contributions.
   - 100% deterministic and reproducible across consecutive runs.
   - Defensive guardrails returning `insufficientInformation` states for vague inputs and zero matches for unrelated domains.

5. **Phase 5 — Evidence, Traceability & Trust Architecture**:
   - 5-stage verification chain on every recommendation:
     `User Input` → `Extracted Requirement` → `Matching Signal` → `BIS Standard` → `Official BIS Source`.
   - Requirement vs. Standard comparison matrix for direct auditability.
   - Zero evidence fabrication: Parameters absent in the reference record are explicitly cataloged as `not_available` rather than hallucinated.

6. **Phase 6 — Procurement Requirement Gap Analysis & Review**:
   - Analyzes coverage between user tender requirements and the selected BIS standard.
   - Conservative 4-state taxonomy: `supported`, `not_supported`, `not_available`, and `needs_verification`.
   - **Reference Coverage** metric: Transparently calculated as $\frac{\text{Supported}}{\text{Supported} + \text{Not Supported} + \text{Needs Verification}} \times 100$. Never mislabeled as "compliance percentage" or "certification score".
   - Targeted physical document verification checklists directing officers to inspect official publications.

7. **Phase 7 — Procurement Standards Comparison Workspace**:
   - Side-by-side workspace comparing 2–3 selected standards simultaneously.
   - Evaluates 11 structured dimensions: Documented Scope, Product Alignment, Application, Environment, Category, Product Types, Keywords, Technical Parameters, Safety Features, Testing Requirements, and Performance Specs.
   - Set-difference technical distinctions derived strictly from recorded catalog attributes.
   - Consolidated verification action checklist tagging applicable standards.
   - Strictly neutral: Never declares a "winner", "best standard", or comparative score, reflecting that standards are often complementary references across tender schedule clauses.
   - Responsive design with dedicated mobile standard tab switching.

---

## 🏛 Architecture: AI Perception vs. Deterministic Decision Logic

ISutra enforces a strict separation between natural-language understanding and procurement verification:

| Layer | Responsibility | Technology | Nature |
|:---|:---|:---|:---|
| **Perception Layer** | Extract structured procurement parameters from unstructured specification text | Google Gemini / OpenAI (structured JSON prompt); built-in offline NLP pattern extractor fallback | Generative AI / NLP |
| **Decision Layer** | Match requirements against BIS standards | 6-factor weighted multi-signal engine (`standardsMatcher.ts`) | 100% Deterministic |
| **Audit Layer** | Traceability chain & factor contribution breakdown | Provenance generator (`standardsMatcher.ts`) | 100% Deterministic |
| **Gap Analysis Layer** | Requirement coverage evaluation & physical verification checklist | 4-state ontology analyzer (`requirementGapAnalyzer.ts`) | 100% Deterministic |
| **Comparison Layer** | Side-by-side matrix & set-difference distinctions | Multi-standard relational comparator (`standardsComparator.ts`) | 100% Deterministic |
| **Reference Data** | Authentic standard metadata, scopes, and URLs | Verified BIS reference dataset (`verifiedStandards.ts`) | Curated Reference Data |

> **Why this matters for Government Procurement**:
> A black-box LLM that hallucinates clause numbers or invents compliance claims creates legal liability in public tenders. ISutra leverages AI strictly to comprehend ambiguous human language, while using deterministic, auditable mathematics to evaluate standards alignment.

---

## ⚠️ Prototype Boundaries & Honest Disclaimers

1. **Curated Reference Dataset (40 Standards)**:
   ISutra currently demonstrates its workflow against a curated verified reference dataset of 40 BIS standards covering municipal lighting, electrical cables, civil construction, and industrial safety. The prototype is not an exhaustive BIS catalogue. Uncataloged products return clean insufficient-information states.

2. **Document Upload Pathway**:
   Arbitrary uploaded documents are not parsed in this version. Document OCR parsing is scheduled for future releases. The tender document upload tab currently demonstrates the workflow using a pre-scanned tender extract. The primary live flow operates via direct text specification input.

3. **Decision-Support, Not Statutory Certification**:
   ISutra is an educational and hackathon research prototype. It is not affiliated with or endorsed by the Bureau of Indian Standards (BIS). Recommendations indicate reference data alignment and do not constitute legal compliance determinations. Users must independently verify specifications against official BIS publications.

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, React Router 7, Lucide React |
| **Backend** | Node.js, Express, TypeScript (compiles cleanly via `tsc`) |
| **AI / NLP** | Modular AI client supporting Google Gemini, OpenAI, and built-in offline regex NLP engine |
| **Persistence** | In-memory operational store + Supabase PostgreSQL schema |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Analyze text specification and extract structured requirements |
| `GET` | `/api/analysis/history` | Retrieve previous analysis records |
| `GET` | `/api/analysis/:id` | Get specific analysis record with requirements and provenance |
| `PUT` | `/api/analysis/:id/requirements` | Update requirements and confirm verification state |
| `POST` | `/api/analysis/upload` | Upload demo tender document for sample requirement analysis |
| `GET` | `/api/analysis/:id/recommendations` | Match confirmed analysis requirements against BIS standards |
| `POST` | `/api/recommendations` | Stateless direct matching against arbitrary structured requirements |
| `GET` | `/api/analysis/:id/recommendations/:stdId/gap-analysis` | Generate requirement gap analysis for a selected standard |
| `POST` | `/api/recommendations/gap-analysis` | Stateless direct requirement gap analysis |
| `GET` | `/api/analysis/:id/compare?standards=id1,id2` | Side-by-side comparison of 2–3 standards for an analysis session |
| `POST` | `/api/recommendations/compare` | Stateless direct comparison of 2–3 standards against requirements |
| `GET` | `/api/standards` | Search and filter verified BIS reference directory |
| `GET` | `/api/standards/:id` | Get verified standard details, scope, and official BIS URL |

---

## 🧪 Automated Test Suites

ISutra includes comprehensive automated test suites verifying scoring calibration, traceability, gap analysis, and comparison boundaries:

```bash
# 1. Run Phase 4 Matching Engine Verification (54 assertions)
node backend/test_phase4.mjs

# 2. Run Phase 6 Gap Analysis Verification (30 assertions)
node backend/test_phase6.mjs

# 3. Run Phase 7 Standards Comparator Verification (29 assertions)
node backend/test_phase7.mjs
```

**Total Automated Test Assertions**: 113 / 113 passing.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js v18+ (tested with v24.21.0)
- npm v9+

### 1. Start the Backend API
```bash
cd backend
npm install
npm run dev
```
The backend API starts at `http://localhost:3001` with base URL `http://localhost:3001/api`.

### 2. Start the Frontend Workspace
```bash
cd frontend
npm install
npm run dev
```
The frontend dashboard starts at `http://localhost:5173`.

### 3. Build Verification
```bash
# Build backend
npm --prefix backend run build

# Build frontend
npm --prefix frontend run build
```
