# Blok - Technical Implementation Guide

## 🏗️ Project Structure

```
blok/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── webhooks/
│   │   │   │   ├── whatsapp/
│   │   │   │   │   └── route.ts         # WhatsApp incoming messages
│   │   │   │   └── twilio-status/
│   │   │   │       └── route.ts         # Delivery status updates
│   │   │   ├── messages/
│   │   │   │   ├── send/
│   │   │   │   │   └── route.ts         # Send individual message
│   │   │   │   └── conversations/
│   │   │   │       └── route.ts         # List conversations
│   │   │   ├── broadcasts/
│   │   │   │   ├── create/
│   │   │   │   │   └── route.ts         # Create broadcast
│   │   │   │   └── send/
│   │   │   │       └── route.ts         # Send broadcast
│   │   │   ├── maintenance/
│   │   │   │   ├── create/
│   │   │   │   │   └── route.ts         # Create maintenance request
│   │   │   │   ├── update/
│   │   │   │   │   └── route.ts         # Update status
│   │   │   │   └── list/
│   │   │   │       └── route.ts         # List requests
│   │   │   ├── polls/
│   │   │   │   ├── create/
│   │   │   │   │   └── route.ts         # Create poll
│   │   │   │   ├── vote/
│   │   │   │   │   └── route.ts         # Submit vote
│   │   │   │   └── results/
│   │   │   │       └── route.ts         # Get results
│   │   │   └── residents/
│   │   │       ├── create/
│   │   │       │   └── route.ts         # Add resident
│   │   │       ├── update/
│   │   │       │   └── route.ts         # Update resident
│   │   │       └── list/
│   │   │           └── route.ts         # List residents
│   │   ├── dashboard/
│   │   │   ├── overview/
│   │   │   │   └── page.tsx             # Dashboard home
│   │   │   ├── residents/
│   │   │   │   ├── page.tsx             # Residents list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx         # Resident details
│   │   │   ├── conversations/
│   │   │   │   ├── page.tsx             # All conversations
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx         # Single conversation
│   │   │   ├── broadcasts/
│   │   │   │   ├── page.tsx             # Broadcast list
│   │   │   │   └── create/
│   │   │   │       └── page.tsx         # Create broadcast
│   │   │   ├── maintenance/
│   │   │   │   ├── page.tsx             # Maintenance board
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx         # Request details
│   │   │   ├── polls/
│   │   │   │   ├── page.tsx             # Polls list
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx         # Create poll
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx         # Poll results
│   │   │   └── settings/
│   │   │       └── page.tsx             # Building settings
│   │   ├── auth/
│   │   │   └── page.tsx                 # Admin login
│   │   └── poll/
│   │       └── [id]/
│   │           └── page.tsx             # Public poll voting page
│   ├── components/
│   │   ├── blok/
│   │   │   ├── ConversationList.tsx     # Conversations sidebar
│   │   │   ├── MessageThread.tsx        # Message thread view
│   │   │   ├── BroadcastComposer.tsx    # Broadcast creation form
│   │   │   ├── ResidentDirectory.tsx    # Resident table
│   │   │   ├── MaintenanceBoard.tsx     # Kanban board
│   │   │   ├── PollCreator.tsx          # Poll creation form
│   │   │   └── DashboardStats.tsx       # Overview stats cards
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── textarea.tsx
│   │       ├── dialog.tsx
│   │       └── badge.tsx
│   ├── lib/
│   │   ├── blok-ai.ts              # AI message analysis
│   │   ├── whatsapp-client.ts           # WhatsApp/Twilio integration
│   │   ├── email-client.ts              # Resend email client
│   │   ├── sms-client.ts                # Twilio SMS client
│   │   ├── supabase-client.ts           # Client-side Supabase
│   │   ├── supabase-server.ts           # Server-side Supabase
│   │   ├── message-router.ts            # Smart routing logic
│   │   └── broadcast-engine.ts          # Broadcast sending logic
│   └── types/
│       └── blok.ts                 # TypeScript types
├── supabase/
│   └── migrations/
│       └── 001_blok_schema.sql     # Database schema
└── package.json
```

---

## 📦 Dependencies to Install

```bash
npm install @anthropic-ai/sdk @supabase/supabase-js twilio resend zod date-fns
npm install -D @types/node
```

---

## 🗄️ Complete Database Migration

Create file: `supabase/migrations/001_blok_schema.sql`

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Buildings table
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT DEFAULT 'San Juan',
  total_units INTEGER NOT NULL,
  admin_user_id UUID REFERENCES auth.users(id),
  whatsapp_business_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  subscription_plan TEXT DEFAULT 'basic',
  subscription_status TEXT DEFAULT 'active',
  monthly_fee DECIMAL(10,2) DEFAULT 199.00
);

-- Residents table
CREATE TABLE residents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('owner', 'renter')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  whatsapp_number TEXT,
  preferred_language TEXT DEFAULT 'es' CHECK (preferred_language IN ('es', 'en')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  opted_in_whatsapp BOOLEAN DEFAULT FALSE,
  opted_in_email BOOLEAN DEFAULT FALSE,
  opted_in_sms BOOLEAN DEFAULT FALSE
);

-- Units table
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  floor INTEGER,
  owner_id UUID REFERENCES residents(id),
  is_rented BOOLEAN DEFAULT FALSE,
  current_renter_id UUID REFERENCES residents(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(building_id, unit_number)
);

-- Update residents with unit_id
ALTER TABLE residents ADD COLUMN unit_id UUID REFERENCES units(id);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'sms')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'archived')),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('resident', 'ai', 'admin')),
  sender_id UUID,
  content TEXT NOT NULL,
  intent TEXT,
  ai_response TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'sms')),
  routed_to TEXT CHECK (routed_to IN ('owner', 'renter', 'both', 'admin')),
  forwarded_to UUID REFERENCES residents(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Broadcasts table
CREATE TABLE broadcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience TEXT NOT NULL CHECK (target_audience IN ('all', 'owners', 'renters', 'specific_units')),
  target_unit_ids UUID[],
  send_via_whatsapp BOOLEAN DEFAULT TRUE,
  send_via_email BOOLEAN DEFAULT FALSE,
  send_via_sms BOOLEAN DEFAULT FALSE,
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  total_recipients INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance requests table
CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id),
  resident_id UUID REFERENCES residents(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'emergency')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to UUID REFERENCES auth.users(id),
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  photo_urls TEXT[],
  extracted_by_ai BOOLEAN DEFAULT FALSE,
  conversation_id UUID REFERENCES conversations(id)
);

-- Polls table
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL,
  eligible_voters TEXT NOT NULL CHECK (eligible_voters IN ('owners', 'all', 'specific_units')),
  eligible_unit_ids UUID[],
  allow_multiple_votes BOOLEAN DEFAULT FALSE,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Poll votes table
CREATE TABLE poll_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id),
  option_ids TEXT[],
  voted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, resident_id)
);

-- Announcements table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  pinned_until TIMESTAMPTZ,
  visible_to TEXT DEFAULT 'all' CHECK (visible_to IN ('all', 'owners', 'renters')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_conversations_building ON conversations(building_id);
CREATE INDEX idx_conversations_resident ON conversations(resident_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_residents_building ON residents(building_id);
CREATE INDEX idx_residents_phone ON residents(phone);
CREATE INDEX idx_maintenance_building ON maintenance_requests(building_id);
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX idx_polls_building ON polls(building_id);
CREATE INDEX idx_units_building ON units(building_id);

-- Row Level Security (RLS)
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin users can access their building's data)
CREATE POLICY "Admins can view their building"
  ON buildings FOR SELECT
  USING (auth.uid() = admin_user_id);

CREATE POLICY "Admins can view residents in their building"
  ON residents FOR ALL
  USING (building_id IN (SELECT id FROM buildings WHERE admin_user_id = auth.uid()));

CREATE POLICY "Admins can view units in their building"
  ON units FOR ALL
  USING (building_id IN (SELECT id FROM buildings WHERE admin_user_id = auth.uid()));

CREATE POLICY "Admins can view conversations in their building"
  ON conversations FOR ALL
  USING (building_id IN (SELECT id FROM buildings WHERE admin_user_id = auth.uid()));

CREATE POLICY "Admins can view messages in their building"
  ON messages FOR ALL
  USING (conversation_id IN (
    SELECT id FROM conversations WHERE building_id IN (
      SELECT id FROM buildings WHERE admin_user_id = auth.uid()
    )
  ));

CREATE POLICY "Admins can manage broadcasts in their building"
  ON broadcasts FOR ALL
  USING (building_id IN (SELECT id FROM buildings WHERE admin_user_id = auth.uid()));

CREATE POLICY "Admins can manage maintenance requests in their building"
  ON maintenance_requests FOR ALL
  USING (building_id IN (SELECT id FROM buildings WHERE admin_user_id = auth.uid()));

CREATE POLICY "Admins can manage polls in their building"
  ON polls FOR ALL
  USING (building_id IN (SELECT id FROM buildings WHERE admin_user_id = auth.uid()));

CREATE POLICY "Admins can view poll votes in their building"
  ON poll_votes FOR SELECT
  USING (poll_id IN (
    SELECT id FROM polls WHERE building_id IN (
      SELECT id FROM buildings WHERE admin_user_id = auth.uid()
    )
  ));

CREATE POLICY "Residents can vote on polls"
  ON poll_votes FOR INSERT
  WITH CHECK (true); -- Additional validation in application code

CREATE POLICY "Admins can manage announcements in their building"
  ON announcements FOR ALL
  USING (building_id IN (SELECT id FROM buildings WHERE admin_user_id = auth.uid()));
```

---

## 🔑 Core Library Files

### 1. AI Message Analysis (`src/lib/blok-ai.ts`)

````typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

export interface AIAnalysisResult {
  intent: MessageIntent;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  routeTo: 'owner' | 'renter' | 'admin' | 'both';
  suggestedResponse: string;
  requiresHumanReview: boolean;
  extractedData?: {
    maintenanceCategory?: string;
    urgency?: string;
    location?: string;
    [key: string]: any;
  };
}

export async function analyzeMessage(
  message: string,
  residentType: 'owner' | 'renter',
  language: 'es' | 'en',
  buildingContext?: string
): Promise<AIAnalysisResult> {
  const prompt = `
You are an AI assistant for Blok, a Puerto Rico condominium management system.

CONTEXT:
- Resident type: ${residentType}
- Language: ${language}
- Building: ${buildingContext || 'N/A'}

MESSAGE FROM RESIDENT:
"${message}"

TASK: Analyze and respond in JSON format with these fields:

1. intent: maintenance_request | general_question | noise_complaint | visitor_access | hoa_fee_question | amenity_reservation | document_request | emergency | other

2. priority: low | medium | high | emergency

3. routeTo: admin | owner | renter | both

4. suggestedResponse: Professional response in ${language === 'es' ? 'Spanish' : 'English'} (2-3 sentences)

5. requiresHumanReview: true if admin must review (emergencies, complaints, complex issues)

6. extractedData: Extract relevant details (category, urgency, location, etc.)

RESPONSE (JSON only):
`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    let jsonText = content.text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText
        .replace(/^```(?:json)?\s*\n?/i, '')
        .replace(/\n?```\s*$/i, '');
    }

    const result: AIAnalysisResult = JSON.parse(jsonText);
    return result;
  } catch (error) {
    console.error('AI analysis error:', error);

    return {
      intent: 'other',
      priority: 'medium',
      routeTo: 'admin',
      suggestedResponse:
        language === 'es'
          ? 'Hemos recibido tu mensaje. Un administrador te responderá pronto.'
          : 'We received your message. An administrator will respond soon.',
      requiresHumanReview: true,
    };
  }
}
````

### 2. WhatsApp Client (`src/lib/whatsapp-client.ts`)

```typescript
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function sendWhatsAppMessage(
  to: string,
  from: string,
  body: string
): Promise<string> {
  try {
    const message = await client.messages.create({
      from: `whatsapp:${from}`,
      to: `whatsapp:${to}`,
      body,
    });

    console.log(`✅ WhatsApp sent to ${to}: ${message.sid}`);
    return message.sid;
  } catch (error) {
    console.error('WhatsApp send error:', error);
    throw error;
  }
}

export async function sendBulkWhatsApp(
  recipients: Array<{ phone: string; message: string }>,
  from: string
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const recipient of recipients) {
    try {
      await sendWhatsAppMessage(recipient.phone, from, recipient.message);
      success++;
    } catch (error) {
      console.error(`Failed to send to ${recipient.phone}:`, error);
      failed++;
    }

    // Rate limiting: 80 messages/second max
    await new Promise((resolve) => setTimeout(resolve, 15));
  }

  return { success, failed };
}
```

### 3. Message Router (`src/lib/message-router.ts`)

```typescript
import { createClient } from '@/lib/supabase-server';

export async function routeMessage(
  analysis: any,
  residentId: string,
  buildingId: string,
  message: string
) {
  const supabase = createClient();

  // Get resident and unit info
  const { data: resident } = await supabase
    .from('residents')
    .select('*, units(*)')
    .eq('id', residentId)
    .single();

  if (!resident) return;

  // Route to owner if renter sent message
  if (analysis.routeTo === 'owner' && resident.type === 'renter') {
    const { data: unit } = await supabase
      .from('units')
      .select('*, owner:residents!owner_id(*)')
      .eq('id', resident.unit_id)
      .single();

    if (unit?.owner?.whatsapp_number && unit.owner.opted_in_whatsapp) {
      const { data: building } = await supabase
        .from('buildings')
        .select('whatsapp_business_number')
        .eq('id', buildingId)
        .single();

      if (building?.whatsapp_business_number) {
        const forwardMessage = `[Mensaje de inquilino - Unidad ${unit.unit_number}]\n\n${message}`;

        const { sendWhatsAppMessage } = await import('./whatsapp-client');
        await sendWhatsAppMessage(
          unit.owner.whatsapp_number,
          building.whatsapp_business_number,
          forwardMessage
        );
      }
    }
  }

  // Similar logic for routing to renter or admin
  // ...
}
```

### 4. Broadcast Engine (`src/lib/broadcast-engine.ts`)

```typescript
import { createClient } from '@/lib/supabase-server';
import { sendBulkWhatsApp } from './whatsapp-client';

export async function sendBroadcast(broadcastId: string) {
  const supabase = createClient();

  // Get broadcast details
  const { data: broadcast } = await supabase
    .from('broadcasts')
    .select('*, buildings(*)')
    .eq('id', broadcastId)
    .single();

  if (!broadcast) {
    throw new Error('Broadcast not found');
  }

  // Get target residents
  let query = supabase
    .from('residents')
    .select('*')
    .eq('building_id', broadcast.building_id);

  if (broadcast.target_audience === 'owners') {
    query = query.eq('type', 'owner');
  } else if (broadcast.target_audience === 'renters') {
    query = query.eq('type', 'renter');
  } else if (broadcast.target_audience === 'specific_units') {
    query = query.in('unit_id', broadcast.target_unit_ids);
  }

  const { data: residents } = await query;

  if (!residents || residents.length === 0) {
    throw new Error('No recipients found');
  }

  // Send via WhatsApp
  if (broadcast.send_via_whatsapp) {
    const whatsappRecipients = residents
      .filter((r) => r.opted_in_whatsapp && r.whatsapp_number)
      .map((r) => ({
        phone: r.whatsapp_number!,
        message: broadcast.content,
      }));

    const result = await sendBulkWhatsApp(
      whatsappRecipients,
      broadcast.buildings.whatsapp_business_number
    );

    // Update broadcast stats
    await supabase
      .from('broadcasts')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        total_recipients: residents.length,
        delivered_count: result.success,
      })
      .eq('id', broadcastId);
  }

  // Similar logic for email and SMS
  // ...
}
```

---

## 🌐 API Routes

### WhatsApp Webhook (`src/app/api/webhooks/whatsapp/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { analyzeMessage } from '@/lib/blok-ai';
import { sendWhatsAppMessage } from '@/lib/whatsapp-client';
import { routeMessage } from '@/lib/message-router';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;

    const phoneNumber = from.replace('whatsapp:', '');
    const buildingNumber = to.replace('whatsapp:', '');

    const supabase = createClient();

    // Find building
    const { data: building } = await supabase
      .from('buildings')
      .select('*')
      .eq('whatsapp_business_number', buildingNumber)
      .single();

    if (!building) {
      return NextResponse.json(
        { error: 'Building not found' },
        { status: 404 }
      );
    }

    // Find resident
    const { data: resident } = await supabase
      .from('residents')
      .select('*, units(*)')
      .eq('building_id', building.id)
      .or(`phone.eq.${phoneNumber},whatsapp_number.eq.${phoneNumber}`)
      .single();

    if (!resident) {
      await sendWhatsAppMessage(
        phoneNumber,
        buildingNumber,
        'Lo siento, no te reconozco en nuestro sistema. Por favor contacta a la administración.'
      );
      return NextResponse.json({ success: true });
    }

    // Find or create conversation
    let { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('building_id', building.id)
      .eq('resident_id', resident.id)
      .eq('channel', 'whatsapp')
      .eq('status', 'active')
      .single();

    if (!conversation) {
      const { data: newConversation } = await supabase
        .from('conversations')
        .insert({
          building_id: building.id,
          resident_id: resident.id,
          channel: 'whatsapp',
        })
        .select()
        .single();
      conversation = newConversation;
    }

    // Analyze with AI
    const analysis = await analyzeMessage(
      body,
      resident.type,
      resident.preferred_language || 'es',
      building.name
    );

    // Save incoming message
    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_type: 'resident',
      sender_id: resident.id,
      content: body,
      intent: analysis.intent,
      ai_response: analysis.suggestedResponse,
      channel: 'whatsapp',
      routed_to: analysis.routeTo,
      metadata: { whatsapp_sid: messageSid },
    });

    // Handle maintenance requests
    if (analysis.intent === 'maintenance_request') {
      await supabase.from('maintenance_requests').insert({
        building_id: building.id,
        unit_id: resident.unit_id,
        resident_id: resident.id,
        title:
          analysis.extractedData?.maintenanceCategory || 'Maintenance Request',
        description: body,
        category: analysis.extractedData?.maintenanceCategory,
        priority: analysis.priority,
        extracted_by_ai: true,
        conversation_id: conversation.id,
      });
    }

    // Send AI response
    if (!analysis.requiresHumanReview) {
      await sendWhatsAppMessage(
        phoneNumber,
        buildingNumber,
        analysis.suggestedResponse
      );

      await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_type: 'ai',
        content: analysis.suggestedResponse,
        channel: 'whatsapp',
      });
    }

    // Route message
    await routeMessage(analysis, resident.id, building.id, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Send Broadcast (`src/app/api/broadcasts/send/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sendBroadcast } from '@/lib/broadcast-engine';

export async function POST(req: NextRequest) {
  try {
    const { broadcastId } = await req.json();

    if (!broadcastId) {
      return NextResponse.json(
        { error: 'Broadcast ID required' },
        { status: 400 }
      );
    }

    await sendBroadcast(broadcastId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Broadcast send error:', error);
    return NextResponse.json(
      { error: 'Failed to send broadcast' },
      { status: 500 }
    );
  }
}
```

---

## 🎨 UI Components

### Message Thread (`src/components/blok/MessageThread.tsx`)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: string;
  sender_type: 'resident' | 'ai' | 'admin';
  content: string;
  created_at: string;
}

export function MessageThread({ conversationId }: { conversationId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadMessages();

    // Real-time subscription
    const supabase = createClient();
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function loadMessages() {
    const supabase = createClient();
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  }

  async function sendMessage() {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content: newMessage,
        }),
      });

      if (response.ok) {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Send error:', error);
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.sender_type === 'admin'
                  ? 'bg-blue-500 text-white'
                  : msg.sender_type === 'ai'
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-green-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <span className="text-xs opacity-70">
                {new Date(msg.created_at).toLocaleTimeString('es-PR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1"
            rows={2}
          />
          <Button onClick={sendMessage} disabled={sending}>
            Enviar
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

### Broadcast Composer (`src/components/blok/BroadcastComposer.tsx`)

```typescript
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export function BroadcastComposer({ buildingId }: { buildingId: string }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState('all');
  const [sending, setSending] = useState(false);

  async function sendBroadcast() {
    setSending(true);
    try {
      // Create broadcast
      const createResponse = await fetch('/api/broadcasts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingId,
          title,
          content,
          targetAudience: audience,
          sendViaWhatsapp: true,
        }),
      });

      const { broadcastId } = await createResponse.json();

      // Send broadcast
      await fetch('/api/broadcasts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broadcastId }),
      });

      alert('¡Mensaje enviado!');
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Broadcast error:', error);
      alert('Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Enviar Mensaje Masivo</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Título</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Mantenimiento programado"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mensaje</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe tu mensaje aquí..."
            rows={6}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Audiencia</label>
          <Select value={audience} onValueChange={setAudience}>
            <option value="all">Todos los residentes</option>
            <option value="owners">Solo propietarios</option>
            <option value="renters">Solo inquilinos</option>
          </Select>
        </div>

        <Button
          onClick={sendBroadcast}
          disabled={sending || !title || !content}
          className="w-full"
        >
          {sending ? 'Enviando...' : 'Enviar Mensaje'}
        </Button>
      </div>
    </Card>
  );
}
```

---

## 🚀 Deployment Steps

### 1. Supabase Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Initialize project
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 2. Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

ANTHROPIC_API_KEY=sk-ant-...

TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_WHATSAPP_NUMBER=+14155238886

RESEND_API_KEY=re_xxxxx

NEXT_PUBLIC_APP_URL=https://blok.app
```

### 3. Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### 4. WhatsApp Configuration

1. Go to Twilio Console → Messaging → Try it out → WhatsApp
2. Request WhatsApp Business API access
3. Get approved phone number (Puerto Rico area code recommended)
4. Configure webhook URL: `https://yourdomain.com/api/webhooks/whatsapp`
5. Test with sandbox first

---

## ✅ Testing Checklist

- [ ] Database migrations run successfully
- [ ] Admin can create building and residents
- [ ] Resident sends WhatsApp → AI responds correctly
- [ ] Maintenance request auto-created from message
- [ ] Admin can reply to conversation → resident receives WhatsApp
- [ ] Broadcast sent to all residents
- [ ] Poll created → residents can vote
- [ ] Real-time updates work in dashboard
- [ ] Mobile responsive
- [ ] Spanish language correct throughout

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

- Messages received/sent per day
- AI response accuracy (admin override rate)
- Average response time
- Maintenance request resolution time
- Broadcast open rates
- Poll participation rates
- Customer churn rate

### Tools

- Supabase Analytics (built-in)
- Vercel Analytics
- Twilio Console (delivery rates)
- Custom dashboard in admin panel

---

This technical guide provides all the code structure, database schema, and implementation details needed to build Blok from scratch. Start with the MVP features and iterate based on user feedback.
