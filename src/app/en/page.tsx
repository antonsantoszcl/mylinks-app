'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/context/LocaleContext';

export default function EnglishEntryPage() {
  const { setLocale } = useLocale();
  const router = useRouter();

  useEffect(() => {
    setLocale('en');
    router.replace('/login');
  }, [setLocale, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-5 h-5 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
    </div>
  );
}
