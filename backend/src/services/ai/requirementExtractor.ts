// ============================================================
// ISutra — AI Requirement Extractor Pipeline
// Main coordinator: Normalization -> AI/NLP Extraction -> Validation
// ============================================================

import { extractRequirementsWithAI } from './aiClient';
import { validateAndSanitizeRequirements } from './validation';
import type { StructuredRequirements } from './types';

export interface ExtractionOutput {
  requirements: StructuredRequirements;
  provider_used: string;
  model_used: string;
  normalized_text: string;
  demo: boolean;
  warning?: string;
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
  inputType: string
): Promise<ExtractionOutput> {
  const normalized = normalizeInputText(inputText);

  if (!normalized) {
    throw new Error('Input text cannot be empty after normalization.');
  }

  // Run AI / NLP extractor
  const aiResponse = await extractRequirementsWithAI(normalized, inputType);

  // Validate and sanitize
  const validated = validateAndSanitizeRequirements(aiResponse.requirements, normalized);

  return {
    requirements: validated,
    provider_used: aiResponse.provider,
    model_used: aiResponse.modelUsed,
    normalized_text: normalized,
    demo: aiResponse.demo,
    warning: aiResponse.warning,
  };
}
