# ISutra Documentation Suite

Welcome to the comprehensive documentation suite for **ISutra** — the AI-powered recommendation and intelligence engine for identifying applicable Indian Standards (IS) for public procurement specifications and tender drafting (Smart India Hackathon Problem Statement SIH26108).

---

## 📚 Documentation Index

| Document | Target Audience | Key Topics Covered |
| :--- | :--- | :--- |
| **[Master Architecture & Specification](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/docs/ARCHITECTURE_AND_SPECIFICATION.md)** | System Architects, Engineers, Evaluators | AI Perception vs. Deterministic Decision Engine, 6-factor mathematical scorer, Specificity Tiers (1–6), contradiction cuts, 5-stage traceability chain, and database schemas. |
| **[REST API Reference & Integration Guide](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/docs/API_REFERENCE.md)** | Backend Engineers, Integrators, e-Procurement Teams | Complete HTTP endpoint catalog, request/response JSON schemas, error handling, document upload protocols, and GeM/CPP portal integration patterns. |
| **[Procurement Officer & User Workflow Guide](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/docs/USER_WORKFLOW_GUIDE.md)** | Procurement Officers, Tender Committees, Evaluators | End-to-end user journey: multi-modal ingestion, Human-in-the-Loop review, interpreting scores, gap analysis, allied standards explorer, and audit report generation. |
| **[Developer & Operations Runbook](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/docs/DEVELOPER_OPERATIONS_GUIDE.md)** | Developers, DevOps, QA Engineers | Local setup, environment configuration, database seeding, running 280+ automated test assertions, catalog ingestion validation, and Vercel/Docker deployment. |
| **[Regulatory & Standards Compliance Guide](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/docs/REGULATORY_COMPLIANCE_GUIDE.md)** | Legal Advisors, Vigilance Officers, Compliance Auditors | GFR 2017 Rule 144(i), BIS Act 2016, Quality Control Orders (QCOs), MeitY CRS scheme, Reference Coverage taxonomy, and anti-hallucination guardrails. |
| **[System Architecture Summary](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/docs/ISUTRA_SYSTEM_DOCUMENTATION.md)** | Quick Technical Brief | High-level system architecture, automated test matrix, deployment specifications, and project overview. |

---

## 🏛 Quick System Overview

```
                                ┌──────────────────────────────────────┐
                                │          PROCUREMENT INPUT           │
                                │  • Natural text / Tender clauses     │
                                │  • PDF / DOCX Digital Documents      │
                                │  • Multilingual (Hindi, Telugu, En)  │
                                └──────────────────┬───────────────────┘
                                                   │
                                                   ▼
                                ┌──────────────────────────────────────┐
                                │        1. AI PERCEPTION LAYER        │
                                │  • Gemini 2.5 Flash / OpenAI / Regex │
                                │  • Extracts 20+ Structured Dimensions │
                                │  • Strictly ZERO Hallucination       │
                                └──────────────────┬───────────────────┘
                                                   │
                                                   ▼
                                ┌──────────────────────────────────────┐
                                │  2. HUMAN-IN-THE-LOOP REVIEW BARRIER │
                                │  • Officer reviews & edits parameters│
                                │  • Flags uncertain parameters        │
                                │  • AI never auto-commits contracts   │
                                └──────────────────┬───────────────────┘
                                                   │
                                                   ▼
                                ┌──────────────────────────────────────┐
                                │   3. DETERMINISTIC DECISION ENGINE   │
                                │  • 6-Signal Mathematical Scorer      │
                                │  • Specificity Tiers (1–6)           │
                                │  • Contradiction Penalty Elimination │
                                └──────────────────┬───────────────────┘
                                                   │
                                                   ▼
                                ┌──────────────────────────────────────┐
                                │    4. AUDIT & INTELLIGENCE LAYER     │
                                │  • 5-Stage Traceability Chain        │
                                │  • 4-State Reference Coverage Gap    │
                                │  • Allied & Normative Standards Graph│
                                │  • 5-Stage Lifecycle Stepper         │
                                │  • Mandatory QCO / CRS Mandates      │
                                └──────────────────┬───────────────────┘
                                                   │
                                                   ▼
                                ┌──────────────────────────────────────┐
                                │   5. OFFICIAL BIS STATUTORY TRUTH    │
                                │  • Direct bis.gov.in Gazette links   │
                                │  • Zero fabricated standards/clauses │
                                └──────────────────────────────────────┘
```

---

## ⚡ Quick Navigation by Role

- **For Hackathon Judges & Evaluators**:
  1. Start with the [Procurement Officer & User Workflow Guide](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/docs/USER_WORKFLOW_GUIDE.md) to understand the practical problem solved.
  2. Inspect the [Architecture & Specification](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/docs/ARCHITECTURE_AND_SPECIFICATION.md) to review the mathematical formula and anti-hallucination safeguards.
  3. Review the test suite execution in the [Developer Runbook](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/docs/DEVELOPER_OPERATIONS_GUIDE.md#running-the-automated-test-suites).

- **For Full-Stack Developers & System Integrators**:
  1. Set up the repository using the [Developer Runbook](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/docs/DEVELOPER_OPERATIONS_GUIDE.md).
  2. Explore endpoints using the [REST API Reference](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/docs/API_REFERENCE.md).
  3. Understand the data model and scoring rules in [Architecture & Specification](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/docs/ARCHITECTURE_AND_SPECIFICATION.md).

- **For Procurement Officers & Compliance Auditors**:
  1. Learn how to draft tenders safely with the [Procurement Officer Guide](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/docs/USER_WORKFLOW_GUIDE.md).
  2. Review the statutory mandates and CVC rules in the [Regulatory & Compliance Guide](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/docs/REGULATORY_COMPLIANCE_GUIDE.md).
