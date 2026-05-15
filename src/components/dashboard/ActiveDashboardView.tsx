'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { useDashboards } from '@/context/DashboardsContext';
import { useActiveDashboard } from '@/context/ActiveDashboardContext';
import { QuickAccessRow } from '@/components/dashboard/QuickAccessRow';
import { CategoryGrid } from '@/components/dashboard/CategoryGrid';
import { RecentAccessRow } from '@/components/dashboard/RecentAccessRow';
import { Hand } from 'lucide-react';
import { TopNavControls } from '@/components/layout/TopNav';
import { RecentAccess } from '@/lib/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
    </div>
  );
}

function GoogleSearchBar() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(trimmed)}`, '_blank');
    setQuery('');
  };

  return (
    <div className="flex items-center px-0 w-full">
      {/* Google logo — desktop only, outside the bar */}
      <span className="hidden md:flex mr-2 font-semibold text-xl leading-none select-none">
        <span style={{ color: '#4285F4' }}>G</span>
        <span style={{ color: '#EA4335' }}>o</span>
        <span style={{ color: '#FBBC05' }}>o</span>
        <span style={{ color: '#4285F4' }}>g</span>
        <span style={{ color: '#34A853' }}>l</span>
        <span style={{ color: '#EA4335' }}>e</span>
      </span>
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-xl md:w-[440px]"
      >
        {/* G letter — mobile only, inside the bar */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none md:hidden">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar no Google..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="
            w-full h-9 md:h-[35px]
            pl-9 md:pl-4 pr-4
            bg-slate-50 border border-slate-200
            rounded-xl
            text-sm text-slate-700 placeholder-slate-400
            shadow-sm
            outline-none
            transition-all duration-150 ease-out
            hover:border-slate-300
            focus:border-slate-300 focus:ring-1 focus:ring-primary-500/20
          "
        />
      </form>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function ActiveDashboardView() {
  const { profile } = useProfile();
  const { dashboards } = useDashboards();
  const {
    activeDashboardId,
    data,
    isLoading,
    addCategory,
    removeCategory,
    renameCategory,
    updateCategoryIcon,
    moveCategoryToPanel,
    reorderCategories,
    addLinkToCategory,
    removeLink,
    updateLink,
    moveLink,
    reorderLinks,
    addQuickAccess,
    removeQuickAccess,
  } = useActiveDashboard();

  // recentAccess is not yet persisted — kept as empty local state
  const [recentAccess] = useState<RecentAccess[]>([]);

  const dashboardTitle = dashboards.find((d) => d.id === activeDashboardId)?.title ?? '';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const orderedCategories = useMemo(
    () => [...(data?.categories ?? [])].sort((a, b) => a.order - b.order),
    [data?.categories]
  );

  if (isLoading || !data) return <Spinner />;

  return (
    <div className="max-w-full space-y-6 pb-8">
      {/* ── MOBILE: greeting row ── */}
      <header className="flex items-center gap-2 pt-4 md:hidden">
        <Hand className="w-4 h-4 text-primary-500" />
        <span className="text-base font-bold text-slate-700 tracking-tight">
          {greeting}{profile.displayName ? `, ${profile.displayName}` : ''}!
        </span>
        {dashboardTitle && (
          <span className="ml-1 text-xs text-slate-400 bg-slate-100/80 px-2 py-0.5 rounded-full font-normal">
            {dashboardTitle}
          </span>
        )}
      </header>

      {/* ── MOBILE: search bar ── */}
      <div className="md:hidden">
        <GoogleSearchBar />
      </div>

      {/* ── DESKTOP: unified single row ── */}
      <header className="hidden md:flex items-center pt-1">
        {/* Left: greeting — flex-1 to balance with right side */}
        <div className="flex-1 flex items-center gap-1.5">
          <Hand className="w-4 h-4 text-primary-500 shrink-0" />
          <span className="text-sm font-semibold text-slate-600 whitespace-nowrap tracking-tight">
            {greeting}{profile.displayName ? `, ${profile.displayName.split(' ')[0]}` : ''}!
          </span>
          {dashboardTitle && (
            <span className="ml-1 text-xs text-slate-400/80 bg-slate-100/70 px-2 py-0.5 rounded-full truncate max-w-[120px] font-normal">
              {dashboardTitle}
            </span>
          )}
        </div>

        {/* Centre: search bar — fixed in the middle */}
        <div className="flex items-center justify-center shrink-0">
          <GoogleSearchBar />
        </div>

        {/* Right: controls — flex-1 to balance with left side */}
        <div className="flex-1 flex justify-end">
          <TopNavControls />
        </div>
      </header>

      <QuickAccessRow
        links={data.quickAccess}
        onAdd={addQuickAccess}
        onRemove={removeQuickAccess}
      />

      <CategoryGrid
        categories={orderedCategories}
        links={data.links}
        onRenameCategory={renameCategory}
        onAddLink={addLinkToCategory}
        onDeleteLink={removeLink}
        onUpdateLink={updateLink}
        onAddCategory={addCategory}
        onDeleteCategory={removeCategory}
        onReorderCategories={reorderCategories}
        onReorderLinks={reorderLinks}
        onMoveLink={moveLink}
        dashboards={dashboards}
        currentDashboardId={activeDashboardId ?? ''}
        onMoveCategoryToPanel={moveCategoryToPanel}
        onUpdateCategoryIcon={updateCategoryIcon}
      />

      <RecentAccessRow items={recentAccess} />
    </div>
  );
}
