// ============================================================
// ISutra — useAnalysis Hook
// Phase 2: Manages specification analysis and requirement extraction
// Supports multilingual procurement input (English, Hindi, Telugu)
// ============================================================

import { useState, useCallback } from 'react';
import type { InputType, AnalysisStatus, AIAnalysisResult, UploadedFile } from '../types';
import { analyzeSpecification, uploadDocument } from '../services/api';

interface UseAnalysisReturn {
  inputType: InputType;
  setInputType: (type: InputType) => void;
  inputLanguage: string;
  setInputLanguage: (lang: string) => void;
  inputText: string;
  setInputText: (text: string) => void;
  uploadedFile: UploadedFile | null;
  setUploadedFile: (file: UploadedFile | null) => void;
  status: AnalysisStatus;
  analysisResult: AIAnalysisResult | null;
  error: string | null;
  analyze: (overrideType?: InputType, overrideLang?: string) => Promise<AIAnalysisResult | null>;
  analyzeFile: (file: File, overrideLang?: string) => Promise<AIAnalysisResult | null>;
  clear: () => void;
}

export function useAnalysis(): UseAnalysisReturn {
  const [inputType, setInputType] = useState<InputType>('product_description');
  const [inputLanguage, setInputLanguage] = useState<string>('auto');
  const [inputText, setInputText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(
    async (overrideType?: InputType, overrideLang?: string): Promise<AIAnalysisResult | null> => {
      if (!inputText.trim()) {
        setError('Please enter a procurement specification to analyze.');
        return null;
      }

      setStatus('processing');
      setError(null);

      try {
        const typeToSend = overrideType || inputType || 'product_description';
        const langToSend = overrideLang || inputLanguage || 'auto';
        const result = await analyzeSpecification(typeToSend, inputText, langToSend);
        setAnalysisResult(result);
        setStatus('completed');
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'An error occurred during analysis.';
        setError(msg);
        setStatus('error');
        return null;
      }
    },
    [inputType, inputLanguage, inputText]
  );

  const analyzeFile = useCallback(
    async (file: File, overrideLang?: string): Promise<AIAnalysisResult | null> => {
      setStatus('processing');
      setError(null);

      try {
        const langToSend = overrideLang || inputLanguage || 'auto';
        const result = await uploadDocument(file, langToSend);
        setAnalysisResult(result);
        setStatus('completed');
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'An error occurred during document analysis.';
        setError(msg);
        setStatus('error');
        return null;
      }
    },
    [inputLanguage]
  );

  const clear = useCallback(() => {
    setInputText('');
    setInputLanguage('auto');
    setUploadedFile(null);
    setStatus('idle');
    setAnalysisResult(null);
    setError(null);
  }, []);

  return {
    inputType,
    setInputType,
    inputLanguage,
    setInputLanguage,
    inputText,
    setInputText,
    uploadedFile,
    setUploadedFile,
    status,
    analysisResult,
    error,
    analyze,
    analyzeFile,
    clear,
  };
}
