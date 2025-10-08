"use client"

import { Bot, Target, Wrench, Megaphone, MessageCircle, BarChart3 } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export function FeaturesSection() {
  const { ref, isVisible } = useScrollAnimation()

  const features = [
    {
      icon: Bot,
      title: "Respuestas IA Instantáneas",
      description: "Residentes reciben respuestas inmediatas 24/7 en español",
    },
    {
      icon: Target,
      title: "Enrutamiento Inteligente",
      description: "IA decide si notificar al dueño, inquilino o administrador",
    },
    {
      icon: Wrench,
      title: "Tickets de Mantenimiento Automáticos",
      description: "Extrae solicitudes de mantenimiento de conversaciones",
    },
    {
      icon: Megaphone,
      title: "Anuncios Masivos",
      description: "Envía mensajes a todos, solo dueños, o solo inquilinos",
    },
    {
      icon: MessageCircle,
      title: "Conversaciones 1-a-1",
      description: "Cada residente tiene su propio chat privado",
    },
    {
      icon: BarChart3,
      title: "Dashboard en Tiempo Real",
      description: "Monitorea todo desde un panel web moderno",
    },
  ]

  return (
    <section id="features" className="py-20 sm:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Headline */}
          <h2
            ref={ref}
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-16 text-balance scroll-fade-in ${isVisible ? "visible" : ""}`}
          >
            Características <span className="gradient-text">Poderosas</span>
          </h2>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`gradient-border p-6 hover:scale-105 transition-all duration-300 group scroll-fade-in scroll-fade-in-delay-${(index % 3) + 1} ${isVisible ? "visible" : ""}`}
              >
                <div className="flex flex-col h-full">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon size={24} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
