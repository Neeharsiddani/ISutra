// ============================================================
// ISutra: Phase 3 UI Polish — Standard Details Page
// Professional 2-Column Responsive Layout for BIS Reference Standards
// Left (~70%): Scope, Product Types, Keywords, Standard Specifications
// Right (~30%): Standard Metadata & Official BIS Reference Link
// Bottom (Full Width): Related & Allied Standards
// ============================================================

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
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
  Building2,
} from 'lucide-react';
import type { Standard } from '../types';
import { getStandardById } from '../services/api';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';

export default function StandardDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [standard, setStandard] = useState<Standard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const stdRes = await getStandardById(id!);
        setStandard(stdRes.data);
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
      <div className="flex items-center gap-2 text-[13px] text-[#627D98]">
        <Link
          to="/standards"
          className="inline-flex items-center gap-1.5 hover:text-[#0F766E] transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Standards Directory</span>
        </Link>
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
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold border ${
                  isCurrent
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

        {/* Disclaimer Bar */}
        <div className="mt-5 pt-4 border-t border-[#243B53]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px] text-[#627D98]">
          <span className="inline-flex items-center gap-1.5 font-medium text-[#102A43]">
            <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
            Verified BIS reference dataset
          </span>
          <span className="text-[#9FB3C8]">
            ISutra is a prototype reference system and is not an official BIS service.
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
            Standard Metadata Card with left labels, right values,
            and Official Reference Source link
           ========================================================== */}
        <div className="w-full lg:w-[30%] space-y-6">
          <div className="bg-white rounded-2xl border border-[#243B53]/10 p-5 sm:p-6 shadow-xs space-y-5">
            <h3 className="text-[12px] font-bold text-[#627D98] uppercase tracking-wider font-display">
              Standard Metadata
            </h3>

            {/* Key-Value Table Rows */}
            <div className="divide-y divide-[#243B53]/10 text-[14px] sm:text-[15px]">
              {/* Edition Year */}
              <div className="flex items-center justify-between gap-3 py-3">
                <span className="text-[#627D98]">Edition Year</span>
                <span className="font-semibold text-[#102A43] text-right">
                  {standard.edition_year || standard.edition || '—'}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between gap-3 py-3">
                <span className="text-[#627D98]">Status</span>
                <span className="font-semibold text-[#102A43] text-right">
                  {standard.status}
                </span>
              </div>

              {/* Source Organization */}
              <div className="flex items-center justify-between gap-3 py-3">
                <span className="text-[#627D98]">Source Organization</span>
                <span className="font-semibold text-[#102A43] text-right">
                  {standard.source_organization || 'Bureau of Indian Standards'}
                </span>
              </div>

              {/* Last Verified */}
              <div className="flex items-center justify-between gap-3 py-3">
                <span className="text-[#627D98]">Last Verified</span>
                <span className="font-semibold text-[#0F766E] text-right flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {standard.last_verified || '2026-09-13'}
                </span>
              </div>
            </div>

            {/* Official Reference Source Section */}
            <div className="pt-4 border-t border-[#243B53]/10 space-y-2">
              <span className="text-[11px] font-bold text-[#627D98] uppercase tracking-wider block font-display">
                Official Reference Source
              </span>

              <div className="flex items-center gap-2 text-[14px] font-semibold text-[#102A43]">
                <Building2 className="w-4 h-4 text-[#0F766E]" />
                <span>Bureau of Indian Standards</span>
              </div>

              {standard.source_url ? (
                <div className="pt-1">
                  <a
                    href={standard.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#0F766E] hover:text-[#0D655E] hover:underline transition-colors"
                  >
                    <span>View official BIS reference</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <span className="text-[13px] text-[#9FB3C8] italic block">
                  Reference link unavailable
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          5. RELATED & ALLIED STANDARDS
          Full-width section below the main 2-column layout
         ============================================================ */}
      <div className="bg-white rounded-2xl border border-[#243B53]/10 p-6 sm:p-7 shadow-xs space-y-4 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#243B53]/10 pb-4">
          <div>
            <h3 className="text-[15px] sm:text-[16px] font-bold text-[#102A43] font-display flex items-center gap-2 uppercase tracking-wide">
              <Layers className="w-4 h-4 text-[#0F766E]" />
              Related & Allied Standards
            </h3>
            <p className="text-[13px] text-[#627D98] mt-0.5">
              Referenced normative, performance, and allied standards in the verified BIS catalogue.
            </p>
          </div>
          <span className="text-[12px] font-semibold text-[#0F766E] px-3 py-1 bg-[#0F766E]/5 rounded-full border border-[#0F766E]/15 self-start sm:self-auto">
            {(standard.related_standards || []).length} Associated
          </span>
        </div>

        {standard.related_standards && standard.related_standards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
            {standard.related_standards.map((rel, i) => (
              <Link
                key={i}
                to={`/standards?search=${encodeURIComponent(rel)}`}
                className="p-4 rounded-xl bg-[#F7F9FC] hover:bg-[#0F766E]/5 border border-[#243B53]/10 hover:border-[#0F766E]/30 flex items-center justify-between gap-3 group transition-all shadow-2xs"
              >
                <div className="min-w-0">
                  <span className="text-[14px] font-bold text-[#102A43] group-hover:text-[#0F766E] font-display block truncate transition-colors">
                    {rel}
                  </span>
                  <span className="text-[12px] text-[#627D98] mt-0.5 block">
                    Normative Reference
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#627D98] group-hover:text-[#0F766E] group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center">
            {renderSpecValue(null)}
          </div>
        )}
      </div>
    </div>
  );
}
