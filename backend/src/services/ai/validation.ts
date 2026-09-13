// ============================================================
// ISutra — AI Output Validation & Sanitization
// Ensures strict data integrity before storage and client response
// ============================================================

import type { StructuredRequirements, ConfidenceLevel } from './types';

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

function normalizeConfidence(val: any): ConfidenceLevel {
  if (val === 'high' || val === 'medium' || val === 'needs_review') {
    return val;
  }
  return 'medium';
}

export function validateAndSanitizeRequirements(
  raw: any,
  originalInput: string
): StructuredRequirements {
  const text = (originalInput || '').trim();

  // Product validation
  const product = {
    name: raw?.product?.name?.trim() || 'Unspecified Product',
    category: raw?.product?.category?.trim() || 'General Procurement',
    confidence: normalizeConfidence(raw?.product?.confidence),
    source_text: raw?.product?.source_text || undefined,
  };

  // Technical parameters
  const rawParams = Array.isArray(raw?.technical_parameters) ? raw.technical_parameters : [];
  const technical_parameters = rawParams
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
      .filter((item: any) => item && (typeof item === 'string' || item.name || item.condition || item.description))
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
          name: String(item.name || item.condition || item.description || item.standard_or_cert || '').trim(),
          confidence: normalizeConfidence(item.confidence),
          source_text: item.source_text ? String(item.source_text).trim() : undefined,
        };
      })
      .filter(item => item.name.length > 0);
  };

  const materials = sanitizeTaggedItems(raw?.materials, 'mat');
  const environment = sanitizeTaggedItems(raw?.environment, 'env');
  const safety_requirements = sanitizeTaggedItems(raw?.safety_requirements, 'safe');
  const performance_requirements = sanitizeTaggedItems(raw?.performance_requirements, 'perf');
  const testing_requirements = sanitizeTaggedItems(raw?.testing_requirements, 'test');
  const installation_requirements = sanitizeTaggedItems(raw?.installation_requirements, 'inst');
  const certification_mentions = sanitizeTaggedItems(raw?.certification_mentions, 'cert');
  const additional_requirements = sanitizeTaggedItems(raw?.additional_requirements, 'add');

  // Missing information
  const missing_information: string[] = Array.isArray(raw?.missing_information)
    ? raw.missing_information.map((s: any) => String(s).trim()).filter(Boolean)
    : [];

  // Clarification questions
  const rawQuestions = Array.isArray(raw?.clarification_questions) ? raw.clarification_questions : [];
  const clarification_questions = rawQuestions
    .filter((q: any) => q && q.question)
    .map((q: any, idx: number) => ({
      id: q.id || `q-${idx + 1}`,
      field: q.field || 'General Requirement',
      question: String(q.question).trim(),
      options: Array.isArray(q.options) && q.options.length > 0
        ? q.options.map((o: any) => String(o).trim())
        : ['Standard / General', 'Custom requirement', 'Not applicable'],
      suggestedAnswer: q.suggestedAnswer || undefined,
      selectedAnswer: q.selectedAnswer || undefined,
    }));

  // Overall Confidence
  let overall_confidence: ConfidenceLevel = normalizeConfidence(raw?.overall_confidence);
  if (technical_parameters.length >= 2 && product.name !== 'Unspecified Product') {
    overall_confidence = 'high';
  } else if (technical_parameters.length === 0 && text.length < 50) {
    overall_confidence = 'needs_review';
  }

  return {
    product,
    application: raw?.application ? String(raw.application).trim() : null,
    application_source: raw?.application_source ? String(raw.application_source).trim() : undefined,
    industry: raw?.industry ? String(raw.industry).trim() : null,
    technical_parameters,
    materials,
    environment,
    safety_requirements,
    performance_requirements,
    testing_requirements,
    installation_requirements,
    certification_mentions,
    quantity: raw?.quantity ? String(raw.quantity).trim() : null,
    quantity_source: raw?.quantity_source ? String(raw.quantity_source).trim() : undefined,
    additional_requirements,
    missing_information,
    clarification_questions,
    overall_confidence,
    ready_for_matching: true,
  };
}
