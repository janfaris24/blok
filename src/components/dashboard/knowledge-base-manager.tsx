'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Trash2,
  Edit,
  BookOpen,
  Search,
  Calendar,
  Home,
  TruckIcon,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase-client';

interface KnowledgeEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  priority: number;
  active: boolean;
  created_at: string;
}

interface KnowledgeBaseManagerProps {
  initialEntries: KnowledgeEntry[];
  buildingId: string;
}

const CATEGORIES = [
  { value: 'trash', label: 'Basura', icon: Trash2, color: 'text-orange-600' },
  { value: 'moving', label: 'Mudanzas', icon: TruckIcon, color: 'text-blue-600' },
  { value: 'amenities', label: 'Amenidades', icon: Home, color: 'text-purple-600' },
  { value: 'rules', label: 'Reglas', icon: BookOpen, color: 'text-red-600' },
  { value: 'parking', label: 'Estacionamiento', icon: Calendar, color: 'text-yellow-600' },
  { value: 'maintenance', label: 'Mantenimiento', icon: Clock, color: 'text-green-600' },
  { value: 'general', label: 'General', icon: Search, color: 'text-gray-600' },
];

export function KnowledgeBaseManager({ initialEntries, buildingId }: KnowledgeBaseManagerProps) {
  const [entries, setEntries] = useState<KnowledgeEntry[]>(initialEntries);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const supabase = createClient();

  // Form state
  const [formData, setFormData] = useState({
    category: 'general',
    question: '',
    answer: '',
    keywords: '',
    priority: 0,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('knowledge_base_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'knowledge_base',
          filter: `building_id=eq.${buildingId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setEntries((prev) => [payload.new as KnowledgeEntry, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setEntries((prev) =>
              prev.map((entry) =>
                entry.id === payload.new.id ? (payload.new as KnowledgeEntry) : entry
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setEntries((prev) => prev.filter((entry) => entry.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [buildingId, supabase]);

  const handleOpenDialog = (entry?: KnowledgeEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        category: entry.category,
        question: entry.question,
        answer: entry.answer,
        keywords: entry.keywords.join(', '),
        priority: entry.priority,
      });
    } else {
      setEditingEntry(null);
      setFormData({
        category: 'general',
        question: '',
        answer: '',
        keywords: '',
        priority: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const keywords = formData.keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      keywords,
    };

    try {
      if (editingEntry) {
        // Update
        const response = await fetch('/api/knowledge/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingEntry.id, ...payload }),
        });

        if (!response.ok) throw new Error('Failed to update entry');
        toast.success('Entrada actualizada');
      } else {
        // Create
        const response = await fetch('/api/knowledge/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Failed to create entry');
        toast.success('Entrada creada');
      }

      setIsDialogOpen(false);
      setEditingEntry(null);
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta entrada?')) return;

    try {
      const response = await fetch(`/api/knowledge/delete?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');
      toast.success('Entrada eliminada');
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Error al eliminar');
    }
  };

  const handleToggleActive = async (entry: KnowledgeEntry) => {
    try {
      const response = await fetch('/api/knowledge/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: entry.id, active: !entry.active }),
      });

      if (!response.ok) throw new Error('Failed to toggle');
      toast.success(entry.active ? 'Desactivada' : 'Activada');
    } catch (error) {
      console.error('Error toggling:', error);
      toast.error('Error al actualizar');
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      searchQuery === '' ||
      entry.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <Card className="border-border/40">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar preguntas, respuestas, palabras clave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Agregar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingEntry ? 'Editar Entrada' : 'Nueva Entrada'}
                  </DialogTitle>
                  <DialogDescription>
                    El AI usará esta información para responder preguntas de los residentes
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="question">Pregunta</Label>
                    <Input
                      id="question"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      placeholder="¿Cuándo es el día de basura?"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="answer">Respuesta</Label>
                    <Textarea
                      id="answer"
                      value={formData.answer}
                      onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                      placeholder="El camión de basura pasa los lunes y jueves a las 7:00 AM..."
                      rows={4}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="keywords">Palabras Clave (separadas por comas)</Label>
                    <Input
                      id="keywords"
                      value={formData.keywords}
                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                      placeholder="basura, trash, recoger, camión"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Ayuda al AI a encontrar esta respuesta
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="priority">Prioridad (0-10)</Label>
                    <Input
                      id="priority"
                      type="number"
                      min="0"
                      max="10"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: parseInt(e.target.value) })
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Mayor prioridad = aparece primero
                    </p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">{editingEntry ? 'Actualizar' : 'Crear'}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{entries.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Activas</p>
            <p className="text-2xl font-bold text-green-600">
              {entries.filter((e) => e.active).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Categorías</p>
            <p className="text-2xl font-bold">
              {new Set(entries.map((e) => e.category)).size}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Palabras clave</p>
            <p className="text-2xl font-bold">
              {entries.reduce((acc, e) => acc + e.keywords.length, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Entries List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => {
            const category = CATEGORIES.find((c) => c.value === entry.category);
            const CategoryIcon = category?.icon || BookOpen;

            return (
              <Card
                key={entry.id}
                className={`border-border/40 ${!entry.active ? 'opacity-60' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`w-10 h-10 rounded-lg bg-${category?.color.split('-')[1]}-50 dark:bg-${category?.color.split('-')[1]}-950/20 flex items-center justify-center flex-shrink-0`}
                      >
                        <CategoryIcon className={`w-5 h-5 ${category?.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${category?.color} bg-${category?.color.split('-')[1]}-50 dark:bg-${category?.color.split('-')[1]}-950/20`}
                          >
                            {category?.label}
                          </span>
                          {entry.priority > 0 && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20">
                              ⭐ {entry.priority}
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-sm font-semibold line-clamp-2">
                          {entry.question}
                        </CardTitle>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleActive(entry)}
                      className="flex-shrink-0"
                      title={entry.active ? 'Desactivar' : 'Activar'}
                    >
                      {entry.active ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">{entry.answer}</p>
                  {entry.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {entry.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleOpenDialog(entry)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full">
            <Card className="border-border/40">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-20" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'No se encontraron resultados'
                    : 'No hay entradas todavía. Agrega la primera pregunta y respuesta.'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
