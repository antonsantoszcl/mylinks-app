/**
 * Snapshots the current content of the public demo account (dashboards,
 * categories, links, quick access, contacts, profile, public/social links)
 * into scripts/demo-snapshot.json so it can be restored later with
 * `node scripts/demo-restore.js` if someone messes up the demo data.
 *
 * Usage: node scripts/demo-backup.js
 */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://olklvojfnjqhsihbxjyq.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sa2x2b2pmbmpxaHNpaGJ4anlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NjA2NTQsImV4cCI6MjA5MzAzNjY1NH0.INDxLMHo1qFlzXRL9PZuXuKYFK6FxjWujmCPLDjdVKQ';

const DEMO_EMAIL = 'example.alllinks@gmail.com';
const DEMO_PASSWORD = 'all2027!';

const TABLES = [
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
  console.log('Logged in as demo user:', uid);

  const snapshot = { userId: uid, capturedAt: new Date().toISOString(), tables: {} };

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .single();
  if (profileError) {
    console.error('Failed to read profile:', profileError.message);
    process.exit(1);
  }
  snapshot.profile = profile;

  for (const table of TABLES) {
    const { data, error } = await supabase.from(table).select('*').eq('user_id', uid);
    if (error) {
      console.error(`Failed to read ${table}:`, error.message);
      process.exit(1);
    }
    snapshot.tables[table] = data;
    console.log(`  ${table}: ${data.length} row(s)`);
  }

  const outPath = path.join(__dirname, 'demo-snapshot.json');
  fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2), 'utf8');
  console.log('Snapshot saved to', outPath);

  await supabase.auth.signOut();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
