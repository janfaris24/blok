'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  MessageSquare,
  Star,
  Wrench,
  Zap,
  Droplet,
  Wind,
  Paintbrush,
  Key,
  Bug,
  Sparkles,
  Shield,
  Trees,
  Building,
  Waves,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  phone?: string | null;
  whatsapp_number?: string | null;
  email?: string | null;
  description?: string | null;
  rating?: number | null;
  is_recommended: boolean;
  created_at: string;
  updated_at: string;
}

interface ServiceProvidersManagerProps {
  initialProviders: ServiceProvider[];
  maintenanceModel: string;
}

export function ServiceProvidersManager({
  initialProviders,
  maintenanceModel,
}: ServiceProvidersManagerProps) {
  const { t } = useLanguage();

  const CATEGORIES = [
    { value: 'plumber', label: t.providers.categories.plumber, icon: Droplet },
    { value: 'electrician', label: t.providers.categories.electrician, icon: Zap },
    { value: 'handyman', label: t.providers.categories.handyman, icon: Wrench },
    { value: 'ac_technician', label: t.providers.categories.ac_technician, icon: Wind },
    { value: 'washer_dryer_technician', label: t.providers.categories.washer_dryer_technician, icon: Wind },
    { value: 'painter', label: t.providers.categories.painter, icon: Paintbrush },
    { value: 'locksmith', label: t.providers.categories.locksmith, icon: Key },
    { value: 'pest_control', label: t.providers.categories.pest_control, icon: Bug },
    { value: 'cleaning', label: t.providers.categories.cleaning, icon: Sparkles },
    { value: 'security', label: t.providers.categories.security, icon: Shield },
    { value: 'landscaping', label: t.providers.categories.landscaping, icon: Trees },
    { value: 'elevator', label: t.providers.categories.elevator, icon: Building },
    { value: 'pool_maintenance', label: t.providers.categories.pool_maintenance, icon: Waves },
    { value: 'other', label: t.providers.categories.other, icon: Wrench },
  ];
  const [providers, setProviders] = useState<ServiceProvider[]>(initialProviders);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    phone: '',
    whatsapp_number: '',
    email: '',
    description: '',
    rating: '',
    is_recommended: true,
  });

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find((c) => c.value === category);
    return cat ? cat.icon : Wrench;
  };

  const getCategoryLabel = (category: string) => {
    const cat = CATEGORIES.find((c) => c.value === category);
    return cat ? cat.label : category;
  };

  const handleOpenDialog = (provider?: ServiceProvider) => {
    if (provider) {
      setEditingProvider(provider);
      setFormData({
        name: provider.name,
        category: provider.category,
        phone: provider.phone || '',
        whatsapp_number: provider.whatsapp_number || '',
        email: provider.email || '',
        description: provider.description || '',
        rating: provider.rating?.toString() || '',
        is_recommended: provider.is_recommended,
      });
    } else {
      setEditingProvider(null);
      setFormData({
        name: '',
        category: '',
        phone: '',
        whatsapp_number: '',
        email: '',
        description: '',
        rating: '',
        is_recommended: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProvider(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        rating: formData.rating ? parseFloat(formData.rating) : null,
      };

      if (editingProvider) {
        // Update existing provider
        const response = await fetch('/api/service-providers', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProvider.id, ...payload }),
        });

        if (response.ok) {
          const result = await response.json();
          setProviders((prev) =>
            prev.map((p) => (p.id === result.data.id ? result.data : p))
          );
        }
      } else {
        // Create new provider
        const response = await fetch('/api/service-providers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const result = await response.json();
          setProviders((prev) => [...prev, result.data]);
        }
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving provider:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.providers.confirmDelete)) {
      return;
    }

    try {
      const response = await fetch(`/api/service-providers?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProviders((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting provider:', error);
    }
  };

  // Filter providers by selected category
  const filteredProviders = selectedCategory
    ? providers.filter((p) => p.category === selectedCategory)
    : providers;

  // Group providers by category
  const providersByCategory = filteredProviders.reduce((acc, provider) => {
    if (!acc[provider.category]) {
      acc[provider.category] = [];
    }
    acc[provider.category].push(provider);
    return acc;
  }, {} as Record<string, ServiceProvider[]>);

  return (
    <div className="space-y-6">
      {/* Header with filters and add button */}
      <div className="flex items-center justify-between gap-4">
        <Select
          value={selectedCategory || 'all'}
          onValueChange={(value) => setSelectedCategory(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder={t.providers.filterCategory} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.providers.allCategories}</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          {t.providers.addProvider}
        </Button>
      </div>

      {/* Providers grid grouped by category */}
      {Object.keys(providersByCategory).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t.providers.noProviders}</h3>
            <p className="text-muted-foreground mb-4">
              {t.providers.addFirst}
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              {t.providers.addProvider}
            </Button>
          </CardContent>
        </Card>
      ) : (
        Object.entries(providersByCategory).map(([category, categoryProviders]) => {
          const Icon = getCategoryIcon(category);
          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  {getCategoryLabel(category)}
                  <Badge variant="secondary" className="ml-2">
                    {categoryProviders.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className="border border-border/40 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{provider.name}</h4>
                          {provider.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-muted-foreground">
                                {provider.rating}/5
                              </span>
                            </div>
                          )}
                        </div>
                        {provider.is_recommended && (
                          <Badge variant="default" className="text-xs">
                            {t.providers.recommended}
                          </Badge>
                        )}
                      </div>

                      {provider.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {provider.description}
                        </p>
                      )}

                      <div className="space-y-1 text-sm">
                        {provider.whatsapp_number && (
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-3 h-3 text-green-600" />
                            <span className="text-xs">{provider.whatsapp_number}</span>
                          </div>
                        )}
                        {provider.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            <span className="text-xs">{provider.phone}</span>
                          </div>
                        )}
                        {provider.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            <span className="text-xs truncate">{provider.email}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-border/40">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(provider)}
                          className="flex-1"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          {t.common.edit}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(provider.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProvider ? t.providers.editProvider : t.providers.addProvider}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">{t.providers.name} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="category">{t.providers.category} *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.providers.selectCategory} />
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
                <Label htmlFor="whatsapp_number">{t.providers.whatsapp}</Label>
                <Input
                  id="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsapp_number: e.target.value })
                  }
                  placeholder="+1 787 555 1234"
                />
              </div>

              <div>
                <Label htmlFor="phone">{t.providers.phone}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 787 555 1234"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="email">{t.providers.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ejemplo@correo.com"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">{t.providers.description}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Información adicional sobre el proveedor..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="rating">{t.providers.rating} (0-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  placeholder="4.5"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <Checkbox
                  id="is_recommended"
                  checked={formData.is_recommended}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_recommended: checked as boolean })
                  }
                />
                <Label htmlFor="is_recommended" className="cursor-pointer">
                  {t.providers.markRecommended}
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t.providers.saving
                  : editingProvider
                  ? t.providers.update
                  : t.providers.add}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
