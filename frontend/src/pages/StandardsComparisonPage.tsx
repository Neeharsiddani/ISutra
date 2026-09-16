// ============================================================
// ISutra: Phase 7 — Procurement Standards Comparison Workspace
// Neutral, Evidence-Backed Side-by-Side Reference Comparison Page
// STRICT ZERO-FABRICATION: Displays only facts from verified reference records
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  ExternalLink,
  Download,
  Printer,
  CheckCircle2,
  HelpCircle,
  XCircle,
  FileText,
  Sparkles,
  Info,
  Scale,
  ChevronRight,
} from 'lucide-react';
import { getStandardsComparison, compareStandardsDirect } from '../services/api';
import type {
  StandardsComparisonResult,
  RequirementGapStatus,
  StructuredRequirements,
} from '../types';

export default function StandardsComparisonPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const standardsParam = searchParams.get('standards');
  const locationState = location.state as {
    fromAnalysisId?: string;
    selectedStandardIds?: string[];
    requirements?: StructuredRequirements;
  } | null;

  const standardIds = useMemo(() => {
    if (standardsParam) {
      return standardsParam.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (locationState?.selectedStandardIds && locationState.selectedStandardIds.length > 0) {
      return locationState.selectedStandardIds;
    }
    return [];
  }, [standardsParam, locationState]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<StandardsComparisonResult | null>(null);
  const [activeGroup, setActiveGroup] = useState<'all' | 'metadata' | 'scope_and_products' | 'requirement_alignment' | 'technical_and_testing'>('all');
  const [mobileActiveStandardIndex, setMobileActiveStandardIndex] = useState(0);

  useEffect(() => {
    async function loadComparison() {
      if (standardIds.length < 2 || standardIds.length > 3) {
        setError(`Please select between 2 and 3 standards to compare. Selected: ${standardIds.length}.`);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let result;
        if (id && id !== 'undefined') {
          result = await getStandardsComparison(id, standardIds);
        } else if (locationState?.requirements) {
          result = await compareStandardsDirect(locationState.requirements, standardIds);
        } else {
          throw new Error('Analysis context not found. Please navigate from recommendation results.');
        }

        if (result.success && result.comparison) {
          setComparison(result.comparison);
        } else {
          throw new Error('Failed to load standards comparison.');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error loading standards comparison.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadComparison();
  }, [id, standardIds, locationState]);

  const filteredRows = useMemo(() => {
    if (!comparison) return [];
    if (activeGroup === 'all') return comparison.matrixRows;
    return comparison.matrixRows.filter((r) => r.dimensionGroup === activeGroup);
  }, [comparison, activeGroup]);

  // Download plain-text comparison report
  const handleDownloadReport = () => {
    if (!comparison) return;

    const lines: string[] = [
      '=========================================================================',
      'ISUTRA — PROCUREMENT STANDARDS COMPARISON REPORT',
      'Phase 7: Neutral Side-by-Side Reference Comparison Workspace',
      '=========================================================================',
      `Generated: ${new Date().toLocaleString()}`,
      `Analysis Reference ID: ${id || 'N/A'}`,
      `Dataset: ${comparison.metadata.datasetName} (${comparison.metadata.standardsEvaluated} records)`,
      `Source Provenance: ${comparison.metadata.sourceProvenance}`,
      '',
      '1. COMPARED BIS STANDARDS',
      '-------------------------------------------------------------------------',
    ];

    comparison.standards.forEach((std, idx) => {
      lines.push(`[Standard ${idx + 1}] ${std.standardNumber}`);
      lines.push(`    Title               : ${std.title}`);
      lines.push(`    Category            : ${std.category} → ${std.subcategory}`);
      lines.push(`    Edition Year        : ${std.editionYear}`);
      lines.push(`    Reference Coverage  : ${std.referenceCoverageLabel}`);
      lines.push(`    Official Portal     : ${std.officialSourceUrl}`);
      lines.push('');
    });

    lines.push('2. SIDE-BY-SIDE DIMENSION COMPARISON');
    lines.push('-------------------------------------------------------------------------');

    comparison.matrixRows.forEach((row) => {
      lines.push(`\n• Dimension: ${row.dimensionLabel}`);
      comparison.standards.forEach((std) => {
        const val = row.values[std.id]?.value || 'Not available in current reference dataset.';
        const status = row.values[std.id]?.statusLabel ? ` [${row.values[std.id]?.statusLabel}]` : '';
        lines.push(`    - ${std.standardNumber}: ${val}${status}`);
      });
    });

    lines.push('\n\n3. DOCUMENTED TECHNICAL DISTINCTIONS (ZERO-FABRICATION)');
    lines.push('-------------------------------------------------------------------------');
    comparison.technicalDistinctions.forEach((dist) => {
      lines.push(`• ${dist.standardNumber}:`);
      lines.push(`    Category: ${dist.categoryClassification}`);
      lines.push(`    Documented Scope: ${dist.documentedScope}`);
      if (dist.uniqueProductTypes.length > 0) {
        lines.push(`    Unique Product Types in Record: ${dist.uniqueProductTypes.join(', ')}`);
      }
      if (dist.uniqueKeywords.length > 0) {
        lines.push(`    Unique Keywords in Record: ${dist.uniqueKeywords.join(', ')}`);
      }
      lines.push('');
    });

    lines.push('4. CONSOLIDATED VERIFICATION ACTIONS');
    lines.push('-------------------------------------------------------------------------');
    if (comparison.consolidatedVerificationActions.length === 0) {
      lines.push('No missing technical parameter verification actions identified.');
    } else {
      comparison.consolidatedVerificationActions.forEach((item, idx) => {
        lines.push(`[ ] ${idx + 1}. ${item.action} (Applies to: ${item.applicableStandards.join(', ')})`);
      });
    }

    lines.push('\n5. NEUTRALITY & AUDIT NOTICE');
    lines.push('-------------------------------------------------------------------------');
    lines.push(comparison.disclaimer);
    lines.push('=========================================================================');

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const stdNums = comparison.standards.map((s) => s.standardNumber.replace(/[^\w-]/g, '_')).join('_vs_');
    link.download = `ISutra_Standards_Comparison_${stdNums}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-6 pb-20 animate-fade-in text-[#243B53]">
      {/* 1. Breadcrumbs & Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <Link
            to={id ? `/analysis/${id}/recommendations` : '/analyze'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#243B53]/15 text-[#0F766E] hover:bg-teal-50 transition-colors font-semibold shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Recommendations</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-[#627D98] font-medium">Standards Comparison Workspace</span>
        </div>

        {comparison && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-white border border-[#243B53]/20 hover:bg-slate-50 text-xs font-semibold text-[#243B53] flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-[#627D98]" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadReport}
              className="px-3.5 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#0C5D57] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Comparison Report</span>
            </button>
          </div>
        )}
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-[#243B53]/10 rounded-2xl p-5 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0F766E] uppercase tracking-wider">
          <Scale className="w-4 h-4" />
          <span>Neutral Standards Comparison Workspace</span>
        </div>
        <h1 className="text-base sm:text-xl font-bold text-[#102A43]">
          Side-by-Side Evaluation of {standardIds.length} Indian Standards
        </h1>
        <p className="text-xs text-[#627D98] max-w-3xl leading-relaxed">
          Objective evidence comparison derived strictly from verified BIS records. ISutra does not designate a "winner" or "best" standard. Standards frequently fulfill complementary roles in tender schedules.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white border border-[#243B53]/10 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-10 h-10 border-3 border-[#0F766E]/20 border-t-[#0F766E] rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#102A43]">
            Building Neutral Side-by-Side Comparison Matrix...
          </p>
          <p className="text-xs text-[#627D98]">
            Aligning verified dataset records and requirement gap dimensions without fabricating values.
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center space-y-4 shadow-xs max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#102A43]">Comparison Unavailable</h2>
          <p className="text-xs sm:text-sm text-[#627D98] leading-relaxed">{error}</p>
          <div className="pt-2">
            <Link
              to={id ? `/analysis/${id}/recommendations` : '/analyze'}
              className="px-4 py-2 rounded-xl bg-[#0F766E] text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Recommendations</span>
            </Link>
          </div>
        </div>
      )}

      {/* Loaded Comparison Workspace */}
      {comparison && !loading && (
        <>
          {/* Mobile Standard Selector Switcher (Hidden on Desktop md+) */}
          <div className="block md:hidden bg-white border border-slate-200 rounded-xl p-2 shadow-xs">
            <span className="text-[10px] font-bold text-[#627D98] uppercase tracking-wider block mb-1.5 px-1">
              Active Standard View:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {comparison.standards.map((std, idx) => (
                <button
                  key={std.id}
                  onClick={() => setMobileActiveStandardIndex(idx)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-mono font-bold truncate transition-colors ${
                    mobileActiveStandardIndex === idx
                      ? 'bg-[#0F766E] text-white'
                      : 'bg-slate-100 text-[#486581] hover:bg-slate-200'
                  }`}
                >
                  {std.standardNumber}
                </button>
              ))}
            </div>
          </div>

          {/* Standard Overview Columns (Desktop: 2 or 3 equal cols; Mobile: shows active) */}
          <div className={`grid grid-cols-1 md:grid-cols-${comparison.standards.length} gap-4`}>
            {comparison.standards.map((std, idx) => {
              const isHiddenOnMobile = mobileActiveStandardIndex !== idx;
              return (
                <div
                  key={std.id}
                  className={`bg-white border border-[#243B53]/15 rounded-2xl p-5 shadow-xs space-y-3.5 flex flex-col justify-between ${
                    isHiddenOnMobile ? 'hidden md:flex' : 'flex'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0F766E] font-mono text-xs font-bold border border-teal-200">
                        {std.standardNumber}
                      </span>
                      <span className="text-[11px] text-[#627D98] bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        Edition {std.editionYear}
                      </span>
                    </div>

                    <h2 className="text-sm font-bold text-[#102A43] leading-snug line-clamp-2" title={std.title}>
                      {std.title}
                    </h2>

                    <p className="text-xs text-[#627D98]">
                      {std.category} → {std.subcategory}
                    </p>

                    {/* Reference Coverage Badge */}
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50/80 text-[#0F766E] border border-teal-200 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{std.referenceCoverageLabel}</span>
                      </span>
                    </div>
                  </div>

                  {/* Standard Card Actions */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <Link
                      to={`/analysis/${id}/recommendations/${std.id}/gap-analysis`}
                      state={{ fromAnalysisId: id }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-[#243B53] flex items-center gap-1 transition-colors"
                    >
                      <span>Check Gaps</span>
                      <ChevronRight className="w-3 h-3 text-[#627D98]" />
                    </Link>

                    {std.officialSourceUrl && (
                      <a
                        href={std.officialSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>Official BIS</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dimension Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs bg-white border border-[#243B53]/10 p-2 rounded-xl shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#627D98] px-2">
              Filter Dimensions:
            </span>
            <button
              onClick={() => setActiveGroup('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeGroup === 'all'
                  ? 'bg-[#0F766E] text-white'
                  : 'bg-slate-50 text-[#627D98] hover:bg-slate-100'
              }`}
            >
              All Dimensions ({comparison.matrixRows.length})
            </button>
            <button
              onClick={() => setActiveGroup('scope_and_products')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeGroup === 'scope_and_products'
                  ? 'bg-[#0F766E] text-white'
                  : 'bg-slate-50 text-[#627D98] hover:bg-slate-100'
              }`}
            >
              Scope & Products
            </button>
            <button
              onClick={() => setActiveGroup('requirement_alignment')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeGroup === 'requirement_alignment'
                  ? 'bg-[#0F766E] text-white'
                  : 'bg-slate-50 text-[#627D98] hover:bg-slate-100'
              }`}
            >
              Requirement Alignment
            </button>
            <button
              onClick={() => setActiveGroup('technical_and_testing')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeGroup === 'technical_and_testing'
                  ? 'bg-[#0F766E] text-white'
                  : 'bg-slate-50 text-[#627D98] hover:bg-slate-100'
              }`}
            >
              Technical & Testing
            </button>
          </div>

          {/* Side-by-Side Comparison Matrix Table */}
          <div className="bg-white border border-[#243B53]/10 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#243B53]/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0F766E]" />
                <h3 className="text-xs font-bold text-[#102A43] uppercase tracking-wider">
                  Side-by-Side Dimension Alignment Matrix
                </h3>
              </div>
              <span className="text-[11px] text-[#627D98]">
                {filteredRows.length} comparison rows
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-semibold text-[#627D98] border-b border-slate-200">
                    <th className="py-3 px-4 font-semibold w-1/4 min-w-[180px]">
                      Comparison Dimension
                    </th>
                    {comparison.standards.map((std) => (
                      <th key={std.id} className="py-3 px-4 font-semibold font-mono text-[#102A43] min-w-[240px]">
                        {std.standardNumber}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRows.map((row) => (
                    <tr key={row.dimensionId} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-[#102A43] align-top bg-slate-50/30">
                        {row.dimensionLabel}
                      </td>
                      {comparison.standards.map((std) => {
                        const cell = row.values[std.id];
                        const isMissing = !cell || cell.evidenceSource === 'not_available' || cell.value === 'Not available in current reference dataset.';
                        return (
                          <td key={std.id} className="py-3 px-4 align-top text-[#243B53]">
                            {cell?.status && (
                              <div className="mb-1.5">
                                <StatusPill status={cell.status} label={cell.statusLabel || cell.status} />
                              </div>
                            )}
                            <div className={isMissing ? 'text-slate-400 italic text-[11px]' : 'leading-relaxed'}>
                              {cell?.value || 'Not available in current reference dataset.'}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Documented Technical Distinctions (Zero-Fabrication) */}
          <div className="bg-white border border-[#243B53]/10 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Sparkles className="w-4 h-4 text-[#0F766E]" />
              <h3 className="text-xs font-bold text-[#102A43] uppercase tracking-wider">
                Documented Technical Distinctions (Zero-Fabrication)
              </h3>
            </div>
            <p className="text-xs text-[#627D98]">
              Differences below are derived strictly by set comparison of verified catalog fields (product taxonomy, scope text, and keywords):
            </p>

            <div className={`grid grid-cols-1 md:grid-cols-${comparison.technicalDistinctions.length} gap-3`}>
              {comparison.technicalDistinctions.map((dist) => (
                <div key={dist.standardId} className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
                  <div className="font-mono font-bold text-[#102A43] text-xs pb-1 border-b border-slate-200">
                    {dist.standardNumber}
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#627D98] block">
                      Category Domain:
                    </span>
                    <span className="text-[#243B53] font-medium">{dist.categoryClassification}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#627D98] block">
                      Scope Excerpt:
                    </span>
                    <p className="text-[#486581] text-[11px] leading-relaxed line-clamp-3" title={dist.documentedScope}>
                      {dist.documentedScope}
                    </p>
                  </div>

                  {dist.uniqueProductTypes.length > 0 ? (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#627D98] block">
                        Unique Product Taxonomy:
                      </span>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {dist.uniqueProductTypes.map((pt, ptIdx) => (
                          <span
                            key={ptIdx}
                            className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-medium text-[#102A43]"
                          >
                            {pt}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">
                      Shares product taxonomy with other compared standards.
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Neutral Procurement Guidance Note */}
            <div className="bg-teal-50/50 border border-teal-200/80 rounded-xl p-3.5 text-xs text-[#0F766E] flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="block text-[#102A43]">Complementarity Notice for Procurement Evaluators:</strong>
                <p className="leading-relaxed text-[#243B53]">
                  These standards frequently serve distinct and complementary functions in public procurement tenders. For instance, luminaire safety standards govern structural and electrical safety, whereas performance standards govern photometric efficiency and luminous output. Both may be referenced in tender technical schedules.
                </p>
              </div>
            </div>
          </div>

          {/* Consolidated Verification Actions */}
          {comparison.consolidatedVerificationActions && comparison.consolidatedVerificationActions.length > 0 && (
            <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs space-y-3 bg-amber-50/10">
              <div className="flex items-center gap-2 border-b border-amber-200/60 pb-2.5">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Consolidated Pre-Procurement Verification Checklist
                </h3>
              </div>
              <p className="text-xs text-[#627D98]">
                Cross-check the following items against the official BIS publications for the compared standards:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                {comparison.consolidatedVerificationActions.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs shadow-2xs"
                  >
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="space-y-1 min-w-0">
                      <p className="text-[#243B53] font-medium leading-relaxed">{item.action}</p>
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[10px] text-[#627D98]">Applies to:</span>
                        {item.applicableStandards.map((stdNum, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-[9px] font-mono font-semibold text-[#102A43]"
                          >
                            {stdNum}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Provenance & Disclaimer Footer */}
          <div className="bg-slate-50 border border-[#243B53]/10 rounded-2xl p-5 shadow-xs space-y-3 text-xs text-[#627D98]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2 text-[#102A43] font-bold">
                <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                <span>ISutra Standards Comparison Audit Provenance</span>
              </div>
              <span className="font-mono text-[11px] text-[#627D98]">
                Dataset: {comparison.metadata.datasetName} ({comparison.metadata.standardsEvaluated} records)
              </span>
            </div>

            <p className="leading-relaxed">
              <strong>Non-Judgmental Notice: </strong>
              {comparison.disclaimer}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Status Pill Helper Component
// ------------------------------------------------------------
function StatusPill({ status, label }: { status: RequirementGapStatus; label: string }) {
  switch (status) {
    case 'supported':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>{label}</span>
        </span>
      );
    case 'needs_verification':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-900 border border-amber-300">
          <HelpCircle className="w-3 h-3 text-amber-600" />
          <span>{label}</span>
        </span>
      );
    case 'not_available':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-[#486581] border border-slate-300">
          <Info className="w-3 h-3 text-[#627D98]" />
          <span>{label}</span>
        </span>
      );
    case 'not_supported':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-50 text-rose-800 border border-rose-300">
          <XCircle className="w-3 h-3 text-rose-600" />
          <span>{label}</span>
        </span>
      );
  }
}
