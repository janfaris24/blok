'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Megaphone, Users, Home, Key, Send, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Unit {
  id: string;
  unit_number: string;
}

interface BroadcastComposerProps {
  buildingId: string;
  units: Unit[];
  onBroadcastSent?: () => void;
}

export function BroadcastComposer({ buildingId, units, onBroadcastSent }: BroadcastComposerProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'owners' | 'renters' | 'specific_units'>('all');
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(true);
  const [sendViaEmail, setSendViaEmail] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleCreate = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Campos requeridos', {
        description: 'Por favor completa el asunto y mensaje',
      });
      return;
    }

    if (targetAudience === 'specific_units' && selectedUnits.length === 0) {
      toast.error('Unidades requeridas', {
        description: 'Selecciona al menos una unidad para enviar el anuncio',
      });
      return;
    }

    if (!sendViaWhatsApp && !sendViaEmail) {
      toast.error('Canal requerido', {
        description: 'Selecciona al menos un canal de envío (WhatsApp o Email)',
      });
      return;
    }

    setIsCreating(true);

    // Show creating toast
    const creatingToast = toast.loading('Creando anuncio...');

    try {
      const response = await fetch('/api/broadcasts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          message,
          targetAudience,
          specificUnitIds: targetAudience === 'specific_units' ? selectedUnits : null,
          sendViaWhatsApp,
          sendViaEmail,
          sendViaSMS: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create broadcast');
      }

      toast.dismiss(creatingToast);
      toast.success('Anuncio creado', {
        description: 'Enviando a destinatarios...',
      });

      // Automatically send the broadcast
      await handleSend(data.broadcast.id);

    } catch (error) {
      console.error('Create broadcast error:', error);
      toast.dismiss(creatingToast);
      toast.error('Error al crear anuncio', {
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSend = async (broadcastId: string) => {
    setIsSending(true);

    const sendingToast = toast.loading('Enviando anuncio...', {
      description: 'Esto puede tardar unos segundos',
    });

    try {
      const response = await fetch('/api/broadcasts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broadcastId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send broadcast');
      }

      toast.dismiss(sendingToast);

      // Show success with details
      const channels = [];
      if (sendViaWhatsApp) channels.push('WhatsApp');
      if (sendViaEmail) channels.push('Email');

      toast.success('¡Anuncio enviado!', {
        description: `${data.sent} enviados exitosamente${data.failed > 0 ? `, ${data.failed} fallidos` : ''} vía ${channels.join(' y ')}`,
        duration: 5000,
      });

      // Reset form
      setSubject('');
      setMessage('');
      setTargetAudience('all');
      setSelectedUnits([]);
      setSendViaWhatsApp(true);
      setSendViaEmail(false);

      // Callback to refresh broadcast list
      onBroadcastSent?.();

    } catch (error) {
      console.error('Send broadcast error:', error);
      toast.dismiss(sendingToast);
      toast.error('Error al enviar anuncio', {
        description: error instanceof Error ? error.message : 'No se pudo completar el envío',
        duration: 5000,
      });
    } finally {
      setIsSending(false);
    }
  };

  const toggleUnit = (unitId: string) => {
    setSelectedUnits(prev =>
      prev.includes(unitId)
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const isLoading = isCreating || isSending;

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Megaphone className="w-4 h-4" />
          Nuevo Anuncio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subject */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Asunto</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Ej: Reunión de Residentes - Marzo 2025"
            disabled={isLoading}
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Mensaje</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-32 px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Escribe tu mensaje aquí..."
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {message.length} caracteres
          </p>
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-medium mb-2">Destinatarios</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTargetAudience('all')}
              disabled={isLoading}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                targetAudience === 'all'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Todos</span>
            </button>

            <button
              onClick={() => setTargetAudience('owners')}
              disabled={isLoading}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                targetAudience === 'owners'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Dueños</span>
            </button>

            <button
              onClick={() => setTargetAudience('renters')}
              disabled={isLoading}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                targetAudience === 'renters'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <Key className="w-4 h-4" />
              <span className="text-sm font-medium">Inquilinos</span>
            </button>

            <button
              onClick={() => setTargetAudience('specific_units')}
              disabled={isLoading}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                targetAudience === 'specific_units'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Unidades Específicas</span>
            </button>
          </div>
        </div>

        {/* Specific Units Selection */}
        {targetAudience === 'specific_units' && (
          <div>
            <label className="block text-sm font-medium mb-2">Selecciona Unidades</label>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-lg">
              {units.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => toggleUnit(unit.id)}
                  disabled={isLoading}
                  className={`p-2 rounded text-sm font-medium transition-all ${
                    selectedUnits.includes(unit.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/70'
                  }`}
                >
                  {unit.unit_number}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedUnits.length} unidades seleccionadas
            </p>
          </div>
        )}

        {/* Channel Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Canales de Envío</label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="whatsapp"
                checked={sendViaWhatsApp}
                onChange={(e) => setSendViaWhatsApp(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 rounded border-input"
              />
              <label htmlFor="whatsapp" className="text-sm font-medium">
                📱 WhatsApp
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="email"
                checked={sendViaEmail}
                onChange={(e) => setSendViaEmail(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 rounded border-input"
              />
              <label htmlFor="email" className="text-sm font-medium">
                📧 Email
              </label>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {!sendViaWhatsApp && !sendViaEmail
              ? '⚠️ Debes seleccionar al menos un canal'
              : `Se enviará por ${[sendViaWhatsApp && 'WhatsApp', sendViaEmail && 'Email'].filter(Boolean).join(' y ')}`
            }
          </p>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleCreate}
          disabled={isLoading || !subject.trim() || !message.trim() || (!sendViaWhatsApp && !sendViaEmail)}
          className="w-full gap-2 relative"
        >
          {isLoading ? (
            <>
              <Spinner size="sm" className="border-white border-t-transparent" />
              <span>{isSending ? 'Enviando anuncio...' : 'Creando anuncio...'}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Enviar Anuncio</span>
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
