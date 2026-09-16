// ============================================================
// ISutra — Procurement Analysis Workspace
// Input procurement requirements, select input types & run analysis
// Strictly fits within viewport with zero horizontal overflow
// ============================================================

import { useState } from 'react';
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
  ClipboardList,
} from 'lucide-react';
import { useAnalysis } from '../hooks/useAnalysis';
import type { InputType } from '../types';
import AnalysisLoading from '../components/analysis/AnalysisLoading';

const EXAMPLE_SPECS = [
  {
    title: 'Outdoor LED Street Lighting',
    type: 'product_description' as InputType,
    text: 'Outdoor LED street lighting system, 100W, weather resistant, pole mounted, IP65 enclosure, surge protection 10kV.',
  },
  {
    title: 'Water Storage Tanks',
    type: 'product_description' as InputType,
    text: 'Procure 500 stainless steel water storage tanks for a municipal government facility, corrosion resistant Grade 304.',
  },
  {
    title: 'High-Temp Electrical Cables',
    type: 'technical_specification' as InputType,
    text: 'Supply industrial electrical cables suitable for high temperature environments, 1.1kV grade XLPE insulated copper conductor.',
  },
  {
    title: 'Vague Input Test',
    type: 'product_description' as InputType,
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
    if (!inputText || inputText.trim().length === 0) {
      setValidationError('Please enter a procurement specification before analyzing.');
      return;
    }

    setValidationError(null);
    const result = await analyze();

    if (result && result.analysis_id) {
      navigate(`/analysis/${result.analysis_id}/review`, {
        state: { analysis: result },
      });
    }
  };

  const loadDemoDocument = () => {
    const demoFile = new window.File(
      ['Sample Municipal LED Streetlight Tender Extract (Demo Document)'],
      'Sample_Municipal_LED_Streetlight_Tender_Extract.pdf',
      { type: 'application/pdf' }
    );
    setUploadedFile({
      file: demoFile,
      name: 'Sample_Municipal_LED_Streetlight_Tender_Extract.pdf',
      type: 'application/pdf',
      size: 45200,
      status: 'uploaded',
    });
    setValidationError(null);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    // Arbitrary file parsing is disabled in this prototype; safely load the demo sample document
    loadDemoDocument();
  };

  const handleAnalyzeDocument = async () => {
    if (!uploadedFile) {
      setValidationError('Please select or upload a tender document first.');
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

  const charCount = inputText.length;

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-5 pb-6 animate-fade-in box-border">
      {/* ============================================================
          1. PAGE TITLE & VALUE PROPOSITION
          Compact vertical footprint for first viewport visibility
         ============================================================ */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0F766E]/8 border border-[#0F766E]/20 text-[11px] font-semibold text-[#0F766E] uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-[#0F766E]" />
          <span>BIS Standards Recommendation Engine</span>
        </div>

        <h1 className="text-[24px] sm:text-[28px] lg:text-[32px] font-bold text-[#102A43] tracking-tight leading-tight font-display">
          Procurement Workspace
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          Enter your procurement specification or load the demonstration tender extract to structure requirements and identify matching Indian Standards with complete traceability.
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
          2. SINGLE ANALYSIS WORKSPACE CARD
         ============================================================ */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden w-full max-w-full box-border">
        {/* Card Header: Section Title + Responsive Segmented Tabs */}
        <div className="border-b border-slate-100 p-3.5 sm:p-4 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block font-display">
              Start a New Analysis
            </span>
            <h2 className="text-[15px] sm:text-[17px] font-bold text-[#102A43]">
              Input Specification
            </h2>
          </div>

          {/* Responsive Segmented Tabs: wraps into clean columns on mobile/tablet, never clips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 md:flex md:items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/70 w-full md:w-auto max-w-full">
            {[
              { id: 'product_description', label: 'Product Description', icon: FileText },
              { id: 'technical_specification', label: 'Technical Specification', icon: ClipboardList },
              { id: 'tender_document', label: 'Tender Document', icon: FileArchive },
            ].map((tab) => {
              const isActive = inputType === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setInputType(tab.id as InputType);
                    setValidationError(null);
                  }}
                  className={`min-w-0 flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs sm:text-[13px] transition-all font-medium cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#102A43] shadow-xs font-semibold border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#0F766E]' : 'text-slate-400'}`} />
                  <span className="truncate sm:whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-4">
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
                    setInputType(ex.type);
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

          {/* Input Area (Textarea or Demo Tender Document) */}
          {inputType !== 'tender_document' ? (
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setValidationError(null);
                }}
                rows={4}
                placeholder={
                  inputType === 'product_description'
                    ? 'e.g., Supply of 100W outdoor LED street lighting luminaire, weather-resistant die-cast aluminum housing, pole mounted, IP65 with surge protection...'
                    : 'e.g., Operating voltage 240V AC, luminous efficacy >= 120 lm/W, CCT 4000K-5700K, CRI >= 70, power factor >= 0.95, IP66 rated...'
                }
                className="w-full p-3 sm:p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-[#102A43] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E] transition-all resize-none bg-slate-50/40 leading-relaxed box-border"
              />
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                <span>
                  {inputType === 'product_description'
                    ? 'Product category, functional scope, and operating environment'
                    : 'Technical parameters, performance specifications, and testing constraints'}
                </span>
                <span className={charCount > 2000 ? 'text-amber-600 font-medium' : ''}>
                  {charCount} characters
                </span>
              </div>
            </div>
          ) : (
            /* Mode 3: Tender Document Upload */
            <div className="space-y-3">
              {/* Prominent Prototype Limitation Notice */}
              <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="font-semibold text-amber-950">Prototype limitation: </strong>
                  <span>
                    arbitrary uploaded documents are not parsed in this version. Use the procurement text input or the provided demo sample.
                  </span>
                </p>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-xl p-5 sm:p-6 text-center transition-all ${
                  dragActive
                    ? 'border-[#0F766E] bg-[#0F766E]/5'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center mx-auto mb-2 text-[#0F766E]">
                  <FileArchive className="w-5 h-5" />
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-[#102A43] mb-0.5 font-display">
                  Demonstration Tender Document
                </h3>
                <p className="text-[11px] text-slate-500 mb-3.5 max-w-md mx-auto leading-relaxed">
                  Arbitrary PDF/DOCX document text extraction is disabled in this prototype version. Load the standardized municipal lighting tender extract to evaluate requirement parsing, clarification flows, and BIS matching.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={loadDemoDocument}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs sm:text-sm font-semibold cursor-pointer shadow-xs transition-all active:scale-[0.99]"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Load Demo Tender Document</span>
                  </button>
                </div>
              </div>

              {uploadedFile && (
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl animate-fade-in">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-[#0F766E] shrink-0" />
                    <div className="min-w-0 truncate">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-[#102A43] truncate font-mono">
                          {uploadedFile.name}
                        </p>
                        <span className="px-1.5 py-0.2 text-[10px] font-bold uppercase rounded bg-amber-100 text-amber-800 border border-amber-200">
                          Demo Sample
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        45.2 KB • Pre-configured demonstration tender extract (Sample analysis mode)
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadedFile(null)}
                    className="text-xs text-red-600 hover:underline font-medium shrink-0 ml-3 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============================================================
              3. INTELLIGENCE CONTEXT PANEL: WHAT ISUTRA IDENTIFIES
              Desktop (>= 1200px): 4 cols
              1024-1199px & 768-1023px: 2 cols x 2 rows
              < 768px: 1 col
             ============================================================ */}
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

          {/* Action Row: Clear & Primary Analyze Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100">
            <div>
              {inputText && (
                <button
                  type="button"
                  onClick={clear}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors font-medium inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Input</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 justify-end w-full sm:w-auto">
              {inputType !== 'tender_document' ? (
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  className="w-full sm:w-auto h-10 sm:h-11 px-6 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 active:scale-[0.99]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Analyze Specification</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAnalyzeDocument}
                  disabled={!uploadedFile}
                  className={`w-full sm:w-auto h-10 sm:h-11 px-6 rounded-xl text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-all shrink-0 ${
                    uploadedFile
                      ? 'bg-[#0F766E] hover:bg-[#0D655E] cursor-pointer active:scale-[0.99]'
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Analyze Demo Tender Document</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
