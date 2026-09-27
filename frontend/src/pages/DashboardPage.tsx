// ============================================================
// ISutra — Procurement Intelligence Overview Dashboard
// Overview workspace: answers "What can I do with ISutra?"
// Strictly fits within viewport with zero horizontal overflow
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  ArrowRight,
  Sliders,
  Compass,
  FileCheck,
  Layers,
  BookOpen,
  History,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Scale,
  ExternalLink,
} from 'lucide-react';
import { getAnalysisHistory } from '../services/api';
import type { AnalysisHistoryItem } from '../types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    getAnalysisHistory()
      .then((data) => {
        if (Array.isArray(data)) {
          setRecentAnalyses(data.slice(0, 3));
        }
      })
      .catch(() => setRecentAnalyses([]))
      .finally(() => setLoadingHistory(false));
  }, []);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="w-full max-w-full space-y-5 sm:space-y-6 pb-8 animate-fade-in box-border">
      {/* ============================================================
          1. HERO HEADER: PROCUREMENT INTELLIGENCE OVERVIEW
         ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 sm:pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0F766E]/8 border border-[#0F766E]/20 text-[11px] font-semibold text-[#0F766E] uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#0F766E]" />
            <span>BIS Standards Decision Intelligence</span>
          </div>

          <h1 className="text-[22px] sm:text-[26px] lg:text-[30px] font-bold text-[#102A43] tracking-tight leading-tight font-display">
            From Procurement Requirement → Explainable BIS Standards Intelligence
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
            ISutra structures unstructured procurement requirements, matches them against a verified BIS reference dataset, explains why standards were surfaced, identifies evidence gaps, and provides an auditable path to official BIS verification.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-medium text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              40 Verified BIS Reference Records
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Prototype Scope • This prototype is not an exhaustive BIS catalogue. Recommendations are limited to the verified reference dataset.
            </span>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/analyze')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-[0.99] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          2. SECTION A: QUICK START BANNER
         ============================================================ */}
      <div className="bg-gradient-to-br from-white to-slate-50/80 rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="max-w-2xl space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] font-display">
              Quick Start
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#102A43] font-display">
              Start a new procurement analysis
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Describe your procurement requirement and ISutra will structure it, identify relevant BIS reference standards, explain the matching signals, and highlight information that needs verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-1 lg:pt-0">
            <button
              type="button"
              onClick={() => navigate('/analyze')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-[0.99] cursor-pointer"
            >
              <span>New Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/standards"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#102A43] border border-slate-200 text-xs sm:text-sm font-semibold transition-colors"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Browse Directory</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================
          3. SECTION B: EXPLAINABLE STANDARDS DECISION CAPABILITIES
         ============================================================ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#102A43] font-display">
              Explainable Standards Decision Workflow
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline font-medium">
            11 Traceable Capabilities
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            { step: '01', title: 'Requirement Extraction', desc: 'Structure messy procurement specifications into parameters.', icon: Sliders },
            { step: '02', title: 'Human Review', desc: 'Inspect and confirm parameters before matching.', icon: CheckCircle2 },
            { step: '03', title: 'Multi-Signal Matching', desc: 'Deterministic scoring across 6 weighted signals.', icon: Compass },
            { step: '04', title: 'Why This Standard?', desc: 'Auditable factor contributions with zero guessing.', icon: Sparkles },
            { step: '05', title: 'Allied Standards', desc: 'Normative references and test methods trail.', icon: Layers },
            { step: '06', title: 'Gap Analysis', desc: 'Reference coverage and missing parameter verification.', icon: FileCheck },
            { step: '07', title: 'Lifecycle & Amendments', desc: 'Curated edition history and reaffirmation status.', icon: History },
            { step: '08', title: 'Standards Comparison', desc: 'Neutral side-by-side evaluation without winner bias.', icon: Scale },
            { step: '09', title: 'Regulatory Evidence', desc: 'Mandatory QCO and CRS order applicability.', icon: ShieldCheck },
            { step: '10', title: 'Procurement Report', desc: 'Self-contained audit report with Print/PDF export.', icon: FileText },
            { step: '11', title: 'Official BIS Verification', desc: 'Direct portal links to bis.gov.in verification.', icon: ExternalLink },
            { step: '12', title: 'Dataset Scalability', desc: 'Designed to scale over larger verified BIS catalogue.', icon: BookOpen },
          ].map((cap) => {
            const IconComp = cap.icon;
            return (
              <div
                key={cap.step}
                className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E]">
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {cap.step}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-[#102A43] mb-1 font-display">
                    {cap.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {cap.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          4. SECTION E: COMPACT 4-STEP HOW IT WORKS
         ============================================================ */}
      <div className="bg-slate-50/70 rounded-2xl border border-slate-200/70 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-display">
            How It Works
          </span>
          <Link
            to="/how-it-works"
            className="text-xs text-[#0F766E] hover:underline font-medium inline-flex items-center gap-1"
          >
            <span>Learn more</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
            <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider block mb-0.5">
              Step 01
            </span>
            <h4 className="text-xs font-bold text-[#102A43]">Describe</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Enter procurement specification or load the demo tender extract.
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
            <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider block mb-0.5">
              Step 02
            </span>
            <h4 className="text-xs font-bold text-[#102A43]">Extract</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Review and confirm structured product parameters and conditions.
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
            <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider block mb-0.5">
              Step 03
            </span>
            <h4 className="text-xs font-bold text-[#102A43]">Match</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Evaluate ranked recommendations with transparent 5-stage traceability.
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
            <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider block mb-0.5">
              Step 04
            </span>
            <h4 className="text-xs font-bold text-[#102A43]">Verify</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Conduct gap analysis, checklist checks, and side-by-side comparison.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================
          5. SECTION C & D: REFERENCE DATASET & RECENT ANALYSES
         ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Card D: Reference Dataset */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] font-display">
                Reference Dataset
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-[#102A43] font-display">
              Verified BIS Reference Dataset
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              ISutra demonstrates its workflow against 40 Verified BIS Reference Records across selected infrastructure sectors. This prototype is not an exhaustive BIS catalogue; recommendations are limited to the verified reference dataset.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] text-slate-600 leading-relaxed space-y-1">
              <p>
                <strong className="text-slate-800 font-semibold">Scope note: </strong>
                Covers representative Indian Standards across Road & Street Lighting, Electrical Cables, Construction, Pipes & Water Supply, and Renewable Systems.
              </p>
              <p className="text-slate-500 italic">
                The matching and evidence model is designed to operate over a larger verified BIS catalogue when additional records are incorporated.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              40 Verified Records
            </span>
            <Link
              to="/standards"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] hover:text-[#0D655E]"
            >
              <span>Explore Standards</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card C: Recent Analyses */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#0F766E]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] font-display">
                  Recent Analyses
                </span>
              </div>
              <Link
                to="/history"
                className="text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                View History
              </Link>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-[#102A43] font-display mb-2">
              Recent Procurement Records
            </h3>

            {loadingHistory ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Loading session history...
              </div>
            ) : recentAnalyses.length > 0 ? (
              <div className="space-y-2">
                {recentAnalyses.map((item) => (
                  <Link
                    key={item.id}
                    to={`/analysis/${item.analysis_id}/review`}
                    className="block p-2.5 rounded-xl bg-slate-50 hover:bg-[#0F766E]/5 border border-slate-200/80 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-[#102A43] truncate font-display">
                        {item.product_name || 'Procurement Analysis'}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.short_description || 'View extracted requirements & standards'}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 text-center space-y-2 my-1">
                <FileText className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600">
                  No previous analyses recorded in this session.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/analyze')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-[#0F766E] hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Analysis</span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Audit trails & requirement confirmation records
            </span>
            <Link
              to="/history"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F766E] hover:text-[#0D655E]"
            >
              <span>Review Analysis History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
