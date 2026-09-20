// ============================================================
// ISutra — AI Requirement Extractor Pipeline
// Main coordinator: Normalization -> AI/NLP Extraction -> Validation
// ============================================================

import { extractRequirementsWithAI } from './aiClient';
import { validateAndSanitizeRequirements } from './validation';
import type { StructuredRequirements } from './types';
import { detectInputLanguage, type LanguageMetadata } from './multilingualService';

export interface ExtractionOutput {
  requirements: StructuredRequirements;
  provider_used: string;
  model_used: string;
  normalized_text: string;
  demo: boolean;
  warning?: string;
  input_language?: string;
  language_metadata?: LanguageMetadata;
}

export function normalizeInputText(text: string): string {
  return text
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/–|—/g, '-')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export async function runRequirementExtractionPipeline(
  inputText: string,
  inputType: string,
  inputLanguage?: string
): Promise<ExtractionOutput> {
  const normalized = normalizeInputText(inputText);

  if (!normalized) {
    throw new Error('Input text cannot be empty after normalization.');
  }

  // Detect input language & metadata
  const languageMetadata = detectInputLanguage(normalized, inputLanguage);

  // Run AI / NLP extractor with language metadata
  const aiResponse = await extractRequirementsWithAI(
    normalized,
    inputType,
    inputLanguage,
    languageMetadata
  );

  // Validate and sanitize
  const validated = validateAndSanitizeRequirements(aiResponse.requirements, normalized);

  // If unsupported language script was detected, ensure readiness is false and blocking message exists
  if (!languageMetadata.is_supported) {
    validated.ready_for_matching = false;
    validated.overall_confidence = 'needs_review';
    const errorMsg =
      languageMetadata.details ||
      'Language script not supported in current prototype. Supported input languages are English, Hindi, and Telugu.';
    if (!validated.blocking_missing_information?.includes(errorMsg)) {
      validated.blocking_missing_information = [
        errorMsg,
        ...(validated.blocking_missing_information || []),
      ];
    }
  }

  return {
    requirements: validated,
    provider_used: aiResponse.provider,
    model_used: aiResponse.modelUsed,
    normalized_text: normalized,
    demo: aiResponse.demo,
    warning: aiResponse.warning,
    input_language: languageMetadata.detected_language,
    language_metadata: languageMetadata,
  };
}
