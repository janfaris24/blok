'use client';

import { useScrollSpy } from '@/hooks/use-scroll-spy';
import { useLandingLanguage } from '@/contexts/landing-language-context';
import { motion } from 'framer-motion';

interface NavSection {
  id: string;
  label: {
    es: string;
    en: string;
  };
}

const sections: NavSection[] = [
  { id: 'hero', label: { es: 'INICIO', en: 'HOME' } },
  { id: 'demo', label: { es: 'DEMO', en: 'DEMO' } },
  { id: 'features', label: { es: 'CARACTERÍSTICAS', en: 'FEATURES' } },
  { id: 'community', label: { es: 'COMUNIDAD', en: 'COMMUNITY' } },
  { id: 'intelligence', label: { es: 'INTELIGENCIA', en: 'INTELLIGENCE' } },
  { id: 'contact', label: { es: 'CONTACTO', en: 'CONTACT' } },
];

export function ScrollProgressNav() {
  const { language } = useLandingLanguage();
  const sectionIds = sections.map(s => s.id);
  const { activeSection, sectionProgress } = useScrollSpy(sectionIds, {
    threshold: 0.3,
    rootMargin: '-20% 0px -35% 0px'
  });

  const handleClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="fixed left-8 top-1/2 -translate-y-1/2 z-50 hidden xl:block">
      <div className="space-y-1">
        {sections.map((section, index) => {
          const isActive = activeSection === section.id;
          const progress = sectionProgress[section.id] || 0;
          const isCompleted = progress >= 0.9;

          return (
            <div key={section.id} className="relative">
              <button
                onClick={() => handleClick(section.id)}
                className={`
                  group relative flex items-center gap-3 py-2 pr-4 pl-0
                  transition-all duration-300 ease-out
                  ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-70'}
                `}
              >
                {/* Progress indicator line */}
                <div className="relative w-1 h-8">
                  {/* Background line */}
                  <div className="absolute inset-0 bg-border" />

                  {/* Progress fill */}
                  <motion.div
                    className={`absolute left-0 w-full origin-top ${
                      isActive
                        ? 'bg-gradient-to-b from-primary to-secondary shadow-lg shadow-primary/50'
                        : isCompleted
                        ? 'bg-primary/60'
                        : 'bg-transparent'
                    }`}
                    initial={{ height: 0 }}
                    animate={{ height: `${progress * 100}%` }}
                    transition={{ duration: 0.1, ease: 'linear' }}
                  />

                  {/* Active dot */}
                  {isActive && (
                    <motion.div
                      className="absolute w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50 -left-1"
                      style={{ top: `${progress * 100}%` }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`
                    text-sm font-medium transition-all duration-300
                    ${isActive
                      ? 'text-foreground translate-x-1'
                      : 'text-muted-foreground'
                    }
                  `}
                >
                  {section.label[language]}
                </span>

                {/* Hover indicator */}
                <motion.div
                  className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary/20 rounded-r opacity-0 group-hover:opacity-100"
                  initial={false}
                  transition={{ duration: 0.2 }}
                />
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
