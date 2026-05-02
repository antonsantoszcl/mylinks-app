'use client';

import { useState } from 'react';
import { Globe, ChevronRight } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen md:flex-row md:h-screen bg-white md:overflow-hidden">
      {/* Mobile top bar — scrolls with content (NOT fixed) */}
      <div className="flex items-center border-b border-slate-100 md:hidden">
        {/* Menu button: same size/alignment as sidebar open-state header */}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-1.5 px-3 py-3 hover:bg-slate-50 transition-colors"
          aria-label="Abrir menu"
        >
          <div className="w-6 h-6 rounded-md bg-primary-800 flex items-center justify-center flex-shrink-0">
            <Globe className="text-white w-3.5 h-3.5" />
          </div>
          <span className="text-base font-bold text-slate-800">MyLinks</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
        {/* Nav controls pushed to the right */}
        <div className="ml-auto">
          <TopNav />
        </div>
      </div>

      {/* Sidebar: mobile renders overlay + drawer; desktop renders full sidebar panel */}
      <Sidebar mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} />

      {/* Main content column (desktop: fixed-height scrollable; mobile: natural flow) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopNav on desktop: fixed top-right */}
        <div className="hidden md:block">
          <TopNav />
        </div>
        <main className="flex-1 md:overflow-y-auto p-3 md:pt-2">{children}</main>
      </div>
    </div>
  );
}
