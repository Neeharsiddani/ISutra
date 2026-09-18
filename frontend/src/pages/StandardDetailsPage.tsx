// ============================================================
// ISutra: Phase 3 UI Polish — Standard Details Page
// Professional 2-Column Responsive Layout for BIS Reference Standards
// Left (~70%): Scope, Product Types, Keywords, Standard Specifications
// Right (~30%): Standard Metadata & Official BIS Reference Link
// Bottom (Full Width): Related & Allied Standards
// ============================================================

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Tag,
  FileCode2,
  FileCheck2,
  Layers,
  Sparkles,
  ArrowRight,
  Info,
  BookOpen,
  FileText,
  History,
} from 'lucide-react';
import type { Standard, StandardRelationship, RelationshipCoverage, StandardLifecycleResponse } from '../types';
import { getStandardById, getRelatedStandards, getStandardLifecycle } from '../services/api';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';

function formatPartialDate(dateStr?: string): string {
  if (!dateStr || !dateStr.trim()) return 'Not available in current reference dataset.';
  const s = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIdx = parseInt(m, 10) - 1;
    const day = parseInt(d, 10);
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${day} ${months[monthIdx]} ${y}`;
    }
    return s;
  }
  if (/^\d{4}-\d{2}$/.test(s)) {
    const [y, m] = s.split('-');
    const fullMonths = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIdx = parseInt(m, 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${fullMonths[monthIdx]} ${y}`;
    }
    return s;
  }
  if (/^\d{4}$/.test(s)) {
    return s;
  }
  return s;
}

function formatLifecycleStatus(status?: string): string {
  if (!status) return 'Not available in current reference dataset.';
  switch (status.toLowerCase()) {
    case 'current':
      return 'Current — based on curated lifecycle evidence';
    case 'reaffirmed':
      return 'Reaffirmed';
    case 'amended':
      return 'Amended';
    case 'superseded':
      return 'Superseded';
    case 'withdrawn':
      return 'Withdrawn';
    case 'not_verified':
      return 'Not verified';
    case 'under_revision':
      return 'Under revision';
    default:
      return status;
  }
}

export default function StandardDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const fromAnalysis = searchParams.get('fromAnalysis') || location.state?.fromAnalysisId;

  const [standard, setStandard] = useState<Standard | null>(null);
  const [relationships, setRelationships] = useState<StandardRelationship[]>([]);
  const [coverage, setCoverage] = useState<RelationshipCoverage | null>(null);
  const [procurementGuidance, setProcurementGuidance] = useState<string | null>(null);
  const [lifecycleRes, setLifecycleRes] = useState<StandardLifecycleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [stdRes, relRes, lcRes] = await Promise.all([
          getStandardById(id!),
          getRelatedStandards(id!).catch(() => ({
            data: [],
            coverage: undefined,
            procurement_guidance: undefined,
            demo: false,
          })),
          getStandardLifecycle(id!).catch(() => ({
            lifecycle: null,
            amendments: [],
            coverage: {
              lifecycle_verified: false,
              amendments_verified: false,
              amendment_count: 0,
            },
            notice:
              'Lifecycle evidence not currently available in the curated ISutra reference dataset.',
          })),
        ]);
        setStandard(stdRes.data);
        setRelationships(relRes.data || []);
        if (relRes.coverage) setCoverage(relRes.coverage);
        if (relRes.procurement_guidance) setProcurementGuidance(relRes.procurement_guidance);
        setLifecycleRes(lcRes);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load standard details.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full py-16">
        <LoadingState message="Fetching verified standard specifications..." />
      </div>
    );
  }

  if (error || !standard) {
    return (
      <div className="w-full py-16">
        <ErrorState
          message={error || 'Standard not found.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const stdNumber = standard.standard_number || standard.is_number;
  const isCurrent = standard.status?.toLowerCase().includes('current');

  // Helper for rendering empty/unverified fields without inventing data
  const renderSpecValue = (val: any) => {
    if (!val || (typeof val === 'string' && val.trim().length === 0)) {
      return (
        <span className="text-[#9FB3C8] italic text-[14px]">
          Not available in current dataset
        </span>
      );
    }
    if (typeof val === 'object') {
      return (
        <pre className="text-[13px] bg-[#F7F9FC] p-3 rounded-lg border border-[#243B53]/10 font-mono text-[#243B53] overflow-x-auto">
          {JSON.stringify(val, null, 2)}
        </pre>
      );
    }
    return (
      <span className="text-[14px] sm:text-[15px] text-[#243B53] leading-relaxed">
        {val}
      </span>
    );
  };

  return (
    <div className="w-full space-y-8 pb-16 animate-fade-in text-[#243B53]">
      {/* Back Navigation */}
      <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#627D98]">
        {fromAnalysis ? (
          <Link
            to={`/analysis/${fromAnalysis}/recommendations`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-[#0F766E] hover:bg-emerald-100 transition-colors font-semibold border border-emerald-200 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Recommendations</span>
          </Link>
        ) : (
          <Link
            to="/standards"
            className="inline-flex items-center gap-1.5 hover:text-[#0F766E] transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Standards Directory</span>
          </Link>
        )}
        <span className="text-[#9FB3C8]">/</span>
        <span className="text-[#243B53] font-semibold truncate font-display">
          {stdNumber}
        </span>
      </div>

      {/* ============================================================
          1. HEADER
          Left: Standard Number, Badge, Title, Category hierarchy
          Right: View BIS Source Button
         ============================================================ */}
      <div className="bg-white rounded-2xl border border-[#243B53]/10 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Left Header Content */}
          <div className="space-y-2.5 flex-1 min-w-0">
            {/* Standard Number & Status Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[24px] sm:text-[30px] lg:text-[32px] font-bold text-[#102A43] tracking-tight font-display leading-tight">
                {stdNumber}
              </h1>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold border ${isCurrent
                    ? 'bg-emerald-50 text-[#16803C] border-emerald-300'
                    : 'bg-amber-50 text-[#D97706] border-amber-300'
                  }`}
              >
                {isCurrent ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16803C]" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-[#D97706]" />
                )}
                {standard.status}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-[17px] sm:text-[19px] lg:text-[20px] font-semibold text-[#102A43] leading-snug">
              {standard.title}
            </h2>

            {/* Category Hierarchy */}
            <div className="flex flex-wrap items-center gap-2 text-[14px] text-[#627D98] pt-1">
              <span className="font-semibold text-[#0F766E]">{standard.category}</span>
              {standard.subcategory && (
                <>
                  <span className="text-[#9FB3C8]">→</span>
                  <span className="text-[#243B53] font-medium">{standard.subcategory}</span>
                </>
              )}
            </div>
          </div>

          {/* Right Header Action: View BIS Source Button */}
          <div className="shrink-0 md:self-start pt-1">
            {standard.source_url ? (
              <a
                href={standard.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-[14px] font-semibold shadow-xs transition-all w-full sm:w-auto"
                id="header-view-bis-source-btn"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>View BIS Source</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            ) : (
              <span className="text-[13px] text-[#9FB3C8] italic">
                Official source link pending
              </span>
            )}
          </div>
        </div>

        {/* Provenance & Disclaimer Bar */}
        <div className="mt-5 pt-4 border-t border-[#243B53]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px] text-[#627D98]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[#102A43]">
            <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
            Source: Official BIS reference | ISutra verified reference dataset
          </span>
          <span className="text-[#9FB3C8]">
            ISutra is an SIH prototype. Recommendations are based on the current reference dataset and should be independently verified against official BIS publications before procurement or compliance decisions.
          </span>
        </div>
      </div>

      {/* ============================================================
          2. MAIN 2-COLUMN LAYOUT
          Desktop: Left (~70%), Right (~30%)
          Tablet / Mobile: Stacked vertically
         ============================================================ */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ==========================================================
            LEFT COLUMN (~70% width on desktop)
            Card 1: Scope of Standard
            Card 2: Applicable Product Types
            Card 3: Keywords & Search Terms
            Card 4: Standard Specifications (Tech, Safety, Performance, Testing)
           ========================================================== */}
        <div className="w-full lg:w-[70%] space-y-6">
          {/* CARD 1: SCOPE OF STANDARD */}
          <div className="bg-white rounded-2xl border border-[#243B53]/10 p-5 sm:p-6 shadow-xs space-y-3">
            <h3 className="text-[12px] font-bold text-[#627D98] uppercase tracking-wider font-display flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-[#0F766E]" />
              Scope of Standard
            </h3>
            <p className="text-[15px] sm:text-[16px] text-[#243B53] leading-relaxed">
              {standard.scope || renderSpecValue(null)}
            </p>
          </div>

          {/* CARD 2: APPLICABLE PRODUCT TYPES */}
          <div className="bg-white rounded-2xl border border-[#243B53]/10 p-5 sm:p-6 shadow-xs space-y-3">
            <h3 className="text-[12px] font-bold text-[#627D98] uppercase tracking-wider font-display flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#0F766E]" />
              Applicable Product Types
            </h3>
            {standard.product_types && standard.product_types.length > 0 ? (
              <div className="flex flex-wrap gap-2.5 pt-1">
                {standard.product_types.map((product, i) => (
                  <span
                    key={i}
                    className="px-3.5 py-1.5 bg-[#F7F9FC] text-[#102A43] border border-[#243B53]/10 rounded-lg text-[14px] font-medium shadow-2xs"
                  >
                    {product}
                  </span>
                ))}
              </div>
            ) : (
              renderSpecValue(null)
            )}
          </div>

          {/* CARD 3: KEYWORDS & SEARCH TERMS */}
          <div className="bg-white rounded-2xl border border-[#243B53]/10 p-5 sm:p-6 shadow-xs space-y-3">
            <h3 className="text-[12px] font-bold text-[#627D98] uppercase tracking-wider font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              Keywords & Search Terms
            </h3>
            {standard.keywords && standard.keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {standard.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-[#0F766E]/5 text-[#0F766E] border border-[#0F766E]/20 rounded-lg text-[13px] font-medium"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            ) : (
              renderSpecValue(null)
            )}
          </div>

          {/* CARD 4: STANDARD SPECIFICATIONS (4 distinct subsections) */}
          <div className="bg-white rounded-2xl border border-[#243B53]/10 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-[12px] font-bold text-[#627D98] uppercase tracking-wider font-display flex items-center gap-2 mb-2">
              <FileCheck2 className="w-4 h-4 text-[#0F766E]" />
              Standard Specifications
            </h3>

            <div className="space-y-4">
              {/* 1. Technical Parameters */}
              <div className="p-4 rounded-xl bg-[#F7F9FC]/70 border border-[#243B53]/10 space-y-1.5">
                <span className="text-[11px] font-bold text-[#627D98] uppercase tracking-wider block font-display">
                  Technical Parameters
                </span>
                <div>{renderSpecValue(standard.technical_parameters)}</div>
              </div>

              {/* 2. Safety Requirements */}
              <div className="p-4 rounded-xl bg-[#F7F9FC]/70 border border-[#243B53]/10 space-y-1.5">
                <span className="text-[11px] font-bold text-[#627D98] uppercase tracking-wider block font-display">
                  Safety Requirements
                </span>
                <div>{renderSpecValue(standard.safety_requirements)}</div>
              </div>

              {/* 3. Performance Requirements */}
              <div className="p-4 rounded-xl bg-[#F7F9FC]/70 border border-[#243B53]/10 space-y-1.5">
                <span className="text-[11px] font-bold text-[#627D98] uppercase tracking-wider block font-display">
                  Performance Requirements
                </span>
                <div>{renderSpecValue(standard.performance_requirements)}</div>
              </div>

              {/* 4. Testing Requirements */}
              <div className="p-4 rounded-xl bg-[#F7F9FC]/70 border border-[#243B53]/10 space-y-1.5">
                <span className="text-[11px] font-bold text-[#627D98] uppercase tracking-wider block font-display">
                  Testing Requirements
                </span>
                <div>{renderSpecValue(standard.testing_requirements)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================================
            RIGHT COLUMN (~30% width on desktop)
            BIS Lifecycle & Amendment Intelligence Card
           ========================================================== */}
        <div className="w-full lg:w-[30%] space-y-6">
          <div
            id="lifecycle"
            className="bg-white rounded-2xl border border-[#243B53]/10 p-5 sm:p-6 shadow-xs space-y-5 scroll-mt-6"
          >
            {/* Header with Title & Badge */}
            <div className="flex items-center justify-between gap-2 border-b border-[#243B53]/10 pb-3">
              <h3 className="text-[12px] font-bold text-[#627D98] uppercase tracking-wider font-display flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#0F766E]" />
                BIS Lifecycle & Amendment Intelligence
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified BIS evidence
              </span>
            </div>

            <p className="text-[11px] text-[#627D98]">
              ISutra curated evidence from official BIS sources.
            </p>

            {/* LIFECYCLE DETAILS */}
            {lifecycleRes?.lifecycle ? (
              <div className="divide-y divide-[#243B53]/10 text-[13px] sm:text-[14px]">
                {/* CURATED REFERENCE EDITION */}
                <div className="py-2.5">
                  <span className="text-[11px] font-bold text-[#627D98] uppercase tracking-wider block font-display">
                    Curated Reference Edition
                  </span>
                  <span className="font-semibold text-[#102A43]">
                    {lifecycleRes.lifecycle.edition_number
                      ? `${lifecycleRes.lifecycle.edition_number} — ${lifecycleRes.lifecycle.edition_year}`
                      : `${lifecycleRes.lifecycle.edition_year}`}
                  </span>
                </div>

                {/* LIFECYCLE STATUS */}
                <div className="py-2.5">
                  <span className="text-[11px] font-bold text-[#627D98] uppercase tracking-wider block font-display">
                    Lifecycle Status
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-md text-xs font-semibold bg-emerald-50 text-[#16803C] border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-[#16803C]" />
                    {formatLifecycleStatus(lifecycleRes.lifecycle.lifecycle_status)}
                  </span>
                </div>

                {/* REAFFIRMATION */}
                {lifecycleRes.lifecycle.reaffirmation_year && (
                  <div className="py-2.5 space-y-1">
                    <span className="text-[11px] font-bold text-[#627D98] uppercase tracking-wider block font-display">
                      Reaffirmation
                    </span>
                    <span className="font-semibold text-[#102A43]">
                      {lifecycleRes.lifecycle.reaffirmation_year}
                    </span>
                    <p className="text-[11px] text-[#627D98] leading-tight">
                      Reaffirmation indicates that the standard was formally reviewed and reaffirmed; it is distinct from an amendment or full revision.
                    </p>
                  </div>
                )}

                {/* SUPERSESSION (Supersedes) */}
                {lifecycleRes.lifecycle.supersedes_standard_number && (
                  <div className="py-2.5">
                    <span className="text-[11px] font-bold text-[#627D98] uppercase tracking-wider block font-display">
                      Supersession
                    </span>
                    <span className="font-semibold text-[#102A43]">
                      Supersedes: {lifecycleRes.lifecycle.supersedes_standard_number}
                    </span>
                  </div>
                )}

                {/* SUPERSESSION (Superseded by) */}
                {lifecycleRes.lifecycle.superseded_by_standard_number && (
                  <div className="py-2.5">
                    <span className="text-[11px] font-bold text-[#627D98] uppercase tracking-wider block font-display text-rose-700">
                      Supersession
                    </span>
                    <span className="font-semibold text-rose-700">
                      Superseded by: {lifecycleRes.lifecycle.superseded_by_standard_number}
                    </span>
                  </div>
                )}

                {/* TRANSITION */}
                {lifecycleRes.lifecycle.transition_end_date && (
                  <div className="py-2.5 space-y-1">
                    <span className="text-[11px] font-bold text-[#627D98] uppercase tracking-wider block font-display">
                      Transition / Concurrent Running Ends
                    </span>
                    <span className="font-semibold text-[#B45309]">
                      {formatPartialDate(lifecycleRes.lifecycle.transition_end_date)}
                    </span>
                    <p className="text-[11px] text-[#627D98] leading-tight">
                      See official BIS implementation evidence for applicability.
                    </p>
                  </div>
                )}

                {/* GAZETTE NOTIFICATION REF */}
                {lifecycleRes.lifecycle.gazette_notification_ref && (
                  <div className="py-2.5">
                    <span className="text-[11px] font-bold text-[#627D98] uppercase tracking-wider block font-display">
                      Gazette Reference
                    </span>
                    <span className="text-[#334E68] text-xs font-mono">
                      {lifecycleRes.lifecycle.gazette_notification_ref}
                    </span>
                  </div>
                )}

                {/* VERIFIED EVIDENCE */}
                <div className="py-2.5 space-y-1.5">
                  <span className="text-[11px] font-bold text-[#627D98] uppercase tracking-wider block font-display">
                    Verified Evidence
                  </span>
                  <div className="text-[12px] text-[#334E68] leading-relaxed">
                    {lifecycleRes.lifecycle.evidence_description}
                  </div>
                  <div className="text-[11px] text-[#627D98] pt-0.5">
                    Last verified: {formatPartialDate(lifecycleRes.lifecycle.last_verified_at)}
                  </div>
                  {lifecycleRes.lifecycle.verified_source_url && (
                    <div className="pt-1">
                      <a
                        href={lifecycleRes.lifecycle.verified_source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] hover:text-[#0D655E] hover:underline transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Open Official BIS Evidence</span>
                        <ExternalLink className="w-3 h-3 opacity-80" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* SECTION 6: LIFECYCLE EMPTY STATE */
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <p className="font-medium text-[#243B53]">
                  Lifecycle evidence not currently available in the curated ISutra reference dataset.
                </p>
                <p className="text-[#627D98] leading-relaxed">
                  Verify edition, revision, reaffirmation, withdrawal, and supersession status from the official BIS source.
                </p>
                {standard.source_url && (
                  <a
                    href={standard.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#0F766E] font-semibold hover:underline pt-1"
                  >
                    <span>Open Official BIS Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {/* AMENDMENT HISTORY */}
            <div className="pt-4 border-t border-[#243B53]/10 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[#627D98] uppercase tracking-wider block font-display">
                  Amendment History
                </span>
                {lifecycleRes && lifecycleRes.amendments.length > 0 && (
                  <span className="text-xs font-semibold text-[#0F766E] px-2 py-0.5 bg-teal-50 border border-teal-200 rounded-md">
                    {lifecycleRes.amendments.length} verified amendment{lifecycleRes.amendments.length === 1 ? '' : 's'}
                  </span>
                )}
              </div>

              {lifecycleRes && lifecycleRes.amendments.length > 0 ? (
                <div className="space-y-3 pt-1">
                  {lifecycleRes.amendments.map((amd) => (
                    <div
                      key={amd.id || amd.amendment_number}
                      className="p-3 rounded-xl border border-emerald-200/80 bg-emerald-50/20 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2 font-bold text-[#102A43] font-display">
                        <span className="text-[#0F766E]">
                          {amd.amendment_label || `Amendment No. ${amd.amendment_number}`}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-1.5 py-0.5 rounded">
                          Verified
                        </span>
                      </div>

                      {/* Dates */}
                      <div className="space-y-0.5 text-[11px] text-[#486581]">
                        {amd.establishment_date && (
                          <div>
                            <span className="text-[#627D98] font-medium">Established: </span>
                            <span>{formatPartialDate(amd.establishment_date)}</span>
                          </div>
                        )}
                        {amd.publication_date && (
                          <div>
                            <span className="text-[#627D98] font-medium">Published: </span>
                            <span>{formatPartialDate(amd.publication_date)}</span>
                          </div>
                        )}
                        {amd.effective_date && (
                          <div>
                            <span className="text-[#627D98] font-medium">Effective: </span>
                            <span>{formatPartialDate(amd.effective_date)}</span>
                          </div>
                        )}
                        {!amd.establishment_date && !amd.publication_date && !amd.effective_date && (
                          <div className="italic text-[#9FB3C8]">
                            Dates not available in current reference dataset.
                          </div>
                        )}
                      </div>

                      {/* Affected Clauses */}
                      {amd.affected_clauses && amd.affected_clauses.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-[#627D98] uppercase tracking-wider block">
                            Affected Clauses:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {amd.affected_clauses.map((clause, cIdx) => (
                              <span
                                key={cIdx}
                                className="px-1.5 py-0.5 bg-white border border-[#243B53]/15 rounded text-[10px] font-mono text-[#102A43]"
                              >
                                {clause}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Summary */}
                      {amd.summary && (
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-[#627D98] uppercase tracking-wider block">
                            Summary:
                          </span>
                          <p className="text-[#334E68] text-[11px] leading-relaxed">
                            {amd.summary}
                          </p>
                        </div>
                      )}

                      {/* Gazette Ref if available */}
                      {amd.gazette_notification_ref && (
                        <div className="text-[10px] text-[#627D98] font-mono">
                          Gazette: {amd.gazette_notification_ref}
                        </div>
                      )}

                      {/* Official Evidence Link */}
                      <div className="pt-1 border-t border-emerald-200/60">
                        <a
                          href={amd.verified_source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F766E] hover:underline"
                        >
                          <span>Official Evidence</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* SECTION 5: IMPORTANT EMPTY STATE */
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <p className="font-medium text-[#243B53]">
                    No verified amendment record in the current ISutra reference dataset.
                  </p>
                  <p className="text-[#627D98] leading-relaxed">
                    This does not establish that no amendment exists. Verify the official BIS source before procurement use.
                  </p>
                  {standard.source_url && (
                    <a
                      href={standard.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#0F766E] font-semibold hover:underline pt-1"
                    >
                      <span>Open Official BIS Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Additional Metadata: Certification Applicability & Source Organization */}
            <div className="pt-4 border-t border-[#243B53]/10 space-y-2 text-[12px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#627D98]">Certification Applicability</span>
                <span className="text-xs text-[#627D98] text-right italic">
                  Check applicable Ministry QCOs
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#627D98]">Source Organization</span>
                <span className="font-semibold text-[#102A43] text-right">
                  {standard.source_organization || 'Bureau of Indian Standards'}
                </span>
              </div>
            </div>

            {/* SECTION 15: DISCLAIMER */}
            <div className="pt-3 border-t border-[#243B53]/10">
              <p className="text-[11px] text-[#9FB3C8] leading-relaxed italic">
                ISutra is a research prototype. Lifecycle and amendment information reflects the curated evidence currently available in the ISutra reference dataset. Verify the official BIS publication before procurement or compliance decisions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          5. ASSOCIATED & ALLIED REFERENCES EXPLORER
          Full-width section below the main 2-column layout
         ============================================================ */}
      <div
        id="relationships"
        className="bg-white rounded-2xl border border-[#243B53]/10 p-6 sm:p-7 shadow-xs space-y-5 w-full scroll-mt-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#243B53]/10 pb-4">
          <div>
            <h3 className="text-[15px] sm:text-[16px] font-bold text-[#102A43] font-display flex items-center gap-2 uppercase tracking-wide">
              <Layers className="w-4 h-4 text-[#0F766E]" />
              Associated & Allied References Explorer
            </h3>
            <p className="text-[13px] text-[#627D98] mt-0.5">
              Cross-referenced standards and authoritative relationships recorded for {stdNumber}.
            </p>
          </div>
          <span className="text-[12px] font-semibold text-[#0F766E] px-3 py-1 bg-[#0F766E]/5 rounded-full border border-[#0F766E]/15 self-start sm:self-auto">
            {relationships.length} References
          </span>
        </div>

        {/* Relationship Coverage Indicator (Descriptive & Truthful) */}
        <div className="bg-[#F8FAFC] border border-[#243B53]/15 rounded-xl p-4 space-y-2.5">
          <div className="text-[12px] font-bold text-[#102A43] uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#0F766E]" />
              Relationship Coverage
            </span>
            <span className="text-[11px] font-normal text-[#627D98] lowercase">
              (current curated reference dataset)
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified relationships: {coverage?.verified_count ?? relationships.filter(r => r.verification_status === 'verified').length}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Associated references: {coverage?.total ?? relationships.length}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-medium">
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span>Unclassified: {coverage?.unclassified_count ?? relationships.filter(r => r.verification_status !== 'verified').length}</span>
            </div>
          </div>
          <p className="text-[11px] text-[#627D98] italic">
            {coverage?.coverage_notice || 'Relationship coverage is limited to verified references available in the current dataset.'}
          </p>
        </div>

        {/* Why this matters to procurement note */}
        <div className="text-xs text-[#243B53] bg-teal-50/70 border border-teal-200/80 p-3.5 rounded-xl space-y-1">
          <div className="font-bold text-[#0F766E] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Why This Matters for Procurement:</span>
          </div>
          <p className="text-[#334E68] leading-relaxed">
            {procurementGuidance ||
              'Associated standards may affect testing, safety, installation, performance, or other tender requirements. Verify relationship type and applicability against the official BIS publication before finalizing procurement specifications.'}
          </p>
        </div>

        {/* Relationship Items Grid */}
        {relationships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {relationships.map((rel, i) => {
              const isVerified = rel.verification_status === 'verified';
              const targetNum =
                rel.target_standard?.standard_number ||
                rel.target_standard_number ||
                rel.target_standard_id;
              const targetTitle =
                rel.target_standard?.title || rel.description;

              return (
                <div
                  key={rel.id || i}
                  className={`p-4 rounded-xl border transition-all shadow-2xs flex flex-col justify-between gap-3 ${
                    isVerified
                      ? 'bg-emerald-50/20 border-emerald-300/70 hover:border-emerald-500/80'
                      : 'bg-[#F7F9FC] border-[#243B53]/10 hover:border-[#0F766E]/30'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Badge Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {isVerified ? (
                        <>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded-md">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Verified Relationship
                          </span>
                          <span className="inline-flex items-center text-[11px] font-semibold text-[#0F766E] bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md capitalize">
                            {rel.relationship_type?.replace(/_/g, ' ') || 'Normative Reference'}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-md">
                            <Layers className="w-3 h-3 text-slate-500" />
                            Associated Reference
                          </span>
                          <span className="text-[11px] text-[#627D98] italic">
                            Relationship type unclassified
                          </span>
                        </>
                      )}
                    </div>

                    {/* Standard Number & Title */}
                    <div>
                      <h4 className="text-[14px] font-bold text-[#102A43] font-display">
                        {targetNum}
                      </h4>
                      <p className="text-[12px] text-[#486581] mt-0.5 leading-snug line-clamp-2">
                        {targetTitle}
                      </p>
                    </div>

                    {/* Evidence or Unclassified Note */}
                    {isVerified && rel.evidence_clause ? (
                      <div className="text-xs bg-white border border-emerald-200/80 rounded-lg p-2.5 space-y-1">
                        <div className="font-semibold text-[#102A43] flex items-center gap-1">
                          <FileText className="w-3 h-3 text-[#0F766E]" />
                          <span>Clause Citation Evidence:</span>
                        </div>
                        <p className="text-[#334E68] italic font-mono text-[11px] leading-relaxed">
                          {rel.evidence_clause}
                        </p>
                      </div>
                    ) : (
                      <div className="text-xs bg-white/70 border border-[#243B53]/10 rounded-lg p-2.5">
                        <p className="text-[11px] text-[#627D98] leading-relaxed">
                          Cited in standard specification or scope. Specific clause relationship (normative, test method, or allied guide) is not classified in current reference dataset.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer Source & Action */}
                  <div className="pt-2.5 border-t border-[#243B53]/10 flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-[#627D98] truncate max-w-[200px]" title={rel.source_provenance}>
                      Source: {isVerified ? 'Official BIS publication' : 'Current reference dataset'}
                    </span>
                    {rel.target_standard ? (
                      <Link
                        to={`/standards/${rel.target_standard.id}`}
                        className="text-[#0F766E] hover:text-[#0C5D57] font-semibold inline-flex items-center gap-1 shrink-0"
                      >
                        View Standard <ArrowRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <Link
                        to={`/standards?search=${encodeURIComponent(targetNum)}`}
                        className="text-[#0F766E] hover:text-[#0C5D57] font-semibold inline-flex items-center gap-1 shrink-0"
                      >
                        Search Catalogue <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[#627D98] bg-[#F7F9FC] rounded-xl border border-[#243B53]/10">
            No associated references recorded in current dataset.
          </div>
        )}
      </div>
    </div>
  );
}
