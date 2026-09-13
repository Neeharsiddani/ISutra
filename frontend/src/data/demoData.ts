// ============================================================
// IS Standards AI — Demo Data
// Phase 1: Clearly labeled demonstration data
// NOT official Indian Standards information
// ============================================================

import type {
  Standard,
  Recommendation,
  Amendment,
  Certification,
  StandardRelationship,
} from '../types';

// ============================================================
// DEMO STANDARDS
// These are SAMPLE records for UI demonstration only.
// They do NOT represent real Indian Standards.
// ============================================================

export const DEMO_STANDARDS: Standard[] = [
  {
    id: 'demo-std-001',
    is_number: 'DEMO-IS-001',
    title: '[DEMO] General Requirements for LED Luminaires — Street Lighting',
    scope:
      'This demo standard covers general requirements for LED luminaires used in street and area lighting applications. This is NOT a real Indian Standard.',
    category: 'Electrical — Lighting',
    status: 'demo',
    edition: 'Demo Edition 1.0',
    publication_date: '2024-01-01',
    last_updated: '2024-01-01',
    source_url: '',
    source_name: 'Demo Data — Not Official',
    description:
      'Demo standard for LED street lighting requirements. This data is for UI demonstration purposes only and does not represent any official BIS standard.',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'demo-std-002',
    is_number: 'DEMO-IS-002',
    title: '[DEMO] Performance Requirements for LED Modules — General Lighting',
    scope:
      'This demo standard covers performance requirements for LED modules used in general lighting. This is NOT a real Indian Standard.',
    category: 'Electrical — Lighting',
    status: 'demo',
    edition: 'Demo Edition 1.0',
    publication_date: '2024-01-01',
    last_updated: '2024-01-01',
    source_url: '',
    source_name: 'Demo Data — Not Official',
    description:
      'Demo standard for LED module performance. This data is for UI demonstration purposes only.',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'demo-std-003',
    is_number: 'DEMO-IS-003',
    title: '[DEMO] Safety Requirements for Electrical Luminaires',
    scope:
      'This demo standard covers safety requirements for luminaires and related accessories. This is NOT a real Indian Standard.',
    category: 'Electrical — Safety',
    status: 'demo',
    edition: 'Demo Edition 1.0',
    publication_date: '2023-06-15',
    last_updated: '2023-06-15',
    source_url: '',
    source_name: 'Demo Data — Not Official',
    description:
      'Demo standard for luminaire safety requirements. For UI demonstration purposes only.',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'demo-std-004',
    is_number: 'DEMO-IS-004',
    title: '[DEMO] Ingress Protection Classification for Enclosures',
    scope:
      'This demo standard covers the classification of degrees of protection provided by enclosures. This is NOT a real Indian Standard.',
    category: 'Electrical — General',
    status: 'demo',
    edition: 'Demo Edition 1.0',
    publication_date: '2022-03-10',
    last_updated: '2023-01-15',
    source_url: '',
    source_name: 'Demo Data — Not Official',
    description:
      'Demo standard for IP ratings and enclosure protection classification. For UI demonstration only.',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'demo-std-005',
    is_number: 'DEMO-IS-005',
    title: '[DEMO] Test Methods for Photometric Performance of Luminaires',
    scope:
      'This demo standard covers test methods for measuring photometric performance. This is NOT a real Indian Standard.',
    category: 'Electrical — Testing',
    status: 'demo',
    edition: 'Demo Edition 1.0',
    publication_date: '2023-09-01',
    last_updated: '2023-09-01',
    source_url: '',
    source_name: 'Demo Data — Not Official',
    description:
      'Demo standard for photometric testing methods. For UI demonstration purposes only.',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'demo-std-006',
    is_number: 'DEMO-IS-006',
    title: '[DEMO] Installation Requirements for Street Lighting Systems',
    scope:
      'This demo standard covers installation requirements for outdoor street lighting systems. This is NOT a real Indian Standard.',
    category: 'Electrical — Installation',
    status: 'demo',
    edition: 'Demo Edition 1.0',
    publication_date: '2023-04-20',
    last_updated: '2023-04-20',
    source_url: '',
    source_name: 'Demo Data — Not Official',
    description:
      'Demo standard for street lighting installation. For UI demonstration purposes only.',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// ============================================================
// DEMO RECOMMENDATIONS
// ============================================================

export const DEMO_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'demo-rec-001',
    analysis_request_id: 'demo-analysis-001',
    standard_id: 'demo-std-001',
    relevance_score: 0.95,
    reason:
      'Recommended because the specification describes outdoor LED street lighting with specific wattage and weather-resistance requirements. This demo standard covers general requirements for such luminaires.',
    rank: 1,
    category: 'recommended',
    created_at: '2024-01-01T00:00:00Z',
    standard: DEMO_STANDARDS[0],
  },
  {
    id: 'demo-rec-002',
    analysis_request_id: 'demo-analysis-001',
    standard_id: 'demo-std-002',
    relevance_score: 0.88,
    reason:
      'Recommended because LED module performance requirements are directly applicable to the specified LED lighting system.',
    rank: 2,
    category: 'recommended',
    created_at: '2024-01-01T00:00:00Z',
    standard: DEMO_STANDARDS[1],
  },
  {
    id: 'demo-rec-003',
    analysis_request_id: 'demo-analysis-001',
    standard_id: 'demo-std-003',
    relevance_score: 0.82,
    reason:
      'Safety standards are applicable to all electrical luminaires including the specified outdoor LED street lighting system.',
    rank: 3,
    category: 'safety',
    created_at: '2024-01-01T00:00:00Z',
    standard: DEMO_STANDARDS[2],
  },
  {
    id: 'demo-rec-004',
    analysis_request_id: 'demo-analysis-001',
    standard_id: 'demo-std-004',
    relevance_score: 0.78,
    reason:
      'Weather resistance requirement in the specification necessitates ingress protection classification (IP rating) standards.',
    rank: 4,
    category: 'related',
    created_at: '2024-01-01T00:00:00Z',
    standard: DEMO_STANDARDS[3],
  },
  {
    id: 'demo-rec-005',
    analysis_request_id: 'demo-analysis-001',
    standard_id: 'demo-std-005',
    relevance_score: 0.72,
    reason:
      'Test methods for verifying photometric performance of the LED luminaire as specified.',
    rank: 5,
    category: 'testing',
    created_at: '2024-01-01T00:00:00Z',
    standard: DEMO_STANDARDS[4],
  },
  {
    id: 'demo-rec-006',
    analysis_request_id: 'demo-analysis-001',
    standard_id: 'demo-std-006',
    relevance_score: 0.68,
    reason:
      'Pole-mounted installation requirement in the specification maps to installation standards for street lighting systems.',
    rank: 6,
    category: 'installation',
    created_at: '2024-01-01T00:00:00Z',
    standard: DEMO_STANDARDS[5],
  },
];

// ============================================================
// DEMO AMENDMENTS
// ============================================================

export const DEMO_AMENDMENTS: Amendment[] = [
  {
    id: 'demo-amd-001',
    standard_id: 'demo-std-001',
    amendment_number: 'Demo Amd. 1',
    title: '[DEMO] Amendment 1 — Updated efficacy requirements',
    publication_date: '2024-06-01',
    status: 'active',
    source_url: '',
    description:
      'Demo amendment for updated efficacy requirements. Not a real amendment.',
  },
];

// ============================================================
// DEMO CERTIFICATIONS
// ============================================================

export const DEMO_CERTIFICATIONS: Certification[] = [
  {
    id: 'demo-cert-001',
    standard_id: 'demo-std-001',
    certification_type: 'BIS Product Certification',
    requirement:
      'Demo: Products covered under this standard may require BIS certification mark.',
    description:
      'This is a demo certification requirement. Actual certification requirements must be verified from official BIS sources.',
    source_url: '',
  },
  {
    id: 'demo-cert-002',
    standard_id: 'demo-std-001',
    certification_type: 'CRS',
    requirement:
      'Demo: LED products may fall under Compulsory Registration Scheme.',
    description:
      'This is a demo CRS requirement. Actual CRS applicability must be verified from official BIS/CRS sources.',
    source_url: '',
  },
];

// ============================================================
// DEMO RELATIONSHIPS
// ============================================================

export const DEMO_RELATIONSHIPS: StandardRelationship[] = [
  {
    id: 'demo-rel-001',
    source_standard_id: 'demo-std-001',
    target_standard_id: 'demo-std-002',
    relationship_type: 'normative_reference',
    description: 'Demo: LED module performance referenced as normative.',
    created_at: '2024-01-01T00:00:00Z',
    target_standard: DEMO_STANDARDS[1],
  },
  {
    id: 'demo-rel-002',
    source_standard_id: 'demo-std-001',
    target_standard_id: 'demo-std-003',
    relationship_type: 'safety_standard',
    description: 'Demo: Safety requirements for luminaires.',
    created_at: '2024-01-01T00:00:00Z',
    target_standard: DEMO_STANDARDS[2],
  },
  {
    id: 'demo-rel-003',
    source_standard_id: 'demo-std-001',
    target_standard_id: 'demo-std-004',
    relationship_type: 'allied_standard',
    description: 'Demo: IP classification for enclosure protection.',
    created_at: '2024-01-01T00:00:00Z',
    target_standard: DEMO_STANDARDS[3],
  },
  {
    id: 'demo-rel-004',
    source_standard_id: 'demo-std-001',
    target_standard_id: 'demo-std-005',
    relationship_type: 'test_method',
    description: 'Demo: Photometric test methods for luminaires.',
    created_at: '2024-01-01T00:00:00Z',
    target_standard: DEMO_STANDARDS[4],
  },
  {
    id: 'demo-rel-005',
    source_standard_id: 'demo-std-001',
    target_standard_id: 'demo-std-006',
    relationship_type: 'installation_standard',
    description: 'Demo: Installation requirements for street lighting.',
    created_at: '2024-01-01T00:00:00Z',
    target_standard: DEMO_STANDARDS[5],
  },
];

// ============================================================
// DEMO CATEGORIES (for search filters)
// ============================================================

export const DEMO_CATEGORIES = [
  'Electrical — Lighting',
  'Electrical — Safety',
  'Electrical — General',
  'Electrical — Testing',
  'Electrical — Installation',
  'Civil — Construction',
  'Mechanical — General',
  'Chemical — Materials',
  'IT — Software',
  'Textiles — General',
];

export const DEMO_NOTICE =
  'Demo Data — Not Official Standards Information. This data is for UI demonstration purposes only and does not represent any official Indian Standard published by the Bureau of Indian Standards (BIS).';
