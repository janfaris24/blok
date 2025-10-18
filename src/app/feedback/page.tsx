"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "propietario",
    building: "Condominio Puerta Real",
    unit: "",
    clarity: "",
    usefulness: "",
    likelihood: "",
    concerns: "",
    suggestions: "",
    interested: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert("Hubo un error. Por favor intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Hubo un error. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <Card className="max-w-md w-full border-0 sm:border shadow-lg">
          <CardContent className="pt-8 sm:pt-10 pb-8 px-6 sm:px-8 text-center">
            <CheckCircle2 className="w-20 h-20 sm:w-24 sm:h-24 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">¡Gracias por tu feedback!</h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed">
              Tu opinión es muy valiosa para nosotros. Estaremos en contacto pronto.
            </p>
            <Button onClick={() => window.location.href = "/"} className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold">
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-12 px-3 sm:px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-3xl mx-auto">
        <Card className="border-0 sm:border shadow-lg">
          <CardHeader className="space-y-3 pb-4 sm:pb-6">
            <CardTitle className="text-2xl sm:text-3xl leading-tight">Feedback - Blok</CardTitle>
            <CardDescription className="text-sm sm:text-base leading-relaxed">
              Ayúdanos a mejorar Blok con tu opinión. Todas tus respuestas son confidenciales y nos ayudarán a crear un mejor producto para nuestra comunidad.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Personal Info */}
              <div className="space-y-4 p-4 sm:p-5 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100">Información Personal</h3>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Tu nombre completo"
                    className="h-12 text-base bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tu@email.com"
                    className="h-12 text-base bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono *</Label>
                  <Input
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="787-123-4567"
                    className="h-12 text-base bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
                    type="tel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-300">Eres: *</Label>
                  <select
                    id="role"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full h-12 px-4 text-base text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                  >
                    <option value="propietario">Propietario</option>
                    <option value="inquilino">Inquilino</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="building" className="text-sm font-medium text-gray-700 dark:text-gray-300">Condominio *</Label>
                  <select
                    id="building"
                    required
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    className="w-full h-12 px-4 text-base text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                  >
                    <option value="Condominio Puerta Real">Condominio Puerta Real</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-sm font-medium text-gray-700 dark:text-gray-300">Número de Apartamento</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Ej: 500"
                    className="h-12 text-base bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  />
                </div>
              </div>

              {/* Feedback Questions */}
              <div className="space-y-5 sm:space-y-6">
                <h3 className="font-semibold text-base sm:text-lg pt-2 text-gray-900 dark:text-gray-100">Sobre la Página Web</h3>

                <div className="space-y-2">
                  <Label htmlFor="clarity" className="text-sm font-medium leading-relaxed text-gray-700 dark:text-gray-300">¿Qué tan clara es la explicación de Blok? *</Label>
                  <select
                    id="clarity"
                    required
                    value={formData.clarity}
                    onChange={(e) => setFormData({ ...formData, clarity: e.target.value })}
                    className="w-full h-12 px-4 text-base text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="5">⭐⭐⭐⭐⭐ Muy clara</option>
                    <option value="4">⭐⭐⭐⭐ Clara</option>
                    <option value="3">⭐⭐⭐ Neutral</option>
                    <option value="2">⭐⭐ Confusa</option>
                    <option value="1">⭐ Muy confusa</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usefulness" className="text-sm font-medium leading-relaxed text-gray-700 dark:text-gray-300">¿Qué tan útil sería Blok para nuestro condominio? *</Label>
                  <select
                    id="usefulness"
                    required
                    value={formData.usefulness}
                    onChange={(e) => setFormData({ ...formData, usefulness: e.target.value })}
                    className="w-full h-12 px-4 text-base text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="5">⭐⭐⭐⭐⭐ Extremadamente útil</option>
                    <option value="4">⭐⭐⭐⭐ Muy útil</option>
                    <option value="3">⭐⭐⭐ Algo útil</option>
                    <option value="2">⭐⭐ Poco útil</option>
                    <option value="1">⭐ Nada útil</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="likelihood" className="text-sm font-medium leading-relaxed text-gray-700 dark:text-gray-300">¿Qué probabilidad hay de que recomiendes Blok a la junta? *</Label>
                  <select
                    id="likelihood"
                    required
                    value={formData.likelihood}
                    onChange={(e) => setFormData({ ...formData, likelihood: e.target.value })}
                    className="w-full h-12 px-4 text-base text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                  >
                    <option value="">Selecciona una opción (0-10)</option>
                    <option value="10">10 - Muy probable</option>
                    <option value="9">9</option>
                    <option value="8">8</option>
                    <option value="7">7</option>
                    <option value="6">6</option>
                    <option value="5">5 - Neutral</option>
                    <option value="4">4</option>
                    <option value="3">3</option>
                    <option value="2">2</option>
                    <option value="1">1</option>
                    <option value="0">0 - Nada probable</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="concerns" className="text-sm font-medium text-gray-700 dark:text-gray-300">¿Tienes alguna preocupación o duda sobre Blok?</Label>
                  <Textarea
                    id="concerns"
                    value={formData.concerns}
                    onChange={(e) => setFormData({ ...formData, concerns: e.target.value })}
                    placeholder="Comparte cualquier preocupación..."
                    rows={4}
                    className="text-base resize-none bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="suggestions" className="text-sm font-medium text-gray-700 dark:text-gray-300">¿Qué mejorarías o añadirías?</Label>
                  <Textarea
                    id="suggestions"
                    value={formData.suggestions}
                    onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
                    placeholder="Tus sugerencias son importantes..."
                    rows={4}
                    className="text-base resize-none bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interested" className="text-sm font-medium leading-relaxed text-gray-700 dark:text-gray-300">¿Estarías interesado en probar Blok gratis por 30 días? *</Label>
                  <select
                    id="interested"
                    required
                    value={formData.interested}
                    onChange={(e) => setFormData({ ...formData, interested: e.target.value })}
                    className="w-full h-12 px-4 text-base text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="yes">✅ Sí, me interesa</option>
                    <option value="maybe">🤔 Tal vez</option>
                    <option value="no">❌ No por ahora</option>
                  </select>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold" disabled={loading}>
                {loading ? "Enviando..." : "Enviar Feedback"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
