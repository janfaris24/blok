'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useLandingLanguage } from '@/contexts/landing-language-context';

export function TwilightPeace() {
  const { language } = useLandingLanguage();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.8]);

  return (
    <section ref={ref} className="relative py-24 sm:py-32 lg:py-40 overflow-hidden bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-6xl mx-auto"
          style={{ opacity }}
        >
          {/* Headline */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-foreground">
              {language === 'es'
                ? 'Tranquilidad las 24 horas'
                : '24/7 peace of mind'}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              {language === 'es'
                ? 'AI que trabaja mientras tú descansas. Respuestas instantáneas, gestión automática, y tu equipo siempre informado. Día o noche, Blok está activo.'
                : 'AI that works while you rest. Instant responses, automatic management, and your team always informed. Day or night, Blok is active.'}
            </p>
          </div>

          {/* Image */}
          <motion.div
            className="relative"
            style={{ y }}
          >
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl">
              <img
                src="/images/condo-twilight.png"
                alt="Twilight condominium"
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
