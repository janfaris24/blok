'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Send, User, Bot, UserCircle, MessageCircle, MessageSquare, Mail, Image as ImageIcon, Video, FileText } from 'lucide-react';
import { LaserFlow } from '@/components/ui/laser-flow';

interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'resident' | 'ai' | 'admin';
  content: string;
  created_at: string;
  channel: string;
  media_url?: string | null;
  media_type?: string | null;
  media_storage_path?: string | null;
}

interface Conversation {
  id: string;
  channel: 'whatsapp' | 'sms' | 'email';
  residents: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    whatsapp_number: string | null;
    preferred_language: string;
  };
}

interface MessageThreadProps {
  conversation: Conversation;
  buildingId: string;
}

export function MessageThread({ conversation, buildingId }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Load messages
  useEffect(() => {
    loadMessages();
  }, [conversation.id]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages_${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id, supabase]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();

    if (!newMessage.trim() || sending) return;

    setSending(true);

    try {
      // Send message via API
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          residentId: conversation.residents.id,
          message: newMessage,
          buildingId,
        }),
      });

      if (response.ok) {
        setNewMessage('');
      } else {
        alert('Error al enviar mensaje');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  }

  // Helper function to render media content
  function renderMedia(message: Message) {
    if (!message.media_url || !message.media_type) return null;

    const mediaType = message.media_type.split('/')[0];

    if (mediaType === 'image') {
      return (
        <div className="mt-2 rounded-lg overflow-hidden max-w-sm">
          <a href={message.media_url} target="_blank" rel="noopener noreferrer">
            <img
              src={message.media_url}
              alt="Shared image"
              className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
              loading="lazy"
            />
          </a>
        </div>
      );
    }

    if (mediaType === 'video') {
      return (
        <div className="mt-2 rounded-lg overflow-hidden max-w-sm">
          <video
            src={message.media_url}
            controls
            className="w-full h-auto"
            preload="metadata"
          >
            Tu navegador no soporta videos.
          </video>
        </div>
      );
    }

    if (mediaType === 'application' || mediaType === 'audio') {
      return (
        <div className="mt-2">
          <a
            href={message.media_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Ver archivo adjunto</span>
          </a>
        </div>
      );
    }

    return null;
  }

  return (
    <Card className="h-full flex flex-col border-border/40">
      {/* Header */}
      <CardHeader className="border-b border-border/40 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-base font-semibold">
                {conversation.residents.first_name} {conversation.residents.last_name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {conversation.residents.whatsapp_number || conversation.residents.phone}
              </p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${
            conversation.channel === 'whatsapp'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
              : conversation.channel === 'sms'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
              : 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
          }`}>
            {conversation.channel === 'whatsapp' ? (
              <>
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </>
            ) : conversation.channel === 'sms' ? (
              <>
                <MessageSquare className="w-3.5 h-3.5" />
                SMS
              </>
            ) : (
              <>
                <Mail className="w-3.5 h-3.5" />
                Email
              </>
            )}
          </span>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length > 0 ? (
          messages.map((message) => {
            const isResident = message.sender_type === 'resident';
            const isAI = message.sender_type === 'ai';

            return (
              <div
                key={message.id}
                className={`flex gap-2 ${isResident ? 'justify-start' : 'justify-end'}`}
              >
                {isResident && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}

                <div className="flex flex-col gap-1 max-w-[75%]">
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      isResident
                        ? 'bg-muted'
                        : isAI
                        ? 'bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {message.content && (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    )}
                    {renderMedia(message)}
                  </div>
                  <div className="flex items-center gap-2 px-1">
                    <p className="text-[11px] text-muted-foreground">
                      {formatDate(message.created_at)}
                    </p>
                    {isAI && (
                      <span className="text-[11px] flex items-center gap-1 text-purple-600 dark:text-purple-400">
                        <Bot className="w-3 h-3" />
                        AI
                      </span>
                    )}
                  </div>
                </div>

                {!isResident && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                    isAI
                      ? 'bg-purple-100 dark:bg-purple-900/30'
                      : 'bg-primary'
                  }`}>
                    {isAI ? (
                      <Bot className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                    ) : (
                      <UserCircle className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p className="text-sm">No hay mensajes todavía</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <div className="border-t border-border/40 p-4 relative">
        {sending && (
          <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden pointer-events-none">
            <LaserFlow
              color="#3b82f6"
              horizontalBeamOffset={0.0}
              verticalBeamOffset={0.5}
              flowSpeed={0.8}
              wispDensity={1.5}
              fogIntensity={0.6}
            />
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 h-11 px-4 rounded-full border border-border/40 bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            disabled={sending}
          />
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 rounded-full"
            disabled={sending || !newMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
