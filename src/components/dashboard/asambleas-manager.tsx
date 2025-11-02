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
  Calendar,
  MapPin,
  Link as LinkIcon,
  ListOrdered,
  Megaphone,
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase-client';
import { useLanguage } from '@/contexts/language-context';
import { useRouter } from 'next/navigation';

interface Asamblea {
  id: string;
  building_id: string;
  meeting_date: string;
  meeting_type: 'ordinaria' | 'extraordinaria';
  location: string;
  agenda: string[];
  meeting_link?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
}

interface AsambleasManagerProps {
  initialAsambleas: Asamblea[];
  buildingId: string;
}

export function AsambleasManager({ initialAsambleas, buildingId }: AsambleasManagerProps) {
  const [asambleas, setAsambleas] = useState<Asamblea[]>(initialAsambleas);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsamblea, setEditingAsamblea] = useState<Asamblea | null>(null);
  const supabase = createClient();
  const { t, language } = useLanguage();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    meeting_date: '',
    meeting_type: 'ordinaria' as 'ordinaria' | 'extraordinaria',
    location: '',
    agenda: '',
    meeting_link: '',
    notes: '',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled',
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('asambleas_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'asambleas',
          filter: `building_id=eq.${buildingId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAsambleas((prev) => [payload.new as Asamblea, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setAsambleas((prev) =>
              prev.map((a) =>
                a.id === payload.new.id ? (payload.new as Asamblea) : a
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setAsambleas((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [buildingId, supabase]);

  const handleOpenDialog = (asamblea?: Asamblea) => {
    if (asamblea) {
      setEditingAsamblea(asamblea);
      setFormData({
        meeting_date: new Date(asamblea.meeting_date).toISOString().slice(0, 16),
        meeting_type: asamblea.meeting_type,
        location: asamblea.location,
        agenda: asamblea.agenda.join('\n'),
        meeting_link: asamblea.meeting_link || '',
        notes: asamblea.notes || '',
        status: asamblea.status,
      });
    } else {
      setEditingAsamblea(null);
      setFormData({
        meeting_date: '',
        meeting_type: 'ordinaria',
        location: '',
        agenda: '',
        meeting_link: '',
        notes: '',
        status: 'scheduled',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const agenda = formData.agenda
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      meeting_date: new Date(formData.meeting_date).toISOString(),
      meeting_type: formData.meeting_type,
      location: formData.location,
      agenda,
      meeting_link: formData.meeting_link || null,
      notes: formData.notes || null,
      status: formData.status,
    };

    try {
      if (editingAsamblea) {
        // Update
        const response = await fetch('/api/meetings/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingAsamblea.id, ...payload }),
        });

        if (!response.ok) throw new Error('Failed to update asamblea');

        const { asamblea: updatedAsamblea } = await response.json();

        if (updatedAsamblea) {
          setAsambleas((prev) =>
            prev.map((a) =>
              a.id === editingAsamblea.id ? (updatedAsamblea as Asamblea) : a
            )
          );
        }

        toast.success(t.meetings.updated);
      } else {
        // Create
        const response = await fetch('/api/meetings/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Failed to create asamblea');

        const { asamblea: newAsamblea } = await response.json();

        if (newAsamblea) {
          setAsambleas((prev) => [newAsamblea as Asamblea, ...prev]);
        }

        toast.success(t.meetings.created);
      }

      setIsDialogOpen(false);
      setEditingAsamblea(null);
    } catch (error) {
      console.error('Error saving asamblea:', error);
      toast.error(t.meetings.errorSaving);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.meetings.confirmDelete)) return;

    try {
      const response = await fetch(`/api/meetings/delete?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setAsambleas((prev) => prev.filter((a) => a.id !== id));
      toast.success(t.meetings.deleted);
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error(t.meetings.errorDeleting);
    }
  };

  const handleSendReminder = (asamblea: Asamblea) => {
    const meetingDate = new Date(asamblea.meeting_date);
    const formatted = formatDate(asamblea.meeting_date);

    // Build message
    const title = language === 'es'
      ? `Recordatorio: Próxima Asamblea`
      : `Reminder: Next Meeting`;

    let message = language === 'es'
      ? `Les recordamos que tenemos asamblea programada:\n\n📅 Fecha: ${formatted}\n📍 Lugar: ${asamblea.location}`
      : `Reminder: We have a scheduled meeting:\n\n📅 Date: ${formatted}\n📍 Location: ${asamblea.location}`;

    if (asamblea.agenda?.length > 0) {
      message += language === 'es'
        ? `\n\n📋 Agenda:\n${asamblea.agenda.map((item, i) => `${i + 1}. ${item}`).join('\n')}`
        : `\n\n📋 Agenda:\n${asamblea.agenda.map((item, i) => `${i + 1}. ${item}`).join('\n')}`;
    }

    if (asamblea.meeting_link) {
      message += language === 'es'
        ? `\n\n🔗 Link virtual: ${asamblea.meeting_link}`
        : `\n\n🔗 Virtual link: ${asamblea.meeting_link}`;
    }

    message += language === 'es'
      ? `\n\n¡Los esperamos!`
      : `\n\nSee you there!`;

    // Navigate to broadcasts with prefilled data
    const params = new URLSearchParams({
      title,
      message,
      target: 'all',
    });

    router.push(`/dashboard/broadcasts?${params.toString()}`);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'es' ? 'es-PR' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      scheduled: { label: t.meetings.statusScheduled, class: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20' },
      completed: { label: t.meetings.statusCompleted, class: 'bg-green-50 text-green-600 dark:bg-green-950/20' },
      cancelled: { label: t.meetings.statusCancelled, class: 'bg-red-50 text-red-600 dark:bg-red-950/20' },
    };
    return badges[status as keyof typeof badges] || badges.scheduled;
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      ordinaria: { label: t.meetings.typeRegular, class: 'bg-purple-50 text-purple-600 dark:bg-purple-950/20' },
      extraordinaria: { label: t.meetings.typeSpecial, class: 'bg-orange-50 text-orange-600 dark:bg-orange-950/20' },
    };
    return badges[type as keyof typeof badges] || badges.ordinaria;
  };

  // Get next upcoming asamblea
  const nextAsamblea = asambleas.find(
    (a) => a.status === 'scheduled' && new Date(a.meeting_date) > new Date()
  );

  // Separate upcoming vs past
  const now = new Date();
  const upcomingAsambleas = asambleas.filter(
    (a) => a.status === 'scheduled' && new Date(a.meeting_date) > now
  );
  const pastAsambleas = asambleas.filter(
    (a) => a.status !== 'scheduled' || new Date(a.meeting_date) <= now
  );

  return (
    <div className="space-y-6">
      {/* Next Asamblea Highlight */}
      {nextAsamblea && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {t.meetings.nextMeeting}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-2xl font-bold text-primary">
                {formatDate(nextAsamblea.meeting_date)}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-md ${getTypeBadge(nextAsamblea.meeting_type).class}`}>
                  {getTypeBadge(nextAsamblea.meeting_type).label}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {nextAsamblea.location}
            </div>
            {nextAsamblea.meeting_link && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <LinkIcon className="w-4 h-4" />
                <a href={nextAsamblea.meeting_link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {t.meetings.virtualLinkLabel}
                </a>
              </div>
            )}
            {nextAsamblea.agenda.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ListOrdered className="w-4 h-4" />
                  {t.meetings.agendaLabel}
                </div>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-6">
                  {nextAsamblea.agenda.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* Send Reminder Button */}
            <div className="pt-3 border-t border-border/40">
              <Button
                onClick={() => handleSendReminder(nextAsamblea)}
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <Megaphone className="w-4 h-4" />
                {t.meetings.sendReminder}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header Actions */}
      <Card className="border-border/40">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{t.meetings.pageTitle}</h3>
              <p className="text-sm text-muted-foreground">
                {t.meetings.aiDescription}
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t.meetings.newMeeting}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingAsamblea ? t.meetings.editMeeting : t.meetings.newMeeting}
                  </DialogTitle>
                  <DialogDescription>
                    {t.meetings.dialogDescription}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="meeting_date">{t.meetings.dateTime}</Label>
                      <Input
                        id="meeting_date"
                        type="datetime-local"
                        value={formData.meeting_date}
                        onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="meeting_type">{t.meetings.type}</Label>
                      <Select
                        value={formData.meeting_type}
                        onValueChange={(value: 'ordinaria' | 'extraordinaria') =>
                          setFormData({ ...formData, meeting_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ordinaria">{t.meetings.typeRegular}</SelectItem>
                          <SelectItem value="extraordinaria">{t.meetings.typeSpecial}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location">{t.meetings.location}</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder={t.meetings.locationPlaceholder}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="meeting_link">{t.meetings.virtualLink}</Label>
                    <Input
                      id="meeting_link"
                      type="url"
                      value={formData.meeting_link}
                      onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                      placeholder={t.meetings.virtualLinkPlaceholder}
                    />
                  </div>
                  <div>
                    <Label htmlFor="agenda">{t.meetings.agenda}</Label>
                    <Textarea
                      id="agenda"
                      value={formData.agenda}
                      onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                      placeholder={t.meetings.agendaPlaceholder}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">{t.meetings.notes}</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder={t.meetings.notesPlaceholder}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">{t.meetings.status}</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: 'scheduled' | 'completed' | 'cancelled') =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">{t.meetings.statusScheduled}</SelectItem>
                        <SelectItem value="completed">{t.meetings.statusCompleted}</SelectItem>
                        <SelectItem value="cancelled">{t.meetings.statusCancelled}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      {t.meetings.cancel}
                    </Button>
                    <Button type="submit">{editingAsamblea ? t.meetings.update : t.meetings.create}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t.meetings.total}</p>
            <p className="text-2xl font-bold">{asambleas.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t.meetings.scheduled}</p>
            <p className="text-2xl font-bold text-blue-600">
              {upcomingAsambleas.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t.meetings.completed}</p>
            <p className="text-2xl font-bold text-green-600">
              {asambleas.filter((a) => a.status === 'completed').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Asambleas */}
      {upcomingAsambleas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t.meetings.upcoming}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {upcomingAsambleas.map((asamblea) => (
              <Card key={asamblea.id} className="border-border/40">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${getTypeBadge(asamblea.meeting_type).class}`}>
                          {getTypeBadge(asamblea.meeting_type).label}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${getStatusBadge(asamblea.status).class}`}>
                          {getStatusBadge(asamblea.status).label}
                        </span>
                      </div>
                      <CardTitle className="text-lg">
                        {formatDate(asamblea.meeting_date)}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {asamblea.location}
                  </div>
                  {asamblea.meeting_link && (
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <LinkIcon className="w-4 h-4" />
                      <a href={asamblea.meeting_link} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                        {asamblea.meeting_link}
                      </a>
                    </div>
                  )}
                  {asamblea.agenda.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <ListOrdered className="w-4 h-4" />
                        {t.meetings.agendaLabel}
                      </div>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-6">
                        {asamblea.agenda.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {asamblea.notes && (
                    <div className="text-sm text-muted-foreground pt-2 border-t border-border/40">
                      <p className="line-clamp-2">{asamblea.notes}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                    <span className="text-xs text-muted-foreground">
                      {new Date(asamblea.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleOpenDialog(asamblea)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(asamblea.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Asambleas */}
      {pastAsambleas.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t.meetings.history}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastAsambleas.map((asamblea) => (
              <Card key={asamblea.id} className="border-border/40 opacity-75">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${getTypeBadge(asamblea.meeting_type).class}`}>
                      {getTypeBadge(asamblea.meeting_type).label}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${getStatusBadge(asamblea.status).class}`}>
                      {getStatusBadge(asamblea.status).label}
                    </span>
                  </div>
                  <CardTitle className="text-sm">
                    {formatDate(asamblea.meeting_date)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {asamblea.location}
                  </div>
                  {asamblea.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{asamblea.notes}</p>
                  )}
                  <div className="flex gap-1 pt-2 border-t border-border/40">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleOpenDialog(asamblea)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(asamblea.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {asambleas.length === 0 && (
        <Card className="border-border/40">
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-20" />
            <p className="text-sm text-muted-foreground mb-4">
              {t.meetings.noMeetings}
            </p>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              {t.meetings.newMeeting}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
