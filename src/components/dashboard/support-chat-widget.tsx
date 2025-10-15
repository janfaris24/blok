'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Maximize2, Minimize2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface SupportChatWidgetProps {
  language?: 'es' | 'en';
}

const translations = {
  es: {
    title: 'Asistente de Blok',
    placeholder: 'Escribe tu pregunta...',
    send: 'Enviar',
    thinking: 'Pensando...',
    error: 'Error al enviar mensaje. Intenta de nuevo.',
    welcome:
      '¡Hola! Soy tu asistente para aprender a usar Blok. Pregúntame sobre cómo enviar anuncios, gestionar residentes, rastrear mantenimiento, o cualquier otra función de la plataforma.',
    contactSupport: 'Contactar Soporte',
    contactSupportTitle: '¿Necesitas más ayuda?',
    contactSupportDesc:
      'Si el asistente no pudo resolver tu problema, puedes contactar directamente al equipo de soporte. Te enviaremos el contexto de esta conversación.',
    additionalMessage: 'Mensaje adicional (opcional)',
    additionalMessagePlaceholder: 'Describe tu problema con más detalle...',
    sendRequest: 'Enviar Solicitud',
    cancel: 'Cancelar',
    requestSent: '¡Solicitud enviada! Te contactaremos pronto.',
    requestError: 'Error al enviar solicitud. Intenta de nuevo.',
  },
  en: {
    title: 'Blok Assistant',
    placeholder: 'Type your question...',
    send: 'Send',
    thinking: 'Thinking...',
    error: 'Failed to send message. Please try again.',
    welcome:
      "Hello! I'm your assistant for learning how to use Blok. Ask me about sending broadcasts, managing residents, tracking maintenance, or any other platform feature.",
    contactSupport: 'Contact Support',
    contactSupportTitle: 'Need More Help?',
    contactSupportDesc:
      "If the assistant couldn't solve your issue, you can contact the support team directly. We'll send them the context of this conversation.",
    additionalMessage: 'Additional message (optional)',
    additionalMessagePlaceholder: 'Describe your issue in more detail...',
    sendRequest: 'Send Request',
    cancel: 'Cancel',
    requestSent: 'Request sent! We will contact you soon.',
    requestError: 'Failed to send request. Please try again.',
  },
};

export function SupportChatWidget({ language = 'es' }: SupportChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [additionalMessage, setAdditionalMessage] = useState('');
  const [isSendingSupport, setIsSendingSupport] = useState(false);
  const [supportRequestStatus, setSupportRequestStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: t.welcome,
          created_at: new Date().toISOString(),
        },
      ]);
    }
  }, [isOpen, messages.length, t.welcome]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = input;
    setInput('');
    setIsLoading(true);

    console.log('[Support Chat Widget] Sending message:', messageToSend);

    // Create placeholder for assistant message
    const assistantId = `assistant-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/chat/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          conversationId,
          language,
        }),
      });

      console.log('[Support Chat Widget] Response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('[Support Chat Widget] Stream complete');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');

        // Keep incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.chunk) {
                // Update assistant message with new chunk
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? { ...msg, content: msg.content + data.chunk }
                      : msg
                  )
                );
              }

              if (data.done) {
                console.log('[Support Chat Widget] Stream done, conversationId:', data.conversationId);
                setConversationId(data.conversationId);
              }
            } catch (e) {
              console.error('[Support Chat Widget] Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('[Support Chat Widget] Error:', error);
      // Update assistant message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId ? { ...msg, content: t.error } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleContactSupport = async () => {
    setIsSendingSupport(true);
    setSupportRequestStatus('idle');

    try {
      const response = await fetch('/api/chat/contact-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          additionalMessage: additionalMessage.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send support request');
      }

      setSupportRequestStatus('success');
      setAdditionalMessage('');

      // Close dialog after 2 seconds
      setTimeout(() => {
        setIsContactDialogOpen(false);
        setSupportRequestStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('[Contact Support] Error:', error);
      setSupportRequestStatus('error');
    } finally {
      setIsSendingSupport(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-blue-600 hover:bg-blue-700"
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card
          className={`fixed shadow-2xl z-50 flex flex-col transition-all duration-300 ${
            isExpanded
              ? 'top-0 right-0 bottom-0 w-[600px] rounded-none'
              : 'bottom-24 right-6 w-96 h-[500px] rounded-lg'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b bg-blue-600 text-white ${
            isExpanded ? 'rounded-none' : 'rounded-t-lg'
          }`}>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-semibold">{t.title}</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsContactDialogOpen(true)}
                className="text-white hover:bg-blue-700"
                title={t.contactSupport}
              >
                <Mail className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-white hover:bg-blue-700"
                title={isExpanded ? 'Minimize' : 'Expand'}
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-blue-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`${
                    isExpanded ? 'max-w-[85%]' : 'max-w-[80%]'
                  } rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t.thinking}
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.placeholder}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Contact Support Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.contactSupportTitle}</DialogTitle>
            <DialogDescription>{t.contactSupportDesc}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t.additionalMessage}
              </label>
              <Textarea
                value={additionalMessage}
                onChange={(e) => setAdditionalMessage(e.target.value)}
                placeholder={t.additionalMessagePlaceholder}
                rows={4}
                disabled={isSendingSupport}
              />
            </div>

            {supportRequestStatus === 'success' && (
              <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-lg text-sm">
                {t.requestSent}
              </div>
            )}

            {supportRequestStatus === 'error' && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm">
                {t.requestError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsContactDialogOpen(false)}
              disabled={isSendingSupport}
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleContactSupport}
              disabled={isSendingSupport}
            >
              {isSendingSupport ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t.sendRequest}
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  {t.sendRequest}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
