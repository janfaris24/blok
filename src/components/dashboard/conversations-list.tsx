'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Card } from '@/components/ui/card';
import { MessageThread } from './message-thread';
import { formatRelativeTime } from '@/lib/utils';
import { MessageSquare, Search } from 'lucide-react';

interface Conversation {
  id: string;
  status: string;
  last_message_at: string;
  residents: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    whatsapp_number: string | null;
    type: string;
    preferred_language: string;
  };
}

interface ConversationsListProps {
  initialConversations: Conversation[];
  buildingId: string;
}

export function ConversationsList({ initialConversations, buildingId }: ConversationsListProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Auto-select conversation from URL parameter
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find((conv) => conv.id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
      }
    }
  }, [searchParams, conversations]);

  // Real-time subscription for conversation updates
  useEffect(() => {
    const conversationsChannel = supabase
      .channel('conversations_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `building_id=eq.${buildingId}`,
        },
        (payload) => {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === payload.new.id
                ? { ...conv, ...payload.new }
                : conv
            ).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
    };
  }, [buildingId, supabase]);

  const filteredConversations = conversations.filter((conv) => {
    const fullName = `${conv.residents.first_name} ${conv.residents.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full overflow-hidden">
      {/* Conversations List */}
      <div className="lg:col-span-4 xl:col-span-3 h-full overflow-hidden">
        <Card className="flex flex-col h-full border-border/40">
        {/* Search */}
        <div className="p-3 border-b border-border/40">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar residente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border/40 bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const isSelected = selectedConversation?.id === conv.id;

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-3 border-b border-border/40 text-left transition-colors hover:bg-muted/50 ${
                    isSelected ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="font-semibold text-sm truncate">
                          {conv.residents.first_name} {conv.residents.last_name}
                        </p>
                        <span className="text-[11px] text-muted-foreground">
                          {formatRelativeTime(conv.last_message_at)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mb-1">
                        {conv.residents.phone}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          conv.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {conv.status === 'active' ? 'Activa' : 'Cerrada'}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {conv.residents.type === 'owner' ? 'Dueño' : 'Inquilino'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No hay conversaciones</p>
            </div>
          )}
        </div>
        </Card>
      </div>

      {/* Message Thread */}
      <div className="lg:col-span-8 xl:col-span-9 h-full overflow-hidden">
        {selectedConversation ? (
          <MessageThread conversation={selectedConversation} buildingId={buildingId} />
        ) : (
          <Card className="h-full flex items-center justify-center border-border/40">
            <div className="text-center text-muted-foreground p-8">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-base">Selecciona una conversación para empezar</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
