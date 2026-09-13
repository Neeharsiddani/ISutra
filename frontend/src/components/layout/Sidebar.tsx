// ============================================================
// ISutra — Enterprise Sidebar Navigation
// Desktop (>= 1200px): 250px (#102A43) with 15-16px nav typography & 20px icons
// Tablet (768–1199px): 72px compact icon navigation with tooltips
// Mobile (< 768px): Rendered in 250px off-canvas drawer
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
  { to: '/about', label: 'About', icon: Info },
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
      className={`h-full bg-[#102A43] text-white flex flex-col border-r border-[#1e3e5c] select-none ${
        isDrawer ? 'w-[250px]' : 'w-full'
      }`}
    >
      {/* 1. Header / Brand */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 group min-w-0 isutra-brand-link"
          onClick={onClose}
          title="ISutra — Indian Standards Intelligence"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F766E] to-[#14B8A6] flex items-center justify-center shadow-xs font-bold text-white tracking-wide transition-transform group-hover:scale-105 shrink-0">
            <Layers className="w-5 h-5 text-white" />
          </div>

          <div className="min-w-0 isutra-sidebar-text">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white leading-none font-display">
                ISutra
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0" />
            </div>
            <p className="text-[14px] text-white/70 font-normal leading-tight truncate mt-1">
              Indian Standards Intelligence
            </p>
          </div>
        </Link>

        {/* Close button for mobile drawer */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors ml-auto"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Navigation Links */}
      <div className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] xl:text-[12px] font-bold text-white/40 uppercase tracking-wider isutra-sidebar-text">
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
              title={item.label}
              className={`flex items-center gap-3 py-2.5 min-h-[42px] rounded-xl text-[15px] transition-all isutra-sidebar-nav-item ${
                active
                  ? 'bg-[#0F766E] text-white shadow-xs font-semibold'
                  : 'text-white/80 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  active ? 'text-white' : 'text-white/70'
                }`}
              />
              <span className="truncate isutra-sidebar-text-inline">
                {item.label}
              </span>
              {item.to === '/analyze' && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white font-semibold isutra-sidebar-text-inline">
                  AI
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* 3. Tagline Banner (Desktop & Drawer only) */}
      <div className="p-3.5 m-3 rounded-xl bg-[#0b1e30] border border-white/10 shrink-0 isutra-sidebar-text">
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
      <div className="px-4 py-3.5 border-t border-white/10 text-[11px] text-white/40 flex items-center justify-between shrink-0">
        <span className="isutra-sidebar-text-inline">
          ISutra v2.0
        </span>
        <span
          className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"
          title="System Online"
        />
      </div>
    </aside>
  );
}
