// ============================================================
// ISutra — Procurement Report Service
// Phase F: Procurement Report Generation & Export
// Produces structured JSON and printable/downloadable HTML reports
// ============================================================

import { getAnalysisById, StoredAnalysis } from './analysisService';
import { StandardsMatcher, StandardRecommendation, FactorDetail } from './standardsMatcher';
import { analyzeRequirementGaps, RequirementGapAnalysis } from './requirementGapAnalyzer';
import { VERIFIED_BIS_STANDARDS } from '../database/verifiedStandards';
import { getResolvedRelationships } from './standardsRelationshipService';
import { getStandardLifecycle } from './standardLifecycleService';

export interface ReportAssociatedReference {
  standardNumber: string;
  relationshipType: string;
  isVerified: boolean;
  evidence?: string;
  source: string;
  verifiedSourceUrl?: string;
  parentStandard?: string;
}

export interface ReportAmendmentItem {
  amendmentNumber: number;
  amendmentLabel: string;
  establishmentDate?: string;
  publicationDate?: string;
  effectiveDate?: string;
  affectedClauses: string[];
  summary: string;
  gazetteRef?: string;
  verifiedSourceUrl: string;
}

export interface ReportLifecycleEvidence {
  hasEvidence: boolean;
  edition?: string;
  editionNumber?: string;
  editionYear?: number;
  lifecycleStatus?: string;
  reaffirmationYear?: number;
  supersedesStandard?: string;
  supersededByStandard?: string;
  transitionEndDate?: string;
  gazetteRef?: string;
  verifiedSourceUrl?: string;
  lastVerifiedAt?: string;
  amendments: ReportAmendmentItem[];
  amendmentNotice: string;
}

export interface ReportStandardItem {
  standardNumber: string;
  title: string;
  relevancePercentage: number;
  specificityTier?: number;
  specificityTierLabel?: string;
  whyMatched: string[];
  evidence: string[];
  hasContradiction: boolean;
  contradictionDetails?: string[];
  associatedReferences?: ReportAssociatedReference[];
  lifecycleEvidence?: ReportLifecycleEvidence;
}

export interface ReportCoverageItem {
  requirementType: string;
  requirementName: string;
  requirementValue: string;
  supportedByTopStandard: boolean;
  evidence: string;
  status: 'matched' | 'partially_matched' | 'not_available' | 'contradicted';
}

export interface ProcurementReportData {
  reportId: string;
  generatedAt: string;
  analysisId: string;
  documentProvenance?: StoredAnalysis['document_provenance'];
  executiveSummary: {
    procurementRequirement: string;
    productName: string;
    productCategory: string;
    readinessStatus: 'ready' | 'clarification_required';
    blockingGaps: string[];
    analysisDate: string;
  };
  applicableStandards: ReportStandardItem[];
  requirementCoverage: ReportCoverageItem[];
  missingInformation: string[];
  limitations: string[];
}

/**
 * Compile structured procurement report data
 */
export async function generateProcurementReportData(
  analysisId: string
): Promise<ProcurementReportData> {
  const analysis = await getAnalysisById(analysisId);
  if (!analysis) {
    throw new Error(`Analysis record '${analysisId}' not found.`);
  }

  const reqs = analysis.requirements;
  const isReady = reqs.ready_for_matching ?? analysis.ready_for_matching ?? true;
  const blockingGaps = reqs.blocking_missing_information || analysis.blocking_missing_information || [];

  // Match standards using existing Phase B/E matcher
  let recommendations: StandardRecommendation[] = [];
  if (isReady) {
    const matcher = new StandardsMatcher();
    const matchResult = matcher.evaluate(reqs, VERIFIED_BIS_STANDARDS, { minScoreThreshold: 0.20 });
    recommendations = matchResult.recommendations;
  }

  // Compile standards list
  const applicableStandards: ReportStandardItem[] = recommendations.slice(0, 5).map((rec) => {
    const contradictionComparisons = (rec.comparison || []).filter((c) => c.status === 'contradiction');
    const hasContradiction =
      contradictionComparisons.length > 0 ||
      Object.values(rec.factorStatuses).some((f) => f && f.status === 'contradiction');
    const contradictionDetails = contradictionComparisons.map(
      (c) => `${c.field}: Requirement '${c.requirementValue}' conflicts with standard '${c.standardValue}' (${c.note || ''})`
    );

    const whyMatched: string[] = [];
    if (rec.reason) whyMatched.push(rec.reason);

    const evidence: string[] = [];
    if (rec.factorStatuses) {
      for (const [key, factor] of Object.entries(rec.factorStatuses)) {
        const f = factor as FactorDetail;
        if (f && Array.isArray(f.evidence) && f.evidence.length > 0) {
          evidence.push(...f.evidence.map((ev: string) => `[${key}] ${ev}`));
        }
      }
    }

    const resolvedRels = getResolvedRelationships(rec.standard.id);
    const associatedReferences: ReportAssociatedReference[] = (resolvedRels.data || []).map((rel) => ({
      standardNumber: rel.target_standard_number || rel.target_standard_id,
      relationshipType:
        rel.verification_status === 'verified'
          ? (rel.relationship_type === 'normative_reference'
              ? 'Normative Reference'
              : rel.relationship_type === 'test_method'
              ? 'Test Method'
              : rel.relationship_type === 'installation_standard'
              ? 'Installation Standard'
              : rel.relationship_type === 'safety_standard'
              ? 'Safety Standard'
              : rel.relationship_type === 'terminology'
              ? 'Terminology Standard'
              : rel.relationship_type === 'related_product'
              ? 'Related Product'
              : 'Allied Standard')
          : 'Associated reference — relationship type not classified',
      isVerified: rel.verification_status === 'verified',
      evidence: rel.evidence_clause,
      source: rel.source_provenance || 'Current verified reference dataset',
      verifiedSourceUrl: rel.verified_source_url,
      parentStandard: rec.standard.standard_number,
    }));

    const lifecycleRes = getStandardLifecycle(rec.standard.id);
    const hasLifecycle = !!lifecycleRes.lifecycle;
    const hasAmendments = lifecycleRes.amendments.length > 0;
    const hasEvidence = hasLifecycle || hasAmendments;

    let lifecycleEvidence: ReportLifecycleEvidence | undefined = undefined;
    if (hasEvidence) {
      lifecycleEvidence = {
        hasEvidence: true,
        edition: lifecycleRes.lifecycle
          ? `${lifecycleRes.lifecycle.edition_number} — ${lifecycleRes.lifecycle.edition_year}`
          : undefined,
        editionNumber: lifecycleRes.lifecycle?.edition_number,
        editionYear: lifecycleRes.lifecycle?.edition_year,
        lifecycleStatus: lifecycleRes.lifecycle
          ? (lifecycleRes.lifecycle.lifecycle_status === 'current'
              ? 'Current — based on curated lifecycle evidence'
              : lifecycleRes.lifecycle.lifecycle_status === 'reaffirmed'
              ? 'Reaffirmed'
              : lifecycleRes.lifecycle.lifecycle_status === 'amended'
              ? 'Amended'
              : lifecycleRes.lifecycle.lifecycle_status === 'superseded'
              ? 'Superseded'
              : lifecycleRes.lifecycle.lifecycle_status === 'withdrawn'
              ? 'Withdrawn'
              : lifecycleRes.lifecycle.lifecycle_status === 'under_revision'
              ? 'Under revision'
              : lifecycleRes.lifecycle.lifecycle_status)
          : undefined,
        reaffirmationYear: lifecycleRes.lifecycle?.reaffirmation_year,
        supersedesStandard: lifecycleRes.lifecycle?.supersedes_standard_number,
        supersededByStandard: lifecycleRes.lifecycle?.superseded_by_standard_number,
        transitionEndDate: lifecycleRes.lifecycle?.transition_end_date,
        gazetteRef: lifecycleRes.lifecycle?.gazette_notification_ref,
        verifiedSourceUrl: lifecycleRes.lifecycle?.verified_source_url,
        lastVerifiedAt: lifecycleRes.lifecycle?.last_verified_at,
        amendments: lifecycleRes.amendments.map((a) => ({
          amendmentNumber: a.amendment_number,
          amendmentLabel: a.amendment_label,
          establishmentDate: a.establishment_date,
          publicationDate: a.publication_date,
          effectiveDate: a.effective_date,
          affectedClauses: a.affected_clauses,
          summary: a.summary,
          gazetteRef: a.gazette_notification_ref,
          verifiedSourceUrl: a.verified_source_url,
        })),
        amendmentNotice: hasAmendments
          ? `${lifecycleRes.amendments.length} verified amendment${lifecycleRes.amendments.length === 1 ? '' : 's'}`
          : 'No verified amendment record in the current ISutra reference dataset.',
      };
    }

    return {
      standardNumber: rec.standard.standard_number || rec.standard.id,
      title: rec.standard.title,
      relevancePercentage: rec.relevancePercentage,
      specificityTier: rec.specificityTier,
      specificityTierLabel: rec.specificityTierLabel,
      whyMatched,
      evidence: evidence.slice(0, 6),
      hasContradiction,
      contradictionDetails: contradictionDetails.length > 0 ? contradictionDetails : undefined,
      associatedReferences: associatedReferences.length > 0 ? associatedReferences : undefined,
      lifecycleEvidence,
    };
  });

  // Evaluate coverage against top standard if available
  const requirementCoverage: ReportCoverageItem[] = [];
  if (applicableStandards.length > 0 && recommendations[0]) {
    try {
      const topStandard = recommendations[0].standard;
      const gapResult: RequirementGapAnalysis = analyzeRequirementGaps(reqs, topStandard);

      for (const item of gapResult.items || []) {
        requirementCoverage.push({
          requirementType: item.category || 'Technical Parameter',
          requirementName: item.requirementLabel,
          requirementValue: item.requirementValue,
          supportedByTopStandard: item.status === 'supported',
          evidence: item.standardEvidence || item.explanation || 'Documented in standard specifications',
          status:
            item.status === 'supported'
              ? 'matched'
              : item.status === 'not_supported'
              ? 'contradicted'
              : 'not_available',
        });
      }
    } catch {
      // Fallback: populate from extracted technical parameters
      for (const p of reqs.technical_parameters) {
        requirementCoverage.push({
          requirementType: 'Technical Parameter',
          requirementName: p.parameter,
          requirementValue: p.value,
          supportedByTopStandard: true,
          evidence: 'Specified in procurement requirement',
          status: 'matched',
        });
      }
    }
  } else {
    for (const p of reqs.technical_parameters) {
      requirementCoverage.push({
        requirementType: 'Technical Parameter',
        requirementName: p.parameter,
        requirementValue: p.value,
        supportedByTopStandard: false,
        evidence: 'Pending requirement clarification before matching',
        status: 'not_available',
      });
    }
  }

  const limitations = [
    'Recommendations are generated strictly from ISutra verified Indian Standards dataset.',
    "'not_available' indicates that the specific parameter is not recorded in the reference record, not necessarily non-compliance.",
    'Procurement officers must verify all mandatory specifications and amendments with the official Bureau of Indian Standards publication before tender issuance.',
    'Associated standards may affect testing, safety, or installation requirements; verify relationship classification and normative applicability directly against official BIS publications.',
    'Automated matching does not constitute formal engineering sign-off or statutory product certification.',
  ];

  return {
    reportId: `REP-${analysis.analysis_id.replace(/^analysis-|^doc-analysis-/, '')}`,
    generatedAt: new Date().toISOString(),
    analysisId: analysis.analysis_id,
    documentProvenance: analysis.document_provenance,
    executiveSummary: {
      procurementRequirement: analysis.input_text,
      productName: reqs.product.name,
      productCategory: reqs.product.category || 'General Engineering',
      readinessStatus: isReady ? 'ready' : 'clarification_required',
      blockingGaps,
      analysisDate: analysis.created_at,
    },
    applicableStandards,
    requirementCoverage,
    missingInformation: reqs.missing_information || [],
    limitations,
  };
}

export function formatReportDate(dateStr?: string): string {
  if (!dateStr || !dateStr.trim()) return 'Not available in current reference dataset.';
  const s = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIdx = parseInt(m, 10) - 1;
    const day = parseInt(d, 10);
    if (monthIdx >= 0 && monthIdx < 12) return `${day} ${months[monthIdx]} ${y}`;
    return s;
  }
  if (/^\d{4}-\d{2}$/.test(s)) {
    const [y, m] = s.split('-');
    const fullMonths = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIdx = parseInt(m, 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) return `${fullMonths[monthIdx]} ${y}`;
    return s;
  }
  return s;
}

function renderLifecycleSectionHtml(
  standardsWithLifecycle: ReportStandardItem[],
  sectionHeader: string
): string {
  if (standardsWithLifecycle.length === 0) return '';

  const cardsHtml = standardsWithLifecycle
    .map((s) => {
      const lc = s.lifecycleEvidence!;
      const amendmentsTable =
        lc.amendments.length > 0
          ? `<table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 6px;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="padding: 6px 8px; border: 1px solid #e2e8f0;">Amendment</th>
                <th style="padding: 6px 8px; border: 1px solid #e2e8f0;">Dates</th>
                <th style="padding: 6px 8px; border: 1px solid #e2e8f0;">Affected Clauses</th>
                <th style="padding: 6px 8px; border: 1px solid #e2e8f0;">Summary</th>
                <th style="padding: 6px 8px; border: 1px solid #e2e8f0;">Official Evidence</th>
              </tr>
            </thead>
            <tbody>
              ${lc.amendments
                .map((amd) => {
                  const pub = amd.publicationDate ? `Published: ${formatReportDate(amd.publicationDate)}<br/>` : '';
                  const est = amd.establishmentDate ? `Established: ${formatReportDate(amd.establishmentDate)}<br/>` : '';
                  const eff = amd.effectiveDate ? `Effective: ${formatReportDate(amd.effectiveDate)}` : '';
                  const datesHtml = pub || est || eff ? `${pub}${est}${eff}` : '<span style="color: #94a3b8; font-style: italic;">Not available in current reference dataset.</span>';
                  const gazetteHtml = amd.gazetteRef ? `<br/><span style="color: #627d98; font-size: 10px;">Gazette: ${amd.gazetteRef}</span>` : '';
                  return `<tr>
                    <td style="font-weight: 700; color: #0f766e; white-space: nowrap; padding: 6px 8px; border: 1px solid #e2e8f0;">${amd.amendmentLabel}</td>
                    <td style="font-size: 11px; color: #334e68; white-space: nowrap; padding: 6px 8px; border: 1px solid #e2e8f0;">${datesHtml}</td>
                    <td style="padding: 6px 8px; border: 1px solid #e2e8f0; font-family: monospace; font-size: 11px;">${amd.affectedClauses.join(', ')}</td>
                    <td style="padding: 6px 8px; border: 1px solid #e2e8f0; font-size: 11px; color: #334e68;">${amd.summary}${gazetteHtml}</td>
                    <td style="padding: 6px 8px; border: 1px solid #e2e8f0; font-size: 11px; white-space: nowrap;">
                      <a href="${amd.verifiedSourceUrl}" target="_blank" rel="noopener noreferrer" style="color: #0f766e; text-decoration: underline;">Official Evidence</a>
                    </td>
                  </tr>`;
                })
                .join('')}
            </tbody>
          </table>`
          : `<div style="font-size: 11px; color: #627d98; font-style: italic; padding: 8px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px;">
            No verified amendment record in the current ISutra reference dataset. This does not establish that no amendment exists. Verify the official BIS source before procurement use.
          </div>`;

      const reaffirmationBlock = lc.reaffirmationYear
        ? `<div>
            <strong style="color: #627d98; font-size: 11px; text-transform: uppercase; display: block;">Reaffirmation</strong>
            <span style="font-weight: 600; color: #102a43;">${lc.reaffirmationYear}</span>
            <span style="display: block; font-size: 10px; color: #627d98; font-style: italic;">Reaffirmation indicates that the standard was formally reviewed and reaffirmed; it is distinct from an amendment or full revision.</span>
          </div>`
        : '';

      const supersedesBlock = lc.supersedesStandard
        ? `<div>
            <strong style="color: #627d98; font-size: 11px; text-transform: uppercase; display: block;">Supersession</strong>
            <span style="font-weight: 600; color: #102a43;">Supersedes: ${lc.supersedesStandard}</span>
          </div>`
        : '';

      const supersededByBlock = lc.supersededByStandard
        ? `<div>
            <strong style="color: #627d98; font-size: 11px; text-transform: uppercase; display: block;">Supersession</strong>
            <span style="font-weight: 600; color: #c5221f;">Superseded by: ${lc.supersededByStandard}</span>
          </div>`
        : '';

      const transitionBlock = lc.transitionEndDate
        ? `<div>
            <strong style="color: #627d98; font-size: 11px; text-transform: uppercase; display: block;">Transition / Concurrent Running Ends</strong>
            <span style="font-weight: 600; color: #b45309;">${formatReportDate(lc.transitionEndDate)}</span>
            <span style="display: block; font-size: 10px; color: #627d98; font-style: italic;">See official BIS implementation evidence for applicability.</span>
          </div>`
        : '';

      const sourceLinkBlock = lc.verifiedSourceUrl
        ? `<div>
            <strong style="color: #627d98; font-size: 11px; text-transform: uppercase; display: block;">Official BIS Evidence</strong>
            <a href="${lc.verifiedSourceUrl}" target="_blank" rel="noopener noreferrer" style="color: #0f766e; text-decoration: underline; font-weight: 600; font-size: 11px;">Open Official BIS Evidence</a>
          </div>`
        : '';

      const amdHeaderCount = lc.amendments.length > 0
        ? `(${lc.amendments.length} verified amendment${lc.amendments.length === 1 ? '' : 's'})`
        : '(No verified amendments in reference dataset)';

      return `<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 12px;">
          <div>
            <span style="font-size: 16px; font-weight: 700; color: #0f766e;">${s.standardNumber}</span>
            <span style="font-size: 13px; font-weight: 600; color: #102a43; margin-left: 8px;">${s.title}</span>
          </div>
          <span style="font-size: 11px; font-weight: 600; background: #e6f4ea; color: #137333; border: 1px solid #ceead6; padding: 2px 8px; border-radius: 4px;">
            Verified BIS evidence
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 12px; margin-bottom: 12px;">
          <div>
            <strong style="color: #627d98; font-size: 11px; text-transform: uppercase; display: block;">Curated Reference Edition</strong>
            <span style="font-weight: 600; color: #102a43;">${lc.edition || 'Not available in current reference dataset.'}</span>
          </div>
          <div>
            <strong style="color: #627d98; font-size: 11px; text-transform: uppercase; display: block;">Lifecycle Status</strong>
            <span style="font-weight: 600; color: #102a43;">${lc.lifecycleStatus || 'Not available in current reference dataset.'}</span>
          </div>
          ${reaffirmationBlock}
          ${supersedesBlock}
          ${supersededByBlock}
          ${transitionBlock}
          ${sourceLinkBlock}
        </div>

        <div style="margin-top: 10px; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
          <div style="font-size: 12px; font-weight: 700; color: #102a43; margin-bottom: 8px;">
            Amendment History
            <span style="font-weight: normal; color: #627d98; font-size: 11px; margin-left: 6px;">${amdHeaderCount}</span>
          </div>
          ${amendmentsTable}
        </div>
      </div>`;
    })
    .join('');

  return `<div class="section-title">${sectionHeader}</div>
    <div style="font-size: 12px; color: #627d98; margin-bottom: 12px;">
      Curated lifecycle, reaffirmation, supersession, and amendment intelligence from official Bureau of Indian Standards (BIS) records and Gazettes. ISutra is a research prototype; verify official BIS sources before procurement commitments.
    </div>
    ${cardsHtml}`;
}

/**
 * Generate clean, self-contained printable HTML report with print stylesheets
 */
export function generatePrintableHtmlReport(report: ProcurementReportData): string {
  const isReady = report.executiveSummary.readinessStatus === 'ready';
  const statusBadge = isReady
    ? `<span style="background: #e6f4ea; color: #137333; padding: 4px 10px; border-radius: 9999px; font-weight: 600; font-size: 12px; border: 1px solid #ceead6;">Ready for Procurement</span>`
    : `<span style="background: #fce8e6; color: #c5221f; padding: 4px 10px; border-radius: 9999px; font-weight: 600; font-size: 12px; border: 1px solid #fad2cf;">Clarification Required</span>`;

  const provenanceHtml = report.documentProvenance
    ? `
    <div class="provenance-box">
      <strong>Source Document:</strong> ${report.documentProvenance.file_name || 'Uploaded File'}
      <span style="margin: 0 8px;">•</span>
      <strong>Type:</strong> ${report.documentProvenance.file_type?.toUpperCase() || 'DOCUMENT'}
      ${report.documentProvenance.page_count ? `<span style="margin: 0 8px;">•</span><strong>Pages:</strong> ${report.documentProvenance.page_count}` : ''}
      <span style="margin: 0 8px;">•</span>
      <strong>Parser:</strong> ${report.documentProvenance.extraction_method || 'Native Parser'}
    </div>
  `
    : '';

  const standardsRows =
    report.applicableStandards.length > 0
      ? report.applicableStandards
          .map(
            (s, idx) => `
      <tr>
        <td style="font-weight: 700; color: #102a43; width: 60px;">#${idx + 1}</td>
        <td style="font-weight: 700; color: #0f766e; white-space: nowrap;">${s.standardNumber}</td>
        <td>${s.title}</td>
        <td style="text-align: center; font-weight: 700; color: #102a43;">${s.relevancePercentage}%</td>
        <td><span class="tier-tag">${s.specificityTierLabel || `Tier ${s.specificityTier || 2}`}</span></td>
        <td style="font-size: 12px; color: #486581;">
          ${s.evidence.slice(0, 2).join('<br/>') || s.whyMatched.join('<br/>') || 'Direct domain match'}
        </td>
      </tr>
    `
          )
          .join('')
      : `<tr><td colspan="6" style="text-align: center; color: #627d98; padding: 20px;">No applicable standards evaluated. Clarification required.</td></tr>`;

  const allAssociated: {
    parentStandard: string;
    targetStandard: string;
    relationshipType: string;
    isVerified: boolean;
    evidence?: string;
    source: string;
    verifiedSourceUrl?: string;
  }[] = [];

  for (const s of report.applicableStandards) {
    if (s.associatedReferences && s.associatedReferences.length > 0) {
      for (const ref of s.associatedReferences) {
        allAssociated.push({
          parentStandard: s.standardNumber,
          targetStandard: ref.standardNumber,
          relationshipType: ref.relationshipType,
          isVerified: ref.isVerified,
          evidence: ref.evidence,
          source: ref.source,
          verifiedSourceUrl: ref.verifiedSourceUrl,
        });
      }
    }
  }

  const standardsWithLifecycle = report.applicableStandards.filter(
    (s) => s.lifecycleEvidence && s.lifecycleEvidence.hasEvidence
  );

  let currentSectionIdx = 2;
  const associatedSectionHeader = allAssociated.length > 0
    ? `${++currentSectionIdx}. Associated References & Allied Standards Trail`
    : '';
  const lifecycleSectionHeader = standardsWithLifecycle.length > 0
    ? `${++currentSectionIdx}. BIS Lifecycle & Amendment Evidence`
    : '';
  const coverageSectionHeader = `${++currentSectionIdx}. Requirement Coverage Matrix`;
  const gapsSectionHeader = `${++currentSectionIdx}. Missing Information & Identified Gaps`;

  const lifecycleSectionHtml = renderLifecycleSectionHtml(
    standardsWithLifecycle,
    lifecycleSectionHeader
  );

  const associatedSectionHtml =
    allAssociated.length > 0
      ? `
    <div class="section-title">${associatedSectionHeader}</div>
    <div style="font-size: 12px; color: #627d98; margin-bottom: 10px;">
      Relationship classifications are evidence-backed where verified citations exist in official publications. Unclassified references indicate cross-citations recorded in standard scopes/specifications.
    </div>
    <table>
      <thead>
        <tr>
          <th>Parent Standard</th>
          <th>Referenced Standard</th>
          <th>Relationship Classification</th>
          <th>Verification Evidence / Notes</th>
          <th>Source Provenance</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${allAssociated
          .map(
            (a) => `
          <tr>
            <td style="font-weight: 700; color: #0f766e; white-space: nowrap;">${a.parentStandard}</td>
            <td style="font-weight: 600; color: #102a43; white-space: nowrap;">${a.targetStandard}</td>
            <td>
              <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; ${
                a.isVerified
                  ? 'background: #e6f4ea; color: #137333; border: 1px solid #ceead6;'
                  : 'background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1;'
              }">
                ${a.relationshipType}
              </span>
            </td>
            <td style="font-size: 12px; color: #486581;">${a.evidence || 'Recorded cross-reference in standard specification / scope.'}</td>
            <td style="font-size: 11px; color: #627d98;">${a.source}</td>
            <td style="font-size: 11px; white-space: nowrap;">
              ${
                a.verifiedSourceUrl
                  ? `<a href="${a.verifiedSourceUrl}" target="_blank" rel="noopener noreferrer" style="color: #0f766e; font-weight: 600; text-decoration: none;">Verify at BIS &rarr;</a>`
                  : `<a href="https://www.bis.gov.in/know-your-standard/?lang=en" target="_blank" rel="noopener noreferrer" style="color: #627d98; text-decoration: none;">BIS Portal &rarr;</a>`
              }
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    `
      : '';

  const coverageRows =
    report.requirementCoverage.length > 0
      ? report.requirementCoverage
          .map(
            (c) => `
      <tr>
        <td style="font-weight: 600; color: #334e68;">${c.requirementName}</td>
        <td style="font-weight: 700; color: #102a43;">${c.requirementValue}</td>
        <td>
          <span class="status-tag status-${c.status}">
            ${c.status.toUpperCase().replace('_', ' ')}
          </span>
        </td>
        <td style="font-size: 12px; color: #486581;">${c.evidence}</td>
      </tr>
    `
          )
          .join('')
      : `<tr><td colspan="4" style="text-align: center; color: #627d98; padding: 15px;">No technical parameters available for coverage mapping.</td></tr>`;

  const gapsList =
    report.missingInformation.length > 0
      ? report.missingInformation
          .map((gap) => `<li>${gap}</li>`)
          .join('')
      : `<li>No outstanding information gaps detected.</li>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ISutra Procurement Evaluation Report — ${report.reportId}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #102a43;
      background: #f8fafc;
      margin: 0;
      padding: 30px;
      line-height: 1.5;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f766e;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    .logo {
      font-size: 26px;
      font-weight: 800;
      color: #0f766e;
      letter-spacing: -0.5px;
    }
    .logo span {
      color: #d97706;
    }
    .report-meta {
      text-align: right;
      font-size: 12px;
      color: #627d98;
    }
    .section-title {
      font-size: 15px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #0f766e;
      margin-top: 30px;
      margin-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
    }
    .provenance-box {
      background: #f0fdfa;
      border: 1px solid #99f6e4;
      color: #115e59;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 12px;
      margin-bottom: 20px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      background: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .summary-item strong {
      display: block;
      font-size: 11px;
      text-transform: uppercase;
      color: #627d98;
      margin-bottom: 4px;
    }
    .summary-item span {
      font-size: 14px;
      font-weight: 600;
      color: #102a43;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 13px;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 9px 12px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      font-weight: 700;
      color: #334e68;
      font-size: 12px;
      text-transform: uppercase;
    }
    .tier-tag {
      background: #e0f2fe;
      color: #0369a1;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      display: inline-block;
    }
    .status-tag {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
    }
    .status-matched { background: #dcfce7; color: #166534; }
    .status-partially_matched { background: #fef9c3; color: #854d0e; }
    .status-not_available { background: #f1f5f9; color: #475569; }
    .status-contradicted { background: #fee2e2; color: #991b1b; }
    .limitations-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      padding: 14px 18px;
      border-radius: 8px;
      font-size: 12px;
      color: #92400e;
      margin-top: 30px;
    }
    .limitations-box ul {
      margin: 6px 0 0 0;
      padding-left: 18px;
    }
    .actions-bar {
      margin-bottom: 20px;
      display: flex;
      justify-content: flex-end;
    }
    .btn-print {
      background: #0f766e;
      color: #ffffff;
      padding: 9px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      border: none;
      cursor: pointer;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .container { border: none; box-shadow: none; padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="actions-bar no-print">
    <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>

  <div class="container">
    <div class="header">
      <div>
        <div class="logo">ISutra <span>BIS</span></div>
        <div style="font-size: 13px; color: #627d98; margin-top: 2px;">Intelligent Indian Standards Procurement Evaluation Report</div>
      </div>
      <div class="report-meta">
        <div><strong>Report ID:</strong> ${report.reportId}</div>
        <div><strong>Analysis ID:</strong> ${report.analysisId}</div>
        <div><strong>Date:</strong> ${new Date(report.generatedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</div>
        <div style="margin-top: 6px;">${statusBadge}</div>
      </div>
    </div>

    ${provenanceHtml}

    <div class="section-title">1. Executive Summary</div>
    <div class="summary-grid">
      <div class="summary-item">
        <strong>Identified Product</strong>
        <span>${report.executiveSummary.productName}</span>
      </div>
      <div class="summary-item">
        <strong>Product Category</strong>
        <span>${report.executiveSummary.productCategory}</span>
      </div>
      <div class="summary-item" style="grid-column: span 2;">
        <strong>Procurement Specification</strong>
        <span style="font-weight: normal; font-size: 13px; color: #334e68;">${report.executiveSummary.procurementRequirement}</span>
      </div>
    </div>

    <div class="section-title">2. Applicable Indian Standards (BIS)</div>
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>IS Number</th>
          <th>Standard Title</th>
          <th style="text-align: center;">Relevance</th>
          <th>Specificity Tier</th>
          <th>Alignment Rationale</th>
        </tr>
      </thead>
      <tbody>
        ${standardsRows}
      </tbody>
    </table>

    ${associatedSectionHtml}

    ${lifecycleSectionHtml}

    <div class="section-title">${coverageSectionHeader}</div>
    <table>
      <thead>
        <tr>
          <th>Parameter / Requirement</th>
          <th>Specified Value</th>
          <th>Status</th>
          <th>Verification Notes & Standard Reference</th>
        </tr>
      </thead>
      <tbody>
        ${coverageRows}
      </tbody>
    </table>

    <div class="section-title">${gapsSectionHeader}</div>
    <ul style="font-size: 13px; color: #334e68; margin-top: 6px; padding-left: 20px;">
      ${gapsList}
    </ul>

    <div class="limitations-box">
      <strong>⚠️ Important Procurement Limitations & Regulatory Disclaimers:</strong>
      <ul>
        ${report.limitations.map((lim) => `<li>${lim}</li>`).join('')}
      </ul>
    </div>
  </div>
</body>
</html>`;
}
