'use client';

import { useEffect, useMemo, useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { useDashboards } from '@/context/DashboardsContext';
import { QuickAccessRow } from '@/components/dashboard/QuickAccessRow';
import { CategoryGrid } from '@/components/dashboard/CategoryGrid';
import { RecentAccessRow } from '@/components/dashboard/RecentAccessRow';
import { Hand } from 'lucide-react';
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

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-full space-y-7 pb-6">
      <header className="flex items-center gap-2 pt-4">
        <Hand className="w-4 h-4 text-primary-500" />
        <span className="text-sm font-bold text-slate-700">
          {greeting}, {profile.displayName || 'bem-vindo'}!
        </span>
        {dashboardTitle && (
          <span className="ml-1 text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {dashboardTitle}
          </span>
        )}
      </header>

      <QuickAccessRow links={quickAccess} onAdd={addQuickAccess} onRemove={removeQuickAccess} />

      <CategoryGrid
        categories={orderedCategories}
        links={links}
        onRenameCategory={renameCategory}
        onAddLink={addLinkToCategory}
        onDeleteLink={removeLink}
        onAddCategory={addCategory}
        onDeleteCategory={removeCategory}
        onReorderCategories={reorderCategories}
        onReorderLinks={reorderLinks}
      />

      <RecentAccessRow items={recentAccess} />
    </div>
  );
}
