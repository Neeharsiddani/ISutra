// ============================================================
// ISutra: Phase 4 — Intelligent BIS Standards Matching Engine
// Specificity-Aware Deterministic Multi-Signal Scoring Engine
// ============================================================

import { VERIFIED_BIS_STANDARDS, VerifiedStandard } from '../database/verifiedStandards';
import type { StructuredRequirements } from './ai/types';

export interface MatchingWeights {
  productCategory: number;     // 30%
  keywordsTitleScope: number;  // 25%
  application: number;         // 15%
  environment: number;         // 10%
  technicalParameters: number; // 10%
  safetyTesting: number;       // 10%
}

export const DEFAULT_MATCHING_WEIGHTS: MatchingWeights = {
  productCategory: 0.30,
  keywordsTitleScope: 0.25,
  application: 0.15,
  environment: 0.10,
  technicalParameters: 0.10,
  safetyTesting: 0.10,
};

export type FactorStatus = 'matched' | 'not_matched' | 'not_available';

export interface FactorDetail {
  status: FactorStatus;
  score: number;        // Subscore 0.0 to 1.0 for this factor
  weight: number;       // Weight applied (e.g. 0.30)
  contribution: number; // score * weight
  evidence: string[];   // Specific matching terms or explanation
  label: string;
}

export interface MatchedFactorsSummary {
  productCategory: boolean;
  keywords: string[];
  application: string[];
  environment: string[];
  technicalParameters: string[];
  safetyTesting: string[];
}

export type RecommendationCategory = 'high' | 'related' | 'low';
export type RecommendationCategoryLabel = 'HIGH RELEVANCE' | 'RELATED' | 'LOW RELEVANCE';

// ============================================================
// Phase 5: Evidence, Traceability & Trust Models
// ============================================================

export type EvidenceSourceType =
  | 'user_requirement'
  | 'extracted_requirement'
  | 'standard_data'
  | 'official_bis_source';

export interface MatchEvidenceItem {
  sourceType: EvidenceSourceType;
  label: string;
  value: string;
  matched: boolean;
  field?: string;
}

export type TraceabilityStage =
  | 'user_input'
  | 'extracted_requirement'
  | 'matching_signal'
  | 'bis_standard'
  | 'official_bis_source';

export interface TraceabilityChainStep {
  step: number;
  stage: TraceabilityStage;
  title: string;
  description: string;
  sourceType: EvidenceSourceType;
  badge?: string;
}

export interface RequirementStandardComparison {
  field: string;
  requirementValue: string | null;
  standardValue: string | null;
  status: FactorStatus;
  note?: string;
}

export interface StandardRecommendation {
  rank: number;
  standardId: string;
  standard: VerifiedStandard;
  score: number;                 // Normalized total score 0.00 - 1.00
  relevancePercentage: number;  // Rounded integer 0 - 100
  category: RecommendationCategory;
  categoryLabel: RecommendationCategoryLabel;
  matchedFactors: MatchedFactorsSummary;
  factorStatuses: {
    productCategory: FactorDetail;
    keywordsTitleScope: FactorDetail;
    application: FactorDetail;
    environment: FactorDetail;
    technicalParameters: FactorDetail;
    safetyTesting: FactorDetail;
  };
  reason: string;
  evidence: MatchEvidenceItem[];
  traceabilityChain: TraceabilityChainStep[];
  comparison: RequirementStandardComparison[];
}

export interface MatchingResult {
  success: boolean;
  recommendations: StandardRecommendation[];
  metadata: {
    standardsEvaluated: number;
    matchingMethod: string;
    minimumThreshold: number;
    insufficientInformation: boolean;
    insufficientReason?: string;
    guidance?: string[];
    weightsUsed: MatchingWeights;
    timestamp: string;
    datasetName: string;
    datasetCount: number;
    sourceProvenance: string;
    disclaimer: string;
  };
}

export interface MatchingOptions {
  minScoreThreshold?: number;
  limit?: number;
  weights?: Partial<MatchingWeights>;
}

// ------------------------------------------------------------
// Domain Synonyms & Multi-Word Phrases
// ------------------------------------------------------------

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'for', 'in', 'on', 'with', 'to', 'at',
  'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
  'has', 'had', 'do', 'does', 'did', 'but', 'if', 'then', 'else', 'when', 'up',
  'down', 'out', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some',
  'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'requirement', 'system',
  'item', 'supply', 'installation', 'provide', 'required', 'suitable', 'need',
]);

// Carefully separated synonym groups to preserve product-form distinctions
const DOMAIN_SYNONYM_GROUPS: string[][] = [
  // 1. Luminaires (complete lighting fittings/units)
  ['luminaire', 'luminaires', 'light fitting', 'light fittings', 'lighting fixture', 'lighting fixtures'],
  // 2. Road and Street Lighting specific
  ['street light', 'street lights', 'street lighting', 'road lighting', 'street luminaire', 'road luminaire', 'street lamp', 'public lighting'],
  // 3. LED Lamps / Bulbs (light source components)
  ['led lamp', 'led lamps', 'self-ballasted lamp', 'self-ballasted led', 'bulb', 'bulbs', 'led bulb'],
  // 4. LED Modules (light engine components)
  ['led module', 'led modules', 'led light engine'],
  // 5. LED general technology
  ['led', 'light emitting diode', 'solid state lighting', 'ssl'],
  // 6. Cables & Wires
  ['cable', 'cables', 'electrical cable', 'power cable', 'wire', 'wires', 'conductor', 'conductors'],
  // 7. Thermal / High Temperature
  ['high temperature', 'heat resistant', 'high temp', 'thermal resistant', 'flame retardant', 'fire survival'],
  // 8. Concrete
  ['concrete', 'cement concrete', 'reinforced concrete', 'rcc', 'plain concrete', 'prestressed concrete'],
  // 9. Reinforcement steel
  ['reinforcement', 'reinforcing steel', 'rebar', 'steel bar', 'steel bars', 'tmt bar', 'tmt bars', 'ribbed bar'],
  // 10. Structural steel
  ['structural steel', 'steel section', 'steel sections', 'rolled steel'],
  // 11. Aggregate
  ['aggregate', 'aggregates', 'coarse aggregate', 'fine aggregate', 'crushed stone'],
  // 12. Brick
  ['brick', 'bricks', 'clay brick', 'fly ash brick', 'masonry block'],
  // 13. Cement
  ['cement', 'portland cement', 'opc', 'ppc', 'hydraulic cement'],
  // 14. Water storage
  ['water tank', 'water storage', 'water retaining', 'liquid storage'],
  // 15. PPE
  ['ppe', 'personal protective equipment', 'protective equipment', 'safety gear'],
  ['safety footwear', 'safety shoe', 'safety shoes', 'safety boot', 'protective footwear'],
  ['helmet', 'helmets', 'safety helmet', 'industrial helmet', 'hard hat'],
  // 16. Environments
  ['outdoor', 'weather resistant', 'weatherproof', 'external', 'exterior', 'ambient'],
  ['indoor', 'internal', 'interior', 'domestic'],
];

// Meaningful multi-word phrases that represent specific domain concepts
export const DOMAIN_PHRASES: string[] = [
  'led street light', 'led street lights', 'led street lighting',
  'street light', 'street lights', 'street lighting',
  'road lighting', 'road luminaire', 'street luminaire',
  'municipal road', 'municipal lighting', 'pole mounted',
  'led luminaire', 'led luminaires',
  'floodlight', 'floodlights', 'floodlighting',
  'emergency lighting', 'handlamp', 'handlamps',
  'led lamp', 'led lamps', 'self ballasted', 'self-ballasted',
  'led module', 'led modules',
  'photometric measurement', 'general lighting services',
  'electrical cable', 'power cable', 'heavy duty cable', 'pvc cable', 'xlpe cable',
  'high temperature cable', 'control cable', 'rubber insulated',
  'reinforced concrete', 'reinforcing steel', 'plain concrete',
  'structural steel', 'coarse aggregate', 'fly ash brick', 'burnt clay brick',
  'safety footwear', 'safety helmet', 'protective clothing',
];

// Normalize single token: strip non-alphanumeric, lowercase, remove plural 's' if > 3 chars
export function normalizeToken(token: string): string {
  const clean = token.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean.length > 3 && clean.endsWith('s') && !clean.endsWith('ss')) {
    return clean.slice(0, -1);
  }
  return clean;
}

// Tokenize text into normalized tokens, filtering stopwords
export function tokenize(text: string): string[] {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter(Boolean);

  const tokens: string[] = [];
  for (const w of words) {
    if (!STOPWORDS.has(w) && w.length > 1) {
      tokens.push(normalizeToken(w));
    }
  }
  return Array.from(new Set(tokens));
}

// Extract matched multi-word domain phrases from text
export function extractPhrases(text: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const matched: string[] = [];
  for (const phrase of DOMAIN_PHRASES) {
    if (lower.includes(phrase)) {
      matched.push(phrase);
    }
  }
  return matched;
}

// Check synonym match between two terms
export function matchesSynonym(termA: string, termB: string): boolean {
  const aNorm = termA.toLowerCase().trim();
  const bNorm = termB.toLowerCase().trim();
  if (aNorm === bNorm) return true;
  if (normalizeToken(aNorm) === normalizeToken(bNorm)) return true;

  for (const group of DOMAIN_SYNONYM_GROUPS) {
    const hasA = group.some((g) => aNorm === g || aNorm.includes(g) || g.includes(aNorm));
    const hasB = group.some((g) => bNorm === g || bNorm.includes(g) || g.includes(bNorm));
    if (hasA && hasB) return true;
  }
  return false;
}

// Check whether requirement text is completely vague/uninformative
export function checkVagueInput(reqs: StructuredRequirements): {
  isVague: boolean;
  reason?: string;
  missingFields?: string[];
} {
  const prodName = (reqs.product?.name || '').trim().toLowerCase();
  const prodCat = (reqs.product?.category || '').trim().toLowerCase();
  const app = (reqs.application || '').trim().toLowerCase();
  const paramCount = (reqs.technical_parameters || []).length;
  const envCount = (reqs.environment || []).length;

  const vagueTerms = [
    'something', 'need something', 'anything', 'project', 'item', 'items',
    'general', 'test', 'unknown', 'procurement', 'material', 'product',
  ];

  const isNameVague = !prodName || vagueTerms.some((t) => prodName === t || prodName === `need ${t}`);
  const hasNoCategory = !prodCat || prodCat === 'unspecified' || prodCat === 'general';
  const hasNoApplication = !app;
  const hasNoParams = paramCount === 0;
  const hasNoEnv = envCount === 0;

  if (isNameVague && hasNoCategory && hasNoApplication && hasNoParams && hasNoEnv) {
    return {
      isVague: true,
      reason: 'The procurement specification is too vague or generic to identify relevant Indian Standards.',
      missingFields: [
        'Product Name or Category (e.g. LED Street Light, XLPE Power Cable, Reinforced Concrete)',
        'Application Domain (e.g. Municipal road lighting, High-voltage distribution, Building foundation)',
        'Technical Parameters (e.g. 100W, 11kV, M25 grade, IP65 rating)',
        'Environmental Conditions (e.g. Outdoor, High temperature, Corrosive, Underground)',
      ],
    };
  }

  return { isVague: false };
}

// ------------------------------------------------------------
// Core Matcher Class
// ------------------------------------------------------------

export class StandardsMatcher {
  private weights: MatchingWeights;

  constructor(weights?: Partial<MatchingWeights>) {
    this.weights = { ...DEFAULT_MATCHING_WEIGHTS, ...weights };
  }

  /**
   * Evaluate structured requirements against the 40 verified BIS standards
   */
  public evaluate(
    requirements: StructuredRequirements,
    standards: VerifiedStandard[] = VERIFIED_BIS_STANDARDS,
    options: MatchingOptions = {}
  ): MatchingResult {
    // Specificity-aware default minimum threshold
    const minThreshold = options.minScoreThreshold ?? 0.30;
    const limit = options.limit ?? 8; // Prefer 3–8 useful results as instructed

    // Check for vague input
    const vagueCheck = checkVagueInput(requirements);
    if (vagueCheck.isVague) {
      return {
        success: true,
        recommendations: [],
        metadata: {
          standardsEvaluated: standards.length,
          matchingMethod: 'Explainable Specificity-Aware Multi-Signal Matching',
          minimumThreshold: minThreshold,
          insufficientInformation: true,
          insufficientReason: vagueCheck.reason,
          guidance: vagueCheck.missingFields,
          weightsUsed: this.weights,
          timestamp: new Date().toISOString(),
          datasetName: 'ISutra Verified BIS Reference Dataset',
          datasetCount: standards.length,
          sourceProvenance: 'Official Bureau of Indian Standards (BIS) Reference Records',
          disclaimer:
            'ISutra is an SIH research prototype. Recommendations are based on the current reference dataset and should be independently verified against official BIS publications before procurement or compliance decisions.',
        },
      };
    }

    // Extract requirement tokens, phrases & context
    const reqContext = this.extractRequirementContext(requirements);

    const scoredList: Array<ReturnType<typeof this.evaluateStandard>> = [];

    for (const standard of standards) {
      const evaluation = this.evaluateStandard(requirements, reqContext, standard);
      if (evaluation.score >= minThreshold) {
        scoredList.push(evaluation);
      }
    }

    // Sort descending by score, then ascending by standard_number
    scoredList.sort((a, b) => {
      if (Math.abs(b.score - a.score) > 0.001) {
        return b.score - a.score;
      }
      return a.standard.standard_number.localeCompare(b.standard.standard_number);
    });

    // Dynamic quality filtering: If strong matches exist (score >= 0.50),
    // eliminate distant low-scoring noise (< 0.35) so only genuinely useful results remain
    const topScore = scoredList.length > 0 ? scoredList[0].score : 0;
    const filteredList = scoredList.filter((item) => {
      if (topScore >= 0.50) {
        return item.score >= 0.35;
      }
      return true;
    });

    const paginated = filteredList.slice(0, limit);

    const recommendations: StandardRecommendation[] = paginated.map((item, idx) => ({
      rank: idx + 1,
      standardId: item.standard.id,
      standard: item.standard,
      score: Math.round(item.score * 100) / 100,
      relevancePercentage: Math.round(item.score * 100),
      category: item.category,
      categoryLabel: item.categoryLabel,
      matchedFactors: item.matchedFactors,
      factorStatuses: item.factorStatuses,
      reason: item.reason,
      evidence: item.evidence,
      traceabilityChain: item.traceabilityChain,
      comparison: item.comparison,
    }));

    return {
      success: true,
      recommendations,
      metadata: {
        standardsEvaluated: standards.length,
        matchingMethod: 'Explainable Specificity-Aware Multi-Signal Matching',
        minimumThreshold: minThreshold,
        insufficientInformation: recommendations.length === 0,
        insufficientReason:
          recommendations.length === 0
            ? 'ISutra could not identify enough procurement information to produce a reliable standard recommendation.'
            : undefined,
        guidance:
          recommendations.length === 0
            ? [
                'Product or equipment category (e.g., LED Street Lighting, Low Voltage Cables, Structural Concrete, Safety Helmets).',
                'Intended application environment (e.g., Highway / Municipal roads, Industrial power distribution, Underground burial).',
                'Technical parameter ratings (e.g., Power in Watts, Voltage Grade, Capacity, Conductor material).',
                'Installation and environmental conditions (e.g., Outdoor, Weather resistant, High temperature, Pole mounted).',
              ]
            : undefined,
        weightsUsed: this.weights,
        timestamp: new Date().toISOString(),
        datasetName: 'ISutra Verified BIS Reference Dataset',
        datasetCount: standards.length,
        sourceProvenance: 'Official Bureau of Indian Standards (BIS) Reference Records',
        disclaimer:
          'ISutra is an SIH research prototype. Recommendations are based on the current reference dataset and should be independently verified against official BIS publications before procurement or compliance decisions.',
      },
    };
  }

  // ------------------------------------------------------------
  // Internal Helper: Extract Requirement Context
  // ------------------------------------------------------------
  private extractRequirementContext(reqs: StructuredRequirements) {
    const prodName = reqs.product?.name || '';
    const prodCat = reqs.product?.category || '';
    const appStr = reqs.application || '';
    const indStr = reqs.industry || '';

    const productTokens = tokenize(prodName);
    const categoryTokens = tokenize(prodCat);
    const appTokens = tokenize(appStr);
    const industryTokens = tokenize(indStr);

    const envTokens = (reqs.environment || []).flatMap((e) => tokenize(e.name));
    const paramTokens = (reqs.technical_parameters || []).flatMap((p) => [
      ...tokenize(p.parameter),
      ...tokenize(p.value),
    ]);
    const materialTokens = (reqs.materials || []).flatMap((m) => tokenize(m.name));
    const safetyTokens = (reqs.safety_requirements || []).flatMap((s) => tokenize(s.name));
    const testingTokens = (reqs.testing_requirements || []).flatMap((t) => tokenize(t.name));

    // Multi-word phrase extraction
    const fullText = `${prodName} ${prodCat} ${appStr} ${indStr} ${reqs.product?.source_text || ''}`;
    const phrases = extractPhrases(fullText);

    // Identify requirement domain
    const isLighting =
      fullText.toLowerCase().includes('light') ||
      fullText.toLowerCase().includes('led') ||
      fullText.toLowerCase().includes('luminaire') ||
      fullText.toLowerCase().includes('lamp');

    const isCable =
      fullText.toLowerCase().includes('cable') ||
      fullText.toLowerCase().includes('wire') ||
      fullText.toLowerCase().includes('conductor');

    const isConstruction =
      fullText.toLowerCase().includes('concrete') ||
      fullText.toLowerCase().includes('steel') ||
      fullText.toLowerCase().includes('cement') ||
      fullText.toLowerCase().includes('aggregate') ||
      fullText.toLowerCase().includes('brick') ||
      fullText.toLowerCase().includes('rebar');

    const isSafety =
      fullText.toLowerCase().includes('helmet') ||
      fullText.toLowerCase().includes('shoe') ||
      fullText.toLowerCase().includes('footwear') ||
      fullText.toLowerCase().includes('ppe') ||
      fullText.toLowerCase().includes('respiratory') ||
      fullText.toLowerCase().includes('protective');

    const allTokens = Array.from(
      new Set([
        ...productTokens,
        ...categoryTokens,
        ...appTokens,
        ...industryTokens,
        ...envTokens,
        ...paramTokens,
        ...materialTokens,
        ...safetyTokens,
        ...testingTokens,
      ])
    );

    return {
      product: productTokens,
      category: categoryTokens,
      application: appTokens,
      environment: envTokens,
      parameters: paramTokens,
      materials: materialTokens,
      safety: safetyTokens,
      testing: testingTokens,
      all: allTokens,
      phrases,
      domains: { isLighting, isCable, isConstruction, isSafety },
      fullText: fullText.toLowerCase(),
    };
  }

  // ------------------------------------------------------------
  // Internal Helper: Evaluate Individual Standard
  // ------------------------------------------------------------
  private evaluateStandard(
    reqs: StructuredRequirements,
    reqContext: ReturnType<typeof this.extractRequirementContext>,
    standard: VerifiedStandard
  ) {
    // 1. PRODUCT & CATEGORY MATCH (30%)
    const prodFactor = this.matchProductCategory(reqs, reqContext, standard);

    // 2. KEYWORD / TITLE / SCOPE MATCH (25%)
    const kwFactor = this.matchKeywordsTitleScope(reqs, reqContext, standard);

    // 3. APPLICATION MATCH (15%)
    const appFactor = this.matchApplication(reqs, reqContext, standard);

    // 4. ENVIRONMENT MATCH (10%)
    const envFactor = this.matchEnvironment(reqs, reqContext, standard);

    // 5. TECHNICAL PARAMETERS MATCH (10%)
    const paramFactor = this.matchTechnicalParameters(reqs, reqContext, standard);

    // 6. SAFETY & TESTING MATCH (10%)
    const safetyFactor = this.matchSafetyTesting(reqs, reqContext, standard);

    // Compute total weighted score
    const totalScore =
      prodFactor.contribution +
      kwFactor.contribution +
      appFactor.contribution +
      envFactor.contribution +
      paramFactor.contribution +
      safetyFactor.contribution;

    // Categorization according to strict quality thresholds
    let category: RecommendationCategory = 'low';
    let categoryLabel: RecommendationCategoryLabel = 'LOW RELEVANCE';

    if (totalScore >= 0.55 && prodFactor.status === 'matched') {
      category = 'high';
      categoryLabel = 'HIGH RELEVANCE';
    } else if (totalScore >= 0.35) {
      category = 'related';
      categoryLabel = 'RELATED';
    }

    const matchedFactorsSummary: MatchedFactorsSummary = {
      productCategory: prodFactor.status === 'matched',
      keywords: kwFactor.evidence,
      application: appFactor.evidence,
      environment: envFactor.evidence,
      technicalParameters: paramFactor.evidence,
      safetyTesting: safetyFactor.evidence,
    };

    const factorStatuses = {
      productCategory: prodFactor,
      keywordsTitleScope: kwFactor,
      application: appFactor,
      environment: envFactor,
      technicalParameters: paramFactor,
      safetyTesting: safetyFactor,
    };

    const reason = this.generateDynamicReason(standard, category, factorStatuses, reqs);
    const evidence = this.generateMatchEvidence(reqs, standard, factorStatuses);
    const traceabilityChain = this.generateTraceabilityChain(reqs, standard, factorStatuses, totalScore);
    const comparison = this.generateRequirementComparison(reqs, standard, factorStatuses);

    return {
      standard,
      score: Math.min(1.0, totalScore),
      category,
      categoryLabel,
      matchedFactors: matchedFactorsSummary,
      factorStatuses,
      reason,
      evidence,
      traceabilityChain,
      comparison,
    };
  }

  // ------------------------------------------------------------
  // Phase 5: Structured Evidence Generator
  // ------------------------------------------------------------
  private generateMatchEvidence(
    reqs: StructuredRequirements,
    standard: VerifiedStandard,
    factorStatuses: StandardRecommendation['factorStatuses']
  ): MatchEvidenceItem[] {
    const evidence: MatchEvidenceItem[] = [];

    // 1. User & Extracted Product Requirement
    const userProdText = reqs.product?.source_text || reqs.product?.name;
    if (userProdText) {
      evidence.push({
        sourceType: 'user_requirement',
        label: 'User Product Specification',
        value: `"${userProdText}"`,
        matched: true,
        field: 'product_source',
      });
    }

    if (reqs.product?.name) {
      evidence.push({
        sourceType: 'extracted_requirement',
        label: 'Extracted Product Entity',
        value: reqs.product.name,
        matched: factorStatuses.productCategory.status === 'matched',
        field: 'product_name',
      });
    }

    // Standard Product Classification
    evidence.push({
      sourceType: 'standard_data',
      label: 'Standard Classification',
      value: `${standard.category} → ${standard.subcategory}`,
      matched: factorStatuses.productCategory.status === 'matched',
      field: 'standard_category',
    });

    if (standard.product_types && standard.product_types.length > 0) {
      evidence.push({
        sourceType: 'standard_data',
        label: 'Standard Product Types',
        value: standard.product_types.join(', '),
        matched: factorStatuses.productCategory.status === 'matched',
        field: 'product_types',
      });
    }

    // 2. Application
    if (reqs.application) {
      if (reqs.application_source) {
        evidence.push({
          sourceType: 'user_requirement',
          label: 'User Application Input',
          value: `"${reqs.application_source}"`,
          matched: true,
          field: 'application_source',
        });
      }
      evidence.push({
        sourceType: 'extracted_requirement',
        label: 'Extracted Application Context',
        value: reqs.application,
        matched: factorStatuses.application.status === 'matched',
        field: 'application',
      });
      evidence.push({
        sourceType: 'standard_data',
        label: 'Standard Application Scope',
        value: standard.subcategory || standard.category,
        matched: factorStatuses.application.status === 'matched',
        field: 'standard_application',
      });
    }

    // 3. Environmental Conditions
    if (reqs.environment && reqs.environment.length > 0) {
      for (const env of reqs.environment) {
        if (env.source_text) {
          evidence.push({
            sourceType: 'user_requirement',
            label: 'User Environment Input',
            value: `"${env.source_text}"`,
            matched: true,
            field: 'environment_source',
          });
        }
        evidence.push({
          sourceType: 'extracted_requirement',
          label: 'Extracted Environment Condition',
          value: env.name,
          matched: factorStatuses.environment.status === 'matched',
          field: 'environment',
        });
      }
      if (factorStatuses.environment.status === 'matched') {
        evidence.push({
          sourceType: 'standard_data',
          label: 'Standard Environment Context',
          value: factorStatuses.environment.evidence[0] || 'Outdoor / Environmental suitability',
          matched: true,
          field: 'standard_environment',
        });
      } else {
        evidence.push({
          sourceType: 'standard_data',
          label: 'Standard Environment Context',
          value: 'Not available in current standard record',
          matched: false,
          field: 'standard_environment',
        });
      }
    }

    // 4. Keywords & Scope Evidence
    if (factorStatuses.keywordsTitleScope.evidence.length > 0) {
      evidence.push({
        sourceType: 'standard_data',
        label: 'Matched Scope & Keywords',
        value: factorStatuses.keywordsTitleScope.evidence.join(', '),
        matched: true,
        field: 'keywords_scope',
      });
    }

    // 5. Technical Parameters
    if (reqs.technical_parameters && reqs.technical_parameters.length > 0) {
      for (const param of reqs.technical_parameters) {
        evidence.push({
          sourceType: 'extracted_requirement',
          label: `Extracted Parameter: ${param.parameter}`,
          value: `${param.value}${param.unit ? ' ' + param.unit : ''}`,
          matched: factorStatuses.technicalParameters.status === 'matched',
          field: 'technical_parameters',
        });
      }
      evidence.push({
        sourceType: 'standard_data',
        label: 'Standard Parameter Limits',
        value:
          factorStatuses.technicalParameters.status === 'matched'
            ? factorStatuses.technicalParameters.evidence.join(', ')
            : 'Not available in current standard record',
        matched: factorStatuses.technicalParameters.status === 'matched',
        field: 'standard_parameters',
      });
    }

    // 6. Safety & Testing
    const safetyItems = [
      ...(reqs.safety_requirements || []).map((s) => s.name),
      ...(reqs.testing_requirements || []).map((t) => t.name),
    ];
    if (safetyItems.length > 0) {
      evidence.push({
        sourceType: 'extracted_requirement',
        label: 'Extracted Safety / Testing',
        value: safetyItems.join(', '),
        matched: factorStatuses.safetyTesting.status === 'matched',
        field: 'safety_testing',
      });
      evidence.push({
        sourceType: 'standard_data',
        label: 'Standard Safety / Test Clauses',
        value:
          factorStatuses.safetyTesting.status === 'matched'
            ? factorStatuses.safetyTesting.evidence.join(', ')
            : 'Not available in current standard record',
        matched: factorStatuses.safetyTesting.status === 'matched',
        field: 'standard_safety',
      });
    }

    // 7. Official BIS Source
    evidence.push({
      sourceType: 'official_bis_source',
      label: 'Official BIS Reference Source',
      value: standard.source_url || 'https://www.bis.gov.in',
      matched: true,
      field: 'official_source',
    });

    return evidence;
  }

  // ------------------------------------------------------------
  // Phase 5: Traceability Chain Generator
  // ------------------------------------------------------------
  private generateTraceabilityChain(
    reqs: StructuredRequirements,
    standard: VerifiedStandard,
    factorStatuses: StandardRecommendation['factorStatuses'],
    score: number
  ): TraceabilityChainStep[] {
    // 1. User Input Stage
    const userSnippets: string[] = [];
    if (reqs.product?.source_text) userSnippets.push(`"${reqs.product.source_text}"`);
    if (reqs.application_source) userSnippets.push(`"${reqs.application_source}"`);
    (reqs.environment || []).forEach((e) => {
      if (e.source_text) userSnippets.push(`"${e.source_text}"`);
    });
    const userInputSummary =
      userSnippets.length > 0 ? userSnippets.join(', ') : 'Procurement technical specification';

    // 2. Extracted Requirements Stage
    const extractedParts: string[] = [];
    if (reqs.product?.name) extractedParts.push(`Product: ${reqs.product.name}`);
    if (reqs.application) extractedParts.push(`Application: ${reqs.application}`);
    if (reqs.environment && reqs.environment.length > 0) {
      extractedParts.push(`Environment: ${reqs.environment.map((e) => e.name).join(', ')}`);
    }
    const extractedSummary = extractedParts.join(' | ');

    // 3. Matching Signal Stage
    const signals: string[] = [];
    if (factorStatuses.productCategory.status === 'matched') {
      signals.push(`Product (+${Math.round(factorStatuses.productCategory.contribution * 100)}%)`);
    }
    if (factorStatuses.keywordsTitleScope.status === 'matched') {
      signals.push(`Keywords (+${Math.round(factorStatuses.keywordsTitleScope.contribution * 100)}%)`);
    }
    if (factorStatuses.application.status === 'matched') {
      signals.push(`Application (+${Math.round(factorStatuses.application.contribution * 100)}%)`);
    }
    if (factorStatuses.environment.status === 'matched') {
      signals.push(`Environment (+${Math.round(factorStatuses.environment.contribution * 100)}%)`);
    }
    if (factorStatuses.technicalParameters.status === 'matched') {
      signals.push(`Parameters (+${Math.round(factorStatuses.technicalParameters.contribution * 100)}%)`);
    }
    if (factorStatuses.safetyTesting.status === 'matched') {
      signals.push(`Safety (+${Math.round(factorStatuses.safetyTesting.contribution * 100)}%)`);
    }
    const matchingSummary =
      signals.length > 0 ? signals.join(', ') : 'Base category classification alignment';

    return [
      {
        step: 1,
        stage: 'user_input',
        title: 'USER REQUIREMENT',
        description: userInputSummary,
        sourceType: 'user_requirement',
        badge: 'Raw Input',
      },
      {
        step: 2,
        stage: 'extracted_requirement',
        title: 'EXTRACTED REQUIREMENT',
        description: extractedSummary,
        sourceType: 'extracted_requirement',
        badge: 'Structured Signal',
      },
      {
        step: 3,
        stage: 'matching_signal',
        title: 'MATCHING SIGNAL',
        description: `${matchingSummary} → Total Relevance: ${Math.round(score * 100)}%`,
        sourceType: 'standard_data',
        badge: `${Math.round(score * 100)}% Score`,
      },
      {
        step: 4,
        stage: 'bis_standard',
        title: 'STANDARD DATA',
        description: `${standard.standard_number}: "${standard.title}"`,
        sourceType: 'standard_data',
        badge: 'Verified Record',
      },
      {
        step: 5,
        stage: 'official_bis_source',
        title: 'OFFICIAL BIS SOURCE',
        description: standard.source_url || 'https://www.bis.gov.in',
        sourceType: 'official_bis_source',
        badge: 'Official Portal',
      },
    ];
  }

  // ------------------------------------------------------------
  // Phase 5: Requirement vs Standard Comparison Generator
  // ------------------------------------------------------------
  private generateRequirementComparison(
    reqs: StructuredRequirements,
    standard: VerifiedStandard,
    factorStatuses: StandardRecommendation['factorStatuses']
  ): RequirementStandardComparison[] {
    const comparisons: RequirementStandardComparison[] = [];

    // 1. Product / Classification
    comparisons.push({
      field: 'Product / System',
      requirementValue: reqs.product?.name || 'Unspecified Product',
      standardValue:
        standard.product_types && standard.product_types.length > 0
          ? standard.product_types.join(', ')
          : standard.subcategory || standard.title,
      status: factorStatuses.productCategory.status,
      note:
        factorStatuses.productCategory.status === 'matched'
          ? 'Classification alignment confirmed'
          : undefined,
    });

    // 2. Application Domain
    const hasReqApp = Boolean(reqs.application);
    comparisons.push({
      field: 'Application Domain',
      requirementValue: reqs.application || null,
      standardValue:
        factorStatuses.application.status === 'matched'
          ? standard.subcategory || standard.category
          : 'Not available in current standard record',
      status: hasReqApp ? factorStatuses.application.status : 'not_available',
      note: factorStatuses.application.status === 'matched' ? 'Application scope matched' : undefined,
    });

    // 3. Environmental Conditions
    const hasReqEnv = Boolean(reqs.environment && reqs.environment.length > 0);
    comparisons.push({
      field: 'Environmental Conditions',
      requirementValue: hasReqEnv ? reqs.environment.map((e) => e.name).join(', ') : null,
      standardValue:
        factorStatuses.environment.status === 'matched'
          ? factorStatuses.environment.evidence[0] || 'Outdoor / Environmental suitability'
          : 'Not available in current standard record',
      status: hasReqEnv ? factorStatuses.environment.status : 'not_available',
      note:
        factorStatuses.environment.status === 'matched'
          ? 'Environment factor matched'
          : undefined,
    });

    // 4. Installation Context
    const hasReqInst = Boolean(
      reqs.installation_requirements && reqs.installation_requirements.length > 0
    );
    const stdScopeLower = (standard.scope || '').toLowerCase();
    const instMatched =
      hasReqInst &&
      reqs.installation_requirements.some(
        (i) =>
          stdScopeLower.includes(i.name.toLowerCase()) ||
          (i.name.toLowerCase().includes('pole') && stdScopeLower.includes('road'))
      );
    comparisons.push({
      field: 'Installation Method',
      requirementValue: hasReqInst ? reqs.installation_requirements.map((i) => i.name).join(', ') : null,
      standardValue: instMatched
        ? 'Applicable installation context in standard scope'
        : 'Not available in current standard record',
      status: hasReqInst ? (instMatched ? 'matched' : 'not_available') : 'not_available',
      note: instMatched ? 'Installation context verified' : undefined,
    });

    // 5. Technical Parameters
    const hasReqParam = Boolean(
      reqs.technical_parameters && reqs.technical_parameters.length > 0
    );
    comparisons.push({
      field: 'Technical Ratings',
      requirementValue: hasReqParam
        ? reqs.technical_parameters
            .map((p) => `${p.parameter}: ${p.value}${p.unit ? ' ' + p.unit : ''}`)
            .join(', ')
        : null,
      standardValue:
        factorStatuses.technicalParameters.status === 'matched'
          ? factorStatuses.technicalParameters.evidence.join(', ')
          : 'Not available in current standard record',
      status: hasReqParam ? factorStatuses.technicalParameters.status : 'not_available',
      note:
        factorStatuses.technicalParameters.status === 'not_available'
          ? 'Not recorded in current reference dataset'
          : undefined,
    });

    // 6. Safety & Test Requirements
    const safetyList = [
      ...(reqs.safety_requirements || []).map((s) => s.name),
      ...(reqs.testing_requirements || []).map((t) => t.name),
    ];
    const hasReqSafety = safetyList.length > 0;
    comparisons.push({
      field: 'Safety & Testing',
      requirementValue: hasReqSafety ? safetyList.join(', ') : null,
      standardValue:
        factorStatuses.safetyTesting.status === 'matched'
          ? factorStatuses.safetyTesting.evidence.join(', ')
          : 'Not available in current standard record',
      status: hasReqSafety ? factorStatuses.safetyTesting.status : 'not_available',
      note:
        factorStatuses.safetyTesting.status === 'not_available'
          ? 'Not recorded in current reference dataset'
          : undefined,
    });

    return comparisons;
  }

  // --- Factor 1: Product / Category (Weight: 30%) ---
  private matchProductCategory(
    reqs: StructuredRequirements,
    reqContext: ReturnType<typeof this.extractRequirementContext>,
    standard: VerifiedStandard
  ): FactorDetail {
    const weight = this.weights.productCategory;
    const prodName = (reqs.product?.name || '').toLowerCase();
    const prodCat = (reqs.product?.category || '').toLowerCase();
    const fullText = reqContext.fullText;

    const stdCategory = standard.category.toLowerCase();
    const stdSubcat = standard.subcategory.toLowerCase();
    const stdProductTypes = (standard.product_types || []).map((p) => p.toLowerCase());
    const stdTitle = standard.title.toLowerCase();

    // DOMAIN ISOLATION (Level 4 Guard)
    // Completely reject cross-domain confusion (e.g. Cables vs Lighting vs Construction vs Safety)
    if (reqContext.domains.isLighting && !stdCategory.includes('lighting')) {
      return {
        status: 'not_matched',
        score: 0,
        weight,
        contribution: 0,
        evidence: [],
        label: 'Product / Category Match',
      };
    }
    if (reqContext.domains.isCable && !stdCategory.includes('cables')) {
      return {
        status: 'not_matched',
        score: 0,
        weight,
        contribution: 0,
        evidence: [],
        label: 'Product / Category Match',
      };
    }
    if (reqContext.domains.isConstruction && !stdCategory.includes('construction')) {
      return {
        status: 'not_matched',
        score: 0,
        weight,
        contribution: 0,
        evidence: [],
        label: 'Product / Category Match',
      };
    }
    if (reqContext.domains.isSafety && !stdCategory.includes('safety')) {
      return {
        status: 'not_matched',
        score: 0,
        weight,
        contribution: 0,
        evidence: [],
        label: 'Product / Category Match',
      };
    }

    const evidence: string[] = [];
    let matchScore = 0;

    // SPECIFICITY MATCH HIERARCHY:

    // 1. LIGHTING SPECIFICITY HIERARCHY
    if (reqContext.domains.isLighting) {
      const isReqStreetLighting =
        fullText.includes('street light') ||
        fullText.includes('street lighting') ||
        fullText.includes('road light') ||
        fullText.includes('road lighting') ||
        fullText.includes('pole mounted') ||
        fullText.includes('municipal road');

      const isStdStreetLighting =
        stdSubcat.includes('street') ||
        stdSubcat.includes('road') ||
        stdTitle.includes('road and street') ||
        stdTitle.includes('street lighting') ||
        stdProductTypes.some((pt) => pt.includes('street') || pt.includes('road'));

      const isStdGeneralLuminaire =
        stdSubcat.includes('luminaires') ||
        stdSubcat.includes('luminaire performance') ||
        stdProductTypes.some((pt) => pt.includes('luminaire'));

      const isStdLampOrModule =
        stdSubcat.includes('led lamps') ||
        stdSubcat.includes('led modules') ||
        stdSubcat.includes('led testing') ||
        stdTitle.includes('lamps') ||
        stdTitle.includes('modules') ||
        stdTitle.includes('photometric');

      if (isReqStreetLighting) {
        if (isStdStreetLighting) {
          // LEVEL 1: Exact Product Form & Application
          matchScore = 1.0;
          evidence.push(`Exact Product Match: Street & Road Lighting Luminaire (${standard.subcategory})`);
        } else if (isStdGeneralLuminaire) {
          // LEVEL 2: Specific Product (General Luminaire)
          matchScore = 0.65;
          evidence.push(`Product Alignment: Luminaire System (${standard.subcategory})`);
        } else if (isStdLampOrModule) {
          // LEVEL 3: Generic Component / Technology (Lamp/Module retrofit)
          // Cap at 0.20 because a lamp/bulb component is NOT a street light fixture
          matchScore = 0.20;
          evidence.push(`Component / Technology Reference: ${standard.subcategory}`);
        }
      } else {
        // Non-street lighting query: evaluate normally
        for (const pt of stdProductTypes) {
          if (prodName.includes(pt) || pt.includes(prodName)) {
            matchScore = Math.max(matchScore, 0.95);
            evidence.push(`Product Type: "${pt}"`);
          }
        }
      }
    }

    // 2. CABLES SPECIFICITY HIERARCHY
    else if (reqContext.domains.isCable) {
      const isHighTemp = fullText.includes('high temperature') || fullText.includes('heat resistant');
      const isStdHighTemp =
        stdTitle.includes('high temperature') ||
        stdTitle.includes('silicone') ||
        (standard.keywords || []).some((k) => k.toLowerCase().includes('temperature'));

      if (isHighTemp && isStdHighTemp) {
        matchScore = 1.0;
        evidence.push('Exact Product Match: High Temperature Cable');
      } else if (stdCategory.includes('cables')) {
        matchScore = 0.85;
        evidence.push(`Product Category: ${standard.subcategory}`);
      }
    }

    // 3. CONSTRUCTION SPECIFICITY HIERARCHY
    else if (reqContext.domains.isConstruction) {
      const hasConcrete = fullText.includes('concrete');
      const hasSteel = fullText.includes('steel') || fullText.includes('reinforcement');

      const stdIsConcrete = stdCategory.includes('concrete') || stdTitle.includes('concrete');
      const stdIsSteel = stdCategory.includes('steel') || stdTitle.includes('steel') || stdTitle.includes('reinforcement');

      if ((hasConcrete && stdIsConcrete) || (hasSteel && stdIsSteel)) {
        matchScore = 1.0;
        evidence.push(`Product Alignment: ${standard.subcategory}`);
      } else if (stdCategory.includes('construction')) {
        matchScore = 0.60;
        evidence.push(`Construction Domain: ${standard.category}`);
      }
    }

    // General fallback token containment
    if (matchScore === 0) {
      for (const pt of stdProductTypes) {
        if (prodName.includes(pt) || pt.includes(prodName) || matchesSynonym(prodName, pt)) {
          matchScore = Math.max(matchScore, 0.85);
          evidence.push(`Product Type: "${pt}"`);
        }
      }
      if (stdCategory.includes(prodCat) || (prodCat && stdCategory.includes(prodCat.split(' ')[0]))) {
        matchScore = Math.max(matchScore, 0.50);
        evidence.push(`Category: "${standard.category}"`);
      }
    }

    const finalScore = Math.min(1.0, matchScore);
    const status: FactorStatus = finalScore >= 0.40 ? 'matched' : 'not_matched';

    return {
      status,
      score: finalScore,
      weight,
      contribution: finalScore * weight,
      evidence: Array.from(new Set(evidence)),
      label: 'Product / Category Match',
    };
  }

  // --- Factor 2: Keywords / Title / Scope (Weight: 25%) ---
  private matchKeywordsTitleScope(
    _reqs: StructuredRequirements,
    reqContext: ReturnType<typeof this.extractRequirementContext>,
    standard: VerifiedStandard
  ): FactorDetail {
    const weight = this.weights.keywordsTitleScope;
    const stdKeywords = (standard.keywords || []).map((k) => k.toLowerCase());
    const stdScopeLower = (standard.scope || '').toLowerCase();
    const stdTitleLower = standard.title.toLowerCase();

    const evidence: string[] = [];

    // 1. Multi-Word Phrase Matches (High Value)
    let phraseScore = 0;
    for (const phrase of reqContext.phrases) {
      if (
        stdTitleLower.includes(phrase) ||
        stdScopeLower.includes(phrase) ||
        stdKeywords.some((k) => k.includes(phrase))
      ) {
        phraseScore += 0.40;
        evidence.push(`Phrase: "${phrase}"`);
      }
    }
    phraseScore = Math.min(1.0, phraseScore);

    // 2. Keyword & Token Overlap (Single Tokens, Lower Value)
    let kwHits = 0;
    for (const kw of stdKeywords) {
      // Don't award points for single generic words like 'led' or 'lighting' if phrase already matched
      for (const tok of reqContext.all) {
        if (tok.length > 2 && (kw === tok || kw.includes(tok))) {
          kwHits++;
          if (evidence.length < 5) evidence.push(kw);
          break;
        }
      }
    }
    const tokenScore = Math.min(1.0, kwHits / Math.max(3, stdKeywords.length));

    // Combined score: phrase match weighted 70%, single token overlap weighted 30%
    const finalScore = Math.min(1.0, phraseScore * 0.70 + tokenScore * 0.30);
    const status: FactorStatus = finalScore >= 0.25 ? 'matched' : 'not_matched';

    return {
      status,
      score: finalScore,
      weight,
      contribution: finalScore * weight,
      evidence: Array.from(new Set(evidence)).slice(0, 5),
      label: 'Keywords & Scope Overlap',
    };
  }

  // --- Factor 3: Application Match (Weight: 15%) ---
  private matchApplication(
    reqs: StructuredRequirements,
    reqContext: ReturnType<typeof this.extractRequirementContext>,
    standard: VerifiedStandard
  ): FactorDetail {
    const weight = this.weights.application;
    const appStr = (reqs.application || '').toLowerCase();
    const fullText = reqContext.fullText;

    if (!appStr && reqContext.application.length === 0) {
      return {
        status: 'not_available',
        score: 0,
        weight,
        contribution: 0,
        evidence: [],
        label: 'Application Domain',
      };
    }

    const stdScope = (standard.scope || '').toLowerCase();
    const stdTitle = standard.title.toLowerCase();
    const stdSubcat = standard.subcategory.toLowerCase();
    const stdKeywords = (standard.keywords || []).join(' ').toLowerCase();
    const combinedStdText = `${stdScope} ${stdTitle} ${stdSubcat} ${stdKeywords}`;

    const evidence: string[] = [];
    let matchScore = 0;

    // Check specific application domains:
    const isReqStreetOrRoad =
      fullText.includes('street') ||
      fullText.includes('road') ||
      fullText.includes('municipal') ||
      fullText.includes('highway') ||
      appStr.includes('street') ||
      appStr.includes('road');

    if (isReqStreetOrRoad) {
      // Standard explicitly for road or street lighting
      if (
        stdSubcat.includes('road') ||
        stdSubcat.includes('street') ||
        stdTitle.includes('road') ||
        stdTitle.includes('street') ||
        combinedStdText.includes('road lighting') ||
        combinedStdText.includes('street lighting')
      ) {
        matchScore = 1.0;
        evidence.push('Direct Application: Road & Street Lighting');
      } else if (
        stdSubcat.includes('luminaires') ||
        stdSubcat.includes('luminaire performance')
      ) {
        // General luminaire without conflicting specific application
        matchScore = 0.35;
        evidence.push('Allied Application: General Luminaire Infrastructure');
      } else {
        // Conflicting specific application (e.g. Floodlight, Emergency, Handlamp, General Service Lamps)
        matchScore = 0.0;
      }
    } else {
      // General application checking for industrial, construction, underground, etc.
      const appDomains = [
        'industrial', 'construction', 'building', 'structural',
        'underground', 'marine', 'firefighting', 'emergency', 'floodlighting',
      ];
      for (const domain of appDomains) {
        if (appStr.includes(domain) || fullText.includes(domain)) {
          if (combinedStdText.includes(domain) || matchesSynonym(domain, combinedStdText)) {
            matchScore = Math.max(matchScore, 0.90);
            evidence.push(`Application domain: "${domain}"`);
          }
        }
      }
    }

    const finalScore = Math.min(1.0, matchScore);
    const status: FactorStatus = finalScore >= 0.35 ? 'matched' : 'not_matched';

    return {
      status,
      score: finalScore,
      weight,
      contribution: finalScore * weight,
      evidence: Array.from(new Set(evidence)),
      label: 'Application Domain',
    };
  }

  // --- Factor 4: Environment Match (Weight: 10%) ---
  private matchEnvironment(
    reqs: StructuredRequirements,
    reqContext: ReturnType<typeof this.extractRequirementContext>,
    standard: VerifiedStandard
  ): FactorDetail {
    const weight = this.weights.environment;
    const envItems = reqs.environment || [];

    // Also consider environment words present in fullText
    const fullText = reqContext.fullText;
    const hasOutdoor = fullText.includes('outdoor') || fullText.includes('weather resistant') || fullText.includes('pole mounted');
    const hasHighTemp = fullText.includes('high temperature') || fullText.includes('heat resistant');

    if (envItems.length === 0 && !hasOutdoor && !hasHighTemp) {
      return {
        status: 'not_available',
        score: 0,
        weight,
        contribution: 0,
        evidence: [],
        label: 'Environmental Conditions',
      };
    }

    const stdScope = (standard.scope || '').toLowerCase();
    const stdKeywords = (standard.keywords || []).join(' ').toLowerCase();
    const stdTitle = standard.title.toLowerCase();
    const combined = `${stdScope} ${stdKeywords} ${stdTitle}`;

    const evidence: string[] = [];
    let hits = 0;

    if (hasOutdoor) {
      if (
        combined.includes('outdoor') ||
        combined.includes('street') ||
        combined.includes('road') ||
        combined.includes('floodlight')
      ) {
        hits += 1.0;
        evidence.push('Outdoor / Weather resistant environment');
      }
    }

    if (hasHighTemp) {
      if (combined.includes('temperature') || combined.includes('thermal') || combined.includes('flame')) {
        hits += 1.0;
        evidence.push('High temperature environment');
      }
    }

    for (const item of envItems) {
      const term = item.name.toLowerCase();
      if (combined.includes(term) || matchesSynonym(term, combined)) {
        hits++;
        evidence.push(item.name);
      }
    }

    const totalExpected = Math.max(1, (hasOutdoor ? 1 : 0) + (hasHighTemp ? 1 : 0) + envItems.length);
    const finalScore = Math.min(1.0, hits / totalExpected);
    const status: FactorStatus = finalScore >= 0.30 ? 'matched' : 'not_matched';

    return {
      status,
      score: finalScore,
      weight,
      contribution: finalScore * weight,
      evidence: Array.from(new Set(evidence)),
      label: 'Environmental Conditions',
    };
  }

  // --- Factor 5: Technical Parameters (Weight: 10%) ---
  private matchTechnicalParameters(
    reqs: StructuredRequirements,
    _reqContext: ReturnType<typeof this.extractRequirementContext>,
    standard: VerifiedStandard
  ): FactorDetail {
    const weight = this.weights.technicalParameters;
    const params = reqs.technical_parameters || [];

    if (!standard.technical_parameters && !standard.performance_requirements) {
      return {
        status: 'not_available',
        score: 0,
        weight,
        contribution: 0,
        evidence: ['No specific parameter ratings in this standard record (standard defines general requirements/tests).'],
        label: 'Technical Parameters',
      };
    }

    if (params.length === 0) {
      return {
        status: 'not_available',
        score: 0,
        weight,
        contribution: 0,
        evidence: ['No technical parameters provided in requirements.'],
        label: 'Technical Parameters',
      };
    }

    const stdScope = (standard.scope || '').toLowerCase();
    const stdPerf = JSON.stringify(standard.performance_requirements || {}).toLowerCase();
    const stdParams = JSON.stringify(standard.technical_parameters || {}).toLowerCase();
    const combined = `${stdScope} ${stdPerf} ${stdParams}`;

    const evidence: string[] = [];
    let matchCount = 0;

    for (const p of params) {
      const pName = p.parameter.toLowerCase();
      const pVal = p.value.toLowerCase();
      if (combined.includes(pName) || combined.includes(pVal)) {
        matchCount++;
        evidence.push(`${p.parameter}: ${p.value}`);
      }
    }

    const finalScore = Math.min(1.0, matchCount / Math.max(1, params.length));
    const status: FactorStatus = finalScore > 0 ? 'matched' : 'not_matched';

    return {
      status,
      score: finalScore,
      weight,
      contribution: finalScore * weight,
      evidence,
      label: 'Technical Parameters',
    };
  }

  // --- Factor 6: Safety & Testing (Weight: 10%) ---
  private matchSafetyTesting(
    reqs: StructuredRequirements,
    _reqContext: ReturnType<typeof this.extractRequirementContext>,
    standard: VerifiedStandard
  ): FactorDetail {
    const weight = this.weights.safetyTesting;
    const reqSafety = reqs.safety_requirements || [];
    const reqTesting = reqs.testing_requirements || [];
    const totalReq = reqSafety.length + reqTesting.length;

    // Critical fix: If query did NOT specify safety or testing, do not award free unearned points!
    if (totalReq === 0) {
      return {
        status: 'not_available',
        score: 0,
        weight,
        contribution: 0,
        evidence: ['No specific safety or testing requirements requested.'],
        label: 'Safety & Testing',
      };
    }

    const hasStandardTesting = Boolean(standard.testing_requirements);
    const hasStandardSafety = Boolean(standard.safety_requirements);

    if (!hasStandardTesting && !hasStandardSafety) {
      return {
        status: 'not_available',
        score: 0,
        weight,
        contribution: 0,
        evidence: ['No specific safety/testing clauses registered in reference record.'],
        label: 'Safety & Testing',
      };
    }

    const stdTestingStr = (typeof standard.testing_requirements === 'string'
      ? standard.testing_requirements
      : JSON.stringify(standard.testing_requirements || '')
    ).toLowerCase();

    const stdSafetyStr = (typeof standard.safety_requirements === 'string'
      ? standard.safety_requirements
      : JSON.stringify(standard.safety_requirements || '')
    ).toLowerCase();

    const combined = `${stdTestingStr} ${stdSafetyStr}`;

    const evidence: string[] = [];
    let hits = 0;

    for (const s of [...reqSafety, ...reqTesting]) {
      const name = s.name.toLowerCase();
      if (combined.includes(name) || matchesSynonym(name, combined)) {
        hits++;
        evidence.push(s.name);
      }
    }

    const finalScore = Math.min(1.0, hits / totalReq);
    const status: FactorStatus = finalScore >= 0.30 ? 'matched' : 'not_matched';

    return {
      status,
      score: finalScore,
      weight,
      contribution: finalScore * weight,
      evidence: Array.from(new Set(evidence)),
      label: 'Safety & Testing',
    };
  }

  // ------------------------------------------------------------
  // Dynamic Reason Generation (Explainability with Specificity)
  // ------------------------------------------------------------
  private generateDynamicReason(
    standard: VerifiedStandard,
    category: RecommendationCategory,
    factors: StandardRecommendation['factorStatuses'],
    reqs: StructuredRequirements
  ): string {
    const prodName = reqs.product?.name || 'procurement item';
    const reasons: string[] = [];

    if (factors.productCategory.status === 'matched' && factors.productCategory.evidence.length > 0) {
      reasons.push(factors.productCategory.evidence[0]);
    }

    if (factors.application.status === 'matched' && factors.application.evidence.length > 0) {
      reasons.push(factors.application.evidence[0]);
    }

    if (factors.environment.status === 'matched' && factors.environment.evidence.length > 0) {
      reasons.push(factors.environment.evidence[0]);
    }

    if (factors.keywordsTitleScope.evidence.length > 0) {
      reasons.push(`keywords (${factors.keywordsTitleScope.evidence.slice(0, 3).join(', ')})`);
    }

    if (factors.technicalParameters.status === 'matched' && factors.technicalParameters.evidence.length > 0) {
      reasons.push(`technical parameters (${factors.technicalParameters.evidence.slice(0, 2).join(', ')})`);
    }

    if (category === 'high') {
      return `Strong match for ${prodName} because the standard directly satisfies ${reasons.join(', ')}.`;
    } else if (category === 'related') {
      return `Related standard for ${prodName} offering allied reference on ${reasons.join(', ')}.`;
    } else {
      return `Partial context reference for ${prodName} with ${reasons.length > 0 ? reasons.join(', ') : 'general domain overlap'}.`;
    }
  }
}

// Singleton helper for direct function call
export function matchRequirementsToStandards(
  requirements: StructuredRequirements,
  standards: VerifiedStandard[] = VERIFIED_BIS_STANDARDS,
  options?: MatchingOptions
): MatchingResult {
  const matcher = new StandardsMatcher(options?.weights);
  return matcher.evaluate(requirements, standards, options);
}
