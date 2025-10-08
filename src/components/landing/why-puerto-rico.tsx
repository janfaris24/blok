import { MessageSquare, Languages, MapPin } from "lucide-react"

export function WhyPuertoRico() {
  const reasons = [
    {
      icon: MessageSquare,
      emoji: "🇵🇷",
      title: "WhatsApp Primero",
      description: "El canal #1 en PR",
    },
    {
      icon: Languages,
      emoji: "🗣️",
      title: "Español Nativo",
      description: "IA entrenada en español caribeño",
    },
    {
      icon: MapPin,
      emoji: "🏝️",
      title: "Local",
      description: "Entendemos la cultura de condominios boricuas",
    },
  ]

  return (
    <section className="py-20 sm:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-16 text-balance">
            Hecho para <span className="gradient-text">Puerto Rico</span>
          </h2>

          {/* Reasons */}
          <div className="grid md:grid-cols-3 gap-8">
            {reasons.map((reason, index) => (
              <div key={index} className="text-center">
                <div className="text-6xl mb-4">{reason.emoji}</div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{reason.title}</h3>
                <p className="text-muted-foreground">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
