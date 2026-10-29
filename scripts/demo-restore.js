/**
 * Restores the public demo account's content to the last snapshot taken by
 * `node scripts/demo-backup.js`. Deletes all current dashboards, categories,
 * links, quick access items, contacts and public/social links for the demo
 * user, then re-inserts everything exactly as it was captured.
 *
 * Usage: node scripts/demo-restore.js
 */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://olklvojfnjqhsihbxjyq.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sa2x2b2pmbmpxaHNpaGJ4anlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NjA2NTQsImV4cCI6MjA5MzAzNjY1NH0.INDxLMHo1qFlzXRL9PZuXuKYFK6FxjWujmCPLDjdVKQ';

const DEMO_EMAIL = 'example.alllinks@gmail.com';
const DEMO_PASSWORD = 'all2027!';

// Order matters: parents before children on insert, children before parents
// on delete would be ideal but FK cascades handle most of it. We delete
// dashboards last-to-first-child-first to be safe, and insert parents first.
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

async function main() {
  const snapshotPath = path.join(__dirname, 'demo-snapshot.json');
  if (!fs.existsSync(snapshotPath)) {
    console.error('No snapshot found at', snapshotPath, '- run demo-backup.js first.');
    process.exit(1);
  }
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });
  if (authError) {
    console.error('Login failed:', authError.message);
    process.exit(1);
  }
  const uid = authData.user.id;
  if (uid !== snapshot.userId) {
    console.error('Snapshot belongs to a different user id. Aborting for safety.');
    process.exit(1);
  }
  console.log('Logged in as demo user:', uid);
  console.log('Restoring snapshot captured at', snapshot.capturedAt);

  if (snapshot.profile) {
    const { id, created_at, ...profileFields } = snapshot.profile;
    const { error } = await supabase.from('profiles').update(profileFields).eq('id', uid);
    if (error) console.error('Failed to restore profile:', error.message);
    else console.log('  profile: restored');
  }

  for (const table of DELETE_ORDER) {
    const { error } = await supabase.from(table).delete().eq('user_id', uid);
    if (error) console.error(`Failed to clear ${table}:`, error.message);
  }

  for (const table of INSERT_ORDER) {
    const rows = snapshot.tables[table];
    if (!rows || rows.length === 0) continue;
    const { error } = await supabase.from(table).insert(rows);
    if (error) {
      console.error(`Failed to restore ${table}:`, error.message);
    } else {
      console.log(`  ${table}: ${rows.length} row(s) restored`);
    }
  }

  console.log('Restore complete.');
  await supabase.auth.signOut();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
