'use client';

import { createContext, useContext, ReactNode, useState } from 'react';
import { translations, Language, Translations } from '@/lib/translations';

interface LandingLanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LandingLanguageContext = createContext<LandingLanguageContextType | undefined>(undefined);

export function LandingLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es');

  const value: LandingLanguageContextType = {
    language,
    setLanguage,
    t: translations[language] as Translations,
  };

  return (
    <LandingLanguageContext.Provider value={value}>
      {children}
    </LandingLanguageContext.Provider>
  );
}

export function useLandingLanguage() {
  const context = useContext(LandingLanguageContext);
  if (context === undefined) {
    throw new Error('useLandingLanguage must be used within a LandingLanguageProvider');
  }
  return context;
}
