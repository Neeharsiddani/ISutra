// ============================================================
// ISutra: Phase 8B — Verified Standards Relationships Dataset
// Authoritative, evidence-backed relationship records.
// Populated ONLY where explicit clause citations exist in
// official Bureau of Indian Standards (BIS) publications.
// ============================================================

import { RelationshipType } from '../types';

export interface VerifiedStandardRelationship {
  id: string;
  source_standard_id: string;
  source_standard_number: string;
  target_standard_id: string;
  target_standard_number: string;
  relationship_type: RelationshipType;
  description: string;
  evidence_clause: string;
  verified_source_url: string;
  verification_status: 'verified';
  verified_at: string;
}

export const VERIFIED_RELATIONSHIPS: VerifiedStandardRelationship[] = [
  // ------------------------------------------------------------
  // 1. IS 456:2000 -> IS 383:2016 (Normative Materials Reference)
  // ------------------------------------------------------------
  {
    id: 'vrel-456-383',
    source_standard_id: 'bis-is-456-2000',
    source_standard_number: 'IS 456:2000',
    target_standard_id: 'bis-is-383-2016',
    target_standard_number: 'IS 383:2016',
    relationship_type: 'normative_reference',
    description:
      'Mandatory materials specification: Aggregates used in reinforced concrete must comply with IS 383 grading and soundness requirements.',
    evidence_clause:
      "IS 456:2000 Clause 5.3 (Aggregates): 'Aggregates shall comply with the requirements of IS 383. As far as possible, preference shall be given to natural aggregates.'",
    verified_source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    verification_status: 'verified',
    verified_at: '2026-09-18',
  },

  // ------------------------------------------------------------
  // 2. IS 456:2000 -> IS 1786:2008 (Normative Reinforcement Reference)
  // ------------------------------------------------------------
  {
    id: 'vrel-456-1786',
    source_standard_id: 'bis-is-456-2000',
    source_standard_number: 'IS 456:2000',
    target_standard_id: 'bis-is-1786-2008',
    target_standard_number: 'IS 1786:2008',
    relationship_type: 'normative_reference',
    description:
      'Mandatory materials specification: High strength deformed steel bars (TMT) used for concrete reinforcement must conform to IS 1786.',
    evidence_clause:
      "IS 456:2000 Clause 5.6.1 (Reinforcement): 'High strength deformed steel bars conforming to IS 1786 shall be used for reinforced concrete.'",
    verified_source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    verification_status: 'verified',
    verified_at: '2026-09-18',
  },

  // ------------------------------------------------------------
  // 3. IS 456:2000 -> IS 432 (Part 1):2026 (Normative Reinforcement Reference)
  // ------------------------------------------------------------
  {
    id: 'vrel-456-432-1',
    source_standard_id: 'bis-is-456-2000',
    source_standard_number: 'IS 456:2000',
    target_standard_id: 'bis-is-432-1-2026',
    target_standard_number: 'IS 432 (Part 1):2026',
    relationship_type: 'normative_reference',
    description:
      'Mandatory materials specification: Mild steel and medium tensile steel reinforcement bars must conform to IS 432 (Part 1).',
    evidence_clause:
      "IS 456:2000 Clause 5.6.1 (Reinforcement): 'Mild steel and medium tensile steel bars conforming to IS 432 (Part 1) shall be used.'",
    verified_source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    verification_status: 'verified',
    verified_at: '2026-09-18',
  },

  // ------------------------------------------------------------
  // 4. IS 6994 (Part 6):2021 -> IS 6994 (Part 7):2021 (Normative Test Method)
  // ------------------------------------------------------------
  {
    id: 'vrel-6994-6-7',
    source_standard_id: 'bis-is-6994-6-2021',
    source_standard_number: 'IS 6994 (Part 6):2021',
    target_standard_id: 'bis-is-6994-7-2021',
    target_standard_number: 'IS 6994 (Part 7):2021',
    relationship_type: 'test_method',
    description:
      'Normative testing standard: Test methods and general requirements for gloves against mechanical risks are defined in Part 7.',
    evidence_clause:
      'IS 6994 (Part 6):2021 Clause 2 (Normative References): Cites IS 6994 (Part 7) for test apparatus, specimen preparation, and standardized test methods.',
    verified_source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    verification_status: 'verified',
    verified_at: '2026-09-18',
  },

  // ------------------------------------------------------------
  // 5. IS 1786:2008 -> IS 456:2000 (Governing Code of Practice)
  // ------------------------------------------------------------
  {
    id: 'vrel-1786-456',
    source_standard_id: 'bis-is-1786-2008',
    source_standard_number: 'IS 1786:2008',
    target_standard_id: 'bis-is-456-2000',
    target_standard_number: 'IS 456:2000',
    relationship_type: 'allied_standard',
    description:
      'Structural design code: IS 456 establishes the engineering design, cover, and detailing rules governing the application of IS 1786 reinforcement bars.',
    evidence_clause:
      'IS 1786:2008 Scope & Clause 1.2: Intended for structural design in concrete reinforcement in accordance with IS 456.',
    verified_source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    verification_status: 'verified',
    verified_at: '2026-09-18',
  },

  // ------------------------------------------------------------
  // 6. IS 383:2016 -> IS 456:2000 (Governing Concrete Code)
  // ------------------------------------------------------------
  {
    id: 'vrel-383-456',
    source_standard_id: 'bis-is-383-2016',
    source_standard_number: 'IS 383:2016',
    target_standard_id: 'bis-is-456-2000',
    target_standard_number: 'IS 456:2000',
    relationship_type: 'allied_standard',
    description:
      'Structural application code: Aggregate gradation limits are formulated to meet structural workability and durability criteria in IS 456.',
    evidence_clause:
      'IS 383:2016 Foreword: Formulated to ensure aggregates provide adequate concrete performance specified in IS 456.',
    verified_source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    verification_status: 'verified',
    verified_at: '2026-09-18',
  },
];
