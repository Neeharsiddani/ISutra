// ============================================================
// ISutra — Configurable AI Client
// Supports Google Gemini, OpenAI, and explicitly labeled Demo Mode
// ============================================================

import { REQUIREMENT_EXTRACTION_SYSTEM_PROMPT, createExtractionUserPrompt } from './promptTemplates';
import { extractWithPatternMatching } from './nlpExtractor';
import type { StructuredRequirements } from './types';
import type { LanguageMetadata } from './multilingualService';

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
  inputType: string,
  inputLanguage?: string,
  languageMeta?: LanguageMetadata
): Promise<AIClientResponse> {
  const configuredProvider = (process.env.AI_PROVIDER || 'gemini').trim().toLowerCase().replace(/^['"]|['"]$/g, '');
  const apiKey = (process.env.AI_API_KEY || '').trim().replace(/^['"]|['"]$/g, '');
  let rawModel = (process.env.AI_MODEL || '').trim().replace(/^['"]|['"]$/g, '').replace(/^models\//, '');

  // Auto-detect provider if key prefix clearly identifies it
  let provider = configuredProvider;
  if (apiKey.startsWith('sk-') && provider === 'gemini') {
    console.log('[ISutra AI] API key format indicates OpenAI (starts with sk-). Switching provider to openai.');
    provider = 'openai';
  }

  // Automatically upgrade deprecated 1.5 models to supported 2.5/2.0 models
  let model = rawModel;
  if (!model || model === 'gemini-1.5-flash' || model === 'gemini-1.5-pro' || model.includes('1.5-flash')) {
    model = provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini';
  }

  // If no external API key is provided, clearly mark as Demo Mode
  if (!apiKey) {
    console.log('[ISutra AI] AI_API_KEY is not configured. Operating in Demo Mode.');
    const result = extractWithPatternMatching(inputText, inputType, languageMeta);
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
      const callGeminiModel = async (targetModel: string, apiVer: string = 'v1beta') => {
        const endpoint = `https://generativelanguage.googleapis.com/${apiVer}/models/${targetModel}:generateContent?key=${apiKey}`;
        const payload = {
          contents: [
            {
              role: 'user',
              parts: [
                { text: REQUIREMENT_EXTRACTION_SYSTEM_PROMPT },
                { text: createExtractionUserPrompt(inputType, inputText, inputLanguage) },
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
          let detail = res.statusText;
          try {
            const errJson = JSON.parse(errorText);
            if (errJson?.error?.message) {
              detail = errJson.error.message;
            }
          } catch {}
          throw new Error(`Gemini API error (${res.status} [${apiVer}/${targetModel}]): ${detail}`);
        }

        const data = (await res.json()) as any;
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) {
          throw new Error('Empty response from Gemini API');
        }
        return { parsed: JSON.parse(rawText) as StructuredRequirements, usedModel: targetModel };
      };

      const candidatesToTry = [
        model,
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-3.5-flash-lite',
        'gemini-3.8-flash',
        'gemini-2.5-pro',
      ].filter((v, i, a) => a.indexOf(v) === i);

      let result;
      const attemptErrors: string[] = [];

      for (const cand of candidatesToTry) {
        try {
          // Try v1beta first, then v1
          try {
            result = await callGeminiModel(cand, 'v1beta');
            break;
          } catch (betaErr) {
            if ((betaErr as Error).message.includes('404')) {
              result = await callGeminiModel(cand, 'v1');
              break;
            } else {
              throw betaErr;
            }
          }
        } catch (err) {
          attemptErrors.push((err as Error).message);
          // If error is an invalid API key, stop retrying models
          if ((err as Error).message.includes('API_KEY_INVALID') || (err as Error).message.includes('400')) {
            break;
          }
        }
      }

      if (!result) {
        throw new Error(attemptErrors[0] || 'Unable to connect to Gemini API');
      }

      return {
        requirements: result.parsed,
        provider: 'gemini',
        modelUsed: result.usedModel,
        isConfigured: true,
        demo: false,
      };
    } catch (err) {
      console.warn('[ISutra AI] Gemini call failed, operating in Demo Mode:', (err as Error).message);
      const fallbackResult = extractWithPatternMatching(inputText, inputType, languageMeta);
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
          { role: 'user', content: createExtractionUserPrompt(inputType, inputText, inputLanguage) },
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
      const fallbackResult = extractWithPatternMatching(inputText, inputType, languageMeta);
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
    requirements: extractWithPatternMatching(inputText, inputType, languageMeta),
    provider: 'demo_mode',
    modelUsed: 'Demo Mode',
    isConfigured: false,
    demo: true,
    warning: 'AI service is not configured. Add the required AI API key to the backend environment.',
  };
}
