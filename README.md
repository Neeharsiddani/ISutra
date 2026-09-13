# ISutra — AI-Powered Indian Standards Intelligence

> **Know the Standard. Specify with Confidence.**
> 
> *AI-Powered Procurement Intelligence for Identifying Applicable Indian Standards*
> 
> **Smart India Hackathon (SIH) Prototype**

---

## 📋 Problem Statement

Government departments, Public Sector Enterprises (PSUs), procurement agencies, and private organizations need to identify applicable Indian Standards (IS) when preparing procurement specifications. 

**ISutra** bridges this gap using an AI understanding layer that analyzes product descriptions, technical specifications, and tender documents, extracts structured procurement requirements, tracks provenance, and prepares the verified specifications for semantic standards matching.

---

## 📌 Current Status: Phase 2 Completed

### Phase 2: AI Requirement Understanding + UI Redesign
In Phase 2, ISutra has evolved from an informational concept into an enterprise-quality procurement intelligence workspace:

1. **Enterprise SaaS Redesign**:
   - Deep Navy (`#102A43`) persistent sidebar with clean workspace navigation.
   - Clean procurement intelligence working area without promotional marketing fluff.
   - 3 input modes: Product Description, Technical Specification, Tender Document.
   - Verified progressive 4-step pipeline loading indicator.

2. **AI Requirement Extraction Engine**:
   - Modular AI architecture in `backend/src/services/ai/` supporting Google Gemini, OpenAI, and a built-in offline NLP pattern extraction engine for instant execution without mandatory API keys.
   - Extracts 20 requirement dimensions: Product, Category, Application, Industry, Technical Parameters (with units & values), Materials, Environmental Conditions, Safety Requirements, Performance Requirements, Testing Requirements, Installation Requirements, Certification Mentions, Quantity, and Constraints.
   - **Provenance Tracking**: Preserves exact source text snippets for every extracted parameter.
   - **Confidence Scoring**: Highlights extraction certainty (`high`, `medium`, `needs_review`).
   - **Missing Information Detection**: Pinpoints missing technical dimensions and provides interactive clarification questions with single-click options.

3. **Human-in-the-Loop Requirement Review**:
   - Procurement officers can edit, add, and remove extracted parameters and tagged items.
   - Formal confirmation flow with status: *"Requirements confirmed. Ready for Standards Matching."* (Phase 2 strictly stops here before standards recommendation).

4. **Analysis History**:
   - Complete history view tracking previous specifications, extraction counts, and confirmation statuses.

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, React Router 7, Vite 8 |
| **Backend** | Node.js, Express, TypeScript (tsx watch) |
| **AI / NLP** | Modular AI Engine (Google Gemini / OpenAI / Built-in Regex & NLP Engine) |
| **Database** | Supabase (PostgreSQL) + Local in-memory fallback store |
| **Icons** | Lucide React |
| **File Upload** | Multer |

---

## 📁 Project Structure

```
proqurement/
├── frontend/                    # React + TypeScript + Tailwind CSS v4
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # Sidebar, Header, Footer, Layout
│   │   │   ├── ui/              # Button, Card, Badge, DemoBanner, etc.
│   │   │   ├── analysis/        # InputTypeSelector, Textarea, Upload, AnalysisLoading
│   │   │   └── standards/       # StandardCard, Table, Score, Certs
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx          # Primary Procurement Workspace
│   │   │   ├── RequirementReviewPage.tsx  # Editable Extracted Requirements & Confirm
│   │   │   ├── AnalysisHistoryPage.tsx    # Previous Analyses History
│   │   │   ├── StandardsSearchPage.tsx    # Standards Directory (Phase 1 retained)
│   │   │   ├── StandardDetailsPage.tsx    # Standard Details (Phase 1 retained)
│   │   │   └── AboutPage.tsx              # About ISutra
│   │   ├── services/            # api.ts (Analysis & Standards API client)
│   │   ├── hooks/               # useAnalysis.ts
│   │   ├── types/               # index.ts (Structured Requirements & Models)
│   │   ├── data/                # demoData.ts
│   │   └── App.tsx              # Application Routing
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── ai/              # Modular AI Engine
│   │   │   │   ├── types.ts                # Structured requirements schema
│   │   │   │   ├── promptTemplates.ts      # LLM prompts & guidelines
│   │   │   │   ├── aiClient.ts             # Gemini / OpenAI / Fallback client
│   │   │   │   ├── validation.ts           # Output sanitization & confidence
│   │   │   │   ├── nlpExtractor.ts         # High-precision offline NLP engine
│   │   │   │   └── requirementExtractor.ts # Main extraction coordinator
│   │   │   ├── analysisService.ts          # Analysis business logic & persistence
│   │   │   └── standardsService.ts         # Standards search & retrieval
│   │   ├── controllers/         # analysisController.ts, standardsController.ts
│   │   ├── routes/              # analysis.ts, standards.ts
│   │   ├── database/            # supabase.ts, demoData.ts
│   │   ├── index.ts             # Server entry point
│   │   └── test_extraction.ts   # Automated AI extraction verification suite
├── database/
│   └── migrations/
│       ├── 001_initial_schema.sql         # Core standards tables
│       └── 002_analysis_requirements.sql  # Requirements & provenance schema
├── .env.example
└── README.md
```

---

## 🚀 How to Run

### Prerequisites
- Node.js v18+ (tested with v24.15.0)
- npm v9+

### 1. Start the Backend API

```bash
cd backend
npm install
npm run dev
```
The backend API starts at `http://localhost:3001` with endpoint `http://localhost:3001/api`.

### 2. Start the Frontend Workspace

```bash
cd frontend
npm install
npm run dev
```
The frontend dashboard starts at `http://localhost:5173`.

### 3. Run Automated Tests

To run the automated verification test suite covering all required extraction cases:

```bash
cd backend
npm test
```

---

## 🔌 API Endpoints (Phase 2)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Service health status and phase info |
| `POST` | `/api/analyze` | Analyze specification and extract structured requirements |
| `GET` | `/api/analysis/history` | Retrieve previous analysis records |
| `GET` | `/api/analysis/:id` | Get specific analysis with all requirements & provenance |
| `PUT` | `/api/analysis/:id/requirements` | Update requirements & confirm verification state |
| `POST` | `/api/analysis/upload` | Upload tender document for requirement analysis |
| `GET` | `/api/standards` | Search and filter demo Indian Standards directory |
| `GET` | `/api/standards/:id` | Get standard details and amendments |

---

## 🧪 Verified Test Cases

The AI Requirement Understanding engine was verified against the following real specifications:

1. **Test 1: Outdoor LED Street Lighting**
   - *Input:* `"Outdoor LED street lighting system, 100W, weather resistant, pole mounted."`
   - *Extracted:* Product: `Outdoor LED Street Lighting System`, Power: `100W`, Environment: `Weather Resistant, Outdoor`, Installation: `Pole Mounted`.
2. **Test 2: Stainless Steel Water Tanks**
   - *Input:* `"Procure 500 stainless steel water storage tanks for a government facility."`
   - *Extracted:* Product: `Water Storage Tank`, Quantity: `500`, Material: `Stainless Steel`, Application: `Government Facility`.
3. **Test 3: Industrial High-Temp Cables**
   - *Input:* `"Supply industrial electrical cables suitable for high temperature environments."`
   - *Extracted:* Product: `Industrial Electrical Cables`, Environment: `High Temperature Environment`.
4. **Test 4: Vague Input & Clarification Flow**
   - *Input:* `"Need LED street lights."`
   - *Output:* Successfully flags missing technical dimensions (Power rating, Mounting type, Environment) and generates interactive clarification questions.

---

## 🗺 Roadmap & Next Steps (Phase 3)

In accordance with project guidelines, **Phase 2 stops at Requirement Confirmation** without predicting or fabricating unofficial standards recommendations.

### What Remains for Phase 3:
- **Vector Embeddings**: Generate text embeddings from verified requirement schemas.
- **Knowledge Base Ingestion**: Official BIS Indian Standards corpus parsing and chunking.
- **Semantic Search & Ranking**: Hybrid BM25 + pgvector semantic search.
- **Explainable Recommendation Engine**: Match confirmed technical specifications to applicable IS standards with citation & relevance justifications.

---

## 📜 Notice & Disclaimer

*ISutra is an educational and hackathon prototype. Not affiliated with the Bureau of Indian Standards (BIS) or any ministry. Demo data is clearly flagged.*
