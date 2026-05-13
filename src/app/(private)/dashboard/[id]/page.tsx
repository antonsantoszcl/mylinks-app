'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { useDashboards } from '@/context/DashboardsContext';
import { QuickAccessRow } from '@/components/dashboard/QuickAccessRow';
import { CategoryGrid } from '@/components/dashboard/CategoryGrid';
import { RecentAccessRow } from '@/components/dashboard/RecentAccessRow';
import { Hand } from 'lucide-react';
import { TopNavControls } from '@/components/layout/TopNav';
import { Category, Link, QuickAccessLink, RecentAccess } from '@/lib/types';
import { arrayMove } from '@dnd-kit/sortable';
import { getSupabaseClient } from '@/lib/supabase';

function safeHostname(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0] || '';
  }
}

function faviconFor(url: string, size = 32) {
  const domain = safeHostname(url);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

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
      <span className="hidden md:flex mr-2 font-semibold text-lg leading-none select-none">
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

export default function DashboardPage({ params }: { params: { id: string } }) {
  const dashboardId = params.id;
  const { profile } = useProfile();
  const { dashboards } = useDashboards();
  const [categories, setCategories] = useState<Category[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [quickAccess, setQuickAccess] = useState<QuickAccessLink[]>([]);
  const [recentAccess] = useState<RecentAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const dashboardTitle = dashboards.find((d) => d.id === dashboardId)?.title ?? '';

  // Resolve userId from session
  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch data when userId and dashboardId are known
  useEffect(() => {
    if (!userId || !dashboardId) return;
    const supabase = getSupabaseClient();

    const fetchAll = async () => {
      setIsLoading(true);
      const catRes = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .eq('dashboard_id', dashboardId)
        .order('sort_order');
      const linkRes = await supabase
        .from('links')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order');
      const qaRes = await supabase
        .from('quick_access')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order');

      setCategories(
        (catRes.data ?? []).map((c) => ({
          id: c.id,
          title: c.title,
          iconName: c.icon_name,
          order: c.sort_order,
          dashboardId: c.dashboard_id,
        }))
      );
      setLinks(
        (linkRes.data ?? []).map((l) => ({
          id: l.id,
          categoryId: l.category_id,
          title: l.title,
          url: l.url,
          iconUrl: l.icon_url,
          order: l.sort_order,
        }))
      );
      setQuickAccess(
        (qaRes.data ?? []).map((q) => ({
          id: q.id,
          title: q.title,
          url: q.url,
          iconUrl: q.icon_url,
        }))
      );
      setIsLoading(false);
    };

    fetchAll().catch(console.error);
  }, [userId, dashboardId]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const orderedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    [categories]
  );

  // ── CRUD helpers ────────────────────────────────────────────────────────────

  const addLinkToCategory = async (categoryId: string, title: string, url: string) => {
    if (!userId) return;
    const normalizedUrl = normalizeUrl(url);
    const supabase = getSupabaseClient();
    const order = links.filter((l) => l.categoryId === categoryId).length + 1;
    const { data } = await supabase
      .from('links')
      .insert({
        category_id: categoryId,
        user_id: userId,
        title: title.trim(),
        url: normalizedUrl,
        icon_url: faviconFor(normalizedUrl, 32),
        sort_order: order,
      })
      .select()
      .single();
    if (data) {
      setLinks((prev) => [
        ...prev,
        {
          id: data.id as string,
          categoryId: data.category_id as string,
          title: data.title as string,
          url: data.url as string,
          iconUrl: data.icon_url as string,
          order: data.sort_order as number,
        },
      ]);
    }
  };

  const removeLink = async (linkId: string) => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    await supabase.from('links').delete().eq('id', linkId);
    setLinks((prev) => prev.filter((l) => l.id !== linkId));
  };

  const renameCategory = async (categoryId: string, title: string) => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    await supabase.from('categories').update({ title: title.trim() }).eq('id', categoryId);
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, title: title.trim() || c.title } : c))
    );
  };

  const addCategory = async (title: string, iconName: string) => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    const order = categories.length + 1;
    const { data } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        title: title.trim(),
        icon_name: iconName,
        sort_order: order,
        dashboard_id: dashboardId,
      })
      .select()
      .single();
    if (data) {
      setCategories((prev) => [
        ...prev,
        {
          id: data.id as string,
          title: data.title as string,
          iconName: data.icon_name as string,
          order: data.sort_order as number,
          dashboardId: data.dashboard_id as string,
        },
      ]);
    }
  };

  const removeCategory = async (categoryId: string) => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    await supabase.from('categories').delete().eq('id', categoryId);
    setCategories((prev) =>
      prev.filter((c) => c.id !== categoryId).map((c, i) => ({ ...c, order: i + 1 }))
    );
    setLinks((prev) => prev.filter((l) => l.categoryId !== categoryId));
  };

  const addQuickAccess = async (title: string, url: string) => {
    if (!userId) return;
    const cleanUrl = normalizeUrl(url);
    const supabase = getSupabaseClient();
    const order = quickAccess.length;
    const { data } = await supabase
      .from('quick_access')
      .insert({
        user_id: userId,
        title: title.trim(),
        url: cleanUrl,
        icon_url: faviconFor(cleanUrl, 64),
        sort_order: order,
      })
      .select()
      .single();
    if (data) {
      setQuickAccess((prev) => [
        ...prev,
        {
          id: data.id as string,
          title: data.title as string,
          url: data.url as string,
          iconUrl: data.icon_url as string,
        },
      ]);
    }
  };

  const removeQuickAccess = async (id: string) => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    await supabase.from('quick_access').delete().eq('id', id);
    setQuickAccess((prev) => prev.filter((q) => q.id !== id));
  };

  const reorderCategories = async (oldIndex: number, newIndex: number) => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    const sorted = [...categories].sort((a, b) => a.order - b.order);
    const reordered = arrayMove(sorted, oldIndex, newIndex).map((c, i) => ({
      ...c,
      order: i + 1,
    }));
    setCategories(reordered);
    await Promise.all(
      reordered.map((c) =>
        supabase.from('categories').update({ sort_order: c.order }).eq('id', c.id)
      )
    );
  };

  const reorderLinks = async (categoryId: string, oldIndex: number, newIndex: number) => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    const categoryLinks = links
      .filter((l) => l.categoryId === categoryId)
      .sort((a, b) => a.order - b.order);
    const otherLinks = links.filter((l) => l.categoryId !== categoryId);
    const reordered = arrayMove(categoryLinks, oldIndex, newIndex).map((l, i) => ({
      ...l,
      order: i + 1,
    }));
    setLinks([...otherLinks, ...reordered]);
    await Promise.all(
      reordered.map((l) =>
        supabase.from('links').update({ sort_order: l.order }).eq('id', l.id)
      )
    );
  };

  const updateCategoryIcon = async (categoryId: string, iconName: string) => {
    if (!userId) return;
    // Optimistic update
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, iconName } : c))
    );
    const supabase = getSupabaseClient();
    await supabase.from('categories').update({ icon_name: iconName }).eq('id', categoryId);
  };

  const moveCategoryToPanel = async (categoryId: string, targetDashboardId: string) => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    await supabase
      .from('categories')
      .update({ dashboard_id: targetDashboardId })
      .eq('id', categoryId);
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  const moveLink = async (linkId: string, targetCategoryId: string) => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    const targetLinks = links.filter((l) => l.categoryId === targetCategoryId);
    const newOrder = targetLinks.length + 1;
    await supabase
      .from('links')
      .update({ category_id: targetCategoryId, sort_order: newOrder })
      .eq('id', linkId);
    setLinks((prev) =>
      prev.map((l) =>
        l.id === linkId ? { ...l, categoryId: targetCategoryId, order: newOrder } : l
      )
    );
  };

  const updateLink = async (linkId: string, title: string, url: string) => {
    if (!userId) return;
    const normalizedUrl = normalizeUrl(url);
    const supabase = getSupabaseClient();
    await supabase
      .from('links')
      .update({ title: title.trim(), url: normalizedUrl, icon_url: faviconFor(normalizedUrl, 32) })
      .eq('id', linkId);
    setLinks((prev) =>
      prev.map((l) =>
        l.id === linkId
          ? { ...l, title: title.trim(), url: normalizedUrl, iconUrl: faviconFor(normalizedUrl, 32) }
          : l
      )
    );
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-full space-y-7 pb-6">
      {/* ── MOBILE: greeting row ── */}
      <header className="flex items-center gap-2 pt-4 md:hidden">
        <Hand className="w-4 h-4 text-primary-500" />
        <span className="text-base font-bold text-slate-700">
          {greeting}{profile.displayName ? `, ${profile.displayName}` : ''}!
        </span>
        {dashboardTitle && (
          <span className="ml-1 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {dashboardTitle}
          </span>
        )}
      </header>

      {/* ── MOBILE: search bar ── */}
      <div className="md:hidden">
        <GoogleSearchBar />
      </div>

      {/* ── DESKTOP: unified single row ── */}
      <header className="hidden md:flex items-center pt-0">
        {/* Left: greeting — flex-1 to balance with right side */}
        <div className="flex-1 flex items-center gap-1.5">
          <Hand className="w-4 h-4 text-primary-500 shrink-0" />
          <span className="text-sm font-bold text-slate-700 whitespace-nowrap">
            {greeting}{profile.displayName ? `, ${profile.displayName.split(' ')[0]}` : ''}!
          </span>
          {dashboardTitle && (
            <span className="ml-1 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full truncate max-w-[120px]">
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

      <QuickAccessRow links={quickAccess} onAdd={addQuickAccess} onRemove={removeQuickAccess} />

      <CategoryGrid
        categories={orderedCategories}
        links={links}
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
        currentDashboardId={dashboardId}
        onMoveCategoryToPanel={moveCategoryToPanel}
        onUpdateCategoryIcon={updateCategoryIcon}
      />

      <RecentAccessRow items={recentAccess} />
    </div>
  );
}
