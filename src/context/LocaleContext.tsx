'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { dictionary, DictKey, Locale } from '@/lib/i18n/dictionary';

const COOKIE_NAME = 'nl_lang';

function readCookieLocale(): Locale {
  if (typeof document === 'undefined') return 'pt';
  const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=(pt|en)`));
  return (match?.[1] as Locale) ?? 'pt';
}

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
  const [locale, setLocaleState] = useState<Locale>('pt');

  useEffect(() => {
    setLocaleState(readCookieLocale());
  }, []);

  const setLocale = useCallback((next: Locale) => {
    document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
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
