export interface Dashboard {
  id: string;
  title: string;
  isDefault: boolean;
  isContacts: boolean;
  sortOrder: number;
  iconName: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  isPro: boolean;
}

export interface QuickAccessLink {
  id: string;
  title: string;
  url: string;
  iconUrl: string;
}

export interface Category {
  id: string;
  title: string;
  iconName: string;
  colorHint?: string;
  order: number;
  dashboardId?: string;
}

export interface Link {
  id: string;
  categoryId: string;
  title: string;
  url: string;
  iconUrl: string;
  order: number;
}

export interface RecentAccess {
  id: string;
  title: string;
  url: string;
  iconUrl: string;
  accessedAtLabel: string;
}

export interface ContactSection {
  id: string;
  title: string;
  sortOrder: number;
  iconName: string;
}

export interface Contact {
  id: string;
  sectionId: string;
  name: string;
  whatsapp: string | null;
  instagram: string | null;
  email: string | null;
  linkedin: string | null;
  isFrequent: boolean;
  sortOrder: number;
}
