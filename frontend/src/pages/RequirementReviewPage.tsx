// ============================================================
// ISutra — Extracted Procurement Requirements Review Screen
// Modern Procurement Intelligence Enterprise Interface
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Check,
  X,
  Edit2,
  ArrowRight,
  Sliders,
  Compass,
  MapPin,
  Cpu,
  Sparkles,
  HelpCircle,
  Info,
  FileArchive,
} from 'lucide-react';
import { getAnalysisById, updateAnalysisRequirements } from '../services/api';
import type {
  AIAnalysisResult,
  StructuredRequirements,
  TechnicalParameterItem,
} from '../types';

export default function RequirementReviewPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [requirements, setRequirements] = useState<StructuredRequirements | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showTextPreview, setShowTextPreview] = useState(false);

  // Inline editing state for individual cards
  const [editingCard, setEditingCard] = useState<string | null>(null);

  // Draft states for inline editing
  const [draftProduct, setDraftProduct] = useState('');
  const [draftCategory, setDraftCategory] = useState('');
  const [draftApplication, setDraftApplication] = useState('');

  // Draft parameters
  const [draftParams, setDraftParams] = useState<TechnicalParameterItem[]>([]);
  const [newParamName, setNewParamName] = useState('');
  const [newParamValue, setNewParamValue] = useState('');

  // Draft environment / installation
  const [draftEnv, setDraftEnv] = useState<string[]>([]);
  const [newEnvInput, setNewEnvInput] = useState('');
  const [draftInst, setDraftInst] = useState<string[]>([]);
  const [newInstInput, setNewInstInput] = useState('');

  // Fetch or retrieve analysis data
  useEffect(() => {
    if (location.state?.analysis) {
      const a = location.state.analysis as AIAnalysisResult;
      setAnalysis(a);
      setRequirements(a.requirements);
      setIsConfirmed(a.confirmed || false);
      syncDrafts(a.requirements);
      return;
    }

    if (id) {
      setLoading(true);
      getAnalysisById(id)
        .then((res) => {
          setAnalysis(res);
          setRequirements(res.requirements);
          setIsConfirmed(res.confirmed || false);
          syncDrafts(res.requirements);
        })
        .catch((err) => {
          setError(err.message || 'Failed to load analysis record.');
        })
        .finally(() => setLoading(false));
    }
  }, [id, location.state]);

  const syncDrafts = (reqs: StructuredRequirements) => {
    setDraftProduct(reqs.product.name);
    setDraftCategory(reqs.product.category || '');
    setDraftApplication(reqs.application || '');
    setDraftParams([...reqs.technical_parameters]);
    setDraftEnv(reqs.environment.map((e) => e.name));
    setDraftInst(reqs.installation_requirements.map((i) => i.name));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="w-10 h-10 border-3 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-[#243B53]">Loading Extracted Requirements...</p>
      </div>
    );
  }

  if (error || !requirements || !analysis) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-[#C53030] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#243B53]">Analysis Record Not Found</h3>
        <p className="text-sm text-[#627D98] mt-1 mb-6">
          {error || 'Could not retrieve requirements for this analysis.'}
        </p>
        <Link
          to="/analyze"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#0F766E] text-white text-xs font-semibold hover:bg-[#0C5D57] transition-colors"
        >
          Start New Analysis
        </Link>
      </div>
    );
  }

  // --- Inline Card Editing Handlers ---

  const handleStartEdit = (cardName: string) => {
    if (isConfirmed) return;
    syncDrafts(requirements);
    setEditingCard(cardName);
  };

  const handleCancelEdit = () => {
    syncDrafts(requirements);
    setEditingCard(null);
  };

  const saveUpdatedRequirements = async (updated: StructuredRequirements) => {
    setRequirements(updated);
    setEditingCard(null);
    if (analysis?.analysis_id) {
      try {
        const res = await updateAnalysisRequirements(analysis.analysis_id, updated, isConfirmed);
        setAnalysis(res);
        setRequirements(res.requirements);
        setIsConfirmed(res.confirmed || false);
      } catch {
        // Keep local requirements updated
      }
    }
  };

  const handleSaveProduct = () => {
    const updated: StructuredRequirements = {
      ...requirements,
      product: {
        ...requirements.product,
        name: draftProduct.trim() || requirements.product.name,
        category: draftCategory.trim() || requirements.product.category,
      },
    };
    saveUpdatedRequirements(updated);
  };

  const handleSaveApplication = () => {
    const updated: StructuredRequirements = {
      ...requirements,
      application: draftApplication.trim() || null,
    };
    saveUpdatedRequirements(updated);
  };

  const handleSaveParams = () => {
    const updated: StructuredRequirements = {
      ...requirements,
      technical_parameters: draftParams,
    };
    saveUpdatedRequirements(updated);
  };

  const handleSaveEnvInst = () => {
    const updated: StructuredRequirements = {
      ...requirements,
      environment: draftEnv.map((name) => ({ id: `env-${Date.now()}-${name}`, name, confidence: 'high' })),
      installation_requirements: draftInst.map((name) => ({ id: `inst-${Date.now()}-${name}`, name, confidence: 'high' })),
    };
    saveUpdatedRequirements(updated);
  };

  // Add draft parameter
  const handleAddDraftParam = () => {
    if (!newParamName.trim() || !newParamValue.trim()) return;
    setDraftParams([
      ...draftParams,
      {
        id: `param-${Date.now()}`,
        parameter: newParamName.trim(),
        value: newParamValue.trim(),
        confidence: 'high',
        source_text: 'Officer entry',
      },
    ]);
    setNewParamName('');
    setNewParamValue('');
  };

  const handleRemoveDraftParam = (index: number) => {
    const list = [...draftParams];
    list.splice(index, 1);
    setDraftParams(list);
  };

  // Add draft env / inst
  const handleAddDraftEnv = () => {
    if (!newEnvInput.trim()) return;
    setDraftEnv([...draftEnv, newEnvInput.trim()]);
    setNewEnvInput('');
  };

  const handleRemoveDraftEnv = (index: number) => {
    const list = [...draftEnv];
    list.splice(index, 1);
    setDraftEnv(list);
  };

  const handleAddDraftInst = () => {
    if (!newInstInput.trim()) return;
    setDraftInst([...draftInst, newInstInput.trim()]);
    setNewInstInput('');
  };

  const handleRemoveDraftInst = (index: number) => {
    const list = [...draftInst];
    list.splice(index, 1);
    setDraftInst(list);
  };

  // Confirm Requirements Action
  const handleConfirmRequirements = async () => {
    setConfirming(true);
    try {
      const updated = await updateAnalysisRequirements(analysis.analysis_id, requirements, true);
      setAnalysis(updated);
      setRequirements(updated.requirements);
      setIsConfirmed(true);
      setEditingCard(null);
    } catch {
      setError('Failed to confirm requirements.');
    } finally {
      setConfirming(false);
    }
  };

  const isReady = requirements.ready_for_matching ?? analysis.ready_for_matching ?? true;
  const blockingInfo = requirements.blocking_missing_information || analysis.blocking_missing_information || [];
  const clarificationQuestions = requirements.clarification_questions || analysis.clarification_questions || [];
  const allMissing = requirements.missing_information || analysis.missing_information || [];
  const nonBlockingMissing = allMissing.filter((item) => !blockingInfo.includes(item));

  return (
    <div className="space-y-6 w-full pb-16 animate-fade-in text-[#243B53]">
      {/* ============================================================
          1. HERO SECTION (Heading + Badge + Subtitle)
          Mobile: Vertical Stack | Desktop: Row Align
         ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#243B53]/10 pb-5">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <h1 className="text-[24px] sm:text-[28px] lg:text-[32px] font-bold font-display tracking-tight text-[#102A43] leading-tight uppercase">
              EXTRACTED PROCUREMENT REQUIREMENTS
            </h1>

            {/* Status Badge */}
            <div>
              {!isReady ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-[#C53030] rounded-full text-xs font-semibold border border-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#C53030]" />
                  Clarification Required
                </span>
              ) : isConfirmed ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#16803C] rounded-full text-xs font-semibold border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16803C]" />
                  Requirements Confirmed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-[#D97706] rounded-full text-xs font-semibold border border-[#D97706]/40">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
                  Pending Confirmation
                </span>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#627D98] mt-1.5 leading-relaxed">
            {!isReady
              ? 'Additional procurement clarification is required before matching applicable Indian Standards.'
              : 'Review the extracted specifications below before confirming for future standards matching.'}
          </p>
        </div>
      </div>

      {/* ============================================================
          DOCUMENT PROVENANCE CARD (Only shown when source is document upload)
         ============================================================ */}
      {(analysis.document_provenance || analysis.file_name) && (
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs animate-fade-in space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E] shrink-0">
                <FileArchive className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#102A43] font-mono">
                    {analysis.document_provenance?.file_name || analysis.file_name || 'Procurement Document'}
                  </span>
                  <span className="px-1.5 py-0.2 text-[10px] font-bold uppercase rounded bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/20">
                    {analysis.document_provenance?.file_type?.toUpperCase() || (analysis.file_name?.endsWith('.docx') ? 'DOCX' : 'PDF')}
                  </span>
                  {analysis.document_provenance?.page_count && (
                    <span className="text-[11px] text-slate-500">
                      • {analysis.document_provenance.page_count} {analysis.document_provenance.page_count === 1 ? 'page' : 'pages'}
                    </span>
                  )}
                  {analysis.document_provenance?.file_size && (
                    <span className="text-[11px] text-slate-500">
                      • {(analysis.document_provenance.file_size / 1024).toFixed(1)} KB
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Extracted via {analysis.document_provenance?.extraction_method || 'local offline parser'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTextPreview(!showTextPreview)}
              className="text-xs text-[#0F766E] hover:underline font-semibold flex items-center gap-1 shrink-0 self-start sm:self-center cursor-pointer"
            >
              {showTextPreview ? 'Hide Extracted Text' : 'View Extracted Text'}
            </button>
          </div>

          {/* Multiple Products Warning if applicable */}
          {analysis.document_provenance?.multiple_products_detected && (
            <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Multiple Products Detected in Document:</strong> Analyzing primary item:{' '}
                <span className="font-semibold text-amber-950">
                  {analysis.document_provenance.primary_product_analyzed || analysis.requirements.product.name}
                </span>.
                Specifications for additional items will remain available in future multi-lot workflows.
              </div>
            </div>
          )}

          {/* Expandable Text Preview */}
          {showTextPreview && (
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-700 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {analysis.document_provenance?.extracted_preview || analysis.input_text}
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          2. DEMO / AI STATUS (Only shown when actual state is demo)
         ============================================================ */}
      {analysis.demo && (
        <div className="p-4 bg-amber-50/80 border border-[#D97706]/30 rounded-xl text-[#243B53] flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold text-[#D97706] block text-xs tracking-wide uppercase">
              Demo Mode
            </span>
            <p className="mt-0.5 text-[#627D98]">
              {analysis.warning || 'AI service is not configured. Add the required AI API key to the backend environment.'}
            </p>
          </div>
        </div>
      )}

      {/* ============================================================
          3A. READINESS STATUS BANNER (When clarification is required)
         ============================================================ */}
      {!isReady && (
        <div className="p-5 sm:p-6 bg-rose-50/90 border-2 border-rose-300 rounded-2xl shadow-xs animate-fade-in text-[#243B53]">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0 mt-0.5 text-[#C53030]">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-rose-950">
                Clarification required before finding applicable Indian Standards.
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-[#C53030] mt-0.5">
                Standards Matching Suspended — Critical Procurement Information Missing
              </p>
              <p className="text-xs text-[#243B53]/80 mt-1.5 leading-relaxed max-w-2xl">
                The extracted requirement does not contain sufficient reliable procurement details to accurately match verified BIS standards. Please review the blocking missing information and clarification questions below, and edit the requirements before proceeding.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleStartEdit('product')}
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#0C5D57] text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Requirements to Clarify</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          3B. CONFIRMED STATUS BANNER (When confirmation is completed and ready)
         ============================================================ */}
      {isReady && isConfirmed && (
        <div className="p-5 sm:p-6 bg-emerald-50/80 border-2 border-emerald-400 rounded-2xl shadow-xs animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 text-[#16803C]">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-emerald-950">
                Requirements confirmed
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-[#16803C] mt-0.5">
                Ready for Standards Matching
              </p>
              <p className="text-xs text-[#243B53]/80 mt-1.5 leading-relaxed max-w-2xl">
                The validated procurement profile has been securely recorded. These confirmed requirements will be evaluated using ISutra's explainable multi-signal matching engine against the verified BIS reference dataset.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  to="/analyze"
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#0C5D57] text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs"
                >
                  Start Another Analysis
                </Link>
                <Link
                  to="/history"
                  className="px-4 py-2 bg-white border border-[#243B53]/15 hover:bg-surface text-[#243B53] rounded-xl text-xs font-semibold transition-colors"
                >
                  View in Analysis History
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          4. BENTO GRID OF EXTRACTED REQUIREMENTS
          Desktop: 2-3 Column Bento Grid | Mobile: Single-Column
         ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        {/* ------------------------------------------------------------
            CARD 1: PRODUCT (Actual extracted product)
           ------------------------------------------------------------ */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#243B53]/10 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-[#243B53]/20 transition-all duration-200">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#243B53]/5">
            <span className="text-[11px] font-bold text-[#627D98] uppercase tracking-[0.08em] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#0F766E]" />
              Product
            </span>
            {!isConfirmed && (
              <button
                onClick={() => (editingCard === 'product' ? handleCancelEdit() : handleStartEdit('product'))}
                className="text-xs font-medium text-[#0F766E] hover:underline inline-flex items-center gap-1"
                aria-label="Edit product name"
              >
                {editingCard === 'product' ? (
                  <>
                    <X className="w-3 h-3" /> Cancel
                  </>
                ) : (
                  <>
                    <Edit2 className="w-3 h-3" /> Edit
                  </>
                )}
              </button>
            )}
          </div>

          {editingCard === 'product' ? (
            <div className="space-y-3 animate-fade-in">
              <div>
                <label className="text-[10px] uppercase font-bold text-[#627D98] tracking-[0.08em] block mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={draftProduct}
                  onChange={(e) => setDraftProduct(e.target.value)}
                  className="w-full text-sm font-semibold bg-surface border border-[#0F766E]/50 rounded-xl p-2.5 outline-hidden focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-[#627D98] tracking-[0.08em] block mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={draftCategory}
                  onChange={(e) => setDraftCategory(e.target.value)}
                  className="w-full text-xs font-medium bg-surface border border-[#243B53]/15 rounded-xl p-2 outline-hidden focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 text-xs text-[#627D98] hover:text-[#243B53] font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProduct}
                  className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#0C5D57] text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => handleStartEdit('product')}
              className={`cursor-pointer group ${!isConfirmed ? 'hover:bg-surface/50 p-2 -m-2 rounded-xl transition-colors' : ''}`}
            >
              <div className="text-[18px] sm:text-[22px] font-bold font-display text-[#243B53] leading-snug">
                {requirements.product.name}
              </div>
              {requirements.product.category && (
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-surface border border-[#243B53]/10 text-[#627D98]">
                  <span>Category:</span>
                  <span className="font-semibold text-[#243B53]">{requirements.product.category}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------
            CARD 2: APPLICATION (Actual extracted application)
           ------------------------------------------------------------ */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#243B53]/10 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-[#243B53]/20 transition-all duration-200">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#243B53]/5">
            <span className="text-[11px] font-bold text-[#627D98] uppercase tracking-[0.08em] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#0F766E]" />
              Application
            </span>
            {!isConfirmed && (
              <button
                onClick={() => (editingCard === 'application' ? handleCancelEdit() : handleStartEdit('application'))}
                className="text-xs font-medium text-[#0F766E] hover:underline inline-flex items-center gap-1"
                aria-label="Edit application"
              >
                {editingCard === 'application' ? (
                  <>
                    <X className="w-3 h-3" /> Cancel
                  </>
                ) : (
                  <>
                    <Edit2 className="w-3 h-3" /> Edit
                  </>
                )}
              </button>
            )}
          </div>

          {editingCard === 'application' ? (
            <div className="space-y-3 animate-fade-in">
              <div>
                <label className="text-[10px] uppercase font-bold text-[#627D98] tracking-[0.08em] block mb-1">
                  Intended Application
                </label>
                <input
                  type="text"
                  value={draftApplication}
                  placeholder="e.g. Outdoor"
                  onChange={(e) => setDraftApplication(e.target.value)}
                  className="w-full text-sm font-semibold bg-surface border border-[#0F766E]/50 rounded-xl p-2.5 outline-hidden focus:ring-1 focus:ring-[#0F766E]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 text-xs text-[#627D98] hover:text-[#243B53] font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveApplication}
                  className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#0C5D57] text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => handleStartEdit('application')}
              className={`cursor-pointer ${!isConfirmed ? 'hover:bg-surface/50 p-2 -m-2 rounded-xl transition-colors' : ''}`}
            >
              <div className="text-[18px] sm:text-[22px] font-bold font-display text-[#243B53]">
                {requirements.application || (
                  <span className="text-[#9FB3C8] italic font-normal text-base">Not specified</span>
                )}
              </div>
              <div className="mt-1.5 text-[11px] text-[#627D98]">
                Intended operational and installation context
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------
            CARD 3: TECHNICAL PARAMETERS (Actual extracted parameters)
           ------------------------------------------------------------ */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#243B53]/10 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-[#243B53]/20 transition-all duration-200">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#243B53]/5">
            <span className="text-[11px] font-bold text-[#627D98] uppercase tracking-[0.08em] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#0F766E]" />
              Technical Parameters
            </span>
            {!isConfirmed && (
              <button
                onClick={() => (editingCard === 'params' ? handleCancelEdit() : handleStartEdit('params'))}
                className="text-xs font-medium text-[#0F766E] hover:underline inline-flex items-center gap-1"
                aria-label="Edit technical parameters"
              >
                {editingCard === 'params' ? (
                  <>
                    <X className="w-3 h-3" /> Cancel
                  </>
                ) : (
                  <>
                    <Edit2 className="w-3 h-3" /> Edit
                  </>
                )}
              </button>
            )}
          </div>

          {editingCard === 'params' ? (
            <div className="space-y-3 animate-fade-in">
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {draftParams.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="flex items-center justify-between gap-2 p-2 bg-surface rounded-xl border border-[#243B53]/10 text-xs"
                  >
                    <span className="font-semibold text-[#243B53]">{p.parameter}:</span>
                    <input
                      type="text"
                      value={p.value}
                      onChange={(e) => {
                        const updated = [...draftParams];
                        updated[idx] = { ...updated[idx], value: e.target.value };
                        setDraftParams(updated);
                      }}
                      className="flex-1 px-2 py-1 bg-white border border-[#243B53]/15 rounded-lg text-xs outline-hidden"
                    />
                    <button
                      onClick={() => handleRemoveDraftParam(idx)}
                      className="p-1 text-[#627D98] hover:text-[#C53030]"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Parameter */}
              <div className="p-3 bg-teal/5 border border-[#0F766E]/20 rounded-xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#0F766E] tracking-[0.08em] block">
                  Add Parameter
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Name (e.g. Voltage)"
                    value={newParamName}
                    onChange={(e) => setNewParamName(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-[#243B53]/15 rounded-lg text-xs outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 230V)"
                    value={newParamValue}
                    onChange={(e) => setNewParamValue(e.target.value)}
                    className="w-28 px-2.5 py-1.5 bg-white border border-[#243B53]/15 rounded-lg text-xs outline-hidden"
                  />
                  <button
                    onClick={handleAddDraftParam}
                    disabled={!newParamName.trim() || !newParamValue.trim()}
                    className="px-3 py-1.5 bg-[#0F766E] text-white rounded-lg text-xs font-semibold hover:bg-[#0C5D57] disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 text-xs text-[#627D98] hover:text-[#243B53] font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveParams}
                  className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#0C5D57] text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => handleStartEdit('params')}
              className={`cursor-pointer space-y-2.5 ${!isConfirmed ? 'hover:bg-surface/50 p-2 -m-2 rounded-xl transition-colors' : ''}`}
            >
              {requirements.technical_parameters.length === 0 ? (
                <div className="text-sm text-[#9FB3C8] italic">No parameters specified</div>
              ) : (
                requirements.technical_parameters.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface border border-[#243B53]/5"
                  >
                    <span className="text-xs font-semibold text-[#627D98] uppercase tracking-[0.05em]">
                      {p.parameter}
                    </span>
                    <span className="text-sm sm:text-base font-bold font-display text-[#243B53]">
                      {p.value}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------
            CARD 4: ENVIRONMENT / INSTALLATION
           ------------------------------------------------------------ */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#243B53]/10 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-[#243B53]/20 transition-all duration-200">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#243B53]/5">
            <span className="text-[11px] font-bold text-[#627D98] uppercase tracking-[0.08em] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
              Environment / Installation
            </span>
            {!isConfirmed && (
              <button
                onClick={() => (editingCard === 'envInst' ? handleCancelEdit() : handleStartEdit('envInst'))}
                className="text-xs font-medium text-[#0F766E] hover:underline inline-flex items-center gap-1"
                aria-label="Edit environment and installation"
              >
                {editingCard === 'envInst' ? (
                  <>
                    <X className="w-3 h-3" /> Cancel
                  </>
                ) : (
                  <>
                    <Edit2 className="w-3 h-3" /> Edit
                  </>
                )}
              </button>
            )}
          </div>

          {editingCard === 'envInst' ? (
            <div className="space-y-4 animate-fade-in">
              {/* Environment draft */}
              <div>
                <span className="text-[10px] uppercase font-bold text-[#627D98] tracking-[0.08em] block mb-1.5">
                  Environment Tags:
                </span>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {draftEnv.map((e, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface border border-[#243B53]/10 rounded-lg text-xs"
                    >
                      <span>{e}</span>
                      <button onClick={() => handleRemoveDraftEnv(idx)} className="text-[#C53030] font-bold">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add environment (e.g. Weather resistant)"
                    value={newEnvInput}
                    onChange={(e) => setNewEnvInput(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-[#243B53]/15 rounded-lg text-xs outline-hidden"
                  />
                  <button
                    onClick={handleAddDraftEnv}
                    disabled={!newEnvInput.trim()}
                    className="px-3 py-1.5 bg-[#0F766E] text-white rounded-lg text-xs font-semibold hover:bg-[#0C5D57] disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Installation draft */}
              <div>
                <span className="text-[10px] uppercase font-bold text-[#627D98] tracking-[0.08em] block mb-1.5">
                  Installation Tags:
                </span>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {draftInst.map((i, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface border border-[#243B53]/10 rounded-lg text-xs"
                    >
                      <span>{i}</span>
                      <button onClick={() => handleRemoveDraftInst(idx)} className="text-[#C53030] font-bold">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add installation (e.g. Pole mounted)"
                    value={newInstInput}
                    onChange={(e) => setNewInstInput(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-[#243B53]/15 rounded-lg text-xs outline-hidden"
                  />
                  <button
                    onClick={handleAddDraftInst}
                    disabled={!newInstInput.trim()}
                    className="px-3 py-1.5 bg-[#0F766E] text-white rounded-lg text-xs font-semibold hover:bg-[#0C5D57] disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 text-xs text-[#627D98] hover:text-[#243B53] font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEnvInst}
                  className="px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#0C5D57] text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => handleStartEdit('envInst')}
              className={`cursor-pointer space-y-3 ${!isConfirmed ? 'hover:bg-surface/50 p-2 -m-2 rounded-xl transition-colors' : ''}`}
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-[#627D98] tracking-[0.08em] block mb-1">
                  Environment:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {requirements.environment.length === 0 ? (
                    <span className="text-xs text-[#9FB3C8] italic">Not specified</span>
                  ) : (
                    requirements.environment.map((env, idx) => (
                      <span
                        key={env.id || idx}
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface border border-[#243B53]/10 text-[#243B53]"
                      >
                        {env.name}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#627D98] tracking-[0.08em] block mb-1">
                  Installation / Mounting:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {requirements.installation_requirements.length === 0 ? (
                    <span className="text-xs text-[#9FB3C8] italic">Not specified</span>
                  ) : (
                    requirements.installation_requirements.map((inst, idx) => (
                      <span
                        key={inst.id || idx}
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface border border-[#243B53]/10 text-[#243B53]"
                      >
                        {inst.name}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          5. MISSING INFORMATION & CLARIFICATIONS SECTION
         ============================================================ */}
      <div className="space-y-4">
        {/* 5A. BLOCKING MISSING INFORMATION (Critical / Prevents Matching) */}
        {blockingInfo.length > 0 && (
          <div className="bg-rose-50/80 border border-rose-300 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle className="w-4 h-4 text-[#C53030]" />
              <h3 className="text-xs font-bold font-display text-[#C53030] uppercase tracking-[0.08em]">
                BLOCKING MISSING INFORMATION
              </h3>
            </div>
            <p className="text-xs text-[#627D98] mb-3">
              The following critical details must be clarified before Indian Standards matching can proceed:
            </p>
            <ul className="space-y-1.5">
              {blockingInfo.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-[#822020]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C53030] mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 5B. CLARIFICATION QUESTIONS */}
        {clarificationQuestions.length > 0 && (
          <div className="bg-amber-50/70 border border-[#D97706]/30 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center gap-2 mb-1.5">
              <HelpCircle className="w-4 h-4 text-[#D97706]" />
              <h3 className="text-xs font-bold font-display text-[#D97706] uppercase tracking-[0.08em]">
                CLARIFICATION QUESTIONS
              </h3>
            </div>
            <p className="text-xs text-[#627D98] mb-3">
              Clarifying these questions will provide sufficient context to identify applicable BIS standards:
            </p>
            <div className="space-y-2.5">
              {clarificationQuestions.map((q, idx) => (
                <div key={q.id || idx} className="p-3 bg-white/90 rounded-xl border border-amber-200/70 shadow-2xs">
                  <div className="text-xs font-semibold text-[#102A43] flex items-start gap-2">
                    <span className="text-[#D97706] font-bold">{idx + 1}.</span>
                    <span>{q.question}</span>
                  </div>
                  {q.options && q.options.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 pl-4">
                      {q.options.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => {
                            if (q.field === 'product.name' || q.field === 'product') {
                              setDraftProduct(opt);
                              handleStartEdit('product');
                            } else if (q.field === 'product.category' || q.field === 'category') {
                              setDraftCategory(opt);
                              handleStartEdit('product');
                            } else {
                              handleStartEdit('product');
                            }
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium bg-amber-50 hover:bg-amber-100 text-[#8F4A00] border border-amber-200/80 rounded-lg transition-colors cursor-pointer text-left"
                          title={`Click to set as ${q.field || 'value'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5C. NON-BLOCKING INFORMATIONAL GAPS */}
        {nonBlockingMissing.length > 0 && (
          <div className="bg-slate-50 border border-[#243B53]/10 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center gap-2 mb-1.5">
              <Info className="w-4 h-4 text-[#627D98]" />
              <h3 className="text-xs font-bold font-display text-[#627D98] uppercase tracking-[0.08em]">
                ADDITIONAL INFORMATIONAL DETAILS (NON-BLOCKING)
              </h3>
            </div>
            <p className="text-xs text-[#627D98] mb-3">
              These details were not specified but may improve matching precision once critical fields are provided:
            </p>
            <ul className="space-y-1.5">
              {nonBlockingMissing.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs font-medium text-[#243B53]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#627D98]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ============================================================
          6. ACTION BAR
          Desktop: Right Aligned | Mobile: Stacked Vertically
          Buttons: At least 44px height (min-h-[44px])
         ============================================================ */}
      <div className="bg-white border border-[#243B53]/10 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sticky bottom-4 z-20">
        <div className="text-xs text-[#627D98]">
          {!isReady ? (
            <span className="text-[#C53030] font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#C53030]" />
              Clarification required before finding applicable Indian Standards.
            </span>
          ) : isConfirmed ? (
            <span className="text-[#16803C] font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Requirements confirmed. Ready for Standards Matching.
            </span>
          ) : (
            <span>
              Click any value or "Edit Requirements" to modify before confirming.
            </span>
          )}
        </div>

        {/* Buttons (Desktop: Right aligned, Mobile: Stack vertically, min-h-[44px]) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => {
              if (editingCard) {
                setEditingCard(null);
              } else {
                handleStartEdit('product');
              }
            }}
            className="min-h-[44px] px-5 py-2.5 rounded-xl border border-[#0F766E] text-[#0F766E] hover:bg-[#0F766E]/5 text-xs font-semibold transition-all text-center flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
            <span>{!isReady ? 'Edit to Provide Clarification' : 'Edit Requirements'}</span>
          </button>

          {!isReady ? (
            <button
              disabled
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-2"
              title="Clarification required before finding applicable Indian Standards."
            >
              <Sparkles className="w-4 h-4 text-slate-400" />
              <span>Find Relevant BIS Standards</span>
            </button>
          ) : !isConfirmed ? (
            <button
              onClick={handleConfirmRequirements}
              disabled={confirming}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0C5D57] text-white text-xs font-semibold transition-all text-center flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 active:scale-[0.99] cursor-pointer"
            >
              {confirming ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Confirming...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Requirements</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Link
                to="/history"
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#243B53]/20 hover:bg-slate-50 text-[#243B53] text-xs font-semibold transition-all text-center flex items-center justify-center gap-1.5"
              >
                <span>Analysis History</span>
              </Link>
              <Link
                to={`/analysis/${analysis.analysis_id}/recommendations`}
                state={{ analysis, requirements }}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#0D9488] hover:from-[#0C5D57] hover:to-[#0F766E] text-white text-xs font-semibold transition-all text-center flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Find Relevant BIS Standards</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
