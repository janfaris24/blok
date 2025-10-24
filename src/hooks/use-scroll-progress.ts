import { useEffect, useState, RefObject } from 'react';

/**
 * Hook to track scroll progress of an element
 * Returns a value between 0 and 1 representing how far through the viewport the element has scrolled
 */
export function useScrollProgress(ref: RefObject<HTMLElement>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate progress: 0 when element enters viewport, 1 when it exits
      const elementTop = rect.top;
      const elementHeight = rect.height;

      // Progress from when element enters (bottom of viewport) to when it exits (top of viewport)
      const scrollProgress = 1 - (elementTop + elementHeight) / (windowHeight + elementHeight);

      // Clamp between 0 and 1
      const clampedProgress = Math.max(0, Math.min(1, scrollProgress));

      setProgress(clampedProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref]);

  return progress;
}
