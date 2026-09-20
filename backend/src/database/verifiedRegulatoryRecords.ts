// ============================================================
// ISutra — Verified Regulatory & Certification Records
// Authoritative Government Orders, Quality Control Orders (QCOs),
// Compulsory Registration Scheme (CRS), and Hallmarking Orders.
// Regulated information: Curated strictly from official sources.
// ============================================================

export type RegulationType =
  | 'bis_product_certification'
  | 'crs'
  | 'hallmarking'
  | 'qco';

export type VerificationStatus =
  | 'verified'
  | 'verification_required'
  | 'no_verified_record'
  | 'not_assessed';

export interface VerifiedRegulatoryRecord {
  id: string;
  standard_id: string;
  standard_number: string;
  product_scope: string;
  regulation_type: RegulationType;
  regulation_name: string;
  authority: string;
  applicability_description: string;
  effective_date?: string;
  source: string;
  source_url: string;
  verification_status: VerificationStatus;
  last_verified_date: string;
  notes_limitations?: string;
}

export const VERIFIED_REGULATORY_RECORDS: VerifiedRegulatoryRecord[] = [
  // ------------------------------------------------------------
  // 1. IS 1786:2008 — TMT Rebars (Ministry of Steel QCO)
  // ------------------------------------------------------------
  {
    id: 'vreg-1786-steel-qco',
    standard_id: 'bis-is-1786-2008',
    standard_number: 'IS 1786:2008',
    product_scope: 'High strength deformed steel bars and wires for concrete reinforcement (TMT rebars)',
    regulation_type: 'bis_product_certification',
    regulation_name: 'Steel and Steel Products (Quality Control) Order, 2020 / 2024',
    authority: 'Ministry of Steel, Government of India',
    applicability_description: 'Mandatory BIS Product Certification Mark (Scheme I / ISI Mark). Manufacture, import, distribution, and sale prohibited without ISI mark under Section 16 of the Bureau of Indian Standards Act, 2016.',
    effective_date: '2020-12-18',
    source: 'Gazette of India, S.O. 4637(E) / Official BIS QCO Register',
    source_url: 'https://www.bis.gov.in/product-certification/products-under-compulsory-certification/',
    verification_status: 'verified',
    last_verified_date: '2026-09-15',
    notes_limitations: 'Mandatory Scheme I certification applies to all domestic manufacturers and foreign manufacturers importing into India.',
  },

  // ------------------------------------------------------------
  // 2. IS 694:2010 — PVC Insulated Cables (DPIIT Cables QCO)
  // ------------------------------------------------------------
  {
    id: 'vreg-694-cables-qco',
    standard_id: 'bis-is-694-2010',
    standard_number: 'IS 694:2010',
    product_scope: 'Polyvinyl chloride insulated cables for working voltages up to and including 1100 V',
    regulation_type: 'bis_product_certification',
    regulation_name: 'Electrical Wires and Cables (Quality Control) Order',
    authority: 'Department for Promotion of Industry and Internal Trade (DPIIT), Ministry of Commerce and Industry',
    applicability_description: 'Mandatory BIS Product Certification Mark (Scheme I / ISI Mark). Wires and cables falling under IS 694 cannot be manufactured, imported, or sold without bearing the Standard Mark.',
    effective_date: '2023-09-08',
    source: 'DPIIT Notification / Gazette of India S.O. 2095(E)',
    source_url: 'https://www.bis.gov.in/product-certification/products-under-compulsory-certification/',
    verification_status: 'verified',
    last_verified_date: '2026-09-15',
    notes_limitations: 'Exemptions apply only for micro and small enterprises within stipulated transition timelines per official notification.',
  },

  // ------------------------------------------------------------
  // 3. IS 15298 (Part 2):2024 — Safety Footwear (DPIIT Footwear QCO)
  // ------------------------------------------------------------
  {
    id: 'vreg-15298-2-footwear-qco',
    standard_id: 'bis-is-15298-2-2024',
    standard_number: 'IS 15298 (Part 2):2024',
    product_scope: 'Personal protective equipment — Safety footwear with toecap resistant to impact of 200 J',
    regulation_type: 'bis_product_certification',
    regulation_name: 'Footwear made from Leather and Other Materials (Quality Control) Order, 2024',
    authority: 'Department for Promotion of Industry and Internal Trade (DPIIT), Ministry of Commerce and Industry',
    applicability_description: 'Mandatory BIS Product Certification Mark (Scheme I / ISI Mark). Safety footwear must conform to IS 15298 (Part 2) and bear the Standard Mark under licence from BIS.',
    effective_date: '2024-07-01',
    source: 'DPIIT Order / Gazette of India S.O. 1245(E)',
    source_url: 'https://www.bis.gov.in/product-certification/products-under-compulsory-certification/',
    verification_status: 'verified',
    last_verified_date: '2026-09-15',
    notes_limitations: 'Transition deadlines apply for micro and small enterprises; verify current enforcement date for small-scale suppliers.',
  },

  // ------------------------------------------------------------
  // 4. IS 16102 (Part 1):2026 — Self-Ballasted LED Lamps (MeitY CRS)
  // ------------------------------------------------------------
  {
    id: 'vreg-16102-1-meity-crs',
    standard_id: 'bis-is-16102-1-2026',
    standard_number: 'IS 16102 (Part 1):2026',
    product_scope: 'Self-ballasted LED lamps for general lighting services (safety requirements)',
    regulation_type: 'crs',
    regulation_name: 'Electronics and Information Technology Goods (Requirement for Compulsory Registration) Order, 2021',
    authority: 'Ministry of Electronics and Information Technology (MeitY), Government of India',
    applicability_description: 'Mandatory Compulsory Registration Scheme (CRS / Scheme II). Covered self-ballasted LED lamps must be registered with BIS following testing at BIS-recognized laboratories and display the Standard Mark (R-number).',
    effective_date: '2015-05-07',
    source: 'MeitY Notification S.O. 2905(E) / Official BIS CRS Register',
    source_url: 'https://www.crsbis.in/BIS/products-lic.do',
    verification_status: 'verified',
    last_verified_date: '2026-09-15',
    notes_limitations: 'Registration under CRS is distinct from Scheme I ISI mark; requires manufacturer registration and laboratory test report.',
  },

  // ------------------------------------------------------------
  // 5. IS 2062 (Part 1):2025 — Structural Steel (Ministry of Steel QCO)
  // ------------------------------------------------------------
  {
    id: 'vreg-2062-1-steel-qco',
    standard_id: 'bis-is-2062-1-2025',
    standard_number: 'IS 2062 (Part 1):2025',
    product_scope: 'Hot rolled medium and high tensile structural steel plates, shapes, and sections',
    regulation_type: 'bis_product_certification',
    regulation_name: 'Steel and Steel Products (Quality Control) Order, 2020 / 2024',
    authority: 'Ministry of Steel, Government of India',
    applicability_description: 'Mandatory BIS Product Certification Mark (Scheme I / ISI Mark). Hot rolled structural steel sections must bear the Standard Mark under licence from BIS.',
    effective_date: '2020-12-18',
    source: 'Gazette of India S.O. 4637(E) / Official BIS QCO Portal',
    source_url: 'https://www.bis.gov.in/product-certification/products-under-compulsory-certification/',
    verification_status: 'verified',
    last_verified_date: '2026-09-15',
    notes_limitations: 'Mandatory certification applies across all designated grades of structural steel.',
  },

  // ------------------------------------------------------------
  // 6. IS 6909:2026 — Supersulphated Cement (DPIIT Cement QCO)
  // ------------------------------------------------------------
  {
    id: 'vreg-6909-cement-qco',
    standard_id: 'bis-is-6909-2026',
    standard_number: 'IS 6909:2026',
    product_scope: 'Supersulphated cement for construction and chemical-resistant works',
    regulation_type: 'bis_product_certification',
    regulation_name: 'Cement (Quality Control) Order, 2003 / 2024',
    authority: 'Department for Promotion of Industry and Internal Trade (DPIIT), Ministry of Commerce and Industry',
    applicability_description: 'Mandatory BIS Product Certification Mark (Scheme I / ISI Mark). All cement varieties manufactured or sold in India must conform to applicable Indian Standards and bear the Standard Mark.',
    effective_date: '2004-02-17',
    source: 'DPIIT Cement QCO / Gazette of India S.O. 191(E)',
    source_url: 'https://www.bis.gov.in/product-certification/products-under-compulsory-certification/',
    verification_status: 'verified',
    last_verified_date: '2026-09-15',
    notes_limitations: 'Prohibits any person from manufacturing or storing for sale or distributing cement without valid BIS license.',
  },
];
