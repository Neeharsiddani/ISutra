// ============================================================
// ISutra — useAnalysis Hook
// Phase 2: Manages specification analysis and requirement extraction
// ============================================================

import { useState, useCallback } from 'react';
import type { InputType, AnalysisStatus, AIAnalysisResult, UploadedFile } from '../types';
import { analyzeSpecification, uploadDocument } from '../services/api';

interface UseAnalysisReturn {
  inputType: InputType;
  setInputType: (type: InputType) => void;
  inputText: string;
  setInputText: (text: string) => void;
  uploadedFile: UploadedFile | null;
  setUploadedFile: (file: UploadedFile | null) => void;
  status: AnalysisStatus;
  analysisResult: AIAnalysisResult | null;
  error: string | null;
  analyze: () => Promise<AIAnalysisResult | null>;
  analyzeFile: (file: File) => Promise<AIAnalysisResult | null>;
  clear: () => void;
}

export function useAnalysis(): UseAnalysisReturn {
  const [inputType, setInputType] = useState<InputType>('product_description');
  const [inputText, setInputText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (): Promise<AIAnalysisResult | null> => {
    if (!inputText.trim()) {
      setError('Please enter a procurement specification to analyze.');
      return null;
    }

    setStatus('processing');
    setError(null);

    try {
      const result = await analyzeSpecification(inputType, inputText);
      setAnalysisResult(result);
      setStatus('completed');
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred during analysis.';
      setError(msg);
      setStatus('error');
      return null;
    }
  }, [inputType, inputText]);

  const analyzeFile = useCallback(async (file: File): Promise<AIAnalysisResult | null> => {
    setStatus('processing');
    setError(null);

    try {
      const result = await uploadDocument(file);
      setAnalysisResult(result);
      setStatus('completed');
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred during document analysis.';
      setError(msg);
      setStatus('error');
      return null;
    }
  }, []);

  const clear = useCallback(() => {
    setInputText('');
    setUploadedFile(null);
    setStatus('idle');
    setAnalysisResult(null);
    setError(null);
  }, []);

  return {
    inputType,
    setInputType,
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
