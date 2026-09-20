// ============================================================
// ISutra: Phase 6 — Procurement Requirement Gap Analysis & Review Page
// Evidence-Backed Deterministic Coverage Comparison against Verified BIS Standards
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  ExternalLink,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  FileText,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Tag,
} from 'lucide-react';
import { getRequirementGapAnalysis, analyzeRequirementGapsDirect } from '../services/api';
import type {
  RequirementGapAnalysis,
  RequirementGapStatus,
  StructuredRequirements,
  Standard,
} from '../types';

export default function RequirementGapAnalysisPage() {
  const { id, standardId } = useParams<{ id: string; standardId: string }>();
  const location = useLocation();

  // Retrieve any state passed from the recommendations page
  const locationState = location.state as {
    fromAnalysisId?: string;
    standard?: Standard;
    requirements?: StructuredRequirements;
  } | null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<RequirementGapAnalysis | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | RequirementGapStatus>('all');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadGapAnalysis() {
      if (!standardId) {
        setError('Missing standard identifier.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let result;
        if (id && id !== 'undefined') {
          // Fetch using stored analysis ID
          result = await getRequirementGapAnalysis(id, standardId);
        } else if (locationState?.requirements) {
          // Fallback to direct analysis if requirements object was passed
          result = await analyzeRequirementGapsDirect(locationState.requirements, standardId);
        } else {
          throw new Error('Analysis context not found. Please navigate from recommendations results.');
        }

        if (result.success && result.gapAnalysis) {
          setAnalysis(result.gapAnalysis);
          // Expand all supported and needs_verification items by default for transparency
          const initialExpanded: Record<string, boolean> = {};
          result.gapAnalysis.items.forEach((item) => {
            initialExpanded[item.requirementId] = true;
          });
          setExpandedItems(initialExpanded);
        } else {
          throw new Error('Could not load gap analysis data.');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to analyze requirement gaps.';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadGapAnalysis();
  }, [id, standardId, locationState]);

  const toggleItem = (reqId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [reqId]: !prev[reqId],
    }));
  };

  const toggleAll = (expand: boolean) => {
    if (!analysis) return;
    const next: Record<string, boolean> = {};
    analysis.items.forEach((i) => {
      next[i.requirementId] = expand;
    });
    setExpandedItems(next);
  };

  const filteredItems = useMemo(() => {
    if (!analysis) return [];
    if (activeFilter === 'all') return analysis.items;
    return analysis.items.filter((item) => item.status === activeFilter);
  }, [analysis, activeFilter]);

  // Export report generator (Plain Text / Markdown report)
  const handleDownloadReport = () => {
    if (!analysis) return;

    const lines: string[] = [
      '=========================================================================',
      'ISUTRA — PROCUREMENT STANDARDS REQUIREMENT REVIEW',
      'Phase 6: Requirement Gap Analysis & Verification Report',
      '=========================================================================',
      `Generated: ${new Date().toLocaleString()}`,
      `Analysis Reference ID: ${id || 'N/A'}`,
      `Dataset: ${analysis.metadata.datasetName} (${analysis.metadata.standardsEvaluated} standards)`,
      `Source Provenance: ${analysis.metadata.sourceProvenance}`,
      '',
      '1. SELECTED BIS STANDARD',
      '-------------------------------------------------------------------------',
      `Standard Number : ${analysis.standardNumber}`,
      `Standard Title  : ${analysis.standardTitle}`,
      `Category        : ${analysis.standardCategory}`,
      `Official Portal : ${analysis.officialSourceUrl}`,
      '',
      '2. REFERENCE COVERAGE METRICS',
      '-------------------------------------------------------------------------',
      `Reference Coverage      : ${analysis.referenceCoverage !== null ? `${analysis.referenceCoverage}%` : 'Unavailable'}`,
      `Total Requirements      : ${analysis.totalRequirements}`,
      `Supported by Reference         : ${analysis.supportedCount}`,
      `Requires Official Verification : ${analysis.needsVerificationCount}`,
      `Not Available in Record        : ${analysis.notAvailableCount}`,
      `Not Supported                  : ${analysis.notSupportedCount}`,
      '',
      'Explanation:',
      analysis.referenceCoverageExplanation,
      '',
      '3. REQUIREMENT COVERAGE MATRIX',
      '-------------------------------------------------------------------------',
    ];

    analysis.items.forEach((item, index) => {
      lines.push(`[${index + 1}] ${item.requirementLabel}`);
      lines.push(`  Status      : ${item.statusLabel}`);
      lines.push(`  User Value  : ${item.requirementValue}`);
      lines.push(`  BIS Context : ${item.standardEvidence}`);
      lines.push(`  Explanation : ${item.explanation}`);
      lines.push('');
    });

    lines.push('4. VERIFICATION & REVIEW ACTIONS CHECKLIST');
    lines.push('-------------------------------------------------------------------------');
    if (analysis.verificationActions.length === 0) {
      lines.push('No immediate missing parameter actions identified.');
    } else {
      analysis.verificationActions.forEach((action, idx) => {
        lines.push(`[ ] ${idx + 1}. ${action}`);
      });
    }

    lines.push('');
    lines.push('5. AUDIT DISCLAIMER');
    lines.push('-------------------------------------------------------------------------');
    lines.push(analysis.disclaimer);
    lines.push('=========================================================================');

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ISutra_Procurement_Review_${analysis.standardNumber.replace(/[^\w-]/g, '_')}.txt`;
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
      {/* 1. Contextual Navigation & Header */}
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
          <span className="text-[#627D98] font-medium">Requirement Coverage Review</span>
        </div>

        {/* Action Buttons */}
        {analysis && (
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
              <span>Download Procurement Review</span>
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white border border-[#243B53]/10 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-10 h-10 border-3 border-[#0F766E]/20 border-t-[#0F766E] rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#102A43]">
            Comparing Procurement Requirements against Verified BIS Standard Record...
          </p>
          <p className="text-xs text-[#627D98]">
            Applying conservative deterministic gap analysis without fabricating clauses.
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center space-y-4 shadow-xs max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#102A43]">Gap Analysis Unavailable</h2>
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

      {/* Loaded Analysis View */}
      {analysis && !loading && (
        <>
          {/* Selected Standard Card */}
          <div className="bg-white border border-[#243B53]/10 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0F766E] font-mono text-xs font-bold border border-teal-200">
                    {analysis.standardNumber}
                  </span>
                  <span className="text-xs text-[#627D98] bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {analysis.standardCategory}
                  </span>
                  <span className="text-[11px] text-[#16803C] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified BIS Standard</span>
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-bold text-[#102A43] leading-snug">
                  {analysis.standardTitle}
                </h1>
              </div>

              {analysis.officialSourceUrl && (
                <a
                  href={analysis.officialSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-3.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>View Official BIS Source</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              )}
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Reference Coverage */}
            <div className="bg-white border border-[#243B53]/10 rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#627D98] block">
                Reference Coverage
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-display text-[#102A43]">
                  {analysis.referenceCoverage !== null ? `${analysis.referenceCoverage}%` : 'N/A'}
                </span>
                <span className="text-[10px] text-[#627D98] font-medium">
                  ({analysis.supportedCount}/{analysis.supportedCount + analysis.needsVerificationCount + analysis.notSupportedCount} comparable)
                </span>
              </div>
              <p className="text-[11px] text-[#627D98] leading-tight pt-1">
                Reference coverage indicates how much of the procurement requirement can be evaluated against the current reference dataset. It is not a compliance determination.
              </p>
            </div>

            {/* Supported Count */}
            <div className="bg-white border border-emerald-200/80 rounded-2xl p-4 shadow-xs space-y-1 bg-emerald-50/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Supported</span>
              </span>
              <span className="text-2xl font-bold font-display text-emerald-900 block">
                {analysis.supportedCount}
              </span>
              <p className="text-[11px] text-emerald-800 leading-tight pt-1">
                Explicitly supported by standard scope & product data.
              </p>
            </div>

            {/* Needs Verification Count */}
            <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-xs space-y-1 bg-amber-50/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Requires Official Verification</span>
              </span>
              <span className="text-2xl font-bold font-display text-amber-900 block">
                {analysis.needsVerificationCount}
              </span>
              <p className="text-[11px] text-amber-800 leading-tight pt-1">
                Check specific tables in official BIS publication.
              </p>
            </div>

            {/* Not Available in Record */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1 bg-slate-50/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#627D98] block flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-[#627D98]" />
                <span>Not in Record</span>
              </span>
              <span className="text-2xl font-bold font-display text-[#102A43] block">
                {analysis.notAvailableCount}
              </span>
              <p className="text-[11px] text-[#627D98] leading-tight pt-1">
                Technical limit not stored in reference summary.
              </p>
            </div>
          </div>

          {/* Reference Coverage Callout */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-[#627D98] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#102A43]">Coverage Note: </strong>
              <span>{analysis.referenceCoverageExplanation}</span>
            </div>
          </div>

          {/* Verification Actions Section */}
          {analysis.verificationActions && analysis.verificationActions.length > 0 && (
            <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs space-y-3 bg-amber-50/10">
              <div className="flex items-center gap-2 border-b border-amber-200/60 pb-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Verification & Review Actions
                </h3>
              </div>
              <p className="text-xs text-[#627D98] leading-relaxed">
                The following pre-procurement verification &amp; review actions highlight areas requiring inspection before procurement decisions. These actions include requirements classified as <strong>Requires Official Verification</strong> as well as requirements whose detailed criteria are <strong>Not in Record</strong> and therefore require review directly against the official BIS publication of {analysis.standardNumber}:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                {analysis.verificationActions.map((action, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-amber-200/80 rounded-xl p-3 flex items-start gap-2 text-xs shadow-2xs"
                  >
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-[#243B53] font-medium leading-relaxed">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirement Coverage Matrix */}
          <div className="bg-white border border-[#243B53]/10 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#243B53]/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0F766E]" />
                <h2 className="text-sm font-bold text-[#102A43]">
                  Requirement Coverage Matrix ({analysis.totalRequirements} Evaluated)
                </h2>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeFilter === 'all'
                      ? 'bg-[#0F766E] text-white font-semibold'
                      : 'bg-slate-100 text-[#627D98] hover:bg-slate-200'
                  }`}
                >
                  All ({analysis.totalRequirements})
                </button>
                <button
                  onClick={() => setActiveFilter('supported')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeFilter === 'supported'
                      ? 'bg-emerald-700 text-white font-semibold'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  Supported ({analysis.supportedCount})
                </button>
                <button
                  onClick={() => setActiveFilter('needs_verification')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeFilter === 'needs_verification'
                      ? 'bg-amber-700 text-white font-semibold'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  Verify ({analysis.needsVerificationCount})
                </button>
                <button
                  onClick={() => setActiveFilter('not_available')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeFilter === 'not_available'
                      ? 'bg-slate-700 text-white font-semibold'
                      : 'bg-slate-100 text-[#627D98] hover:bg-slate-200'
                  }`}
                >
                  Not in Record ({analysis.notAvailableCount})
                </button>
              </div>
            </div>

            {/* Expand / Collapse All */}
            <div className="flex items-center justify-end gap-3 text-xs text-[#627D98]">
              <button
                onClick={() => toggleAll(true)}
                className="hover:text-[#0F766E] font-medium"
              >
                Expand All
              </button>
              <span>•</span>
              <button
                onClick={() => toggleAll(false)}
                className="hover:text-[#0F766E] font-medium"
              >
                Collapse All
              </button>
            </div>

            {/* Requirements List */}
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const isExpanded = !!expandedItems[item.requirementId];
                return (
                  <div
                    key={item.requirementId}
                    className="border border-[#243B53]/10 rounded-xl overflow-hidden transition-all shadow-2xs hover:border-[#243B53]/20"
                  >
                    {/* Item Header */}
                    <button
                      onClick={() => toggleItem(item.requirementId)}
                      className="w-full text-left p-3.5 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-200 text-[#627D98]">
                          {item.category.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-[#102A43]">
                          {item.requirementLabel}
                        </span>
                        <span className="text-xs text-[#486581] truncate max-w-xs font-medium">
                          ({item.requirementValue})
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <StatusPill status={item.status} label={item.statusLabel} />
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#627D98]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#627D98]" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div className="p-4 bg-white border-t border-[#243B53]/10 space-y-3 text-xs animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* User Requirement */}
                          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#627D98] block">
                              User Requirement Input
                            </span>
                            <div className="font-semibold text-[#102A43]">
                              {item.requirementValue}
                            </div>
                            {item.sourceText && (
                              <div className="text-[11px] text-[#627D98] italic">
                                Extracted snippet: "{item.sourceText}"
                              </div>
                            )}
                          </div>

                          {/* Verified Standard Data */}
                          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#627D98] block">
                              Verified Standard Record
                            </span>
                            <div className="font-semibold text-[#102A43]">
                              {item.standardEvidence || 'Not available in current standard record'}
                            </div>
                            <div className="text-[11px] text-[#627D98]">
                              Field: {item.standardField || 'standard scope'}
                            </div>
                          </div>
                        </div>

                        {/* Explanation */}
                        <div className="bg-teal-50/30 border border-teal-200/50 rounded-xl p-3 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F766E] block flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Determinism & Review Explanation</span>
                          </span>
                          <p className="text-xs text-[#243B53] leading-relaxed">
                            {item.explanation}
                          </p>
                        </div>

                        {/* Provenance Badges */}
                        {item.evidence && item.evidence.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-[10px] text-[#627D98] font-bold uppercase tracking-wider">
                              Provenance:
                            </span>
                            {item.evidence.map((ev, evIdx) => (
                              <span
                                key={evIdx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 border border-slate-200 text-[#243B53]"
                              >
                                <Tag className="w-2.5 h-2.5 text-[#627D98]" />
                                <strong className="uppercase">{ev.sourceType.replace('_', ' ')}:</strong>
                                <span>{ev.label}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit Provenance & Disclaimer Footer */}
          <div className="bg-slate-50 border border-[#243B53]/10 rounded-2xl p-5 shadow-xs space-y-3 text-xs text-[#627D98]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2 text-[#102A43] font-bold">
                <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                <span>ISutra Procurement Review Audit Record</span>
              </div>
              <span className="font-mono text-[11px] text-[#627D98]">
                Dataset: {analysis.metadata.datasetName} ({analysis.metadata.standardsEvaluated} records)
              </span>
            </div>

            <p className="leading-relaxed">
              <strong>Notice: </strong>
              {analysis.disclaimer}
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
function StatusPill({ status }: { status: RequirementGapStatus; label?: string }) {
  switch (status) {
    case 'supported':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>SUPPORTED</span>
        </span>
      );
    case 'needs_verification':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-900 border border-amber-300">
          <HelpCircle className="w-3 h-3 text-amber-600" />
          <span>NEEDS VERIFICATION</span>
        </span>
      );
    case 'not_available':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-[#486581] border border-slate-300">
          <Info className="w-3 h-3 text-[#627D98]" />
          <span>NOT AVAILABLE</span>
        </span>
      );
    case 'not_supported':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-50 text-rose-800 border border-rose-300">
          <XCircle className="w-3 h-3 text-rose-600" />
          <span>NOT SUPPORTED</span>
        </span>
      );
  }
}
