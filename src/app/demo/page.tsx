'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { useLocale } from '@/context/LocaleContext';

const DEMO_EMAIL = 'example.alllinks@gmail.com';
const DEMO_PASSWORD = 'all2027!';
const SIDEBAR_KEY = 'mylinks.sidebar.collapsed';

export default function DemoEntryPage() {
  const router = useRouter();
  const { setLocale } = useLocale();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLocale('en');
      try {
        localStorage.setItem(SIDEBAR_KEY, 'false');
      } catch {}
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });
      if (error) {
        setError('Could not sign in to the demo account. Please try again shortly.');
        return;
      }
      router.replace('/dashboard');
    };
    run();
  }, [router, setLocale]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      {error ? (
        <p className="text-sm text-slate-500 max-w-xs text-center px-4">{error}</p>
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      )}
    </div>
  );
}
