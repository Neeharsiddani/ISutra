// ============================================================
// ISutra: Differentiation Phase — Explainable Standard Decision Trail
// "Why This Standard?" + "Why Not This Alternative?"
// Deterministic, Evidence-Backed Procurement Audit Interface
// ============================================================

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ExternalLink,
  Layers,
  Scale,
  Check,
  Minus,
  AlertTriangle,
  Info,
  HelpCircle,
  FileText,
  Sparkles,
} from 'lucide-react';
import type {
  StandardRecommendation,
  StructuredRequirements,
  FactorStatus,
  FactorDetail,
  EvidenceSourceType,
} from '../../types';

interface WhyThisStandardPanelProps {
  recommendation: StandardRecommendation;
  allRecommendations: StandardRecommendation[];
  analysisId?: string;
  requirements?: StructuredRequirements;
}

export const WhyThisStandardPanel: React.FC<WhyThisStandardPanelProps> = ({
  recommendation: rec,
  allRecommendations,
  analysisId,
  requirements,
}) => {
  const isPrimary = rec.rank === 1;

  // ------------------------------------------------------------
  // STEP 5 & 6: Meaningful Alternative Selection (Deterministic)
  // ------------------------------------------------------------
  const meaningfulAlternative = useMemo(() => {
    if (!allRecommendations || allRecommendations.length <= 1) return null;

    if (isPrimary) {
      // Find strongest candidate from remaining recommendations
      const candidates = allRecommendations.slice(1);
      const found = candidates.find((c) => {
        const hasScore = c.score >= 0.25;
        const isRelevanceTier = c.category === 'high' || c.category === 'related';
        const isTopicalMatch =
          c.factorStatuses.productCategory.status === 'matched' ||
          c.factorStatuses.keywordsTitleScope.status === 'matched' ||
          (c.matchedFactors.keywords && c.matchedFactors.keywords.length > 0) ||
          c.standard.category === rec.standard.category;

        return hasScore && isRelevanceTier && isTopicalMatch;
      });

      return found || null;
    } else {
      // For non-primary card, compare directly against primary recommendation (rank 1)
      return allRecommendations[0] || null;
    }
  }, [allRecommendations, isPrimary, rec]);

  // Factual distinction notes derived strictly from existing factor data
  const alternativeDistinction = useMemo(() => {
    if (!meaningfulAlternative) return null;

    const primaryRec = isPrimary ? rec : meaningfulAlternative;
    const altRec = isPrimary ? meaningfulAlternative : rec;

    const notes: string[] = [];

    // 1. Application difference
    if (
      primaryRec.factorStatuses.application.status === 'matched' &&
      altRec.factorStatuses.application.status !== 'matched'
    ) {
      notes.push(
        'The primary reference contains stronger recorded alignment with the submitted application domain, whereas the alternative reference does not explicitly cover this specific application.'
      );
    }

    // 2. Specificity / Product difference
    if (
      primaryRec.specificityTier &&
      altRec.specificityTier &&
      primaryRec.specificityTier < altRec.specificityTier
    ) {
      notes.push(
        `The primary reference has a higher specification specificity (${primaryRec.specificityTierLabel || `Tier ${primaryRec.specificityTier}`}) dedicated to the exact equipment, compared to the broader scope of the alternative (${altRec.specificityTierLabel || `Tier ${altRec.specificityTier}`}).`
      );
    } else if (
      primaryRec.factorStatuses.productCategory.status === 'matched' &&
      altRec.factorStatuses.productCategory.status !== 'matched'
    ) {
      notes.push(
        'The primary reference directly aligns with the requested equipment category, while the alternative corresponds to an auxiliary or related category.'
      );
    }

    // 3. Environmental difference
    if (
      primaryRec.factorStatuses.environment.status === 'matched' &&
      altRec.factorStatuses.environment.status !== 'matched'
    ) {
      notes.push(
        'The primary reference explicitly documents suitability for the specified operating environment, whereas the alternative reference does not document these conditions.'
      );
    }

    // 4. Overall contribution differential
    const scoreDiff = Math.round((primaryRec.score - altRec.score) * 100);
    if (scoreDiff > 0) {
      notes.push(
        `The primary reference achieved higher cumulative matching score across weighted signals (+${scoreDiff}% differential).`
      );
    }

    return notes;
  }, [meaningfulAlternative, isPrimary, rec]);

  // ------------------------------------------------------------
  // STEP 8: Deterministic "What Is Still Unknown?" Audit
  // ------------------------------------------------------------
  const unknownItems = useMemo(() => {
    const items: string[] = [];

    // Technical parameters
    if (rec.factorStatuses.technicalParameters.status === 'not_available') {
      items.push(
        'Specific technical parameter limits are not available in the current reference record; verify applicable values in the full official standard.'
      );
    } else if (rec.factorStatuses.technicalParameters.status === 'not_matched') {
      items.push(
        'Certain technical parameters from the requirement could not be verified against the summary record criteria.'
      );
    }

    // Safety and testing
    if (
      rec.factorStatuses.safetyTesting.status === 'not_available' ||
      rec.factorStatuses.safetyTesting.status === 'not_matched'
    ) {
      items.push(
        'Specific safety/testing acceptance thresholds require verification against the applicable BIS test clauses.'
      );
    }

    // Environment
    if (rec.factorStatuses.environment.status === 'not_available') {
      items.push(
        'Enclosure / environmental ingress protection ratings require verification against the manufacturer compliance certificate or official BIS publication.'
      );
    }

    // Edition / Amendments
    items.push(
      `Current edition (${rec.standard.edition_year || 'latest'}) and recent Gazette amendments must be verified on the official BIS portal prior to tender finalization.`
    );

    return items;
  }, [rec]);

  // Factor list for visual mathematics table
  const factors: {
    key: string;
    name: string;
    detail: FactorDetail;
  }[] = [
    {
      key: 'productCategory',
      name: 'Product & Category',
      detail: rec.factorStatuses.productCategory,
    },
    {
      key: 'keywordsTitleScope',
      name: 'Keywords, Title & Scope',
      detail: rec.factorStatuses.keywordsTitleScope,
    },
    {
      key: 'application',
      name: 'Application Domain',
      detail: rec.factorStatuses.application,
    },
    {
      key: 'environment',
      name: 'Environmental Conditions',
      detail: rec.factorStatuses.environment,
    },
    {
      key: 'technicalParameters',
      name: 'Technical Parameters',
      detail: rec.factorStatuses.technicalParameters,
    },
    {
      key: 'safetyTesting',
      name: 'Safety & Testing',
      detail: rec.factorStatuses.safetyTesting,
    },
  ];

  return (
    <div className="mt-4 pt-4 border-t border-[#243B53]/15 space-y-6 text-xs text-[#243B53]">
      {/* ============================================================
          SECTION 1: PANEL HEADER & REFERENCE ALIGNMENT
         ============================================================ */}
      <div className="bg-[#102A43] text-white rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Deterministic Decision Trail
              </span>
              {rec.specificityTierLabel && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {rec.specificityTierLabel}
                </span>
              )}
            </div>
            <h4 className="text-base sm:text-lg font-bold font-mono text-white tracking-tight">
              WHY THIS STANDARD? — {rec.standard.standard_number || rec.standard.is_number}
            </h4>
            <p className="text-xs text-slate-300 font-medium line-clamp-2">
              {rec.standard.title}
            </p>
          </div>

          <div className="shrink-0 bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-right min-w-[170px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Reference Alignment
            </span>
            <div className="flex items-baseline justify-end gap-1.5 my-0.5">
              <span className="text-2xl font-bold font-mono text-teal-400">
                {rec.relevancePercentage}%
              </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-300 block">
              Score: {rec.score.toFixed(3)} / 1.000
            </span>
          </div>
        </div>

        {/* Dynamic reason banner */}
        <div className="mt-3 pt-3 border-t border-slate-700/80 text-xs text-slate-300 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Matching Rationale: </strong>
            <span>{rec.reason}</span>
          </div>
        </div>

        {/* Score Explanation Notice */}
        <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-[10px] text-slate-300/90 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>
            Reference Alignment is calculated from six deterministic matching signals. It is not a compliance score or certification assessment.
          </span>
        </div>
      </div>

      {/* ============================================================
          SECTION 2: STEP 3 — MAKE THE MATHEMATICS VISUAL
         ============================================================ */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-[11px] font-bold text-[#102A43] uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Match Contribution & Factor Mathematics</span>
          </h5>
          <span className="text-[10px] text-[#627D98]">
            Deterministic weighted multi-signal scoring
          </span>
        </div>

        <p className="text-[11px] text-[#486581] leading-relaxed">
          Reference Alignment is calculated from six deterministic matching signals. Points are awarded only where verifiable criteria exist in the recorded scope. It is not a compliance score or certification assessment.
        </p>

        {/* Visual Mathematics Table */}
        <div className="space-y-2 pt-1">
          {factors.map((f) => {
            const weightPct = Math.round(f.detail.weight * 100);
            const contributionPts = Math.round(f.detail.contribution * 100);
            const isMatched = f.detail.status === 'matched';
            const isContradiction = f.detail.status === 'contradiction';
            const isNA = f.detail.status === 'not_available';

            // Percentage of factor weight achieved (0 to 100%)
            const barFillPercent = f.detail.weight > 0
              ? Math.min(100, Math.round((f.detail.contribution / f.detail.weight) * 100))
              : 0;

            return (
              <div
                key={f.key}
                className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 py-2 px-3 rounded-lg bg-slate-50/70 border border-slate-200/60 hover:bg-slate-50 transition-colors"
              >
                {/* Factor Name & Status */}
                <div className="sm:col-span-4 flex items-center gap-2">
                  <FactorStatusIcon status={f.detail.status} />
                  <div>
                    <div className="font-bold text-[11px] text-[#102A43]">{f.name}</div>
                    <div className="text-[10px] text-[#627D98]">
                      Weight: {weightPct}%
                    </div>
                  </div>
                </div>

                {/* Visual Contribution Bar */}
                <div className="sm:col-span-5 space-y-1">
                  <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isMatched
                          ? 'bg-emerald-600'
                          : isContradiction
                          ? 'bg-rose-500'
                          : 'bg-slate-300'
                      }`}
                      style={{ width: `${barFillPercent}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-[#627D98] truncate" title={f.detail.evidence?.join(', ')}>
                    {f.detail.evidence && f.detail.evidence.length > 0 ? (
                      <span>Evidence: {f.detail.evidence.join(', ')}</span>
                    ) : isNA ? (
                      <span className="italic text-slate-500">Not available in reference record</span>
                    ) : isContradiction ? (
                      <span className="text-rose-600 font-semibold">Requirement conflicts with standard criteria</span>
                    ) : (
                      <span className="text-slate-400">Not matched</span>
                    )}
                  </div>
                </div>

                {/* Numeric Points Contribution */}
                <div className="sm:col-span-3 text-right">
                  {isMatched ? (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-100 text-emerald-800">
                      Contribution: +{contributionPts} pts
                    </span>
                  ) : isContradiction ? (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-rose-100 text-rose-800">
                      Contradiction (! )
                    </span>
                  ) : isNA ? (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium font-mono bg-slate-100 text-slate-600">
                      Not available (—)
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium font-mono bg-slate-100 text-slate-500">
                      Not matched (0 pts)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          SECTION 3: STEP 4 — SHOW THE EVIDENCE, NOT AI PROSE
         ============================================================ */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-[11px] font-bold text-[#102A43] uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Matching Signals & Deterministic Evidence</span>
          </h5>
          <span className="text-[10px] text-[#627D98]">Verified Evidence Only</span>
        </div>

        {rec.comparison && rec.comparison.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-[#627D98] border-b border-slate-200">
                  <th className="py-2.5 px-3">Requirement Signal</th>
                  <th className="py-2.5 px-3">Matching Evidence</th>
                  <th className="py-2.5 px-3">Reference Record</th>
                  <th className="py-2.5 px-3 text-right">Alignment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rec.comparison.map((cmp, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-medium text-[#102A43]">
                      <div>{cmp.field}</div>
                      <div className="text-[11px] text-[#486581] font-normal">
                        {cmp.requirementValue || (
                          <span className="text-slate-400 italic">Not specified by user</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[#243B53]">
                      {cmp.note ? (
                        <span className="font-mono text-[11px] text-teal-800">{cmp.note}</span>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[#486581]">
                      {cmp.standardValue || (
                        <span className="text-slate-400 italic">Not in Record</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <AlignmentBadge status={cmp.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 rounded-lg text-slate-500 italic text-[11px]">
            No direct comparison signals mapped for this record.
          </div>
        )}

        {/* Provenance breakdown */}
        {rec.evidence && rec.evidence.length > 0 && (
          <div className="pt-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#627D98] mb-2">
              Signal Provenance Tracing:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {rec.evidence.slice(0, 6).map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2 text-[11px]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <SourceTypeBadge sourceType={item.sourceType} />
                      <span className="font-bold text-[#102A43] truncate">{item.label}</span>
                    </div>
                    <div className="text-[#486581] font-mono truncate">{item.value}</div>
                  </div>
                  <span
                    className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      item.matched ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {item.matched ? 'Verified' : 'Unavailable'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          SECTION 4: STEPS 5 & 6 — “WHY NOT THIS ALTERNATIVE?”
         ============================================================ */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
        {meaningfulAlternative ? (
          <>
            <div>
              <div className="flex items-center justify-between">
                <h5 className="text-[11px] font-bold text-[#102A43] uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>
                    {isPrimary
                      ? `WHY NOT ${meaningfulAlternative.standard.standard_number || meaningfulAlternative.standard.is_number}?`
                      : `COMPARISON TO PRIMARY REFERENCE (${meaningfulAlternative.standard.standard_number || meaningfulAlternative.standard.is_number})`}
                  </span>
                </h5>
                <span className="text-[10px] text-[#627D98]">Factual Dimensional Comparison</span>
              </div>
              <p className="text-xs text-[#486581] mt-1 font-medium">
                How the documented evidence differs from the primary reference: ISutra considered this reference, but it was not treated as the primary reference for this requirement.
              </p>
            </div>

            {/* Side-by-side dimension comparison table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-semibold text-[#627D98] border-b border-slate-200">
                    <th className="py-2.5 px-3">Dimension</th>
                    <th className="py-2.5 px-3 text-[#102A43] bg-teal-50/50">
                      {isPrimary
                        ? `PRIMARY: ${rec.standard.standard_number || rec.standard.is_number}`
                        : `PRIMARY: ${meaningfulAlternative.standard.standard_number || meaningfulAlternative.standard.is_number}`}
                    </th>
                    <th className="py-2.5 px-3 text-[#486581]">
                      {isPrimary
                        ? `ALTERNATIVE: ${meaningfulAlternative.standard.standard_number || meaningfulAlternative.standard.is_number}`
                        : `THIS REFERENCE: ${rec.standard.standard_number || rec.standard.is_number}`}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Row 1: Product Alignment */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-[#102A43]">Product Alignment</td>
                    <td className="py-2.5 px-3 bg-teal-50/20">
                      <DimensionCell
                        status={
                          isPrimary
                            ? rec.factorStatuses.productCategory.status
                            : meaningfulAlternative.factorStatuses.productCategory.status
                        }
                        text={
                          isPrimary
                            ? rec.factorStatuses.productCategory.evidence?.join(', ') || 'Aligned'
                            : meaningfulAlternative.factorStatuses.productCategory.evidence?.join(', ') || 'Aligned'
                        }
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <DimensionCell
                        status={
                          isPrimary
                            ? meaningfulAlternative.factorStatuses.productCategory.status
                            : rec.factorStatuses.productCategory.status
                        }
                        text={
                          isPrimary
                            ? meaningfulAlternative.factorStatuses.productCategory.evidence?.join(', ') || 'Related coverage'
                            : rec.factorStatuses.productCategory.evidence?.join(', ') || 'Related coverage'
                        }
                      />
                    </td>
                  </tr>

                  {/* Row 2: Application */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-[#102A43]">Application Domain</td>
                    <td className="py-2.5 px-3 bg-teal-50/20">
                      <DimensionCell
                        status={
                          isPrimary
                            ? rec.factorStatuses.application.status
                            : meaningfulAlternative.factorStatuses.application.status
                        }
                        text={
                          isPrimary
                            ? rec.factorStatuses.application.evidence?.join(', ') || 'Covered'
                            : meaningfulAlternative.factorStatuses.application.evidence?.join(', ') || 'Covered'
                        }
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <DimensionCell
                        status={
                          isPrimary
                            ? meaningfulAlternative.factorStatuses.application.status
                            : rec.factorStatuses.application.status
                        }
                        text={
                          isPrimary
                            ? meaningfulAlternative.factorStatuses.application.evidence?.join(', ') || 'General / Unrecorded'
                            : rec.factorStatuses.application.evidence?.join(', ') || 'General / Unrecorded'
                        }
                      />
                    </td>
                  </tr>

                  {/* Row 3: Environment */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-[#102A43]">Operating Environment</td>
                    <td className="py-2.5 px-3 bg-teal-50/20">
                      <DimensionCell
                        status={
                          isPrimary
                            ? rec.factorStatuses.environment.status
                            : meaningfulAlternative.factorStatuses.environment.status
                        }
                        text={
                          isPrimary
                            ? rec.factorStatuses.environment.evidence?.join(', ') || 'Documented'
                            : meaningfulAlternative.factorStatuses.environment.evidence?.join(', ') || 'Documented'
                        }
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <DimensionCell
                        status={
                          isPrimary
                            ? meaningfulAlternative.factorStatuses.environment.status
                            : rec.factorStatuses.environment.status
                        }
                        text={
                          isPrimary
                            ? meaningfulAlternative.factorStatuses.environment.evidence?.join(', ') || 'Not documented'
                            : rec.factorStatuses.environment.evidence?.join(', ') || 'Not documented'
                        }
                      />
                    </td>
                  </tr>

                  {/* Row 4: Specificity */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-[#102A43]">Specification Specificity</td>
                    <td className="py-2.5 px-3 bg-teal-50/20 font-mono text-[11px] text-[#102A43]">
                      {isPrimary
                        ? rec.specificityTierLabel || `Tier ${rec.specificityTier || 1}`
                        : meaningfulAlternative.specificityTierLabel || `Tier ${meaningfulAlternative.specificityTier || 1}`}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#486581]">
                      {isPrimary
                        ? meaningfulAlternative.specificityTierLabel || `Tier ${meaningfulAlternative.specificityTier || 2}`
                        : rec.specificityTierLabel || `Tier ${rec.specificityTier || 2}`}
                    </td>
                  </tr>

                  {/* Row 5: Matching Contribution */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-[#102A43]">Reference Alignment</td>
                    <td className="py-2.5 px-3 bg-teal-50/20 font-bold font-mono text-[#0F766E]">
                      {isPrimary
                        ? `${rec.relevancePercentage}% (+${Math.round(rec.score * 100)} pts)`
                        : `${meaningfulAlternative.relevancePercentage}% (+${Math.round(meaningfulAlternative.score * 100)} pts)`}
                    </td>
                    <td className="py-2.5 px-3 font-semibold font-mono text-[#486581]">
                      {isPrimary
                        ? `${meaningfulAlternative.relevancePercentage}% (+${Math.round(meaningfulAlternative.score * 100)} pts)`
                        : `${rec.relevancePercentage}% (+${Math.round(rec.score * 100)} pts)`}
                    </td>
                  </tr>

                  {/* Row 6: Documented Title / Scope Excerpt */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-[#102A43]">Scope Excerpt</td>
                    <td className="py-2.5 px-3 bg-teal-50/20 text-[11px] text-[#486581] line-clamp-3">
                      {isPrimary ? rec.standard.title : meaningfulAlternative.standard.title}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-[#486581] line-clamp-3">
                      {isPrimary ? meaningfulAlternative.standard.title : rec.standard.title}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Factual distinction notes */}
            {alternativeDistinction && alternativeDistinction.length > 0 && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1.5 text-xs text-[#243B53]">
                <strong className="text-[#102A43] block">
                  Evaluator Distinction Summary (How the documented evidence differs from the primary reference):
                </strong>
                <ul className="space-y-1 list-disc pl-4 text-[#486581]">
                  {alternativeDistinction.map((note, nIdx) => (
                    <li key={nIdx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          /* STEP 6: CLEAR "NO MEANINGFUL ALTERNATIVE" STATE */
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center space-y-2">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-600 mb-1">
              <Info className="w-4 h-4" />
            </div>
            <h5 className="text-xs font-bold text-[#102A43] uppercase tracking-wider">
              NO MEANINGFUL ALTERNATIVE IDENTIFIED
            </h5>
            <p className="text-xs text-[#627D98] max-w-lg mx-auto leading-relaxed">
              The current reference dataset did not provide another sufficiently aligned standard for a meaningful comparison.
            </p>
          </div>
        )}
      </div>

      {/* ============================================================
          SECTION 5: STEP 8 — WHAT IS STILL UNKNOWN?
         ============================================================ */}
      <div className="bg-white border border-amber-200/80 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>WHAT IS STILL UNKNOWN & REQUIRES VERIFICATION?</span>
          </h5>
          <span className="text-[10px] text-amber-700 font-medium">Pre-Procurement Checklist</span>
        </div>

        <p className="text-[11px] text-[#486581]">
          ISutra's summary dataset covers primary standard scopes and test parameters. The following items require
          confirmation against the official standard text or tender documentation:
        </p>

        <ul className="space-y-1.5 list-disc pl-4 text-xs text-[#243B53]">
          {unknownItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Link
            to={`/analysis/${analysisId || ''}/recommendations/${rec.standard.id}/gap-analysis`}
            state={{ fromAnalysisId: analysisId, standard: rec.standard, requirements }}
            className="px-3.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Scale className="w-3.5 h-3.5 text-amber-700" />
            <span>Open Comprehensive Requirement Gap Analysis →</span>
          </Link>
        </div>
      </div>

      {/* ============================================================
          SECTION 6: STEP 7 — CONNECT TO EXISTING TRACEABILITY
         ============================================================ */}
      {rec.traceabilityChain && rec.traceabilityChain.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-[11px] font-bold text-[#102A43] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Deterministic Traceability Chain</span>
            </h5>
            <span className="text-[10px] text-[#627D98]">5 Sequential Audit Stages</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            {rec.traceabilityChain.map((step) => (
              <div key={step.step} className="relative space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0F766E] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {step.step}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#102A43]">
                    {step.title}
                  </span>
                </div>
                <p className="text-[11px] text-[#486581] font-medium leading-tight pl-6">
                  {step.description}
                </p>
                <div className="pl-6 pt-0.5">
                  <span className="inline-block text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-white border border-slate-200 text-[#627D98]">
                    {step.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          SECTION 7: STEP 9 — OFFICIAL BIS VERIFICATION CTA & DISCLAIMER
         ============================================================ */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 text-xs text-[#627D98] max-w-xl">
          <div className="flex items-center gap-1.5 font-bold text-[#102A43]">
            <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
            <span>Official BIS Verification Requirement</span>
          </div>
          <p className="leading-relaxed">
            ISutra provides reference intelligence only. Verify the applicable standard, edition, amendments and
            procurement requirements against official BIS publications before tender or compliance decisions.
          </p>
        </div>

        {rec.standard.source_url && (
          <a
            href={rec.standard.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 min-h-[38px] px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0C5D57] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify with Official BIS Source</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        )}
      </div>
    </div>
  );
};

// ------------------------------------------------------------
// Internal Helper Components
// ------------------------------------------------------------

function FactorStatusIcon({ status }: { status: FactorStatus }) {
  if (status === 'matched') {
    return (
      <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
        <Check className="w-3 h-3" />
      </span>
    );
  }
  if (status === 'contradiction') {
    return (
      <span className="shrink-0 w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
        <AlertTriangle className="w-3 h-3" />
      </span>
    );
  }
  if (status === 'not_available') {
    return (
      <span className="shrink-0 w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
        <Minus className="w-3 h-3" />
      </span>
    );
  }
  return (
    <span className="shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs">
      ○
    </span>
  );
}

function AlignmentBadge({ status }: { status: FactorStatus }) {
  if (status === 'matched') {
    return (
      <span className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        Matched
      </span>
    );
  }
  if (status === 'contradiction') {
    return (
      <span className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
        Contradiction
      </span>
    );
  }
  if (status === 'not_available') {
    return (
      <span className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-[#627D98] border border-slate-200">
        Not in Record
      </span>
    );
  }
  return (
    <span className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
      Not Matched
    </span>
  );
}

function DimensionCell({ status, text }: { status: FactorStatus; text: string }) {
  const isMatched = status === 'matched';
  const isContradiction = status === 'contradiction';
  const isNA = status === 'not_available';

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1.5">
        <span
          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
            isMatched
              ? 'bg-emerald-100 text-emerald-800'
              : isContradiction
              ? 'bg-rose-100 text-rose-800'
              : isNA
              ? 'bg-slate-200 text-slate-600'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {isMatched
            ? 'Matched'
            : isContradiction
            ? 'Contradiction'
            : isNA
            ? 'Not in Record'
            : 'Not Matched'}
        </span>
      </div>
      <div className="text-[11px] text-[#486581] line-clamp-2">{text}</div>
    </div>
  );
}

function SourceTypeBadge({ sourceType }: { sourceType: EvidenceSourceType }) {
  if (sourceType === 'user_requirement') {
    return (
      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-blue-100 text-blue-800">
        USER REQ
      </span>
    );
  }
  if (sourceType === 'extracted_requirement') {
    return (
      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-emerald-100 text-emerald-800">
        EXTRACTED REQ
      </span>
    );
  }
  if (sourceType === 'standard_data') {
    return (
      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-purple-100 text-purple-800">
        STANDARD DATA
      </span>
    );
  }
  return (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-teal-100 text-teal-800">
      OFFICIAL BIS
    </span>
  );
}
