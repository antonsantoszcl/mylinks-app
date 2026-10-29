import { SupabaseClient } from '@supabase/supabase-js';
import demoSnapshot from './demo-snapshot.json';

const DELETE_ORDER = [
  'contacts',
  'contact_sections',
  'links',
  'categories',
  'quick_access',
  'dashboards',
  'public_links',
  'social_links',
];
const INSERT_ORDER = [
  'dashboards',
  'categories',
  'links',
  'quick_access',
  'contact_sections',
  'contacts',
  'public_links',
  'social_links',
];

type Snapshot = {
  userId: string;
  profile: Record<string, unknown>;
  tables: Record<string, Record<string, unknown>[]>;
};

/**
 * Restores the demo account's dashboards/categories/links/quick access/
 * contacts/profile to the baseline snapshot captured in demo-snapshot.json.
 * Only ever call this for the known public demo account.
 */
export async function resetDemoAccount(supabase: SupabaseClient, userId: string): Promise<void> {
  const snapshot = demoSnapshot as Snapshot;

  // Safety check: never run this restore against an account that doesn't
  // match the snapshot's original owner.
  if (snapshot.userId !== userId) {
    throw new Error('Snapshot user mismatch: refusing to reset this account.');
  }

  if (snapshot.profile) {
    const { id, created_at, ...profileFields } = snapshot.profile as Record<string, unknown>;
    const { error } = await supabase.from('profiles').update(profileFields).eq('id', userId);
    if (error) throw new Error(`Failed to restore profile: ${error.message}`);
  }

  for (const table of DELETE_ORDER) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId);
    if (error) throw new Error(`Failed to clear "${table}": ${error.message}`);
  }

  for (const table of INSERT_ORDER) {
    const rows = snapshot.tables[table];
    if (!rows || rows.length === 0) continue;
    const { error } = await supabase.from(table).insert(rows);
    if (error) throw new Error(`Failed to restore "${table}": ${error.message}`);
  }
}
