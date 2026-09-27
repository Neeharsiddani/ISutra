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
  const provider = (process.env.AI_PROVIDER || 'gemini').trim().toLowerCase().replace(/^['"]|['"]$/g, '');
  const apiKey = (process.env.AI_API_KEY || '').trim().replace(/^['"]|['"]$/g, '');
  const rawModel = (process.env.AI_MODEL || (provider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-4o-mini'))
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/^models\//, '');
  const model = rawModel || 'gemini-1.5-flash';

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
      const callGeminiModel = async (targetModel: string) => {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
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
          throw new Error(`Gemini API error (${res.status}): ${detail}`);
        }

        const data = (await res.json()) as any;
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) {
          throw new Error('Empty response from Gemini API');
        }
        return { parsed: JSON.parse(rawText) as StructuredRequirements, usedModel: targetModel };
      };

      let result;
      try {
        result = await callGeminiModel(model);
      } catch (firstErr) {
        // If 404 (model deprecated or retired), query Google's ListModels API to discover the active model
        if ((firstErr as Error).message.includes('404')) {
          console.warn(`[ISutra AI] Model ${model} returned 404. Discovering active models from Google API...`);
          let discoveredModel: string | null = null;
          try {
            const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            if (listRes.ok) {
              const listData = (await listRes.json()) as any;
              const available = listData?.models || [];
              const match = available.find(
                (m: any) =>
                  m.supportedGenerationMethods?.includes('generateContent') &&
                  (m.name?.includes('flash') || m.name?.includes('gemini'))
              );
              if (match?.name) {
                discoveredModel = match.name.replace(/^models\//, '');
                console.log(`[ISutra AI] Discovered active model: ${discoveredModel}`);
              }
            }
          } catch (listErr) {
            console.warn('[ISutra AI] Failed to query ListModels:', listErr);
          }

          const fallbackCandidates = [
            discoveredModel,
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-1.5-flash-8b',
          ].filter(Boolean) as string[];

          let fallbackSuccess = false;
          for (const cand of fallbackCandidates) {
            if (cand === model) continue;
            try {
              console.log(`[ISutra AI] Retrying with model: ${cand}...`);
              result = await callGeminiModel(cand);
              fallbackSuccess = true;
              break;
            } catch (candErr) {
              console.warn(`[ISutra AI] Candidate ${cand} failed:`, (candErr as Error).message);
            }
          }

          if (!fallbackSuccess) {
            throw firstErr;
          }
        } else {
          throw firstErr;
        }
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
