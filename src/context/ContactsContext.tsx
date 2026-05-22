'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSupabaseClient, ContactRow } from '@/lib/supabase';
import { Contact, ContactSection } from '@/lib/types';

type CreateContactData = {
  sectionId: string;
  name: string;
  whatsapp?: string | null;
  instagram?: string | null;
  email?: string | null;
  linkedin?: string | null;
  isFrequent?: boolean;
};

type ContactsContextType = {
  sections: ContactSection[];
  contacts: Contact[];
  isLoading: boolean;
  createSection: (title: string, iconName?: string) => Promise<ContactSection | null>;
  renameSection: (id: string, title: string) => Promise<void>;
  updateSectionIcon: (id: string, iconName: string) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;
  reorderSections: (orderedIds: string[]) => Promise<void>;
  createContact: (data: CreateContactData) => Promise<Contact | null>;
  updateContact: (id: string, data: Partial<Omit<Contact, 'id'>>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  toggleFrequent: (id: string) => Promise<void>;
};

const ContactsContext = createContext<ContactsContextType>({
  sections: [],
  contacts: [],
  isLoading: true,
  createSection: async () => null,
  renameSection: async () => {},
  updateSectionIcon: async () => {},
  deleteSection: async () => {},
  reorderSections: async () => {},
  createContact: async () => null,
  updateContact: async () => {},
  deleteContact: async () => {},
  toggleFrequent: async () => {},
});

export function ContactsProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<ContactSection[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
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
      setSections([]);
      setContacts([]);
      setIsLoading(false);
      return;
    }
    fetchAll(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchAll = async (uid: string) => {
    setIsLoading(true);
    const supabase = getSupabaseClient();

    const [{ data: sectionsData }, { data: contactsData }] = await Promise.all([
      supabase.from('contact_sections').select('*').eq('user_id', uid).order('sort_order'),
      supabase.from('contacts').select('*').eq('user_id', uid),
    ]);

    const mappedSections: ContactSection[] = (sectionsData ?? []).map((s) => ({
      id: s.id as string,
      title: s.title as string,
      sortOrder: s.sort_order as number,
      iconName: (s.icon_name as string | null) ?? 'star',
    }));

    const mappedContacts: Contact[] = (contactsData ?? [])
      .map((c) => ({
        id: c.id as string,
        sectionId: c.section_id as string,
        name: c.name as string,
        whatsapp: c.whatsapp as string | null,
        instagram: c.instagram as string | null,
        email: c.email as string | null,
        linkedin: c.linkedin as string | null,
        isFrequent: c.is_frequent as boolean,
        sortOrder: c.sort_order as number,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    setSections(mappedSections);
    setContacts(mappedContacts);
    setIsLoading(false);
  };

  // ── Sections ──────────────────────────────────────────────────────────────

  const createSection = async (title: string, iconName = 'star'): Promise<ContactSection | null> => {
    if (!userId) return null;
    const supabase = getSupabaseClient();
    const order = sections.length;
    const { data } = await supabase
      .from('contact_sections')
      .insert({ user_id: userId, title: title.trim(), sort_order: order, icon_name: iconName })
      .select()
      .single();
    if (!data) return null;
    const newSection: ContactSection = {
      id: data.id as string,
      title: data.title as string,
      sortOrder: data.sort_order as number,
      iconName: (data.icon_name as string | null) ?? 'star',
    };
    setSections((prev) => [...prev, newSection]);
    return newSection;
  };

  const renameSection = async (id: string, title: string): Promise<void> => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, title: title.trim() } : s)));
    await supabase.from('contact_sections').update({ title: title.trim() }).eq('id', id);
  };

  const updateSectionIcon = async (id: string, iconName: string): Promise<void> => {
    if (!userId) return;
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, iconName } : s)));
    const supabase = getSupabaseClient();
    await supabase.from('contact_sections').update({ icon_name: iconName }).eq('id', id);
  };

  const deleteSection = async (id: string): Promise<void> => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    // Optimistic update
    setSections((prev) => prev.filter((s) => s.id !== id));
    setContacts((prev) => prev.filter((c) => c.sectionId !== id));
    // Delete contacts first (FK constraint), then the section
    await supabase.from('contacts').delete().eq('section_id', id);
    await supabase.from('contact_sections').delete().eq('id', id);
  };

  const reorderSections = async (orderedIds: string[]): Promise<void> => {
    const reordered = orderedIds.map((id, i) => {
      const s = sections.find((s) => s.id === id)!;
      return { ...s, sortOrder: i };
    });
    setSections(reordered);

    const supabase = getSupabaseClient();
    await Promise.all(
      orderedIds.map((id, index) =>
        supabase.from('contact_sections').update({ sort_order: index }).eq('id', id)
      )
    );
  };

  // ── Contacts ──────────────────────────────────────────────────────────────

  const createContact = async (data: CreateContactData): Promise<Contact | null> => {
    if (!userId) return null;
    // Limit: max 50 contacts per section
    const sectionCount = contacts.filter((c) => c.sectionId === data.sectionId).length;
    if (sectionCount >= 50) {
      alert('Limite de 50 contatos por seção atingido.');
      return null;
    }
    const supabase = getSupabaseClient();
    const { data: row } = await supabase
      .from('contacts')
      .insert({
        user_id: userId,
        section_id: data.sectionId,
        name: data.name.trim(),
        whatsapp: data.whatsapp ?? null,
        instagram: data.instagram ?? null,
        email: data.email ?? null,
        linkedin: data.linkedin ?? null,
        is_frequent: data.isFrequent ?? false,
        sort_order: 0,
      })
      .select()
      .single();
    if (!row) return null;
    const newContact: Contact = {
      id: row.id as string,
      sectionId: row.section_id as string,
      name: row.name as string,
      whatsapp: row.whatsapp as string | null,
      instagram: row.instagram as string | null,
      email: row.email as string | null,
      linkedin: row.linkedin as string | null,
      isFrequent: row.is_frequent as boolean,
      sortOrder: row.sort_order as number,
    };
    setContacts((prev) => [...prev, newContact].sort((a, b) => a.name.localeCompare(b.name)));
    return newContact;
  };

  const updateContact = async (id: string, data: Partial<Omit<Contact, 'id'>>): Promise<void> => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    // Optimistic update
    setContacts((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, ...data } : c))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    const dbData: Partial<ContactRow> = {};
    if (data.sectionId !== undefined) dbData.section_id = data.sectionId;
    if (data.name !== undefined) dbData.name = data.name.trim();
    if (data.whatsapp !== undefined) dbData.whatsapp = data.whatsapp;
    if (data.instagram !== undefined) dbData.instagram = data.instagram;
    if (data.email !== undefined) dbData.email = data.email;
    if (data.linkedin !== undefined) dbData.linkedin = data.linkedin;
    if (data.isFrequent !== undefined) dbData.is_frequent = data.isFrequent;
    if (data.sortOrder !== undefined) dbData.sort_order = data.sortOrder;
    await supabase.from('contacts').update(dbData).eq('id', id);
  };

  const deleteContact = async (id: string): Promise<void> => {
    if (!userId) return;
    const supabase = getSupabaseClient();
    setContacts((prev) => prev.filter((c) => c.id !== id));
    await supabase.from('contacts').delete().eq('id', id);
  };

  const toggleFrequent = async (id: string): Promise<void> => {
    if (!userId) return;
    const contact = contacts.find((c) => c.id === id);
    if (!contact) return;
    const newValue = !contact.isFrequent;
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, isFrequent: newValue } : c)));
    const supabase = getSupabaseClient();
    await supabase.from('contacts').update({ is_frequent: newValue }).eq('id', id);
  };

  return (
    <ContactsContext.Provider
      value={{
        sections,
        contacts,
        isLoading,
        createSection,
        renameSection,
        updateSectionIcon,
        deleteSection,
        reorderSections,
        createContact,
        updateContact,
        deleteContact,
        toggleFrequent,
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  return useContext(ContactsContext);
}
