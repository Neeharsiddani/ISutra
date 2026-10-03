# ISutra Regulatory & Standards Compliance Guide

> **Statutory Alignment with Indian Public Procurement Law, Quality Control Orders (QCOs), and Vigilance Guidelines**  
> *Target Audience: Vigilance Officers, Legal Advisors, Procurement Committees, and Compliance Auditors*

---

## ⚖️ 1. Statutory Foundations of Public Procurement in India

Public procurement in India accounts for approximately **20% to 25% of India's GDP**, encompassing Central Ministries, State Governments, Public Sector Enterprises (PSUs), Railways, Defence establishments, and Municipal Corporations.

Procurement officers operate under strict legal and vigilance frameworks designed to ensure economy, quality, transparency, and non-discrimination.

---

### 1.1 General Financial Rules (GFR), 2017 — Rule 144(i)

Under **Rule 144(i)** of the General Financial Rules (GFR, 2017) issued by the Ministry of Finance, Government of India:

> *"The technical specifications of the goods, works or services to be procured shall, to the extent practicable, be based on the national standards published by the Bureau of Indian Standards (BIS), or where such standards do not exist, on other standards such as ISO/IEC."*

#### Operational Implications:
- Citing foreign codes (e.g., ASTM, DIN, BS) when an active Indian Standard (IS) exists is a direct violation of Rule 144(i) and can result in audit observations by the Comptroller and Auditor General (CAG).
- Drafting proprietary or vendor-tailored specifications violates the principle of fair competition.

---

### 1.2 Bureau of Indian Standards Act, 2016 (Act No. 11 of 2016)

The BIS Act 2016 establishes the Bureau of Indian Standards as the National Standards Body of India:
- **Section 10**: Authority to establish and publish Indian Standards.
- **Section 16**: Power of Central Government to mandate compulsory conformity to an Indian Standard under **Quality Control Orders (QCOs)** in the public interest, human safety, animal welfare, or environmental protection.
- **Section 17**: Prohibition on manufacturing, importing, selling, or distributing goods without the BIS Standard Mark (ISI mark) once a QCO has been notified in the Gazette of India.

---

### 1.3 Central Vigilance Commission (CVC) Procurement Directives

The Central Vigilance Commission periodically issues instructions (e.g., CVC Office Order No. 23/07/03 and Master Circulars) on tender specifications:
1. **Ambiguous Specifications Prohibited**: Specifications must be clear, precise, and based on objective performance benchmarks.
2. **Brand Bias Eliminated**: Specifications must not include brand names, catalog numbers, or proprietary parameters that restrict open competition.
3. **Traceable Selection**: Authorities must be able to demonstrate an objective rationale for every cited standard in the tender dossier.

---

## 📜 2. Quality Control Orders (QCOs) & Compulsory Schemes

Indian Standards are categorized into two regulatory regimes: **Voluntary Standards** and **Mandatory Statutory Standards**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        REGULATORY REGIMES IN BIS                       │
│                                                                        │
│  1. VOLUNTARY CERTIFICATION                                            │
│     • Default status for general Indian Standards                      │
│     • Manufacturers opt into ISI certification voluntarily              │
│     • Buyers can mandate ISI certification via tender conditions        │
│                                                                        │
│  2. MANDATORY STATUTORY REGIMES (Gazette Notified)                     │
│     ├── Quality Control Orders (QCOs) - BIS Scheme I (ISI Mark)        │
│     │   • Steel, Cement, Electrical Cables, Safety Footwear            │
│     │   • Mandatory under Section 16, BIS Act 2016                     │
│     └── Compulsory Registration Scheme (CRS) - BIS Scheme II           │
│         • MeitY notified electronics, LED products, IT hardware        │
│         • Requires registration on crsbis.in                           │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Quality Control Orders (QCOs)
Notified by line Ministries (e.g., Ministry of Steel, DPIIT, Ministry of Power):
- **Steel QCO**: E.g., **IS 1786** (High strength deformed steel bars for concrete reinforcement). All rebar procured for infrastructure must carry an authentic ISI mark.
- **Cables QCO**: E.g., **IS 694** (PVC insulated cables) and **IS 7098** (Crosslinked polyethylene insulated cables).
- **Civil Infrastructure**: E.g., **IS 456** (Plain and reinforced concrete) and **IS 383** (Coarse and fine aggregates).

### 2.2 Compulsory Registration Scheme (CRS)
Governed by the Ministry of Electronics and Information Technology (MeitY) and BIS:
- Covers electronic luminaires, LED drivers, batteries, and display units.
- Manufacturers must obtain registration numbers before goods can be cleared for import or domestic sale.

---

## 🛡️ 3. ISutra's Regulatory Intelligence Architecture

Implemented in [`regulatoryService.ts`](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/backend/src/services/regulatoryService.ts), ISutra evaluates regulatory applicability through a strict, transparent model:

### 3.1 Strict 3-State Regulatory Classification

```
┌────────────────────────────────────────────────────────────────────────┐
│  [1] VERIFIED APPLICABILITY                                           │
│      • Verified Central Government Gazette QCO in active force        │
│      • Tender MUST mandate ISI Mark / CRS Registration                │
│                                                                        │
│  [2] VERIFICATION REQUIRED                                            │
│      • QCO notified with a future enforcement date, or in transition  │
│      • Officer must verify gazette deadline on egazette.gov.in        │
│                                                                        │
│  [3] NO VERIFIED REGULATORY RECORD                                    │
│      • Standard operates under voluntary certification regime         │
│      • Department may still mandate certification by tender clause     │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Non-Contamination Principle
In ISutra, **regulatory status never contaminates technical matching scores**:
- A mandatory QCO does **not** make an irrelevant standard match a tender.
- The 6-factor deterministic matcher evaluates technical engineering suitability independently.
- The regulatory status is displayed as an independent statutory compliance badge and audit alert.

---

## 🏛️ 4. Anti-Hallucination Guardrails & Legal Safety Boundaries

### Why Software Cannot Issue "Compliance Certificates"
A recurring legal risk in procurement AI is making false claims that a product or tender is "compliant with Indian Standards".

> [!CAUTION]  
> **Statutory Disclaimer**: Legally binding certification of conformity to an Indian Standard can only be granted by the **Bureau of Indian Standards** following factory audits and independent physical testing in NABL-accredited laboratories.

### How ISutra Protects Procurement Authorities:
1. **Reference Coverage Taxonomy**:
   The system strictly designates its gap audit as **Reference Coverage** across four objective states:
   - `supported`
   - `not_supported`
   - `not_available`
   - `needs_verification`
   It **never** generates a "Compliance Certificate" or "Pass/Fail Score".
2. **Zero-Hallucination Verification Layer**:
   AI extraction is restricted to understanding user text. All standard numbers, clauses, and gazette links are fetched directly from the curated and verified dataset (`verifiedStandards.ts`, `verifiedRegulatoryRecords.ts`).
3. **Official BIS Ground Truth Primacy**:
   Direct HTTPS hyperlinks to `bis.gov.in`, `services.bis.gov.in`, and `egazette.gov.in` are embedded alongside every recommended standard, allowing officers to verify current gazette standing with a single click.

---

## 📊 5. Audit Trail & CAG/CVC Scrutiny Checklist

When tenders are subjected to audit scrutiny by the Central Vigilance Commission (CVC) or the Comptroller and Auditor General (CAG), the procurement file must provide a verifiable rationale:

| Audit Question | How ISutra Provides Verifiable Defense |
| :--- | :--- |
| **Why was this specific Indian Standard selected?** | The **"Why This Standard?"** panel provides the exact mathematical point contribution across all six signals (Product 30%, Title/Scope 25%, Application 15%, Environment 10%, Technical 10%, Safety 10%). |
| **Was the standard active and unwithdrawn at tender publication?** | The **5-Stage Lifecycle Stepper** records the base edition year, periodic reaffirmation date, and latest gazette amendments. |
| **Did the specification create an unfair vendor monopoly?** | The system maps specifications to neutral, consensus-based national standards rather than proprietary vendor specifications. |
| **Were mandatory quality control orders verified?** | The **Regulatory Intelligence Layer** flags active QCOs and CRS requirements with official gazette order citations. |
| **Were all testing and safety codes cited?** | The **Allied Standards Explorer** resolves normative references, laboratory test methods (e.g. IS 10810), and safety codes (e.g. IS/IEC 60529). |
