'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { dictionary, DictKey, Locale } from '@/lib/i18n/dictionary';
import { useAuth } from '@/context/AuthContext';
import { DEMO_EMAIL } from '@/lib/demoConfig';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: DictKey, vars?: Record<string, string>) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'pt',
  setLocale: () => {},
  t: (key) => dictionary.pt[key] ?? key,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [selectedLocale, setLocaleState] = useState<Locale>('pt');
  const { user } = useAuth();
  const pathname = usePathname();
  const locale = user ? (user.email.toLowerCase() === DEMO_EMAIL.toLowerCase() ? 'en' : 'pt') : selectedLocale;

  useEffect(() => {
    document.cookie = 'nl_lang=; path=/; max-age=0';
  }, []);

  useEffect(() => {
    if (user || (pathname !== '/en' && pathname !== '/login' && pathname !== '/demo')) {
      setLocaleState('pt');
    }
  }, [user, pathname]);

  useEffect(() => {
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en';
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: DictKey, vars?: Record<string, string>) => {
      let str: string = dictionary[locale][key] ?? dictionary.pt[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(`{${k}}`, v);
        }
      }
      return str;
    },
    [locale]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
