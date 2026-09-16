// ============================================================
// ISutra: Phase 7 — Procurement Standards Comparison Workspace
// Neutral, Evidence-Backed Side-by-Side Reference Comparison Engine
// STRICT ZERO-FABRICATION: Derives all facts strictly from verifiedStandards.ts
// ============================================================

import { VerifiedStandard, VERIFIED_BIS_STANDARDS } from '../database/verifiedStandards';
import type { StructuredRequirements } from './ai/types';
import {
  analyzeRequirementGaps,
  RequirementGapAnalysis,
  RequirementGapStatus,
} from './requirementGapAnalyzer';

export interface StandardOverviewItem {
  id: string;
  standardNumber: string;
  title: string;
  category: string;
  subcategory: string;
  editionYear: number;
  officialSourceUrl: string;
  productTypes: string[];
  keywords: string[];
  scope: string;
  referenceCoverage: number | null;
  referenceCoverageLabel: string;
}

export interface DimensionValue {
  value: string;
  evidenceSource: 'standard_record' | 'gap_analysis' | 'not_available';
  status?: RequirementGapStatus;
  statusLabel?: string;
}

export interface DimensionComparisonRow {
  dimensionId: string;
  dimensionLabel: string;
  dimensionGroup: 'metadata' | 'scope_and_products' | 'technical_and_testing' | 'requirement_alignment';
  values: Record<string, DimensionValue>; // Keyed by standardId
  factualDifferenceNote?: string;
}

export interface StandardTechnicalDistinction {
  standardId: string;
  standardNumber: string;
  standardTitle: string;
  categoryClassification: string;
  documentedScope: string;
  uniqueProductTypes: string[];
  uniqueKeywords: string[];
}

export interface ConsolidatedVerificationAction {
  action: string;
  applicableStandards: string[];
}

export interface StandardsComparisonResult {
  standards: StandardOverviewItem[];
  matrixRows: DimensionComparisonRow[];
  technicalDistinctions: StandardTechnicalDistinction[];
  gapAnalyses: Record<string, RequirementGapAnalysis>;
  consolidatedVerificationActions: ConsolidatedVerificationAction[];
  disclaimer: string;
  metadata: {
    datasetName: string;
    standardsEvaluated: number;
    comparedCount: number;
    sourceProvenance: string;
    timestamp: string;
  };
}

/**
 * Normalizes text for clean token-based set operations
 */
function normalize(str: string | null | undefined): string {
  return (str || '').toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Compares 2 to 3 verified BIS standards neutrally against the user's procurement requirements.
 *
 * ZERO-FABRICATION RULE:
 * - All technical values are pulled from actual fields in verifiedStandards.ts.
 * - If a field is null/absent, "Not available in current reference dataset." is displayed.
 * - No ranking, recommendation score, compliance score, or "winner" is ever produced.
 */
export function compareStandards(
  requirements: StructuredRequirements,
  standards: VerifiedStandard[]
): StandardsComparisonResult {
  if (!standards || standards.length < 2 || standards.length > 3) {
    throw new Error('Comparison requires between 2 and 3 standards.');
  }

  // 1. Run gap analysis for each standard and build overview
  const gapAnalyses: Record<string, RequirementGapAnalysis> = {};
  const standardOverviews: StandardOverviewItem[] = [];

  for (const std of standards) {
    const gap = analyzeRequirementGaps(requirements, std);
    gapAnalyses[std.id] = gap;

    standardOverviews.push({
      id: std.id,
      standardNumber: std.standard_number,
      title: std.title,
      category: std.category,
      subcategory: std.subcategory,
      editionYear: std.edition_year,
      officialSourceUrl: std.source_url,
      productTypes: std.product_types || [],
      keywords: std.keywords || [],
      scope: std.scope || 'Not available in current reference dataset.',
      referenceCoverage: gap.referenceCoverage,
      referenceCoverageLabel: gap.referenceCoverageLabel,
    });
  }

  // 2. Build Side-by-Side Dimension Matrix Rows
  const matrixRows: DimensionComparisonRow[] = [];

  // Dimension A: Category & Subcategory
  const catRow: DimensionComparisonRow = {
    dimensionId: 'category_classification',
    dimensionLabel: 'Standard Category & Subcategory',
    dimensionGroup: 'metadata',
    values: {},
  };
  for (const std of standards) {
    catRow.values[std.id] = {
      value: `${std.category} → ${std.subcategory || 'General'}`,
      evidenceSource: 'standard_record',
    };
  }
  matrixRows.push(catRow);

  // Dimension B: Documented Scope
  const scopeRow: DimensionComparisonRow = {
    dimensionId: 'documented_scope',
    dimensionLabel: 'Verified Scope in Dataset',
    dimensionGroup: 'scope_and_products',
    values: {},
  };
  for (const std of standards) {
    scopeRow.values[std.id] = {
      value: std.scope || 'Not available in current reference dataset.',
      evidenceSource: std.scope ? 'standard_record' : 'not_available',
    };
  }
  matrixRows.push(scopeRow);

  // Dimension C: Covered Product Types
  const prodRow: DimensionComparisonRow = {
    dimensionId: 'product_types',
    dimensionLabel: 'Cataloged Product Types',
    dimensionGroup: 'scope_and_products',
    values: {},
  };
  for (const std of standards) {
    const pts = std.product_types && std.product_types.length > 0
      ? std.product_types.join(', ')
      : 'Not available in current reference dataset.';
    prodRow.values[std.id] = {
      value: pts,
      evidenceSource: std.product_types && std.product_types.length > 0 ? 'standard_record' : 'not_available',
    };
  }
  matrixRows.push(prodRow);

  // Dimension D: Keywords / Index Terms
  const kwRow: DimensionComparisonRow = {
    dimensionId: 'keywords',
    dimensionLabel: 'Standard Taxonomy Keywords',
    dimensionGroup: 'scope_and_products',
    values: {},
  };
  for (const std of standards) {
    const kws = std.keywords && std.keywords.length > 0
      ? std.keywords.join(', ')
      : 'Not available in current reference dataset.';
    kwRow.values[std.id] = {
      value: kws,
      evidenceSource: std.keywords && std.keywords.length > 0 ? 'standard_record' : 'not_available',
    };
  }
  matrixRows.push(kwRow);

  // Dimension E: Technical Parameters in Record
  const techRow: DimensionComparisonRow = {
    dimensionId: 'technical_parameters_record',
    dimensionLabel: 'Technical Parameters Record',
    dimensionGroup: 'technical_and_testing',
    values: {},
  };
  for (const std of standards) {
    const hasParams = std.technical_parameters && Object.keys(std.technical_parameters).length > 0;
    techRow.values[std.id] = {
      value: hasParams
        ? JSON.stringify(std.technical_parameters)
        : 'Not available in current reference dataset.',
      evidenceSource: hasParams ? 'standard_record' : 'not_available',
    };
  }
  matrixRows.push(techRow);

  // Dimension F: Safety Requirements in Record
  const safetyRow: DimensionComparisonRow = {
    dimensionId: 'safety_requirements_record',
    dimensionLabel: 'Safety Requirements Record',
    dimensionGroup: 'technical_and_testing',
    values: {},
  };
  for (const std of standards) {
    const hasSafety = Boolean(std.safety_requirements);
    safetyRow.values[std.id] = {
      value: hasSafety
        ? typeof std.safety_requirements === 'string'
          ? std.safety_requirements
          : JSON.stringify(std.safety_requirements)
        : 'Not available in current reference dataset.',
      evidenceSource: hasSafety ? 'standard_record' : 'not_available',
    };
  }
  matrixRows.push(safetyRow);

  // Dimension G: Testing Protocols in Record
  const testRow: DimensionComparisonRow = {
    dimensionId: 'testing_requirements_record',
    dimensionLabel: 'Testing Requirements Record',
    dimensionGroup: 'technical_and_testing',
    values: {},
  };
  for (const std of standards) {
    const hasTest = Boolean(std.testing_requirements);
    testRow.values[std.id] = {
      value: hasTest
        ? typeof std.testing_requirements === 'string'
          ? std.testing_requirements
          : JSON.stringify(std.testing_requirements)
        : 'Not available in current reference dataset.',
      evidenceSource: hasTest ? 'standard_record' : 'not_available',
    };
  }
  matrixRows.push(testRow);

  // Dimension H: Performance Requirements in Record
  const perfRow: DimensionComparisonRow = {
    dimensionId: 'performance_requirements_record',
    dimensionLabel: 'Performance Specifications Record',
    dimensionGroup: 'technical_and_testing',
    values: {},
  };
  for (const std of standards) {
    const hasPerf = Boolean(std.performance_requirements);
    perfRow.values[std.id] = {
      value: hasPerf
        ? typeof std.performance_requirements === 'string'
          ? std.performance_requirements
          : JSON.stringify(std.performance_requirements)
        : 'Not available in current reference dataset.',
      evidenceSource: hasPerf ? 'standard_record' : 'not_available',
    };
  }
  matrixRows.push(perfRow);

  // Dimension I: Requirement Alignment: Product
  const reqProdRow: DimensionComparisonRow = {
    dimensionId: 'req_product_alignment',
    dimensionLabel: `Product Alignment ("${requirements.product?.name || 'Item'}")`,
    dimensionGroup: 'requirement_alignment',
    values: {},
  };
  for (const std of standards) {
    const gap = gapAnalyses[std.id];
    const prodItem = gap?.items.find((i) => i.category === 'product');
    reqProdRow.values[std.id] = {
      value: prodItem ? prodItem.explanation : 'Not evaluated',
      evidenceSource: 'gap_analysis',
      status: prodItem?.status,
      statusLabel: prodItem?.statusLabel,
    };
  }
  matrixRows.push(reqProdRow);

  // Dimension J: Requirement Alignment: Application
  if (requirements.application) {
    const reqAppRow: DimensionComparisonRow = {
      dimensionId: 'req_application_alignment',
      dimensionLabel: `Application Alignment ("${requirements.application}")`,
      dimensionGroup: 'requirement_alignment',
      values: {},
    };
    for (const std of standards) {
      const gap = gapAnalyses[std.id];
      const appItem = gap?.items.find((i) => i.category === 'application');
      reqAppRow.values[std.id] = {
        value: appItem ? appItem.explanation : 'Not evaluated',
        evidenceSource: 'gap_analysis',
        status: appItem?.status,
        statusLabel: appItem?.statusLabel,
      };
    }
    matrixRows.push(reqAppRow);
  }

  // Dimension K: Requirement Alignment: Environment
  if (requirements.environment && requirements.environment.length > 0) {
    const envSummary = requirements.environment.map((e) => e.name).join(', ');
    const reqEnvRow: DimensionComparisonRow = {
      dimensionId: 'req_environment_alignment',
      dimensionLabel: `Environment Alignment ("${envSummary}")`,
      dimensionGroup: 'requirement_alignment',
      values: {},
    };
    for (const std of standards) {
      const gap = gapAnalyses[std.id];
      const envItems = gap?.items.filter((i) => i.category === 'environment') || [];
      const hasSupported = envItems.some((i) => i.status === 'supported');
      const hasNeedsVerif = envItems.some((i) => i.status === 'needs_verification');
      const status: RequirementGapStatus = hasSupported
        ? 'supported'
        : hasNeedsVerif
        ? 'needs_verification'
        : 'not_available';

      reqEnvRow.values[std.id] = {
        value: envItems.map((i) => `${i.requirementValue}: ${i.statusLabel}`).join('; ') || 'Not cataloged',
        evidenceSource: 'gap_analysis',
        status,
        statusLabel: getStatusLabel(status),
      };
    }
    matrixRows.push(reqEnvRow);
  }

  // 3. Documented Technical Distinctions (Zero-Fabrication)
  // Computed strictly by set difference of product_types, category, subcategory, keywords
  const technicalDistinctions: StandardTechnicalDistinction[] = [];

  for (let i = 0; i < standards.length; i++) {
    const current = standards[i];
    const others = standards.filter((_, idx) => idx !== i);

    const otherProductTypesNorm = new Set(
      others.flatMap((o) => (o.product_types || []).map(normalize))
    );
    const otherKeywordsNorm = new Set(
      others.flatMap((o) => (o.keywords || []).map(normalize))
    );

    const uniqueProductTypes = (current.product_types || []).filter(
      (pt) => !otherProductTypesNorm.has(normalize(pt))
    );
    const uniqueKeywords = (current.keywords || []).filter(
      (kw) => !otherKeywordsNorm.has(normalize(kw))
    );

    technicalDistinctions.push({
      standardId: current.id,
      standardNumber: current.standard_number,
      standardTitle: current.title,
      categoryClassification: `${current.category} → ${current.subcategory || 'General'}`,
      documentedScope: current.scope || 'Not available in current reference dataset.',
      uniqueProductTypes,
      uniqueKeywords,
    });
  }

  // 4. Consolidated Verification Actions
  const actionMap = new Map<string, Set<string>>();
  for (const std of standards) {
    const gap = gapAnalyses[std.id];
    for (const action of gap.verificationActions) {
      if (!actionMap.has(action)) {
        actionMap.set(action, new Set());
      }
      actionMap.get(action)!.add(std.standard_number);
    }
  }

  const consolidatedVerificationActions: ConsolidatedVerificationAction[] = Array.from(
    actionMap.entries()
  ).map(([action, stdNums]) => ({
    action,
    applicableStandards: Array.from(stdNums),
  }));

  const disclaimer =
    'ISutra is an SIH research prototype. This side-by-side comparison is evidence-backed and draws exclusively from the verified BIS reference dataset. ISutra does NOT declare a "winning", "preferred", or "best" standard, nor does it make legal compliance or certification determinations. Evaluators must verify all tender requirements against official BIS publications.';

  return {
    standards: standardOverviews,
    matrixRows,
    technicalDistinctions,
    gapAnalyses,
    consolidatedVerificationActions,
    disclaimer,
    metadata: {
      datasetName: 'ISutra Verified BIS Reference Dataset',
      standardsEvaluated: VERIFIED_BIS_STANDARDS.length,
      comparedCount: standards.length,
      sourceProvenance: 'Official Bureau of Indian Standards (BIS) reference records',
      timestamp: new Date().toISOString(),
    },
  };
}

function getStatusLabel(status: RequirementGapStatus): string {
  switch (status) {
    case 'supported':
      return 'SUPPORTED BY REFERENCE DATA';
    case 'not_supported':
      return 'NOT SUPPORTED';
    case 'not_available':
      return 'NOT AVAILABLE IN RECORD';
    case 'needs_verification':
      return 'NEEDS VERIFICATION';
  }
}
