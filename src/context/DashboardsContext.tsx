'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { Dashboard } from '@/lib/types';

// ── Default seed data for new users ────────────────────────────────────────
function faviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

const DEFAULT_QUICK_ACCESS: Array<{ title: string; url: string; domain: string }> = [
  { title: 'Google', url: 'https://google.com', domain: 'google.com' },
  { title: 'ChatGPT', url: 'https://chat.openai.com', domain: 'chat.openai.com' },
  { title: 'Gmail', url: 'https://gmail.com', domain: 'gmail.com' },
  { title: 'Tradutor', url: 'https://translate.google.com', domain: 'translate.google.com' },
];

const DEFAULT_CATEGORIES: Array<{
  title: string;
  iconName: string;
  links: Array<{ title: string; url: string; domain: string }>;
}> = [
  {
    title: 'Meus Favoritos',
    iconName: 'star',
    links: [],
  },
  {
    title: 'Redes Sociais',
    iconName: 'users',
    links: [
      { title: 'Facebook', url: 'https://facebook.com', domain: 'facebook.com' },
      { title: 'WhatsApp', url: 'https://web.whatsapp.com', domain: 'web.whatsapp.com' },
      { title: 'Instagram', url: 'https://instagram.com', domain: 'instagram.com' },
      { title: 'TikTok', url: 'https://tiktok.com', domain: 'tiktok.com' },
      { title: 'X.com', url: 'https://x.com', domain: 'x.com' },
    ],
  },
  {
    title: 'Noticias',
    iconName: 'newspaper',
    links: [
      { title: 'Globo.com', url: 'https://globo.com', domain: 'globo.com' },
      { title: 'UOL', url: 'https://uol.com.br', domain: 'uol.com.br' },
      { title: 'CNN', url: 'https://cnnbrasil.com.br', domain: 'cnnbrasil.com.br' },
      { title: 'msn', url: 'https://msn.com', domain: 'msn.com' },
      { title: 'Yahoo', url: 'https://yahoo.com.br', domain: 'yahoo.com.br' },
    ],
  },
  {
    title: 'Compras',
    iconName: 'shopping-cart',
    links: [
      { title: 'Buscape', url: 'https://buscape.com.br', domain: 'buscape.com.br' },
      { title: 'Mercado Livre', url: 'https://mercadolivre.com.br', domain: 'mercadolivre.com.br' },
      { title: 'Amazon', url: 'https://amazon.com.br', domain: 'amazon.com.br' },
      { title: 'Shopee', url: 'https://shopee.com.br', domain: 'shopee.com.br' },
      { title: 'Tudo Celular', url: 'https://tudocelular.com', domain: 'tudocelular.com' },
    ],
  },
  {
    title: 'Financas',
    iconName: 'banknote',
    links: [
      { title: 'Banco do Brasil', url: 'https://bb.com.br', domain: 'bb.com.br' },
      { title: 'Itau', url: 'https://itau.com.br', domain: 'itau.com.br' },
      { title: 'Infomoney', url: 'https://infomoney.com.br', domain: 'infomoney.com.br' },
      { title: 'Yahoo Finance', url: 'https://finance.yahoo.com', domain: 'finance.yahoo.com' },
      { title: 'Calculadora do Cidadao', url: 'https://www3.bcb.gov.br/CALCIDADAO/publico/corrigirPorIndice.do?method=corrigirPorIndice', domain: 'www3.bcb.gov.br' },
    ],
  },
  {
    title: 'Entretenimento',
    iconName: 'tv',
    links: [
      { title: 'Youtube', url: 'https://youtube.com', domain: 'youtube.com' },
      { title: 'Netflix', url: 'https://netflix.com', domain: 'netflix.com' },
      { title: 'Spotify', url: 'https://spotify.com', domain: 'spotify.com' },
      { title: 'Globo Esporte', url: 'https://ge.globo.com', domain: 'ge.globo.com' },
      { title: 'Series', url: 'https://justwatch.com', domain: 'justwatch.com' },
    ],
  },
  {
    title: 'Uteis',
    iconName: 'wrench',
    links: [
      { title: 'Gov.br', url: 'https://gov.br', domain: 'gov.br' },
      { title: 'Wikipedia', url: 'https://pt.wikipedia.org', domain: 'pt.wikipedia.org' },
      { title: 'ClimaTempo', url: 'https://climatempo.com.br', domain: 'climatempo.com.br' },
      { title: 'Calculadora', url: 'https://google.com/search?q=calculadora', domain: 'google.com' },
      { title: 'Google Maps', url: 'https://maps.google.com', domain: 'maps.google.com' },
    ],
  },
];

type DashboardsContextType = {
  dashboards: Dashboard[];
  isLoading: boolean;
  createDashboard: (title: string) => Promise<Dashboard | null>;
  renameDashboard: (id: string, title: string) => Promise<void>;
  deleteDashboard: (id: string) => Promise<void>;
};

const DashboardsContext = createContext<DashboardsContextType>({
  dashboards: [],
  isLoading: true,
  createDashboard: async () => null,
  renameDashboard: async () => {},
  deleteDashboard: async () => {},
});

export function DashboardsProvider({ children }: { children: ReactNode }) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userId === undefined) return;
    if (!userId) {
      setDashboards([]);
      setIsLoading(false);
      return;
    }
    fetchDashboards(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchDashboards = async (uid: string) => {
    setIsLoading(true);
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('dashboards')
      .select('*')
      .eq('user_id', uid)
      .order('sort_order');

    let list: Dashboard[] = (data ?? []).map((d) => ({
      id: d.id as string,
      title: d.title as string,
      isDefault: d.is_default as boolean,
      sortOrder: d.sort_order as number,
    }));

    // If no dashboards, create the default one
    if (list.length === 0) {
      const created = await insertDefaultDashboard(uid);
      if (created) list = [created];
    } else {
      // Migrate orphan categories (no dashboard_id) to the default dashboard
      const defaultDash = list.find((d) => d.isDefault) ?? list[0];
      if (defaultDash) {
        await supabase
          .from('categories')
          .update({ dashboard_id: defaultDash.id })
          .eq('user_id', uid)
          .is('dashboard_id', null);
      }
    }

    // Seed if user has zero categories (safe for new users; no-op for existing users)
    const defaultDash = list.find((d) => d.isDefault) ?? list[0];
    if (defaultDash) {
      const { count: totalCount } = await supabase
        .from('categories')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', uid);
      if ((totalCount ?? 0) === 0) {
        await seedDefaultDashboard(uid, defaultDash.id);
      }
    }

    setDashboards(list);
    setIsLoading(false);
  };

  const insertDefaultDashboard = async (uid: string): Promise<Dashboard | null> => {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('dashboards')
      .insert({ user_id: uid, title: 'Principal', is_default: true, sort_order: 0 })
      .select()
      .single();
    if (!data) return null;

    // Migrate orphan categories to the new default dashboard
    await supabase
      .from('categories')
      .update({ dashboard_id: data.id })
      .eq('user_id', uid)
      .is('dashboard_id', null);

    return {
      id: data.id as string,
      title: data.title as string,
      isDefault: data.is_default as boolean,
      sortOrder: data.sort_order as number,
    };
  };

  const seedDefaultDashboard = async (uid: string, dashboardId: string): Promise<void> => {
    const supabase = getSupabaseClient();

    // Seed quick access links (only if none exist yet)
    const { count: qaCount } = await supabase
      .from('quick_access')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', uid);
    if ((qaCount ?? 0) === 0) {
      const qaRows = DEFAULT_QUICK_ACCESS.map((q, qi) => ({
        user_id: uid,
        title: q.title,
        url: q.url,
        icon_url: faviconUrl(q.domain),
        sort_order: qi + 1,
      }));
      await supabase.from('quick_access').insert(qaRows);
    }

    // Seed categories and their links
    for (let ci = 0; ci < DEFAULT_CATEGORIES.length; ci++) {
      const cat = DEFAULT_CATEGORIES[ci];
      const { data: catData } = await supabase
        .from('categories')
        .insert({
          user_id: uid,
          dashboard_id: dashboardId,
          title: cat.title,
          icon_name: cat.iconName,
          sort_order: ci + 1,
        })
        .select()
        .single();
      if (!catData) continue;
      if (cat.links.length === 0) continue;
      const linkRows = cat.links.map((l, li) => ({
        user_id: uid,
        category_id: catData.id as string,
        title: l.title,
        url: l.url,
        icon_url: faviconUrl(l.domain),
        sort_order: li + 1,
      }));
      await supabase.from('links').insert(linkRows);
    }
  };

  const createDashboard = async (title: string): Promise<Dashboard | null> => {
    if (!userId) return null;
    const supabase = getSupabaseClient();
    const order = dashboards.length;
    const { data } = await supabase
      .from('dashboards')
      .insert({ user_id: userId, title: title.trim(), is_default: false, sort_order: order })
      .select()
      .single();
    if (!data) return null;
    const newDash: Dashboard = {
      id: data.id as string,
      title: data.title as string,
      isDefault: data.is_default as boolean,
      sortOrder: data.sort_order as number,
    };
    setDashboards((prev) => [...prev, newDash]);
    return newDash;
  };

  const renameDashboard = async (id: string, title: string): Promise<void> => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    await supabase.from('dashboards').update({ title: title.trim() }).eq('id', id);
    setDashboards((prev) =>
      prev.map((d) => (d.id === id ? { ...d, title: title.trim() } : d))
    );
  };

  const deleteDashboard = async (id: string): Promise<void> => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    await supabase.from('dashboards').delete().eq('id', id);
    setDashboards((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <DashboardsContext.Provider
      value={{ dashboards, isLoading, createDashboard, renameDashboard, deleteDashboard }}
    >
      {children}
    </DashboardsContext.Provider>
  );
}

export function useDashboards() {
  return useContext(DashboardsContext);
}
