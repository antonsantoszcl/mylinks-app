'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { Category, Link, QuickAccessLink } from '@/lib/types';
import { arrayMove } from '@dnd-kit/sortable';
import { useDashboards } from '@/context/DashboardsContext';

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── Types ─────────────────────────────────────────────────────────────────────

export type DashboardData = {
  categories: Category[];
  links: Link[];
  quickAccess: QuickAccessLink[];
};

type ActiveDashboardContextType = {
  activeDashboardId: string | null;
  data: DashboardData | null;
  isLoading: boolean;
  setActiveDashboard: (id: string) => void;
  // Category CRUD
  addCategory: (title: string, iconName: string) => Promise<void>;
  removeCategory: (categoryId: string) => Promise<void>;
  renameCategory: (categoryId: string, title: string) => Promise<void>;
  updateCategoryIcon: (categoryId: string, iconName: string) => Promise<void>;
  moveCategoryToPanel: (categoryId: string, targetDashboardId: string) => Promise<void>;
  reorderCategories: (oldIndex: number, newIndex: number) => Promise<void>;
  // Link CRUD
  addLinkToCategory: (categoryId: string, title: string, url: string) => Promise<void>;
  removeLink: (linkId: string) => Promise<void>;
  updateLink: (linkId: string, title: string, url: string) => Promise<void>;
  moveLink: (linkId: string, targetCategoryId: string) => Promise<void>;
  reorderLinks: (categoryId: string, oldIndex: number, newIndex: number) => Promise<void>;
  // Quick access CRUD
  addQuickAccess: (title: string, url: string) => Promise<void>;
  removeQuickAccess: (id: string) => Promise<void>;
};

// ── Context ───────────────────────────────────────────────────────────────────

const ActiveDashboardContext = createContext<ActiveDashboardContextType>({
  activeDashboardId: null,
  data: null,
  isLoading: false,
  setActiveDashboard: () => {},
  addCategory: async () => {},
  removeCategory: async () => {},
  renameCategory: async () => {},
  updateCategoryIcon: async () => {},
  moveCategoryToPanel: async () => {},
  reorderCategories: async () => {},
  addLinkToCategory: async () => {},
  removeLink: async () => {},
  updateLink: async () => {},
  moveLink: async () => {},
  reorderLinks: async () => {},
  addQuickAccess: async () => {},
  removeQuickAccess: async () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function ActiveDashboardProvider({ children }: { children: ReactNode }) {
  const { dashboards } = useDashboards();
  const [activeDashboardId, setActiveDashboardId] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const cache = useRef<Map<string, DashboardData>>(new Map());
  // Track ongoing fetches to avoid duplicate concurrent requests
  const fetchingRef = useRef<Set<string>>(new Set());

  // ── Resolve userId ──────────────────────────────────────────────────────────
  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data: d }) => {
      setUserId(d.session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Fetch a single dashboard into cache ──────────────────────────────────────
  const fetchDashboard = async (id: string, uid: string): Promise<DashboardData> => {
    const supabase = getSupabaseClient();
    const [catRes, linkRes, qaRes] = await Promise.all([
      supabase.from('categories').select('*').eq('user_id', uid).eq('dashboard_id', id).order('sort_order'),
      supabase.from('links').select('*').eq('user_id', uid).order('sort_order'),
      supabase.from('quick_access').select('*').eq('user_id', uid).order('sort_order'),
    ]);

    const result: DashboardData = {
      categories: (catRes.data ?? []).map((c) => ({
        id: c.id,
        title: c.title,
        iconName: c.icon_name,
        order: c.sort_order,
        dashboardId: c.dashboard_id,
      })),
      links: (linkRes.data ?? []).map((l) => ({
        id: l.id,
        categoryId: l.category_id,
        title: l.title,
        url: l.url,
        iconUrl: l.icon_url,
        order: l.sort_order,
      })),
      quickAccess: (qaRes.data ?? []).map((q) => ({
        id: q.id,
        title: q.title,
        url: q.url,
        iconUrl: q.icon_url,
      })),
    };

    cache.current.set(id, result);
    return result;
  };

  // ── Set active dashboard (instant if cached, fetch otherwise) ───────────────
  const setActiveDashboard = (id: string) => {
    if (id === activeDashboardId) return;

    // Update URL without navigation
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/dashboard/${id}`);
    }

    if (cache.current.has(id)) {
      setActiveDashboardId(id);
      setData(cache.current.get(id)!);
      setIsLoading(false);
    } else {
      setActiveDashboardId(id);
      setIsLoading(true);
      if (userId) {
        fetchDashboard(id, userId).then((result) => {
          setData(result);
          setIsLoading(false);
        }).catch(console.error);
      }
    }
  };

  // ── Retry fetch when userId resolves after activeDashboardId was already set ──
  useEffect(() => {
    if (!userId || !activeDashboardId || data !== null) return;
    // userId just resolved but the fetch never happened (race condition on reload)
    setIsLoading(true);
    fetchDashboard(activeDashboardId, userId).then((result) => {
      setData(result);
      setIsLoading(false);
    }).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, activeDashboardId, data]);

  // ── Initialize active dashboard from URL or default ──────────────────────────
  useEffect(() => {
    if (!userId || dashboards.length === 0) return;

    // Already initialized with data
    if (activeDashboardId && data !== null) return;

    // Read from URL
    let idFromUrl: string | null = null;
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/dashboard\/([^/]+)/);
      if (match) idFromUrl = match[1];
    }

    const target = idFromUrl && dashboards.find((d) => d.id === idFromUrl)
      ? idFromUrl
      : (dashboards.find((d) => d.isDefault) ?? dashboards[0])?.id ?? null;

    if (!target) return;

    setActiveDashboardId(target);
    setIsLoading(true);
    fetchDashboard(target, userId).then((result) => {
      setData(result);
      setIsLoading(false);
    }).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, dashboards]);

  // ── Prefetch other dashboards in background ──────────────────────────────────
  useEffect(() => {
    if (!userId || !activeDashboardId || dashboards.length <= 1) return;

    const idle: (cb: () => void) => void =
      (typeof window !== 'undefined' && (window as any).requestIdleCallback)
        ? (cb) => (window as any).requestIdleCallback(cb, { timeout: 2000 })
        : (cb) => setTimeout(cb, 500);

    idle(async () => {
      for (const d of dashboards) {
        if (d.id === activeDashboardId) continue;
        if (cache.current.has(d.id)) continue;
        if (fetchingRef.current.has(d.id)) continue;
        fetchingRef.current.add(d.id);
        try {
          await fetchDashboard(d.id, userId);
        } catch {
          // silent prefetch failure
        } finally {
          fetchingRef.current.delete(d.id);
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDashboardId, userId]);

  // ── Helpers to mutate state + cache atomically ───────────────────────────────
  const updateData = (fn: (prev: DashboardData) => DashboardData) => {
    setData((prev) => {
      if (!prev || !activeDashboardId) return prev;
      const next = fn(prev);
      cache.current.set(activeDashboardId, next);
      return next;
    });
  };

  // ── Category CRUD ─────────────────────────────────────────────────────────────

  const addCategory = async (title: string, iconName: string) => {
    if (!userId || !activeDashboardId) return;
    const supabase = getSupabaseClient();
    const order = (data?.categories.length ?? 0) + 1;
    const { data: d } = await supabase
      .from('categories')
      .insert({ user_id: userId, title: title.trim(), icon_name: iconName, sort_order: order, dashboard_id: activeDashboardId })
      .select().single();
    if (d) {
      updateData((prev) => ({
        ...prev,
        categories: [...prev.categories, { id: d.id, title: d.title, iconName: d.icon_name, order: d.sort_order, dashboardId: d.dashboard_id }],
      }));
    }
  };

  const removeCategory = async (categoryId: string) => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    await supabase.from('categories').delete().eq('id', categoryId);
    updateData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== categoryId).map((c, i) => ({ ...c, order: i + 1 })),
      links: prev.links.filter((l) => l.categoryId !== categoryId),
    }));
  };

  const renameCategory = async (categoryId: string, title: string) => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    await supabase.from('categories').update({ title: title.trim() }).eq('id', categoryId);
    updateData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === categoryId ? { ...c, title: title.trim() || c.title } : c)),
    }));
  };

  const updateCategoryIcon = async (categoryId: string, iconName: string) => {
    if (!userId) return;
    updateData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === categoryId ? { ...c, iconName } : c)),
    }));
    const supabase = getSupabaseClient();
    await supabase.from('categories').update({ icon_name: iconName }).eq('id', categoryId);
  };

  const moveCategoryToPanel = async (categoryId: string, targetDashboardId: string) => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    await supabase.from('categories').update({ dashboard_id: targetDashboardId }).eq('id', categoryId);
    updateData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== categoryId),
    }));
    // Invalidate target panel cache so it re-fetches
    cache.current.delete(targetDashboardId);
  };

  const reorderCategories = async (oldIndex: number, newIndex: number) => {
    if (!userId || !data) return;
    const supabase = getSupabaseClient();
    const sorted = [...data.categories].sort((a, b) => a.order - b.order);
    const reordered = arrayMove(sorted, oldIndex, newIndex).map((c, i) => ({ ...c, order: i + 1 }));
    updateData((prev) => ({ ...prev, categories: reordered }));
    await Promise.all(
      reordered.map((c) => supabase.from('categories').update({ sort_order: c.order }).eq('id', c.id))
    );
  };

  // ── Link CRUD ─────────────────────────────────────────────────────────────────

  const addLinkToCategory = async (categoryId: string, title: string, url: string) => {
    if (!userId) return;
    const normalizedUrl = normalizeUrl(url);
    const supabase = getSupabaseClient();
    const order = (data?.links.filter((l) => l.categoryId === categoryId).length ?? 0) + 1;
    const { data: d } = await supabase
      .from('links')
      .insert({ category_id: categoryId, user_id: userId, title: title.trim(), url: normalizedUrl, icon_url: faviconFor(normalizedUrl, 32), sort_order: order })
      .select().single();
    if (d) {
      updateData((prev) => ({
        ...prev,
        links: [...prev.links, { id: d.id, categoryId: d.category_id, title: d.title, url: d.url, iconUrl: d.icon_url, order: d.sort_order }],
      }));
    }
  };

  const removeLink = async (linkId: string) => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    await supabase.from('links').delete().eq('id', linkId);
    updateData((prev) => ({ ...prev, links: prev.links.filter((l) => l.id !== linkId) }));
  };

  const updateLink = async (linkId: string, title: string, url: string) => {
    if (!userId) return;
    const normalizedUrl = normalizeUrl(url);
    const supabase = getSupabaseClient();
    await supabase.from('links').update({ title: title.trim(), url: normalizedUrl, icon_url: faviconFor(normalizedUrl, 32) }).eq('id', linkId);
    updateData((prev) => ({
      ...prev,
      links: prev.links.map((l) =>
        l.id === linkId ? { ...l, title: title.trim(), url: normalizedUrl, iconUrl: faviconFor(normalizedUrl, 32) } : l
      ),
    }));
  };

  const moveLink = async (linkId: string, targetCategoryId: string) => {
    if (!userId || !data) return;
    const supabase = getSupabaseClient();
    const targetLinks = data.links.filter((l) => l.categoryId === targetCategoryId);
    const newOrder = targetLinks.length + 1;
    await supabase.from('links').update({ category_id: targetCategoryId, sort_order: newOrder }).eq('id', linkId);
    updateData((prev) => ({
      ...prev,
      links: prev.links.map((l) => (l.id === linkId ? { ...l, categoryId: targetCategoryId, order: newOrder } : l)),
    }));
  };

  const reorderLinks = async (categoryId: string, oldIndex: number, newIndex: number) => {
    if (!userId || !data) return;
    const supabase = getSupabaseClient();
    const categoryLinks = data.links.filter((l) => l.categoryId === categoryId).sort((a, b) => a.order - b.order);
    const otherLinks = data.links.filter((l) => l.categoryId !== categoryId);
    const reordered = arrayMove(categoryLinks, oldIndex, newIndex).map((l, i) => ({ ...l, order: i + 1 }));
    updateData((prev) => ({ ...prev, links: [...otherLinks, ...reordered] }));
    await Promise.all(
      reordered.map((l) => supabase.from('links').update({ sort_order: l.order }).eq('id', l.id))
    );
  };

  // ── Quick Access CRUD ─────────────────────────────────────────────────────────

  const addQuickAccess = async (title: string, url: string) => {
    if (!userId) return;
    const cleanUrl = normalizeUrl(url);
    const supabase = getSupabaseClient();
    const order = data?.quickAccess.length ?? 0;
    const { data: d } = await supabase
      .from('quick_access')
      .insert({ user_id: userId, title: title.trim(), url: cleanUrl, icon_url: faviconFor(cleanUrl, 64), sort_order: order })
      .select().single();
    if (d) {
      updateData((prev) => ({
        ...prev,
        quickAccess: [...prev.quickAccess, { id: d.id, title: d.title, url: d.url, iconUrl: d.icon_url }],
      }));
    }
  };

  const removeQuickAccess = async (id: string) => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    await supabase.from('quick_access').delete().eq('id', id);
    updateData((prev) => ({ ...prev, quickAccess: prev.quickAccess.filter((q) => q.id !== id) }));
  };

  return (
    <ActiveDashboardContext.Provider
      value={{
        activeDashboardId,
        data,
        isLoading,
        setActiveDashboard,
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
      }}
    >
      {children}
    </ActiveDashboardContext.Provider>
  );
}

export function useActiveDashboard() {
  return useContext(ActiveDashboardContext);
}
