// ============================================================
// ISutra: Phase 6 — Procurement Requirement Gap Analysis & Review
// Evidence-Backed Deterministic Coverage Comparison against Verified BIS Standards
// ============================================================

import { VERIFIED_BIS_STANDARDS, VerifiedStandard } from '../database/verifiedStandards';
import type { StructuredRequirements, TaggedRequirementItem } from './ai/types';
import type { MatchEvidenceItem } from './standardsMatcher';

export type RequirementGapStatus =
  | 'supported'
  | 'not_supported'
  | 'not_available'
  | 'needs_verification';

export interface RequirementGapItem {
  requirementId: string;
  category: 'product' | 'application' | 'environment' | 'installation' | 'technical_parameter' | 'material' | 'safety' | 'testing';
  requirementLabel: string;
  requirementValue: string;
  sourceText?: string;

  standardField?: string;
  standardEvidence?: string;

  status: RequirementGapStatus;
  statusLabel: string;

  explanation: string;

  evidence?: MatchEvidenceItem[];
}

export interface RequirementGapAnalysis {
  standardId: string;
  standardNumber: string;
  standardTitle: string;
  standardCategory: string;
  officialSourceUrl: string;

  totalRequirements: number;
  supportedCount: number;
  notSupportedCount: number;
  notAvailableCount: number;
  needsVerificationCount: number;

  referenceCoverage: number | null;
  referenceCoverageLabel: string;
  referenceCoverageExplanation: string;

  items: RequirementGapItem[];

  verificationActions: string[];

  disclaimer: string;
  metadata: {
    datasetName: string;
    standardsEvaluated: number;
    sourceProvenance: string;
    timestamp: string;
  };
}

/**
 * Normalizes text for safe tokenized matching
 */
function normalize(str: string | null | undefined): string {
  return (str || '').toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Tokenizes text into meaningful words (>2 chars)
 */
function tokenize(str: string | null | undefined): string[] {
  return normalize(str)
    .split(' ')
    .filter((w) => w.length > 2);
}

/**
 * Analyzes gaps between extracted procurement requirements and a selected verified BIS standard.
 *
 * NOTE: This is NOT a legal compliance engine. It only compares requirements against verified
 * records in the current 40-standard dataset. Missing fields are explicitly marked 'not_available'
 * or 'needs_verification'.
 */
export function analyzeRequirementGaps(
  requirements: StructuredRequirements,
  standard: VerifiedStandard
): RequirementGapAnalysis {
  const items: RequirementGapItem[] = [];
  const verificationActions: string[] = [];

  const stdTitleNorm = normalize(standard.title);
  const stdScopeNorm = normalize(standard.scope);
  const stdCategoryNorm = normalize(standard.category);
  const stdSubcategoryNorm = normalize(standard.subcategory);
  const stdProductTypes = (standard.product_types || []).map(normalize);
  const stdKeywords = (standard.keywords || []).map(normalize);

  const combinedStdTokens = new Set([
    ...tokenize(standard.title),
    ...tokenize(standard.scope),
    ...tokenize(standard.category),
    ...tokenize(standard.subcategory),
    ...stdProductTypes.flatMap((pt: string) => tokenize(pt)),
    ...stdKeywords.flatMap((kw: string) => tokenize(kw)),
  ]);

  let itemIdCounter = 1;

  // ------------------------------------------------------------
  // 1. PRODUCT / SYSTEM EVALUATION
  // ------------------------------------------------------------
  if (requirements.product?.name) {
    const productName = requirements.product.name;
    const prodNorm = normalize(productName);
    const prodTokens = tokenize(productName);

    // Exact or phrase check against standard product types / title
    const matchesProductType = stdProductTypes.some(
      (pt: string) => pt.includes(prodNorm) || prodNorm.includes(pt)
    );
    const matchesTitle = stdTitleNorm.includes(prodNorm);
    const tokenOverlap = prodTokens.filter((t: string) => combinedStdTokens.has(t)).length;
    const tokenRatio = prodTokens.length > 0 ? tokenOverlap / prodTokens.length : 0;

    let status: RequirementGapStatus = 'not_available';
    let explanation = '';
    let stdEvidence = '';

    if (matchesProductType || matchesTitle || tokenRatio >= 0.6) {
      status = 'supported';
      const matchedType = (standard.product_types || []).find((pt: string) =>
        normalize(pt).split(' ').some((t: string) => prodTokens.includes(t))
      );
      stdEvidence = matchedType
        ? `Standard covers product category: "${matchedType}"`
        : `Standard title specifies: "${standard.title}"`;
      explanation = `The product requirement "${productName}" is explicitly supported within the verified standard scope.`;
    } else if (tokenOverlap > 0) {
      status = 'needs_verification';
      stdEvidence = `Allied terminology in standard: "${standard.category}"`;
      explanation = `Partial domain overlap detected with "${standard.category}", but specific product taxonomy should be verified against official BIS publication.`;
      verificationActions.push(
        `Verify that ${productName} falls within the exact scope definition of ${standard.standard_number}.`
      );
    } else {
      status = 'not_supported';
      stdEvidence = `Standard strictly covers: "${standard.category}" (${standard.title})`;
      explanation = `The product requirement does not match this standard's product domain.`;
    }

    const itemEvidence: MatchEvidenceItem[] = [
      {
        sourceType: 'user_requirement',
        label: 'Procurement Product',
        value: productName,
        matched: status === 'supported',
        field: 'product',
      },
      {
        sourceType: 'standard_data',
        label: 'Standard Product Scope',
        value: stdEvidence,
        matched: status === 'supported',
        field: 'product_types',
      },
    ];

    items.push({
      requirementId: `gap-${itemIdCounter++}`,
      category: 'product',
      requirementLabel: 'Product / System',
      requirementValue: productName,
      sourceText: requirements.product.source_text || productName,
      standardField: 'product_types / title',
      standardEvidence: stdEvidence,
      status,
      statusLabel: getStatusLabel(status),
      explanation,
      evidence: itemEvidence,
    });
  }

  // ------------------------------------------------------------
  // 2. APPLICATION DOMAIN EVALUATION
  // ------------------------------------------------------------
  if (requirements.application) {
    const appText = requirements.application;
    const appTokens = tokenize(appText);

    const matchesScope = stdScopeNorm.length > 0 && appTokens.some((t: string) => stdScopeNorm.includes(t));
    const matchesSubcategory =
      stdSubcategoryNorm.length > 0 && appTokens.some((t: string) => stdSubcategoryNorm.includes(t));
    const matchesCategory =
      stdCategoryNorm.length > 0 && appTokens.some((t: string) => stdCategoryNorm.includes(t));

    let status: RequirementGapStatus = 'not_available';
    let explanation = '';
    let stdEvidence = '';

    if (matchesSubcategory || matchesScope || matchesCategory) {
      status = 'supported';
      stdEvidence = standard.subcategory
        ? `Application classification: "${standard.subcategory}"`
        : `Scope description: "${standard.scope?.slice(0, 100)}..."`;
      explanation = `The intended application "${appText}" aligns with the standard's verified application domain.`;
    } else {
      status = 'needs_verification';
      stdEvidence = standard.subcategory || standard.scope || 'Not specified in summary record';
      explanation = `Application suitability for "${appText}" is not explicitly defined in the summary record and should be cross-checked in the official BIS text.`;
      verificationActions.push(
        `Verify application constraints for "${appText}" against the application clause in ${standard.standard_number}.`
      );
    }

    items.push({
      requirementId: `gap-${itemIdCounter++}`,
      category: 'application',
      requirementLabel: 'Application Domain',
      requirementValue: appText,
      sourceText: requirements.application_source || appText,
      standardField: 'subcategory / scope',
      standardEvidence: stdEvidence,
      status,
      statusLabel: getStatusLabel(status),
      explanation,
      evidence: [
        {
          sourceType: 'user_requirement',
          label: 'Procurement Application',
          value: appText,
          matched: status === 'supported',
          field: 'application',
        },
        {
          sourceType: 'standard_data',
          label: 'Standard Application Domain',
          value: stdEvidence,
          matched: status === 'supported',
          field: 'subcategory',
        },
      ],
    });
  }

  // ------------------------------------------------------------
  // 3. ENVIRONMENTAL CONDITIONS EVALUATION
  // ------------------------------------------------------------
  if (requirements.environment && requirements.environment.length > 0) {
    for (const envItem of requirements.environment) {
      const envNorm = normalize(envItem.name);
      const isOutdoor = envNorm.includes('outdoor') || envNorm.includes('external') || envNorm.includes('weather');
      const isHighTemp = envNorm.includes('high temperature') || envNorm.includes('thermal') || envNorm.includes('heat');
      const isIndustrial = envNorm.includes('industrial');

      let status: RequirementGapStatus = 'not_available';
      let stdEvidence = '';
      let explanation = '';

      if (isOutdoor) {
        if (
          stdTitleNorm.includes('road') ||
          stdTitleNorm.includes('street') ||
          stdTitleNorm.includes('outdoor') ||
          stdScopeNorm.includes('road') ||
          stdScopeNorm.includes('street') ||
          stdScopeNorm.includes('outdoor')
        ) {
          status = 'supported';
          stdEvidence = `Outdoor / road installation scope explicitly identified in standard title & scope`;
          explanation = `The outdoor environmental requirement is supported by the standard's road/street outdoor luminaire scope.`;
        } else {
          status = 'needs_verification';
          stdEvidence = `General luminaire / equipment standard`;
          explanation = `Outdoor weather resistance suitability should be verified against relevant environmental clauses in ${standard.standard_number}.`;
          verificationActions.push(
            `Verify outdoor environmental ratings and weatherproof requirements in ${standard.standard_number}.`
          );
        }
      } else if (isHighTemp) {
        status = 'needs_verification';
        stdEvidence = 'Operating temperature limits not cataloged in reference record';
        explanation = `High-temperature suitability must be cross-checked against thermal limits and conductor operating temperatures in the official ${standard.standard_number} publication.`;
        verificationActions.push(
          `Verify continuous operating temperature limits against the official ${standard.standard_number} publication.`
        );
      } else if (isIndustrial) {
        if (stdCategoryNorm.includes('industrial') || stdTitleNorm.includes('heavy duty') || stdTitleNorm.includes('industrial')) {
          status = 'supported';
          stdEvidence = `Industrial / heavy duty rating present in record`;
          explanation = `Industrial operating environment matches standard scope.`;
        } else {
          status = 'needs_verification';
          stdEvidence = `Not explicitly cataloged in summary record`;
          explanation = `Verify industrial operating limits against official standard tables.`;
          verificationActions.push(
            `Verify industrial environmental limits in ${standard.standard_number}.`
          );
        }
      } else {
        status = 'not_available';
        stdEvidence = 'Not available in current standard record';
        explanation = `Environmental condition "${envItem.name}" is not cataloged in the verified reference dataset record.`;
        verificationActions.push(
          `Verify environmental applicability for "${envItem.name}" against official BIS publication.`
        );
      }

      items.push({
        requirementId: `gap-${itemIdCounter++}`,
        category: 'environment',
        requirementLabel: `Environment: ${envItem.name}`,
        requirementValue: envItem.name,
        sourceText: envItem.source_text || envItem.name,
        standardField: 'scope / environment',
        standardEvidence: stdEvidence,
        status,
        statusLabel: getStatusLabel(status),
        explanation,
        evidence: [
          {
            sourceType: 'user_requirement',
            label: 'Environmental Condition',
            value: envItem.name,
            matched: status === 'supported',
            field: 'environment',
          },
          {
            sourceType: 'standard_data',
            label: 'Standard Environmental Evidence',
            value: stdEvidence,
            matched: status === 'supported',
            field: 'scope',
          },
        ],
      });
    }
  }

  // ------------------------------------------------------------
  // 4. INSTALLATION REQUIREMENTS EVALUATION
  // ------------------------------------------------------------
  if (requirements.installation_requirements && requirements.installation_requirements.length > 0) {
    for (const inst of requirements.installation_requirements) {
      const instNorm = normalize(inst.name);
      let status: RequirementGapStatus = 'not_available';
      let stdEvidence = '';
      let explanation = '';

      if (
        (instNorm.includes('pole') || instNorm.includes('column')) &&
        (stdTitleNorm.includes('road') || stdTitleNorm.includes('street') || stdTitleNorm.includes('lighting'))
      ) {
        status = 'supported';
        stdEvidence = `Standard covers column/pole luminaires for road and street lighting`;
        explanation = `Pole mounted installation requirement aligns with road and street lighting installation context.`;
      } else {
        status = 'needs_verification';
        stdEvidence = `Installation clause exists in standard series`;
        explanation = `Mounting and fixing provisions for "${inst.name}" should be verified in the installation section of ${standard.standard_number}.`;
        verificationActions.push(
          `Verify mounting and installation requirements for "${inst.name}" against official ${standard.standard_number} publication.`
        );
      }

      items.push({
        requirementId: `gap-${itemIdCounter++}`,
        category: 'installation',
        requirementLabel: `Installation: ${inst.name}`,
        requirementValue: inst.name,
        sourceText: inst.source_text || inst.name,
        standardField: 'scope / installation',
        standardEvidence: stdEvidence,
        status,
        statusLabel: getStatusLabel(status),
        explanation,
        evidence: [
          {
            sourceType: 'user_requirement',
            label: 'Installation Method',
            value: inst.name,
            matched: status === 'supported',
            field: 'installation',
          },
          {
            sourceType: 'standard_data',
            label: 'Standard Installation Context',
            value: stdEvidence,
            matched: status === 'supported',
            field: 'scope',
          },
        ],
      });
    }
  }

  // ------------------------------------------------------------
  // 5. TECHNICAL PARAMETERS EVALUATION (DO NOT FABRICATE CLAUSES)
  // ------------------------------------------------------------
  if (requirements.technical_parameters && requirements.technical_parameters.length > 0) {
    for (const param of requirements.technical_parameters) {
      const paramName = param.parameter;
      const paramVal = param.value;
      const paramNorm = normalize(paramName);

      // In the 40-standard reference dataset, clause-by-clause numerical parameter tables are not stored.
      // E.g. Ingress Protection (IP65) is typical for outdoor luminaires, but specific rating table requires publication check.
      let status: RequirementGapStatus = 'not_available';
      let stdEvidence = 'Not available in current standard record';
      let explanation = '';

      if (paramNorm.includes('ingress') || paramNorm.includes('ip') || paramNorm.includes('protection')) {
        status = 'needs_verification';
        stdEvidence = 'Ingress protection requirements covered under luminaire classification in standard';
        explanation = `IP ratings (such as ${paramVal}) are governed by standard testing sections, but the specific minimum IP rating for this luminaire category must be verified in the official publication.`;
        verificationActions.push(
          `Verify minimum IP rating requirements (${paramVal}) against the official ${standard.standard_number} publication.`
        );
      } else if (paramNorm.includes('voltage') || paramNorm.includes('power') || paramNorm.includes('watt')) {
        status = 'not_available';
        stdEvidence = 'Not available in current standard record';
        explanation = `The reference dataset does not store numerical limits for ${paramName} (${paramVal}). Standards specify testing conditions rather than limiting procurement wattage.`;
        verificationActions.push(
          `Verify rated ${paramName} (${paramVal}) electrical safety parameters against the official ${standard.standard_number} publication.`
        );
      } else {
        status = 'not_available';
        stdEvidence = 'Not available in current standard record';
        explanation = `Parameter "${paramName}" is not cataloged in the verified summary dataset for ${standard.standard_number}.`;
        verificationActions.push(
          `Verify technical parameter "${paramName}: ${paramVal}" against the official ${standard.standard_number} publication.`
        );
      }

      items.push({
        requirementId: `gap-${itemIdCounter++}`,
        category: 'technical_parameter',
        requirementLabel: `Parameter: ${paramName}`,
        requirementValue: paramVal ? `${paramName}: ${paramVal}` : paramName,
        sourceText: param.source_text || `${paramName}: ${paramVal}`,
        standardField: 'technical_parameters',
        standardEvidence: stdEvidence,
        status,
        statusLabel: getStatusLabel(status),
        explanation,
        evidence: [
          {
            sourceType: 'user_requirement',
            label: `Parameter: ${paramName}`,
            value: paramVal,
            matched: false,
            field: 'technical_parameters',
          },
          {
            sourceType: 'standard_data',
            label: 'Standard Parameter Limit',
            value: stdEvidence,
            matched: false,
            field: 'technical_parameters',
          },
        ],
      });
    }
  }

  // ------------------------------------------------------------
  // 6. MATERIALS EVALUATION
  // ------------------------------------------------------------
  if (requirements.materials && requirements.materials.length > 0) {
    for (const mat of requirements.materials) {
      items.push({
        requirementId: `gap-${itemIdCounter++}`,
        category: 'material',
        requirementLabel: `Material: ${mat.name}`,
        requirementValue: mat.name,
        sourceText: mat.source_text || mat.name,
        standardField: 'materials',
        standardEvidence: 'Not available in current standard record',
        status: 'not_available',
        statusLabel: getStatusLabel('not_available'),
        explanation: `Material specifications for "${mat.name}" are not recorded in the verified reference record.`,
        evidence: [
          {
            sourceType: 'user_requirement',
            label: 'Specified Material',
            value: mat.name,
            matched: false,
            field: 'materials',
          },
          {
            sourceType: 'standard_data',
            label: 'Standard Material Data',
            value: 'Not available in current standard record',
            matched: false,
            field: 'materials',
          },
        ],
      });
      verificationActions.push(
        `Verify material grade "${mat.name}" against material and construction clauses in ${standard.standard_number}.`
      );
    }
  }

  // ------------------------------------------------------------
  // 7. SAFETY & TESTING REQUIREMENTS EVALUATION
  // ------------------------------------------------------------
  const safetyAndTesting = [
    ...(requirements.safety_requirements || []).map((s: TaggedRequirementItem) => ({ ...s, kind: 'Safety' as const })),
    ...(requirements.testing_requirements || []).map((t: TaggedRequirementItem) => ({ ...t, kind: 'Testing' as const })),
    ...(requirements.performance_requirements || []).map((p: TaggedRequirementItem) => ({ ...p, kind: 'Performance' as const })),
  ];

  for (const st of safetyAndTesting) {
    items.push({
      requirementId: `gap-${itemIdCounter++}`,
      category: st.kind === 'Safety' ? 'safety' : 'testing',
      requirementLabel: `${st.kind}: ${st.name}`,
      requirementValue: st.name,
      sourceText: st.source_text || st.name,
      standardField: `${st.kind.toLowerCase()}_requirements`,
      standardEvidence: 'Not available in current standard record',
      status: 'needs_verification',
      statusLabel: getStatusLabel('needs_verification'),
      explanation: `${st.kind} requirements for "${st.name}" exist in the standard's general testing framework, but specific test criteria must be reviewed in the official publication.`,
      evidence: [
        {
          sourceType: 'user_requirement',
          label: `${st.kind} Requirement`,
          value: st.name,
          matched: false,
          field: 'safety_testing',
        },
        {
          sourceType: 'standard_data',
          label: `Standard ${st.kind} Clauses`,
          value: 'Not available in current standard record',
          matched: false,
          field: 'safety_testing',
        },
      ],
    });
    verificationActions.push(
      `Verify ${st.kind.toLowerCase()} requirement "${st.name}" against test protocols in ${standard.standard_number}.`
    );
  }

  // ------------------------------------------------------------
  // METRICS & REFERENCE COVERAGE CALCULATION
  // ------------------------------------------------------------
  const totalRequirements = items.length;
  const supportedCount = items.filter((i) => i.status === 'supported').length;
  const notSupportedCount = items.filter((i) => i.status === 'not_supported').length;
  const notAvailableCount = items.filter((i) => i.status === 'not_available').length;
  const needsVerificationCount = items.filter((i) => i.status === 'needs_verification').length;

  // Meaningful comparison denominator: requirements where standard data could be compared or needs verification
  const comparableCount = supportedCount + notSupportedCount + needsVerificationCount;
  const referenceCoverage =
    comparableCount > 0 ? Math.round((supportedCount / comparableCount) * 100) : null;

  const referenceCoverageLabel =
    referenceCoverage !== null ? `${referenceCoverage}% Reference Coverage` : 'Reference coverage unavailable';

  const referenceCoverageExplanation =
    'Reference coverage indicates how much of the extracted requirement set could be compared using the current verified ISutra reference data. It is not a compliance determination.';

  const disclaimer =
    'ISutra is an SIH research prototype. This review uses the current verified reference dataset and does not constitute BIS certification, legal compliance advice, or a compliance determination. Verify procurement and compliance requirements against official BIS publications.';

  // Deduplicate verification actions
  const uniqueVerificationActions = Array.from(new Set(verificationActions));

  return {
    standardId: standard.id,
    standardNumber: standard.standard_number,
    standardTitle: standard.title,
    standardCategory: standard.category,
    officialSourceUrl: standard.source_url,

    totalRequirements,
    supportedCount,
    notSupportedCount,
    notAvailableCount,
    needsVerificationCount,

    referenceCoverage,
    referenceCoverageLabel,
    referenceCoverageExplanation,

    items,
    verificationActions: uniqueVerificationActions,

    disclaimer,
    metadata: {
      datasetName: 'ISutra Verified BIS Reference Dataset',
      standardsEvaluated: VERIFIED_BIS_STANDARDS.length,
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
