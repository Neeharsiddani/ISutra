// ============================================================
// ISutra — Enterprise Sidebar Navigation
// Width: 250px (#102A43 dark navy)
// Supports desktop sticky/fixed display & mobile off-canvas drawer
// ============================================================

import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  History,
  Info,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
  isDrawer?: boolean;
}

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analyze', label: 'New Analysis', icon: PlusCircle },
  { to: '/standards', label: 'Standards Directory', icon: BookOpen },
  { to: '/history', label: 'Analysis History', icon: History },
  { to: '/about', label: 'About & Help', icon: Info },
];

export default function Sidebar({ onClose, isDrawer = false }: SidebarProps) {
  const location = useLocation();

  const isCurrentActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`h-full w-[250px] bg-[#102A43] text-white flex flex-col border-r border-[#1E3E5C] select-none ${
        isDrawer ? 'shadow-2xl' : ''
      }`}
    >
      {/* 1. Header / Brand */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5 group min-w-0"
          onClick={onClose}
          title="ISutra — Indian Standards Intelligence"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F766E] to-[#14B8A6] flex items-center justify-center shadow-xs text-white shrink-0 transition-transform group-hover:scale-105">
            <Layers className="w-4 h-4 text-white" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white leading-none font-display">
                ISutra
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0" />
            </div>
            <p className="text-[11px] text-white/65 font-normal leading-tight truncate mt-0.5">
              Standards Intelligence
            </p>
          </div>
        </Link>

        {/* Close button for drawer */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-2 pb-2 text-[11px] font-bold text-white/40 uppercase tracking-wider">
          Workspace
        </div>

        {NAV_ITEMS.map((item) => {
          const active = isCurrentActive(item.to);
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-all font-medium ${
                active
                  ? 'bg-[#0F766E] text-white shadow-xs font-semibold'
                  : 'text-white/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  active ? 'text-white' : 'text-white/70'
                }`}
              />
              <span className="truncate">{item.label}</span>
              {item.to === '/analyze' && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-[#F59E0B]/20 text-[#FBBF24] font-semibold">
                  AI
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 3. Tagline Banner */}
      <div className="p-3 m-3 rounded-xl bg-[#0B1E30] border border-white/10 shrink-0">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span className="text-[12px] font-semibold text-white">
            Smart Procurement
          </span>
        </div>
        <p className="text-[11px] text-white/70 leading-relaxed">
          "Know the Standard. Specify with Confidence."
        </p>
      </div>

      {/* 4. Footer Meta */}
      <div className="px-4 py-3 border-t border-white/10 text-[11px] text-white/40 flex items-center justify-between shrink-0">
        <span>ISutra</span>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-emerald-400 font-medium">Ready</span>
        </div>
      </div>
    </aside>
  );
}
