// ============================================================
// ISutra — Top Navigation Bar
// Desktop: Left brand + dynamic breadcrumb, Right: Search, Help, New Analysis
// Mobile (< 768px): Left Hamburger + ISutra, Right: New Analysis
// ============================================================

import { Link, useLocation } from 'react-router-dom';
import { Menu, Plus, Search, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const location = useLocation();

  // Extract actual analysis ID from URL if on an analysis route
  const matchAnalysis = location.pathname.match(/\/analysis\/([^/]+)/);
  const currentAnalysisId = matchAnalysis ? matchAnalysis[1] : null;

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 xl:px-8 flex items-center justify-between sticky top-0 z-20 shrink-0 w-full">
      {/* Left Section */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu toggle button (< 768px) */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg text-[#627D98] hover:text-[#102A43] hover:bg-[#F7F9FC] transition-colors shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand / Breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile title (< 768px) */}
          <span className="font-bold text-[17px] text-[#102A43] md:hidden tracking-tight font-display">
            ISutra
          </span>

          {/* Desktop & Tablet Title & Dynamic Breadcrumb (>= 768px) */}
          <div className="hidden md:flex items-center gap-2 text-[13px] xl:text-[14px] truncate">
            <span className="font-bold text-[#102A43] tracking-tight font-display">
              ISutra Procurement Intelligence
            </span>
            {currentAnalysisId && (
              <>
                <span className="text-[#9FB3C8]">/</span>
                <span className="text-[#627D98]">
                  <Link to="/dashboard" className="hover:text-[#0F766E] transition-colors">
                    Dashboard
                  </Link>
                </span>
                <span className="text-[#9FB3C8]">/</span>
                <span className="text-[#0F766E] font-mono text-[12px] font-semibold bg-[#0F766E]/5 px-2.5 py-0.5 rounded border border-[#0F766E]/20 truncate">
                  Analysis ID: {currentAnalysisId}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* 1. Search Standards (hidden on mobile < 768px) */}
        <Link
          to="/standards"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-[#627D98] hover:text-[#102A43] bg-[#F7F9FC] hover:bg-[#E2E8F0]/50 rounded-lg border border-[#E2E8F0] transition-colors font-medium"
        >
          <Search className="w-4 h-4 text-[#627D98]" />
          <span>Search Standards</span>
        </Link>

        {/* 2. Help (hidden on mobile < 768px) */}
        <Link
          to="/about"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] text-[#627D98] hover:text-[#102A43] hover:bg-[#F7F9FC] rounded-lg transition-colors font-medium"
          title="Help & About"
        >
          <HelpCircle className="w-4 h-4 text-[#627D98]" />
          <span>Help</span>
        </Link>

        {/* 3. New Analysis (always visible) */}
        <Link
          to="/analyze"
          className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#0D655E] text-white text-[13px] sm:text-[14px] font-semibold shadow-2xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Analysis</span>
        </Link>
      </div>
    </header>
  );
}
