// ============================================================
// ISutra: Phase 9A — Verified BIS Standard Lifecycles Dataset
// Authoritative lifecycle, edition, reaffirmation, and supersession records
// NO fabricated statuses, NO edition-year inferences.
// Source: Official Bureau of Indian Standards (BIS) records & Gazettes
// ============================================================

export interface VerifiedStandardLifecycle {
  id: string;
  standard_id: string;
  standard_number: string;

  edition_number: string;
  edition_year: number;

  lifecycle_status:
    | 'current'
    | 'reaffirmed'
    | 'amended'
    | 'under_revision'
    | 'superseded'
    | 'withdrawn'
    | 'not_verified';

  reaffirmation_year?: number;

  supersedes_standard_number?: string;
  superseded_by_standard_number?: string;

  transition_end_date?: string;

  gazette_notification_ref?: string;

  evidence_description: string;
  verified_source_url: string;

  last_verified_at: string;
}

export const VERIFIED_STANDARD_LIFECYCLES: VerifiedStandardLifecycle[] = [
  // ------------------------------------------------------------
  // 1. IS 456:2000 (Plain and Reinforced Concrete - Code of Practice)
  // ------------------------------------------------------------
  {
    id: 'vlc-456-2000',
    standard_id: 'bis-is-456-2000',
    standard_number: 'IS 456:2000',
    edition_number: 'Fourth Revision',
    edition_year: 2000,
    lifecycle_status: 'reaffirmed',
    reaffirmation_year: 2025,
    evidence_description:
      'Plain and Reinforced Concrete — Code of Practice (Fourth Revision). Reaffirmed by BIS Sectional Committee CED 2 in 2020 and 2025. Operates concurrently with Amendments 1 through 6.',
    verified_source_url:
      'https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/search',
    last_verified_at: '2026-09-18',
  },

  // ------------------------------------------------------------
  // 2. IS 383:2016 (Coarse and Fine Aggregate for Concrete)
  // ------------------------------------------------------------
  {
    id: 'vlc-383-2016',
    standard_id: 'bis-is-383-2016',
    standard_number: 'IS 383:2016',
    edition_number: 'Third Revision',
    edition_year: 2016,
    lifecycle_status: 'reaffirmed',
    reaffirmation_year: 2025,
    supersedes_standard_number: 'IS 383:1970',
    evidence_description:
      'Coarse and Fine Aggregate for Concrete — Specification (Third Revision). Reaffirmed in 2025 by CED 2. Superseded the second revision (IS 383:1970). Includes official amendments on manufactured sand and recycled aggregates.',
    verified_source_url:
      'https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/search',
    last_verified_at: '2026-09-18',
  },

  // ------------------------------------------------------------
  // 3. IS 1786:2008 (High Strength Deformed Steel Bars)
  // ------------------------------------------------------------
  {
    id: 'vlc-1786-2008',
    standard_id: 'bis-is-1786-2008',
    standard_number: 'IS 1786:2008',
    edition_number: 'Fourth Revision',
    edition_year: 2008,
    lifecycle_status: 'reaffirmed',
    reaffirmation_year: 2023,
    supersedes_standard_number: 'IS 1786:1985',
    evidence_description:
      'High Strength Deformed Steel Bars and Wires for Concrete Reinforcement — Specification (Fourth Revision). Reviewed and reaffirmed in 2023 by CED 54. Superseded the third revision (IS 1786:1985). Active specification for mandatory ISI certification with Amendments 1 through 4.',
    verified_source_url:
      'https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/search',
    last_verified_at: '2026-09-18',
  },

  // ------------------------------------------------------------
  // 4. IS 694:2010 (PVC Insulated Cables)
  // ------------------------------------------------------------
  {
    id: 'vlc-694-2010',
    standard_id: 'bis-is-694-2010',
    standard_number: 'IS 694:2010',
    edition_number: 'Fourth Revision',
    edition_year: 2010,
    lifecycle_status: 'reaffirmed',
    reaffirmation_year: 2020,
    supersedes_standard_number: 'IS 694:1990',
    evidence_description:
      'Polyvinyl Chloride Insulated Unsheathed and Sheathed Cables/Cords with Rigid and Flexible Conductor for Rated Voltages Up to and Including 1100 V (Fourth Revision). Reviewed and reaffirmed in 2020 by ETD 9. Superseded the third revision (IS 694:1990). Active specification with Amendments 1 through 3.',
    verified_source_url:
      'https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/search',
    last_verified_at: '2026-09-18',
  },

  // ------------------------------------------------------------
  // 5. IS 15748:2022 (Protective Clothing for Heat & Flame)
  // ------------------------------------------------------------
  {
    id: 'vlc-15748-2022',
    standard_id: 'bis-is-15748-2022',
    standard_number: 'IS 15748:2022',
    edition_number: 'First Revision',
    edition_year: 2022,
    lifecycle_status: 'amended',
    supersedes_standard_number: 'IS 15748:2007',
    gazette_notification_ref: 'Notification No. HQ-PUB015/1/2020-PUB-BIS (1121)',
    evidence_description:
      'Textiles — Protective Clothing for Industrial Workers Exposed to Heat (First Revision). Superseded IS 15748:2007. Active specification updated by three official amendments established in 2024 with Gazette-notified transition windows.',
    verified_source_url: 'https://www.bis.gov.in/know-your-standard/?lang=en',
    last_verified_at: '2026-09-18',
  },

  // ------------------------------------------------------------
  // 6. IS 7098 (Part 1):2025 (XLPE Insulated Thermoplastic Sheathed Cables)
  // ------------------------------------------------------------
  {
    id: 'vlc-7098-1-2025',
    standard_id: 'bis-is-7098-1-2025',
    standard_number: 'IS 7098 (Part 1):2025',
    edition_number: 'Third Revision',
    edition_year: 2025,
    lifecycle_status: 'current',
    supersedes_standard_number: 'IS 7098 (Part 1):1988',
    transition_end_date: '2025-12-09',
    evidence_description:
      'Crosslinked Polyethylene Insulated Thermoplastic Sheathed Cables — Specification Part 1 For Working Voltages Up to and Including 1100 V (Third Revision). Replaces IS 7098 (Part 1):1988 with mandatory licensee transition deadline of December 9, 2025.',
    verified_source_url:
      'https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/search',
    last_verified_at: '2026-09-18',
  },

  // ------------------------------------------------------------
  // 7. IS 10322 (Part 5/Sec 3):2026 (Road & Street Lighting Luminaires)
  // ------------------------------------------------------------
  {
    id: 'vlc-10322-5-3-2026',
    standard_id: 'bis-is-10322-5-3-2026',
    standard_number: 'IS 10322 (Part 5/Sec 3):2026',
    edition_number: 'Second Revision',
    edition_year: 2026,
    lifecycle_status: 'current',
    supersedes_standard_number: 'IS 10322 (Part 5/Sec 3):2012',
    evidence_description:
      'Luminaires Part 5: Particular Requirements Section 3: Luminaires for Road and Street Lighting (Second Revision). Published March 13, 2026. Supersedes IS 10322 (Part 5/Sec 3):2012. 0 amendments issued on 2026 edition.',
    verified_source_url:
      'https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/search',
    last_verified_at: '2026-09-18',
  },

  // ------------------------------------------------------------
  // 8. IS 8519:2024 (Occupational Safety Clothing Selection Guide)
  // ------------------------------------------------------------
  {
    id: 'vlc-8519-2024',
    standard_id: 'bis-is-8519-2024',
    standard_number: 'IS 8519:2024',
    edition_number: 'First Revision',
    edition_year: 2024,
    lifecycle_status: 'current',
    supersedes_standard_number: 'IS 8519:1977',
    evidence_description:
      'Guide for Selection of Occupational Protective Clothing — Body Protection (Selection, Care and Maintenance) (First Revision). Supersedes IS 8519:1977. 0 amendments issued on 2024 edition.',
    verified_source_url:
      'https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/search',
    last_verified_at: '2026-09-18',
  },
];

export function getVerifiedLifecycle(
  standardId: string
): VerifiedStandardLifecycle | undefined {
  const clean = standardId.trim().toLowerCase();
  return VERIFIED_STANDARD_LIFECYCLES.find(
    (l) =>
      l.standard_id.toLowerCase() === clean ||
      l.standard_number.toLowerCase() === clean ||
      l.standard_number.toLowerCase().replace(/\s+/g, '') === clean.replace(/\s+/g, '')
  );
}
