// ============================================================
// ISutra — AI Output Validation & Sanitization
// Phase A: Trustworthy Matching Readiness & Data Integrity
// ============================================================

import type {
  StructuredRequirements,
  ConfidenceLevel,
  ClarificationQuestion,
  TechnicalParameterItem,
} from './types';

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

function normalizeConfidence(val: any): ConfidenceLevel {
  if (val === 'high' || val === 'medium' || val === 'needs_review') {
    return val;
  }
  return 'medium';
}

/**
 * Evaluates whether a product name is sufficiently specific and meaningful
 * to allow accurate and trustworthy BIS standards matching.
 * Returns false for placeholders, generic umbrella terms, and vague inputs.
 */
export function isMeaningfulProduct(name?: string | null): boolean {
  if (!name) return false;
  const clean = name
    .trim()
    .toLowerCase()
    .replace(/^(procure|supply|provide|need|purchase|requirement for|buy)\s+/i, '')
    .trim();

  if (clean.length < 3) return false;

  // Generic placeholder terms
  const genericPlaceholders = [
    'unspecified product',
    'unspecified equipment',
    'unspecified',
    'unknown',
    'something',
    'anything',
    'item',
    'items',
    'product',
    'products',
    'equipment',
    'material',
    'materials',
    'supplies',
    'general procurement',
    'general equipment',
    'specialized equipment',
    'need something',
    'goods',
  ];

  if (genericPlaceholders.includes(clean)) {
    return false;
  }

  // Broad umbrella category terms that lack specific product definition
  const broadUmbrellaRegex =
    /^(good quality\s+|standard\s+|commercial\s+|industrial\s+)?(lighting equipment|electrical equipment|electronic equipment|mechanical equipment|general equipment|office equipment|safety equipment|protective equipment|construction equipment|construction materials|hardware)(\s+(for|in|of|with)\s+.*)?$/i;

  if (broadUmbrellaRegex.test(clean)) {
    return false;
  }

  return true;
}

/**
 * Evaluates whether a product category is meaningful or merely a generic placeholder.
 */
export function isMeaningfulCategory(category?: string | null): boolean {
  if (!category) return false;
  const clean = category.trim().toLowerCase();
  const genericCategories = [
    'general procurement',
    'unspecified',
    'general',
    'other',
    'miscellaneous',
    'general equipment',
    'specialized equipment',
  ];
  return !genericCategories.includes(clean);
}

/**
 * Identifies blocking missing information that strictly prevents standards matching.
 * Distinguishes critical product/context gaps from optional/informational missing fields (e.g. quantity, mounting).
 */
export function getBlockingMissingInformation(params: {
  productName: string;
  productCategory: string;
  technicalParametersCount: number;
  hasApplication: boolean;
  overallConfidence: ConfidenceLevel;
  originalText: string;
}): string[] {
  const blocking: string[] = [];
  const meaningfulProduct = isMeaningfulProduct(params.productName);
  const meaningfulCategory = isMeaningfulCategory(params.productCategory);

  // 1. Missing or unmeaningful product name
  if (!meaningfulProduct) {
    if (
      !params.productName ||
      params.productName.toLowerCase().includes('unspecified') ||
      params.productName.toLowerCase().includes('unknown')
    ) {
      blocking.push('Specific product name or equipment type is missing.');
    } else {
      blocking.push(`Product '${params.productName}' is too vague to identify matching standards.`);
    }
  }

  // 2. Missing or generic category when product is also ambiguous
  if (!meaningfulCategory && !meaningfulProduct) {
    blocking.push('Product category is unspecified or generic.');
  }

  // 3. Extremely vague requirement with no product, application, or parameters
  if (!meaningfulProduct && !params.hasApplication && params.technicalParametersCount === 0) {
    blocking.push('Specification lacks technical parameters or application context.');
  }

  // 4. If overall confidence is needs_review because of lack of meaningful product context
  if (params.overallConfidence === 'needs_review' && !meaningfulProduct) {
    if (!blocking.some((b) => b.includes('too vague') || b.includes('lacks technical'))) {
      blocking.push('Procurement requirement requires further clarification before standards matching.');
    }
  }

  return Array.from(new Set(blocking));
}

/**
 * Determines whether a requirement is ready for standards matching.
 * Matching is only permitted when there are zero blocking information gaps.
 */
export function determineMatchingReadiness(blockingIssues: string[]): boolean {
  return blockingIssues.length === 0;
}

/**
 * Ensures targeted clarification questions exist when blocking information is detected.
 * Avoids generating duplicate questions if similar questions are already present.
 */
export function ensureClarificationQuestions(
  existingQuestions: ClarificationQuestion[],
  blockingIssues: string[],
  productName: string,
  productCategory: string
): ClarificationQuestion[] {
  const questions = [...existingQuestions];
  const existingTexts = new Set(questions.map((q) => q.question.trim().toLowerCase()));

  const addIfMissing = (question: ClarificationQuestion) => {
    const key = question.question.trim().toLowerCase();
    if (!existingTexts.has(key)) {
      questions.push(question);
      existingTexts.add(key);
    }
  };

  const isProdMeaningful = isMeaningfulProduct(productName);
  const isCatMeaningful = isMeaningfulCategory(productCategory);

  // If product is unknown / unspecified
  if (
    !isProdMeaningful &&
    (!productName ||
      productName.toLowerCase().includes('unspecified') ||
      productName.toLowerCase().includes('unknown'))
  ) {
    addIfMissing({
      id: `q-product-${Date.now()}`,
      field: 'Product Identification',
      question: 'What product or equipment is being procured?',
      options: [
        'LED Street Light / Luminaire',
        'Electric Power Cable / Conductor',
        'Water Storage Tank / Vessel',
        'Solar Photovoltaic Module',
      ],
      suggestedAnswer: 'Specify product type',
    });
  }

  // If category is unclear or generic
  if (!isCatMeaningful) {
    addIfMissing({
      id: `q-category-${Date.now()}`,
      field: 'Product Category',
      question: 'Please specify the product category.',
      options: [
        'Lighting & Luminaires',
        'Cables & Conductors',
        'Storage Tanks & Vessels',
        'Renewable Energy',
      ],
      suggestedAnswer: 'Select primary category',
    });
  }

  // If extremely vague or product is too generic
  if (
    !isProdMeaningful ||
    blockingIssues.some((b) => b.includes('too vague') || b.includes('lacks technical'))
  ) {
    addIfMissing({
      id: `q-details-${Date.now()}`,
      field: 'Specification Scope',
      question: 'Please provide the product type and at least one technical or application detail.',
      options: [
        'Specify wattage / voltage and installation environment',
        'Specify material grade and dimensions',
        'Specify intended application and performance standard',
      ],
      suggestedAnswer: 'Provide technical details',
    });
  }

  return questions;
}

export function validateAndSanitizeRequirements(
  raw: any,
  originalInput: string
): StructuredRequirements {
  const text = (originalInput || '').trim();

  // Product validation
  const rawProductName = raw?.product?.name?.trim() || 'Unspecified Product';
  const rawCategory = raw?.product?.category?.trim() || 'General Procurement';

  // Technical parameters
  const rawParams = Array.isArray(raw?.technical_parameters) ? raw.technical_parameters : [];
  const technical_parameters: TechnicalParameterItem[] = rawParams
    .filter((p: any) => p && typeof p === 'object' && p.parameter)
    .map((p: any) => ({
      id: p.id || generateId('param'),
      parameter: String(p.parameter).trim(),
      value: String(p.value || '').trim(),
      unit: p.unit ? String(p.unit).trim() : '',
      confidence: normalizeConfidence(p.confidence),
      source_text: p.source_text ? String(p.source_text).trim() : undefined,
    }));

  // Helper for arrays of tagged items
  const sanitizeTaggedItems = (items: any, prefix: string) => {
    if (!Array.isArray(items)) return [];
    return items
      .filter(
        (item: any) =>
          item && (typeof item === 'string' || item.name || item.condition || item.description)
      )
      .map((item: any) => {
        if (typeof item === 'string') {
          return {
            id: generateId(prefix),
            name: item.trim(),
            confidence: 'high' as ConfidenceLevel,
          };
        }
        return {
          id: item.id || generateId(prefix),
          name: String(
            item.name || item.condition || item.description || item.standard_or_cert || ''
          ).trim(),
          confidence: normalizeConfidence(item.confidence),
          source_text: item.source_text ? String(item.source_text).trim() : undefined,
        };
      })
      .filter((item) => item.name.length > 0);
  };

  const materials = sanitizeTaggedItems(raw?.materials, 'mat');
  const environment = sanitizeTaggedItems(raw?.environment, 'env');
  const safety_requirements = sanitizeTaggedItems(raw?.safety_requirements, 'safe');
  const performance_requirements = sanitizeTaggedItems(raw?.performance_requirements, 'perf');
  const testing_requirements = sanitizeTaggedItems(raw?.testing_requirements, 'test');
  const installation_requirements = sanitizeTaggedItems(raw?.installation_requirements, 'inst');
  const certification_mentions = sanitizeTaggedItems(raw?.certification_mentions, 'cert');
  const additional_requirements = sanitizeTaggedItems(raw?.additional_requirements, 'add');

  let rawQuantity: string | null = raw?.quantity ? String(raw.quantity).trim() : null;
  let rawQuantitySource: string | undefined = raw?.quantity_source ? String(raw.quantity_source).trim() : undefined;

  // Harmonize technical parameters with materials, installation, safety, and quantity
  const existingParamNames = new Set(technical_parameters.map((p) => p.parameter.toLowerCase()));

  // 1. Material
  if (!existingParamNames.has('material') && materials.length > 0) {
    technical_parameters.push({
      id: generateId('param'),
      parameter: 'Material',
      value: materials.map((m) => m.name).join(', '),
      confidence: materials[0].confidence,
      source_text: materials[0].source_text,
    });
  } else if (existingParamNames.has('material') && materials.length === 0) {
    const matParam = technical_parameters.find((p) => p.parameter.toLowerCase() === 'material');
    if (matParam && matParam.value) {
      materials.push({
        id: generateId('mat'),
        name: matParam.value,
        confidence: matParam.confidence,
        source_text: matParam.source_text,
      });
    }
  }

  // 2. Installation / Mounting
  const hasInstParam = existingParamNames.has('installation / mounting') || existingParamNames.has('installation') || existingParamNames.has('mounting');
  if (!hasInstParam && installation_requirements.length > 0) {
    technical_parameters.push({
      id: generateId('param'),
      parameter: 'Installation / Mounting',
      value: installation_requirements.map((i) => i.name).join(', '),
      confidence: installation_requirements[0].confidence,
      source_text: installation_requirements[0].source_text,
    });
  } else if (hasInstParam && installation_requirements.length === 0) {
    const instParam = technical_parameters.find((p) => {
      const low = p.parameter.toLowerCase();
      return low === 'installation / mounting' || low === 'installation' || low === 'mounting';
    });
    if (instParam && instParam.value) {
      installation_requirements.push({
        id: generateId('inst'),
        name: instParam.value,
        confidence: instParam.confidence,
        source_text: instParam.source_text,
      });
    }
  }

  // 3. Safety
  const hasSafetyParam = existingParamNames.has('safety') || existingParamNames.has('surge protection');
  if (!hasSafetyParam && safety_requirements.length > 0) {
    technical_parameters.push({
      id: generateId('param'),
      parameter: 'Safety',
      value: safety_requirements.map((s) => s.name).join(', '),
      confidence: safety_requirements[0].confidence,
      source_text: safety_requirements[0].source_text,
    });
  } else if (hasSafetyParam && safety_requirements.length === 0) {
    const safeParam = technical_parameters.find((p) => {
      const low = p.parameter.toLowerCase();
      return low === 'safety' || low === 'surge protection';
    });
    if (safeParam && safeParam.value) {
      safety_requirements.push({
        id: generateId('safe'),
        name: safeParam.value,
        confidence: safeParam.confidence,
        source_text: safeParam.source_text,
      });
    }
  }

  // 4. Quantity
  if (!existingParamNames.has('quantity') && rawQuantity) {
    technical_parameters.push({
      id: generateId('param'),
      parameter: 'Quantity',
      value: rawQuantitySource && /\d+\s+\w+/.test(rawQuantitySource) ? rawQuantitySource : `${rawQuantity} units`,
      confidence: 'high',
      source_text: rawQuantitySource || `${rawQuantity} units`,
    });
  } else if (existingParamNames.has('quantity') && !rawQuantity) {
    const qtyParam = technical_parameters.find((p) => p.parameter.toLowerCase() === 'quantity');
    if (qtyParam && qtyParam.value) {
      const digits = qtyParam.value.match(/\d+/);
      if (digits) {
        rawQuantity = digits[0];
        rawQuantitySource = qtyParam.value;
      }
    }
  }

  const application = raw?.application ? String(raw.application).trim() : null;
  const application_source = raw?.application_source
    ? String(raw.application_source).trim()
    : undefined;
  const industry = raw?.industry ? String(raw.industry).trim() : null;

  // Missing information
  const rawMissing: string[] = Array.isArray(raw?.missing_information)
    ? raw.missing_information.map((s: any) => String(s).trim()).filter(Boolean)
    : [];

  // Clarification questions
  const rawQuestions = Array.isArray(raw?.clarification_questions)
    ? raw.clarification_questions
    : [];
  let clarification_questions: ClarificationQuestion[] = rawQuestions
    .filter((q: any) => q && q.question)
    .map((q: any, idx: number) => ({
      id: q.id || `q-${idx + 1}`,
      field: q.field || 'General Requirement',
      question: String(q.question).trim(),
      options:
        Array.isArray(q.options) && q.options.length > 0
          ? q.options.map((o: any) => String(o).trim())
          : ['Standard / General', 'Custom requirement', 'Not applicable'],
      suggestedAnswer: q.suggestedAnswer || undefined,
      selectedAnswer: q.selectedAnswer || undefined,
    }));

  // Overall Confidence calculation
  let overall_confidence: ConfidenceLevel = normalizeConfidence(raw?.overall_confidence);
  const meaningfulProduct = isMeaningfulProduct(rawProductName);

  if (meaningfulProduct && technical_parameters.length >= 2) {
    overall_confidence = 'high';
  } else if (!meaningfulProduct || (technical_parameters.length === 0 && text.length < 50)) {
    overall_confidence = 'needs_review';
  }

  // Product confidence
  const productConfidence: ConfidenceLevel = meaningfulProduct
    ? normalizeConfidence(raw?.product?.confidence || 'medium')
    : 'needs_review';

  const product = {
    name: rawProductName,
    category: rawCategory,
    confidence: productConfidence,
    source_text: raw?.product?.source_text || undefined,
  };

  // Phase A: Calculate Blocking Missing Information
  const blocking_missing_information = getBlockingMissingInformation({
    productName: rawProductName,
    productCategory: rawCategory,
    technicalParametersCount: technical_parameters.length,
    hasApplication: Boolean(application),
    overallConfidence: overall_confidence,
    originalText: text,
  });

  // Determine readiness
  const ready_for_matching = determineMatchingReadiness(blocking_missing_information);

  // Ensure targeted clarification questions are present when blocking issues exist
  clarification_questions = ensureClarificationQuestions(
    clarification_questions,
    blocking_missing_information,
    rawProductName,
    rawCategory
  );

  // Merge blocking missing items into general missing_information without duplicates
  const allMissing = Array.from(new Set([...blocking_missing_information, ...rawMissing]));

  return {
    product,
    application,
    application_source,
    industry,
    technical_parameters,
    materials,
    environment,
    safety_requirements,
    performance_requirements,
    testing_requirements,
    installation_requirements,
    certification_mentions,
    quantity: rawQuantity,
    quantity_source: rawQuantitySource,
    additional_requirements,
    missing_information: allMissing,
    blocking_missing_information,
    clarification_questions,
    overall_confidence,
    ready_for_matching,
  };
}
