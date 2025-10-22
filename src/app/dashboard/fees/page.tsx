'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
  Plus,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface MaintenanceFee {
  id: string;
  unit_id: string;
  amount: number;
  late_fee: number;
  total_amount: number;
  due_date: string;
  paid_date: string | null;
  status: 'pending' | 'paid' | 'late' | 'waived' | 'partial' | 'pending_pickup';
  payment_method: string | null;
  payment_reference: string | null;
  reminder_count: number;
  reminder_sent_at: string | null;
  notes: string | null;
  unit: {
    unit_number: string;
    owner: {
      id: string;
      first_name: string;
      last_name: string;
      whatsapp_number: string;
      email: string;
    };
  };
}

interface FeeTotals {
  total: number;
  pending: number;
  late: number;
  paid: number;
  count: {
    total: number;
    pending: number;
    late: number;
    paid: number;
  };
}

export default function FeesPage() {
  const [fees, setFees] = useState<MaintenanceFee[]>([]);
  const [totals, setTotals] = useState<FeeTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedFee, setSelectedFee] = useState<MaintenanceFee | null>(null);
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);

  // Generate fees dialog state
  const [generateMonth, setGenerateMonth] = useState('');
  const [generateDueDate, setGenerateDueDate] = useState('');
  const [generateAmount, setGenerateAmount] = useState('');

  // Sync owners dialog state
  const [syncMonth, setSyncMonth] = useState('');
  const [syncDueDate, setSyncDueDate] = useState('');
  const [syncAmount, setSyncAmount] = useState('');

  useEffect(() => {
    fetchFees();
  }, [filter]);

  async function fetchFees() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await fetch(`/api/maintenance-fees/list?${params}`);
      if (response.ok) {
        const data = await response.json();
        setFees(data.fees || []);
        setTotals(data.totals || null);
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
      toast.error('Error', {
        description: 'No se pudieron cargar las cuotas',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsPaid() {
    if (!selectedFee) return;

    try {
      const response = await fetch('/api/maintenance-fees/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feeId: selectedFee.id,
          status: 'paid',
          paymentMethod: paymentMethod || null,
          paymentReference: paymentReference || null,
        }),
      });

      if (response.ok) {
        toast.success('Pago registrado', {
          description: `Unidad ${selectedFee.unit.unit_number} marcada como pagada`,
        });
        setMarkPaidDialogOpen(false);
        setPaymentMethod('');
        setPaymentReference('');
        fetchFees();
      } else {
        throw new Error('Failed to update payment');
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
      toast.error('Error', {
        description: 'No se pudo registrar el pago',
      });
    }
  }

  async function handleSendReminder(fee: MaintenanceFee) {
    setSendingReminder(fee.id);
    try {
      const response = await fetch('/api/maintenance-fees/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feeId: fee.id }),
      });

      if (response.ok) {
        toast.success('Recordatorio enviado', {
          description: `WhatsApp enviado a ${fee.unit.owner.first_name} ${fee.unit.owner.last_name}`,
        });
        fetchFees();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send reminder');
      }
    } catch (error: any) {
      console.error('Error sending reminder:', error);
      toast.error('Error', {
        description: error.message || 'No se pudo enviar el recordatorio',
      });
    } finally {
      setSendingReminder(null);
    }
  }

  async function handleGenerateFees() {
    try {
      const response = await fetch('/api/maintenance-fees/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: generateMonth,
          dueDate: generateDueDate,
          defaultAmount: parseFloat(generateAmount),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Cuotas generadas', {
          description: `${data.count} cuotas creadas exitosamente`,
        });
        setGenerateDialogOpen(false);
        setGenerateMonth('');
        setGenerateDueDate('');
        setGenerateAmount('');
        fetchFees();
      } else {
        const error = await response.json();

        // Handle "already exists" error differently
        if (error.error && error.error.includes('already generated')) {
          toast.info('Cuotas ya existen', {
            description: 'Las cuotas para este mes ya fueron generadas. Selecciona otro mes.',
          });
        } else {
          throw new Error(error.error || 'Failed to generate fees');
        }
      }
    } catch (error: any) {
      console.error('Error generating fees:', error);
      toast.error('Error', {
        description: error.message || 'No se pudieron generar las cuotas',
      });
    }
  }

  async function handleSyncOwners() {
    try {
      const response = await fetch('/api/maintenance-fees/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: syncMonth,
          dueDate: syncDueDate,
          defaultAmount: parseFloat(syncAmount),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.added === 0) {
          toast.info('Sin cambios', {
            description: 'Todas las unidades con propietarios ya tienen cuotas.',
          });
        } else {
          toast.success('Propietarios sincronizados', {
            description: `${data.added} nuevas cuotas agregadas: ${data.units.join(', ')}`,
          });
        }
        setSyncDialogOpen(false);
        setSyncMonth('');
        setSyncDueDate('');
        setSyncAmount('');
        fetchFees();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to sync owners');
      }
    } catch (error: any) {
      console.error('Error syncing owners:', error);
      toast.error('Error', {
        description: error.message || 'No se pudieron sincronizar los propietarios',
      });
    }
  }

  const statusConfig = {
    pending: { label: 'Pendiente', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400', icon: Clock },
    paid: { label: 'Pagado', color: 'bg-green-500/10 text-green-600 dark:text-green-400', icon: CheckCircle },
    late: { label: 'Atrasado', color: 'bg-red-500/10 text-red-600 dark:text-red-400', icon: AlertCircle },
    pending_pickup: { label: 'Pendiente Recoger', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400', icon: Clock },
    waived: { label: 'Exonerado', color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400', icon: CheckCircle },
    partial: { label: 'Parcial', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', icon: Clock },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cuotas de Mantenimiento</h1>
          <p className="text-sm text-muted-foreground">Gestiona los pagos mensuales del condominio</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSyncDialogOpen(true)} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Sincronizar Propietarios
          </Button>
          <Button onClick={() => setGenerateDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Generar Cuotas
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {totals && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Total Pendiente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${totals.pending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{totals.count.pending} unidades</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Atrasados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                ${totals.late.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{totals.count.late} unidades</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Cobrado Este Mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${totals.paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{totals.count.paid} pagados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Total General</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totals.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{totals.count.total} cuotas</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todas
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pendientes
          </Button>
          <Button
            variant={filter === 'pending_pickup' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending_pickup')}
            className="gap-1"
          >
            <Clock className="w-3 h-3" />
            Por Recoger
          </Button>
          <Button
            variant={filter === 'late' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('late')}
          >
            Atrasadas
          </Button>
          <Button
            variant={filter === 'paid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('paid')}
          >
            Pagadas
          </Button>
        </div>
      </div>

      {/* Fees Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="p-4 text-xs font-medium text-muted-foreground">Unidad</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground">Propietario</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground">Monto</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground">Vencimiento</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground">Estado</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                      Cargando cuotas...
                    </td>
                  </tr>
                ) : fees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                      No hay cuotas para mostrar
                    </td>
                  </tr>
                ) : (
                  fees.map((fee) => {
                    const status = statusConfig[fee.status];
                    const StatusIcon = status.icon;
                    return (
                      <tr key={fee.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <p className="font-medium">{fee.unit.unit_number}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">
                            {fee.unit.owner.first_name} {fee.unit.owner.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{fee.unit.owner.whatsapp_number}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold">
                            ${fee.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          {fee.late_fee > 0 && (
                            <p className="text-xs text-red-600 dark:text-red-400">
                              +${fee.late_fee.toFixed(2)} cargo
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="text-sm">
                            {new Date(fee.due_date).toLocaleDateString('es-PR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <Badge className={`gap-1 ${status.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </Badge>
                            {fee.notes && fee.status === 'pending_pickup' && (
                              <p className="text-xs text-muted-foreground">{fee.notes}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {fee.status !== 'paid' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedFee(fee);
                                    setMarkPaidDialogOpen(true);
                                  }}
                                >
                                  {fee.status === 'pending_pickup' ? 'Confirmar Recepción' : 'Marcar Pagado'}
                                </Button>
                                {fee.status !== 'pending_pickup' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleSendReminder(fee)}
                                    disabled={sendingReminder === fee.id}
                                    className="gap-2"
                                  >
                                    <Send className="w-3 h-3" />
                                    {sendingReminder === fee.id ? 'Enviando...' : 'Recordar'}
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mark as Paid Dialog */}
      <Dialog open={markPaidDialogOpen} onOpenChange={setMarkPaidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>
              Unidad {selectedFee?.unit.unit_number} - $
              {selectedFee?.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="payment-method">Método de Pago</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Selecciona método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                  <SelectItem value="atm">ATH Móvil</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="payment-ref">Referencia (opcional)</Label>
              <Input
                id="payment-ref"
                placeholder="Número de cheque, confirmación, etc."
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkPaidDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleMarkAsPaid}>Confirmar Pago</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Fees Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generar Cuotas Mensuales</DialogTitle>
            <DialogDescription>Crear cuotas para todas las unidades del condominio</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="month">Mes (YYYY-MM)</Label>
              <Input
                id="month"
                type="month"
                value={generateMonth}
                onChange={(e) => setGenerateMonth(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="due-date">Fecha de Vencimiento</Label>
              <Input
                id="due-date"
                type="date"
                value={generateDueDate}
                onChange={(e) => setGenerateDueDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="amount">Monto Base por Unidad</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="150.00"
                value={generateAmount}
                onChange={(e) => setGenerateAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGenerateFees} disabled={!generateMonth || !generateDueDate || !generateAmount}>
              Generar Cuotas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sync Owners Dialog */}
      <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sincronizar Propietarios</DialogTitle>
            <DialogDescription>
              Agrega cuotas para nuevos propietarios que no tienen registro en el mes seleccionado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sync-month">Mes (YYYY-MM)</Label>
              <Input
                id="sync-month"
                type="month"
                value={syncMonth}
                onChange={(e) => setSyncMonth(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sync-due-date">Fecha de Vencimiento</Label>
              <Input
                id="sync-due-date"
                type="date"
                value={syncDueDate}
                onChange={(e) => setSyncDueDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sync-amount">Monto Base por Unidad</Label>
              <Input
                id="sync-amount"
                type="number"
                step="0.01"
                placeholder="150.00"
                value={syncAmount}
                onChange={(e) => setSyncAmount(e.target.value)}
              />
            </div>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-3">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>¿Cuándo usar esto?</strong> Si cambias un inquilino a propietario, usa esta función para
                agregar su cuota al mes actual sin duplicar las existentes.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSyncDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSyncOwners} disabled={!syncMonth || !syncDueDate || !syncAmount}>
              Sincronizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
