'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useLandingLanguage } from '@/contexts/landing-language-context';

export function CondominiumHero() {
  const { language } = useLandingLanguage();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Subtle zoom effect as you scroll through the section
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.05, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [50, 0, -50]);

  return (
    <section id="community" ref={ref} className="relative py-24 sm:py-32 lg:py-40 overflow-hidden">
      {/* Grid pattern background */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          style={{ scale, opacity, y }}
          className="relative h-[400px] sm:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden"
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/images/condo-community.jpg)',
            }}
          />

          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent" />

          {/* Content */}
          <div className="relative h-full flex items-end justify-center text-center px-4 pb-12 sm:pb-16">
            <div className="max-w-3xl">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6"
              >
                {language === 'es'
                  ? 'Diseñado para Condominios de Puerto Rico'
                  : 'Designed for Puerto Rico Condominiums'
                }
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg sm:text-xl text-muted-foreground leading-relaxed"
              >
                {language === 'es'
                  ? 'Entendemos las necesidades únicas de la administración de condominios boricuas. Construido para tu comunidad.'
                  : 'We understand the unique needs of Puerto Rican condo administration. Built for your community.'
                }
              </motion.p>
            </div>
          </div>

          {/* Subtle vignette effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-background/30 pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}
