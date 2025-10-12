'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import {
  User,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Camera,
  MessageSquare,
  Bot,
  UserCircle,
  Send,
  UserCheck,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

interface MaintenanceRequest {
  id: string;
  title?: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  reported_at: string;
  resolved_at?: string | null;
  photo_urls?: string[] | null;
  has_photos?: boolean;
  location?: string | null;
  conversation_id?: string | null;
  residents: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    type: string;
  };
  units?: {
    unit_number: string;
  } | null;
}

interface Message {
  id: string;
  content: string;
  sender_type: 'resident' | 'ai' | 'admin';
  created_at: string;
  media_url?: string | null;
  media_type?: string | null;
}

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  author_id: string;
  author_name: string;
}

interface MaintenanceDetailModalProps {
  request: MaintenanceRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (requestId: string, newStatus: string) => void;
}

export function MaintenanceDetailModal({
  request,
  isOpen,
  onClose,
  onStatusChange,
}: MaintenanceDetailModalProps) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [sendToResident, setSendToResident] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  const supabase = createClient();

  const priorityConfig = {
    emergency: {
      label: t.maintenance.emergency,
      color: 'bg-red-600 text-white',
      icon: '🚨',
    },
    high: {
      label: t.maintenance.high,
      color: 'bg-orange-500 text-white',
      icon: '⚠️',
    },
    medium: {
      label: t.maintenance.medium,
      color: 'bg-yellow-500 text-white',
      icon: '📌',
    },
    low: {
      label: t.maintenance.low,
      color: 'bg-blue-500 text-white',
      icon: '📝',
    },
  };

  const statusConfig = {
    referred_to_provider: { label: t.maintenance.referredToProvider, icon: UserCheck, color: 'text-blue-600 dark:text-blue-400' },
    open: { label: t.maintenance.opened, icon: AlertCircle, color: 'text-red-600 dark:text-red-400' },
    in_progress: { label: t.maintenance.inProgress, icon: Clock, color: 'text-yellow-600 dark:text-yellow-400' },
    resolved: { label: t.maintenance.resolved_single, icon: CheckCircle2, color: 'text-green-600 dark:text-green-400' },
    closed: { label: t.maintenance.closed_single, icon: XCircle, color: 'text-gray-600 dark:text-gray-400' },
  };

  useEffect(() => {
    if (isOpen && request?.conversation_id) {
      loadConversationMessages();
    }
    if (isOpen && request?.id) {
      loadComments();
    }
  }, [isOpen, request?.conversation_id, request?.id]);

  async function loadConversationMessages() {
    if (!request?.conversation_id) return;

    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', request.conversation_id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function loadComments() {
    if (!request?.id) return;

    setLoadingComments(true);
    try {
      const response = await fetch(`/api/maintenance/comments?requestId=${request.id}`);
      if (response.ok) {
        const result = await response.json();
        setComments(result.data || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  }

  async function handleAddComment() {
    if (!request?.id || !newComment.trim()) return;

    setAddingComment(true);
    try {
      const response = await fetch('/api/maintenance/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: request.id,
          comment: newComment.trim(),
          sendToResident,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setComments((prev) => [...prev, result.data]);
        setNewComment('');
        setSendToResident(false);
      } else {
        console.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setAddingComment(false);
    }
  }

  function handleStatusChange(newStatus: string) {
    if (request && onStatusChange) {
      onStatusChange(request.id, newStatus);
      onClose();
    }
  }

  if (!request) return null;

  const priority = priorityConfig[request.priority];
  const status = statusConfig[request.status];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold px-2 py-1 rounded-full ${priority.color}`}>
                {priority.icon} {priority.label}
              </span>
              <span className={`flex items-center gap-1.5 ${status.color}`}>
                <status.icon className="w-5 h-5" />
                {status.label}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          {request.title && (
            <div>
              <h3 className="text-lg font-semibold">{request.title}</h3>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">{t.maintenance.description}</h4>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{request.description}</p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t.maintenance.resident}</p>
                <p className="text-sm font-medium">
                  {request.residents.first_name} {request.residents.last_name}
                </p>
                <p className="text-xs text-muted-foreground">{request.residents.phone}</p>
              </div>
            </div>

            {request.units && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{t.residents.unit}</p>
                  <p className="text-sm font-medium">{request.units.unit_number}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t.maintenance.reported}</p>
                <p className="text-sm font-medium">{formatDate(request.reported_at)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeTime(request.reported_at)}
                </p>
              </div>
            </div>

            {request.resolved_at && (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{t.maintenance.resolved_single}</p>
                  <p className="text-sm font-medium">{formatDate(request.resolved_at)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Category & Location */}
          <div className="flex gap-3">
            {request.category && (
              <Badge variant="secondary" className="gap-1.5">
                <span className="text-xs">{t.maintenance.category}: {request.category}</span>
              </Badge>
            )}
            {request.location && (
              <Badge variant="secondary" className="gap-1.5">
                <MapPin className="w-3 h-3" />
                <span className="text-xs">{request.location}</span>
              </Badge>
            )}
          </div>

          {/* Photos */}
          {request.has_photos && request.photo_urls && request.photo_urls.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Camera className="w-4 h-4" />
                {t.maintenance.photos} ({request.photo_urls.length})
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {request.photo_urls.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square rounded-lg overflow-hidden bg-muted hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={url}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Conversation History */}
          {request.conversation_id && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Historial de Conversación
              </h4>

              {loadingMessages ? (
                <div className="text-sm text-muted-foreground py-4 text-center">
                  Cargando mensajes...
                </div>
              ) : messages.length > 0 ? (
                <div className="border border-border/40 rounded-lg p-3 max-h-64 overflow-y-auto space-y-2">
                  {messages.map((message) => {
                    const isResident = message.sender_type === 'resident';
                    const isAI = message.sender_type === 'ai';

                    return (
                      <div
                        key={message.id}
                        className={`flex gap-2 ${isResident ? 'justify-start' : 'justify-end'}`}
                      >
                        {isResident && (
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                        )}

                        <div className="flex flex-col gap-1 max-w-[75%]">
                          <div
                            className={`rounded-lg px-3 py-2 text-sm ${
                              isResident
                                ? 'bg-muted'
                                : isAI
                                ? 'bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50'
                                : 'bg-primary text-primary-foreground'
                            }`}
                          >
                            {message.content && (
                              <p className="text-xs leading-relaxed whitespace-pre-wrap">
                                {message.content}
                              </p>
                            )}
                            {message.media_url && message.media_type?.startsWith('image') && (
                              <div className="mt-1">
                                <a href={message.media_url} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={message.media_url}
                                    alt="Media"
                                    className="max-w-[200px] rounded cursor-pointer hover:opacity-90"
                                  />
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 px-1">
                            <p className="text-[10px] text-muted-foreground">
                              {formatDate(message.created_at)}
                            </p>
                            {isAI && (
                              <span className="text-[10px] flex items-center gap-0.5 text-purple-600 dark:text-purple-400">
                                <Bot className="w-2.5 h-2.5" />
                                AI
                              </span>
                            )}
                          </div>
                        </div>

                        {!isResident && (
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isAI ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-primary'
                            }`}
                          >
                            {isAI ? (
                              <Bot className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300" />
                            ) : (
                              <UserCircle className="w-3.5 h-3.5 text-primary-foreground" />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-4 text-center">
                  No hay mensajes en la conversación
                </div>
              )}
            </div>
          )}

          {/* Admin Comments */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comentarios Administrativos
            </h4>

            {/* Display existing comments */}
            {loadingComments ? (
              <div className="text-sm text-muted-foreground py-4 text-center">
                Cargando comentarios...
              </div>
            ) : comments.length > 0 ? (
              <div className="border border-border/40 rounded-lg p-3 max-h-48 overflow-y-auto space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <UserCircle className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{comment.author_name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground pl-8 whitespace-pre-wrap">
                      {comment.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-4 text-center border border-border/40 rounded-lg">
                No hay comentarios aún
              </div>
            )}

            {/* Add new comment */}
            <div className="space-y-2 border border-border/40 rounded-lg p-3">
              <Textarea
                placeholder="Añadir comentario administrativo..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="send-to-resident"
                    checked={sendToResident}
                    onCheckedChange={(checked) => setSendToResident(checked as boolean)}
                  />
                  <Label
                    htmlFor="send-to-resident"
                    className="text-xs text-muted-foreground cursor-pointer"
                  >
                    Enviar a residente vía WhatsApp
                  </Label>
                </div>
                <Button
                  size="sm"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || addingComment}
                  className="gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {addingComment ? 'Enviando...' : 'Comentar'}
                </Button>
              </div>
            </div>
          </div>

          {/* Status Actions */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Cambiar Estado</h4>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(statusConfig).map(([statusKey, statusValue]) => (
                <Button
                  key={statusKey}
                  variant={request.status === statusKey ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange(statusKey)}
                  disabled={request.status === statusKey}
                  className="gap-1.5"
                >
                  <statusValue.icon className="w-3.5 h-3.5" />
                  {statusValue.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
