// ============================================================
// ISutra — Main Application Layout Shell
// CSS Grid Architecture:
// Desktop (>= 1024px): grid-cols-[250px_minmax(0,1fr)]
// Mobile (< 1024px): 100% Single Column + Off-Canvas Drawer
// Mathematical guarantee: Column 2 NEVER exceeds 100vw - 250px
// ============================================================

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="isutra-layout-root text-slate-800 antialiased">
      {/* 1. Desktop Sidebar Column: Sticky 250px on >= 1024px */}
      <aside className="hidden lg:block w-[250px] h-screen sticky top-0 bg-[#102A43] border-r border-[#1E3E5C] z-30 shrink-0">
        <Sidebar />
      </aside>

      {/* 2. Mobile & Tablet Drawer (< 1024px) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 w-[250px] z-50 drawer-enter">
            <Sidebar isDrawer onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Main Workspace Column: Exactly minmax(0, 1fr) */}
      <div className="isutra-content-column">
        <Header onToggleSidebar={() => setMobileSidebarOpen(true)} />

        {/* Content Area */}
        <main className="flex-1 w-full max-w-full p-4 sm:p-5 lg:p-6 xl:p-8 flex flex-col box-border">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
