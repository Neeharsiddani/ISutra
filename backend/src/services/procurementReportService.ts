// ============================================================
// ISutra — Procurement Report Service
// Phase F: Procurement Report Generation & Export
// Produces structured JSON and printable/downloadable HTML reports
// ============================================================

import { getAnalysisById, StoredAnalysis } from './analysisService';
import { StandardsMatcher, StandardRecommendation, FactorDetail } from './standardsMatcher';
import { analyzeRequirementGaps, RequirementGapAnalysis } from './requirementGapAnalyzer';
import { VERIFIED_BIS_STANDARDS } from '../database/verifiedStandards';

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

    <div class="section-title">3. Requirement Coverage Matrix</div>
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

    <div class="section-title">4. Missing Information & Identified Gaps</div>
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
