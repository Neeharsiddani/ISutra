# ISutra REST API Reference & Integration Guide

This guide details the complete REST API interface for **ISutra**. It provides procurement software developers, e-Procurement platforms (e.g., GeM, state tender portals), and enterprise systems with full technical documentation on endpoints, request parameters, response schemas, and integration patterns.

---

## 🌐 Base URL & Protocol

| Environment | Base URL | Notes |
| :--- | :--- | :--- |
| **Local Development** | `http://localhost:3001/api` | Express server running locally |
| **Production / Vercel** | `https://<your-deployment-domain>/api` | Serverless backend endpoints |

All requests and responses use **JSON** format (MIME type: `application/json`), except multipart document uploads which use `multipart/form-data`.

---

## 📑 API Endpoints Summary

```
ISutra REST API
├── /api/analyze                          [POST] Raw text requirement extraction
├── /api/analysis
│   ├── /document                         [POST] PDF/DOCX file upload & parsing
│   ├── /history                          [GET]  Past analysis sessions
│   └── /:id
│       ├── (root)                        [GET]  Analysis details & parameters
│       ├── /requirements                 [PUT]  Human-in-the-loop updates
│       ├── /recommendations              [GET/POST] Deterministic BIS matching
│       ├── /recommendations/:stdId/gap-analysis [GET/POST] 4-state requirement gap
│       ├── /compare                      [GET/POST] 11-dimension standards compare
│       ├── /report                       [GET]  Structured audit report (JSON)
│       └── /report/html                  [GET]  Printable evaluation report (HTML)
├── /api/recommendations
│   ├── (root)                            [POST] Direct requirements matching
│   ├── /gap-analysis                     [POST] Ad-hoc gap analysis
│   └── /compare                          [POST] Ad-hoc comparison
└── /api/standards
    ├── (root)                            [GET]  Directory search & filtering
    ├── /categories                       [GET]  Taxonomy list
    ├── /validate-ingestion               [POST] Strict catalog ingestion schema validator
    └── /:id
        ├── (root)                        [GET]  Standard details & official link
        ├── /related                      [GET]  Allied & normative references
        ├── /lifecycle                    [GET]  5-stage lifecycle timeline & gazette
        ├── /amendments                   [GET]  Amendments catalog
        └── /regulatory                   [GET]  Mandatory QCO, CRS & Hallmarking status
```

---

## 1. Procurement Document & Text Ingestion

### 1.1 Ingest Raw Text Requirements
Extracts 20+ structured procurement parameters from unstructured text specifications or tender paragraphs.

- **Endpoint**: `POST /api/analyze`
- **Controller**: [`analyze`](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/backend/src/controllers/analysisController.ts)
- **Headers**: `Content-Type: application/json`

#### Request Body:
```json
{
  "text": "Procurement of 120W Outdoor LED Street Light Luminaires for Smart City expressway. Operating voltage: 240V AC, 50Hz, power factor > 0.95, luminous efficacy >= 120 lm/W, CCT 5700K. Aluminum die-cast housing with IP66 ingress protection and 10kV surge protection. Must comply with applicable Indian Standards.",
  "inputType": "tender_document",
  "language": "en"
}
```

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `text` | `string` | **Yes** | Tender specification or product requirement text. |
| `inputType` | `string` | No | `'product_description'` \| `'technical_specification'` \| `'tender_document'`. Default: `'product_description'`. |
| `language` | `string` | No | `'en'` \| `'hi'` \| `'te'`. Default: detected automatically by script heuristic. |

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "req-1711200000000-abc123",
    "status": "completed",
    "inputType": "tender_document",
    "detectedLanguage": "en",
    "extractedRequirements": {
      "product_name": "Outdoor LED Street Light Luminaire",
      "category": "Luminaires",
      "subcategory": "Roadway & Street Lighting",
      "primary_material": "Die-cast Aluminum",
      "application_domain": "Outdoor Highway / Expressway Lighting",
      "operating_environment": "Outdoor Severe Weather",
      "electrical_ratings": {
        "wattage": "120W",
        "voltage": "240V AC",
        "power_factor": "> 0.95",
        "surge_protection": "10kV"
      },
      "performance_metrics": {
        "luminous_efficacy": ">= 120 lm/W",
        "cct": "5700K"
      },
      "safety_features": [
        "IP66 Ingress Protection",
        "Over-voltage and Surge Protection"
      ],
      "testing_requirements": [
        "Ingress Protection Test",
        "Surge Immunity Test"
      ]
    },
    "provenance": {
      "sourceLength": 328,
      "aiProvider": "gemini-2.5-flash",
      "extractedAt": "2026-10-03T18:24:00.000Z",
      "isOcrDerived": false
    }
  }
}
```

---

### 1.2 Ingest Digital PDF / DOCX Document
Ingests tender files, extracts text streams, validates magic-byte headers, and extracts requirements.

- **Endpoint**: `POST /api/analysis/document` *(or `/api/analysis/upload`)*
- **Service**: [`documentExtractionService.ts`](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/backend/src/services/documentExtractionService.ts)
- **Headers**: `Content-Type: multipart/form-data`

#### Multipart Form Parameters:
- `document`: File binary (supported extensions: `.pdf`, `.docx`, `.doc`). Maximum size: 15 MB.
- `inputType`: (optional) `'tender_document'`.
- `language`: (optional) `'en'` \| `'hi'` \| `'te'`.

#### Response (`200 OK`):
Same format as `POST /api/analyze`, with `file_name`, `pageCount`, and paragraph statistics in provenance.

#### Error Responses:
- **`400 Bad Request`**: File missing, or unsupported extension (e.g. `.exe`, `.zip`).
- **`422 Unprocessable Entity`**: Scanned PDF detected without readable text stream:
  ```json
  {
    "success": false,
    "error": "Scanned document detected. No digital text stream could be extracted.",
    "code": "SCANNED_DOCUMENT_NO_TEXT",
    "remediation": "Upload a digital PDF generated directly from Word/CAD, or enable OCR processing in deployment settings."
  }
  ```

---

## 2. Human-in-the-Loop Requirement Review

Public procurement cannot legally rely on unchecked AI perceptions. Officers review, modify, and confirm parameters before matching.

### 2.1 Fetch Analysis Session
- **Endpoint**: `GET /api/analysis/:id`
- **Response (`200 OK`)**: Returns current extraction state, verification status, and raw extracted parameter tree.

### 2.2 Update & Confirm Requirements
- **Endpoint**: `PUT /api/analysis/:id/requirements`
- **Controller**: [`updateRequirements`](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/backend/src/controllers/analysisController.ts)
- **Headers**: `Content-Type: application/json`

#### Request Body:
```json
{
  "confirmedRequirements": {
    "product_name": "Outdoor LED Street Light Luminaire",
    "category": "Luminaires",
    "application_domain": "Highway / Roadway",
    "electrical_ratings": {
      "wattage": "150W",
      "surge_protection": "10kV"
    },
    "safety_features": ["IP66 Ingress Protection"]
  },
  "reviewNotes": "Upgraded wattage requirement from 120W to 150W as per revised municipal budget.",
  "isConfirmed": true
}
```

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "req-1711200000000-abc123",
    "isConfirmed": true,
    "confirmedAt": "2026-10-03T18:25:30.000Z",
    "confirmedRequirements": { ... }
  }
}
```

---

## 3. Deterministic Standards Recommendation Engine

### 3.1 Get Recommendations for Analysis Session
Evaluates confirmed parameters against verified BIS standards using the 6-factor deterministic scoring engine.

- **Endpoint**: `GET /api/analysis/:id/recommendations` *(or `POST`)*
- **Service**: [`standardsMatcher.ts`](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/backend/src/services/standardsMatcher.ts)

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "analysisId": "req-1711200000000-abc123",
    "totalEvaluated": 40,
    "recommendations": [
      {
        "rank": 1,
        "standardId": "is-10322-5-3",
        "standardNumber": "IS 10322 (Part 5/Sec 3): 2012",
        "title": "Luminaires - Particular Requirements - Luminaires for Road and Street Lighting",
        "category": "Luminaires",
        "relevanceScore": 0.825,
        "categoryClassification": "high",
        "categoryLabel": "HIGH RELEVANCE",
        "specificityTier": 1,
        "specificityLabel": "Tier 1: Exact Product & Application Match",
        "officialSourceUrl": "https://services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/10322-5-3",
        "factorBreakdown": {
          "productCategory": {
            "status": "matched",
            "score": 1.0,
            "weight": 0.30,
            "contribution": 0.300,
            "evidence": ["Exact category match: Luminaires"]
          },
          "keywordsTitleScope": {
            "status": "matched",
            "score": 0.85,
            "weight": 0.25,
            "contribution": 0.2125,
            "evidence": ["Title aligns with 'Road and Street Lighting'", "Scope covers public thoroughfares"]
          },
          "applicationDomain": {
            "status": "matched",
            "score": 1.0,
            "weight": 0.15,
            "contribution": 0.150,
            "evidence": ["Matched application: Highway / Roadway Lighting"]
          },
          "environment": {
            "status": "matched",
            "score": 0.90,
            "weight": 0.10,
            "contribution": 0.090,
            "evidence": ["Outdoor severe weather and dust resistance covered in clause 4.2"]
          },
          "technicalParameters": {
            "status": "matched",
            "score": 0.36,
            "weight": 0.10,
            "contribution": 0.036,
            "evidence": ["Standard defines mechanical/electrical limits; lamp performance governed by IS 16107-2-1"]
          },
          "safetyTesting": {
            "status": "matched",
            "score": 0.37,
            "weight": 0.10,
            "contribution": 0.037,
            "evidence": ["Ingress test IP66 cross-references IS/IEC 60529"]
          }
        },
        "auditChain": [
          { "stage": "user_input", "detail": "Outdoor LED Street Light Luminaire for expressway" },
          { "stage": "extracted_requirement", "detail": "Category: Luminaires, Application: Roadway" },
          { "stage": "matching_signal", "detail": "Product (30%) + Title/Scope (25%) + Application (15%)" },
          { "stage": "standard_data", "detail": "IS 10322 (Part 5/Sec 3): 2012 Clause 1.1 Scope" },
          { "stage": "official_bis_source", "detail": "https://services.bis.gov.in" }
        ]
      }
    ]
  }
}
```

---

## 4. Gap Analysis & Standards Comparison

### 4.1 Requirement Gap Analysis
Audits tender specifications against the selected standard's scope, classifying each requirement into 4 non-hallucinatory reference coverage states.

- **Endpoint**: `GET /api/analysis/:id/recommendations/:standardId/gap-analysis`
- **Service**: [`requirementGapAnalyzer.ts`](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/backend/src/services/requirementGapAnalyzer.ts)

#### Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "standardNumber": "IS 10322 (Part 5/Sec 3): 2012",
    "standardTitle": "Luminaires - Road and Street Lighting",
    "coverageNotice": "Reference Coverage Audit. This analysis reflects textual scope coverage in verified standard clauses and does NOT constitute a statutory compliance certificate.",
    "summary": {
      "supportedCount": 5,
      "notSupportedCount": 0,
      "notAvailableCount": 2,
      "needsVerificationCount": 1
    },
    "parameters": [
      {
        "name": "Ingress Protection (IP66)",
        "status": "supported",
        "coverageBadge": "SUPPORTED IN STANDARD",
        "clauseReference": "Clause 4.3 (referencing IS/IEC 60529)",
        "notes": "Clause mandates minimum IP43 for optical chamber; IP66 tested per Section 4."
      },
      {
        "name": "Luminous Efficacy (120 lm/W)",
        "status": "not_available",
        "coverageBadge": "NOT GOVERNED BY THIS CODE",
        "clauseReference": "Out of Scope",
        "notes": "Safety standard IS 10322 does not prescribe photometric efficacy. Refer to allied standard IS 16107 (Part 2/Sec 1)."
      },
      {
        "name": "Surge Protection (10kV)",
        "status": "needs_verification",
        "coverageBadge": "REQUIRES MANUAL VERIFICATION",
        "clauseReference": "Clause 11.2 (Surge Immunity)",
        "notes": "Standard specifies basic surge limits. 10kV high-voltage municipal surge requires external driver verification per IS 15885."
      }
    ]
  }
}
```

---

### 4.2 Side-by-Side Standards Comparison
Compares 2 or 3 standards across 11 neutral dimensions without bias or subjective winner declarations.

- **Endpoint**: `POST /api/analysis/:id/compare`
- **Service**: [`standardsComparator.ts`](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/backend/src/services/standardsComparator.ts)

#### Request Body:
```json
{
  "standardIds": ["is-10322-5-3", "is-16107-2-1"]
}
```

#### Response (`200 OK`):
Returns an 11-dimension comparison matrix covering:
1. Primary Scope
2. Product Type
3. Applicable Domain
4. Electrical & Safety Focus
5. Mandatory Test Methods
6. Environmental Ingress Specs
7. Target Users
8. Complementary Relationship
9. Reaffirmation Date
10. Regulatory Mandate (QCO)
11. Gazette Source Reference

---

## 5. Standards Directory, Lifecycle & Regulatory

### 5.1 Search & Filter Standards
- **Endpoint**: `GET /api/standards`
- **Controller**: [`standardsController.ts`](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/backend/src/controllers/standardsController.ts)
- **Query Parameters**:
  - `search`: Keyword or standard number (e.g. `10322`, `cable`, `cement`).
  - `category`: Category name (e.g. `Luminaires`, `Civil Construction`, `Power Cables`).
  - `status`: `'active'` \| `'under_revision'` \| `'withdrawn'`.
  - `page`: Page number (default: 1).
  - `limit`: Items per page (default: 20).

### 5.2 Allied & Normative Standards
- **Endpoint**: `GET /api/standards/:id/related`
- **Service**: [`standardsRelationshipService.ts`](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/backend/src/services/standardsRelationshipService.ts)

Categorizes relationships into:
- `normative_reference`: Mandatory standard cited in normative text.
- `test_method`: Standard specifying physical/electrical testing procedures.
- `safety_standard`: General electrical or fire safety code.
- `installation_standard`: Guidelines for mounting and civil execution.

### 5.3 Lifecycle & Amendment History
- **Endpoint**: `GET /api/standards/:id/lifecycle`
- **Service**: [`standardLifecycleService.ts`](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/backend/src/services/standardLifecycleService.ts)

Returns the 5-stage lifecycle history:
`BASE STANDARD` → `REVISION` → `AMENDMENTS` → `REAFFIRMATION` → `VERIFIED BIS PORTAL`.

### 5.4 Regulatory & QCO Status
- **Endpoint**: `GET /api/standards/:id/regulatory`
- **Service**: [`regulatoryService.ts`](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/backend/src/services/regulatoryService.ts)

Returns 1 of 3 strict regulatory states:
1. `VERIFIED APPLICABILITY`: Mandatory QCO gazette notified (e.g. Steel Quality Control Order for IS 1786).
2. `VERIFICATION REQUIRED`: Transitional enforcement or recent Ministry draft.
3. `NO VERIFIED REGULATORY RECORD`: Standard is voluntary or no gazette QCO exists.

---

## 6. Procurement Intelligence Reports

### 6.1 Generate JSON Procurement Report
- **Endpoint**: `GET /api/analysis/:id/report`
- **Response**: Full structured audit dossier with confirmed requirements, top recommendations, factor breakdowns, gap analysis, allied codes, and gazette links.

### 6.2 Export Printable HTML Report
- **Endpoint**: `GET /api/analysis/:id/report/html`
- **Response**: Pre-styled, audit-grade printable HTML report ready for printing, filing, or PDF export (`Ctrl+P`).

---

## 7. Catalog Ingestion Schema Validator

Validates candidate Indian Standard records before ingestion to ensure zero hallucination, mandatory official sources, and proper typing.

- **Endpoint**: `POST /api/standards/validate-ingestion`
- **Service**: [`standardsIngestionService.ts`](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/backend/src/services/standardsIngestionService.ts)

#### Request Body:
```json
{
  "id": "is-10322-5-3",
  "standard_number": "IS 10322 (Part 5/Sec 3): 2012",
  "title": "Luminaires - Particular Requirements - Luminaires for Road and Street Lighting",
  "category": "Luminaires",
  "scope": "This standard specifies requirements for luminaires for road, street lighting and other public thoroughfares...",
  "source_url": "https://services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/10322-5-3",
  "last_verified": "2026-03-01T00:00:00.000Z",
  "status": "active"
}
```

#### Validation Rules Enforced:
1. `id` and `standard_number` must match valid IS syntax (`IS \d+...`).
2. `source_url` must use secure HTTPS protocol on recognized government or BIS domains (`services.bis.gov.in`, `bis.gov.in`, `egazette.gov.in`, or `crsbis.in`). Non-government URLs are rejected.
3. `last_verified` date must be present and parseable as ISO 8601.
4. Scope cannot be empty.

---

## 8. HTTP Status Codes & Error Handling

| HTTP Status | Meaning | Typical Trigger |
| :--- | :--- | :--- |
| `200 OK` | Success | Request succeeded. Response body contains requested payload. |
| `400 Bad Request` | Invalid Input | Missing required fields, malformed JSON, or unsupported file type. |
| `404 Not Found` | Resource Missing | Non-existent `analysisId` or `standardId`. |
| `422 Unprocessable Entity` | Extraction Limitation | Scanned PDF document without readable text stream. |
| `500 Internal Server Error` | Server Exception | Uncaught runtime error; fallback gracefully engages if database/AI is offline. |

All error responses return structured JSON:
```json
{
  "success": false,
  "error": "Human readable error description",
  "code": "ERROR_CONSTANT_CODE",
  "details": null
}
```
