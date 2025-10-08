"use client"

export function StatsSection() {
  const stats = [
    { value: "<2", suffix: " segundos", label: "Tiempo de respuesta promedio" },
    { value: "85", suffix: "%+", label: "Precisión de IA" },
    { value: "10", suffix: "+ horas", label: "Ahorradas por admin/semana" },
    { value: "80", suffix: "%+", label: "Tasa de adopción de residentes" },
  ]

  return (
    <section className="py-20 sm:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
            {stats.map((stat, index) => (
              <div key={index} className="text-center flex flex-col items-center justify-start">
                <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2 flex-shrink-0 min-h-[3rem] flex items-center justify-center">
                  {stat.value}
                  {stat.suffix}
                </div>
                <p className="text-muted-foreground text-sm sm:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
