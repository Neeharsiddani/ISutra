# ISutra Procurement Officer & User Workflow Guide

> **A Practitioner's Manual for Drafting Compliant, Audit-Proof Tender Specifications**  
> *Target Audience: Public Procurement Officers, PSU Tender Committees, Municipal Engineers, and Smart India Hackathon (SIH) Evaluators*

---

## 📌 Introduction & Problem Statement

Public procurement in India must adhere to **Rule 144(i) of the General Financial Rules (GFR, 2017)** and the **Bureau of Indian Standards Act, 2016**. These statutory regulations dictate that all technical requirements and tender schedules must cite active Indian Standards (IS) wherever available.

However, procurement officers face recurring challenges:
1. **Manual Inefficiencies**: Sifting through thousands of standards is time-consuming.
2. **Obsolescence**: Copying text from past tenders introduces superseded standard numbers or withdrawn editions.
3. **Audit Disallowances**: The Central Vigilance Commission (CVC) and Comptroller and Auditor General (CAG) penalize tenders that cite ambiguous, proprietary, or unverified clauses.
4. **Linguistic Fragmentation**: Tender notices received from state departments in Hindi or Telugu cannot easily be mapped to English BIS catalogs.

**ISutra** acts as an intelligent decision-support copilot that transforms unstructured procurement requirements into verified, audit-grade Indian Standards recommendations.

---

## 🗺️ The Complete 7-Step Officer Workflow

```
┌────────────────────────────────────────────────────────────────────────┐
│  Step 1: Input Tender Requirements (Text / PDF / DOCX / Multilingual)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Step 2: Human-in-the-Loop Parameter Review & Confirmation             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Step 3: Review Ranked Recommendations & "Why This Standard?" Proof     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Step 4: Conduct 4-State Reference Coverage Gap Analysis               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Step 5: Explore Allied, Normative & Testing Standards                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Step 6: Verify Lifecycle Timeline, Amendments & Mandatory QCO Status  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Step 7: Export Audit-Grade Procurement Intelligence Dossier           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Input Tender Requirements

Navigate to the **Analyze** page ([`AnalyzePage.tsx`](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/frontend/src/pages/AnalyzePage.tsx)).

ISutra supports two input modalities:

### Option A: Free-Text Specification
Paste technical specification clauses, tender items, or descriptions directly into the text editor. You can draft in:
- **English**: Standard engineering and procurement terms.
- **Hindi (हिंदी)**: e.g., *"120W आउटडोर एलईडी स्ट्रीट लाइट ल्यूमिनेयर, IP66 जलरोधी, 10kV सर्ज प्रोटेक्शन"*.
- **Telugu (తెలుగు)**: e.g., *"120W అవుట్‌డోర్ LED స్ట్రీట్ లైట్ లూమినైర్, IP66 రక్షణ, 10kV సర్జ్ ప్రొటెక్షన్"*.

The system's Indic translation layer ([`multilingualService.ts`](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/backend/src/services/ai/multilingualService.ts)) automatically normalizes regional terminology to canonical engineering classifications while preserving the original source text snippet for audit trails.

### Option B: Document Ingestion
Drag and drop digital tender schedules:
- Supported formats: `.pdf`, `.docx`, `.doc` (up to 15 MB).
- The system verifies the internal file signature (magic bytes) to ensure file security and parses text streams with structure preservation.

> [!NOTE]  
> **Scanned Document Handling**: If an uploaded PDF contains only flattened images/scans without a digital text layer, the system returns an informative notice (`422 Unprocessable Entity`) explaining that the document is scanned and advising the user to upload a digital export or enable server-side OCR.

---

## Step 2: Human-in-the-Loop Review Barrier

After ingestion, the system loads the **Requirement Review Interface** ([`RequirementReviewPage.tsx`](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/frontend/src/pages/RequirementReviewPage.tsx)).

### Why Human Review is Mandatory:
In government procurement, an autonomous AI must never be allowed to bind a statutory tender contract. The AI acts as an **accelerator of perception**, extracting 20+ dimensions:
- Product Name & Taxonomy (Category, Subcategory)
- Application Domain (Highway, Residential, Industrial, High-Mast)
- Operating Environment (Outdoor, Marine/Coastal, High-Ambient Temp)
- Technical Parameters (Wattage, Voltage, Efficacy, CCT, Conductor Size)
- Safety & Ingress Ratings (IP Rating, Surge Protection, Fire Retardance)
- Mandatory Testing Protocols (Type Tests, Routine Tests)

### Officer Actions in the Review Interface:
1. **Verify Values**: Review extracted values against your original tender draft.
2. **Edit Parameters**: Click any field to update values (e.g., change wattage from 120W to 150W).
3. **Add Missing Parameters**: Use the **"+ Add Parameter"** button to supply criteria that the tender text omitted.
4. **Flag Uncertainty**: Mark any parameter with **"Needs Review"** if clarification is required from field engineers.
5. **Confirm Requirements**: Click **"Confirm & Find Matching Standards"**. 

> [!IMPORTANT]  
> The recommendation engine matches **strictly and exclusively** against the confirmed parameters. Unchecked AI outputs are never sent to the decision engine.

---

## Step 3: Evaluating Recommendations & Explainability

On the **Recommendations Page** ([`RecommendationsResultsPage.tsx`](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/frontend/src/pages/RecommendationsResultsPage.tsx)), standards are ranked by relevance.

### Understanding the 6-Factor Deterministic Score:
Every score ($S \in [0.0, 1.0]$) is calculated by a weighted linear combination across six signals:

| Factor | Weight | What the Engine Validates |
| :--- | :---: | :--- |
| **Product / Category** | **30%** | Does the standard govern this exact equipment family (e.g., Luminaire vs. Cable vs. Switchgear)? |
| **Keywords, Title & Scope** | **25%** | Do the title and scope statement in official BIS publications explicitly cite the requested terminology? |
| **Application Domain Fit** | **15%** | Is the standard designed for the intended installation (e.g., Roadway/Street lighting vs. Mine lighting)? |
| **Environmental Context** | **10%** | Does the standard contain clauses covering outdoor, dust, water, or thermal extremes? |
| **Technical Parameters** | **10%** | Does the standard specify electrical limits, mechanical ratings, or conductor cross-sections? |
| **Safety & Testing** | **10%** | Are type tests, ingress protection tests, and insulation resistance tests specified? |

### Specificity Tiers (Tiers 1 to 6):
ISutra prevents generic standards (such as general test methods or component codes) from outranking specialized equipment codes:
- **Tier 1 (Exact Product & Application Match)**: Primary standard directly governing the equipment.
- **Tier 2 (Close Subcategory Match)**: Closely related standard in the same subcategory.
- **Tier 3 (Broader Equipment Family)**: General standard covering the broader equipment group.
- **Tier 4 to 6 (Allied / Component / General Test Method)**: Normative reference or component-level code.

### "Why This Standard?" Deep Dive:
Click the **"Why This Standard?"** button on any card to reveal the factor point breakdown:
- View the exact points earned (e.g., Product Category: `+0.300 / 0.300`, Application Domain: `+0.150 / 0.150`).
- Review the specific evidence phrases extracted from the standard's text.
- Inspect the unbroken **5-Stage Audit Trail**:
  `User Requirement` $\rightarrow$ `Extracted Parameter` $\rightarrow$ `Scoring Signal` $\rightarrow$ `Standard Clause` $\rightarrow$ `Official BIS URL`.

---

## Step 4: Requirement Gap Analysis

A common cause of tender litigation is assuming a single Indian Standard covers every requirement in a procurement schedule.

Click **"Run Gap Analysis"** on a standard to enter the **Requirement Gap Analysis Page** ([`RequirementGapAnalysisPage.tsx`](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/frontend/src/pages/RequirementGapAnalysisPage.tsx)).

### The 4-State Reference Coverage Taxonomy:
Every confirmed parameter is audited against the standard's verified clauses:

1. **`supported` (Green)**: The parameter is explicitly governed and tested within this standard (e.g., Ingress Protection IP66 under IS 10322 Part 5 Sec 3).
2. **`not_supported` (Red)**: The parameter is contradicted or excluded by the standard (e.g., specifying 33kV for a standard restricted to 1.1kV).
3. **`not_available` (Amber)**: The standard does not govern this dimension (e.g., safety standard IS 10322 does not prescribe photometric efficacy in lm/W; that is governed by performance standard IS 16107 Part 2 Sec 1).
4. **`needs_verification` (Blue)**: The clause exists in the standard but requires officer verification against specific project schedules or manufacturer type-test certificates.

> [!CAUTION]  
> **Statutory Notice**: ISutra strictly labels this matrix as **Reference Coverage** and explicitly disclaims issuing a "Compliance Certificate". Only BIS-licensed laboratories can certify physical product compliance.

---

## Step 5: Allied, Normative & Testing Standards

Complex equipment tenders require citing complementary standards to ensure comprehensive quality assurance.

Access the **Allied Standards Explorer** ([`StandardDetailsPage.tsx`](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/frontend/src/pages/StandardDetailsPage.tsx)):
- **Normative References**: Compulsory parent standards referenced in Clause 2 of the primary standard.
- **Test Methods**: Standards governing physical, chemical, or electrical laboratory testing (e.g., IS 10810 series for cable testing).
- **Safety Standards**: Fundamental electrical safety or fire retardancy codes (e.g., IS/IEC 60529 for Degrees of Protection).
- **Installation Standards**: National Electrical Code (NEC) or CPWD guidelines for civil installation and earthing.

Each relationship displays an **Evidence Clause** and direct hyperlinks to official BIS gazette records, ensuring no relationship is fabricated.

---

## Step 6: Lifecycle Timeline & Mandatory QCO Verification

Before issuing a tender, officers must ensure they are not citing withdrawn standards and that mandatory certification orders are satisfied.

### Visual 5-Stage Lifecycle Stepper:
The system tracks the evolution of each standard:
$$\text{Base Standard} \longrightarrow \text{Revision (Rev 1, 2...)} \longrightarrow \text{Amendments} \longrightarrow \text{Reaffirmation} \longrightarrow \text{Official Gazette}$$
- **Reaffirmation Tracking**: Standards are reviewed every 5 years by BIS sectional committees. ISutra shows the latest reaffirmation year (e.g., IS 456 reaffirmed in 2025).
- **Gazette Amendment Tracking**: Displays all published amendments with effective dates.

### Regulatory Intelligence (Quality Control Orders):
Under the BIS Act 2016, Ministries publish mandatory **Quality Control Orders (QCOs)** in the Gazette of India:
- **`VERIFIED APPLICABILITY` (Mandatory)**: Products under this standard (e.g., Steel TMT bars under IS 1786, or Footwear under IS 15844) cannot be legally manufactured, imported, or procured without a valid BIS Standard Mark (ISI mark).
- **`VERIFICATION REQUIRED`**: The standard is subject to an upcoming or phased QCO enforcement window.
- **`NO VERIFIED REGULATORY RECORD`**: Standard operates under voluntary certification unless mandated by specific departmental tender rules.

---

## Step 7: Exporting Audit-Grade Intelligence Reports

Once the review and standard selection are finalized, click **"Generate Procurement Report"**.

### Printable Evaluation Report Features:
- **Clean Government Header**: Formatted for institutional filing and committee reviews.
- **Full Traceability Matrix**: Proves to vigilance and audit authorities that standards were selected objectively through mathematical criteria.
- **Identified Specification Gaps**: Lists allied standards that must be added to the tender to cover gaps in the primary code.
- **Direct Gazette Links**: Contains verified `https://services.bis.gov.in` and `https://egazette.gov.in` hyperlinks for instant officer verification.
- **Exporting Options**: Click **"Print / Save PDF"** to save an audit dossier directly into your official e-Office or tender management folder.
