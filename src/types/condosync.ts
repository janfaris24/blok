// ==========================================
// CORE TYPES
// ==========================================

export type Language = 'es' | 'en';
export type ResidentType = 'owner' | 'renter';
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
export type RouteTo = 'admin' | 'owner' | 'renter' | 'both';

// ==========================================
// DATABASE TYPES
// ==========================================

export interface Building {
  id: string;
  name: string;
  address: string;
  whatsapp_business_number: string;
  admin_user_id: string;
  created_at: string;
}

export interface Unit {
  id: string;
  building_id: string;
  unit_number: string;
  floor: number;
  owner_id: string | null;
  current_renter_id: string | null;
  created_at: string;
}

export interface Resident {
  id: string;
  building_id: string;
  unit_id: string | null;
  type: ResidentType;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  whatsapp_number: string | null;
  preferred_language: Language;
  opted_in_whatsapp: boolean;
  opted_in_email: boolean;
  opted_in_sms: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  building_id: string;
  resident_id: string;
  status: 'active' | 'closed';
  last_message_at: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'resident' | 'ai' | 'admin';
  content: string;
  intent: MessageIntent | null;
  priority: Priority | null;
  routing: RouteTo | null;
  requires_human_review: boolean;
  created_at: string;
}

export interface MaintenanceRequest {
  id: string;
  building_id: string;
  resident_id: string;
  conversation_id: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: Priority;
  category: string;
  description: string;
  location: string | null;
  reported_at: string;
  resolved_at: string | null;
  created_at: string;
}

export interface Broadcast {
  id: string;
  building_id: string;
  subject: string;
  message: string;
  target_audience: 'all' | 'owners' | 'renters' | 'specific_units';
  specific_unit_ids: string[] | null;
  status: 'draft' | 'sending' | 'sent' | 'failed';
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  send_via_whatsapp: boolean;
  send_via_email: boolean;
  send_via_sms: boolean;
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  building_id: string;
  type: 'new_message' | 'maintenance_request' | 'broadcast' | 'system';
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

// ==========================================
// AI ANALYSIS TYPES
// ==========================================

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

// ==========================================
// API REQUEST/RESPONSE TYPES
// ==========================================

export interface WhatsAppWebhookPayload {
  MessageSid: string;
  From: string; // whatsapp:+1787XXXXXXX
  To: string; // whatsapp:+1787XXXXXXX
  Body: string;
  NumMedia?: string;
  MediaUrl0?: string;
  MediaContentType0?: string;
}

export interface BroadcastRecipient {
  phone: string;
  message: string;
  residentId: string;
  residentName: string;
}

export interface BroadcastResult {
  success: number;
  failed: number;
  errors: string[];
}

export interface SendMessageRequest {
  conversationId: string;
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  messageSid?: string;
  error?: string;
}

// ==========================================
// UI/COMPONENT TYPES
// ==========================================

export interface ConversationWithResident extends Conversation {
  residents: Resident;
  messages?: Message[];
}

export interface MaintenanceRequestWithResident extends MaintenanceRequest {
  residents: {
    first_name: string;
    last_name: string;
    type: ResidentType;
  };
  conversations?: {
    id: string;
  };
}

export interface UnitWithResidents extends Unit {
  owner?: Resident | null;
  renter?: Resident | null;
}
