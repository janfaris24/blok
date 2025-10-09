"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useLanguage } from "@/contexts/language-context"

export function FAQSection() {
  const { t } = useLanguage()

  const faqs = [
    { question: t.faq.questions.q1, answer: t.faq.questions.a1 },
    { question: t.faq.questions.q2, answer: t.faq.questions.a2 },
    { question: t.faq.questions.q3, answer: t.faq.questions.a3 },
    { question: t.faq.questions.q4, answer: t.faq.questions.a4 },
    { question: t.faq.questions.q5, answer: t.faq.questions.a5 },
  ]

  return (
    <section className="py-20 sm:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 text-balance">
            {t.faq.headline}
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
