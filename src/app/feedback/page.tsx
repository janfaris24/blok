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
    unit: "",
    clarity: "",
    usefulness: "",
    pricing: "",
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">¡Gracias por tu feedback!</h2>
            <p className="text-muted-foreground mb-6">
              Tu opinión es muy valiosa para nosotros. Estaremos en contacto pronto.
            </p>
            <Button onClick={() => window.location.href = "/"} className="w-full">
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Feedback - Blok</CardTitle>
            <CardDescription className="text-base">
              Ayúdanos a mejorar Blok con tu opinión. Todas tus respuestas son confidenciales y nos ayudarán a crear un mejor producto para nuestra comunidad.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg">Información Personal</h3>

                <div>
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="787-123-4567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">Eres: *</Label>
                  <select
                    id="role"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="propietario">Propietario</option>
                    <option value="inquilino">Inquilino</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="unit">Número de Apartamento</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Ej: 504"
                  />
                </div>
              </div>

              {/* Feedback Questions */}
              <div className="space-y-6">
                <h3 className="font-semibold text-lg">Sobre la Página Web</h3>

                <div className="space-y-2">
                  <Label htmlFor="clarity">¿Qué tan clara es la explicación de Blok? *</Label>
                  <select
                    id="clarity"
                    required
                    value={formData.clarity}
                    onChange={(e) => setFormData({ ...formData, clarity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <Label htmlFor="usefulness">¿Qué tan útil sería Blok para nuestro condominio? *</Label>
                  <select
                    id="usefulness"
                    required
                    value={formData.usefulness}
                    onChange={(e) => setFormData({ ...formData, usefulness: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <Label htmlFor="pricing">¿Qué opinas del precio ($19-99/mes según tamaño)? *</Label>
                  <select
                    id="pricing"
                    required
                    value={formData.pricing}
                    onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="cheap">💰 Económico / Buen valor</option>
                    <option value="fair">✅ Precio justo</option>
                    <option value="expensive">💸 Algo caro</option>
                    <option value="too-expensive">🚫 Demasiado caro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="likelihood">¿Qué probabilidad hay de que recomiendes Blok a la junta? *</Label>
                  <select
                    id="likelihood"
                    required
                    value={formData.likelihood}
                    onChange={(e) => setFormData({ ...formData, likelihood: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                <div>
                  <Label htmlFor="concerns">¿Tienes alguna preocupación o duda sobre Blok?</Label>
                  <Textarea
                    id="concerns"
                    value={formData.concerns}
                    onChange={(e) => setFormData({ ...formData, concerns: e.target.value })}
                    placeholder="Comparte cualquier preocupación..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="suggestions">¿Qué mejorarías o añadirías?</Label>
                  <Textarea
                    id="suggestions"
                    value={formData.suggestions}
                    onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
                    placeholder="Tus sugerencias son importantes..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interested">¿Estarías interesado en probar Blok gratis por 30 días? *</Label>
                  <select
                    id="interested"
                    required
                    value={formData.interested}
                    onChange={(e) => setFormData({ ...formData, interested: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="yes">✅ Sí, me interesa</option>
                    <option value="maybe">🤔 Tal vez</option>
                    <option value="no">❌ No por ahora</option>
                  </select>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar Feedback"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
