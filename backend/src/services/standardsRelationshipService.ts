// ============================================================
// ISutra: Phase 8B — Standards Relationship Service
// Combines authentic verified relationship records with
// unclassified associated references from the curated reference dataset.
// ============================================================

import { VERIFIED_BIS_STANDARDS } from '../database/verifiedStandards';
import { VERIFIED_RELATIONSHIPS, VerifiedStandardRelationship } from '../database/verifiedRelationships';
import { DEMO_RELATIONSHIPS } from '../database/demoData';
import { StandardRelationship, RelationshipCoverage, RelationshipResolutionResponse } from '../types';

export function getResolvedRelationships(id: string): RelationshipResolutionResponse {
  const isDemo = id.toLowerCase().startsWith('demo-');

  // 1. Demo Fallback: strictly flag as demo and unverified
  if (isDemo) {
    const demoRels = DEMO_RELATIONSHIPS.filter((r) => r.source_standard_id === id);
    return {
      data: demoRels.map((r) => ({
        ...r,
        verification_status: 'unclassified_reference',
        source_provenance: 'Demo Mock Data',
      })),
      coverage: {
        total: demoRels.length,
        verified_count: 0,
        unclassified_count: demoRels.length,
        coverage_notice: 'Demo data — relationship intelligence not verified.',
      },
      procurement_guidance:
        'Demo standards relationship data. Not official BIS relationship information.',
      demo: true,
    };
  }

  // 2. Find in Verified Reference Dataset
  const standard = VERIFIED_BIS_STANDARDS.find(
    (s) => s.id === id || s.standard_number.toLowerCase() === id.toLowerCase()
  );

  if (!standard) {
    return {
      data: [],
      coverage: {
        total: 0,
        verified_count: 0,
        unclassified_count: 0,
        coverage_notice: 'Standard not found in current reference dataset.',
      },
      procurement_guidance:
        'Verify applicable standards directly with the Bureau of Indian Standards catalogue.',
      demo: false,
    };
  }

  // Look up any verified relationships where this standard is the source
  const verifiedMatches = VERIFIED_RELATIONSHIPS.filter(
    (v) =>
      v.source_standard_id === standard.id ||
      v.source_standard_number.toLowerCase() === standard.standard_number.toLowerCase()
  );

  const resolvedList: StandardRelationship[] = [];
  const handledVerifiedIds = new Set<string>();

  // Process recorded related_standards strings
  const rawRelated = standard.related_standards || [];

  rawRelated.forEach((relName, index) => {
    // Check if an authoritative verified relationship record exists for this item
    const matchedVerified = verifiedMatches.find((vm) => {
      const targetStd = VERIFIED_BIS_STANDARDS.find((s) => s.id === vm.target_standard_id);
      const targetStdNum = targetStd?.standard_number || vm.target_standard_number;
      return (
        relName.toLowerCase().includes(vm.target_standard_number.toLowerCase()) ||
        vm.target_standard_number.toLowerCase().includes(relName.toLowerCase()) ||
        (targetStdNum && relName.toLowerCase().includes(targetStdNum.toLowerCase()))
      );
    });

    if (matchedVerified) {
      handledVerifiedIds.add(matchedVerified.id);
      const targetStd = VERIFIED_BIS_STANDARDS.find(
        (s) =>
          s.id === matchedVerified.target_standard_id ||
          s.standard_number.toLowerCase() === matchedVerified.target_standard_number.toLowerCase()
      );

      resolvedList.push({
        id: matchedVerified.id,
        source_standard_id: standard.id,
        source_standard_number: standard.standard_number,
        source_standard: standard,
        target_standard_id: matchedVerified.target_standard_id,
        target_standard_number: matchedVerified.target_standard_number,
        relationship_type: matchedVerified.relationship_type,
        description: matchedVerified.description,
        evidence_clause: matchedVerified.evidence_clause,
        verified_source_url: matchedVerified.verified_source_url,
        verification_status: 'verified',
        verified_at: matchedVerified.verified_at,
        source_provenance: 'Official BIS Reference Clause Citation',
        created_at: matchedVerified.verified_at,
        target_standard: targetStd,
      });
    } else {
      // Unclassified Associated Reference
      const targetStd = VERIFIED_BIS_STANDARDS.find((v) =>
        v.standard_number.toLowerCase().includes(relName.toLowerCase())
      );

      resolvedList.push({
        id: `rel-${index}`,
        source_standard_id: standard.id,
        source_standard_number: standard.standard_number,
        source_standard: standard,
        target_standard_id: relName,
        target_standard_number: relName,
        relationship_type: 'unspecified',
        description: `Associated reference cited in ${standard.standard_number}; relationship type not classified in current reference dataset`,
        verification_status: 'unclassified_reference',
        source_provenance: 'ISutra Verified BIS Reference Dataset',
        created_at: standard.last_verified || '2026-09-13',
        target_standard: targetStd,
        verified_source_url: targetStd?.source_url || 'https://www.bis.gov.in/know-your-standard/?lang=en',
      });
    }
  });

  // Also include any verified relationship not already captured in rawRelated
  for (const vm of verifiedMatches) {
    if (!handledVerifiedIds.has(vm.id)) {
      handledVerifiedIds.add(vm.id);
      const targetStd = VERIFIED_BIS_STANDARDS.find(
        (s) =>
          s.id === vm.target_standard_id ||
          s.standard_number.toLowerCase() === vm.target_standard_number.toLowerCase()
      );

      resolvedList.push({
        id: vm.id,
        source_standard_id: standard.id,
        source_standard_number: standard.standard_number,
        source_standard: standard,
        target_standard_id: vm.target_standard_id,
        target_standard_number: vm.target_standard_number,
        relationship_type: vm.relationship_type,
        description: vm.description,
        evidence_clause: vm.evidence_clause,
        verified_source_url: vm.verified_source_url,
        verification_status: 'verified',
        verified_at: vm.verified_at,
        source_provenance: 'Official BIS Reference Clause Citation',
        created_at: vm.verified_at,
        target_standard: targetStd,
      });
    }
  }

  // Deterministic ordering:
  // 1. Verified relationships first, then unclassified references
  // 2. Alphabetical by target standard number
  resolvedList.sort((a, b) => {
    if (a.verification_status === 'verified' && b.verification_status !== 'verified') return -1;
    if (a.verification_status !== 'verified' && b.verification_status === 'verified') return 1;
    const numA = (a.target_standard_number || a.target_standard_id || '').toLowerCase();
    const numB = (b.target_standard_number || b.target_standard_id || '').toLowerCase();
    return numA.localeCompare(numB);
  });

  const verifiedCount = resolvedList.filter((r) => r.verification_status === 'verified').length;
  const unclassifiedCount = resolvedList.filter((r) => r.verification_status !== 'verified').length;

  return {
    data: resolvedList,
    coverage: {
      total: resolvedList.length,
      verified_count: verifiedCount,
      unclassified_count: unclassifiedCount,
      coverage_notice: 'Relationship coverage is limited to verified references available in the current dataset.',
    },
    procurement_guidance:
      'Associated standards may affect testing, safety, installation, performance, or other tender requirements. Verify relationship type and applicability against the official BIS publication before finalizing procurement specifications.',
    demo: false,
  };
}
