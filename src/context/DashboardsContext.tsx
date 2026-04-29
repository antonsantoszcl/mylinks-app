'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { Dashboard } from '@/lib/types';

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

    // If no dashboards, create the default one (handles users created before the migration)
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
