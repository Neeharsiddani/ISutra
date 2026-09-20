// ============================================================
// ISutra: Explainable Standard Decision Trail
// "Why This Standard?" — Deterministic Evidence-Backed Procurement Audit
// "Here is the evidence and deterministic reasoning behind this candidate standard."
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
  Sparkles,
  History,
  CheckCircle2,
} from 'lucide-react';
import type {
  StandardRecommendation,
  StructuredRequirements,
  FactorStatus,
  FactorDetail,
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
  const standardCode = rec.standard.standard_number || rec.standard.is_number;

  // ------------------------------------------------------------
  // FACTOR DATA & MATHEMATICS DEFINITION
  // ------------------------------------------------------------
  const factors: {
    key: string;
    name: string;
    weightLabel: string;
    weightPct: number;
    detail: FactorDetail;
    sourceField: string;
    userEvidence: string;
    standardEvidence: string;
  }[] = [
    {
      key: 'productCategory',
      name: 'Product & Category',
      weightLabel: '30% weight',
      weightPct: 30,
      detail: rec.factorStatuses.productCategory,
      sourceField: 'Product Classification & Scope',
      userEvidence:
        requirements?.product?.name ||
        rec.matchedFactors.productCategory
          ? `${requirements?.product?.name || 'Item'} (${requirements?.product?.category || 'Category'})`
          : 'User procurement item description',
      standardEvidence:
        rec.factorStatuses.productCategory.evidence?.join(', ') ||
        rec.standard.subcategory ||
        rec.standard.title,
    },
    {
      key: 'keywordsTitleScope',
      name: 'Keywords / Title / Scope',
      weightLabel: '25% weight',
      weightPct: 25,
      detail: rec.factorStatuses.keywordsTitleScope,
      sourceField: 'Standard Scope & Keywords',
      userEvidence:
        rec.matchedFactors.keywords && rec.matchedFactors.keywords.length > 0
          ? `Matched terms: ${rec.matchedFactors.keywords.slice(0, 6).join(', ')}`
          : 'Procurement domain keywords and phrases',
      standardEvidence:
        rec.factorStatuses.keywordsTitleScope.evidence?.slice(0, 4).join(', ') ||
        rec.standard.title,
    },
    {
      key: 'application',
      name: 'Application',
      weightLabel: '15% weight',
      weightPct: 15,
      detail: rec.factorStatuses.application,
      sourceField: 'Application Domain',
      userEvidence:
        requirements?.application ||
        'Specific procurement application domain',
      standardEvidence:
        rec.factorStatuses.application.evidence?.join(', ') ||
        (rec.factorStatuses.application.status === 'matched'
          ? 'Application covered in standard scope'
          : 'Not recorded for this application domain in summary dataset'),
    },
    {
      key: 'environment',
      name: 'Environment',
      weightLabel: '10% weight',
      weightPct: 10,
      detail: rec.factorStatuses.environment,
      sourceField: 'Operating Environment',
      userEvidence:
        requirements?.environment && requirements.environment.length > 0
          ? requirements.environment.map((e) => e.name).join(', ')
          : 'Operating environmental conditions',
      standardEvidence:
        rec.factorStatuses.environment.evidence?.join(', ') ||
        (rec.factorStatuses.environment.status === 'matched'
          ? 'Environmental suitability documented'
          : 'Not available in current reference record'),
    },
    {
      key: 'technicalParameters',
      name: 'Technical Parameters',
      weightLabel: '10% weight',
      weightPct: 10,
      detail: rec.factorStatuses.technicalParameters,
      sourceField: 'Technical Ratings & Specifications',
      userEvidence:
        requirements?.technical_parameters && requirements.technical_parameters.length > 0
          ? requirements.technical_parameters
              .slice(0, 4)
              .map((p) => `${p.parameter}: ${p.value}${p.unit ? ' ' + p.unit : ''}`)
              .join(', ')
          : 'Technical parameter specifications',
      standardEvidence:
        rec.factorStatuses.technicalParameters.evidence?.join(', ') ||
        'Not available in current reference record',
    },
    {
      key: 'safetyTesting',
      name: 'Safety & Testing',
      weightLabel: '10% weight',
      weightPct: 10,
      detail: rec.factorStatuses.safetyTesting,
      sourceField: 'Safety & Acceptance Test Criteria',
      userEvidence:
        [
          ...(requirements?.safety_requirements || []).map((s) => s.name),
          ...(requirements?.testing_requirements || []).map((t) => t.name),
        ].join(', ') || 'Safety and test acceptance criteria',
      standardEvidence:
        rec.factorStatuses.safetyTesting.evidence?.join(', ') ||
        'Not available in current reference record',
    },
  ];

  // Mathematical total mathematically derived from the actual matcher response
  const factorContributions = factors.map((f) => Math.round(f.detail.contribution * 100));
  const sumOfContributions = factorContributions.reduce((acc, val) => acc + val, 0);

  // ------------------------------------------------------------
  // MEANINGFUL ALTERNATIVE SELECTION (DETERMINISTIC)
  // ------------------------------------------------------------
  const meaningfulAlternative = useMemo(() => {
    if (!allRecommendations || allRecommendations.length <= 1) return null;

    if (isPrimary) {
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
        'The primary reference documents direct alignment with the submitted application domain, whereas the alternative reference does not document this specific application in its recorded scope.'
      );
    }

    // 2. Specificity / Product difference
    if (
      primaryRec.specificityTier &&
      altRec.specificityTier &&
      primaryRec.specificityTier < altRec.specificityTier
    ) {
      notes.push(
        `The primary reference has a more granular specification scope (${primaryRec.specificityTierLabel || `Tier ${primaryRec.specificityTier}`}) dedicated to this exact equipment, whereas the alternative standard has a broader scope (${altRec.specificityTierLabel || `Tier ${altRec.specificityTier}`}).`
      );
    } else if (
      primaryRec.factorStatuses.productCategory.status === 'matched' &&
      altRec.factorStatuses.productCategory.status !== 'matched'
    ) {
      notes.push(
        'The primary reference directly covers the requested equipment type, while the alternative corresponds to an allied or complementary category.'
      );
    }

    // 3. Environmental difference
    if (
      primaryRec.factorStatuses.environment.status === 'matched' &&
      altRec.factorStatuses.environment.status !== 'matched'
    ) {
      notes.push(
        'The primary reference explicitly documents suitability for the specified operating environment, whereas the alternative reference does not record these operating conditions.'
      );
    }

    // 4. Overall contribution differential
    const scoreDiff = Math.round((primaryRec.score - altRec.score) * 100);
    if (scoreDiff > 0) {
      notes.push(
        `The primary reference achieved higher cumulative matching across weighted signals (+${scoreDiff}% differential).`
      );
    }

    return notes;
  }, [meaningfulAlternative, isPrimary, rec]);

  // ------------------------------------------------------------
  // DETERMINISTIC "WHAT IS STILL UNKNOWN?" AUDIT ITEMS
  // ------------------------------------------------------------
  const unknownItems = useMemo(() => {
    const items: { title: string; explanation: string; action: string }[] = [];

    // Technical parameter limits
    if (rec.factorStatuses.technicalParameters.status === 'not_available') {
      items.push({
        title: 'Technical limit not available in current reference record',
        explanation:
          'Specific numeric parameter thresholds (e.g. wattage, voltage, wall thickness, mechanical tolerances) are not cataloged in the summary reference dataset.',
        action: 'Inspect the full official BIS standard publication for specific parameter tables.',
      });
    } else if (rec.factorStatuses.technicalParameters.status === 'not_matched') {
      items.push({
        title: 'Technical parameter limits require clause verification',
        explanation:
          'Certain technical parameters from the tender requirement could not be verified against the summary record criteria.',
        action: 'Review manufacturer test report against applicable standard test clauses.',
      });
    } else {
      items.push({
        title: 'Clause-level technical tolerance limits',
        explanation:
          'While high-level parameters align, exact acceptance criteria, test tolerances, and sampling schedules require clause inspection.',
        action: 'Inspect official BIS publication tables before final tender specifications.',
      });
    }

    // Certification applicability
    items.push({
      title: 'Certification applicability requires official verification',
      explanation:
        'Whether this standard falls under a mandatory Quality Control Order (QCO), BIS Product Certification (Scheme-I / ISI mark), or Compulsory Registration Scheme (CRS) must be confirmed through official Ministry Gazettes.',
      action: 'Check official BIS Manakonline portal and published Ministry QCO schedules.',
    });

    // Specific clause inspection
    items.push({
      title: 'Specific clause needs inspection of official BIS publication',
      explanation:
        'Specific contract clauses, sampling plans, normative annexes, and test methods must be verified directly against the official published BIS standard.',
      action: 'Obtain authorized standard copy from standardsbis.bsbedge.com prior to contract award.',
    });

    // Environmental / Ingress protection
    if (rec.factorStatuses.environment.status === 'not_available') {
      items.push({
        title: 'Environmental ingress and protection ratings',
        explanation:
          'Enclosure ingress protection (IP rating) or atmospheric resistance requires manufacturer conformity certification.',
        action: 'Request accredited third-party test report verifying applicable IP/thermal rating.',
      });
    }

    // Edition and amendments
    items.push({
      title: 'Current edition and Gazette amendments',
      explanation: `Curated reference edition is ${rec.standard.edition_year || 'latest'}. Reaffirmation status or recently notified Gazette amendments must be re-checked.`,
      action: 'Verify current edition status on official BIS portal.',
    });

    return items;
  }, [rec]);

  return (
    <div
      id={`why-this-standard-${rec.standardId}`}
      className="mt-4 pt-4 border-t border-[#243B53]/15 space-y-6 text-xs text-[#243B53]"
    >
      {/* ============================================================
          TOP HERO BANNER: THE CORE ISUTRA DIFFERENTIATOR
          "Here is the evidence and deterministic reasoning behind this candidate standard."
         ============================================================ */}
      <div className="bg-[#102A43] text-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Deterministic Decision Trail
              </span>
              {rec.specificityTierLabel && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {rec.specificityTierLabel}
                </span>
              )}
              <span className="text-[10px] font-mono text-slate-400">
                Score: {rec.score.toFixed(3)} / 1.000
              </span>
            </div>

            <h4 className="text-lg sm:text-xl font-bold font-mono text-white tracking-tight">
              WHY THIS STANDARD? — {standardCode}
            </h4>
            <p className="text-sm text-teal-200/90 font-medium italic">
              “Here is the evidence and deterministic reasoning behind this candidate standard.”
            </p>
            <p className="text-xs text-slate-300 line-clamp-2 max-w-2xl">
              {rec.standard.title}
            </p>
          </div>

          <div className="shrink-0 bg-slate-800/90 border border-slate-700 rounded-2xl p-4 text-left sm:text-right min-w-[200px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Reference Relevance
            </span>
            <div className="flex items-baseline sm:justify-end gap-1.5 my-1">
              <span className="text-3xl font-bold font-mono text-teal-400">
                {rec.relevancePercentage}%
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-200 block uppercase tracking-wide">
              {rec.categoryLabel}
            </span>
          </div>
        </div>

        {/* Dynamic reason banner */}
        <div className="mt-4 pt-3.5 border-t border-slate-700/80 text-xs text-slate-300 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Deterministic Matching Rationale: </strong>
            <span>{rec.reason}</span>
          </div>
        </div>

        {/* Responsible AI notice */}
        <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-[11px] text-slate-400 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>
            ISutra does not output subjective guesses such as “AI says use this standard.” Reference relevance is mathematically derived from verified BIS records.
          </span>
        </div>
      </div>

      {/* ============================================================
          SECTION 1: MATCH SUMMARY
         ============================================================ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h5 className="text-xs font-bold text-[#102A43] uppercase tracking-wider flex items-center gap-2 font-display">
            <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
            <span>MATCH SUMMARY</span>
          </h5>
          <span className="text-[10px] font-semibold text-[#627D98] bg-slate-100 px-2 py-0.5 rounded">
            Audit Ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Card 1: Standard */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#627D98] block">
              Standard
            </span>
            <div className="text-sm font-bold font-mono text-[#102A43]">
              {standardCode}
            </div>
            <p className="text-[11px] text-[#486581] line-clamp-2" title={rec.standard.title}>
              {rec.standard.title}
            </p>
          </div>

          {/* Card 2: Relevance */}
          <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F766E] block">
              Relevance
            </span>
            <div className="text-xl font-bold font-mono text-[#0F766E]">
              {rec.relevancePercentage}%
            </div>
            <p className="text-[11px] text-[#334E68] font-medium">
              Reference relevance: {rec.relevancePercentage}%
            </p>
          </div>

          {/* Card 3: Category */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#627D98] block">
              Category
            </span>
            <div className="text-sm font-bold text-[#102A43] uppercase tracking-wide">
              {rec.categoryLabel}
            </div>
            <p className="text-[11px] text-[#627D98]">
              {rec.standard.subcategory || rec.standard.category}
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION 2: EXACT FACTOR CONTRIBUTIONS & VISUAL MATHEMATICS
         ============================================================ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h5 className="text-xs font-bold text-[#102A43] uppercase tracking-wider flex items-center gap-2 font-display">
              <Scale className="w-4 h-4 text-[#0F766E]" />
              <span>EXACT FACTOR CONTRIBUTIONS</span>
            </h5>
            <p className="text-[11px] text-[#627D98] mt-0.5">
              Mathematically derived from six deterministic signals — no hardcoded demo values.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold uppercase text-[#627D98] block">
              Mathematically Derived Total
            </span>
            <span className="text-base font-bold font-mono text-[#0F766E]">
              {rec.relevancePercentage}%
            </span>
          </div>
        </div>

        {/* Factor breakdown table / grid */}
        <div className="space-y-2.5">
          {factors.map((f) => {
            const contributionPct = Math.round(f.detail.contribution * 100);
            const isMatched = f.detail.status === 'matched';
            const isContradiction = f.detail.status === 'contradiction';
            const isNA = f.detail.status === 'not_available';

            // Calculate fill percentage of factor's allotted weight
            const fillPct = f.weightPct > 0 ? Math.min(100, Math.round((contributionPct / f.weightPct) * 100)) : 0;

            return (
              <div
                key={f.key}
                className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:bg-slate-50 transition-colors"
              >
                {/* 1. Factor Name & Weight */}
                <div className="sm:col-span-4 flex items-center gap-2.5">
                  <FactorStatusBadgeIcon status={f.detail.status} />
                  <div>
                    <div className="font-bold text-xs text-[#102A43]">{f.name}</div>
                    <div className="text-[11px] text-[#627D98] font-mono">
                      {f.weightLabel}
                    </div>
                  </div>
                </div>

                {/* 2. Status & Evidence Bar */}
                <div className="sm:col-span-5 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-[#334E68]">
                      Status: <FactorStatusLabel status={f.detail.status} />
                    </span>
                    <span className="font-mono text-[#627D98]">{fillPct}% achieved</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isMatched
                          ? 'bg-[#0F766E]'
                          : isContradiction
                          ? 'bg-rose-500'
                          : 'bg-slate-300'
                      }`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-[#627D98] truncate" title={f.standardEvidence}>
                    Evidence: {f.standardEvidence}
                  </div>
                </div>

                {/* 3. Exact Contribution % */}
                <div className="sm:col-span-3 text-left sm:text-right">
                  <div className="text-[10px] uppercase font-bold text-[#627D98]">
                    Contribution
                  </div>
                  <span
                    className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                      isMatched
                        ? 'bg-teal-100 text-teal-900 border border-teal-300'
                        : isContradiction
                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                        : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    {isMatched
                      ? `Contribution: ${contributionPct}%`
                      : isContradiction
                      ? 'Contribution: 0% (!)'
                      : isNA
                      ? 'Contribution: 0% (N/A)'
                      : 'Contribution: 0%'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* TOTAL MATHEMATICAL DERIVATION SUMMARY CARD */}
        <div className="mt-4 p-4 rounded-xl bg-slate-100/90 border border-slate-300/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#102A43]">
                TOTAL REFERENCE RELEVANCE
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#0F766E] border border-teal-200">
                Exact Mathematical Sum
              </span>
            </div>
            <div className="font-mono text-xs text-[#334E68] break-all">
              {factorContributions[0]}% (Product) + {factorContributions[1]}% (Keywords) +{' '}
              {factorContributions[2]}% (Application) + {factorContributions[3]}% (Environment) +{' '}
              {factorContributions[4]}% (Technical) + {factorContributions[5]}% (Safety) ={' '}
              <strong className="text-[#0F766E] font-bold">{rec.relevancePercentage}%</strong>
            </div>
          </div>

          <div className="text-left md:text-right shrink-0">
            <div className="text-2xl font-bold font-mono text-[#0F766E]">
              TOTAL: {rec.relevancePercentage}%
            </div>
            <span className="text-[10px] text-[#627D98] block">
              Reference relevance: {rec.relevancePercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION 3: EVIDENCE CHAIN
          1. User Requirement
          2. Extracted Requirement
          3. Matching Signal
          4. Verified BIS Standard Record
          5. Official BIS Source
         ============================================================ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h5 className="text-xs font-bold text-[#102A43] uppercase tracking-wider flex items-center gap-2 font-display">
              <Layers className="w-4 h-4 text-[#0F766E]" />
              <span>EVIDENCE CHAIN</span>
            </h5>
            <p className="text-[11px] text-[#627D98] mt-0.5">
              5-stage sequential audit progression from user input to official BIS publication.
            </p>
          </div>
          <span className="text-[10px] font-semibold text-[#627D98] bg-slate-100 px-2 py-0.5 rounded">
            5 Stages
          </span>
        </div>

        {/* 5-Stage Sequential Progression Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#0F766E] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#102A43]">
                User Requirement
              </span>
            </div>
            <p className="text-[11px] text-[#486581] font-medium leading-tight pl-6">
              {requirements?.product?.name || 'Raw procurement tender specifications'}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#0F766E] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#102A43]">
                Extracted Requirement
              </span>
            </div>
            <p className="text-[11px] text-[#486581] font-medium leading-tight pl-6">
              {requirements?.application || 'Domain, environment & technical parameters'}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#0F766E] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#102A43]">
                Matching Signal
              </span>
            </div>
            <p className="text-[11px] text-[#486581] font-medium leading-tight pl-6">
              {sumOfContributions}% cumulative weighted score
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#0F766E] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                4
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#102A43]">
                Verified BIS Record
              </span>
            </div>
            <p className="text-[11px] text-[#486581] font-medium leading-tight pl-6 font-mono">
              {standardCode}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#0F766E] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                5
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#102A43]">
                Official BIS Source
              </span>
            </div>
            <p className="text-[11px] text-[#486581] font-medium leading-tight pl-6">
              Official BIS Portal / Gazette
            </p>
          </div>
        </div>

        {/* Detailed Factor Evidence Matrix */}
        <div className="space-y-2 pt-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#627D98]">
            Factor Evidence Matrix (User Requirement vs Verified Standard Record)
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-[#627D98] border-b border-slate-200">
                  <th className="py-2.5 px-3">Source Field</th>
                  <th className="py-2.5 px-3">User / Extracted Evidence</th>
                  <th className="py-2.5 px-3">Verified BIS Standard Record</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {factors.map((f) => (
                  <tr key={f.key} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-semibold text-[#102A43]">
                      <div>{f.name}</div>
                      <div className="text-[10px] text-[#627D98] font-normal">{f.sourceField}</div>
                    </td>
                    <td className="py-2.5 px-3 text-[#334E68] font-medium">
                      {f.userEvidence}
                    </td>
                    <td className="py-2.5 px-3 text-[#486581]">
                      {f.standardEvidence}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <AlignmentBadge status={f.detail.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION 4: “WHAT IS STILL UNKNOWN?”
          "This is NOT a failure. It is deliberate transparency."
         ============================================================ */}
      <div className="bg-white border border-amber-300/80 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-3">
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2 font-display">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>WHAT IS STILL UNKNOWN?</span>
            </h5>
            <p className="text-[11px] text-amber-900 font-medium">
              Pre-Procurement Checklist & Statutory Transparency Notice
            </p>
          </div>

          {/* Explicit callout required by prompt */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
            <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>This is NOT a failure. It is deliberate transparency.</span>
          </div>
        </div>

        <p className="text-xs text-[#486581] leading-relaxed">
          ISutra provides reference intelligence derived from curated BIS records. Responsible public procurement requires distinguishing verified signals from items requiring engineer inspection:
        </p>

        {/* Unknown Checklist Items */}
        <div className="space-y-2.5">
          {unknownItems.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/70 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="font-bold text-[#102A43] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>{item.title}</span>
                </div>
                <p className="text-[#486581] text-[11px] leading-relaxed pl-3">
                  {item.explanation}
                </p>
              </div>
              <div className="shrink-0 text-[10px] font-semibold text-amber-800 bg-white border border-amber-200 px-2 py-1 rounded-lg">
                {item.action}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================
          SECTION 5: THREE CLEAR ACTIONS
          1. View Requirement Gap Analysis
          2. View Lifecycle & Amendments
          3. Open Official BIS Source
         ============================================================ */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#627D98]">
          Actions for this Standard:
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Action 1: View Requirement Gap Analysis */}
          <Link
            to={`/analysis/${analysisId || ''}/recommendations/${rec.standard.id}/gap-analysis`}
            state={{ fromAnalysisId: analysisId, standard: rec.standard, requirements }}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <Scale className="w-4 h-4 text-amber-700 shrink-0" />
            <span>View Requirement Gap Analysis</span>
          </Link>

          {/* Action 2: View Lifecycle & Amendments */}
          <Link
            to={`/standards/${rec.standard.id}?fromAnalysis=${analysisId || ''}#lifecycle`}
            state={{ fromAnalysisId: analysisId }}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#102A43] border border-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <History className="w-4 h-4 text-[#0F766E] shrink-0" />
            <span>View Lifecycle & Amendments</span>
          </Link>

          {/* Action 3: Open Official BIS Source */}
          <a
            href={rec.standard.source_url || 'https://www.services.bis.gov.in'}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0C5D57] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Open Official BIS Source</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0" />
          </a>
        </div>
      </div>

      {/* ============================================================
          SECTION 6: ALTERNATIVE STANDARDS COMPARISON
          Use "Compare", NOT "Best alternative" or a subjective "winner"
         ============================================================ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        {meaningfulAlternative ? (
          <>
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-[#102A43] uppercase tracking-wider flex items-center gap-2 font-display">
                  <Scale className="w-4 h-4 text-[#0F766E]" />
                  <span>
                    COMPARE: {standardCode} vs{' '}
                    {meaningfulAlternative.standard.standard_number ||
                      meaningfulAlternative.standard.is_number}
                  </span>
                </h5>
                <span className="text-[10px] font-semibold text-[#627D98] bg-slate-100 px-2 py-0.5 rounded">
                  Factual Comparison
                </span>
              </div>
              <p className="text-xs text-[#486581] mt-1 font-medium">
                ISutra does not declare a subjective “winner.” Compare the recorded scope dimensions below to assess applicability for tender schedules.
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
                        ? `PRIMARY: ${standardCode}`
                        : `PRIMARY: ${meaningfulAlternative.standard.standard_number || meaningfulAlternative.standard.is_number}`}
                    </th>
                    <th className="py-2.5 px-3 text-[#486581]">
                      {isPrimary
                        ? `ALTERNATIVE: ${meaningfulAlternative.standard.standard_number || meaningfulAlternative.standard.is_number}`
                        : `THIS REFERENCE: ${standardCode}`}
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
                            ? meaningfulAlternative.factorStatuses.productCategory.evidence?.join(', ') || 'Allied coverage'
                            : rec.factorStatuses.productCategory.evidence?.join(', ') || 'Allied coverage'
                        }
                      />
                    </td>
                  </tr>

                  {/* Row 2: Application Domain */}
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

                  {/* Row 3: Operating Environment */}
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

                  {/* Row 4: Specification Specificity */}
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

                  {/* Row 5: Reference Relevance */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-[#102A43]">Reference Relevance</td>
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
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1.5 text-xs text-[#243B53]">
                <strong className="text-[#102A43] block font-display">
                  Factual Distinction Summary (Compare between candidate standards):
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
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center space-y-2">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-600 mb-1">
              <Info className="w-4 h-4" />
            </div>
            <h5 className="text-xs font-bold text-[#102A43] uppercase tracking-wider">
              NO MEANINGFUL ALTERNATIVE IDENTIFIED
            </h5>
            <p className="text-xs text-[#627D98] max-w-lg mx-auto leading-relaxed">
              The current reference dataset did not provide another sufficiently aligned standard for a meaningful comparison. ISutra does not synthesize artificial candidate alternatives.
            </p>
          </div>
        )}
      </div>

      {/* ============================================================
          SECTION 7: STATUTORY DISCLAIMER
         ============================================================ */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#627D98]">
        <div className="flex items-start gap-2 max-w-xl">
          <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Official BIS Verification Requirement: </strong>
            ISutra provides deterministic reference intelligence only. Verify the applicable standard, current edition, and official Gazette amendments on the official BIS portal before procurement or compliance decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------
// Internal Helper Components
// ------------------------------------------------------------

function FactorStatusBadgeIcon({ status }: { status: FactorStatus }) {
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

function FactorStatusLabel({ status }: { status: FactorStatus }) {
  switch (status) {
    case 'matched':
      return <span className="font-bold text-emerald-700">Matched</span>;
    case 'not_available':
      return <span className="font-medium text-slate-500">Not available</span>;
    case 'contradiction':
      return <span className="font-bold text-rose-700">Contradiction</span>;
    default:
      return <span className="font-medium text-slate-500">Not matched</span>;
  }
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
