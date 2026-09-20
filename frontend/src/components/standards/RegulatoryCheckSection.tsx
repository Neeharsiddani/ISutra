// ============================================================
// ISutra — Regulatory & Certification Check Component
// SIH26108: Suggest mandatory certification requirements where applicable
// (e.g. BIS Product Certification, CRS, Hallmarking).
// Strictly evidence-backed: No inference from title/keywords/LLM alone.
// ============================================================

import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Info,
  ExternalLink,
  Scale,
  Building2,
  Calendar,
  FileText,
} from 'lucide-react';
import type { RegulatoryAssessmentResponse, SchemeAssessment } from '../../types';

interface RegulatoryCheckSectionProps {
  assessment: RegulatoryAssessmentResponse | null;
  loading?: boolean;
}

function formatDate(dateStr?: string): string {
  if (!dateStr || !dateStr.trim()) return 'Not available in reference dataset';
  const s = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIdx = parseInt(m, 10) - 1;
    const day = parseInt(d, 10);
    if (monthIdx >= 0 && monthIdx < 12) return `${day} ${months[monthIdx]} ${y}`;
    return s;
  }
  if (/^\d{4}$/.test(s)) return s;
  return s;
}

export const RegulatoryCheckSection: React.FC<RegulatoryCheckSectionProps> = ({
  assessment,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#243B53]/10 p-6 shadow-xs animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-slate-100 rounded-xl"></div>
          <div className="h-20 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!assessment) return null;

  const schemes = assessment.schemes || [];

  return (
    <div
      id="regulatory-check"
      className="bg-white rounded-2xl border border-[#243B53]/10 p-5 sm:p-6 shadow-xs space-y-5 scroll-mt-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#243B53]/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#0F766E]" />
            <h3 className="text-base sm:text-lg font-bold text-[#102A43] font-display uppercase tracking-wide">
              Regulatory / Certification Check
            </h3>
          </div>
          <p className="text-xs text-[#627D98] mt-1">
            Statutory certification regimes evaluated strictly from curated Government Quality Control Orders (QCOs), Compulsory Registration Scheme (CRS), and Hallmarking orders. Regulatory evidence does not affect the standards matching score.
          </p>
        </div>

        <div>
          {assessment.has_verified_requirement ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{assessment.verified_requirements_count} Verified Applicability</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Verification Required</span>
            </span>
          )}
        </div>
      </div>

      {/* Schemes List */}
      <div className="space-y-4">
        {schemes.map((scheme: SchemeAssessment) => {
          const isVerified = scheme.status === 'verified_requirement';
          const isReq = scheme.status === 'verification_required';
          const isNoRecord = scheme.status === 'no_verified_record';

          return (
            <div
              key={scheme.scheme_code}
              className={`p-4 rounded-xl border transition-all ${
                isVerified
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : isReq
                  ? 'border-amber-200 bg-amber-50/20'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              {/* Scheme Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div>
                  <h4 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
                    {scheme.scheme_name}
                  </h4>
                  <span className="text-[11px] text-[#627D98]">
                    {scheme.scheme_category}
                  </span>
                </div>

                {/* Status Badge */}
                <div>
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>VERIFIED APPLICABILITY</span>
                    </span>
                  )}
                  {isReq && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wide bg-amber-100 text-amber-900 border border-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                      <span>VERIFICATION REQUIRED</span>
                    </span>
                  )}
                  {isNoRecord && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wide bg-slate-100 text-slate-700 border border-slate-300">
                      <Info className="w-3.5 h-3.5 text-slate-500" />
                      <span>NO VERIFIED REGULATORY RECORD</span>
                    </span>
                  )}
                  {scheme.status === 'not_assessed' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                      <span>Not Assessed</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Verified Details */}
              {isVerified ? (
                <div className="space-y-2 mt-3 text-xs">
                  {scheme.evidence_order && (
                    <div className="flex items-start gap-2 text-[#243B53]">
                      <FileText className="w-3.5 h-3.5 text-[#0F766E] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#102A43]">Evidence / Order: </strong>
                        <span>{scheme.evidence_order}</span>
                      </div>
                    </div>
                  )}

                  {scheme.authority && (
                    <div className="flex items-start gap-2 text-[#243B53]">
                      <Building2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#102A43]">Authority: </strong>
                        <span>{scheme.authority}</span>
                      </div>
                    </div>
                  )}

                  {scheme.effective_date && (
                    <div className="flex items-start gap-2 text-[#243B53]">
                      <Calendar className="w-3.5 h-3.5 text-[#0F766E] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#102A43]">Effective Date: </strong>
                        <span>{formatDate(scheme.effective_date)}</span>
                      </div>
                    </div>
                  )}

                  {scheme.notes_limitations && (
                    <p className="text-[11px] text-[#627D98] italic pl-5 pt-1">
                      Note: {scheme.notes_limitations}
                    </p>
                  )}

                  <div className="pt-2 pl-5">
                    <a
                      href={scheme.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-xs text-[#0F766E] hover:text-[#0D655E] hover:underline"
                    >
                      <span>Open official source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                /* Unverified / No Record Details */
                <div className="mt-2 text-xs space-y-2">
                  <div className="flex items-start gap-2 text-[#486581]">
                    <span className="font-semibold text-[#627D98] shrink-0">Reason:</span>
                    <p className="leading-relaxed">
                      {scheme.reason || 'Verification required against the applicable Ministry / BIS regulatory publication.'}
                    </p>
                  </div>

                  <div className="pt-1">
                    <a
                      href={scheme.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-xs text-[#0F766E] hover:text-[#0D655E] hover:underline"
                    >
                      <span>Verify official source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mandatory Regulatory Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#627D98] shrink-0 mt-0.5" />
        <p className="text-[#627D98] leading-relaxed italic">
          {assessment.disclaimer}
        </p>
      </div>
    </div>
  );
};
