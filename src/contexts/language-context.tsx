'use client';

import { createContext, useContext, ReactNode } from 'react';
import { translations, Language, Translations } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  language,
}: {
  children: ReactNode;
  language: Language;
}) {
  const value: LanguageContextType = {
    language,
    t: translations[language] as Translations,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
