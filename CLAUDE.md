# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CondoSync** is an AI-powered communication platform for Puerto Rico condominium associations. It handles resident messaging through WhatsApp (primary), email, and SMS, with AI-driven intent analysis, smart routing, and automated responses.

**Primary Language**: Spanish (with English support)
**Target Market**: 20-100 unit condo buildings in Puerto Rico

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude Sonnet 4.5 for message analysis
- **Messaging**: Twilio (WhatsApp Business API, SMS), Resend (Email)
- **Deployment**: Vercel

## Core Architecture

### Message Flow
1. Resident sends WhatsApp → Twilio webhook → `/api/webhooks/whatsapp/route.ts`
2. System looks up resident by phone number
3. Claude AI analyzes message intent, priority, routing, and generates response
4. System creates records (conversations, messages, maintenance_requests if applicable)
5. AI response sent back to resident (unless requires human review)
6. Message routed to owner/admin if needed

### Database Schema (Key Tables)
- `buildings` - Building info + WhatsApp business number
- `residents` - Owners & renters (phone, email, opt-ins, preferred language)
- `units` - Unit number, owner_id, current_renter_id
- `conversations` - 1-on-1 chat threads per resident
- `messages` - Individual messages with sender_type (resident/ai/admin), intent, routing
- `broadcasts` - Mass messages to all/owners/renters
- `maintenance_requests` - Auto-extracted from AI conversations
- `polls` - Voting system (owners only or all residents)
- `poll_votes` - Vote records

Full schema: See `CONDOSYNC_TECHNICAL_GUIDE.md` lines 123-368

### AI Message Analysis

**Core function**: `analyzeMessage()` in `src/lib/condosync-ai.ts`

Takes: message text, resident type (owner/renter), language (es/en), building context
Returns:
```typescript
{
  intent: MessageIntent,  // maintenance_request, general_question, noise_complaint, etc.
  priority: 'low' | 'medium' | 'high' | 'emergency',
  routeTo: 'owner' | 'renter' | 'admin' | 'both',
  suggestedResponse: string,  // In resident's preferred language
  requiresHumanReview: boolean,
  extractedData?: {...}
}
```

**Intent Categories**: maintenance_request, general_question, noise_complaint, visitor_access, hoa_fee_question, amenity_reservation, document_request, emergency, other

### Smart Routing Logic

- **Renter → Owner**: Maintenance issues in rented units forward to owner
- **Owner → Renter**: Owner notifications about unit issues
- **Admin Review**: Emergencies, complaints, complex issues flag for human review
- **AI Auto-Response**: Simple questions get immediate AI replies

## File Structure

```
condosync/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── webhooks/whatsapp/route.ts    # Incoming WhatsApp (main entry)
│   │   │   ├── messages/send/route.ts         # Send to resident
│   │   │   ├── broadcasts/
│   │   │   │   ├── create/route.ts
│   │   │   │   └── send/route.ts
│   │   │   ├── maintenance/list/route.ts
│   │   │   └── residents/...
│   │   ├── dashboard/
│   │   │   ├── overview/page.tsx              # Main dashboard
│   │   │   ├── conversations/page.tsx         # All chats
│   │   │   ├── broadcasts/create/page.tsx
│   │   │   └── maintenance/page.tsx           # Kanban board
│   │   └── auth/page.tsx
│   ├── lib/
│   │   ├── condosync-ai.ts                    # AI message analysis (Claude)
│   │   ├── whatsapp-client.ts                 # Twilio WhatsApp wrapper
│   │   ├── message-router.ts                  # Smart routing logic
│   │   ├── broadcast-engine.ts                # Mass message sending
│   │   ├── supabase-client.ts                 # Client-side DB
│   │   └── supabase-server.ts                 # Server-side DB
│   ├── components/condosync/
│   │   ├── MessageThread.tsx                  # Real-time chat UI
│   │   ├── BroadcastComposer.tsx
│   │   └── MaintenanceBoard.tsx               # Kanban
│   └── types/condosync.ts
├── supabase/migrations/
│   └── 001_condosync_schema.sql
└── CONDOSYNC_*.md                             # Spec documents
```

## Development Commands

### Database
```bash
# Run migrations
supabase db push

# Reset database (destructive)
supabase db reset

# Link to project
supabase link --project-ref your-project-ref
```

### Development
```bash
# Start dev server
npm run dev

# Build
npm run build

# Deploy to Vercel
vercel --prod
```

### WhatsApp Testing
```bash
# Test webhook locally (with ngrok)
curl -X POST http://localhost:3000/api/webhooks/whatsapp \
  -F "From=whatsapp:+17875551234" \
  -F "To=whatsapp:+14155238886" \
  -F "Body=Hola, el aire no funciona"
```

## Key Implementation Notes

### WhatsApp Integration (Twilio)
- Webhook endpoint: `/api/webhooks/whatsapp/route.ts`
- Phone format: `whatsapp:+1787XXXXXXX`
- Must get explicit opt-in from residents before messaging
- Use pre-approved message templates for promotional content
- 24-hour window for non-template messages after resident interaction

### AI Analysis
- Model: `claude-sonnet-4-5`
- Temperature: 0.3 (consistent, less creative)
- Always respond in resident's preferred language (Spanish default)
- Fallback response if AI fails: route to admin for manual handling
- Extract maintenance category/urgency from natural language

### Real-time Updates
- Use Supabase Realtime subscriptions for:
  - New messages in conversations
  - Maintenance request status changes
  - Broadcast delivery updates
- Pattern: Subscribe in useEffect, cleanup on unmount

### Security & Privacy
- Row Level Security (RLS) enabled on all tables
- Admin users can only access their building's data
- Residents must explicitly opt-in to each channel (WhatsApp/Email/SMS)
- Store opt-in consent records for compliance

### Spanish-First Design
- All UI text defaults to Spanish
- Database `preferred_language` field: 'es' or 'en'
- AI responses generated in resident's language
- Puerto Rico area codes: 787, 939

### Broadcast System
- Target audiences: all, owners, renters, specific_units
- Multi-channel: WhatsApp (primary), Email, SMS
- Rate limiting: 80 messages/second for WhatsApp
- Track delivery status via Twilio webhooks

### Maintenance Requests
- Auto-created from AI-detected maintenance intents
- Kanban states: open → in_progress → resolved → closed
- Priority: low, medium, high, emergency
- Link to original conversation for context
- Support photo attachments via Supabase Storage

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
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

## Testing Strategy

### Manual Testing Flow
1. Import test residents (mix of owners/renters)
2. Send WhatsApp: "El elevador no funciona" → verify AI creates maintenance request
3. Send WhatsApp: "¿A qué hora cierra la piscina?" → verify AI responds with info
4. Create broadcast to owners → verify delivery
5. Test routing: renter reports issue → verify owner gets forwarded message

### Key Test Cases
- AI correctly identifies maintenance requests in Spanish
- Messages route to owner when renter has issue
- Admin can reply in conversation → resident receives WhatsApp
- Broadcast reaches only targeted audience (owners/renters)
- Real-time updates work in dashboard
- Opt-out honored immediately

## Common Patterns

### Database Query (Server Component)
```typescript
import { createClient } from '@/lib/supabase-server';

const supabase = createClient();
const { data, error } = await supabase
  .from('residents')
  .select('*, units(*)')
  .eq('building_id', buildingId);
```

### Send WhatsApp Message
```typescript
import { sendWhatsAppMessage } from '@/lib/whatsapp-client';

await sendWhatsAppMessage(
  resident.whatsapp_number,  // to
  building.whatsapp_business_number,  // from
  'Tu mensaje aquí'
);
```

### AI Analysis
```typescript
import { analyzeMessage } from '@/lib/condosync-ai';

const analysis = await analyzeMessage(
  messageText,
  resident.type,  // 'owner' | 'renter'
  resident.preferred_language || 'es',
  building.name
);
```

## Reference Documentation

- Full implementation: `CONDOSYNC_IMPLEMENTATION_SPEC.md`
- Technical details: `CONDOSYNC_TECHNICAL_GUIDE.md`
- MVP checklist: `CONDOSYNC_MVP_CHECKLIST.md`
- Quick start: `CONDOSYNC_START_HERE.md`
