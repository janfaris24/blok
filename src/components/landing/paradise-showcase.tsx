'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useLandingLanguage } from '@/contexts/landing-language-context';

export function ParadiseShowcase() {
  const { language } = useLandingLanguage();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

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
                ? 'Tu paraíso en Puerto Rico'
                : 'Your paradise in Puerto Rico'}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {language === 'es'
                ? 'Conecta con tu comunidad mientras disfrutas de la belleza natural de la isla. Blok hace que administrar tu condominio sea tan hermoso como vivir en él.'
                : 'Connect with your community while enjoying the natural beauty of the island. Blok makes managing your condo as beautiful as living in it.'}
            </p>
          </div>

          {/* Image */}
          <motion.div
            className="relative"
            style={{ y }}
          >
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl">
              <img
                src="/images/condo-mountain-paradise.png"
                alt="Paradise condominium"
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
