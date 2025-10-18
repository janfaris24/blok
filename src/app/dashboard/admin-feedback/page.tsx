"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Filter, Star, TrendingUp, Users, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Feedback {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: string;
  building: string | null;
  unit: string | null;
  clarity_rating: number;
  usefulness_rating: number;
  nps_score: number;
  concerns: string | null;
  suggestions: string | null;
  interested: string;
  submitted_at: string;
  created_at: string;
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "interested" | "maybe" | "no">("all");

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
    } catch (error) {
      console.error("Error loading feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedback = feedback.filter((item) => {
    if (filter === "all") return true;
    return item.interested === filter;
  });

  const stats = {
    total: feedback.length,
    avgClarity: (feedback.reduce((sum, f) => sum + f.clarity_rating, 0) / feedback.length).toFixed(1),
    avgUsefulness: (feedback.reduce((sum, f) => sum + f.usefulness_rating, 0) / feedback.length).toFixed(1),
    avgNPS: (feedback.reduce((sum, f) => sum + f.nps_score, 0) / feedback.length).toFixed(1),
    interested: feedback.filter((f) => f.interested === "yes").length,
    maybe: feedback.filter((f) => f.interested === "maybe").length,
    no: feedback.filter((f) => f.interested === "no").length,
  };

  const exportToDocument = () => {
    const doc = generateDocument(filteredFeedback, stats);
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-report-${new Date().toISOString().split("T")[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateDocument = (data: Feedback[], stats: any) => {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte de Feedback - Blok</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f9fafb;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
    }
    .header h1 { margin: 0 0 10px 0; font-size: 32px; }
    .header p { margin: 0; opacity: 0.9; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .stat-card h3 { margin: 0 0 8px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; }
    .stat-card p { margin: 0; font-size: 28px; font-weight: bold; color: #1f2937; }
    .feedback-item {
      background: white;
      padding: 24px;
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .feedback-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e5e7eb;
    }
    .feedback-header h3 { margin: 0; font-size: 18px; }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-yes { background: #d1fae5; color: #065f46; }
    .badge-maybe { background: #fef3c7; color: #92400e; }
    .badge-no { background: #fee2e2; color: #991b1b; }
    .ratings {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin: 16px 0;
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
    }
    .rating { text-align: center; }
    .rating-label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
    .rating-value { font-size: 24px; font-weight: bold; color: #1f2937; }
    .stars { color: #fbbf24; }
    .section { margin: 16px 0; }
    .section-label { font-weight: 600; color: #374151; margin-bottom: 8px; }
    .section-content { color: #6b7280; line-height: 1.6; }
    .meta { font-size: 12px; color: #9ca3af; margin-top: 12px; }
    @media print {
      body { background: white; }
      .feedback-item { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Reporte de Feedback - Blok</h1>
    <p>Generado el ${new Date().toLocaleDateString("es-PR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })}</p>
  </div>

  <div class="stats">
    <div class="stat-card">
      <h3>Total Respuestas</h3>
      <p>${stats.total}</p>
    </div>
    <div class="stat-card">
      <h3>Claridad Promedio</h3>
      <p>${stats.avgClarity} <span class="stars">⭐</span></p>
    </div>
    <div class="stat-card">
      <h3>Utilidad Promedio</h3>
      <p>${stats.avgUsefulness} <span class="stars">⭐</span></p>
    </div>
    <div class="stat-card">
      <h3>NPS Promedio</h3>
      <p>${stats.avgNPS}/10</p>
    </div>
    <div class="stat-card">
      <h3>Interesados</h3>
      <p>${stats.interested} ✅</p>
    </div>
    <div class="stat-card">
      <h3>Tal Vez</h3>
      <p>${stats.maybe} 🤔</p>
    </div>
  </div>

  <h2 style="margin-bottom: 20px;">Respuestas Detalladas</h2>

  ${data.map(item => `
    <div class="feedback-item">
      <div class="feedback-header">
        <div>
          <h3>${item.name}</h3>
          <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">
            ${item.role === "propietario" ? "👤 Propietario" : "🏠 Inquilino"}
            ${item.building ? ` • 🏢 ${item.building}` : ""}
            ${item.unit ? ` • Apt ${item.unit}` : ""}
          </p>
        </div>
        <span class="badge badge-${item.interested}">
          ${item.interested === "yes" ? "✅ Interesado" : item.interested === "maybe" ? "🤔 Tal vez" : "❌ No por ahora"}
        </span>
      </div>

      <div class="ratings">
        <div class="rating">
          <div class="rating-label">Claridad</div>
          <div class="rating-value">${item.clarity_rating} <span class="stars">⭐</span></div>
        </div>
        <div class="rating">
          <div class="rating-label">Utilidad</div>
          <div class="rating-value">${item.usefulness_rating} <span class="stars">⭐</span></div>
        </div>
        <div class="rating">
          <div class="rating-label">NPS</div>
          <div class="rating-value">${item.nps_score}/10</div>
        </div>
      </div>

      ${item.concerns ? `
        <div class="section">
          <div class="section-label">💭 Preocupaciones o Dudas</div>
          <div class="section-content">${item.concerns}</div>
        </div>
      ` : ""}

      ${item.suggestions ? `
        <div class="section">
          <div class="section-label">💡 Sugerencias</div>
          <div class="section-content">${item.suggestions}</div>
        </div>
      ` : ""}

      <div class="meta">
        📧 ${item.email || "No proporcionado"} • 📱 ${item.phone} • 📅 ${new Date(item.submitted_at).toLocaleString("es-PR")}
      </div>
    </div>
  `).join("")}

  <div style="margin-top: 40px; padding: 20px; background: white; border-radius: 8px; text-align: center; color: #6b7280;">
    <p>Documento generado por <strong>Blok</strong> • blokpr.co</p>
  </div>
</body>
</html>
    `;
  };

  const getRatingColor = (rating: number, max: number = 5) => {
    const percentage = (rating / max) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getInterestBadge = (interested: string) => {
    switch (interested) {
      case "yes":
        return <Badge className="bg-green-100 text-green-800">✅ Sí, me interesa</Badge>;
      case "maybe":
        return <Badge className="bg-yellow-100 text-yellow-800">🤔 Tal vez</Badge>;
      case "no":
        return <Badge className="bg-red-100 text-red-800">❌ No por ahora</Badge>;
      default:
        return <Badge>-</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando feedback...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">📊 Feedback - Admin</h1>
          <p className="text-muted-foreground">
            Revisa y exporta el feedback de los residentes interesados en Blok
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Respuestas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Star className="w-4 h-4" />
                Claridad Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.avgClarity} ⭐</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Utilidad Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.avgUsefulness} ⭐</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                NPS Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.avgNPS}/10</p>
            </CardContent>
          </Card>
        </div>

        {/* Interest Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Interés en Probar Blok</CardTitle>
            <CardDescription>Distribución de interés de los residentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{stats.interested}</p>
                <p className="text-sm text-muted-foreground">✅ Interesados</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-3xl font-bold text-yellow-600">{stats.maybe}</p>
                <p className="text-sm text-muted-foreground">🤔 Tal vez</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-3xl font-bold text-red-600">{stats.no}</p>
                <p className="text-sm text-muted-foreground">❌ No por ahora</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              size="sm"
            >
              Todos ({feedback.length})
            </Button>
            <Button
              variant={filter === "interested" ? "default" : "outline"}
              onClick={() => setFilter("interested")}
              size="sm"
            >
              Interesados ({stats.interested})
            </Button>
            <Button
              variant={filter === "maybe" ? "default" : "outline"}
              onClick={() => setFilter("maybe")}
              size="sm"
            >
              Tal vez ({stats.maybe})
            </Button>
            <Button
              variant={filter === "no" ? "default" : "outline"}
              onClick={() => setFilter("no")}
              size="sm"
            >
              No ({stats.no})
            </Button>
          </div>

          <Button onClick={exportToDocument} className="gap-2">
            <Download className="w-4 h-4" />
            Exportar Reporte
          </Button>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedback.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{item.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {item.role === "propietario" ? "👤 Propietario" : "🏠 Inquilino"}
                      {item.building && ` • 🏢 ${item.building}`}
                      {item.unit && ` • Apt ${item.unit}`}
                    </CardDescription>
                  </div>
                  {getInterestBadge(item.interested)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Ratings */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Claridad</p>
                    <p className={`text-2xl font-bold ${getRatingColor(item.clarity_rating)}`}>
                      {item.clarity_rating} ⭐
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Utilidad</p>
                    <p className={`text-2xl font-bold ${getRatingColor(item.usefulness_rating)}`}>
                      {item.usefulness_rating} ⭐
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">NPS</p>
                    <p className={`text-2xl font-bold ${getRatingColor(item.nps_score, 10)}`}>
                      {item.nps_score}/10
                    </p>
                  </div>
                </div>

                {/* Concerns */}
                {item.concerns && (
                  <div>
                    <h4 className="font-semibold mb-2">💭 Preocupaciones o Dudas</h4>
                    <p className="text-muted-foreground">{item.concerns}</p>
                  </div>
                )}

                {/* Suggestions */}
                {item.suggestions && (
                  <div>
                    <h4 className="font-semibold mb-2">💡 Sugerencias</h4>
                    <p className="text-muted-foreground">{item.suggestions}</p>
                  </div>
                )}

                {/* Meta */}
                <div className="text-xs text-muted-foreground pt-2 border-t flex items-center gap-4">
                  <span>📧 {item.email || "No proporcionado"}</span>
                  <span>📱 {item.phone}</span>
                  <span>📅 {new Date(item.submitted_at).toLocaleString("es-PR")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFeedback.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No hay feedback para mostrar con este filtro.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
