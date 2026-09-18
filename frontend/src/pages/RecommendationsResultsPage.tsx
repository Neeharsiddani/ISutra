// ============================================================
// ISutra: Phase 4 — Relevant BIS Standards Recommendation Screen
// Intelligent Multi-Signal Matching Results & Explainability
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ExternalLink,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  BookOpen,
  ArrowLeft,
  Info,
  Check,
  Minus,
  ShieldCheck,
  Scale,
  AlertTriangle,
  Printer,
} from 'lucide-react';
import { getAnalysisRecommendations, getRecommendations } from '../services/api';
import { WhyThisStandardPanel } from '../components/standards/WhyThisStandardPanel';
import type {
  RecommendationsResponse,
  StructuredRequirements,
  FactorStatus,
} from '../types';

export default function RecommendationsResultsPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RecommendationsResponse | null>(null);

  // Filter & Sort State
  const [filterCategory, setFilterCategory] = useState<'all' | 'high' | 'related'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'number'>('score');
  const [searchFilter, setSearchFilter] = useState('');

  // Expandable factor breakdown map: standardId -> boolean
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Phase 7: Selection state for standards comparison (max 3)
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const toggleSelectForCompare = (standardId: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(standardId)) {
        return prev.filter((sId) => sId !== standardId);
      }
      if (prev.length >= 3) return prev;
      return [...prev, standardId];
    });
  };

  const clearComparisonSelection = () => {
    setSelectedForCompare([]);
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // If analysis requirements were passed in router state, we can evaluate directly or fetch
    const stateReqs = location.state?.requirements as StructuredRequirements | undefined;

    if (stateReqs && stateReqs.ready_for_matching === false) {
      setError('Clarification required before finding applicable Indian Standards.');
      setLoading(false);
      return;
    }

    if (id) {
      getAnalysisRecommendations(id)
        .then((res) => {
          if (isMounted) {
            setData(res);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (err.message?.includes('Clarification required') || stateReqs?.ready_for_matching === false) {
            if (isMounted) {
              setError(err.message || 'Clarification required before finding applicable Indian Standards.');
              setLoading(false);
            }
            return;
          }

          if (stateReqs) {
            // Fallback: match using passed structured requirements
            getRecommendations(stateReqs)
              .then((fallbackRes) => {
                if (isMounted) {
                  setData({
                    ...fallbackRes,
                    analysisId: id,
                    requirements: stateReqs,
                  });
                  setLoading(false);
                }
              })
              .catch((subErr) => {
                if (isMounted) {
                  setError(subErr.message || 'Failed to match standards.');
                  setLoading(false);
                }
              });
          } else {
            if (isMounted) {
              setError(err.message || 'Failed to retrieve standards recommendations.');
              setLoading(false);
            }
          }
        });
    } else if (stateReqs) {
      if (stateReqs.ready_for_matching === false) {
        setError('Clarification required before finding applicable Indian Standards.');
        setLoading(false);
        return;
      }
      getRecommendations(stateReqs)
        .then((res) => {
          if (isMounted) {
            setData(res);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err.message || 'Failed to match standards.');
            setLoading(false);
          }
        });
    } else {
      setError('No analysis ID or requirements provided.');
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [id, location.state]);

  const toggleExpand = (standardId: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [standardId]: !prev[standardId],
    }));
  };

  // Filter and Sort Recommendations
  const processedRecommendations = useMemo(() => {
    if (!data || !data.recommendations) return [];

    let list = [...data.recommendations];

    // Filter by Category
    if (filterCategory !== 'all') {
      list = list.filter((r) => r.category === filterCategory);
    }

    // Filter by Search Term
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.standard.standard_number?.toLowerCase().includes(q) ||
          r.standard.title?.toLowerCase().includes(q) ||
          r.standard.subcategory?.toLowerCase().includes(q) ||
          r.reason.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'score') {
      list.sort((a, b) => b.score - a.score);
    } else if (sortBy === 'number') {
      list.sort((a, b) =>
        (a.standard.standard_number || '').localeCompare(b.standard.standard_number || '')
      );
    }

    return list;
  }, [data, filterCategory, sortBy, searchFilter]);

  // Loading State
  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-24 text-center space-y-4 animate-fade-in">
        <div className="w-12 h-12 border-3 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-bold text-[#102A43]">
            Analyzing BIS Standards...
          </h2>
          <p className="text-xs sm:text-sm text-[#627D98]">
            Evaluating 40 verified reference standards against your confirmed procurement requirements.
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !data) {
    const isClarificationError = error?.includes('Clarification required');
    return (
      <div className="w-full max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-[#C53030] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#102A43]">
          {isClarificationError ? 'Clarification Required' : 'Matching Error'}
        </h2>
        <p className="text-xs sm:text-sm text-[#627D98] max-w-md mx-auto">
          {error || 'Unable to generate standards recommendations.'}
        </p>
        {isClarificationError && (
          <p className="text-xs text-[#822020] bg-rose-50 border border-rose-200/80 p-3 rounded-xl max-w-md mx-auto">
            Critical procurement details are missing or insufficiently specified. Please return to the requirements review screen to provide clarification before matching standards.
          </p>
        )}
        <div className="flex items-center justify-center gap-3 pt-2">
          {id && (
            <Link
              to={`/analysis/${id}/review`}
              className="px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0C5D57] text-white text-xs font-semibold shadow-xs"
            >
              Back to Requirements Review
            </Link>
          )}
          <Link
            to="/analyze"
            className="px-4 py-2.5 rounded-xl border border-[#243B53]/20 hover:bg-slate-50 text-xs font-semibold text-[#243B53]"
          >
            Start New Analysis
          </Link>
        </div>
      </div>
    );
  }

  const { metadata, recommendations } = data;
  const isInsufficient = metadata.insufficientInformation || recommendations.length === 0;
  const reqs = data.requirements;

  return (
    <div className="space-y-6 w-full pb-16 animate-fade-in text-[#243B53]">
      {/* ============================================================
          1. HEADER SECTION
         ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#243B53]/10 pb-5">
        <div>
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-[#627D98] mb-1.5 font-medium">
            <Link to="/dashboard" className="hover:text-[#0F766E] transition-colors">
              Workspace
            </Link>
            <span>/</span>
            {id ? (
              <Link to={`/analysis/${id}/review`} className="hover:text-[#0F766E] transition-colors">
                Requirements Review
              </Link>
            ) : (
              <span>Analysis</span>
            )}
            <span>/</span>
            <span className="text-[#102A43] font-semibold">Recommendations</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[24px] sm:text-[28px] lg:text-[32px] font-bold font-display tracking-tight text-[#102A43] leading-tight">
              Relevant BIS Standards
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              {metadata.standardsEvaluated} BIS standards evaluated
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#627D98] mt-1">
            Standards ranked against your confirmed procurement requirements using a multi-signal deterministic matching engine.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {id && (
            <a
              href={`/api/analysis/${id}/report/html`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-xs font-semibold text-[#102A43] flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Open printable procurement evaluation report"
            >
              <Printer className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Procurement Report</span>
            </a>
          )}
          {id && (
            <button
              onClick={() => navigate(`/analysis/${id}/review`)}
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-[#243B53]/20 hover:bg-slate-50 text-xs font-semibold text-[#243B53] flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Review Requirements</span>
            </button>
          )}
          <Link
            to="/analyze"
            className="min-h-[40px] px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0C5D57] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span>+ New Analysis</span>
          </Link>
        </div>
      </div>

      {/* ============================================================
          2. AUDIT SUMMARY BAR (Phase 5)
         ============================================================ */}
      <div className="bg-white border border-[#243B53]/10 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#243B53]/10 pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
            <h2 className="text-xs font-bold text-[#102A43] uppercase tracking-wider">
              Analysis Audit Summary
            </h2>
          </div>
          <span className="text-[11px] font-medium text-[#627D98] bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full">
            {metadata.datasetName || 'ISutra Verified BIS Reference Dataset'} (40 Reference Standards)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/60">
            <span className="text-[#627D98] block text-[10px] uppercase tracking-wider font-semibold">
              Input Specification
            </span>
            <span className="font-bold text-[#102A43] truncate block" title={reqs?.product?.name || 'Tender Item'}>
              {reqs?.product?.name || 'Specification Item'}
            </span>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/60">
            <span className="text-[#627D98] block text-[10px] uppercase tracking-wider font-semibold">
              Standards Evaluated
            </span>
            <span className="font-semibold text-[#102A43]">
              {metadata.standardsEvaluated || 40} Verified Standards
            </span>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/60">
            <span className="text-[#627D98] block text-[10px] uppercase tracking-wider font-semibold">
              Recommendations
            </span>
            <span className="font-bold text-[#0F766E]">
              {processedRecommendations.length} Standards Found
            </span>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/60">
            <span className="text-[#627D98] block text-[10px] uppercase tracking-wider font-semibold">
              Top Relevance
            </span>
            <span className="font-bold text-emerald-700">
              {processedRecommendations.length > 0 ? `${processedRecommendations[0].relevancePercentage}%` : 'N/A'}
            </span>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/60 sm:col-span-2">
            <span className="text-[#627D98] block text-[10px] uppercase tracking-wider font-semibold">
              Matching Engine
            </span>
            <span className="font-semibold text-[#102A43] truncate block" title={metadata.matchingMethod}>
              {metadata.matchingMethod || 'Explainable Specificity-Aware Multi-Signal Matching'}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          3. EMPTY / INSUFFICIENT INFORMATION STATE
         ============================================================ */}
      {isInsufficient ? (
        <div className="bg-white border border-[#243B53]/10 rounded-2xl p-6 sm:p-8 shadow-xs text-center space-y-5 max-w-3xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-[#D97706] flex items-center justify-center mx-auto">
            <Info className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#102A43]">
              INSUFFICIENT INFORMATION
            </h2>
            <p className="text-xs sm:text-sm text-[#627D98] max-w-xl mx-auto">
              {metadata.insufficientReason ||
                'ISutra could not identify enough procurement information to produce a reliable standard recommendation.'}
            </p>
          </div>

          {metadata.guidance && metadata.guidance.length > 0 && (
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 text-left max-w-xl mx-auto">
              <h3 className="text-xs font-bold text-[#92400E] uppercase tracking-wider mb-2">
                What would help produce a reliable recommendation:
              </h3>
              <ul className="space-y-1.5 text-xs text-[#78350F]">
                {metadata.guidance.map((g, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] mt-1.5 shrink-0" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {id && (
              <button
                onClick={() => navigate(`/analysis/${id}/review`)}
                className="min-h-[44px] px-5 py-2.5 rounded-xl border border-[#0F766E] text-[#0F766E] hover:bg-[#0F766E]/5 text-xs font-semibold transition-all w-full sm:w-auto"
              >
                Edit & Clarify Requirements
              </button>
            )}
            <Link
              to="/analyze"
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0C5D57] text-white text-xs font-semibold transition-all w-full sm:w-auto flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Start New Analysis</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* ============================================================
              4. CONTROLS: FILTER & SORT BAR
             ============================================================ */}
          <div className="bg-white border border-[#243B53]/10 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setFilterCategory('all')}
                className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterCategory === 'all'
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'bg-slate-100 text-[#486581] hover:bg-slate-200'
                }`}
              >
                All Standards ({data?.recommendations.length || 0})
              </button>
              <button
                onClick={() => setFilterCategory('high')}
                className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterCategory === 'high'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-[#486581] hover:bg-slate-200'
                }`}
              >
                High Relevance (≥55%)
              </button>
              <button
                onClick={() => setFilterCategory('related')}
                className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filterCategory === 'related'
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'bg-slate-100 text-[#486581] hover:bg-slate-200'
                }`}
              >
                Related Standards (35–54%)
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-56">
                <input
                  type="text"
                  placeholder="Filter standards..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full h-9 pl-3 pr-8 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]/20"
                />
              </div>

              <div className="flex items-center gap-1 shrink-0 bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#627D98] ml-1.5" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'score' | 'number')}
                  className="bg-transparent text-xs font-medium text-[#243B53] focus:outline-hidden pr-2 cursor-pointer"
                >
                  <option value="score">Sort: Relevance Score</option>
                  <option value="number">Sort: Standard Number</option>
                </select>
              </div>
            </div>
          </div>

          {/* ============================================================
              5. RECOMMENDATIONS LIST
             ============================================================ */}
          <div className="space-y-4">
            {processedRecommendations.map((rec) => {
              const isExpanded = expandedCards[rec.standardId] ?? false;
              const isHigh = rec.category === 'high';

              return (
                <div
                  key={rec.standardId}
                  className={`bg-white border rounded-2xl p-4 sm:p-6 shadow-xs transition-all ${
                    isHigh
                      ? 'border-emerald-200/80 hover:border-emerald-300'
                      : 'border-[#243B53]/10 hover:border-[#243B53]/20'
                  }`}
                >
                  {/* Card Top Row: Rank, Standard Code, Badges */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Rank Indicator */}
                      <span
                        className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          rec.rank === 1
                            ? 'bg-emerald-600 text-white'
                            : rec.rank === 2
                            ? 'bg-[#0F766E] text-white'
                            : 'bg-slate-100 text-[#627D98] border border-slate-200'
                        }`}
                      >
                        #{rec.rank}
                      </span>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-base sm:text-lg font-bold font-mono text-[#102A43] tracking-tight">
                            {rec.standard.standard_number || rec.standard.is_number}
                          </h3>

                          {/* Relevance Badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                              isHigh
                                ? 'bg-emerald-50 text-[#16803C] border border-emerald-200'
                                : 'bg-sky-50 text-sky-800 border border-sky-200'
                            }`}
                          >
                            {rec.categoryLabel}
                          </span>

                          <span className="text-[11px] text-[#627D98] bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            {rec.standard.subcategory || rec.standard.category}
                          </span>

                          {/* Phase 7: Compare Selection Checkbox */}
                          <label className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-teal-50 hover:border-teal-200 transition-colors cursor-pointer select-none text-[11px] font-semibold text-[#486581] hover:text-[#0F766E]">
                            <input
                              type="checkbox"
                              checked={selectedForCompare.includes(rec.standard.id)}
                              onChange={() => toggleSelectForCompare(rec.standard.id)}
                              disabled={!selectedForCompare.includes(rec.standard.id) && selectedForCompare.length >= 3}
                              className="rounded text-[#0F766E] focus:ring-teal-500 w-3.5 h-3.5 cursor-pointer disabled:opacity-40"
                            />
                            <span>{selectedForCompare.includes(rec.standard.id) ? 'Selected' : 'Compare'}</span>
                          </label>
                        </div>

                        <p className="text-sm text-[#243B53] font-medium leading-snug">
                          {rec.standard.title}
                        </p>
                      </div>
                    </div>

                    {/* Visual Score Gauge & Factor Contributions */}
                    <div className="sm:text-right shrink-0 bg-slate-50 border border-slate-200/80 rounded-xl p-3 min-w-[170px]">
                      <div className="flex items-baseline sm:justify-end gap-1.5">
                        <span className="text-2xl font-bold font-display text-[#102A43]">
                          {rec.relevancePercentage}%
                        </span>
                        <span className="text-[11px] font-semibold text-[#627D98] uppercase">
                          Relevance
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5 mb-2">
                        <div
                          className={`h-full rounded-full ${
                            isHigh ? 'bg-emerald-600' : 'bg-[#0F766E]'
                          }`}
                          style={{ width: `${Math.max(5, rec.relevancePercentage)}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-[#627D98] space-y-0.5 sm:text-right">
                        <div>Product: +{Math.round(rec.factorStatuses.productCategory.contribution * 100)}%</div>
                        <div>Keywords: +{Math.round(rec.factorStatuses.keywordsTitleScope.contribution * 100)}%</div>
                        <div>App & Env: +{Math.round((rec.factorStatuses.application.contribution + rec.factorStatuses.environment.contribution) * 100)}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Match Reason */}
                  <div className="mt-3.5 bg-slate-50/70 border border-slate-200/60 rounded-xl p-3 text-xs text-[#243B53] flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <Sparkles className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#102A43]">Why This Matched: </strong>
                        <span>{rec.reason}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExpand(rec.standardId)}
                      className="shrink-0 text-xs font-bold text-[#0F766E] hover:text-[#0C5D57] hover:underline flex items-center gap-1 ml-2 transition-colors cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide trail' : 'Why this standard? →'}</span>
                    </button>
                  </div>

                  {/* Factor Status Badges (Quick Preview) */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <FactorBadge
                      label="Product / Category"
                      status={rec.factorStatuses.productCategory.status}
                    />
                    <FactorBadge
                      label="Keywords"
                      status={rec.factorStatuses.keywordsTitleScope.status}
                    />
                    <FactorBadge
                      label="Application"
                      status={rec.factorStatuses.application.status}
                    />
                    <FactorBadge
                      label="Environment"
                      status={rec.factorStatuses.environment.status}
                    />
                    <FactorBadge
                      label="Technical Parameters"
                      status={rec.factorStatuses.technicalParameters.status}
                    />
                    <FactorBadge
                      label="Safety & Testing"
                      status={rec.factorStatuses.safetyTesting.status}
                    />
                  </div>

                  {/* ============================================================
                      EXPANDABLE "WHY THIS STANDARD?" EXPLANATION PANEL
                     ============================================================ */}
                  {isExpanded && (
                    <WhyThisStandardPanel
                      recommendation={rec}
                      allRecommendations={data.recommendations}
                      analysisId={id}
                      requirements={reqs}
                    />
                  )}

                  {/* Card Footer: Action Links & Toggle */}
                  <div className="mt-4 pt-3.5 border-t border-[#243B53]/10 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => toggleExpand(rec.standardId)}
                      className={`min-h-[36px] px-3.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
                        isExpanded
                          ? 'bg-[#102A43] text-white border-[#102A43]'
                          : 'bg-teal-50 hover:bg-teal-100 text-[#0F766E] border-teal-300'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isExpanded ? 'Hide Decision Trail' : 'Why This Standard?'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/analysis/${id || ''}/recommendations/${rec.standard.id}/gap-analysis`}
                        state={{ fromAnalysisId: id, standard: rec.standard, requirements: reqs }}
                        className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Scale className="w-3.5 h-3.5 text-[#0F766E]" />
                        <span>Check Requirement Gaps</span>
                      </Link>

                      <Link
                        to={`/standards/${rec.standard.id}?fromAnalysis=${id || ''}`}
                        state={{ fromAnalysisId: id }}
                        className="min-h-[36px] px-3 py-1.5 rounded-lg border border-[#243B53]/20 hover:bg-slate-50 text-xs font-semibold text-[#243B53] flex items-center gap-1 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>View Standard Details</span>
                      </Link>

                      {rec.standard.source_url && (
                        <a
                          href={rec.standard.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#0C5D57] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>View Official BIS Source</span>
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ============================================================
              6. COMPLIANCE & ACCURACY DISCLAIMER
             ============================================================ */}
          <div className="bg-slate-50 border border-[#243B53]/10 rounded-xl p-3.5 text-xs text-[#627D98] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
            <p>
              <strong>SIH Prototype Disclaimer:</strong> {metadata.disclaimer || 'ISutra is an SIH prototype. Recommendations are based on the current reference dataset and should be independently verified against official BIS publications before procurement or compliance decisions.'}
            </p>
          </div>
        </>
      )}

      {/* ============================================================
          7. FLOATING COMPARISON DOCK (Phase 7)
         ============================================================ */}
      {selectedForCompare.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-3xl w-[calc(100%-2rem)] bg-[#102A43] text-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              Compare Standards ({selectedForCompare.length}/3):
            </span>
            {selectedForCompare.map((sId) => {
              const stdObj = processedRecommendations.find((r) => r.standard.id === sId)?.standard;
              return (
                <span
                  key={sId}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200"
                >
                  <span>{stdObj?.standard_number || sId}</span>
                  <button
                    onClick={() => toggleSelectForCompare(sId)}
                    className="hover:text-rose-400 font-bold ml-1 text-sm leading-none"
                    title="Remove from comparison"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={clearComparisonSelection}
              className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1"
            >
              Clear
            </button>

            {selectedForCompare.length >= 2 ? (
              <Link
                to={`/analysis/${id || ''}/compare?standards=${selectedForCompare.join(',')}`}
                state={{ fromAnalysisId: id, selectedStandardIds: selectedForCompare }}
                className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0C5D57] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Compare Side-by-Side ({selectedForCompare.length}) →</span>
              </Link>
            ) : (
              <span className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 text-slate-400 text-xs font-semibold border border-slate-700/60">
                Select 1 more to compare
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Helper Components
// ------------------------------------------------------------

function FactorBadge({ label, status }: { label: string; status: FactorStatus }) {
  if (status === 'matched') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-[#16803C] border border-emerald-200 font-medium">
        <Check className="w-3 h-3 text-[#16803C]" />
        <span>{label}</span>
      </span>
    );
  }

  if (status === 'contradiction') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-medium">
        <AlertTriangle className="w-3 h-3 text-rose-600" />
        <span>{label} (Contradiction)</span>
      </span>
    );
  }

  if (status === 'not_available') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[#627D98] border border-slate-200 font-medium">
        <Minus className="w-3 h-3 text-[#627D98]" />
        <span>{label} (N/A)</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-[#627D98] border border-slate-200/60 font-medium opacity-75">
      <Minus className="w-3 h-3 text-slate-400" />
      <span>{label}</span>
    </span>
  );
}

