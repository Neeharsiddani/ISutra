// ============================================================
// ISutra — Differentiation Panel: Search vs Procurement Intelligence
// Explicitly communicates architecture separation & workflow advantage
// ============================================================

import React from 'react';
import { Sparkles, Search, Layers, ShieldCheck } from 'lucide-react';

interface DifferentiationPanelProps {
  compact?: boolean;
}

export const DifferentiationPanel: React.FC<DifferentiationPanelProps> = ({ compact: _compact = false }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header & Positioning */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0F766E]/10 border border-[#0F766E]/20 text-[10px] font-bold text-[#0F766E] uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>Beyond Keyword Search</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#102A43] font-display">
            ISutra Procurement Intelligence vs. Generic Search
          </h3>
        </div>
        <span className="text-[11px] text-slate-500 font-medium italic">
          Audit-ready procurement decisions
        </span>
      </div>

      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
        <strong className="text-[#102A43] font-semibold">ISutra goes beyond finding a standard</strong> — it structures procurement requirements, explains recommendations, exposes evidence and gaps, and guides users to official BIS verification.
      </p>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Left Column: Standard Search */}
        <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 p-3.5 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-200/70 flex items-center justify-center text-slate-600">
              <Search className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-display">
                Generic Search
              </h4>
              <span className="text-[10px] text-slate-400">Keyword lookup approach</span>
            </div>
          </div>

          <ul className="space-y-1.5 text-[11px] text-slate-600">
            <li className="flex items-start gap-1.5">
              <span className="text-slate-400 font-bold">•</span>
              <span>Keyword-based title / text lookup only</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-slate-400 font-bold">•</span>
              <span>Returns list of standards without procurement context</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-slate-400 font-bold">•</span>
              <span>No human review or confirmation of parameters</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-slate-400 font-bold">•</span>
              <span>No explainable signal weights or factor breakdown</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-slate-400 font-bold">•</span>
              <span>No requirement gap analysis or missing parameter audit</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-slate-400 font-bold">•</span>
              <span>No self-contained printable evaluation report</span>
            </li>
          </ul>
        </div>

        {/* Right Column: ISutra Decision Intelligence */}
        <div className="bg-teal-50/40 rounded-xl border border-[#0F766E]/30 p-3.5 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#0F766E]/15 flex items-center justify-center text-[#0F766E]">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0F766E] uppercase tracking-wider font-display">
                ISutra Decision Intelligence
              </h4>
              <span className="text-[10px] text-teal-800 font-medium">8-Stage Explainable Workflow</span>
            </div>
          </div>

          <ul className="space-y-1.5 text-[11px] text-[#102A43]">
            <li className="flex items-start gap-1.5">
              <span className="text-[#0F766E] font-bold">✓</span>
              <span><strong>Understands Requirements:</strong> NLP structures messy specs (English, Hindi, Telugu)</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#0F766E] font-bold">✓</span>
              <span><strong>Human Review:</strong> Inspect, confirm, or edit extracted parameters before matching</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#0F766E] font-bold">✓</span>
              <span><strong>Deterministic 6-Signal Matching:</strong> Transparent scoring across verified BIS reference dataset</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#0F766E] font-bold">✓</span>
              <span><strong>Evidence Traceability:</strong> "Why This Standard?" factor scores and normative references</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#0F766E] font-bold">✓</span>
              <span><strong>Requirement Gap Analysis:</strong> Exposes unverified ratings, missing limits & verification needs</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#0F766E] font-bold">✓</span>
              <span><strong>Lifecycle & Comparison:</strong> 5-stage edition timeline, QCO/CRS checks & neutral comparison</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#0F766E] font-bold">✓</span>
              <span><strong>Procurement Report:</strong> Auditable, self-contained printable report with official BIS links</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Architecture Separation & Official Authority Notice */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
        <div className="flex items-center gap-1.5 text-[#102A43] font-bold font-display">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
          <span>Core Architecture & Authority Separation</span>
        </div>
        <p className="leading-relaxed">
          <strong className="text-slate-800">AI/NLP structures the requirement. Deterministic logic evaluates the verified standards dataset.</strong>
        </p>
        <p className="text-slate-500 italic">
          Official BIS sources remain the authority for final verification. Recommendations are evaluated against 40 verified reference records; this prototype is not an exhaustive BIS catalogue.
        </p>
      </div>
    </div>
  );
};

export default DifferentiationPanel;
