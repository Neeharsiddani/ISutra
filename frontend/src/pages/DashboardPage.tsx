// ============================================================
// ISutra — Procurement Intelligence Dashboard
// Professional Enterprise Workspace for Procurement Officers
// Full-width responsive layout with Space Grotesk & Inter typography
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  RotateCcw,
  FileText,
  UploadCloud,
  AlertCircle,
} from 'lucide-react';
import { useAnalysis } from '../hooks/useAnalysis';
import type { InputType } from '../types';
import AnalysisLoading from '../components/analysis/AnalysisLoading';

const EXAMPLE_SPECS = [
  {
    title: 'Outdoor LED Street Lighting',
    type: 'product_description' as InputType,
    text: 'Outdoor LED street lighting system, 100W, weather resistant, pole mounted.',
  },
  {
    title: 'Water Storage Tanks (500 units)',
    type: 'product_description' as InputType,
    text: 'Procure 500 stainless steel water storage tanks for a government facility.',
  },
  {
    title: 'High-Temp Electrical Cables',
    type: 'technical_specification' as InputType,
    text: 'Supply industrial electrical cables suitable for high temperature environments.',
  },
  {
    title: 'Vague Input Test',
    type: 'product_description' as InputType,
    text: 'Need LED street lights.',
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    inputType,
    setInputType,
    inputText,
    setInputText,
    uploadedFile,
    setUploadedFile,
    status,
    error,
    analyze,
    analyzeFile,
    clear,
  } = useAnalysis();

  const [validationError, setValidationError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleStartAnalysis = async () => {
    // 1. Validation check
    if (!inputText || inputText.trim().length === 0) {
      setValidationError('Please enter a procurement specification.');
      return;
    }

    setValidationError(null);

    // 2. Call backend POST /api/analyze
    const result = await analyze();

    // 3. Navigate to display extracted requirements
    if (result && result.analysis_id) {
      navigate(`/analysis/${result.analysis_id}/review`, {
        state: { analysis: result },
      });
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile({
        file,
        name: file.name,
        type: file.type,
        size: file.size,
        status: 'uploaded',
      });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile({
        file,
        name: file.name,
        type: file.type,
        size: file.size,
        status: 'uploaded',
      });
    }
  };

  const handleAnalyzeDocument = async () => {
    if (!uploadedFile) {
      setValidationError('Please select or upload a document first.');
      return;
    }
    setValidationError(null);
    const result = await analyzeFile(uploadedFile.file);
    if (result && result.analysis_id) {
      navigate(`/analysis/${result.analysis_id}/review`, {
        state: { analysis: result },
      });
    }
  };

  if (status === 'processing') {
    return (
      <div className="py-12 w-full">
        <AnalysisLoading />
      </div>
    );
  }

  const userEnteredCharCount = inputText.length;

  return (
    <div className="w-full space-y-8 pb-12 animate-fade-in text-[#243B53]">
      {/* ============================================================
          1. PAGE HEADING & SUBTITLE
          Desktop: 36px / 16px | Tablet: 30-32px / 15px | Mobile: 26-28px / 14px
         ============================================================ */}
      <div className="space-y-1.5">
        <h1 className="text-[26px] sm:text-[30px] xl:text-[36px] font-bold text-[#102A43] tracking-tight leading-[1.1] font-display">
          Procurement Intelligence
        </h1>
        <p className="text-[14px] sm:text-[15px] xl:text-[16px] text-[#627D98] leading-relaxed max-w-4xl">
          Analyze your procurement requirements and identify the specifications needed to determine applicable Indian Standards.
        </p>
      </div>

      {/* Global Error Notice if any */}
      {error && (
        <div className="p-4 bg-[#FEF2F2] border border-[#C53030]/20 rounded-xl flex items-center gap-3 text-[14px] text-[#C53030]">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ============================================================
          2. START A NEW ANALYSIS CARD
          Occupies 100% of available viewport width
         ============================================================ */}
      <div className="bg-white rounded-2xl border border-[#243B53]/10 shadow-xs overflow-hidden w-full box-border">
        {/* Card Header & Input Type Selector */}
        <div className="border-b border-[#243B53]/10 p-5 sm:p-6 bg-[#F7F9FC]/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[17px] sm:text-[18px] xl:text-[20px] font-bold text-[#102A43] uppercase tracking-wider font-display">
              Start a New Analysis
            </h2>
            <p className="text-[13px] sm:text-[14px] text-[#627D98] mt-0.5">
              Select your specification input method:
            </p>
          </div>

          {/* Specification Tabs (Flex, properly spaced, horizontal scroll on mobile) */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#F7F9FC] border border-[#243B53]/10 rounded-xl overflow-x-auto max-w-full shrink-0">
            {[
              { id: 'product_description', label: 'Product Description' },
              { id: 'technical_specification', label: 'Technical Specification' },
              { id: 'tender_document', label: 'Tender Document' },
            ].map((tab) => {
              const isActive = inputType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setInputType(tab.id as InputType);
                    setValidationError(null);
                  }}
                  className={`px-4 py-2.5 rounded-lg text-[14px] sm:text-[15px] font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-[#102A43] shadow-xs font-semibold border border-[#243B53]/10'
                      : 'text-[#627D98] hover:text-[#102A43] hover:bg-white/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-7 xl:p-9 space-y-6">
          {/* Quick Test Inputs (Spacing gap: 8px, wrap naturally) */}
          <div>
            <span className="text-[12px] xl:text-[13px] font-bold text-[#627D98] uppercase tracking-wider block mb-2.5 font-display">
              Quick Test Inputs:
            </span>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_SPECS.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputType(ex.type);
                    setInputText(ex.text);
                    setValidationError(null);
                  }}
                  className="px-3 py-1.5 rounded-lg text-[13px] sm:text-[14px] font-medium bg-[#F7F9FC] hover:bg-[#0F766E]/5 text-[#243B53] hover:text-[#0F766E] border border-[#243B53]/10 hover:border-[#0F766E]/30 transition-all text-left shadow-2xs"
                >
                  {ex.title}
                </button>
              ))}
            </div>
          </div>

          {/* Mode 1 & 2: Large Textarea */}
          {inputType !== 'tender_document' ? (
            <div className="space-y-3">
              <label className="block text-[14px] sm:text-[15px] font-bold text-[#102A43]">
                {inputType === 'product_description'
                  ? 'Product Description'
                  : 'Technical Specification'}
              </label>

              {/* Textarea: Desktop 220px, Tablet 200px, Mobile 180px */}
              <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Example: Outdoor LED street lighting system, 100W, weather resistant, pole mounted..."
                className="w-full text-[15px] sm:text-[16px] text-[#243B53] bg-[#F7F9FC] border border-[#243B53]/15 rounded-xl p-4 sm:p-5 focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] outline-hidden transition-all placeholder:text-[#9FB3C8] placeholder:text-[14px] sm:placeholder:text-[15px] leading-relaxed min-h-[180px] md:min-h-[200px] xl:min-h-[220px]"
              />

              {/* Helper text & Character count */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[13px] sm:text-[14px] text-[#627D98] pt-1">
                <span>Enter technical parameters, environment, application, and ratings.</span>
                <span className="font-medium text-[#243B53]/80 shrink-0">
                  {userEnteredCharCount} character{userEnteredCharCount === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          ) : (
            /* Mode 3: Tender Document Upload */
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
                  dragActive
                    ? 'border-[#0F766E] bg-[#0F766E]/5'
                    : 'border-[#243B53]/15 hover:border-[#0F766E]/50 bg-[#F7F9FC]/60'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-2xs border border-[#243B53]/10 flex items-center justify-center mx-auto mb-4 text-[#0F766E]">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h3 className="text-[16px] sm:text-[17px] font-bold text-[#102A43] mb-1 font-display">
                  Drop tender document here, or browse
                </h3>
                <p className="text-[13px] sm:text-[14px] text-[#627D98] mb-5 max-w-md mx-auto">
                  Supports PDF, DOCX, or TXT tender document extracts (Max 10MB).
                </p>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-[#F7F9FC] text-[#102A43] border border-[#243B53]/15 text-[14px] font-semibold cursor-pointer shadow-2xs transition-all">
                  <FileText className="w-4 h-4 text-[#0F766E]" />
                  Select File
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadedFile && (
                <div className="flex items-center justify-between p-4 bg-[#F7F9FC] border border-[#243B53]/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#0F766E]" />
                    <div>
                      <p className="text-[14px] font-semibold text-[#102A43]">
                        {uploadedFile.name}
                      </p>
                      <p className="text-[12px] text-[#627D98]">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="text-[13px] text-[#C53030] hover:underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action Footer: Validation error & Analyze Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-5 border-t border-[#243B53]/10">
            <div>
              {validationError && (
                <div className="flex items-center gap-2 text-[13px] sm:text-[14px] text-[#C53030] bg-[#FEF2F2] px-3.5 py-2 rounded-lg border border-[#C53030]/20 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 justify-end w-full sm:w-auto">
              {inputText && (
                <button
                  type="button"
                  onClick={clear}
                  className="px-4 py-2 text-[14px] text-[#627D98] hover:text-[#102A43] hover:bg-[#F7F9FC] rounded-lg transition-colors font-medium flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              )}

              {inputType !== 'tender_document' ? (
                <button
                  onClick={handleStartAnalysis}
                  className="w-full sm:w-auto min-h-[46px] px-7 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-[15px] sm:text-[16px] font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Analyze Specification</span>
                </button>
              ) : (
                <button
                  onClick={handleAnalyzeDocument}
                  disabled={!uploadedFile}
                  className={`w-full sm:w-auto min-h-[46px] px-7 rounded-xl text-white text-[15px] sm:text-[16px] font-semibold shadow-xs flex items-center justify-center gap-2 transition-all ${
                    uploadedFile
                      ? 'bg-[#0F766E] hover:bg-[#0D655E] cursor-pointer'
                      : 'bg-[#9FB3C8] cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Analyze Tender Document</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
