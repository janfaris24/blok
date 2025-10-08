// Core types for Blok

export type MessageIntent =
  | 'maintenance_request'
  | 'general_question'
  | 'noise_complaint'
  | 'visitor_access'
  | 'hoa_fee_question'
  | 'amenity_reservation'
  | 'document_request'
  | 'emergency'
  | 'other';

export type Priority = 'low' | 'medium' | 'high' | 'emergency';
export type RouteTo = 'owner' | 'renter' | 'admin' | 'both';
export type SenderType = 'resident' | 'ai' | 'admin';
export type Channel = 'whatsapp' | 'email' | 'sms';
export type ResidentType = 'owner' | 'renter';
export type Language = 'es' | 'en';

export interface AIAnalysisResult {
  intent: MessageIntent;
  priority: Priority;
  routeTo: RouteTo;
  suggestedResponse: string;
  requiresHumanReview: boolean;
  extractedData?: {
    maintenanceCategory?: string;
    urgency?: string;
    location?: string;
    [key: string]: any;
  };
}

export interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  total_units: number;
  admin_user_id?: string;
  whatsapp_business_number?: string;
  created_at: string;
  updated_at: string;
  subscription_plan: string;
  subscription_status: string;
  monthly_fee: number;
}

export interface Resident {
  id: string;
  building_id: string;
  unit_id?: string;
  type: ResidentType;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  whatsapp_number?: string;
  preferred_language: Language;
  created_at: string;
  updated_at: string;
  opted_in_whatsapp: boolean;
  opted_in_email: boolean;
  opted_in_sms: boolean;
}

export interface Unit {
  id: string;
  building_id: string;
  unit_number: string;
  floor?: number;
  owner_id?: string;
  is_rented: boolean;
  current_renter_id?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  building_id: string;
  resident_id: string;
  channel: Channel;
  status: 'active' | 'resolved' | 'archived';
  last_message_at: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: SenderType;
  sender_id?: string;
  content: string;
  intent?: MessageIntent;
  ai_response?: string;
  channel: Channel;
  routed_to?: RouteTo;
  forwarded_to?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface MaintenanceRequest {
  id: string;
  building_id: string;
  unit_id?: string;
  resident_id?: string;
  title: string;
  description: string;
  category?: string;
  priority: Priority;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_to?: string;
  reported_at: string;
  resolved_at?: string;
  photo_urls?: string[];
  extracted_by_ai: boolean;
  conversation_id?: string;
}

// Broadcast types
export interface Broadcast {
  id: string;
  building_id: string;
  created_by: string;
  subject: string;
  message: string;
  target_audience: 'all' | 'owners' | 'renters' | 'specific_units';
  specific_unit_ids?: string[];
  send_via_whatsapp: boolean;
  send_via_email: boolean;
  send_via_sms: boolean;
  scheduled_for?: string;
  sent_at?: string;
  status: 'draft' | 'sending' | 'sent' | 'failed';
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
}

export interface BroadcastRecipient {
  id: string;
  name: string;
  whatsapp_number?: string;
  email?: string;
  phone?: string;
}

// WhatsApp Webhook types
export interface WhatsAppWebhookPayload {
  MessageSid: string;
  From: string;
  To: string;
  Body: string;
  NumMedia?: string;
  MediaUrl0?: string;
  MediaContentType0?: string;
}
