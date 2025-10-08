'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Plus, Zap, Home, Users, Trash2, Pencil } from 'lucide-react';

interface Building {
  id: string;
  name: string;
  address: string;
  city?: string;
  whatsapp_business_number?: string;
}

interface Unit {
  id: string;
  unit_number: string;
  floor: number;
  owner?: { first_name: string; last_name: string } | null;
  renter?: { first_name: string; last_name: string } | null;
}

interface BuildingManagerProps {
  building: Building;
  initialUnits: Unit[];
}

export function BuildingManager({ building, initialUnits }: BuildingManagerProps) {
  const [units, setUnits] = useState(initialUnits);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [bulkData, setBulkData] = useState({
    floors: 8,
    unitsPerFloor: 12,
    startFloor: 1,
  });
  const [editData, setEditData] = useState({
    name: building.name,
    address: building.address,
    city: building.city || 'San Juan',
    whatsapp_business_number: building.whatsapp_business_number || '',
  });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleBulkCreate = async () => {
    setLoading(true);

    try {
      const newUnits = [];

      for (let floor = bulkData.startFloor; floor < bulkData.startFloor + bulkData.floors; floor++) {
        for (let unitNum = 1; unitNum <= bulkData.unitsPerFloor; unitNum++) {
          // Format: 301, 302, ... (floor + unit number)
          const unitNumber = `${floor}${unitNum.toString().padStart(2, '0')}`;

          newUnits.push({
            building_id: building.id,
            unit_number: unitNumber,
            floor: floor,
          });
        }
      }

      const { data, error } = await supabase
        .from('units')
        .insert(newUnits)
        .select();

      if (error) throw error;

      setUnits(prev => [...prev, ...data]);
      setShowBulkModal(false);
      alert(`✅ ${newUnits.length} unidades creadas exitosamente!`);
      window.location.reload();
    } catch (error: any) {
      console.error('Error creating units:', error);
      if (error.code === '23505') {
        alert('Error: Algunas unidades ya existen. Usa "Eliminar Todas las Unidades" primero si quieres empezar de nuevo.');
      } else {
        alert('Error al crear unidades. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllUnits = async () => {
    if (!confirm('⚠️ ¿Estás seguro? Esto eliminará TODAS las unidades del edificio. Esta acción no se puede deshacer.')) {
      return;
    }

    if (!confirm('¿REALMENTE seguro? Se perderán todas las asociaciones con residentes.')) {
      return;
    }

    setLoading(true);

    try {
      // First, clear unit references from residents
      await supabase
        .from('residents')
        .update({ unit_id: null })
        .eq('building_id', building.id);

      // Now delete all units
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('building_id', building.id);

      if (error) throw error;

      setUnits([]);
      alert('✅ Todas las unidades han sido eliminadas');
    } catch (error) {
      console.error('Error deleting units:', error);
      alert('Error al eliminar unidades. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBuilding = async () => {
    if (!editData.name.trim() || !editData.address.trim()) {
      alert('Nombre y dirección son requeridos');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/building/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar');
      }

      alert('✅ Información del edificio actualizada');
      setShowEditModal(false);
      window.location.reload();
    } catch (error: any) {
      console.error('Error updating building:', error);
      alert(error.message || 'Error al actualizar el edificio');
    } finally {
      setLoading(false);
    }
  };

  const groupedUnits: { [floor: number]: Unit[] } = {};
  units.forEach(unit => {
    if (!groupedUnits[unit.floor]) {
      groupedUnits[unit.floor] = [];
    }
    groupedUnits[unit.floor].push(unit);
  });

  const floors = Object.keys(groupedUnits)
    .map(Number)
    .sort((a, b) => b - a); // Descending order

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold mb-1">Edificio</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona las unidades de {building.name}
          </p>
        </div>

        {/* Building Info */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="w-4 h-4" />
                Información del Edificio
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
                className="gap-2"
              >
                <Pencil className="w-3 h-3" />
                Editar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Nombre</p>
                <p className="text-sm font-semibold">{building.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Dirección</p>
                <p className="text-sm font-semibold">{building.address}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ciudad</p>
                <p className="text-sm font-semibold">{building.city || 'San Juan'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">WhatsApp Business</p>
                <p className="text-sm font-semibold">{building.whatsapp_business_number || 'No configurado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Home className="w-4 h-4" />
                Total Unidades
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{units.length}</p>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="w-4 h-4" />
                Pisos
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{floors.length}</p>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                Ocupadas
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {units.filter(u => u.owner || u.renter).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => setShowBulkModal(true)}
            className="gap-2"
          >
            <Zap className="w-4 h-4" />
            Crear Unidades en Masa
          </Button>
          {units.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleDeleteAllUnits}
              disabled={loading}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar Todas las Unidades
            </Button>
          )}
        </div>

        {/* Units by Floor */}
        {floors.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-base font-bold">Unidades por Piso</h2>
            {floors.map(floor => (
              <Card key={floor} className="border-border/40">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Piso {floor}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {groupedUnits[floor].length} unidades
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {groupedUnits[floor].map(unit => {
                      const hasOwner = !!unit.owner;
                      const hasRenter = !!unit.renter;

                      return (
                        <div
                          key={unit.id}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            hasRenter
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                              : hasOwner
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                              : 'border-gray-300 dark:border-gray-700'
                          }`}
                        >
                          <p className="font-bold text-sm mb-1">{unit.unit_number}</p>
                          {hasOwner && (
                            <p className="text-xs text-muted-foreground truncate">
                              👤 {unit.owner!.first_name} {unit.owner!.last_name}
                            </p>
                          )}
                          {hasRenter && (
                            <p className="text-xs text-muted-foreground truncate">
                              🔑 {unit.renter!.first_name} {unit.renter!.last_name}
                            </p>
                          )}
                          {!hasOwner && !hasRenter && (
                            <p className="text-xs text-muted-foreground">Disponible</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/40">
            <CardContent className="py-8 text-center">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-20" />
              <p className="text-sm text-muted-foreground mb-3">
                No hay unidades creadas todavía
              </p>
              <Button onClick={() => setShowBulkModal(true)} className="gap-2">
                <Zap className="w-4 h-4" />
                Crear Unidades Ahora
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Building Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Información del Edificio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                placeholder="Ej: Condominio Vista Verde"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección *</Label>
              <Input
                id="address"
                value={editData.address}
                onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                placeholder="Ej: Calle Principal #123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={editData.city}
                onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                placeholder="Ej: San Juan"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Business</Label>
              <Input
                id="whatsapp"
                value={editData.whatsapp_business_number}
                onChange={(e) => setEditData({ ...editData, whatsapp_business_number: e.target.value })}
                placeholder="Ej: +1787XXXXXXX"
              />
              <p className="text-xs text-muted-foreground">
                Formato: +1787XXXXXXX (incluye código de país)
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleUpdateBuilding}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Creation Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Crear Unidades en Masa
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Crea múltiples unidades automáticamente
              </p>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Número de Pisos
                </label>
                <input
                  type="number"
                  value={bulkData.floors}
                  onChange={(e) => setBulkData({ ...bulkData, floors: parseInt(e.target.value) || 1 })}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-semibold"
                  min="1"
                  max="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Unidades por Piso
                </label>
                <input
                  type="number"
                  value={bulkData.unitsPerFloor}
                  onChange={(e) => setBulkData({ ...bulkData, unitsPerFloor: parseInt(e.target.value) || 1 })}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-semibold"
                  min="1"
                  max="20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Piso Inicial
                </label>
                <input
                  type="number"
                  value={bulkData.startFloor}
                  onChange={(e) => setBulkData({ ...bulkData, startFloor: parseInt(e.target.value) || 1 })}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-semibold"
                  min="1"
                  max="50"
                />
              </div>

              {/* Preview */}
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm font-medium mb-1">Vista Previa:</p>
                <p className="text-sm">
                  Se crearán <span className="font-bold text-primary">{bulkData.floors * bulkData.unitsPerFloor}</span> unidades
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ejemplo: {bulkData.startFloor}01, {bulkData.startFloor}02, ... {bulkData.startFloor + bulkData.floors - 1}{bulkData.unitsPerFloor.toString().padStart(2, '0')}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleBulkCreate}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Creando...' : `Crear ${bulkData.floors * bulkData.unitsPerFloor} Unidades`}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowBulkModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
