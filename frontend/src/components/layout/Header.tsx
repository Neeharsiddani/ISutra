// ============================================================
// ISutra — Top Application Header
// Responsive page context on left, actions on right
// Strictly fits within available width with zero overflow
// ============================================================

import { Link, useLocation } from 'react-router-dom';
import { Menu, Plus, Search, HelpCircle, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const location = useLocation();

  const matchAnalysis = location.pathname.match(/\/analysis\/([^/]+)/);
  const currentAnalysisId = matchAnalysis ? matchAnalysis[1] : null;

  const getContextLabel = () => {
    if (currentAnalysisId) return 'Requirement Review';
    if (location.pathname === '/' || location.pathname === '/dashboard') return 'Dashboard';
    if (location.pathname.startsWith('/analyze')) return 'Procurement Workspace';
    if (location.pathname.startsWith('/standards')) return 'Standards Directory';
    if (location.pathname.startsWith('/history')) return 'Analysis History';
    if (location.pathname.startsWith('/about')) return 'About & Help';
    if (location.pathname.startsWith('/how-it-works')) return 'How It Works';
    return 'Procurement Workspace';
  };

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-slate-200/80 px-3.5 sm:px-5 lg:px-7 flex items-center justify-between sticky top-0 z-20 shrink-0 w-full max-w-full box-border">
      {/* Left Section: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 pr-2 flex-1">
        {/* Mobile toggle button (< 1024px) */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 -ml-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand / Context */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="flex items-center gap-1 lg:hidden shrink-0">
            <span className="font-bold text-base text-[#102A43] font-display">
              ISutra
            </span>
            <span className="text-slate-300">/</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 min-w-0 truncate">
            <span className="hidden lg:inline-flex items-center gap-1.5 font-semibold text-[#102A43] shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
              ISutra Intelligence
            </span>
            <span className="hidden lg:inline text-slate-300">/</span>
            <span className="text-slate-700 font-medium truncate">
              {getContextLabel()}
            </span>
            {currentAnalysisId && (
              <>
                <span className="text-slate-300">/</span>
                <span className="font-mono text-xs font-semibold text-[#0F766E] bg-[#0F766E]/8 px-2 py-0.5 rounded border border-[#0F766E]/20 truncate">
                  ID: {currentAnalysisId.slice(0, 8)}...
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Section: Responsive Action Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* 1. Search Standards: text visible on >= 900px (approx md/lg threshold), icon only on small screens */}
        <Link
          to="/standards"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-[13px] text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors font-medium shrink-0"
          title="Search Standards"
        >
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden min-[900px]:inline">Search Standards</span>
        </Link>

        {/* 2. Help: visible on >= 900px */}
        <Link
          to="/about"
          className="hidden min-[900px]:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium shrink-0"
          title="Help & About"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>Help</span>
        </Link>

        {/* 3. New Analysis Button: always visible */}
        <Link
          to="/analyze"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Analysis</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>
    </header>
  );
}
