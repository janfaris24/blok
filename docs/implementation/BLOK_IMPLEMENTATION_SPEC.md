# Blok - Complete Implementation Specification

## 🎯 Executive Summary

**Product Name:** Blok  
**Tagline:** "AI-Powered Communication Platform for Puerto Rico Condominiums"  
**Target Market:** Condo associations (20-100+ units) in Puerto Rico  
**Pricing:** $199-399/month per building  
**Primary Language:** Spanish (with English support)  
**Communication Channels:** WhatsApp (primary), Email, SMS

### Core Problem

Condo associations suffer from communication chaos: fragmented group chats, missed announcements, confusion between owner/renter responsibilities, and management overload.

### Solution

AI-powered messaging system that handles 1-on-1 conversations, broadcasts, smart routing (owner vs renter), voting, and automation through residents' preferred channels (primarily WhatsApp in PR).

---

## 🏗️ Technical Architecture

### Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn/ui
- **Backend:** Next.js API Routes (serverless)
- **Database:** Supabase (PostgreSQL)
- **AI:** Anthropic Claude Sonnet 4.5
- **Integrations:**
  - WhatsApp Business API (via Twilio or Meta)
  - Twilio (SMS, Email)
  - Resend (transactional email)
- **Deployment:** Vercel
- **File Storage:** Supabase Storage (for documents, photos)

### Key Dependencies

```json
{
  "@anthropic-ai/sdk": "^0.30.1",
  "@supabase/supabase-js": "^2.47.10",
  "twilio": "^5.3.5",
  "resend": "^4.0.0",
  "next": "^15.1.3",
  "react": "^19.0.0",
  "zod": "^3.24.1"
}
```

---

## 📊 Database Schema

### Core Tables

#### `buildings`

```sql
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT DEFAULT 'San Juan',
  total_units INTEGER NOT NULL,
  admin_user_id UUID REFERENCES auth.users(id),
  whatsapp_business_number TEXT, -- Building's WhatsApp number
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  subscription_plan TEXT DEFAULT 'basic', -- basic, premium
  subscription_status TEXT DEFAULT 'active', -- active, paused, cancelled
  monthly_fee DECIMAL(10,2) DEFAULT 199.00
);
```

#### `units`

```sql
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL, -- '101', '2B', etc.
  floor INTEGER,
  owner_id UUID REFERENCES residents(id),
  is_rented BOOLEAN DEFAULT FALSE,
  current_renter_id UUID REFERENCES residents(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(building_id, unit_number)
);
```

#### `residents`

```sql
CREATE TABLE residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id),
  type TEXT NOT NULL, -- 'owner' or 'renter'
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL, -- Primary phone (WhatsApp)
  whatsapp_number TEXT, -- Can be same as phone
  preferred_language TEXT DEFAULT 'es', -- 'es' or 'en'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Consent & Privacy
  opted_in_whatsapp BOOLEAN DEFAULT FALSE,
  opted_in_email BOOLEAN DEFAULT FALSE,
  opted_in_sms BOOLEAN DEFAULT FALSE
);
```

#### `conversations`

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  channel TEXT NOT NULL, -- 'whatsapp', 'email', 'sms'
  status TEXT DEFAULT 'active', -- active, resolved, archived
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `messages`

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL, -- 'resident', 'ai', 'admin'
  sender_id UUID, -- resident_id or admin user_id
  content TEXT NOT NULL,
  intent TEXT, -- 'maintenance_request', 'question', 'complaint', etc.
  ai_response TEXT,
  channel TEXT NOT NULL, -- 'whatsapp', 'email', 'sms'

  -- Routing
  routed_to TEXT, -- 'owner', 'renter', 'both', 'admin'
  forwarded_to UUID REFERENCES residents(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Message metadata
  metadata JSONB -- { whatsapp_message_id, twilio_sid, etc }
);
```

#### `broadcasts`

```sql
CREATE TABLE broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,

  -- Targeting
  target_audience TEXT NOT NULL, -- 'all', 'owners', 'renters', 'specific_units'
  target_unit_ids UUID[], -- If specific_units

  -- Channels
  send_via_whatsapp BOOLEAN DEFAULT TRUE,
  send_via_email BOOLEAN DEFAULT FALSE,
  send_via_sms BOOLEAN DEFAULT FALSE,

  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft', -- draft, scheduled, sent, failed

  -- Analytics
  total_recipients INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `maintenance_requests`

```sql
CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id),
  resident_id UUID REFERENCES residents(id),

  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT, -- 'plumbing', 'electrical', 'common_area', etc.
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'emergency'
  status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id), -- Admin/manager

  -- Timeline
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,

  -- Attachments
  photo_urls TEXT[],

  -- AI extraction
  extracted_by_ai BOOLEAN DEFAULT FALSE,
  conversation_id UUID REFERENCES conversations(id)
);
```

#### `polls`

```sql
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),

  title TEXT NOT NULL,
  description TEXT,

  -- Options
  options JSONB NOT NULL, -- [{ id: '1', text: 'Opción A' }, ...]

  -- Voting rules
  eligible_voters TEXT NOT NULL, -- 'owners', 'all', 'specific_units'
  eligible_unit_ids UUID[],
  allow_multiple_votes BOOLEAN DEFAULT FALSE,

  -- Timeline
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active', -- 'draft', 'active', 'closed'

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `poll_votes`

```sql
CREATE TABLE poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id),

  option_ids TEXT[], -- Array of selected option IDs
  voted_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(poll_id, resident_id) -- One vote per resident (unless allow_multiple_votes)
);
```

#### `announcements`

```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),

  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT, -- 'maintenance', 'event', 'policy', 'emergency'

  -- Pinning
  is_pinned BOOLEAN DEFAULT FALSE,
  pinned_until TIMESTAMPTZ,

  -- Visibility
  visible_to TEXT DEFAULT 'all', -- 'all', 'owners', 'renters'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🤖 AI Intent Detection & Response System

### Core AI Service (`/src/lib/condosync-ai.ts`)

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
You are an AI assistant for a Puerto Rico condominium management system called Blok.

CONTEXT:
- Resident type: ${residentType}
- Language: ${language}
- Building context: ${buildingContext || 'N/A'}

MESSAGE FROM RESIDENT:
"${message}"

YOUR TASK:
Analyze this message and provide a structured response in JSON format with the following fields:

1. **intent**: Classify the message intent as one of:
   - maintenance_request (repairs, issues in unit or common areas)
   - general_question (HOA rules, amenities, hours, etc.)
   - noise_complaint
   - visitor_access (guest parking, entrance codes)
   - hoa_fee_question
   - amenity_reservation (pool, gym, party room)
   - document_request (bylaws, financial statements)
   - emergency (fire, flood, security threat)
   - other

2. **priority**: low | medium | high | emergency

3. **routeTo**: Who should handle this?
   - 'admin' = Building admin/manager must respond
   - 'owner' = Forward to unit owner (if sender is renter)
   - 'renter' = Forward to renter (if sender is owner)
   - 'both' = Both owner and renter should be notified

4. **suggestedResponse**: Write a helpful response in ${language === 'es' ? 'Spanish' : 'English'}.
   - Be professional, warm, and concise (2-3 sentences)
   - If it's a maintenance request, acknowledge and say admin will review
   - If it's a question you can answer, provide the answer
   - If you don't know, say admin will follow up within 24 hours

5. **requiresHumanReview**: true if admin MUST review (emergencies, complaints, complex issues)

6. **extractedData**: Extract relevant details (location, category, urgency, etc.)

RESPONSE FORMAT (JSON only):
{
  "intent": "maintenance_request",
  "priority": "high",
  "routeTo": "admin",
  "suggestedResponse": "Hemos recibido tu solicitud de mantenimiento. Un miembro del equipo revisará esto dentro de 24 horas. ¡Gracias por reportarlo!",
  "requiresHumanReview": true,
  "extractedData": {
    "maintenanceCategory": "plumbing",
    "urgency": "high",
    "location": "kitchen"
  }
}
`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    let jsonText = content.text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```')) {
      jsonText = jsonText
        .replace(/^```(?:json)?\s*\n?/i, '')
        .replace(/\n?```\s*$/i, '');
    }

    const result: AIAnalysisResult = JSON.parse(jsonText);
    return result;
  } catch (error) {
    console.error('AI analysis error:', error);

    // Fallback response
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

---

## 📱 WhatsApp Integration

### Setup (Twilio WhatsApp Business API)

```typescript
// /src/lib/whatsapp-client.ts
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function sendWhatsAppMessage(
  to: string, // Format: +1787XXXXXXX
  from: string, // Building's WhatsApp number
  body: string
): Promise<string> {
  try {
    const message = await client.messages.create({
      from: `whatsapp:${from}`,
      to: `whatsapp:${to}`,
      body,
    });

    return message.sid;
  } catch (error) {
    console.error('WhatsApp send error:', error);
    throw new Error('Failed to send WhatsApp message');
  }
}

export async function sendWhatsAppTemplate(
  to: string,
  from: string,
  templateName: string,
  variables: string[]
): Promise<string> {
  try {
    const message = await client.messages.create({
      from: `whatsapp:${from}`,
      to: `whatsapp:${to}`,
      contentSid: templateName, // Pre-approved template ID
      contentVariables: JSON.stringify(variables),
    });

    return message.sid;
  } catch (error) {
    console.error('WhatsApp template send error:', error);
    throw new Error('Failed to send WhatsApp template');
  }
}
```

### Webhook Handler (Incoming Messages)

```typescript
// /src/app/api/webhooks/whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { analyzeMessage } from '@/lib/blok-ai';
import { sendWhatsAppMessage } from '@/lib/whatsapp-client';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const from = formData.get('From') as string; // whatsapp:+1787XXXXXXX
    const to = formData.get('To') as string; // whatsapp:+1787XXXXXXX (building number)
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;

    // Extract phone number
    const phoneNumber = from.replace('whatsapp:', '');
    const buildingNumber = to.replace('whatsapp:', '');

    const supabase = createClient();

    // Find building by WhatsApp number
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

    // Find resident by phone/WhatsApp
    const { data: resident } = await supabase
      .from('residents')
      .select('*, units(*)')
      .eq('building_id', building.id)
      .or(`phone.eq.${phoneNumber},whatsapp_number.eq.${phoneNumber}`)
      .single();

    if (!resident) {
      // Unknown resident - notify admin
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

    // Analyze message with AI
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

    // Send AI response (if not requiring human review)
    if (!analysis.requiresHumanReview) {
      await sendWhatsAppMessage(
        phoneNumber,
        buildingNumber,
        analysis.suggestedResponse
      );

      // Save AI response message
      await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_type: 'ai',
        content: analysis.suggestedResponse,
        channel: 'whatsapp',
      });
    } else {
      // Notify admin via internal system (or email)
      // TODO: Implement admin notification
    }

    // Route to owner if needed
    if (analysis.routeTo === 'owner' && resident.type === 'renter') {
      const { data: unit } = await supabase
        .from('units')
        .select('*, owner:residents!owner_id(*)')
        .eq('id', resident.unit_id)
        .single();

      if (unit?.owner?.whatsapp_number) {
        const forwardMessage = `[Mensaje de inquilino - Unidad ${unit.unit_number}]\n\n${body}`;
        await sendWhatsAppMessage(
          unit.owner.whatsapp_number,
          buildingNumber,
          forwardMessage
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

---

## 🎨 Admin Dashboard UI

### Dashboard Structure

```
/dashboard
├── /overview          → Building stats, recent messages
├── /residents         → Resident directory, add/edit
├── /conversations     → All 1-on-1 chats
├── /broadcasts        → Create/manage broadcasts
├── /maintenance       → Maintenance request queue
├── /polls             → Create/manage polls
├── /announcements     → Pin important announcements
└── /settings          → Building settings, integrations
```

### Key Pages

#### 1. **Overview Dashboard** (`/src/app/dashboard/overview/page.tsx`)

Features:

- Total residents (owners vs renters)
- Open maintenance requests
- Active polls
- Recent messages (last 24h)
- Quick actions: Send broadcast, Create poll, New announcement

#### 2. **Conversations** (`/src/app/dashboard/conversations/page.tsx`)

Features:

- List of all active conversations
- Real-time updates
- Filter by resident, unit, status
- Admin can reply directly (sends via WhatsApp)
- Shows AI-suggested responses
- Mark as resolved/archived

#### 3. **Broadcast Creator** (`/src/app/dashboard/broadcasts/create/page.tsx`)

Features:

- Rich text editor for message
- Target audience selector:
  - All residents
  - Only owners
  - Only renters
  - Specific units (multi-select)
- Channel selector: WhatsApp, Email, SMS
- Schedule for later (date/time picker)
- Preview before sending
- Confirmation modal with recipient count

#### 4. **Maintenance Requests** (`/src/app/dashboard/maintenance/page.tsx`)

Features:

- Kanban board: Open → In Progress → Resolved
- Auto-extracted from AI conversations
- Assign to admin/manager
- Priority labels (Emergency, High, Medium, Low)
- Photo attachments
- Comments/updates (sent back to resident)
- Filter by category, unit, priority

#### 5. **Poll Creator** (`/src/app/dashboard/polls/create/page.tsx`)

Features:

- Poll title & description
- Add multiple options (min 2, max 10)
- Eligible voters: Owners only, All residents, Specific units
- Start/end date picker
- Send notification on poll creation
- Real-time results dashboard
- Export results (CSV, PDF)

---

## 🔄 Key User Flows

### Flow 1: Resident Sends Maintenance Request via WhatsApp

1. **Resident** (Maria, renter in Unit 302):
   - Sends WhatsApp: "Hola, el aire acondicionado no funciona. Hace mucho calor aquí."

2. **System**:
   - Receives message via Twilio webhook
   - Looks up Maria in database (by phone number)
   - Creates/finds active conversation
   - Sends message to Claude AI for analysis

3. **AI Response**:

   ```json
   {
     "intent": "maintenance_request",
     "priority": "high",
     "routeTo": "admin",
     "suggestedResponse": "Hemos recibido tu reporte del aire acondicionado. Un técnico revisará esto dentro de 24 horas. ¡Gracias por reportarlo!",
     "requiresHumanReview": true,
     "extractedData": {
       "maintenanceCategory": "hvac",
       "urgency": "high",
       "location": "unit"
     }
   }
   ```

4. **System**:
   - Creates maintenance request in database
   - Sends AI response to Maria via WhatsApp
   - Notifies admin via dashboard (real-time)
   - Sends email to admin: "New maintenance request from Unit 302"

5. **Admin** (Juan, building manager):
   - Sees notification in dashboard
   - Opens maintenance request
   - Assigns to HVAC technician
   - Updates status: "In Progress"
   - Adds comment: "Técnico llegará mañana 10am"

6. **System**:
   - Sends WhatsApp to Maria: "Actualización: Técnico de HVAC llegará mañana a las 10am."

7. **Next Day**:
   - Technician fixes AC
   - Admin marks request as "Resolved"
   - System sends WhatsApp: "¡Tu solicitud del aire acondicionado ha sido resuelta! Si sigues teniendo problemas, avísanos."

---

### Flow 2: Admin Sends Emergency Broadcast

1. **Admin** (Juan):
   - Goes to Dashboard → Broadcasts → Create
   - Selects "Emergency" category
   - Writes message:

     ```
     ALERTA DE EMERGENCIA

     Se detectó una fuga de agua en el edificio.
     El agua estará cerrada por 2 horas (8am-10am).

     Por favor almacena agua si es necesario.
     ```

   - Target: "All residents"
   - Channels: WhatsApp ✓, Email ✓, SMS ✓
   - Clicks "Send Now"

2. **System**:
   - Fetches all residents with opted-in preferences
   - Sends via WhatsApp to 45 residents
   - Sends via Email to 38 residents
   - Sends via SMS to 42 residents
   - Tracks delivery status

3. **Residents**:
   - Receive message immediately
   - WhatsApp messages come from building's official number
   - No reply needed (broadcast mode)

---

### Flow 3: Owner Creates Poll for Amenity Upgrade

1. **Admin** (Juan):
   - Dashboard → Polls → Create
   - Title: "Renovación de Piscina"
   - Description: "¿Deberíamos renovar la piscina? Costo estimado: $50k"
   - Options:
     - "Sí, renovemos ahora"
     - "Sí, pero en 6 meses"
     - "No, mantengamos como está"
   - Eligible voters: "Owners only"
   - Ends: 7 days from now
   - Clicks "Create & Notify"

2. **System**:
   - Creates poll in database
   - Sends WhatsApp to all 32 owners:

     ```
     📊 Nueva Votación: Renovación de Piscina

     ¿Deberíamos renovar la piscina? Costo: $50k

     Vota aquí: https://condosync.app/poll/abc123

     Votación cierra: 15 de octubre
     ```

3. **Owners**:
   - Click link (opens web page with poll)
   - Select option
   - Submit vote

4. **System**:
   - Records vote in database
   - Sends confirmation WhatsApp: "¡Tu voto ha sido registrado!"
   - Updates real-time results in admin dashboard

5. **7 Days Later**:
   - Poll closes automatically
   - Admin sees results: 65% voted "Sí, renovemos ahora"
   - Admin exports results PDF for board meeting

---

## 🚀 MVP Features (Phase 1 - 4 weeks)

### Week 1-2: Core Infrastructure

- [ ] Supabase database setup (all tables)
- [ ] Next.js app structure
- [ ] Authentication (admin login)
- [ ] WhatsApp webhook endpoint
- [ ] Basic AI message analysis

### Week 3-4: Essential Features

- [ ] Resident directory (add/edit residents)
- [ ] 1-on-1 conversations view
- [ ] Broadcast system (WhatsApp only)
- [ ] Maintenance request creation & tracking
- [ ] Simple dashboard overview

### Optional for MVP:

- Email/SMS integration (can start WhatsApp-only)
- Polls (can add post-MVP)
- Advanced analytics

---

## 💰 Monetization & Pricing

### Tier 1: Basic ($199/month)

- Up to 50 units
- WhatsApp messaging (unlimited)
- AI-powered conversations
- Maintenance requests
- Broadcasts
- 1 admin user

### Tier 2: Premium ($299/month)

- Up to 100 units
- Everything in Basic, plus:
- Email & SMS integration
- Polls & voting
- Advanced analytics
- 3 admin users
- Priority support

### Tier 3: Enterprise ($399/month)

- 100+ units
- Everything in Premium, plus:
- Custom integrations
- Dedicated account manager
- White-label option
- Unlimited admin users

### Setup Fee: $99 (one-time)

- Initial building setup
- Resident data import
- WhatsApp number configuration
- Training session (30 min)

---

## 📈 Go-to-Market Strategy (Puerto Rico)

### Target Buildings

1. **San Juan condos** (200+ buildings, 20-100 units)
2. **Condado high-rises** (30+ buildings, 50-200 units)
3. **Miramar residential** (50+ buildings)

### Sales Approach

1. **Direct outreach** to condo board presidents
2. **WhatsApp demos** (ironic, but effective in PR)
3. **Free 30-day trial**
4. **Case study with first 3 customers**

### Marketing Channels

- Facebook groups (Condo PR, Administradores de Condominios PR)
- Google Ads (keywords: "administración condominios puerto rico")
- LinkedIn outreach to property managers
- Partnerships with HOA management companies

### Success Metrics

- **Month 1-3**: 5 paying customers ($995/month = $12k/year)
- **Month 4-6**: 15 customers ($2,985/month = $36k/year)
- **Month 7-12**: 30 customers ($5,970/month = $72k/year)

---

## 🛠️ Implementation Checklist

### Environment Variables Needed

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic Claude
ANTHROPIC_API_KEY=

# Twilio (WhatsApp, SMS)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=

# Resend (Email)
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://condosync.app
```

### Twilio WhatsApp Setup Steps

1. Sign up for Twilio account
2. Request WhatsApp Business API access
3. Get approved phone number (Puerto Rico area code 787/939)
4. Configure webhook URL: `https://yourdomain.com/api/webhooks/whatsapp`
5. Test with sandbox first, then go production

### First Building Setup

1. Create building record in database
2. Import residents (CSV upload)
3. Set up WhatsApp business number
4. Send opt-in message to all residents
5. Configure admin user
6. Test with admin → resident message flow

---

## 📝 Next Steps for Implementation

1. **Start with database** - Run Supabase migrations
2. **Build WhatsApp webhook** - Test incoming/outgoing messages
3. **Implement AI analysis** - Test with sample messages
4. **Create admin dashboard** - Start with conversations view
5. **Add broadcast system** - Essential for customer value
6. **Test with pilot building** - Get real feedback
7. **Iterate based on feedback**
8. **Scale to more buildings**

---

## 🎯 Success Criteria

### Technical

- [ ] Messages delivered in <2 seconds
- [ ] AI response accuracy >85%
- [ ] 99.5% uptime
- [ ] Support Spanish & English

### Business

- [ ] 5 paying customers in Month 3
- [ ] $10k MRR by Month 6
- [ ] <10% churn rate
- [ ] NPS score >50

### User Experience

- [ ] Admin setup in <30 minutes
- [ ] Residents opt-in rate >80%
- [ ] Maintenance requests resolved 30% faster
- [ ] Admin saves 10+ hours/week

---

## 📚 Additional Resources

### APIs to Integrate

- Twilio WhatsApp API: https://www.twilio.com/docs/whatsapp
- Anthropic Claude: https://docs.anthropic.com/
- Supabase: https://supabase.com/docs

### Example WhatsApp Templates (for approval)

```
Template Name: maintenance_update
Language: Spanish
Category: Utility

Hola {{1}}, actualización sobre tu solicitud de mantenimiento: {{2}}

Estado: {{3}}
```

```
Template Name: poll_notification
Language: Spanish
Category: Marketing

📊 Nueva votación en {{1}}: {{2}}

Vota aquí: {{3}}
Cierra: {{4}}
```

---

## 🚨 Legal & Compliance

### Puerto Rico Requirements

- [ ] Business registration (Registro de Comerciantes)
- [ ] WhatsApp opt-in consent (required)
- [ ] Privacy policy (Spanish & English)
- [ ] Terms of service
- [ ] Data retention policy (GDPR-inspired)

### WhatsApp Rules

- Must get explicit opt-in from residents
- Can't send marketing messages outside 24h window
- Must honor opt-out requests immediately
- Keep opt-in records for audit

---

This specification covers the complete end-to-end implementation of Blok. Focus on MVP features first (Weeks 1-4), validate with pilot customers, then expand with polls, advanced features, and scale to more buildings.

**Key to Success:** Solve the communication chaos problem first. Everything else is secondary.
