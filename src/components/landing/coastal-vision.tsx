'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useLandingLanguage } from '@/contexts/landing-language-context';

export function CoastalVision() {
  const { language } = useLandingLanguage();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="relative py-24 sm:py-32 lg:py-40 overflow-hidden">
      {/* Grid pattern background */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-6xl mx-auto"
          style={{ opacity }}
        >
          {/* Headline */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-foreground">
              {language === 'es'
                ? 'Gestión moderna para comunidades costeras'
                : 'Modern management for coastal communities'}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {language === 'es'
                ? 'Desde la montaña hasta el mar, Blok se adapta a las necesidades únicas de cada condominio en Puerto Rico. Transparencia, eficiencia y comunicación perfecta.'
                : 'From mountain to sea, Blok adapts to the unique needs of every Puerto Rico condominium. Transparency, efficiency, and seamless communication.'}
            </p>
          </div>

          {/* Image with zoom effect */}
          <motion.div
            className="relative"
            style={{ scale }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/images/condo-aerial-coast.png"
                alt="Coastal condominium aerial view"
                className="w-full h-auto"
              />
              {/* Gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
