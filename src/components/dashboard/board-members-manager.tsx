'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Phone, Mail, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { toast } from 'sonner';

interface BoardMember {
  id: string;
  building_id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

interface BoardMembersManagerProps {
  buildingId: string;
}

export function BoardMembersManager({ buildingId }: BoardMembersManagerProps) {
  const { language, t } = useLanguage();
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Presidente',
    phone: '',
    email: '',
  });

  useEffect(() => {
    fetchBoardMembers();
  }, [buildingId]);

  const fetchBoardMembers = async () => {
    try {
      const response = await fetch(`/api/board-members/list?buildingId=${buildingId}`);
      if (response.ok) {
        const data = await response.json();
        setBoardMembers(data);
      }
    } catch (error) {
      console.error('Error fetching board members:', error);
      toast.error(t.boardMembers.errorFetching);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.role) {
      toast.error(t.boardMembers.errorMissingFields);
      return;
    }

    try {
      const url = editingId ? '/api/board-members/update' : '/api/board-members/create';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId
        ? { id: editingId, ...formData }
        : { buildingId, ...formData };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(editingId ? t.boardMembers.successUpdated : t.boardMembers.successCreated);
        setFormData({ name: '', role: 'Presidente', phone: '', email: '' });
        setIsAdding(false);
        setEditingId(null);
        fetchBoardMembers();
      } else {
        throw new Error('Failed to save board member');
      }
    } catch (error) {
      console.error('Error saving board member:', error);
      toast.error(t.boardMembers.errorSaving);
    }
  };

  const handleEdit = (member: BoardMember) => {
    setFormData({
      name: member.name,
      role: member.role,
      phone: member.phone || '',
      email: member.email || '',
    });
    setEditingId(member.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.boardMembers.confirmDelete)) return;

    try {
      const response = await fetch(`/api/board-members/delete?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(t.boardMembers.successDeleted);
        fetchBoardMembers();
      } else {
        throw new Error('Failed to delete board member');
      }
    } catch (error) {
      console.error('Error deleting board member:', error);
      toast.error(t.boardMembers.errorDeleting);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', role: 'Presidente', phone: '', email: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t.boardMembers.title}
        </CardTitle>
        <CardDescription>{t.boardMembers.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            {t.boardMembers.addMember}
          </Button>
        )}

        {isAdding && (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t.boardMembers.name} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t.boardMembers.namePlaceholder}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{t.boardMembers.role} *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Presidente">{t.boardMembers.rolePresident}</SelectItem>
                    <SelectItem value="Vicepresidente">{t.boardMembers.roleVicePresident}</SelectItem>
                    <SelectItem value="Tesorero">{t.boardMembers.roleTreasurer}</SelectItem>
                    <SelectItem value="Secretario">{t.boardMembers.roleSecretary}</SelectItem>
                    <SelectItem value="Vocal">{t.boardMembers.roleMember}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t.boardMembers.phone}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="787-555-1234"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t.boardMembers.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ejemplo@email.com"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editingId ? t.boardMembers.update : t.boardMembers.create}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                {t.boardMembers.cancel}
              </Button>
            </div>
          </form>
        )}

        {boardMembers.length === 0 && !isAdding ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t.boardMembers.noMembers}
          </p>
        ) : (
          <div className="space-y-3">
            {boardMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                      <div className="mt-2 space-y-1">
                        {member.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            <a href={`tel:${member.phone}`} className="hover:underline">
                              {member.phone}
                            </a>
                          </div>
                        )}
                        {member.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            <a href={`mailto:${member.email}`} className="hover:underline">
                              {member.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(member)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(member.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
