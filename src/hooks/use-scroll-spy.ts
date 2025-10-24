import { useEffect, useState, useRef } from 'react';

interface ScrollSpyOptions {
  threshold?: number;
  rootMargin?: string;
}

/**
 * Hook to track which section is currently in viewport
 * Returns the ID of the active section
 */
export function useScrollSpy(
  sectionIds: string[],
  options: ScrollSpyOptions = {}
) {
  const [activeSection, setActiveSection] = useState<string>('');
  const [sectionProgress, setSectionProgress] = useState<Record<string, number>>({});
  const previousProgressRef = useRef<Record<string, number>>({});
  const sectionIdsRef = useRef(sectionIds);
  const optionsRef = useRef(options);

  // Update refs when props change
  useEffect(() => {
    sectionIdsRef.current = sectionIds;
    optionsRef.current = options;
  }, [sectionIds, options]);

  useEffect(() => {
    const { threshold = 0.5, rootMargin = '-20% 0px -35% 0px' } = optionsRef.current;

    const handleScroll = () => {
      // Calculate progress for each section
      const progress: Record<string, number> = {};

      sectionIdsRef.current.forEach(id => {
        const element = document.getElementById(id);
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementHeight = rect.height;

        // Calculate how far through the section we are
        const scrolled = windowHeight - rect.top;
        const sectionProgress = Math.max(0, Math.min(1, scrolled / elementHeight));

        progress[id] = Number(sectionProgress.toFixed(3)); // Round to 3 decimals
      });

      // Only update if progress has actually changed
      const hasChanged = sectionIdsRef.current.some(id => {
        return progress[id] !== previousProgressRef.current[id];
      });

      if (hasChanged) {
        previousProgressRef.current = progress;
        setSectionProgress(progress);
      }
    };

    // Intersection Observer for active section detection
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold, rootMargin }
    );

    // Observe all sections
    sectionIdsRef.current.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    // Track scroll for progress
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { activeSection, sectionProgress };
}
