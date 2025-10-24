'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Zap, BarChart3 } from 'lucide-react';
import { useLandingLanguage } from '@/contexts/landing-language-context';

interface Feature {
  icon: typeof MessageSquare;
  title: {
    es: string;
    en: string;
  };
  description: {
    es: string;
    en: string;
  };
}

const features: Feature[] = [
  {
    icon: MessageSquare,
    title: {
      es: 'AI Analiza Mensajes',
      en: 'AI Analyzes Messages'
    },
    description: {
      es: 'Detecta automáticamente solicitudes de mantenimiento, quejas y preguntas frecuentes de tus residentes',
      en: 'Automatically detects maintenance requests, complaints, and frequently asked questions from your residents'
    }
  },
  {
    icon: Zap,
    title: {
      es: 'Enrutamiento Inteligente',
      en: 'Smart Routing'
    },
    description: {
      es: 'Envía mensajes a propietarios, inquilinos o administradores según el contexto y la urgencia',
      en: 'Routes messages to owners, renters, or admins based on context and urgency'
    }
  },
  {
    icon: BarChart3,
    title: {
      es: 'Seguimiento Automático',
      en: 'Automatic Tracking'
    },
    description: {
      es: 'Crea tickets de mantenimiento y da seguimiento hasta resolver cada solicitud de los residentes',
      en: 'Creates maintenance tickets and tracks every resident request to resolution'
    }
  }
];

export function StickyFeatureSection() {
  const { language } = useLandingLanguage();

  return (
    <section id="features" className="relative py-24 sm:py-32 lg:py-40 overflow-hidden">
      {/* Grid pattern background */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-20 sm:space-y-24 lg:space-y-32">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="space-y-4 text-center"
            >
              <div className="w-14 h-14 rounded-xl bg-foreground/5 border border-border flex items-center justify-center mx-auto">
                <feature.icon className="w-7 h-7 text-foreground" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                {feature.title[language]}
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {feature.description[language]}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
