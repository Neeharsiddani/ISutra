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

export type FactorStatus = 'matched' | 'not_matched' | 'not_available' | 'contradiction';

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
// Phase E: Specificity-Aware Ranking Types
// ============================================================
export type SpecificityTier = 1 | 2 | 3 | 4 | 5 | 6;

export interface SpecificityDetail {
  tier: SpecificityTier;
  tierLabel: string;
  score: number;
  weight: number;
  contribution: number;
  status: FactorStatus;
  evidence: string[];
  label: string;
}

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
  specificityTier: SpecificityTier;
  specificityTierLabel: string;
  specificationSpecificity: SpecificityDetail;
  factorStatuses: {
    productCategory: FactorDetail;
    keywordsTitleScope: FactorDetail;
    application: FactorDetail;
    environment: FactorDetail;
    technicalParameters: FactorDetail;
    safetyTesting: FactorDetail;
    specificationSpecificity?: FactorDetail;
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
  'deformed bars', 'steel bars', 'tmt bars', 'reinforcement bars', 'concrete reinforcement',
  'structural steel', 'coarse aggregate', 'fly ash brick', 'burnt clay brick',
  'safety footwear', 'safety helmet', 'protective clothing',
];

// Meaningful exact product multi-word phrases (highest specificity tier)
export const EXACT_PRODUCT_PHRASES: string[] = [
  'led street lighting luminaire', 'led street lighting luminaires',
  'led street lighting system', 'led street lighting systems',
  'led street lighting', 'led street light', 'led street lights',
  'road lighting luminaire', 'road lighting luminaires',
  'street lighting luminaire', 'street lighting luminaires',
  'street luminaire', 'street luminaires', 'road luminaire', 'road luminaires',
  'self-ballasted led lamp', 'self-ballasted led lamps',
  'self-ballasted lamp', 'self-ballasted lamps',
  'self ballasted led lamp', 'self ballasted led lamps',
  'self ballasted lamp', 'self ballasted lamps',
  'led module', 'led modules',
  'emergency lighting luminaire', 'emergency lighting luminaires',
  'emergency lighting', 'emergency light', 'emergency lights',
  'pvc insulated cable', 'pvc insulated cables',
  'xlpe insulated cable', 'xlpe insulated cables',
  'heavy duty cable', 'heavy duty cables',
  'reinforced concrete', 'structural steel',
  'deformed steel bars', 'deformed bars', 'reinforcement steel', 'tmt bars', 'steel bars',
  'safety footwear', 'safety helmet',
];

// Generic terminology that must not create disproportionately high scores on its own
export const GENERIC_KEYWORDS = new Set([
  'led', 'lighting', 'light', 'lights', 'luminaire', 'luminaires',
  'electrical', 'equipment', 'product', 'products', 'system', 'systems',
  'safety', 'performance', 'general', 'standard', 'standards',
  'indian', 'specification', 'specifications', 'requirement', 'requirements',
  'test', 'testing', 'method', 'methods', 'apparatus', 'device', 'devices',
  'service', 'services', 'use', 'purpose', 'grade',
]);

// Product form taxonomy for specificity awareness & contradiction detection
export type ProductForm =
  | 'street_road_luminaire'
  | 'emergency_luminaire'
  | 'floodlight'
  | 'general_luminaire'
  | 'self_ballasted_lamp'
  | 'led_module'
  | 'xlpe_cable'
  | 'pvc_cable'
  | 'aerial_bunched_cable'
  | 'hffr_cable'
  | 'elastomer_cable'
  | 'electrical_cable'
  | 'structural_concrete'
  | 'reinforcing_steel'
  | 'structural_steel'
  | 'concrete_pipe'
  | 'concrete_block'
  | 'building_brick'
  | 'aggregate_material'
  | 'water_tank_structure'
  | 'safety_footwear'
  | 'protective_gloves'
  | 'firefighter_gear'
  | 'heat_flame_clothing'
  | 'respiratory_protection'
  | 'safety_helmet'
  | 'unknown';

export function formatProductFormLabel(form: ProductForm): string {
  switch (form) {
    case 'street_road_luminaire':
      return 'Street & Road Lighting Luminaire';
    case 'emergency_luminaire':
      return 'Emergency Lighting Luminaire';
    case 'floodlight':
      return 'Floodlight Luminaire';
    case 'general_luminaire':
      return 'General Luminaire';
    case 'self_ballasted_lamp':
      return 'Self-ballasted LED Lamp';
    case 'led_module':
      return 'LED Module for General Lighting';
    case 'xlpe_cable':
      return 'XLPE Insulated Power Cable';
    case 'pvc_cable':
      return 'PVC Insulated Electric Cable';
    case 'aerial_bunched_cable':
      return 'Aerial Bunched Cable';
    case 'hffr_cable':
      return 'Halogen Free Flame Retardant Cable';
    case 'elastomer_cable':
      return 'Elastomer Insulated Cable';
    case 'electrical_cable':
      return 'Electrical Cable';
    case 'structural_concrete':
      return 'Structural Concrete';
    case 'reinforcing_steel':
      return 'Reinforcing Steel';
    case 'structural_steel':
      return 'Structural Steel';
    case 'concrete_pipe':
      return 'Precast Concrete Pipe';
    case 'concrete_block':
      return 'Concrete Masonry Block';
    case 'building_brick':
      return 'Building Brick';
    case 'aggregate_material':
      return 'Concrete Aggregates';
    case 'water_tank_structure':
      return 'Liquid Retaining Structure';
    case 'safety_footwear':
      return 'Safety Footwear';
    case 'protective_gloves':
      return 'Protective Gloves';
    case 'firefighter_gear':
      return 'Firefighter Protective Gear';
    case 'heat_flame_clothing':
      return 'Heat & Flame Protective Clothing';
    case 'respiratory_protection':
      return 'Respiratory Protective Device';
    case 'safety_helmet':
      return 'Safety Helmet';
    default:
      return 'Product';
  }
}

export function detectRequirementProductForm(reqs: StructuredRequirements, fullText: string): ProductForm {
  const text = `${reqs.product?.name || ''} ${reqs.product?.category || ''} ${reqs.application || ''} ${fullText}`.toLowerCase();

  // 1. Emergency luminaire
  if (text.includes('emergency light') || text.includes('emergency luminaire') || text.includes('emergency lighting')) {
    return 'emergency_luminaire';
  }
  // 2. Floodlight
  if (text.includes('floodlight') || text.includes('flood light') || text.includes('floodlighting')) {
    return 'floodlight';
  }
  // 3. Street / Road lighting luminaire
  if (
    text.includes('street light') ||
    text.includes('street lighting') ||
    text.includes('street luminaire') ||
    text.includes('road light') ||
    text.includes('road lighting') ||
    text.includes('road luminaire') ||
    ((text.includes('municipal road') || text.includes('highway')) &&
      (text.includes('light') || text.includes('luminaire') || text.includes('lamp') || text.includes('lux') || text.includes('lumen')))
  ) {
    return 'street_road_luminaire';
  }
  // 4. LED Module
  if (text.includes('led module') || text.includes('led modules') || text.includes('light engine')) {
    return 'led_module';
  }
  // 5. Self-ballasted LED Lamp
  if (
    text.includes('self-ballasted') ||
    text.includes('self ballasted') ||
    text.includes('led lamp') ||
    text.includes('led lamps') ||
    text.includes('led bulb') ||
    text.includes('led bulbs') ||
    text.includes('lamp')
  ) {
    return 'self_ballasted_lamp';
  }
  // 6. General luminaire
  if (text.includes('luminaire') || text.includes('lighting fixture') || text.includes('light fitting')) {
    return 'general_luminaire';
  }

  // 7. Steel (check specific reinforcing steel and structural steel)
  if (
    text.includes('reinforcing steel') ||
    text.includes('rebar') ||
    text.includes('steel bar') ||
    text.includes('steel bars') ||
    text.includes('deformed bar') ||
    text.includes('deformed bars') ||
    text.includes('tmt bar') ||
    text.includes('tmt bars')
  ) {
    return 'reinforcing_steel';
  }
  if (text.includes('structural steel')) {
    return 'structural_steel';
  }

  // 8. Electrical cables (with specific cable types)
  if (text.includes('aerial bunched') || text.includes('abc cable')) {
    return 'aerial_bunched_cable';
  }
  if (text.includes('hffr') || text.includes('halogen free')) {
    return 'hffr_cable';
  }
  if (text.includes('elastomer') || text.includes('rubber insulated')) {
    return 'elastomer_cable';
  }
  if (text.includes('xlpe') || text.includes('cross-linked') || text.includes('crosslinked')) {
    return 'xlpe_cable';
  }
  if (text.includes('pvc cable') || text.includes('flexible cord') || text.includes('pvc insulated')) {
    return 'pvc_cable';
  }
  if (
    text.includes('cable') ||
    text.includes('conductor') ||
    (text.includes('wire') && !text.includes('steel') && !text.includes('reinforce'))
  ) {
    return 'electrical_cable';
  }

  // 9. Construction materials & structures
  if (text.includes('pipe') || text.includes('culvert')) {
    return 'concrete_pipe';
  }
  if (text.includes('block')) {
    return 'concrete_block';
  }
  if (text.includes('brick')) {
    return 'building_brick';
  }
  if (text.includes('masonry')) {
    return 'concrete_block';
  }
  if (text.includes('aggregate')) {
    return 'aggregate_material';
  }
  if (text.includes('water tank') || text.includes('liquid retaining') || text.includes('aqueous')) {
    return 'water_tank_structure';
  }
  if (text.includes('concrete')) {
    return 'structural_concrete';
  }

  // 10. Safety & PPE
  if (text.includes('footwear') || text.includes('safety shoe') || text.includes('safety boot')) {
    return 'safety_footwear';
  }
  if (text.includes('respiratory') || text.includes('respirator') || text.includes('filtering')) {
    return 'respiratory_protection';
  }
  if (text.includes('firefighter') || text.includes('fire brigade')) {
    return 'firefighter_gear';
  }
  if (text.includes('heat and flame') || text.includes('thermal flame') || text.includes('heat & flame')) {
    return 'heat_flame_clothing';
  }
  if (text.includes('glove') || text.includes('hand protection')) {
    return 'protective_gloves';
  }
  if (text.includes('helmet') || text.includes('hard hat')) {
    return 'safety_helmet';
  }

  return 'unknown';
}

export function detectStandardProductForm(standard: VerifiedStandard): ProductForm {
  const stdNum = standard.standard_number;
  const title = standard.title.toLowerCase();
  const subcat = standard.subcategory.toLowerCase();
  const types = (standard.product_types || []).map((t) => t.toLowerCase()).join(' ');
  const combined = `${stdNum} ${title} ${subcat} ${types}`.toLowerCase();

  // 1. Lighting
  if (stdNum.includes('10322 (Part 5/Sec 8)') || title.includes('emergency lighting') || subcat.includes('emergency')) {
    return 'emergency_luminaire';
  }
  if (stdNum.includes('10322 (Part 5/Sec 5)') || title.includes('floodlight') || subcat.includes('floodlight')) {
    return 'floodlight';
  }
  if (
    stdNum.includes('10322 (Part 5/Sec 3)') ||
    stdNum.includes('16107 (Part 2/Sec 2)') ||
    subcat.includes('road & street') ||
    subcat.includes('road and street') ||
    subcat.includes('street lighting') ||
    title.includes('road and street') ||
    title.includes('street lighting')
  ) {
    return 'street_road_luminaire';
  }
  if (stdNum.includes('16103') || title.includes('led modules') || subcat.includes('led modules')) {
    return 'led_module';
  }
  if (stdNum.includes('16102') || title.includes('self-ballasted') || title.includes('led lamps') || subcat.includes('led lamps')) {
    return 'self_ballasted_lamp';
  }
  if (stdNum.includes('10322') || stdNum.includes('16107') || subcat.includes('luminaire') || title.includes('luminaire')) {
    return 'general_luminaire';
  }

  // 2. Cables
  if (stdNum.includes('14255') || title.includes('aerial bunched') || subcat.includes('aerial bunched')) {
    return 'aerial_bunched_cable';
  }
  if (stdNum.includes('17048') || title.includes('halogen free') || subcat.includes('hffr')) {
    return 'hffr_cable';
  }
  if (stdNum.includes('9968') || title.includes('elastomer') || subcat.includes('elastomer')) {
    return 'elastomer_cable';
  }
  if (stdNum.includes('7098') || title.includes('cross-linked') || subcat.includes('xlpe')) {
    return 'xlpe_cable';
  }
  if (stdNum.includes('1554') || stdNum.includes('694') || title.includes('pvc') || subcat.includes('pvc')) {
    return 'pvc_cable';
  }
  if (standard.category.toLowerCase().includes('cables') || title.includes('cable')) {
    return 'electrical_cable';
  }

  // 3. Steel & Concrete
  if (
    title.includes('deformed steel bars') ||
    title.includes('steel bars') ||
    subcat.includes('deformed bars') ||
    subcat.includes('reinforcement steel') ||
    types.includes('reinforcement bars')
  ) {
    return 'reinforcing_steel';
  }
  if (title.includes('structural steel') || subcat.includes('structural steel')) {
    return 'structural_steel';
  }
  if (stdNum.includes('458') || title.includes('pipe') || subcat.includes('pipe')) {
    return 'concrete_pipe';
  }
  if (stdNum.includes('1077') || stdNum.includes('3952') || title.includes('brick') || subcat.includes('brick')) {
    return 'building_brick';
  }
  if (stdNum.includes('2185') || subcat.includes('block') || subcat.includes('masonry')) {
    return 'concrete_block';
  }
  if (stdNum.includes('383') || title.includes('aggregate') || subcat.includes('aggregate')) {
    return 'aggregate_material';
  }
  if (stdNum.includes('3370') || subcat.includes('water retaining') || title.includes('aqueous')) {
    return 'water_tank_structure';
  }
  if (title.includes('concrete') || subcat.includes('concrete')) {
    return 'structural_concrete';
  }
  if (title.includes('bars') || title.includes('wires') || subcat.includes('steel') || subcat.includes('reinforcement')) {
    return 'reinforcing_steel';
  }

  // 4. Safety & PPE
  if (stdNum.includes('15298') || title.includes('footwear') || subcat.includes('footwear')) {
    return 'safety_footwear';
  }
  if (stdNum.includes('19089') || title.includes('respiratory') || subcat.includes('respiratory')) {
    return 'respiratory_protection';
  }
  if (stdNum.includes('16890') || (stdNum.includes('16874') && title.includes('firefighters'))) {
    return 'firefighter_gear';
  }
  if (stdNum.includes('15748') || subcat.includes('heat and flame')) {
    return 'heat_flame_clothing';
  }
  if (stdNum.includes('6994') || title.includes('gloves') || subcat.includes('hand protection')) {
    return 'protective_gloves';
  }
  if (title.includes('helmet') || subcat.includes('helmet')) {
    return 'safety_helmet';
  }
  return 'unknown';
}

export function checkProductFormContradiction(
  reqForm: ProductForm,
  stdForm: ProductForm,
  _reqs: StructuredRequirements,
  standard: VerifiedStandard
): { isContradiction: boolean; reason?: string } {
  if (reqForm === 'unknown' || stdForm === 'unknown') {
    return { isContradiction: false };
  }

  // 1. Street / Road lighting luminaire contradictions
  if (reqForm === 'street_road_luminaire') {
    if (stdForm === 'emergency_luminaire') {
      return {
        isContradiction: true,
        reason: `Contradiction: Requirement specifies municipal road/street lighting, while standard ${standard.standard_number} is specifically for emergency lighting.`,
      };
    }
    if (stdForm === 'floodlight') {
      return {
        isContradiction: true,
        reason: `Contradiction: Requirement specifies municipal road/street lighting, while standard ${standard.standard_number} is specifically for floodlighting.`,
      };
    }
    if (stdForm === 'self_ballasted_lamp') {
      return {
        isContradiction: true,
        reason: `Product form mismatch: Requirement specifies complete street lighting luminaire, whereas standard ${standard.standard_number} covers self-ballasted lamp replacement components.`,
      };
    }
    if (stdForm === 'led_module') {
      return {
        isContradiction: true,
        reason: `Product form mismatch: Requirement specifies complete street lighting luminaire, whereas standard ${standard.standard_number} covers LED module sub-assemblies.`,
      };
    }
  }

  // 2. Self-ballasted LED Lamp contradictions
  if (reqForm === 'self_ballasted_lamp') {
    if (stdForm === 'street_road_luminaire') {
      return {
        isContradiction: true,
        reason: `Product form mismatch: Requirement specifies self-ballasted LED lamps, whereas standard ${standard.standard_number} covers complete road/street lighting luminaires.`,
      };
    }
    if (stdForm === 'emergency_luminaire') {
      return {
        isContradiction: true,
        reason: `Product form mismatch: Requirement specifies self-ballasted LED lamps, whereas standard ${standard.standard_number} covers emergency luminaires.`,
      };
    }
    if (stdForm === 'floodlight') {
      return {
        isContradiction: true,
        reason: `Product form mismatch: Requirement specifies self-ballasted LED lamps, whereas standard ${standard.standard_number} covers floodlighting.`,
      };
    }
    if (stdForm === 'led_module') {
      return {
        isContradiction: true,
        reason: `Technology distinction: Requirement specifies self-ballasted LED lamps (with integrated driver), whereas standard ${standard.standard_number} covers LED modules (requiring separate control gear).`,
      };
    }
  }

  // 3. LED Module contradictions
  if (reqForm === 'led_module') {
    if (stdForm === 'self_ballasted_lamp') {
      return {
        isContradiction: true,
        reason: `Technology distinction: Requirement specifies LED modules (requiring separate control gear), whereas standard ${standard.standard_number} covers self-ballasted lamps (with integrated driver).`,
      };
    }
    if (stdForm === 'street_road_luminaire' || stdForm === 'emergency_luminaire' || stdForm === 'floodlight') {
      return {
        isContradiction: true,
        reason: `Product form mismatch: Requirement specifies LED module sub-assemblies, whereas standard ${standard.standard_number} covers complete luminaire assemblies.`,
      };
    }
  }

  // 4. Emergency luminaire contradictions
  if (reqForm === 'emergency_luminaire') {
    if (stdForm === 'street_road_luminaire') {
      return {
        isContradiction: true,
        reason: `Contradiction: Requirement specifies emergency lighting luminaires, whereas standard ${standard.standard_number} covers road and street lighting.`,
      };
    }
    if (stdForm === 'floodlight') {
      return {
        isContradiction: true,
        reason: `Contradiction: Requirement specifies emergency lighting luminaires, whereas standard ${standard.standard_number} covers floodlighting.`,
      };
    }
    if (stdForm === 'self_ballasted_lamp' || stdForm === 'led_module') {
      return {
        isContradiction: true,
        reason: `Product form mismatch: Requirement specifies emergency lighting luminaires, whereas standard ${standard.standard_number} covers lamp/module components.`,
      };
    }
  }

  // 5. Floodlight contradictions
  if (reqForm === 'floodlight') {
    if (stdForm === 'street_road_luminaire') {
      return {
        isContradiction: true,
        reason: `Contradiction: Requirement specifies floodlighting luminaires, whereas standard ${standard.standard_number} covers road and street lighting.`,
      };
    }
    if (stdForm === 'emergency_luminaire') {
      return {
        isContradiction: true,
        reason: `Contradiction: Requirement specifies floodlighting luminaires, whereas standard ${standard.standard_number} covers emergency lighting.`,
      };
    }
    if (stdForm === 'self_ballasted_lamp' || stdForm === 'led_module') {
      return {
        isContradiction: true,
        reason: `Product form mismatch: Requirement specifies floodlighting luminaires, whereas standard ${standard.standard_number} covers lamp/module components.`,
      };
    }
  }

  // 6. Cross-domain: Civil structural materials vs electrical cables
  if (
    (reqForm === 'reinforcing_steel' || reqForm === 'structural_concrete' || reqForm === 'structural_steel') &&
    (stdForm === 'electrical_cable' || stdForm === 'xlpe_cable' || stdForm === 'pvc_cable' || stdForm === 'aerial_bunched_cable' || stdForm === 'hffr_cable' || stdForm === 'elastomer_cable')
  ) {
    return {
      isContradiction: true,
      reason: `Contradiction: Requirement specifies civil structural reinforcement/construction, while standard ${standard.standard_number} is dedicated to electrical cables.`,
    };
  }
  if (
    (reqForm === 'electrical_cable' || reqForm === 'xlpe_cable' || reqForm === 'pvc_cable' || reqForm === 'aerial_bunched_cable' || reqForm === 'hffr_cable' || reqForm === 'elastomer_cable') &&
    (stdForm === 'reinforcing_steel' || stdForm === 'structural_concrete' || stdForm === 'structural_steel')
  ) {
    return {
      isContradiction: true,
      reason: `Contradiction: Requirement specifies electrical cables, while standard ${standard.standard_number} is dedicated to civil structural construction materials.`,
    };
  }

  return { isContradiction: false };
}

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
    const minThreshold = options.minScoreThreshold ?? 0.25;
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
      const hasContradiction = Object.values(evaluation.factorStatuses).some((f) => f.status === 'contradiction');
      if (evaluation.score >= minThreshold || (hasContradiction && evaluation.score >= 0.15)) {
        scoredList.push(evaluation);
      }
    }

    // Specificity-Aware Deterministic Sorting & Tie-Breaking (Phase E)
    scoredList.sort((a, b) => {
      // 1. Contradiction status (Non-contradicted strictly dominates contradicted; fewer contradictions outrank more)
      const aContraCount = Object.values(a.factorStatuses).filter((f) => f.status === 'contradiction').length;
      const bContraCount = Object.values(b.factorStatuses).filter((f) => f.status === 'contradiction').length;
      if (aContraCount !== bContraCount) {
        return aContraCount - bContraCount;
      }

      // 2. Significant Primary Score Difference (> 0.05)
      // Genuine score advantages from verified domain parameters outrank marginal scores
      if (Math.abs(b.score - a.score) > 0.05) {
        return b.score - a.score;
      }

      // 3. Deterministic Specificity Tier Hierarchy (Tier 1 < Tier 2 < ... < Tier 6)
      if (a.specificityTier !== b.specificityTier) {
        return a.specificityTier - b.specificityTier;
      }

      // 4. Specificity Subscore
      if (Math.abs(b.specificationSpecificity.score - a.specificationSpecificity.score) > 0.001) {
        return b.specificationSpecificity.score - a.specificationSpecificity.score;
      }

      // 5. Product Form Alignment (only non-contradicted standards can claim exact product match)
      const aFormMatch =
        aContraCount === 0 &&
        a.factorStatuses.productCategory.evidence.some(
          (e) => e.includes('Exact Product Match') || e.includes('Exact Cable Match')
        );
      const bFormMatch =
        bContraCount === 0 &&
        b.factorStatuses.productCategory.evidence.some(
          (e) => e.includes('Exact Product Match') || e.includes('Exact Cable Match')
        );
      if (aFormMatch && !bFormMatch) return -1;
      if (!aFormMatch && bFormMatch) return 1;

      // 6. Application Alignment
      const aApp = a.factorStatuses.application.status === 'matched';
      const bApp = b.factorStatuses.application.status === 'matched';
      if (aApp && !bApp) return -1;
      if (!aApp && bApp) return 1;

      // 7. Base score (fine-grained difference)
      if (Math.abs(b.score - a.score) > 0.001) {
        return b.score - a.score;
      }

      // 8. Deterministic Fallback: Standard Number Ordering
      return a.standard.standard_number.localeCompare(b.standard.standard_number);
    });

    // Dynamic quality filtering: If strong matches exist (score >= 0.50),
    // eliminate distant low-scoring noise (< 0.35) so only genuinely useful results remain
    const topScore = scoredList.length > 0 ? scoredList[0].score : 0;
    const hasCategoryMatches = scoredList.some(
      (item) => item.factorStatuses.productCategory.status === 'matched'
    );
    const filteredList = scoredList.filter((item) => {
      const hasContradiction = Object.values(item.factorStatuses).some((f) => f.status === 'contradiction');
      if (hasContradiction) {
        return true;
      }
      // Prohibit cross-domain contamination when valid category matches exist
      if (hasCategoryMatches && item.factorStatuses.productCategory.status === 'not_matched') {
        return false;
      }
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
      specificityTier: item.specificityTier,
      specificityTierLabel: item.specificityTierLabel,
      specificationSpecificity: item.specificationSpecificity,
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
    const matStr = (reqs.materials || []).map((m) => m.name).join(' ');
    const envStr = (reqs.environment || []).map((e) => e.name).join(' ');
    const safetyStr = (reqs.safety_requirements || []).map((s) => s.name).join(' ');
    const fullText = `${prodName} ${prodCat} ${appStr} ${indStr} ${matStr} ${envStr} ${safetyStr} ${reqs.product?.source_text || ''}`;
    const phrases = extractPhrases(fullText);

    // Identify requirement domain
    const isLighting =
      fullText.toLowerCase().includes('light') ||
      fullText.toLowerCase().includes('led') ||
      fullText.toLowerCase().includes('luminaire') ||
      fullText.toLowerCase().includes('lamp');

    const isCable =
      prodCat.toLowerCase().includes('cable') ||
      prodCat.toLowerCase().includes('conductor') ||
      prodName.toLowerCase().includes('cable') ||
      prodName.toLowerCase().includes('conductor') ||
      (!isLighting &&
        !prodCat.toLowerCase().includes('construction') &&
        !prodName.toLowerCase().includes('concrete') &&
        (fullText.toLowerCase().includes('cable') ||
          fullText.toLowerCase().includes('conductor') ||
          (fullText.toLowerCase().includes('wire') &&
            !fullText.toLowerCase().includes('reinforce'))));

    const isConstruction =
      !isCable &&
      (fullText.toLowerCase().includes('concrete') ||
        (fullText.toLowerCase().includes('steel') &&
          !prodCat.toLowerCase().includes('cable') &&
          !prodName.toLowerCase().includes('cable')) ||
        fullText.toLowerCase().includes('cement') ||
        fullText.toLowerCase().includes('aggregate') ||
        fullText.toLowerCase().includes('brick') ||
        fullText.toLowerCase().includes('rebar'));

    const isSafety =
      fullText.toLowerCase().includes('helmet') ||
      fullText.toLowerCase().includes('shoe') ||
      fullText.toLowerCase().includes('footwear') ||
      /\bppe\b/i.test(fullText) ||
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

    // Check for factor-level contradictions
    const hasContradiction =
      prodFactor.status === 'contradiction' ||
      kwFactor.status === 'contradiction' ||
      appFactor.status === 'contradiction' ||
      envFactor.status === 'contradiction' ||
      paramFactor.status === 'contradiction' ||
      safetyFactor.status === 'contradiction';

    // Compute total weighted score
    let totalScore =
      prodFactor.contribution +
      kwFactor.contribution +
      appFactor.contribution +
      envFactor.contribution +
      paramFactor.contribution +
      safetyFactor.contribution;

    // Contradiction Penalty (Step 3 & Step 11):
    // Conflicting products/applications must NOT receive high scores.
    // If a contradiction is detected, cap total score at 0.20 so it never passes high/related thresholds.
    if (hasContradiction) {
      totalScore = Math.min(totalScore, 0.20);
    }

    // Categorization according to strict quality thresholds
    let category: RecommendationCategory = 'low';
    let categoryLabel: RecommendationCategoryLabel = 'LOW RELEVANCE';

    if (!hasContradiction && totalScore >= 0.55 && prodFactor.status === 'matched') {
      category = 'high';
      categoryLabel = 'HIGH RELEVANCE';
    } else if (!hasContradiction && totalScore >= 0.35) {
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

    // 7. SPECIFICATION SPECIFICITY EVALUATION (Phase E)
    const specDetail = this.determineSpecificity(
      reqs,
      reqContext,
      standard,
      prodFactor,
      appFactor,
      kwFactor,
      hasContradiction
    );

    const factorStatuses = {
      productCategory: prodFactor,
      keywordsTitleScope: kwFactor,
      application: appFactor,
      environment: envFactor,
      technicalParameters: paramFactor,
      safetyTesting: safetyFactor,
      specificationSpecificity: specDetail,
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
      specificityTier: specDetail.tier,
      specificityTierLabel: specDetail.tierLabel,
      specificationSpecificity: specDetail,
      factorStatuses,
      reason,
      evidence,
      traceabilityChain,
      comparison,
    };
  }

  // ------------------------------------------------------------
  // Phase E: Specificity Component & Deterministic Hierarchy
  // ------------------------------------------------------------
  private determineSpecificity(
    reqs: StructuredRequirements,
    reqContext: ReturnType<typeof this.extractRequirementContext>,
    standard: VerifiedStandard,
    prodFactor: FactorDetail,
    appFactor: FactorDetail,
    _kwFactor: FactorDetail,
    hasContradiction: boolean
  ): SpecificityDetail {
    // Mandatory Rule: Contradictions strictly dominate specificity
    if (hasContradiction) {
      return {
        tier: 6,
        tierLabel: 'Tier 6: Generic / Contradicted Match',
        score: 0.0,
        weight: 0.0,
        contribution: 0.0,
        status: 'contradiction',
        evidence: ['Requirement contains conflicting parameters with standard scope.'],
        label: 'Specification Specificity',
      };
    }

    const reqForm = detectRequirementProductForm(reqs, reqContext.fullText);
    const stdForm = detectStandardProductForm(standard);
    const fullText = reqContext.fullText;
    const prodName = (reqs.product?.name || '').toLowerCase();
    const stdProductTypes = (standard.product_types || []).map((p) => p.toLowerCase());

    const exactProductTypeMatch = stdProductTypes.some((pt) =>
      fullText.includes(pt) || prodName.includes(pt) || matchesSynonym(prodName, pt)
    );

    const exactFormMatch = reqForm !== 'unknown' && stdForm !== 'unknown' && reqForm === stdForm;
    const appMatched = appFactor.status === 'matched';

    // Civil broad check: IS 10262 (mix design) or IS 456 (plain/reinforced concrete code) when specific finished goods are requested
    const isCivilBroad =
      (standard.standard_number.includes('10262') || standard.standard_number === 'IS 456') &&
      (fullText.includes('pipe') ||
        fullText.includes('culvert') ||
        fullText.includes('block') ||
        fullText.includes('brick') ||
        fullText.includes('water tank') ||
        fullText.includes('liquid retaining'));

    // Cable broad check: generic cable standards like IS 1554 when specific cable types (XLPE, flexible cords) are requested
    const isCableBroad =
      standard.standard_number.includes('1554') &&
      (fullText.includes('xlpe') ||
        fullText.includes('cross-linked') ||
        fullText.includes('flexible cord') ||
        fullText.includes('appliance cord'));

    // Safety broad check: firefighter gloves IS 16874 when mechanical gloves or protective clothing are requested
    const hasClothing =
      fullText.includes('clothing') ||
      fullText.includes('suit') ||
      fullText.includes('jacket') ||
      fullText.includes('coat') ||
      fullText.includes('garment');
    const isGloveBroad =
      standard.standard_number.includes('16874') &&
      (fullText.includes('mechanical') ||
        fullText.includes('abrasion') ||
        fullText.includes('puncture') ||
        hasClothing);

    const evidence: string[] = [];
    let tier: SpecificityTier = 4;
    let tierLabel = 'Tier 4: Related Product / Component Match';
    let score = 0.50;
    let status: FactorStatus = 'matched';

    if (isCivilBroad || isCableBroad || isGloveBroad) {
      tier = 5;
      tierLabel = 'Tier 5: Broad Domain Standard';
      score = 0.30;
      status = 'not_matched';
      evidence.push('Broad domain standard; product form is less specific than requested procurement item.');
    } else if ((exactFormMatch || exactProductTypeMatch) && appMatched) {
      tier = 1;
      tierLabel = 'Tier 1: Exact Product Form & Application Match';
      score = 1.0;
      status = 'matched';
      if (exactFormMatch) {
        evidence.push('Exact product form match');
      }
      if (exactProductTypeMatch) {
        evidence.push('Standard scope directly covers requested product');
      }
      evidence.push('Application aligns with standard scope');
    } else if (exactFormMatch || exactProductTypeMatch) {
      tier = 2;
      tierLabel = 'Tier 2: Exact Product Form Match';
      score = 0.85;
      status = 'matched';
      if (exactFormMatch) {
        evidence.push('Exact product form match');
      }
      if (exactProductTypeMatch) {
        evidence.push('Standard scope directly covers requested product');
      }
    } else if (prodFactor.score >= 0.85 || prodFactor.status === 'matched') {
      tier = 3;
      tierLabel = 'Tier 3: Specific Product Family Match';
      score = 0.70;
      status = 'matched';
      evidence.push(`Standard aligns with requested product family (${standard.subcategory || standard.category})`);
    } else if (prodFactor.score >= 0.40) {
      tier = 4;
      tierLabel = 'Tier 4: Related Product / Component Match';
      score = 0.50;
      status = 'matched';
      evidence.push(`Allied component or related specification standard (${standard.subcategory})`);
    } else {
      tier = 6;
      tierLabel = 'Tier 6: Generic / Contradicted Match';
      score = 0.15;
      status = 'not_matched';
      evidence.push('Generic domain reference; low specificity alignment.');
    }

    return {
      tier,
      tierLabel,
      score,
      weight: 0.0,
      contribution: 0.0,
      status,
      evidence,
      label: 'Specification Specificity',
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

    // Specificity & Scope Precision (Phase E)
    if (factorStatuses.specificationSpecificity && factorStatuses.specificationSpecificity.evidence.length > 0) {
      evidence.push({
        sourceType: 'standard_data',
        label: 'Specificity & Scope Precision',
        value: factorStatuses.specificationSpecificity.evidence.join('; '),
        matched: factorStatuses.specificationSpecificity.status === 'matched',
        field: 'specification_specificity',
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
          : factorStatuses.productCategory.status === 'contradiction'
          ? factorStatuses.productCategory.evidence[0] || 'Product form contradiction'
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
          : factorStatuses.application.status === 'contradiction'
          ? standard.subcategory || standard.category
          : 'Not available in current standard record',
      status: hasReqApp ? factorStatuses.application.status : 'not_available',
      note:
        factorStatuses.application.status === 'matched'
          ? 'Application scope matched'
          : factorStatuses.application.status === 'contradiction'
          ? factorStatuses.application.evidence[0] || 'Application contradiction'
          : undefined,
    });

    // 3. Environmental Conditions
    const hasReqEnv = Boolean(reqs.environment && reqs.environment.length > 0);
    comparisons.push({
      field: 'Environmental Conditions',
      requirementValue: hasReqEnv ? reqs.environment.map((e) => e.name).join(', ') : null,
      standardValue:
        factorStatuses.environment.status === 'matched'
          ? factorStatuses.environment.evidence[0] || 'Outdoor / Environmental suitability'
          : factorStatuses.environment.status === 'contradiction'
          ? standard.subcategory || standard.category
          : 'Not available in current standard record',
      status: hasReqEnv ? factorStatuses.environment.status : 'not_available',
      note:
        factorStatuses.environment.status === 'matched'
          ? 'Environment factor matched'
          : factorStatuses.environment.status === 'contradiction'
          ? factorStatuses.environment.evidence[0] || 'Environmental condition contradiction'
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
          : factorStatuses.technicalParameters.status === 'contradiction'
          ? factorStatuses.technicalParameters.evidence[0] || 'Parameter contradiction'
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

    // PRODUCT FORM CONTRADICTION CHECK (Phase B: Step 3 & Step 11)
    const reqForm = detectRequirementProductForm(reqs, fullText);
    const stdForm = detectStandardProductForm(standard);
    const formContradiction = checkProductFormContradiction(reqForm, stdForm, reqs, standard);

    if (formContradiction.isContradiction) {
      return {
        status: 'contradiction',
        score: 0,
        weight,
        contribution: 0,
        evidence: [formContradiction.reason || 'Product form contradiction detected.'],
        label: 'Product / Category Match',
      };
    }

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
    // 1. Exact Product Form Match
    if (reqForm !== 'unknown' && stdForm !== 'unknown' && reqForm === stdForm) {
      matchScore = 1.0;
      evidence.push(`Exact Product Match: ${formatProductFormLabel(stdForm)} (${standard.subcategory || standard.title})`);
    }

    // 2. Lighting Domain Product Specificity Hierarchy
    else if (reqContext.domains.isLighting) {
      if (reqForm === 'street_road_luminaire') {
        if (stdForm === 'general_luminaire') {
          matchScore = 0.65;
          evidence.push(`Product Alignment: Luminaire System (${standard.subcategory})`);
        }
      } else if (reqForm === 'emergency_luminaire') {
        if (stdForm === 'general_luminaire') {
          matchScore = 0.50;
          evidence.push(`Product Alignment: Luminaire System (${standard.subcategory})`);
        }
      } else if (reqForm === 'floodlight') {
        if (stdForm === 'general_luminaire') {
          matchScore = 0.50;
          evidence.push(`Product Alignment: Luminaire System (${standard.subcategory})`);
        }
      } else if (reqForm === 'general_luminaire') {
        if (stdForm === 'street_road_luminaire' || stdForm === 'emergency_luminaire' || stdForm === 'floodlight') {
          matchScore = 0.60;
          evidence.push(`Allied Luminaire Type: ${formatProductFormLabel(stdForm)} (${standard.subcategory})`);
        } else if (stdForm === 'self_ballasted_lamp' || stdForm === 'led_module') {
          matchScore = 0.20;
          evidence.push(`Component Reference: ${standard.subcategory}`);
        }
      } else {
        // Non-classified lighting query: evaluate normally
        for (const pt of stdProductTypes) {
          if (prodName.includes(pt) || pt.includes(prodName)) {
            matchScore = Math.max(matchScore, 0.95);
            evidence.push(`Product Type: "${pt}"`);
          }
        }
      }
    }

    // 3. Cables Domain Specificity Hierarchy
    else if (reqContext.domains.isCable) {
      const isHighTemp = fullText.includes('high temperature') || fullText.includes('heat resistant');
      const isStdHighTemp =
        stdTitle.includes('high temperature') ||
        stdTitle.includes('silicone') ||
        (standard.keywords || []).some((k) => k.toLowerCase().includes('temperature'));

      const isXlpe = fullText.includes('xlpe') || fullText.includes('cross-linked') || fullText.includes('crosslinked');
      const isStdXlpe = stdTitle.includes('cross-linked') || stdTitle.includes('crosslinked') || stdSubcat.includes('xlpe');

      const isFlexibleCord = fullText.includes('flexible cord') || fullText.includes('appliance cord') || (fullText.includes('cord') && fullText.includes('flexible'));
      const isStdFlexibleCord = stdTitle.includes('cords') || stdSubcat.includes('cords') || (standard.product_types || []).some((p) => p.toLowerCase().includes('cord'));

      const isPvc = !isXlpe && !isFlexibleCord && (fullText.includes('pvc') || fullText.includes('polyvinyl chloride'));
      const isStdPvc = stdTitle.includes('pvc') || stdTitle.includes('polyvinyl chloride') || stdSubcat.includes('pvc');

      const isAbc = fullText.includes('aerial bunched') || fullText.includes('abc');
      const isStdAbc = stdTitle.includes('aerial bunched') || stdSubcat.includes('aerial bunched');

      const isHffr = fullText.includes('hffr') || fullText.includes('halogen free') || fullText.includes('flame retardant');
      const isStdHffr = stdTitle.includes('halogen free') || stdSubcat.includes('hffr') || stdSubcat.includes('halogen free');

      const isElastomer = fullText.includes('elastomer') || fullText.includes('rubber');
      const isStdElastomer = stdTitle.includes('elastomer') || stdSubcat.includes('elastomer');

      if (isHighTemp && isStdHighTemp) {
        matchScore = 1.0;
        evidence.push('Exact Product Match: High Temperature Cable');
      } else if (isXlpe && isStdXlpe) {
        matchScore = 1.0;
        evidence.push(`Exact Cable Match: XLPE Insulated Cable (${standard.subcategory})`);
      } else if (isFlexibleCord && isStdFlexibleCord) {
        matchScore = 1.0;
        evidence.push(`Exact Cable Match: Flexible Cords (${standard.subcategory})`);
      } else if (isAbc && isStdAbc) {
        matchScore = 1.0;
        evidence.push(`Exact Cable Match: Aerial Bunched Cable (${standard.subcategory})`);
      } else if (isHffr && isStdHffr) {
        matchScore = 1.0;
        evidence.push(`Exact Cable Match: Halogen Free Flame Retardant Cable (${standard.subcategory})`);
      } else if (isElastomer && isStdElastomer) {
        matchScore = 1.0;
        evidence.push(`Exact Cable Match: Elastomer Insulated Cable (${standard.subcategory})`);
      } else if (isPvc && isStdPvc) {
        matchScore = 1.0;
        evidence.push(`Exact Cable Match: PVC Insulated Cable (${standard.subcategory})`);
      } else if (stdCategory.includes('cables')) {
        matchScore = 0.60;
        evidence.push(`Allied Cable Category: ${standard.subcategory}`);
      }
    }

    // 4. Construction Domain Specificity Hierarchy
    else if (reqContext.domains.isConstruction) {
      const hasAggregate = fullText.includes('aggregate') || fullText.includes('crushed stone');
      const hasPipe = fullText.includes('pipe') || fullText.includes('culvert');
      const hasBlock = prodName.includes('block') || fullText.includes('block') || (fullText.includes('masonry') && !fullText.includes('brick'));
      const hasBrick = prodName.includes('brick') || (fullText.includes('brick') && !prodName.includes('block'));
      const hasWater = fullText.includes('water tank') || fullText.includes('liquid retaining') || fullText.includes('aqueous');
      const hasSteel = fullText.includes('steel') || fullText.includes('reinforcement') || fullText.includes('rebar');
      const hasCement = fullText.includes('cement');
      const hasMixDesign = fullText.includes('mix proportioning') || fullText.includes('mix design');
      const hasConcrete = fullText.includes('concrete');

      const stdIsAggregate = stdCategory.includes('aggregate') || stdTitle.includes('aggregate');
      const stdIsPipe = stdCategory.includes('pipe') || stdTitle.includes('pipe');
      const stdIsBlock = stdCategory.includes('masonry') || stdSubcat.includes('block');
      const stdIsBrick = stdCategory.includes('brick') || stdTitle.includes('brick');
      const stdIsWater = stdCategory.includes('water retaining') || stdTitle.includes('aqueous');
      const stdIsSteel = stdCategory.includes('steel') || stdTitle.includes('steel') || stdTitle.includes('reinforcement');
      const stdIsCement = stdCategory.includes('cement') || stdTitle.includes('cement');
      const stdIsMixDesign = standard.standard_number.includes('10262') || stdTitle.includes('mix proportioning');
      const stdIsConcrete = stdCategory.includes('concrete') || stdTitle.includes('concrete');

      const isSpecificFinishedProduct = hasPipe || hasBlock || hasBrick || hasWater;

      if (hasAggregate && stdIsAggregate) {
        matchScore = 1.0;
        evidence.push(`Exact Product Match: Aggregates (${standard.subcategory})`);
      } else if (hasPipe && stdIsPipe) {
        matchScore = 1.0;
        evidence.push(`Exact Product Match: Concrete Pipes (${standard.subcategory})`);
      } else if (hasBlock && stdIsBlock) {
        matchScore = 1.0;
        evidence.push(`Exact Product Match: Concrete Masonry Blocks (${standard.subcategory})`);
      } else if (hasBrick && stdIsBrick) {
        matchScore = 1.0;
        evidence.push(`Exact Product Match: Bricks (${standard.subcategory})`);
      } else if (hasWater && stdIsWater) {
        matchScore = 1.0;
        evidence.push(`Exact Product Match: Liquid Retaining Structures (${standard.subcategory})`);
      } else if (hasSteel && stdIsSteel) {
        matchScore = 1.0;
        evidence.push(`Exact Product Match: Reinforcing Steel (${standard.subcategory})`);
      } else if (hasCement && stdIsCement) {
        matchScore = 1.0;
        evidence.push(`Exact Product Match: Cement (${standard.subcategory})`);
      } else if (hasMixDesign && stdIsMixDesign) {
        matchScore = 1.0;
        evidence.push(`Exact Product Match: Concrete Mix Design (${standard.subcategory})`);
      } else if (hasConcrete && stdIsConcrete) {
        if (isSpecificFinishedProduct) {
          matchScore = 0.55;
          evidence.push(`Allied Concrete Material Reference: Mix / Structural Code (${standard.subcategory})`);
        } else {
          matchScore = 1.0;
          evidence.push(`Product Alignment: Concrete Structural Standard (${standard.subcategory})`);
        }
      } else if (stdCategory.includes('construction')) {
        matchScore = 0.50;
        evidence.push(`Construction Domain: ${standard.category}`);
      }
    }

    // 5. Safety & PPE Domain Specificity Hierarchy
    else if (reqContext.domains.isSafety) {
      const hasFootwear = fullText.includes('footwear') || fullText.includes('shoe') || fullText.includes('boot');
      const hasMechanicalGloves = (fullText.includes('glove') || fullText.includes('hand protection')) && (fullText.includes('mechanical') || fullText.includes('abrasion') || fullText.includes('puncture'));
      const hasGloves = fullText.includes('glove') || fullText.includes('hand protection');
      const hasFirefighter = fullText.includes('firefighter') || fullText.includes('fire fighting') || fullText.includes('fire brigade');
      const hasClothing = fullText.includes('clothing') || fullText.includes('suit') || fullText.includes('jacket') || fullText.includes('coat') || fullText.includes('garment');
      const hasHeatFlame = fullText.includes('heat') || fullText.includes('flame');
      const hasRespiratory = fullText.includes('respiratory') || fullText.includes('respirator') || fullText.includes('filtering');

      const stdIsFootwear = stdCategory.includes('footwear') || stdTitle.includes('footwear') || stdSubcat.includes('footwear');
      const stdIsMechanicalGloves = stdTitle.includes('mechanical') || (standard.scope || '').toLowerCase().includes('mechanical');
      const stdIsGloves = stdTitle.includes('glove') || stdSubcat.includes('hand protection');
      const stdIsClothing = stdTitle.includes('clothing') || stdSubcat.includes('clothing') || stdSubcat.includes('protective clothing');
      const stdIsFirefighter = stdCategory.includes('firefighter') || stdTitle.includes('firefighter');
      const stdIsHeatFlame = stdTitle.includes('heat and flame') || stdSubcat.includes('heat and flame');
      const stdIsRespiratory = stdCategory.includes('respiratory') || stdTitle.includes('respiratory');

      if (hasFootwear && stdIsFootwear) {
        matchScore = 1.0;
        evidence.push(`Product Alignment: Safety Footwear (${standard.subcategory})`);
      } else if (hasMechanicalGloves && stdIsMechanicalGloves) {
        matchScore = 1.0;
        evidence.push(`Exact Product Match: Mechanical Risk Protective Gloves (${standard.subcategory})`);
      } else if (hasFirefighter && stdIsFirefighter) {
        if (hasClothing && !hasGloves) {
          if (stdIsClothing) {
            matchScore = 1.0;
            evidence.push(`Exact Product Match: Firefighter Protective Clothing (${standard.subcategory})`);
          } else {
            matchScore = 0.55;
            evidence.push(`Allied Firefighter Equipment: ${standard.subcategory}`);
          }
        } else if (hasGloves && !hasClothing) {
          if (stdIsGloves) {
            matchScore = 1.0;
            evidence.push(`Exact Product Match: Firefighter Protective Gloves (${standard.subcategory})`);
          } else {
            matchScore = 0.55;
            evidence.push(`Allied Firefighter Equipment: ${standard.subcategory}`);
          }
        } else {
          matchScore = 1.0;
          evidence.push(`Product Alignment: Firefighter Equipment (${standard.subcategory})`);
        }
      } else if (hasHeatFlame && stdIsHeatFlame) {
        matchScore = 1.0;
        evidence.push(`Product Alignment: Heat & Flame Protection (${standard.subcategory})`);
      } else if (hasRespiratory && stdIsRespiratory) {
        matchScore = 1.0;
        evidence.push(`Product Alignment: Respiratory Protection (${standard.subcategory})`);
      } else if (hasGloves && stdIsGloves) {
        if (hasMechanicalGloves && !stdIsMechanicalGloves) {
          matchScore = 0.55;
          evidence.push(`Allied Hand Protection: Other Hazard Class (${standard.subcategory})`);
        } else {
          matchScore = 1.0;
          evidence.push(`Product Alignment: Hand Protection (${standard.subcategory})`);
        }
      } else if (stdCategory.includes('safety')) {
        matchScore = 0.55;
        evidence.push(`Safety Domain: ${standard.category}`);
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
    const coveredTokens = new Set<string>();

    // 1. Multi-Word Exact Product Phrases (Highest Value Tier)
    let exactPhraseScore = 0;
    for (const phrase of EXACT_PRODUCT_PHRASES) {
      if (reqContext.fullText.includes(phrase)) {
        if (
          stdTitleLower.includes(phrase) ||
          stdScopeLower.includes(phrase) ||
          stdKeywords.some((k) => k.includes(phrase))
        ) {
          exactPhraseScore += 0.50;
          evidence.push(`Exact Phrase: "${phrase}"`);
          for (const tok of tokenize(phrase)) {
            coveredTokens.add(tok);
          }
        }
      }
    }

    // 2. Domain Phrases (Strong Value Tier)
    let domainPhraseScore = 0;
    for (const phrase of reqContext.phrases) {
      if (
        stdTitleLower.includes(phrase) ||
        stdScopeLower.includes(phrase) ||
        stdKeywords.some((k) => k.includes(phrase))
      ) {
        domainPhraseScore += 0.35;
        evidence.push(`Domain Phrase: "${phrase}"`);
        for (const tok of tokenize(phrase)) {
          coveredTokens.add(tok);
        }
      }
    }

    const phraseScore = Math.min(1.0, exactPhraseScore + domainPhraseScore);

    // 3. Keyword & Token Overlap (Single Tokens with de-duplication & generic penalty)
    let specificKwHits = 0;
    let genericKwHits = 0;
    let specificKwTotal = 0;

    for (const kw of stdKeywords) {
      const kwIsGeneric = GENERIC_KEYWORDS.has(kw);
      if (!kwIsGeneric) specificKwTotal++;

      // De-duplication: do not award token score for words already credited in a matched multi-word phrase
      if (coveredTokens.has(kw)) {
        continue;
      }

      let kwMatched = false;
      let matchedSpecific = false;
      let matchedGeneric = false;

      for (const tok of reqContext.all) {
        if (coveredTokens.has(tok)) continue;
        if (tok.length > 2 && (kw === tok || kw.includes(tok))) {
          kwMatched = true;
          if (GENERIC_KEYWORDS.has(tok) || kwIsGeneric) {
            matchedGeneric = true;
          } else {
            matchedSpecific = true;
          }
        }
      }

      if (kwMatched) {
        if (matchedSpecific) {
          specificKwHits++;
        } else if (matchedGeneric) {
          genericKwHits++;
        }
        if (evidence.length < 5) evidence.push(kw);
      }
    }

    // Generic tokens have strictly capped contribution (max 0.15); specific domain tokens count higher
    const specificTokenScore = specificKwTotal > 0 ? Math.min(0.85, specificKwHits / Math.max(2, specificKwTotal)) : 0;
    const genericTokenScore = Math.min(0.15, genericKwHits * 0.05);
    const tokenScore = specificTokenScore + genericTokenScore;

    // Combined score:
    // If exact product phrases matched fully (score >= 0.95), finalScore is 1.0 (exact score preservation)
    let finalScore = 0;
    if (phraseScore >= 0.95) {
      finalScore = 1.0;
    } else if (phraseScore > 0) {
      finalScore = Math.min(1.0, phraseScore * 0.75 + tokenScore * 0.25);
    } else {
      // Without any multi-word phrase match, generic keywords are capped at 0.15 and overall at 0.40
      finalScore = Math.min(0.40, tokenScore);
    }

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
        evidence: ['No application domain specified in procurement requirements.'],
        label: 'Application Domain',
      };
    }

    const stdScope = (standard.scope || '').toLowerCase();
    const stdTitle = standard.title.toLowerCase();
    const stdCategory = standard.category.toLowerCase();
    const stdSubcat = standard.subcategory.toLowerCase();
    const stdKeywords = (standard.keywords || []).join(' ').toLowerCase();
    const combinedStdText = `${stdScope} ${stdTitle} ${stdCategory} ${stdSubcat} ${stdKeywords}`;

    const evidence: string[] = [];
    let matchScore = 0;
    let isContradiction = false;
    let contradictionReason = '';

    // Check specific application domains:
    const isReqStreetOrRoad =
      fullText.includes('street') ||
      fullText.includes('road') ||
      fullText.includes('municipal') ||
      fullText.includes('highway') ||
      appStr.includes('street') ||
      appStr.includes('road');

    const isReqEmergency =
      fullText.includes('emergency') ||
      appStr.includes('emergency');

    const isReqFloodlight =
      fullText.includes('floodlight') ||
      fullText.includes('flood light') ||
      fullText.includes('floodlighting') ||
      appStr.includes('flood');

    const isStdEmergency =
      stdSubcat.includes('emergency') ||
      stdTitle.includes('emergency') ||
      standard.standard_number.includes('10322 (Part 5/Sec 8)');

    const isStdFloodlight =
      stdSubcat.includes('floodlight') ||
      stdTitle.includes('floodlight') ||
      standard.standard_number.includes('10322 (Part 5/Sec 5)');

    const isStdStreetOrRoad =
      stdSubcat.includes('road') ||
      stdSubcat.includes('street') ||
      stdTitle.includes('road') ||
      stdTitle.includes('street') ||
      combinedStdText.includes('road lighting') ||
      combinedStdText.includes('street lighting');

    if (isReqStreetOrRoad) {
      if (isStdStreetOrRoad) {
        matchScore = 1.0;
        evidence.push('Direct Application: Road & Street Lighting');
      } else if (isStdEmergency) {
        isContradiction = true;
        contradictionReason = 'Contradiction: Requirement specifies municipal road/street lighting, while this standard is specifically for emergency lighting.';
      } else if (isStdFloodlight) {
        isContradiction = true;
        contradictionReason = 'Contradiction: Requirement specifies municipal road/street lighting, while this standard is specifically for floodlighting.';
      } else if (
        stdSubcat.includes('luminaires') ||
        stdSubcat.includes('luminaire performance')
      ) {
        matchScore = 0.35;
        evidence.push('Allied Application: General Luminaire Infrastructure');
      } else {
        matchScore = 0.0;
      }
    } else if (isReqEmergency) {
      if (isStdEmergency) {
        matchScore = 1.0;
        evidence.push('Direct Application: Emergency Lighting');
      } else if (isStdStreetOrRoad) {
        isContradiction = true;
        contradictionReason = 'Contradiction: Requirement specifies emergency lighting, while this standard is dedicated to road and street lighting.';
      } else if (isStdFloodlight) {
        isContradiction = true;
        contradictionReason = 'Contradiction: Requirement specifies emergency lighting, while this standard is dedicated to floodlighting.';
      } else if (stdSubcat.includes('luminaires')) {
        matchScore = 0.35;
        evidence.push('Allied Application: General Luminaire Infrastructure');
      } else {
        matchScore = 0.0;
      }
    } else if (isReqFloodlight) {
      if (isStdFloodlight) {
        matchScore = 1.0;
        evidence.push('Direct Application: Floodlighting');
      } else if (isStdStreetOrRoad) {
        isContradiction = true;
        contradictionReason = 'Contradiction: Requirement specifies floodlighting, while this standard is dedicated to road and street lighting.';
      } else if (isStdEmergency) {
        isContradiction = true;
        contradictionReason = 'Contradiction: Requirement specifies floodlighting, while this standard is dedicated to emergency lighting.';
      } else if (stdSubcat.includes('luminaires')) {
        matchScore = 0.35;
        evidence.push('Allied Application: General Luminaire Infrastructure');
      } else {
        matchScore = 0.0;
      }
    } else {
      // General application checking for industrial, construction, underground, etc.
      const appDomains = [
        'industrial', 'construction', 'building', 'structural',
        'reinforcement', 'concrete',
        'underground', 'marine', 'firefighting', 'general lighting',
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

    if (isContradiction) {
      return {
        status: 'contradiction',
        score: 0,
        weight,
        contribution: 0,
        evidence: [contradictionReason],
        label: 'Application Domain',
      };
    }

    const finalScore = Math.min(1.0, matchScore);
    const status: FactorStatus = finalScore >= 0.35 ? 'matched' : (matchScore === 0 && evidence.length === 0 ? 'not_available' : 'not_matched');

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
        evidence: ['No environmental conditions specified in procurement requirements.'],
        label: 'Environmental Conditions',
      };
    }

    const stdScope = (standard.scope || '').toLowerCase();
    const stdKeywords = (standard.keywords || []).join(' ').toLowerCase();
    const stdTitle = standard.title.toLowerCase();
    const combined = `${stdScope} ${stdKeywords} ${stdTitle}`;

    // Contradiction Check: Outdoor requirement vs strictly Indoor standard
    // IS 10322 (Part 5/Sec 1) explicitly specifies indoor fixed luminaires
    const isIndoorOnlyStandard =
      standard.standard_number.includes('10322 (Part 5/Sec 1)') ||
      (stdScope.includes('indoor use') && !stdScope.includes('outdoor'));

    if (hasOutdoor && isIndoorOnlyStandard) {
      return {
        status: 'contradiction',
        score: 0,
        weight,
        contribution: 0,
        evidence: [
          'Contradiction: Requirement specifies outdoor weather-resistant application, while standard IS 10322 (Part 5/Sec 1) is strictly for indoor use.',
        ],
        label: 'Environmental Conditions',
      };
    }

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
    const status: FactorStatus = finalScore >= 0.30 ? 'matched' : 'not_available';

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

    if (params.length === 0) {
      return {
        status: 'not_available',
        score: 0,
        weight,
        contribution: 0,
        evidence: ['No technical parameters provided in procurement requirements.'],
        label: 'Technical Parameters',
      };
    }

    if (!standard.technical_parameters && !standard.performance_requirements) {
      const evidence = params.map(
        (p) => `Technical parameter: ${p.parameter} (${p.value}${p.unit ? ' ' + p.unit : ''}) — Status: Not recorded in verified reference dataset for this standard.`
      );
      return {
        status: 'not_available',
        score: 0,
        weight,
        contribution: 0,
        evidence,
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
        evidence.push(`Technical parameter: ${p.parameter} (${p.value}${p.unit ? ' ' + p.unit : ''}) matches standard specification.`);
      } else {
        evidence.push(`Technical parameter: ${p.parameter} (${p.value}${p.unit ? ' ' + p.unit : ''}) — Status: Not recorded in verified reference dataset for this standard.`);
      }
    }

    const finalScore = Math.min(1.0, matchCount / Math.max(1, params.length));
    const status: FactorStatus = finalScore > 0 ? 'matched' : 'not_available';

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
        evidence: ['No specific safety or testing requirements requested in procurement specification.'],
        label: 'Safety & Testing',
      };
    }

    const hasStandardTesting = Boolean(standard.testing_requirements);
    const hasStandardSafety = Boolean(standard.safety_requirements);

    if (!hasStandardTesting && !hasStandardSafety) {
      const evidence = [...reqSafety, ...reqTesting].map(
        (s) => `Safety/Testing requirement: "${s.name}" — Status: Not recorded in verified reference dataset for this standard.`
      );
      return {
        status: 'not_available',
        score: 0,
        weight,
        contribution: 0,
        evidence,
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
        evidence.push(`Safety/Testing: "${s.name}" verified in standard requirements.`);
      } else {
        evidence.push(`Safety/Testing requirement: "${s.name}" — Status: Not available in verified reference dataset for this standard.`);
      }
    }

    const finalScore = Math.min(1.0, hits / totalReq);
    const status: FactorStatus = finalScore >= 0.30 ? 'matched' : 'not_available';

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

    // Check if there are contradictions
    const contradictions: string[] = [];
    if (factors.productCategory.status === 'contradiction' && factors.productCategory.evidence.length > 0) {
      contradictions.push(factors.productCategory.evidence[0]);
    }
    if (factors.application.status === 'contradiction' && factors.application.evidence.length > 0) {
      contradictions.push(factors.application.evidence[0]);
    }
    if (factors.environment.status === 'contradiction' && factors.environment.evidence.length > 0) {
      contradictions.push(factors.environment.evidence[0]);
    }
    if (factors.technicalParameters.status === 'contradiction' && factors.technicalParameters.evidence.length > 0) {
      contradictions.push(factors.technicalParameters.evidence[0]);
    }

    if (contradictions.length > 0) {
      return `Not recommended: Contains direct procurement contradictions (${contradictions.join('; ')}).`;
    }

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
