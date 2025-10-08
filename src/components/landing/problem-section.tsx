"use client"

import { MessageSquareX, Megaphone, Wrench } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export function ProblemSection() {
  const { ref, isVisible } = useScrollAnimation()

  const problems = [
    {
      icon: MessageSquareX,
      title: "Grupos de WhatsApp fragmentados",
      description: "Residentes perdidos en múltiples chats sin organización",
    },
    {
      icon: Megaphone,
      title: "Anuncios importantes que nadie ve",
      description: "Mensajes críticos enterrados en conversaciones",
    },
    {
      icon: Wrench,
      title: "Reportes de mantenimiento perdidos",
      description: "Solicitudes perdidas en chats sin seguimiento",
    },
  ]

  return (
    <section className="py-20 sm:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Headline */}
          <h2
            ref={ref}
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-16 text-balance scroll-fade-in ${isVisible ? "visible" : ""}`}
          >
            La Comunicación de Condominios es un <span className="gradient-text">Caos</span>
          </h2>

          {/* Problem Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {problems.map((problem, index) => (
              <div
                key={index}
                className={`gradient-border p-6 hover:scale-105 transition-transform duration-300 scroll-fade-in scroll-fade-in-delay-${index + 1} ${isVisible ? "visible" : ""}`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <problem.icon size={32} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{problem.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{problem.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
