'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

export type PublicLink = {
  id: string;
  title: string;
  url: string;
  order: number;
};

export type PublicData = {
  links: PublicLink[];
};

const defaultData: PublicData = { links: [] };

type PublicDataContextType = {
  publicData: PublicData;
  addLink: (title: string, url: string) => Promise<void>;
  updateLink: (id: string, title: string, url: string) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  reorderLinks: (links: PublicLink[]) => Promise<void>;
};

const PublicDataContext = createContext<PublicDataContextType>({
  publicData: defaultData,
  addLink: async () => {},
  updateLink: async () => {},
  deleteLink: async () => {},
  reorderLinks: async () => {},
});

export function PublicDataProvider({ children }: { children: ReactNode }) {
  const [publicData, setPublicData] = useState<PublicData>(defaultData);
  const [userId, setUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userId === undefined) return;
    if (!userId) {
      setPublicData(defaultData);
      return;
    }

    const supabase = getSupabaseClient();
    supabase
      .from('public_links')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order')
      .then(({ data }) => {
        if (data) {
          setPublicData({
            links: data.map((l) => ({
              id: l.id as string,
              title: l.title as string,
              url: l.url as string,
              order: l.sort_order as number,
            })),
          });
        }
      });
  }, [userId]);

  const addLink = async (title: string, url: string): Promise<void> => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    const order = publicData.links.length;
    const { data } = await supabase
      .from('public_links')
      .insert({ user_id: userId, title: title.trim(), url: url.trim(), sort_order: order })
      .select()
      .single();
    if (data) {
      setPublicData((prev) => ({
        ...prev,
        links: [
          ...prev.links,
          {
            id: data.id as string,
            title: data.title as string,
            url: data.url as string,
            order: data.sort_order as number,
          },
        ],
      }));
    }
  };

  const updateLink = async (id: string, title: string, url: string): Promise<void> => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    await supabase
      .from('public_links')
      .update({ title: title.trim(), url: url.trim() })
      .eq('id', id);
    setPublicData((prev) => ({
      ...prev,
      links: prev.links.map((l) =>
        l.id === id ? { ...l, title: title.trim(), url: url.trim() } : l
      ),
    }));
  };

  const deleteLink = async (id: string): Promise<void> => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    await supabase.from('public_links').delete().eq('id', id);
    setPublicData((prev) => ({
      ...prev,
      links: prev.links
        .filter((l) => l.id !== id)
        .map((l, i) => ({ ...l, order: i })),
    }));
  };

  const reorderLinks = async (links: PublicLink[]): Promise<void> => {
    if (!userId) return;
    setPublicData((prev) => ({ ...prev, links }));
    const supabase = getSupabaseClient();
    await Promise.all(
      links.map((l, i) =>
        supabase.from('public_links').update({ sort_order: i }).eq('id', l.id)
      )
    );
  };

  return (
    <PublicDataContext.Provider
      value={{ publicData, addLink, updateLink, deleteLink, reorderLinks }}
    >
      {children}
    </PublicDataContext.Provider>
  );
}

export function usePublicData() {
  return useContext(PublicDataContext);
}
