"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQSection() {
  const faqs = [
    {
      question: "¿Cómo funciona la prueba gratis?",
      answer:
        "Obtienes acceso completo a todas las funciones de Blok por 30 días sin necesidad de tarjeta de crédito. Puedes cancelar en cualquier momento.",
    },
    {
      question: "¿Necesito un número de WhatsApp Business?",
      answer:
        "No, nosotros te proporcionamos un número de WhatsApp Business dedicado para tu condominio como parte del servicio.",
    },
    {
      question: "¿Qué pasa si la IA no puede responder?",
      answer:
        "Si la IA no está segura de cómo responder, automáticamente notifica al administrador para que intervenga. Siempre tienes control total.",
    },
    {
      question: "¿Cómo subo a mis residentes?",
      answer:
        "Puedes importar una lista de residentes con sus números de WhatsApp, o ellos pueden registrarse enviando un mensaje al número de Blok.",
    },
    {
      question: "¿Funciona con email y SMS también?",
      answer: "Sí, los planes Premium y Enterprise incluyen soporte para SMS y email además de WhatsApp.",
    },
    {
      question: "¿Puedo cancelar en cualquier momento?",
      answer:
        "Absolutamente. No hay contratos a largo plazo. Puedes cancelar tu suscripción en cualquier momento desde el dashboard.",
    },
  ]

  return (
    <section className="py-20 sm:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 text-balance">
            Preguntas <span className="gradient-text">Frecuentes</span>
          </h2>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="gradient-border px-6">
                <AccordionTrigger className="text-left text-foreground hover:text-primary">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
