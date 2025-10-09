'use client';

import { useLanguage } from '@/contexts/language-context';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
      className="gap-2"
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium">{language === 'es' ? 'EN' : 'ES'}</span>
    </Button>
  );
}
