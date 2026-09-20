// ============================================================
// ISutra — Minimal Application Footer
// Low vertical profile (py-2.5) with required SIH prototype notice
// ============================================================

import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white/80 border-t border-slate-200/80 mt-auto py-2.5 px-4 sm:px-6 shrink-0 w-full">
      <div className="flex flex-col xs:flex-row items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">ISutra</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400">SIH Prototype • 40 Verified BIS Reference Records • Not an official BIS service</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 font-medium">
          <Link to="/standards" className="hover:text-[#0F766E] transition-colors">
            Standards
          </Link>
          <Link to="/history" className="hover:text-[#0F766E] transition-colors">
            History
          </Link>
          <Link to="/about" className="hover:text-[#0F766E] transition-colors">
            Documentation
          </Link>
        </div>
      </div>
    </footer>
  );
}
