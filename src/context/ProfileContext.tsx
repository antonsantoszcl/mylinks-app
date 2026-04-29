'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

export type SocialLink = {
  id: string;
  platform: string;
  handle: string;
  url: string;
};

export type ToolItem = {
  id: string;
  name: string;
  description: string;
  url: string;
};

export type ProfileData = {
  username: string;
  displayName: string;
  avatarUrl: string;
  tagline: string;
  bio: string;
  socialLinks: SocialLink[];
  contactEmail: string;
  contactPhone: string;
  areasOfInterest: string[];
  tools: ToolItem[];
};

const defaultProfile: ProfileData = {
  username: '',
  displayName: '',
  avatarUrl: '',
  tagline: 'Organizacao, produtividade e vida digital simplificada',
  bio: 'Apaixonado por tecnologia e produtividade. Compartilho ferramentas e recursos que uso no dia a dia para organizar minha vida digital.',
  socialLinks: [],
  contactEmail: '',
  contactPhone: '',
  areasOfInterest: ['Organizacao pessoal', 'Produtividade', 'Vida digital', 'Aprendizado'],
  tools: [],
};

type ProfileContextType = {
  profile: ProfileData;
  loading: boolean;
  updateProfile: (data: Partial<ProfileData>) => void;
};

const ProfileContext = createContext<ProfileContextType>({
  profile: defaultProfile,
  loading: true,
  updateProfile: () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [loading, setLoading] = useState(true);
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
    if (userId === undefined) return; // still resolving session
    if (!userId) {
      setProfile(defaultProfile);
      setLoading(false);
      return;
    }
    fetchProfile(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchProfile = async (uid: string) => {
    setLoading(true);
    const supabase = getSupabaseClient();

    const [profileRes, socialRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', uid).single(),
      supabase
        .from('social_links')
        .select('*')
        .eq('user_id', uid)
        .order('sort_order'),
    ]);

    const p = profileRes.data;
    const socials = (socialRes.data ?? []) as Array<{
      id: string;
      platform: string;
      handle: string;
      url: string;
    }>;

    if (p) {
      setProfile({
        username: p.username || '',
        displayName: p.display_name || defaultProfile.displayName,
        avatarUrl: p.avatar_url || '',
        tagline: p.tagline || defaultProfile.tagline,
        bio: p.bio || defaultProfile.bio,
        contactEmail: p.contact_email || '',
        contactPhone: p.contact_phone || '',
        areasOfInterest: (p.areas_of_interest as string[]) || defaultProfile.areasOfInterest,
        tools: (p.tools as ToolItem[]) || [],
        socialLinks: socials.map((s) => ({
          id: s.id,
          platform: s.platform,
          handle: s.handle,
          url: s.url,
        })),
      });
    }
    setLoading(false);
  };

  const updateProfile = (data: Partial<ProfileData>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...data };
      if (userId) {
        saveProfile(userId, updated).catch(console.error);
      }
      return updated;
    });
  };

  const saveProfile = async (uid: string, data: ProfileData) => {
    const supabase = getSupabaseClient();

    await supabase.from('profiles').upsert({
      id: uid,
      username: data.username,
      display_name: data.displayName,
      avatar_url: data.avatarUrl,
      tagline: data.tagline,
      bio: data.bio,
      contact_email: data.contactEmail,
      contact_phone: data.contactPhone,
      areas_of_interest: data.areasOfInterest,
      tools: data.tools,
    });

    // Replace social links: delete all then re-insert
    await supabase.from('social_links').delete().eq('user_id', uid);
    if (data.socialLinks.length > 0) {
      await supabase.from('social_links').insert(
        data.socialLinks.map((s, i) => ({
          user_id: uid,
          platform: s.platform,
          handle: s.handle,
          url: s.url,
          sort_order: i,
        }))
      );
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}
