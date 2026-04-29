export interface Dashboard {
  id: string;
  title: string;
  isDefault: boolean;
  sortOrder: number;
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
