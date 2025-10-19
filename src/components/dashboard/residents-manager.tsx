'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Home, Key, Phone, Mail, Plus, Pencil, Trash2, X, Upload, CheckSquare, Square } from 'lucide-react';
import { BulkImportResidents } from './bulk-import-residents';
import { useTranslations } from '@/lib/use-translations';
import { toast } from 'sonner';

interface Resident {
  id: string;
  building_id: string;
  type: 'owner' | 'renter';
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  whatsapp_number: string | null;
  preferred_language: 'es' | 'en';
  opted_in_whatsapp: boolean;
  opted_in_email: boolean;
  opted_in_sms: boolean;
  unit_id: string | null;
}

interface Unit {
  id: string;
  unit_number: string;
  floor: number;
}

interface ResidentsManagerProps {
  initialResidents: Resident[];
  units: Unit[];
  buildingId: string;
}

export function ResidentsManager({ initialResidents, units, buildingId }: ResidentsManagerProps) {
  const { t, lang } = useTranslations();
  const [residents, setResidents] = useState(initialResidents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedResidents, setSelectedResidents] = useState<Set<string>>(new Set());
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    type: 'owner' as 'owner' | 'renter',
    unit_id: '',
    preferred_language: 'es' as 'es' | 'en',
    opted_in_whatsapp: true,
    opted_in_sms: false,
  });
  const [bulkEditData, setBulkEditData] = useState({
    type: '' as '' | 'owner' | 'renter',
    unit_id: '',
    preferred_language: '' as '' | 'es' | 'en',
    opted_in_whatsapp: '' as '' | 'true' | 'false',
  });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const owners = residents.filter(r => r.type === 'owner');
  const renters = residents.filter(r => r.type === 'renter');
  const whatsappOptIns = residents.filter(r => r.opted_in_whatsapp);

  const openAddModal = () => {
    setEditingResident(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      type: 'owner',
      unit_id: '',
      preferred_language: 'es',
      opted_in_whatsapp: true,
      opted_in_sms: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (resident: Resident) => {
    setEditingResident(resident);
    setFormData({
      first_name: resident.first_name,
      last_name: resident.last_name,
      email: resident.email,
      phone: resident.phone,
      type: resident.type,
      unit_id: resident.unit_id || '',
      preferred_language: resident.preferred_language,
      opted_in_whatsapp: resident.opted_in_whatsapp,
      opted_in_sms: resident.opted_in_sms,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const residentData = {
        ...formData,
        building_id: buildingId,
        whatsapp_number: formData.phone,
        opted_in_email: true,
        unit_id: formData.unit_id || null,
      };

      if (editingResident) {
        // Update
        const { error } = await supabase
          .from('residents')
          .update(residentData)
          .eq('id', editingResident.id);

        if (error) throw error;

        // Clear this resident from their old unit (if they had one)
        if (editingResident.unit_id) {
          await supabase
            .from('units')
            .update({ owner_id: null })
            .eq('owner_id', editingResident.id);

          await supabase
            .from('units')
            .update({ current_renter_id: null })
            .eq('current_renter_id', editingResident.id);
        }

        // Update unit ownership/renter status for new unit
        if (formData.unit_id) {
          if (formData.type === 'owner') {
            await supabase
              .from('units')
              .update({ owner_id: editingResident.id })
              .eq('id', formData.unit_id);
          } else if (formData.type === 'renter') {
            await supabase
              .from('units')
              .update({ current_renter_id: editingResident.id })
              .eq('id', formData.unit_id);
          }
        }

        setResidents(prev =>
          prev.map(r => r.id === editingResident.id ? { ...r, ...residentData } : r)
        );
      } else {
        // Create
        const { data, error } = await supabase
          .from('residents')
          .insert(residentData)
          .select()
          .single();

        if (error) throw error;

        // Update unit ownership/renter status if unit is assigned
        if (formData.unit_id && data) {
          if (formData.type === 'owner') {
            await supabase
              .from('units')
              .update({ owner_id: data.id })
              .eq('id', formData.unit_id);
          } else if (formData.type === 'renter') {
            await supabase
              .from('units')
              .update({ current_renter_id: data.id })
              .eq('id', formData.unit_id);
          }
        }

        setResidents(prev => [data, ...prev]);
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving resident:', error);
      alert('Error al guardar residente');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este residente?')) return;

    setLoading(true);

    try {
      // First, remove this resident from any units they're associated with
      await supabase
        .from('units')
        .update({ owner_id: null })
        .eq('owner_id', id);

      await supabase
        .from('units')
        .update({ current_renter_id: null })
        .eq('current_renter_id', id);

      // Now delete the resident
      const { error } = await supabase
        .from('residents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setResidents(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting resident:', error);
      alert('Error al eliminar residente. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getUnitNumber = (unitId: string | null) => {
    if (!unitId) return 'N/A';
    const unit = units.find(u => u.id === unitId);
    return unit?.unit_number || 'N/A';
  };

  const handleBulkImportSuccess = async () => {
    // Refresh residents list after successful import
    const { data } = await supabase
      .from('residents')
      .select('*')
      .eq('building_id', buildingId)
      .order('created_at', { ascending: false });

    if (data) {
      setResidents(data);
    }
  };

  // Bulk selection handlers
  const toggleSelectAll = () => {
    if (selectedResidents.size === residents.length) {
      setSelectedResidents(new Set());
    } else {
      setSelectedResidents(new Set(residents.map(r => r.id)));
    }
  };

  const toggleSelectResident = (id: string) => {
    const newSelected = new Set(selectedResidents);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedResidents(newSelected);
  };

  // Bulk edit handler
  const handleBulkEdit = async () => {
    if (selectedResidents.size === 0) {
      toast.error(t('residents.selectFirst'));
      return;
    }

    setLoading(true);

    try {
      // Build updates object (only include non-empty values)
      const updates: any = {};
      if (bulkEditData.type) updates.type = bulkEditData.type;
      if (bulkEditData.unit_id) updates.unit_id = bulkEditData.unit_id === 'null' ? null : bulkEditData.unit_id;
      if (bulkEditData.preferred_language) updates.preferred_language = bulkEditData.preferred_language;
      if (bulkEditData.opted_in_whatsapp) updates.opted_in_whatsapp = bulkEditData.opted_in_whatsapp === 'true';

      if (Object.keys(updates).length === 0) {
        toast.error(t('residents.noChange'));
        setLoading(false);
        return;
      }

      const response = await fetch('/api/residents/bulk-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingId,
          residentIds: Array.from(selectedResidents),
          updates,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update residents');
      }

      toast.success(t('residents.bulkEditSuccess', { count: result.updated }));

      // Refresh residents list
      await handleBulkImportSuccess();

      // Reset
      setSelectedResidents(new Set());
      setBulkEditData({
        type: '',
        unit_id: '',
        preferred_language: '',
        opted_in_whatsapp: '',
      });
      setIsBulkEditOpen(false);
    } catch (error) {
      console.error('Bulk edit error:', error);
      toast.error(t('residents.bulkEditError'));
    } finally {
      setLoading(false);
    }
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedResidents.size === 0) {
      toast.error(t('residents.selectFirst'));
      return;
    }

    if (!confirm(t('residents.confirmBulkDelete', { count: selectedResidents.size }))) {
      return;
    }

    setLoading(true);

    try {
      for (const id of Array.from(selectedResidents)) {
        // First, remove this resident from any units they're associated with
        await supabase
          .from('units')
          .update({ owner_id: null })
          .eq('owner_id', id);

        await supabase
          .from('units')
          .update({ current_renter_id: null })
          .eq('current_renter_id', id);

        // Now delete the resident
        await supabase
          .from('residents')
          .delete()
          .eq('id', id);
      }

      setResidents(prev => prev.filter(r => !selectedResidents.has(r.id)));
      setSelectedResidents(new Set());
      toast.success(t('residents.bulkEditSuccess', { count: selectedResidents.size }));
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error(t('residents.errorDeleting'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">{t('residents.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('residents.manageInfo')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedResidents.size > 0 && (
              <>
                <Button onClick={() => setIsBulkEditOpen(true)} variant="outline" className="gap-2">
                  <Pencil className="w-4 h-4" />
                  {t('residents.bulkEdit')} ({selectedResidents.size})
                </Button>
                <Button onClick={handleBulkDelete} variant="destructive" size="sm" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  {t('residents.deleteSelected')}
                </Button>
              </>
            )}
            <Button onClick={() => setIsBulkImportOpen(true)} variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              {t('residents.bulkImport')}
            </Button>
            <Button onClick={openAddModal} className="gap-2">
              <Plus className="w-4 h-4" />
              {t('residents.addResident')}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                {t('residents.total')}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{residents.length}</p>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Home className="w-4 h-4" />
                {t('residents.owners')}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{owners.length}</p>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Key className="w-4 h-4" />
                {t('residents.renters')}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{renters.length}</p>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                {t('residents.activeWhatsApp')}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{whatsappOptIns.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Residents Table */}
        <Card className="border-border/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">{t('residents.allResidents')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-3 px-3 font-medium text-sm w-10">
                      <button onClick={toggleSelectAll} className="hover:bg-muted p-1 rounded">
                        {selectedResidents.size === residents.length && residents.length > 0 ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-3 font-medium text-sm">{t('residents.name')}</th>
                    <th className="py-3 px-3 font-medium text-sm">{t('residents.type')}</th>
                    <th className="py-3 px-3 font-medium text-sm">{t('residents.unit')}</th>
                    <th className="py-3 px-3 font-medium text-sm">{t('residents.phone')}</th>
                    <th className="py-3 px-3 font-medium text-sm">{t('residents.email')}</th>
                    <th className="py-3 px-3 font-medium text-sm">{t('residents.whatsapp')}</th>
                    <th className="py-3 px-3 font-medium text-sm">{t('residents.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {residents.length > 0 ? (
                    residents.map((resident) => (
                      <tr
                        key={resident.id}
                        className="border-b border-border/40 hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-3">
                          <button onClick={() => toggleSelectResident(resident.id)} className="hover:bg-muted p-1 rounded">
                            {selectedResidents.has(resident.id) ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-3">
                          <div>
                            <p className="font-medium text-sm">
                              {resident.first_name} {resident.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {resident.preferred_language === 'es' ? '🇵🇷 Español' : '🇺🇸 English'}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              resident.type === 'owner'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                            }`}
                          >
                            {t(`residents.${resident.type}`)}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-sm">
                            {getUnitNumber(resident.unit_id)}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 text-sm">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            {resident.phone}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 text-sm truncate max-w-[200px]">
                            <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{resident.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              resident.opted_in_whatsapp
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                          >
                            {resident.opted_in_whatsapp ? `✓ ${t('residents.active')}` : `✗ ${t('residents.inactive')}`}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditModal(resident)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(resident.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground text-sm">
                        {t('residents.noResidents')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b border-border pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {editingResident ? t('residents.editResident') : t('residents.addResident')}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('residents.firstName')}</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                    placeholder="Carlos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('residents.lastName')}</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                    placeholder="Rodríguez"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">{t('residents.email')}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                  placeholder="carlos@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">{t('residents.phone')} / {t('residents.whatsapp')}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                  placeholder="+17871234567"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('residents.type')}</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'owner' | 'renter' })}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                  >
                    <option value="owner">{t('residents.owner')}</option>
                    <option value="renter">{t('residents.renter')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('residents.unit')}</label>
                  <select
                    value={formData.unit_id}
                    onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                  >
                    <option value="">{t('residents.unassigned')}</option>
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.unit_number}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">{t('residents.preferredLanguage')}</label>
                <select
                  value={formData.preferred_language}
                  onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value as 'es' | 'en' })}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                >
                  <option value="es">🇵🇷 Español</option>
                  <option value="en">🇺🇸 English</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="whatsapp"
                  checked={formData.opted_in_whatsapp}
                  onChange={(e) => setFormData({ ...formData, opted_in_whatsapp: e.target.checked })}
                  className="w-4 h-4 rounded border-input"
                />
                <label htmlFor="whatsapp" className="text-sm font-medium">
                  {t('residents.whatsappEnabled')}
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? t('residents.saving') : editingResident ? t('residents.saveChanges') : t('residents.addResident')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  {t('residents.cancel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bulk Edit Dialog */}
      <Dialog open={isBulkEditOpen} onOpenChange={setIsBulkEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('residents.bulkEditTitle')}</DialogTitle>
            <DialogDescription>
              {t('residents.bulkEditDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium">
                {t('residents.selectedResidents', { count: selectedResidents.size })}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">{t('residents.changeType')}</label>
                <select
                  value={bulkEditData.type}
                  onChange={(e) => setBulkEditData({ ...bulkEditData, type: e.target.value as any })}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                >
                  <option value="">{t('residents.noChange')}</option>
                  <option value="owner">{t('residents.owner')}</option>
                  <option value="renter">{t('residents.renter')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">{t('residents.changeUnit')}</label>
                <select
                  value={bulkEditData.unit_id}
                  onChange={(e) => setBulkEditData({ ...bulkEditData, unit_id: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                >
                  <option value="">{t('residents.noChange')}</option>
                  <option value="null">{t('residents.unassigned')}</option>
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.unit_number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">{t('residents.changeLanguage')}</label>
                <select
                  value={bulkEditData.preferred_language}
                  onChange={(e) => setBulkEditData({ ...bulkEditData, preferred_language: e.target.value as any })}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                >
                  <option value="">{t('residents.noChange')}</option>
                  <option value="es">🇵🇷 Español</option>
                  <option value="en">🇺🇸 English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">{t('residents.whatsapp')}</label>
                <select
                  value={bulkEditData.opted_in_whatsapp}
                  onChange={(e) => setBulkEditData({ ...bulkEditData, opted_in_whatsapp: e.target.value as any })}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                >
                  <option value="">{t('residents.noChange')}</option>
                  <option value="true">{t('residents.enableWhatsApp')}</option>
                  <option value="false">{t('residents.disableWhatsApp')}</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsBulkEditOpen(false)} disabled={loading}>
                {t('residents.cancel')}
              </Button>
              <Button onClick={handleBulkEdit} disabled={loading}>
                {loading ? t('residents.applying') : t('residents.applyChanges')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <BulkImportResidents
        buildingId={buildingId}
        open={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSuccess={handleBulkImportSuccess}
      />
    </>
  );
}
