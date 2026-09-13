// ============================================================
// ISutra — Main App Layout Shell
// Full Viewport Architecture:
// Desktop (>= 1200px): Fixed 250px Sidebar + Flexible Width Main (100% remaining space)
// Tablet (768–1199px): 72px Compact Sidebar + Flexible Width Main
// Mobile (< 768px): 100% Width Main + Off-Canvas Drawer (No fixed desktop sidebar)
// ============================================================

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex w-full min-h-screen bg-[#F7F9FC] text-[#243B53] antialiased overflow-x-hidden">
      {/* 1. Desktop & Tablet Sidebar Column (occupies physical space in document flow) */}
      <div className="isutra-sidebar-col">
        <div className="isutra-sidebar-fixed">
          <Sidebar />
        </div>
      </div>

      {/* 2. Mobile Drawer (< 768px off-canvas overlay) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-fade-in isutra-drawer">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer container (250px) */}
          <div className="fixed top-0 bottom-0 left-0 w-[250px] z-50 shadow-2xl">
            <Sidebar isDrawer onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Main Content Area (Uses ALL remaining horizontal space) */}
      <div className="flex-1 flex flex-col min-w-0 w-full min-h-screen">
        <Header onToggleSidebar={() => setMobileSidebarOpen(true)} />

        {/* Content Container: Mobile 16px, Tablet 24px, Desktop 32px/40px, Large Desktop 40px/48px */}
        <main className="flex-1 w-full p-4 md:p-6 xl:py-8 xl:px-10 2xl:py-10 2xl:px-12">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
