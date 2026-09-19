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
            <span>BIS Standards Recommendation Engine</span>
          </div>

          <h1 className="text-[24px] sm:text-[28px] lg:text-[32px] font-bold text-[#102A43] tracking-tight leading-tight font-display">
            Procurement Intelligence
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            Turn procurement requirements into explainable, traceable BIS reference standards with transparent multi-signal verification.
          </p>
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
          3. SECTION B: WHAT ISUTRA DOES (4 CORE CAPABILITIES)
         ============================================================ */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#102A43] font-display">
            What ISutra Does
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1 */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E] mb-3">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#102A43] mb-1 font-display">
                1. Requirement Extraction
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Turn unstructured procurement text into structured requirements.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E] mb-3">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#102A43] mb-1 font-display">
                2. Explainable BIS Matching
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Match requirements against the verified BIS reference dataset using transparent multi-signal scoring.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E] mb-3">
                <FileCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#102A43] mb-1 font-display">
                3. Evidence & Gap Analysis
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                See why a standard matched and identify information that needs verification.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E] mb-3">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#102A43] mb-1 font-display">
                4. Standards Comparison
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Compare relevant standards side-by-side using documented reference fields.
              </p>
            </div>
          </div>
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
              ISutra currently demonstrates its workflow against a curated reference dataset of 40 verified BIS standards across selected infrastructure sectors.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] text-slate-500 leading-relaxed">
              <strong className="text-slate-700 font-semibold">Scope note: </strong>
              Covers representative Indian Standards across Road & Street Lighting, Electrical Cables, Construction, Pipes & Water Supply, and Renewable Systems.
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
