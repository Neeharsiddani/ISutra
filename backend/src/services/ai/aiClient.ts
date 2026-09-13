// ============================================================
// ISutra — Configurable AI Client
// Supports Google Gemini, OpenAI, and explicitly labeled Demo Mode
// ============================================================

import { REQUIREMENT_EXTRACTION_SYSTEM_PROMPT, createExtractionUserPrompt } from './promptTemplates';
import { extractWithPatternMatching } from './nlpExtractor';
import type { StructuredRequirements } from './types';

export interface AIClientResponse {
  requirements: StructuredRequirements;
  provider: 'gemini' | 'openai' | 'demo_mode';
  modelUsed: string;
  isConfigured: boolean;
  demo: boolean;
  warning?: string;
}

export async function extractRequirementsWithAI(
  inputText: string,
  inputType: string
): Promise<AIClientResponse> {
  const provider = (process.env.AI_PROVIDER || '').toLowerCase();
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || (provider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-4o-mini');

  // If no external API key is provided, clearly mark as Demo Mode
  if (!apiKey || apiKey.trim() === '') {
    console.log('[ISutra AI] AI_API_KEY is not configured. Operating in Demo Mode.');
    const result = extractWithPatternMatching(inputText, inputType);
    return {
      requirements: result,
      provider: 'demo_mode',
      modelUsed: 'Demo Mode (Deterministic Parser)',
      isConfigured: false,
      demo: true,
      warning: 'AI service is not configured. Add the required AI API key to the backend environment.',
    };
  }

  // 1. Google Gemini Provider
  if (provider === 'gemini') {
    try {
      console.log(`[ISutra AI] Calling Google Gemini API (${model})...`);
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: REQUIREMENT_EXTRACTION_SYSTEM_PROMPT },
              { text: createExtractionUserPrompt(inputType, inputText) },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(`[ISutra AI] Gemini API returned status ${res.status}: ${errorText.substring(0, 200)}`);
        throw new Error(`Gemini API error: ${res.statusText}`);
      }

      const data = (await res.json()) as any;
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Empty response from Gemini API');
      }

      const parsed: StructuredRequirements = JSON.parse(rawText);
      return {
        requirements: parsed,
        provider: 'gemini',
        modelUsed: model,
        isConfigured: true,
        demo: false,
      };
    } catch (err) {
      console.warn('[ISutra AI] Gemini call failed, operating in Demo Mode:', (err as Error).message);
      const fallbackResult = extractWithPatternMatching(inputText, inputType);
      return {
        requirements: fallbackResult,
        provider: 'demo_mode',
        modelUsed: 'Demo Mode (Fallback after API error)',
        isConfigured: false,
        demo: true,
        warning: `AI API call failed: ${(err as Error).message}. Operating in Demo Mode.`,
      };
    }
  }

  // 2. OpenAI Provider
  if (provider === 'openai') {
    try {
      console.log(`[ISutra AI] Calling OpenAI API (${model})...`);
      const endpoint = 'https://api.openai.com/v1/chat/completions';
      const payload = {
        model,
        messages: [
          { role: 'system', content: REQUIREMENT_EXTRACTION_SYSTEM_PROMPT },
          { role: 'user', content: createExtractionUserPrompt(inputType, inputText) },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(`[ISutra AI] OpenAI API returned status ${res.status}: ${errorText.substring(0, 200)}`);
        throw new Error(`OpenAI API error: ${res.statusText}`);
      }

      const data = (await res.json()) as any;
      const rawText = data?.choices?.[0]?.message?.content;
      if (!rawText) {
        throw new Error('Empty response from OpenAI API');
      }

      const parsed: StructuredRequirements = JSON.parse(rawText);
      return {
        requirements: parsed,
        provider: 'openai',
        modelUsed: model,
        isConfigured: true,
        demo: false,
      };
    } catch (err) {
      console.warn('[ISutra AI] OpenAI call failed, operating in Demo Mode:', (err as Error).message);
      const fallbackResult = extractWithPatternMatching(inputText, inputType);
      return {
        requirements: fallbackResult,
        provider: 'demo_mode',
        modelUsed: 'Demo Mode (Fallback after API error)',
        isConfigured: false,
        demo: true,
        warning: `AI API call failed: ${(err as Error).message}. Operating in Demo Mode.`,
      };
    }
  }

  // Unknown provider fallback
  return {
    requirements: extractWithPatternMatching(inputText, inputType),
    provider: 'demo_mode',
    modelUsed: 'Demo Mode',
    isConfigured: false,
    demo: true,
    warning: 'AI service is not configured. Add the required AI API key to the backend environment.',
  };
}
