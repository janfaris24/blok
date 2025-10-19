'use client';

import { useState, useEffect } from 'react';
import { translations, type Language } from './translations';

/**
 * Hook to use translations in React components
 * Stores language preference in localStorage
 */
export function useTranslations() {
  const [lang, setLangState] = useState<Language>('es');

  useEffect(() => {
    // Get language from localStorage on mount
    const stored = localStorage.getItem('condosync_lang');
    if (stored === 'en' || stored === 'es') {
      setLangState(stored);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('condosync_lang', newLang);
  };

  /**
   * Get translation with placeholder replacement
   * @param key - Translation key path (e.g., 'residents.title')
   * @param replacements - Object with placeholder values (e.g., {count: 5})
   */
  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[lang];

    for (const k of keys) {
      value = value?.[k];
    }

    if (typeof value !== 'string') {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }

    // Replace placeholders like {count}, {shown}, etc.
    if (replacements) {
      Object.keys(replacements).forEach(placeholder => {
        value = value.replace(
          new RegExp(`\\{${placeholder}\\}`, 'g'),
          String(replacements[placeholder])
        );
      });
    }

    return value;
  };

  return { t, lang, setLang };
}
