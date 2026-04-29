import { createClient } from '@supabase/supabase-js';

type ProfileRow = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  tagline: string;
  bio: string;
  contact_email: string;
  contact_phone: string;
  areas_of_interest: unknown;
  tools: unknown;
  created_at: string;
};
type DashboardRow = {
  id: string;
  user_id: string;
  title: string;
  is_default: boolean;
  sort_order: number;
  created_at: string;
};
type CategoryRow = {
  id: string;
  user_id: string;
  title: string;
  icon_name: string;
  sort_order: number;
  dashboard_id: string | null;
  created_at: string;
};
type LinkRow = {
  id: string;
  category_id: string;
  user_id: string;
  title: string;
  url: string;
  icon_url: string;
  sort_order: number;
  created_at: string;
};
type QuickAccessRow = {
  id: string;
  user_id: string;
  title: string;
  url: string;
  icon_url: string;
  sort_order: number;
  created_at: string;
};
type PublicLinkRow = {
  id: string;
  user_id: string;
  title: string;
  url: string;
  sort_order: number;
  created_at: string;
};
type SocialLinkRow = {
  id: string;
  user_id: string;
  platform: string;
  handle: string;
  url: string;
  sort_order: number;
  created_at: string;
};

// GenericTable requires Relationships: []
type TableDef<Row extends Record<string, unknown>, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<ProfileRow>;
      dashboards: TableDef<DashboardRow>;
      categories: TableDef<CategoryRow>;
      links: TableDef<LinkRow>;
      quick_access: TableDef<QuickAccessRow>;
      public_links: TableDef<PublicLinkRow>;
      social_links: TableDef<SocialLinkRow>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let _client: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!_client) {
    _client = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}
