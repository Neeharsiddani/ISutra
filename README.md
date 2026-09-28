# ISutra — AI-Powered Indian Standards Intelligence

> **Know the Standard. Specify with Confidence.**
> 
> *AI-Powered Procurement Intelligence for Identifying Applicable Indian Standards*
> 
> **Smart India Hackathon (SIH) Problem Statement SIH26108**

---

## 📋 Problem Statement & Purpose

Government departments, Public Sector Enterprises (PSUs), municipal corporations, and public procurement agencies frequently need to identify applicable Indian Standards (IS) when drafting procurement specifications and tender schedules.

Procurement teams often rely on manual catalog lookups or copy-pasting from outdated tenders, leading to obsolete standard citations, restrictive specifications, vendor disputes, and tender cancellations.

**ISutra** addresses this challenge through an explainable, end-to-end procurement intelligence workflow. It ingests messy procurement requirements (text, technical specifications, and machine-readable documents), extracts structured parameters with provenance tracking, maps them to verified Indian Standards using deterministic multi-signal scoring, performs requirement gap analysis, resolves allied standards and normative references, provides lifecycle timeline and regulatory intelligence, and enables side-by-side comparison across complementary standards.

---

## 🏛 CURRENT IMPLEMENTATION STATUS

Below is the verified implementation status for capabilities required by SIH problem statement SIH26108:

### 1. IMPLEMENTED
- **Multi-Modal Document & Text Ingestion (Req 1)**:
  - Natural-language product descriptions, technical specifications, and tender documents.
  - Digital machine-readable PDF and DOCX document ingestion (`documentExtractionService.ts`) with MIME/magic-byte signature validation, filename sanitization, and paragraph preservation.
  - Safe rejection of corrupted/disguised files and scanned/image-only documents with explicit user guidance.
  - Optional/configurable OCR hook (`ENABLE_OPTIONAL_OCR`) with provenance tracking (`isOcrDerived: boolean`).
- **AI/NLP Semantic Requirement Understanding (Req 2 & 5)**:
  - Extracts 20+ structured procurement dimensions (product, category, application, industry, environment, installation, electrical/technical parameters, dimensions, materials, safety, testing, performance, warranty, and tender constraints).
  - Modular AI provider architecture supporting Google Gemini, OpenAI, and a built-in offline regex NLP extraction engine.
  - Zero-hallucination guardrail: AI structures user requirements; it is strictly prohibited from inventing BIS standard numbers, clauses, amendment dates, or regulatory mandates.
- **Human-in-the-Loop Review (Req 3)**:
  - Interactive review interface (`RequirementReviewPage.tsx`) allowing procurement officers to inspect extracted parameters, edit values, add missing requirements, delete erroneous values, toggle uncertainty flags (`needs_review`), and confirm requirements before matching.
  - Recommendation engine matches exclusively against the *confirmed* requirement state.
- **Deterministic 6-Factor Standards Recommendation Engine (Req 4)**:
  - Multi-signal scoring engine with calibrated weights:
    - Product / Category Match: **30%**
    - Keywords, Title & Scope Alignment: **25%**
    - Application Domain Fit: **15%**
    - Environmental Context: **10%**
    - Technical Parameters: **10%**
    - Safety & Testing Specifications: **10%**
  - Specificity hierarchy (Tiers 1 to 6) distinguishing exact product/application fit from generic components and cross-domain candidates.
  - Contradiction handling and product-form conflict detection (e.g. underground mine applications penalized for outdoor street lights).
  - Full mathematical score breakdown: Every recommendation displays the exact weighted contribution of all six factors.
- **Allied & Associated Standards Intelligence (Req 6 & 7)**:
  - Relationship resolver (`standardsRelationshipService.ts`) supporting 8 categories: `normative_reference`, `test_method`, `safety_standard`, `installation_standard`, `terminology`, `related_product`, `allied_standard`, and `unspecified`.
  - Authoritative evidence model: Distinguishes between **Verified Relationships** (backed by explicit clause citations and official BIS URLs) and **Associated / Unclassified References** without fabricated clauses.
  - Seamless navigation: Recommendation → Why This Standard? → Associated Standards → Clause Evidence → Official BIS Source.
- **Standards Lifecycle & Amendment Intelligence (Req 8)**:
  - Curated lifecycle and amendment records (`standardLifecycleService.ts`).
  - Visual 5-stage lifecycle timeline stepper:
    `STANDARD → REVISION → AMENDMENT → REVIEW / REAFFIRMATION → VERIFICATION`.
  - Distinguishes base editions from revisions, periodic committee reaffirmations (e.g. IS 456 reaffirmed in 2025), and chronological amendment sequences with Gazette references.
- **Official BIS Source Verification (Req 9)**:
  - Direct HTTPS links to official BIS portals (`bis.gov.in`, `services.bis.gov.in`, `crsbis.in`, and `egazette.gov.in`).
  - Clear distinction between ISutra reference metadata and official BIS statutory authority.
- **Regulatory & Certification Intelligence (Req 10)**:
  - Independent regulatory intelligence layer (`regulatoryService.ts`) covering Ministry Quality Control Orders (QCOs) and MeitY Compulsory Registration Scheme (CRS).
  - Strictly 3 UI states:
    - `VERIFIED APPLICABILITY`
    - `VERIFICATION REQUIRED`
    - `NO VERIFIED REGULATORY RECORD`
  - Statutory disclaimer embedded; certification evidence does not contaminate deterministic matching scores.
- **Multilingual Procurement Input (Req 11)**:
  - Native language selector and script detector supporting **English**, **Hindi**, and **Telugu**.
  - Normalized requirement extraction to standardized engineering concepts while preserving original non-English source snippets.
  - Identical deterministic BIS matching scores across languages (e.g. 80% relevance for English, Hindi, and Telugu street lighting queries).
  - Unsupported scripts produce clean, informative notifications rather than silent failures.
- **Requirement Gap Analysis (Req 12)**:
  - 4-state taxonomy: `supported`, `not_supported`, `not_available`, and `needs_verification`.
  - Strictly labeled **REFERENCE COVERAGE**; never called "compliance score" or "legal certification".
- **Neutral Standards Comparison (Req 13)**:
  - Side-by-side comparison of 2–3 standards across 11 dimensions.
  - Neutral set-difference matrix; strictly prohibits declaring a "winner" or "superior standard".
- **Explainability & Traceability (Req 14 & 15)**:
  - "Why This Standard?" factor point breakdown.
  - "What is Still Unknown?" checklist linked to gap analysis.
  - "Why Not This Alternative?" factual dimensional comparison.
  - 5-stage audit trail: `User Requirement` → `Extracted Requirement` → `Matching Signal` → `Standard Data` → `Official BIS Source`.
- **Printable Procurement Evaluation Report (Req 16)**:
  - Structured, printable procurement report with confirmed requirements, recommended standards, score breakdown, gap analysis, allied references, lifecycle timeline, regulatory evidence, and official BIS verification links.
- **Standards Directory & Filtering (Req 17)**:
  - Searchable directory of 40 verified BIS standards with keyword, standard number, category, lifecycle status, regulatory (QCO/CRS) status, and allied relationship indicators.
- **Standards Ingestion & Schema Validation Layer (Req 18 & 19)**:
  - Ingestion validator (`standardsIngestionService.ts`) enforcing mandatory ID, title, category, scope, official source URL (`https://*.gov.in` or `https://*.crsbis.in`), and ISO verification date.
  - Rejects incomplete, hallucinated, or insecure records.

### 2. PARTIALLY IMPLEMENTED
- **Document Ingestion OCR (Req 1)**:
  - Optional OCR architecture implemented in `documentExtractionService.ts` via dynamic engine loading and test hooks (`ENABLE_OPTIONAL_OCR`). Scanned PDFs without accessible text return a safe 422 state explaining the scanned limitation when OCR is disabled.
- **Catalogue Coverage (Req 18)**:
  - 40 strictly verified BIS reference standards across municipal lighting, power distribution cables, civil construction (IS 456, IS 383, IS 1786), and safety PPE. Does not claim to be the exhaustive BIS catalogue of 20,000+ standards.

### 3. VERIFICATION REQUIRED
- **Statutory Mandate Applicability**:
  - Regulatory records (such as Steel QCO or Footwear QCO) reflect curated Ministry orders. Because QCO dates and transition windows change via official Gazettes, procurement officers must verify current legal enforcement directly on `egazette.gov.in` and `bis.gov.in`.
- **Latest Amendment Status**:
  - For standards without an active amendment record in the curated dataset, the UI explicitly displays: *"Current status requires verification against official BIS publication."*

### 4. FUTURE WORK
- Live BIS API integration when a public, unauthenticated, rate-limit-compliant REST API is officially published by BIS.
- Optical Character Recognition (OCR) for scanned municipal tender blueprints using server-side Tesseract.js / cloud vision workers.
- Expansion of the curated verified BIS reference catalogue to mechanical, chemical, and agricultural engineering divisions.

---

## 🏛 Architecture: AI Perception vs. Deterministic Decision Logic

```
   ┌────────────────────────────────────────────────────────┐
   │                  PERCEPTION LAYER                      │
   │  Natural Language / PDF / DOCX / Multilingual Input    │
   │  AI/NLP Model (Gemini / OpenAI / Offline Fallback)     │
   │  → Extracts 20+ Structured Procurement Dimensions      │
   └──────────────────────────┬─────────────────────────────┘
                              │
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │             HUMAN-IN-THE-LOOP REVIEW                   │
   │  Procurement Officer edits, adds, marks uncertainty,   │
   │  and confirms requirements                             │
   └──────────────────────────┬─────────────────────────────┘
                              │
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │                  DECISION LAYER                        │
   │  Deterministic 6-Factor Matcher (standardsMatcher.ts)  │
   │  - Product/Category (30%)   - Keywords/Scope (25%)     │
   │  - Application (15%)        - Environment (10%)        │
   │  - Technical Ratings (10%)  - Safety/Testing (10%)     │
   │  - Specificity Tiers 1-6 & Contradiction Penalties     │
   └──────────────────────────┬─────────────────────────────┘
                              │
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │              INTELLIGENCE & AUDIT LAYERS               │
   │  - 5-Stage Traceability Chain                          │
   │  - Reference Coverage Gap Analysis (4 States)          │
   │  - Allied Standards Explorer (Verified vs Associated)   │
   │  - Lifecycle Timeline & Gazette Amendments             │
   │  - Regulatory & QCO Assessment Layer                   │
   │  - Neutral 11-Dimension Standards Comparator           │
   │  - Printable Procurement Evaluation Report             │
   └──────────────────────────┬─────────────────────────────┘
                              │
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │                 OFFICIAL BIS AUTHORITY                 │
   │  Authoritative Links to bis.gov.in & services.bis.gov  │
   └────────────────────────────────────────────────────────┘
```

---

## 🧪 Comprehensive Automated Test Suites

ISutra includes over 280 passing test assertions verifying scoring calibration, traceability, gap analysis, document extraction, regulatory intelligence, and multilingual matching:

```bash
# 1. Run Comprehensive SIH26108 Capability Test Suite (Tests A through T)
node backend/test_sih26108_comprehensive.mjs

# 2. Run Multilingual Procurement Input Verification Suite (English, Hindi, Telugu)
node backend/test_multilingual.mjs

# 3. Run Regulatory & Certification Intelligence Test Suite (QCO, CRS, Hallmarking)
node backend/test_regulatory_certification.mjs

# 4. Run Allied Standards Intelligence Test Suite (Normative, Test Methods, Safety)
node backend/test_allied_standards.mjs

# 5. Run Real Document Ingestion & Report Test Suite (PDF, DOCX, Scanned Docs)
node backend/test_phaseF.mjs

# 6. Run Explainable Standard Decision Trail Test Suite ("Why This Standard?")
node backend/test_differentiation.mjs
```

**Total Automated Test Assertions**: 280+ passing (0 failures).

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, React Router 7, Lucide React |
| **Backend** | Node.js, Express, TypeScript (compiles cleanly via `tsc`) |
| **AI / NLP** | Modular AI client supporting Google Gemini, OpenAI, and built-in offline regex NLP engine |
| **Document Ingestion** | `pdf-parse`, `mammoth` (DOCX), stream signature validation, optional OCR interface |
| **Persistence** | MongoDB with Mongoose (with in-memory & verified dataset cold-start fallback) |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Analyze text specification and extract structured requirements |
| `POST` | `/api/analysis/document` | Ingest PDF or DOCX procurement document and extract requirements |
| `GET` | `/api/analysis/history` | Retrieve previous analysis records |
| `GET` | `/api/analysis/:id` | Get specific analysis record with requirements and provenance |
| `PUT` | `/api/analysis/:id/requirements` | Update requirements and confirm verification state |
| `GET` | `/api/analysis/:id/recommendations` | Match confirmed requirements against BIS standards |
| `GET` | `/api/analysis/:id/recommendations/:stdId/gap-analysis` | Generate requirement gap analysis for a selected standard |
| `GET` | `/api/analysis/:id/report` | Generate structured printable procurement report |
| `GET` | `/api/standards` | Search and filter verified BIS reference directory |
| `GET` | `/api/standards/:id` | Get verified standard details, scope, and official BIS URL |
| `GET` | `/api/standards/:id/lifecycle` | Get verified BIS lifecycle and amendment intelligence |
| `GET` | `/api/standards/:id/regulatory` | Check mandatory QCO and CRS regulatory applicability |
| `GET` | `/api/standards/:id/related` | Explore verified normative and associated allied standards |
| `POST` | `/api/standards/validate-ingestion` | Ingestion schema validation for candidate standard records |

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js v18+ (tested on Node.js v24.21.0)
- npm v9+
- MongoDB (local or MongoDB Atlas connection string; application automatically provides a verified reference fallback if unconfigured)

### 1. Database Configuration & Seeding
Configure your environment in `backend/.env` (see `.env.example`):
```bash
# Example local MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/isutra

# Example production / Atlas MongoDB
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/isutra?retryWrites=true&w=majority
```

To seed the 40 verified BIS reference standards into MongoDB:
```bash
npm --prefix backend run seed:standards
```
*(The seed process is strictly idempotent: executing multiple times preserves exactly 40 records with 0 duplicate records).*

### 2. Start the Backend API
```bash
cd backend
npm install
npm run dev
```
Backend starts at `http://localhost:3001` with API routes under `/api`.

### 3. Start the Frontend Workspace
```bash
cd frontend
npm install
npm run dev
```
Frontend development server starts at `http://localhost:5173`.

### 4. Build Verification
```bash
# Build backend
npm --prefix backend run build

# Build frontend
npm --prefix frontend run build
```

---

## ⚠️ Prototype Boundaries & Honest Disclaimers

1. **Curated Reference Dataset (40 Standards)**:
   ISutra operates against a verified reference dataset of 40 Indian Standards covering municipal lighting, electrical cables, civil construction, and industrial PPE. It is not the full catalogue of 20,000+ standards published by BIS.
2. **Document Ingestion**:
   Processes digital, machine-readable PDF and DOCX documents. Scanned or image-only documents without extractable text are safely rejected with explicit instructions when OCR is disabled.
3. **Decision-Support Tool**:
   ISutra is an educational prototype and decision-support system. It is not an official BIS service and does not issue legal compliance certificates.
4. **Official Source Primacy**:
   Direct links to `bis.gov.in` and `services.bis.gov.in` are provided throughout the application so procurement officers can verify current amendments and legal mandates directly from the source.
