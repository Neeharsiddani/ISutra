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
  Globe,
  Plus,
} from 'lucide-react';
import { getAnalysisById, updateAnalysisRequirements } from '../services/api';
import type {
  AIAnalysisResult,
  StructuredRequirements,
  TechnicalParameterItem,
} from '../types';

function formatParamDisplay(p: TechnicalParameterItem): string {
  let val = (p.value || '').trim();
  val = val.replace(/\bunits\s+units\b/gi, 'units');

  const paramName = (p.parameter || '').toLowerCase();

  // If unit is explicitly set on parameter and not already in value
  if (p.unit && p.unit.trim()) {
    const unit = p.unit.trim();
    if (!val.toLowerCase().includes(unit.toLowerCase())) {
      val = `${val} ${unit}`;
    }
    return val;
  }

  // Infer missing standard unit if value is just numeric
  if (/^\d+(\.\d+)?$/.test(val)) {
    if (paramName.includes('power') || paramName.includes('wattage')) {
      return `${val} W`;
    }
    if (paramName.includes('surge')) {
      return `${val} kV`;
    }
    if (paramName.includes('ingress') || paramName.includes('ip rating') || paramName === 'ip') {
      return `IP${val}`;
    }
    if (paramName.includes('voltage')) {
      return `${val}V AC`;
    }
    if (paramName.includes('efficacy') || paramName.includes('lumen')) {
      return `${val} lm/W`;
    }
    if (paramName.includes('cct') || paramName.includes('color temp')) {
      return `${val}K`;
    }
    if (paramName.includes('warranty')) {
      return `${val} Years`;
    }
    if (paramName.includes('quantity')) {
      return `${val} units`;
    }
  }

  if ((paramName.includes('ingress') || paramName.includes('ip rating')) && /^\d+$/.test(val)) {
    return `IP${val}`;
  }

  return val;
}

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

  // Edit Requirements Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Clarification questions selected answers
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

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
          try {
            sessionStorage.setItem('isutra_analysis_' + res.analysis_id, JSON.stringify(res));
            sessionStorage.setItem('isutra_latest_analysis', JSON.stringify(res));
          } catch {}
        })
        .catch((err) => {
          try {
            const cached = sessionStorage.getItem('isutra_analysis_' + id) || sessionStorage.getItem('isutra_latest_analysis');
            if (cached) {
              const res = JSON.parse(cached);
              setAnalysis(res);
              setRequirements(res.requirements);
              setIsConfirmed(res.confirmed || false);
              syncDrafts(res.requirements);
              return;
            }
          } catch {}
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

  // Save all requirements from Edit Modal
  const handleSaveAllModal = () => {
    if (!requirements) return;
    const updated: StructuredRequirements = {
      ...requirements,
      product: {
        ...requirements.product,
        name: draftProduct.trim() || requirements.product.name,
        category: draftCategory.trim() || requirements.product.category,
      },
      application: draftApplication.trim() || null,
      technical_parameters: draftParams,
      environment: draftEnv.map((name) => ({ id: `env-${Date.now()}-${name}`, name, confidence: 'high' })),
      installation_requirements: draftInst.map((name) => ({ id: `inst-${Date.now()}-${name}`, name, confidence: 'high' })),
    };
    saveUpdatedRequirements(updated);
    setIsEditModalOpen(false);
  };

  // Handle clicking a clarification question option
  const handleSelectOption = (q: any, opt: string, idx: number) => {
    if (!requirements) return;
    const qKey = q.id || `q-${idx}`;
    const isCurrentlySelected = selectedAnswers[qKey] === opt;
    const newAnswer = isCurrentlySelected ? '' : opt;
    setSelectedAnswers((prev) => ({ ...prev, [qKey]: newAnswer }));

    if (isCurrentlySelected) return; // unselected

    const qField = (q.field || '').toLowerCase();
    const qText = (q.question || '').toLowerCase();
    const optClean = opt.trim();

    let updatedReqs = { ...requirements };

    if (qField.includes('category') || qText.includes('category')) {
      updatedReqs = {
        ...updatedReqs,
        product: {
          ...updatedReqs.product,
          category: optClean,
        },
      };
      setDraftCategory(optClean);
    } else if (qField.includes('quantity') || qText.includes('quantity')) {
      const cleanQty = optClean.replace(/\s*units?\s*$/i, '').trim();
      const formattedQty = `${cleanQty} units`;
      const existingQtyIdx = updatedReqs.technical_parameters.findIndex((p) => p.parameter.toLowerCase() === 'quantity');
      const newParam: TechnicalParameterItem = {
        id: `param-qty-${Date.now()}`,
        parameter: 'Quantity',
        value: formattedQty,
        confidence: 'high',
        source_text: 'Clarification answer',
      };
      const params = [...updatedReqs.technical_parameters];
      if (existingQtyIdx >= 0) {
        params[existingQtyIdx] = newParam;
      } else {
        params.push(newParam);
      }
      updatedReqs = {
        ...updatedReqs,
        quantity: formattedQty,
        technical_parameters: params,
      };
      setDraftParams(params);
    } else if (qField.includes('voltage') || qText.includes('voltage')) {
      const existingIdx = updatedReqs.technical_parameters.findIndex((p) =>
        p.parameter.toLowerCase().includes('voltage')
      );
      const newParam: TechnicalParameterItem = {
        id: `param-voltage-${Date.now()}`,
        parameter: 'Operating Voltage',
        value: optClean,
        confidence: 'high',
        source_text: 'Clarification answer',
      };
      const params = [...updatedReqs.technical_parameters];
      if (existingIdx >= 0) {
        params[existingIdx] = newParam;
      } else {
        params.push(newParam);
      }
      updatedReqs = { ...updatedReqs, technical_parameters: params };
      setDraftParams(params);
    } else if (
      qField.includes('color') ||
      qField.includes('cct') ||
      qText.includes('color temperature') ||
      qText.includes('cct')
    ) {
      const existingIdx = updatedReqs.technical_parameters.findIndex(
        (p) =>
          p.parameter.toLowerCase().includes('cct') ||
          p.parameter.toLowerCase().includes('color temperature')
      );
      const newParam: TechnicalParameterItem = {
        id: `param-cct-${Date.now()}`,
        parameter: 'Color Temperature (CCT)',
        value: optClean,
        confidence: 'high',
        source_text: 'Clarification answer',
      };
      const params = [...updatedReqs.technical_parameters];
      if (existingIdx >= 0) {
        params[existingIdx] = newParam;
      } else {
        params.push(newParam);
      }
      updatedReqs = { ...updatedReqs, technical_parameters: params };
      setDraftParams(params);
    } else if (qField.includes('product') || qText.includes('product name')) {
      updatedReqs = {
        ...updatedReqs,
        product: {
          ...updatedReqs.product,
          name: optClean,
        },
      };
      setDraftProduct(optClean);
    } else if (qField.includes('environment') || qText.includes('environment')) {
      if (!updatedReqs.environment.some((e) => e.name === optClean)) {
        const env = [
          ...updatedReqs.environment,
          { id: `env-${Date.now()}`, name: optClean, confidence: 'high' as const },
        ];
        updatedReqs = { ...updatedReqs, environment: env };
        setDraftEnv(env.map((e) => e.name));
      }
    } else if (qField.includes('application') || qText.includes('application') || qText.includes('intended use')) {
      updatedReqs = {
        ...updatedReqs,
        application: optClean,
      };
      setDraftApplication(optClean);
    } else if (qField.includes('mount') || qText.includes('mount') || qField.includes('install')) {
      if (!updatedReqs.installation_requirements.some((i) => i.name === optClean)) {
        const inst = [
          ...updatedReqs.installation_requirements,
          { id: `inst-${Date.now()}`, name: optClean, confidence: 'high' as const },
        ];
        updatedReqs = { ...updatedReqs, installation_requirements: inst };
        setDraftInst(inst.map((i) => i.name));
      }
    } else {
      const paramName = q.field || (q.question ? q.question.replace(/\?.*$/, '').slice(0, 32) : 'Clarification Detail');
      const params = [
        ...updatedReqs.technical_parameters,
        {
          id: `param-clar-${Date.now()}`,
          parameter: paramName,
          value: optClean,
          confidence: 'high' as const,
          source_text: 'Clarification answer',
        },
      ];
      updatedReqs = { ...updatedReqs, technical_parameters: params };
      setDraftParams(params);
    }

    saveUpdatedRequirements(updatedReqs);
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
      try {
        sessionStorage.setItem('isutra_analysis_' + updated.analysis_id, JSON.stringify(updated));
        sessionStorage.setItem('isutra_latest_analysis', JSON.stringify(updated));
      } catch {}
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
          MULTILINGUAL INPUT INTELLIGENCE BANNER
         ============================================================ */}
      {analysis.language_metadata && (
        <div className="bg-slate-50 border border-[#0F766E]/30 rounded-2xl p-4 sm:p-5 shadow-2xs animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E] shrink-0 mt-0.5">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-[#102A43]">
                  Detected language: {analysis.language_metadata.detected_language_label}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/20">
                  {analysis.language_metadata.detected_language.toUpperCase()}
                </span>
                {analysis.language_metadata.detection_method && (
                  <span className="text-[11px] text-slate-400">
                    ({analysis.language_metadata.detection_method === 'user_selected' ? 'User Selected' : 'Script Heuristic'})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                ISutra converts the input into structured procurement requirements before standards matching.
              </p>
            </div>
          </div>
          <div className="text-[11px] text-[#0F766E] font-medium shrink-0 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
            Standardized English representation
          </div>
        </div>
      )}

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
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#627D98] uppercase tracking-[0.05em]">
                        {p.parameter}
                      </span>
                      {p.confidence === 'needs_review' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          Uncertain / Review
                        </span>
                      )}
                    </div>
                    <span className="text-sm sm:text-base font-bold font-display text-[#243B53]">
                      {formatParamDisplay(p)}
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
                    <div className="mt-2.5 flex flex-wrap gap-2 pl-4">
                      {q.options.map((opt, optIdx) => {
                        const qKey = q.id || `q-${idx}`;
                        const isSelected = selectedAnswers[qKey] === opt;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectOption(q, opt, idx)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
                              isSelected
                                ? 'bg-[#0F766E] text-white border-[#0F766E] ring-2 ring-[#0F766E]/30'
                                : 'bg-amber-50 hover:bg-amber-100/90 text-[#8F4A00] border-amber-200/90 hover:border-amber-300'
                            }`}
                            title={`Select '${opt}'`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                            <span>{opt}</span>
                          </button>
                        );
                      })}
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
            type="button"
            onClick={() => {
              if (requirements) syncDrafts(requirements);
              setIsEditModalOpen(true);
            }}
            className="min-h-[44px] px-5 py-2.5 rounded-xl border-2 border-[#0F766E] bg-white text-[#0F766E] hover:bg-[#0F766E]/10 text-xs font-bold transition-all text-center flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer shadow-xs"
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

      {/* ============================================================
          6. EDIT REQUIREMENTS MODAL
         ============================================================ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#0F766E]" />
                <h3 className="text-base font-bold text-[#102A43] font-display">
                  Edit Procurement Requirements
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Product Name */}
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={draftProduct}
                  onChange={(e) => setDraftProduct(e.target.value)}
                  className="w-full text-sm font-semibold bg-white border border-slate-300 rounded-xl p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-hidden"
                  placeholder="e.g., Outdoor LED street lighting system"
                />
              </div>

              {/* Category & Application */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={draftCategory}
                    onChange={(e) => setDraftCategory(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-hidden"
                    placeholder="e.g., Lighting"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                    Intended Application
                  </label>
                  <input
                    type="text"
                    value={draftApplication}
                    onChange={(e) => setDraftApplication(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl p-2.5 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-hidden"
                    placeholder="e.g., municipal highway lighting"
                  />
                </div>
              </div>

              {/* Technical Parameters */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                    Technical Parameters
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {draftParams.length} parameters configured
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {draftParams.map((p, idx) => (
                    <div
                      key={p.id || idx}
                      className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <input
                        type="text"
                        value={p.parameter}
                        onChange={(e) => {
                          const updated = [...draftParams];
                          updated[idx] = { ...updated[idx], parameter: e.target.value };
                          setDraftParams(updated);
                        }}
                        className="w-1/3 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold outline-hidden"
                        placeholder="Parameter Name"
                      />
                      <input
                        type="text"
                        value={p.value}
                        onChange={(e) => {
                          const updated = [...draftParams];
                          updated[idx] = { ...updated[idx], value: e.target.value };
                          setDraftParams(updated);
                        }}
                        className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs outline-hidden"
                        placeholder="Value"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...draftParams];
                          const newConf = updated[idx].confidence === 'needs_review' ? 'high' : 'needs_review';
                          updated[idx] = { ...updated[idx], confidence: newConf };
                          setDraftParams(updated);
                        }}
                        className={`px-2 py-1 text-[11px] font-bold rounded-lg border cursor-pointer transition-colors ${
                          p.confidence === 'needs_review'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                        title={p.confidence === 'needs_review' ? 'Marked as uncertain (click to clear)' : 'Click to mark as uncertain / needs review'}
                      >
                        {p.confidence === 'needs_review' ? 'Uncertain' : 'Verified'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveDraftParam(idx)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                        title="Delete parameter"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Parameter row */}
                <div className="flex items-center gap-2 p-2 bg-teal-50/50 border border-teal-200/60 rounded-xl">
                  <input
                    type="text"
                    placeholder="New Parameter (e.g., Voltage)"
                    value={newParamName}
                    onChange={(e) => setNewParamName(e.target.value)}
                    className="w-1/3 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g., 230V AC)"
                    value={newParamValue}
                    onChange={(e) => setNewParamValue(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddDraftParam}
                    disabled={!newParamName.trim() || !newParamValue.trim()}
                    className="px-3 py-1.5 bg-[#0F766E] text-white rounded-lg text-xs font-semibold hover:bg-[#0C5D57] disabled:opacity-40 flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>

              {/* Environment & Installation Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                {/* Environment Tags */}
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                    Environment Conditions
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2 min-h-[34px] p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {draftEnv.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">No environment tags</span>
                    ) : (
                      draftEnv.map((env, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 shadow-2xs"
                        >
                          {env}
                          <button
                            type="button"
                            onClick={() => handleRemoveDraftEnv(idx)}
                            className="text-slate-400 hover:text-red-500 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="e.g., Outdoor, IP65"
                      value={newEnvInput}
                      onChange={(e) => setNewEnvInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDraftEnv();
                        }
                      }}
                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddDraftEnv}
                      disabled={!newEnvInput.trim()}
                      className="px-2.5 py-1.5 bg-slate-700 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Installation Tags */}
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1">
                    Installation / Mounting
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2 min-h-[34px] p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {draftInst.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">No installation tags</span>
                    ) : (
                      draftInst.map((inst, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 shadow-2xs"
                        >
                          {inst}
                          <button
                            type="button"
                            onClick={() => handleRemoveDraftInst(idx)}
                            className="text-slate-400 hover:text-red-500 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="e.g., Pole mount"
                      value={newInstInput}
                      onChange={(e) => setNewInstInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDraftInst();
                        }
                      }}
                      className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddDraftInst}
                      disabled={!newInstInput.trim()}
                      className="px-2.5 py-1.5 bg-slate-700 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/70">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAllModal}
                className="px-5 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0C5D57] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save Requirements
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
