// ============================================================
// ISutra — Unified Procurement Analysis Workspace
// Single unified workspace for text requirements & tender documents
// Strictly fits within viewport with zero horizontal overflow
// ============================================================

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  RotateCcw,
  FileText,
  AlertCircle,
  Sparkles,
  Layers,
  Sliders,
  BookOpen,
  Compass,
  FileArchive,
  Upload,
  FileUp,
  ShieldCheck,
} from 'lucide-react';
import { useAnalysis } from '../hooks/useAnalysis';
import type { InputType } from '../types';
import AnalysisLoading from '../components/analysis/AnalysisLoading';

const EXAMPLE_SPECS = [
  {
    title: 'Outdoor LED Street Lighting',
    text: 'Outdoor LED street lighting system, 100W, weather resistant, pole mounted, IP65 enclosure, surge protection 10kV.',
  },
  {
    title: 'Water Storage Tanks',
    text: 'Procure 500 stainless steel water storage tanks for a municipal government facility, corrosion resistant Grade 304.',
  },
  {
    title: 'High-Temp Electrical Cables',
    text: 'Supply industrial electrical cables suitable for high temperature environments, 1.1kV grade XLPE insulated copper conductor.',
  },
  {
    title: 'Vague Input Test',
    text: 'Need LED street lights.',
  },
];

const INTELLIGENCE_POINTS = [
  {
    icon: Layers,
    title: 'Product Category',
    desc: 'Classifies item domain & BIS committee scope',
  },
  {
    icon: Sliders,
    title: 'Technical Requirements',
    desc: 'Extracts parameters, ratings & operating limits',
  },
  {
    icon: BookOpen,
    title: 'Relevant BIS Standards',
    desc: 'Maps applicable IS codes & documented scope',
  },
  {
    icon: Compass,
    title: 'Matching Rationale',
    desc: 'Scores explainable multi-signal alignment',
  },
];

export default function AnalyzePage() {
  const navigate = useNavigate();
  const {
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processSelectedFile = (file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const validExts = ['.pdf', '.docx', '.doc'];
    if (!validExts.includes(ext)) {
      setValidationError(`Unsupported file format '${ext}'. Please upload a PDF (.pdf) or Word document (.docx).`);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setValidationError(`File size exceeds 15 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`);
      return;
    }

    setValidationError(null);
    setUploadedFile({
      file,
      name: file.name,
      type: file.type || (ext === '.pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
      size: file.size,
      status: 'uploaded',
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const loadDemoDocument = () => {
    const sampleText = `%PDF-1.4\n% Sample Procurement Document\nProcurement of 100W outdoor LED street lighting luminaire, weather-resistant die-cast aluminum housing, pole mounted, IP65 with surge protection 10kV, luminous efficacy >= 120 lm/W.`;
    const demoFile = new window.File(
      [sampleText],
      'Sample_Municipal_LED_Streetlight_Tender_Extract.pdf',
      { type: 'application/pdf' }
    );
    processSelectedFile(demoFile);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyzeDocument = async () => {
    if (!uploadedFile) {
      setValidationError('Please select or upload a procurement document first.');
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

  const handleStartAnalysis = async () => {
    // If a document was uploaded, prioritize analyzing the document
    if (uploadedFile) {
      await handleAnalyzeDocument();
      return;
    }

    if (!inputText || inputText.trim().length === 0) {
      setValidationError('Please describe your procurement requirement or upload a tender document.');
      return;
    }

    setValidationError(null);

    // Infer internal inputType deterministically based on technical units/parameters
    const inferredType: InputType = /\b(?:\d+\s*(?:w|v|kv|mm|cm|m|kg|lm|cct|cri|pf|hz|rpm|mpa|deg|°c)|ip\d{2})\b/i.test(inputText)
      ? 'technical_specification'
      : 'product_description';

    setInputType(inferredType);
    const result = await analyze(inferredType);

    if (result && result.analysis_id) {
      navigate(`/analysis/${result.analysis_id}/review`, {
        state: { analysis: result },
      });
    }
  };

  const handleClearAll = () => {
    clear();
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (status === 'processing') {
    return (
      <div className="py-12 w-full">
        <AnalysisLoading />
      </div>
    );
  }

  const charCount = inputText.length;
  const hasInput = charCount > 0 || uploadedFile !== null;

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-5 pb-6 animate-fade-in box-border">
      {/* ============================================================
          1. PAGE HEADER: UNIFIED TITLE & VALUE PROPOSITION
         ============================================================ */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0F766E]/8 border border-[#0F766E]/20 text-[11px] font-semibold text-[#0F766E] uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-[#0F766E]" />
          <span>BIS Standards Recommendation Engine</span>
        </div>

        <h1 className="text-[24px] sm:text-[28px] lg:text-[32px] font-bold text-[#102A43] tracking-tight leading-tight font-display">
          New Procurement Analysis
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          Describe or upload your procurement requirement. ISutra will structure the requirement, identify relevant BIS reference standards, and show what needs verification.
        </p>
      </div>

      {/* Global Error Notice */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* ============================================================
          2. UNIFIED PROCUREMENT ANALYSIS WORKSPACE CARD
         ============================================================ */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden w-full max-w-full box-border">
        {/* Card Header */}
        <div className="border-b border-slate-100 p-3.5 sm:p-4 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] block font-display">
              Procurement Workspace
            </span>
            <h2 className="text-[15px] sm:text-[17px] font-bold text-[#102A43]">
              Procurement Requirement
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Text requirement or tender document upload
          </span>
        </div>

        {/* Card Body */}
        <div className="p-3.5 sm:p-5 space-y-4">
          {/* Quick Test Inputs */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
                Quick Test Inputs
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Click any sample to populate
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_SPECS.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setInputText(ex.text);
                    setUploadedFile(null);
                    setValidationError(null);
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-[#0F766E]/10 text-slate-600 hover:text-[#0F766E] border border-slate-200/80 transition-colors font-medium cursor-pointer"
                >
                  {ex.title}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#102A43]">
              Describe Procurement Requirement
            </label>
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setValidationError(null);
                }}
                rows={5}
                placeholder="Describe the product, application, technical requirements, environment, installation conditions, or tender requirement…"
                className="w-full p-3 sm:p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-[#102A43] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E] transition-all resize-none bg-slate-50/40 leading-relaxed box-border"
              />
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                <span>
                  Product form, ratings, operational limits, environment, or installation scope
                </span>
                <span className={charCount > 2000 ? 'text-amber-600 font-medium' : ''}>
                  {charCount} characters
                </span>
              </div>
            </div>
          </div>

          {/* Clean Visual Divider */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-medium uppercase tracking-wider text-[11px]">
                Or upload a tender document
              </span>
            </div>
          </div>

          {/* Tender Document Upload Area */}
          <div className="space-y-3">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
            />

            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-[#0F766E] bg-[#0F766E]/10'
                  : uploadedFile
                  ? 'border-[#0F766E]/60 bg-[#0F766E]/5'
                  : 'border-slate-200 hover:border-[#0F766E]/50 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center mx-auto mb-2 text-[#0F766E]">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-[#102A43] mb-0.5 font-display">
                Drop procurement document here or click to browse
              </h3>
              <p className="text-[11px] text-slate-500 mb-3 max-w-md mx-auto leading-relaxed">
                Supported formats: Machine-readable PDF (.pdf) or Word (.docx) (max 15 MB).
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs sm:text-sm font-semibold cursor-pointer shadow-xs transition-all active:scale-[0.99]"
                >
                  <FileUp className="w-4 h-4" />
                  <span>Select Document</span>
                </button>
                <button
                  type="button"
                  onClick={loadDemoDocument}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium cursor-pointer shadow-2xs transition-all active:scale-[0.99]"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Load Sample Tender</span>
                </button>
              </div>
            </div>

            {/* Selected File Card */}
            {uploadedFile && (
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-[#0F766E]/30 rounded-xl animate-fade-in shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#0F766E]/10 flex items-center justify-center shrink-0 text-[#0F766E]">
                    <FileArchive className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 truncate">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-semibold text-[#102A43] truncate font-mono">
                        {uploadedFile.name}
                      </p>
                      <span className="px-1.5 py-0.2 text-[10px] font-bold uppercase rounded bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/20">
                        {uploadedFile.name.endsWith('.docx') ? 'DOCX' : 'PDF'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {(uploadedFile.size / 1024).toFixed(1)} KB • Document selected for requirement extraction
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  className="text-xs text-red-600 hover:underline font-medium shrink-0 ml-3 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Documented limitation alert */}
            <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="font-semibold text-amber-950">Document parsing notice: </strong>
                Extracts text from machine-readable PDF and DOCX files. Scanned or image-only documents require machine-readable text. Multi-lot tenders analyze the primary specification item.
              </p>
            </div>
          </div>

          {/* Reference Dataset Trust Notice */}
          <div className="p-3 bg-[#0F766E]/5 border border-[#0F766E]/20 rounded-xl text-xs text-[#0F766E] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
            <p className="text-[#102A43] leading-relaxed text-[11px] sm:text-xs">
              <strong className="font-semibold text-[#0F766E]">Verified BIS Reference Dataset: </strong>
              Requirements are matched against a curated reference dataset of 40 verified Indian Standards with 5-stage mathematical traceability to official BIS portal records (<span className="font-mono text-[11px]">services.bis.gov.in</span> / <span className="font-mono text-[11px]">bis.gov.in</span>).
            </p>
          </div>

          {/* Intelligence Context Panel: What ISutra Identifies */}
          <div className="rounded-xl bg-slate-50/70 border border-slate-200/70 p-3 sm:p-3.5 w-full box-border">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E]">
                What ISutra Identifies
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 min-[1200px]:grid-cols-4 gap-2 sm:gap-2.5 w-full">
              {INTELLIGENCE_POINTS.map((pt, idx) => {
                const Icon = pt.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2 rounded-lg bg-white border border-slate-200/60 shadow-2xs min-w-0"
                  >
                    <div className="w-6 h-6 rounded-md bg-[#0F766E]/10 flex items-center justify-center shrink-0 mt-0.5 text-[#0F766E]">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#102A43] truncate font-display">
                        {pt.title}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {pt.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Validation error notice */}
          {validationError && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Action Row: Clear & Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100">
            <div>
              {hasInput && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors font-medium inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Input</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 justify-end w-full sm:w-auto">
              <button
                type="button"
                onClick={handleStartAnalysis}
                className="w-full sm:w-auto h-10 sm:h-11 px-6 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 active:scale-[0.99]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {uploadedFile
                    ? 'Analyze Procurement Document'
                    : 'Analyze Procurement Requirement'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
