// ============================================================
// ISutra — Clean Enterprise Footer
// Desktop: 12-13px | Mobile: 11-12px | Subtle & readable
// ============================================================

import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E2E8F0] mt-auto py-3.5 px-4 sm:px-6 xl:px-8 shrink-0 w-full">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] sm:text-[12px] xl:text-[13px] text-[#627D98]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#102A43]">ISutra</span>
          <span>—</span>
          <span>AI-Powered Indian Standards Intelligence</span>
        </div>

        <div className="flex items-center gap-4 font-medium">
          <Link to="/dashboard" className="hover:text-[#0F766E] transition-colors">
            Dashboard
          </Link>
          <Link to="/standards" className="hover:text-[#0F766E] transition-colors">
            Standards
          </Link>
          <Link to="/history" className="hover:text-[#0F766E] transition-colors">
            History
          </Link>
          <Link to="/about" className="hover:text-[#0F766E] transition-colors">
            Help
          </Link>
        </div>

        <div>
          <span className="text-[#9FB3C8]">
            SIH Prototype • Not an official BIS service
          </span>
        </div>
      </div>
    </footer>
  );
}
