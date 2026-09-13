// ============================================================
// ISutra: Phase 3 — Verified BIS Standards Dataset
// Electrical → Lighting → LED / Street Lighting
// Strictly verified metadata from Bureau of Indian Standards (BIS)
// NO invented standards, numbers, or numerical specifications.
// ============================================================

export interface VerifiedStandard {
  id: string;
  standard_number: string;
  title: string;
  category: string;
  subcategory: string;
  product_types: string[];
  keywords: string[];
  scope: string;
  technical_parameters: Record<string, unknown> | null;
  safety_requirements: string | Record<string, unknown> | null;
  performance_requirements: string | Record<string, unknown> | null;
  testing_requirements: string | Record<string, unknown> | null;
  related_standards: string[];
  edition_year: number;
  status: string;
  source_organization: string;
  source_url: string;
  last_verified: string;
  created_at: string;
  updated_at: string;
}

export const VERIFIED_BIS_STANDARDS: VerifiedStandard[] = [
  // ------------------------------------------------------------
  // RECORD 1: IS 10322 (Part 1):2026
  // ------------------------------------------------------------
  {
    id: 'bis-is-10322-1-2026',
    standard_number: 'IS 10322 (Part 1):2026',
    title: 'Luminaires Part 1 General Requirements and Tests',
    category: 'Electrical → Lighting',
    subcategory: 'Luminaires',
    product_types: ['LED luminaires', 'lighting luminaires'],
    keywords: ['luminaire', 'LED luminaire', 'lighting', 'general luminaire'],
    scope: 'General requirements and tests for luminaires.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: 'General requirements and tests.',
    related_standards: ['IS 10322 Part 5 series'],
    edition_year: 2026,
    status: 'Current / Verified',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 2: IS 10322 (Part 5/Sec 3):2026
  // ------------------------------------------------------------
  {
    id: 'bis-is-10322-5-3-2026',
    standard_number: 'IS 10322 (Part 5/Sec 3):2026',
    title: 'Luminaires Part 5: Particular Requirements Section 3: Luminaires for Road and Street Lighting',
    category: 'Electrical → Lighting',
    subcategory: 'Road & Street Lighting',
    product_types: [
      'LED street lighting',
      'LED road lighting',
      'road luminaires',
      'street lighting luminaires',
    ],
    keywords: [
      'LED street light',
      'street lighting',
      'road lighting',
      'LED luminaire',
      'road luminaire',
      'outdoor lighting',
      'street light',
    ],
    scope: 'Particular requirements for luminaires used for road and street lighting.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 10322 Part 1', 'IS 16107 (Part 2/Sec 2)'],
    edition_year: 2026,
    status: 'Current / Verified',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 3: IS 10322 (Part 5/Sec 1):2026
  // ------------------------------------------------------------
  {
    id: 'bis-is-10322-5-1-2026',
    standard_number: 'IS 10322 (Part 5/Sec 1):2026',
    title: 'Luminaires Part 5: Particular Requirements Section 1: Fixed General Purpose Luminaires',
    category: 'Electrical → Lighting',
    subcategory: 'Luminaires',
    product_types: [
      'fixed luminaires',
      'general purpose luminaires',
      'LED luminaires',
    ],
    keywords: ['fixed luminaire', 'general purpose luminaire', 'LED lighting'],
    scope: 'Particular requirements for fixed general purpose luminaires.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 10322 Part 1'],
    edition_year: 2026,
    status: 'Current / Verified',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 4: IS 10322 (Part 5/Sec 5):2026
  // ------------------------------------------------------------
  {
    id: 'bis-is-10322-5-5-2026',
    standard_number: 'IS 10322 (Part 5/Sec 5):2026',
    title: 'Luminaires Part 5: Particular Requirements Section 5: Floodlights',
    category: 'Electrical → Lighting',
    subcategory: 'Floodlighting',
    product_types: ['LED floodlights', 'floodlights'],
    keywords: ['floodlight', 'LED floodlight', 'outdoor floodlight', 'lighting'],
    scope: 'Particular requirements for floodlights.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 10322 Part 1'],
    edition_year: 2026,
    status: 'Current / Verified',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 5: IS 10322 (Part 5/Sec 6):2026
  // ------------------------------------------------------------
  {
    id: 'bis-is-10322-5-6-2026',
    standard_number: 'IS 10322 (Part 5/Sec 6):2026',
    title: 'Luminaires Part 5: Particular Requirements Section 6: Handlamps',
    category: 'Electrical → Lighting',
    subcategory: 'Handlamps',
    product_types: ['LED handlamps', 'handlamps'],
    keywords: ['handlamp', 'LED handlamp', 'portable lighting'],
    scope: 'Particular requirements for handlamps.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 10322 Part 1'],
    edition_year: 2026,
    status: 'Current / Verified',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 6: IS 10322 (Part 5/Sec 8):2026
  // ------------------------------------------------------------
  {
    id: 'bis-is-10322-5-8-2026',
    standard_number: 'IS 10322 (Part 5/Sec 8):2026',
    title: 'Luminaires Part 5: Particular Requirements Section 8: Luminaires for Emergency Lighting',
    category: 'Electrical → Lighting',
    subcategory: 'Emergency Lighting',
    product_types: ['emergency lighting luminaires', 'LED emergency luminaires'],
    keywords: ['emergency lighting', 'emergency luminaire', 'LED emergency light'],
    scope: 'Particular requirements for luminaires for emergency lighting.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 10322 Part 1'],
    edition_year: 2026,
    status: 'Current / Verified',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 7: IS 16107 (Part 2/Sec 1):2012
  // ------------------------------------------------------------
  {
    id: 'bis-is-16107-2-1-2012',
    standard_number: 'IS 16107 (Part 2/Sec 1):2012',
    title: 'Luminaires Performance Part 2 Particular Requirements Section 1 LED Luminaire',
    category: 'Electrical → Lighting',
    subcategory: 'LED Luminaire Performance',
    product_types: ['LED luminaires'],
    keywords: ['LED luminaire', 'luminaire performance', 'LED lighting', 'lighting performance'],
    scope: 'Particular performance requirements for LED luminaires.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: 'Particular performance requirements for LED luminaires.',
    testing_requirements: null,
    related_standards: ['IS 16106:2012', 'IS 10322 (Part 1)'],
    edition_year: 2012,
    status: 'Verified / Monitor for revision',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.services.bis.gov.in/tmp/compendium_2025-06-02-05-23-18.pdf',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 8: IS 16107 (Part 2/Sec 2):2017
  // ------------------------------------------------------------
  {
    id: 'bis-is-16107-2-2-2017',
    standard_number: 'IS 16107 (Part 2/Sec 2):2017',
    title: 'Luminaires Performance Part 2 Particular Requirements Section 2 LED Street Lighting Luminaire',
    category: 'Electrical → Lighting',
    subcategory: 'LED Street Lighting Performance',
    product_types: ['LED street lighting luminaires', 'road lighting luminaires'],
    keywords: ['LED street light', 'street lighting', 'road lighting', 'LED luminaire', 'luminaire performance'],
    scope: 'Particular performance requirements for LED street lighting luminaires.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: 'Particular performance requirements for LED street lighting luminaires.',
    testing_requirements: null,
    related_standards: ['IS 10322 (Part 5/Sec 3)', 'IS 16106:2012'],
    edition_year: 2017,
    status: 'Verified / Monitor for revision',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.services.bis.gov.in/tmp/compendium_2025-06-02-05-23-18.pdf',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 9: IS 16106:2012
  // ------------------------------------------------------------
  {
    id: 'bis-is-16106-2012',
    standard_number: 'IS 16106:2012',
    title: 'Method of Electrical and Photometric Measurements of Solid State Lighting (LED) Products',
    category: 'Electrical → Lighting',
    subcategory: 'LED Testing',
    product_types: ['LED products', 'solid state lighting products'],
    keywords: [
      'LED measurement',
      'photometric measurement',
      'electrical measurement',
      'solid state lighting',
      'LED testing',
      'photometric',
    ],
    scope: 'Methods of electrical and photometric measurement of solid-state lighting products.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: 'Methods of electrical and photometric measurement of solid-state lighting products.',
    related_standards: ['IS 16107 series'],
    edition_year: 2012,
    status: 'Verified / Monitor for revision',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://lims.bis.gov.in/',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 10: IS 16102 (Part 1):2026
  // ------------------------------------------------------------
  {
    id: 'bis-is-16102-1-2026',
    standard_number: 'IS 16102 (Part 1):2026',
    title: 'Self-Ballasted LED Lamps for General Lighting Services Part 1 Safety Requirements',
    category: 'Electrical → Lighting',
    subcategory: 'LED Lamps',
    product_types: ['self-ballasted LED lamps'],
    keywords: ['LED lamp', 'self-ballasted LED', 'LED lamp safety', 'general lighting'],
    scope: 'Safety requirements for self-ballasted LED lamps for general lighting services.',
    technical_parameters: null,
    safety_requirements: 'Safety requirements for self-ballasted LED lamps for general lighting services.',
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 16102 (Part 2)'],
    edition_year: 2026,
    status: 'Current / Verified',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 11: IS 16103 (Part 1):2025
  // ------------------------------------------------------------
  {
    id: 'bis-is-16103-1-2025',
    standard_number: 'IS 16103 (Part 1):2025',
    title: 'LED Modules for General Lighting Part 1 Safety Specifications',
    category: 'Electrical → Lighting',
    subcategory: 'LED Modules',
    product_types: ['LED modules'],
    keywords: ['LED module', 'LED module safety', 'general lighting'],
    scope: 'Safety specifications for LED modules for general lighting.',
    technical_parameters: null,
    safety_requirements: 'Safety specifications for LED modules for general lighting.',
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 16103 (Part 2)'],
    edition_year: 2025,
    status: 'Current / Verified',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 12: IS 16103 (Part 2):2025
  // ------------------------------------------------------------
  {
    id: 'bis-is-16103-2-2025',
    standard_number: 'IS 16103 (Part 2):2025',
    title: 'LED Modules for General Lighting Part 2 Performance Requirements',
    category: 'Electrical → Lighting',
    subcategory: 'LED Modules',
    product_types: ['LED modules'],
    keywords: ['LED module', 'LED module performance', 'general lighting'],
    scope: 'Performance requirements for LED modules for general lighting.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: 'Performance requirements for LED modules for general lighting.',
    testing_requirements: null,
    related_standards: ['IS 16103 (Part 1)'],
    edition_year: 2025,
    status: 'Current / Verified',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ============================================================
  // CATEGORY 1 — ELECTRICAL CABLES & WIRES
  // ============================================================

  // ------------------------------------------------------------
  // RECORD 13: IS 694:2010
  // ------------------------------------------------------------
  {
    id: 'bis-is-694-2010',
    standard_number: 'IS 694:2010',
    title: 'Polyvinyl chloride insulated unsheathed and sheathed cables/cords with rigid and flexible conductor for rated voltages up to and including 450/750 V',
    category: 'Electrical → Cables & Wires',
    subcategory: 'PVC Cables & Cords',
    product_types: [
      'PVC insulated cables',
      'PVC sheathed cables',
      'electrical cables',
      'cords',
    ],
    keywords: [
      'PVC cable',
      'electrical cable',
      'PVC insulated cable',
      'PVC sheathed cable',
      'power cable',
      'wiring cable',
    ],
    scope: 'Polyvinyl chloride insulated unsheathed and sheathed cables/cords with rigid and flexible conductor for rated voltages up to and including 450/750 V.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: [],
    edition_year: 2010,
    status: 'Verified / Monitor for revision',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 14: IS 1554 (Part 1):1988
  // ------------------------------------------------------------
  {
    id: 'bis-is-1554-1-1988',
    standard_number: 'IS 1554 (Part 1):1988',
    title: 'Specification for PVC Insulated (Heavy Duty) Electric Cables Part 1 for Working Voltages up to and Including 1100 V',
    category: 'Electrical → Cables & Wires',
    subcategory: 'PVC Heavy Duty Cables',
    product_types: [
      'PVC heavy duty cables',
      'electrical power cables',
      'armoured cables',
      'unarmoured cables',
    ],
    keywords: [
      'PVC heavy duty cable',
      'power cable',
      '1100 V cable',
      'electrical cable',
    ],
    scope: 'Specification for PVC insulated (heavy duty) electric cables for working voltages up to and including 1100 V.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 1554 (Part 2):1988'],
    edition_year: 1988,
    status: 'Verified / Monitor for revision',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 15: IS 1554 (Part 2):1988
  // ------------------------------------------------------------
  {
    id: 'bis-is-1554-2-1988',
    standard_number: 'IS 1554 (Part 2):1988',
    title: 'Specification for PVC Insulated (Heavy Duty) Electric Cables Part 2 for Working Voltages from 3.3 kV up to and Including 11 kV',
    category: 'Electrical → Cables & Wires',
    subcategory: 'Medium Voltage PVC Cables',
    product_types: [
      'medium voltage PVC cables',
      'heavy duty cables',
      'power cables',
    ],
    keywords: [
      'PVC cable',
      'medium voltage cable',
      'heavy duty cable',
      '3.3 kV cable',
      '11 kV cable',
    ],
    scope: 'Specification for PVC insulated (heavy duty) electric cables for working voltages from 3.3 kV up to and including 11 kV.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 1554 (Part 1):1988'],
    edition_year: 1988,
    status: 'Verified / Monitor for revision',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 16: IS 7098 (Part 1):2025
  // ------------------------------------------------------------
  {
    id: 'bis-is-7098-1-2025',
    standard_number: 'IS 7098 (Part 1):2025',
    title: 'Cross-linked Polyethylene Insulated Thermoplastic Sheathed Cables Part 1 for Working Voltages up to and Including 1100 Volts',
    category: 'Electrical → Cables & Wires',
    subcategory: 'XLPE Cables (Up to 1100 V)',
    product_types: [
      'XLPE insulated cables',
      'thermoplastic sheathed cables',
      'power cables',
    ],
    keywords: [
      'XLPE cable',
      'cross linked polyethylene cable',
      'power cable',
      '1100 V cable',
    ],
    scope: 'Cross-linked polyethylene insulated thermoplastic sheathed cables for working voltages up to and including 1100 volts.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 7098 (Part 2):2011'],
    edition_year: 2025,
    status: 'Current / Verified',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 17: IS 7098 (Part 2):2011
  // ------------------------------------------------------------
  {
    id: 'bis-is-7098-2-2011',
    standard_number: 'IS 7098 (Part 2):2011',
    title: 'Crosslinked Polyethylene Insulated Thermoplastic Sheathed Cables Part 2 for Working Voltages from 3.3 kV up to and Including 33 kV',
    category: 'Electrical → Cables & Wires',
    subcategory: 'XLPE Cables (3.3 kV - 33 kV)',
    product_types: [
      'XLPE power cables',
      'medium voltage cables',
      'high voltage cables',
    ],
    keywords: [
      'XLPE cable',
      'medium voltage cable',
      '33 kV cable',
      'power distribution cable',
    ],
    scope: 'Crosslinked polyethylene insulated thermoplastic sheathed cables for working voltages from 3.3 kV up to and including 33 kV.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 7098 (Part 1):2025'],
    edition_year: 2011,
    status: 'Verified / Monitor for revision',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 18: IS 9968 (Part 1):2025
  // ------------------------------------------------------------
  {
    id: 'bis-is-9968-1-2025',
    standard_number: 'IS 9968 (Part 1):2025',
    title: 'Elastomer Insulated Cables Part 1 for Working Voltages up to and Including 1100 Volts',
    category: 'Electrical → Cables & Wires',
    subcategory: 'Elastomer Cables',
    product_types: [
      'elastomer insulated cables',
      'flexible cables',
      'power cables',
    ],
    keywords: [
      'elastomer cable',
      'flexible cable',
      '1100 V cable',
      'electrical cable',
    ],
    scope: 'Elastomer insulated cables for working voltages up to and including 1100 volts.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: [],
    edition_year: 2025,
    status: 'Current / Verified',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 19: IS 14255:1995
  // ------------------------------------------------------------
  {
    id: 'bis-is-14255-1995',
    standard_number: 'IS 14255:1995',
    title: 'Aerial Bunched Cables for Working Voltages up to and Including 1100 Volts — Specification',
    category: 'Electrical → Cables & Wires',
    subcategory: 'Aerial Bunched Cables',
    product_types: [
      'aerial bunched cables',
      'overhead distribution cables',
    ],
    keywords: [
      'ABC cable',
      'aerial bunched cable',
      'overhead cable',
      '1100 V cable',
    ],
    scope: 'Aerial bunched cables for working voltages up to and including 1100 volts.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: [],
    edition_year: 1995,
    status: 'Verified / Monitor for revision',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 20: IS 17048:2018
  // ------------------------------------------------------------
  {
    id: 'bis-is-17048-2018',
    standard_number: 'IS 17048:2018',
    title: 'Halogen Free Flame Retardant (HFFR) Cables for Working Voltages Up to and Including 1100 Volts — Specification',
    category: 'Electrical → Cables & Wires',
    subcategory: 'Halogen Free Flame Retardant Cables',
    product_types: [
      'HFFR cables',
      'halogen free cables',
      'flame retardant cables',
    ],
    keywords: [
      'HFFR cable',
      'halogen free cable',
      'flame retardant cable',
      '1100 V cable',
    ],
    scope: 'Halogen free flame retardant (HFFR) cables for working voltages up to and including 1100 volts.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: [],
    edition_year: 2018,
    status: 'Verified / Monitor for revision',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ============================================================
  // CATEGORY 2 — PPE / SAFETY EQUIPMENT
  // ============================================================

  // ------------------------------------------------------------
  // RECORD 21: IS 15298 (Part 2):2024
  // ------------------------------------------------------------
  {
    id: 'bis-is-15298-2-2024',
    standard_number: 'IS 15298 (Part 2):2024',
    title: 'Personal Protective Equipment Part 2 Safety Footwear',
    category: 'Safety → Personal Protective Equipment',
    subcategory: 'Safety Footwear',
    product_types: [
      'safety footwear',
      'protective footwear',
      'industrial safety shoes',
    ],
    keywords: [
      'safety shoes',
      'safety footwear',
      'PPE footwear',
      'protective footwear',
      'industrial safety shoes',
    ],
    scope: 'Personal protective equipment specifications for safety footwear.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: [],
    edition_year: 2024,
    status: 'Current / Verified',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 22: IS 6994 (Part 6):2021
  // ------------------------------------------------------------
  {
    id: 'bis-is-6994-6-2021',
    standard_number: 'IS 6994 (Part 6):2021',
    title: 'Protection of Arms and Hands Part 6 Protective Gloves Against Mechanical Risks',
    category: 'Safety → Personal Protective Equipment',
    subcategory: 'Hand Protection',
    product_types: [
      'protective gloves',
      'mechanical protection gloves',
      'work gloves',
    ],
    keywords: [
      'protective gloves',
      'safety gloves',
      'mechanical risk gloves',
      'hand protection',
      'PPE gloves',
    ],
    scope: 'Protection of arms and hands against mechanical risks with protective gloves.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 6994 (Part 7):2021'],
    edition_year: 2021,
    status: 'Verified / Monitor for revision',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 23: IS 6994 (Part 7):2021
  // ------------------------------------------------------------
  {
    id: 'bis-is-6994-7-2021',
    standard_number: 'IS 6994 (Part 7):2021',
    title: 'Protection of Arms and Hands Part 7 Protective Gloves — General Requirements and Test Methods',
    category: 'Safety → Personal Protective Equipment',
    subcategory: 'Hand Protection',
    product_types: [
      'protective gloves',
      'safety gloves',
      'work gloves',
    ],
    keywords: [
      'protective gloves',
      'glove testing',
      'hand protection',
      'PPE gloves',
      'safety gloves',
    ],
    scope: 'General requirements and test methods for protective gloves for hand and arm protection.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 6994 (Part 6):2021'],
    edition_year: 2021,
    status: 'Verified / Monitor for revision',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 24: IS 16874:2018
  // ------------------------------------------------------------
  {
    id: 'bis-is-16874-2018',
    standard_number: 'IS 16874:2018',
    title: 'Textiles — Protective Gloves for Firefighters — Specification',
    category: 'Safety → Firefighter PPE',
    subcategory: 'Firefighter Gloves',
    product_types: [
      'firefighter gloves',
      'protective gloves',
      'fire safety gloves',
    ],
    keywords: [
      'firefighter gloves',
      'fire safety',
      'protective gloves',
      'fire PPE',
    ],
    scope: 'Specification for textile protective gloves designed specifically for firefighters.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 16890:2024'],
    edition_year: 2018,
    status: 'Verified / Monitor for revision',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 25: IS 16890:2024
  // ------------------------------------------------------------
  {
    id: 'bis-is-16890-2024',
    standard_number: 'IS 16890:2024',
    title: 'Textiles — Protective Clothing for Firefighters — Specification',
    category: 'Safety → Firefighter PPE',
    subcategory: 'Firefighter Protective Clothing',
    product_types: [
      'firefighter protective clothing',
      'fire protective clothing',
      'firefighter PPE',
    ],
    keywords: [
      'firefighter clothing',
      'fire PPE',
      'protective clothing',
      'fire safety',
    ],
    scope: 'Specification for protective clothing for firefighters.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 16874:2018'],
    edition_year: 2024,
    status: 'Current / Verified',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 26: IS 15748:2022
  // ------------------------------------------------------------
  {
    id: 'bis-is-15748-2022',
    standard_number: 'IS 15748:2022',
    title: 'Protective Clothing — Clothing to Protect Against Heat and Flame — Minimum Performance Requirements',
    category: 'Safety → Protective Clothing',
    subcategory: 'Heat and Flame Protection',
    product_types: [
      'heat protective clothing',
      'flame protective clothing',
      'industrial protective clothing',
    ],
    keywords: [
      'heat protective clothing',
      'flame resistant clothing',
      'protective clothing',
      'industrial PPE',
    ],
    scope: 'Minimum performance requirements for clothing to protect against heat and flame.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 8519:2024'],
    edition_year: 2022,
    status: 'Verified / Monitor for revision',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 27: IS 8519:2024
  // ------------------------------------------------------------
  {
    id: 'bis-is-8519-2024',
    standard_number: 'IS 8519:2024',
    title: 'Guide for Selection of Occupational Protective Clothing — Body Protection (Selection, Care, and Maintenance)',
    category: 'Safety → Protective Clothing',
    subcategory: 'Body Protection',
    product_types: [
      'occupational protective clothing',
      'body protection PPE',
    ],
    keywords: [
      'occupational PPE',
      'protective clothing',
      'body protection',
      'industrial safety',
    ],
    scope: 'Guide for selection, care, and maintenance of occupational protective clothing for body protection.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 15748:2022'],
    edition_year: 2024,
    status: 'Current / Verified',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 28: IS 19089:2025
  // ------------------------------------------------------------
  {
    id: 'bis-is-19089-2025',
    standard_number: 'IS 19089:2025',
    title: 'Respiratory Protective Devices — Powered Filtering Devices Incorporating a Helmet or Hood — Specification',
    category: 'Safety → Respiratory Protection',
    subcategory: 'Powered Filtering Devices',
    product_types: [
      'powered respiratory protective devices',
      'filtering devices',
      'protective hoods',
      'protective helmets',
    ],
    keywords: [
      'respiratory protection',
      'respirator',
      'powered filtering device',
      'protective hood',
      'PPE',
    ],
    scope: 'Specification for powered filtering respiratory protective devices incorporating a helmet or hood.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: [],
    edition_year: 2025,
    status: 'Current / Verified',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ============================================================
  // CATEGORY 3 — CONSTRUCTION / BUILDING MATERIALS
  // ============================================================

  // ------------------------------------------------------------
  // RECORD 29: IS 456:2000
  // ------------------------------------------------------------
  {
    id: 'bis-is-456-2000',
    standard_number: 'IS 456:2000',
    title: 'Plain and Reinforced Concrete — Code of Practice',
    category: 'Construction → Concrete',
    subcategory: 'Plain & Reinforced Concrete',
    product_types: [
      'plain concrete',
      'reinforced concrete',
      'structural concrete',
    ],
    keywords: [
      'concrete',
      'reinforced concrete',
      'RCC',
      'construction concrete',
      'structural concrete',
    ],
    scope: 'Code of practice for plain and reinforced concrete in general building construction.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 383:2016', 'IS 1786:2008', 'IS 10262:2019'],
    edition_year: 2000,
    status: 'Verified / Reaffirmed 2025',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 30: IS 383:2016
  // ------------------------------------------------------------
  {
    id: 'bis-is-383-2016',
    standard_number: 'IS 383:2016',
    title: 'Coarse and Fine Aggregate for Concrete — Specification',
    category: 'Construction → Aggregates',
    subcategory: 'Coarse and Fine Aggregate',
    product_types: [
      'coarse aggregate',
      'fine aggregate',
      'concrete aggregate',
    ],
    keywords: [
      'aggregate',
      'coarse aggregate',
      'fine aggregate',
      'sand',
      'concrete aggregate',
    ],
    scope: 'Specification for coarse and fine aggregate from natural sources for concrete.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 456:2000'],
    edition_year: 2016,
    status: 'Verified / Monitor for revision',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 31: IS 1786:2008
  // ------------------------------------------------------------
  {
    id: 'bis-is-1786-2008',
    standard_number: 'IS 1786:2008',
    title: 'High Strength Deformed Steel Bars and Wires for Concrete Reinforcement — Specification',
    category: 'Construction → Reinforcement Steel',
    subcategory: 'Deformed Bars (TMT)',
    product_types: [
      'reinforcement bars',
      'steel reinforcement',
      'deformed bars',
      'reinforcement wires',
    ],
    keywords: [
      'TMT bars',
      'reinforcement steel',
      'steel bars',
      'rebar',
      'deformed bars',
      'concrete reinforcement',
    ],
    scope: 'Specification for high strength deformed steel bars and wires for concrete reinforcement.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 456:2000', 'IS 432 (Part 1):2026'],
    edition_year: 2008,
    status: 'Verified / Monitor for revision',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 32: IS 432 (Part 1):2026
  // ------------------------------------------------------------
  {
    id: 'bis-is-432-1-2026',
    standard_number: 'IS 432 (Part 1):2026',
    title: 'Specification for Mild Steel and Medium Tensile Steel Bars and Hard-Drawn Steel Wire for Concrete Reinforcement Part 1 Mild Steel and Medium Tensile Steel Bars',
    category: 'Construction → Reinforcement Steel',
    subcategory: 'Mild & Medium Tensile Steel Bars',
    product_types: [
      'mild steel bars',
      'medium tensile steel bars',
      'steel reinforcement',
    ],
    keywords: [
      'mild steel bars',
      'reinforcement bars',
      'steel bars',
      'concrete reinforcement',
    ],
    scope: 'Specification for mild steel and medium tensile steel bars for concrete reinforcement.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 1786:2008', 'IS 456:2000'],
    edition_year: 2026,
    status: 'Current / Verified',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 33: IS 2185 (Part 1):2005
  // ------------------------------------------------------------
  {
    id: 'bis-is-2185-1-2005',
    standard_number: 'IS 2185 (Part 1):2005',
    title: 'Concrete Masonry Units — Specification Part 1 Hollow and Solid Concrete Blocks',
    category: 'Construction → Masonry',
    subcategory: 'Concrete Blocks',
    product_types: [
      'concrete blocks',
      'hollow concrete blocks',
      'solid concrete blocks',
    ],
    keywords: [
      'concrete block',
      'hollow block',
      'solid block',
      'masonry block',
    ],
    scope: 'Specification for hollow and solid concrete masonry block units.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: [],
    edition_year: 2005,
    status: 'Verified / Monitor for revision',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 34: IS 3952:2013
  // ------------------------------------------------------------
  {
    id: 'bis-is-3952-2013',
    standard_number: 'IS 3952:2013',
    title: 'Burnt Clay Hollow Bricks for Walls and Partitions — Specification',
    category: 'Construction → Bricks',
    subcategory: 'Hollow Bricks',
    product_types: [
      'burnt clay hollow bricks',
      'wall bricks',
      'partition bricks',
    ],
    keywords: [
      'hollow brick',
      'clay brick',
      'building brick',
      'partition brick',
    ],
    scope: 'Specification for burnt clay hollow bricks for walls and partitions.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 1077:2025'],
    edition_year: 2013,
    status: 'Verified / Monitor for revision',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 35: IS 1077:2025
  // ------------------------------------------------------------
  {
    id: 'bis-is-1077-2025',
    standard_number: 'IS 1077:2025',
    title: 'Common Burnt Clay Building Bricks — Specification',
    category: 'Construction → Bricks',
    subcategory: 'Common Building Bricks',
    product_types: [
      'common burnt clay bricks',
      'building bricks',
    ],
    keywords: [
      'building brick',
      'clay brick',
      'burnt clay brick',
      'construction brick',
    ],
    scope: 'Specification for common burnt clay building bricks for general construction.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 3952:2013'],
    edition_year: 2025,
    status: 'Current / Verified',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 36: IS 2062 (Part 1):2025
  // ------------------------------------------------------------
  {
    id: 'bis-is-2062-1-2025',
    standard_number: 'IS 2062 (Part 1):2025',
    title: 'Structural Steel Part 1 Hot Rolled Medium and High Tensile Steel',
    category: 'Construction → Structural Steel',
    subcategory: 'Hot Rolled Steel',
    product_types: [
      'structural steel',
      'hot rolled steel',
      'medium tensile steel',
      'high tensile steel',
    ],
    keywords: [
      'structural steel',
      'hot rolled steel',
      'steel plates',
      'construction steel',
    ],
    scope: 'Specification for hot rolled medium and high tensile structural steel.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: [],
    edition_year: 2025,
    status: 'Current / Verified',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 37: IS 458:2021
  // ------------------------------------------------------------
  {
    id: 'bis-is-458-2021',
    standard_number: 'IS 458:2021',
    title: 'Precast Concrete Pipes (with and without Reinforcement)',
    category: 'Construction → Concrete Products',
    subcategory: 'Precast Concrete Pipes',
    product_types: [
      'precast concrete pipes',
      'reinforced concrete pipes',
      'concrete pipes',
    ],
    keywords: [
      'concrete pipe',
      'RCC pipe',
      'precast pipe',
      'reinforced concrete pipe',
    ],
    scope: 'Specification for precast concrete pipes with and without reinforcement.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 456:2000'],
    edition_year: 2021,
    status: 'Verified / Monitor for revision',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 38: IS 3370 (Part 1):2021
  // ------------------------------------------------------------
  {
    id: 'bis-is-3370-1-2021',
    standard_number: 'IS 3370 (Part 1):2021',
    title: 'Concrete Structures for Retaining Aqueous Liquids — Code of Practice Part 1 General Requirements',
    category: 'Construction → Water Retaining Structures',
    subcategory: 'General Requirements',
    product_types: [
      'water retaining concrete structures',
      'liquid retaining structures',
      'concrete tanks',
    ],
    keywords: [
      'water tank',
      'liquid retaining structure',
      'concrete tank',
      'water retaining structure',
    ],
    scope: 'Code of practice for concrete structures for retaining aqueous liquids.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 456:2000'],
    edition_year: 2021,
    status: 'Verified / Monitor for revision',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 39: IS 10262:2019
  // ------------------------------------------------------------
  {
    id: 'bis-is-10262-2019',
    standard_number: 'IS 10262:2019',
    title: 'Concrete Mix Proportioning — Guidelines',
    category: 'Construction → Concrete',
    subcategory: 'Concrete Mix Proportioning',
    product_types: [
      'concrete mix',
      'concrete mix design',
      'construction concrete',
    ],
    keywords: [
      'concrete mix',
      'mix design',
      'concrete proportioning',
      'RCC mix',
    ],
    scope: 'Guidelines for concrete mix proportioning.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: ['IS 456:2000', 'IS 383:2016'],
    edition_year: 2019,
    status: 'Verified / Monitor for revision',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },

  // ------------------------------------------------------------
  // RECORD 40: IS 6909:2026
  // ------------------------------------------------------------
  {
    id: 'bis-is-6909-2026',
    standard_number: 'IS 6909:2026',
    title: 'Supersulphated Cement — Specification',
    category: 'Construction → Cement',
    subcategory: 'Supersulphated Cement',
    product_types: [
      'supersulphated cement',
      'cement',
    ],
    keywords: [
      'cement',
      'supersulphated cement',
      'construction cement',
    ],
    scope: 'Specification for supersulphated cement for construction and marine applications.',
    technical_parameters: null,
    safety_requirements: null,
    performance_requirements: null,
    testing_requirements: null,
    related_standards: [],
    edition_year: 2026,
    status: 'Current / Verified',
    source_organization: 'Bureau of Indian Standards',
    source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified: '2026-09-13',
    created_at: '2026-09-13T00:00:00Z',
    updated_at: '2026-09-13T00:00:00Z',
  },
];
