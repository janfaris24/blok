# CondoSync - START HERE 🚀

## What is CondoSync?

**AI-powered communication platform for Puerto Rico condominium associations.**

### The Problem

Condo associations suffer from communication chaos:

- Fragmented WhatsApp groups
- Missed announcements
- Confusion between owner/renter responsibilities
- Management overload

### The Solution

AI bot that handles 1-on-1 conversations, broadcasts, smart routing, voting, and automation through WhatsApp (primary channel in Puerto Rico).

---

## Quick Overview

### Target Market

- 20-100 unit condo buildings in Puerto Rico
- Primary language: Spanish (English support)
- Pricing: $199-399/month per building

### Core Features (MVP)

1. **AI-Powered 1-on-1 Chats** - Residents text building's WhatsApp → AI responds instantly
2. **Smart Routing** - Routes messages to owner/renter/admin based on intent
3. **Maintenance Requests** - Auto-extracted from conversations, tracked in dashboard
4. **Broadcasts** - Admin sends mass messages to all/owners/renters
5. **Admin Dashboard** - Web UI to manage everything

### Future Features (Post-MVP)

- Polls & voting
- Email/SMS channels
- Amenity reservations
- Payment reminders
- Visitor management

---

## Tech Stack

```
Frontend:  Next.js 14, TypeScript, Tailwind, Shadcn/ui
Backend:   Next.js API Routes (serverless)
Database:  Supabase (PostgreSQL)
AI:        Anthropic Claude Sonnet 4.5
Messaging: Twilio (WhatsApp, SMS), Resend (Email)
Deployment: Vercel
```

---

## File Structure

```
condosync/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── webhooks/whatsapp/route.ts    # Incoming WhatsApp messages
│   │   │   ├── messages/send/route.ts         # Send message to resident
│   │   │   ├── broadcasts/create/route.ts     # Create broadcast
│   │   │   ├── broadcasts/send/route.ts       # Send broadcast
│   │   │   └── maintenance/list/route.ts      # List maintenance requests
│   │   ├── dashboard/
│   │   │   ├── overview/page.tsx              # Dashboard home
│   │   │   ├── conversations/page.tsx         # All conversations
│   │   │   ├── broadcasts/create/page.tsx     # Create broadcast
│   │   │   └── maintenance/page.tsx           # Maintenance board
│   │   └── auth/page.tsx                      # Admin login
│   ├── lib/
│   │   ├── condosync-ai.ts                    # AI message analysis
│   │   ├── whatsapp-client.ts                 # WhatsApp integration
│   │   ├── message-router.ts                  # Smart routing logic
│   │   └── broadcast-engine.ts                # Broadcast sending
│   └── components/
│       └── condosync/
│           ├── MessageThread.tsx              # Chat interface
│           ├── BroadcastComposer.tsx          # Broadcast form
│           └── MaintenanceBoard.tsx           # Maintenance Kanban
├── supabase/migrations/
│   └── 001_condosync_schema.sql               # Full database schema
└── package.json
```

---

## Database Schema (Key Tables)

```sql
buildings           → Building info + WhatsApp number
residents           → Owners & renters (phone, email, opt-ins)
units               → Unit number, owner, renter
conversations       → 1-on-1 chat threads
messages            → Individual messages (resident/AI/admin)
broadcasts          → Mass messages
maintenance_requests → Auto-extracted from conversations
polls               → Voting system
poll_votes          → Vote records
```

**Full schema:** See `CONDOSYNC_TECHNICAL_GUIDE.md` → Database Migration section

---

## How It Works (User Flow)

### Example: Resident Reports Maintenance Issue

1. **Maria (renter, Unit 302)** sends WhatsApp:  
   `"Hola, el aire acondicionado no funciona. Hace mucho calor."`

2. **System receives message** via Twilio webhook:
   - Looks up Maria by phone number
   - Finds her building and unit

3. **AI analyzes message** (Claude Sonnet 4.5):

   ```json
   {
     "intent": "maintenance_request",
     "priority": "high",
     "routeTo": "admin",
     "suggestedResponse": "Hemos recibido tu reporte. Un técnico revisará esto dentro de 24 horas. ¡Gracias!"
   }
   ```

4. **System responds**:
   - Sends AI response to Maria via WhatsApp
   - Creates maintenance request in database
   - Notifies admin in dashboard

5. **Admin (Juan)** sees notification:
   - Opens maintenance request
   - Assigns to HVAC technician
   - Updates status: "In Progress"

6. **System notifies Maria**:
   `"Actualización: Técnico llegará mañana 10am."`

---

## MVP Implementation Plan (4 weeks)

### Week 1-2: Core Infrastructure

- [ ] Supabase setup (database tables, RLS policies)
- [ ] Next.js app structure
- [ ] WhatsApp webhook endpoint
- [ ] AI message analysis function
- [ ] Admin authentication

### Week 3-4: Essential Features

- [ ] Resident directory (add/edit residents)
- [ ] Conversations view (real-time chat)
- [ ] Broadcast system (WhatsApp only)
- [ ] Maintenance request tracking
- [ ] Dashboard overview page

### What to Skip for MVP

- Email/SMS (start WhatsApp-only)
- Polls (add after validating core product)
- Advanced analytics
- Mobile app

---

## Environment Setup

### 1. Create `.env.local`

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_WHATSAPP_NUMBER=+14155238886

# App URL
NEXT_PUBLIC_APP_URL=https://condosync.app
```

### 2. Install Dependencies

```bash
npm install @anthropic-ai/sdk @supabase/supabase-js twilio zod date-fns
npm install next react react-dom typescript @types/node
npm install tailwindcss @radix-ui/react-dialog lucide-react
```

### 3. Run Supabase Migration

```bash
supabase db push
```

### 4. Configure Twilio WhatsApp

1. Twilio Console → WhatsApp → Request Business API access
2. Get approved phone number (Puerto Rico area code 787/939)
3. Set webhook: `https://yourdomain.com/api/webhooks/whatsapp`
4. Test with sandbox first

---

## Key Files to Implement First

### 1. AI Analysis (`src/lib/condosync-ai.ts`)

```typescript
export async function analyzeMessage(
  message: string,
  residentType: 'owner' | 'renter',
  language: 'es' | 'en'
): Promise<AIAnalysisResult>;
```

### 2. WhatsApp Webhook (`src/app/api/webhooks/whatsapp/route.ts`)

```typescript
export async function POST(req: NextRequest) {
  // 1. Parse Twilio webhook data
  // 2. Look up resident by phone
  // 3. Analyze message with AI
  // 4. Save to database
  // 5. Send AI response
  // 6. Route to owner/admin if needed
}
```

### 3. Message Thread UI (`src/components/condosync/MessageThread.tsx`)

- Display conversation messages
- Real-time updates (Supabase subscriptions)
- Send message as admin

### 4. Broadcast Composer (`src/components/condosync/BroadcastComposer.tsx`)

- Form: title, message, audience
- Send to all/owners/renters
- Preview recipient count

---

## Success Metrics

### Technical

- Messages delivered in <2 seconds ⏱️
- AI response accuracy >85% 🎯
- 99.5% uptime ✅

### Business

- 5 paying customers by Month 3 💰
- $10k MRR by Month 6 📈
- <10% churn rate 🔒
- 10+ hours saved per admin/week ⏰

### User Experience

- Admin setup in <30 min 🚀
- Resident opt-in rate >80% 📱
- 30% faster maintenance resolution 🔧

---

## Go-to-Market (Puerto Rico)

### Target Buildings

1. **San Juan condos** (200+ buildings)
2. **Condado high-rises** (30+ buildings)
3. **Miramar residential** (50+ buildings)

### Sales Strategy

- Direct outreach to condo board presidents
- Free 30-day trial
- WhatsApp demos (ironic, but effective in PR)
- Case studies from first 3 customers

### Marketing Channels

- Facebook groups (Condo PR, Administradores)
- Google Ads ("administración condominios puerto rico")
- LinkedIn (property managers)
- Partnerships with HOA management companies

---

## Revenue Projections

### Pricing Tiers

- **Basic:** $199/month (up to 50 units)
- **Premium:** $299/month (up to 100 units)
- **Enterprise:** $399/month (100+ units)
- **Setup fee:** $99 one-time

### Growth Targets

- **Month 1-3:** 5 customers = $995/month = $12k/year
- **Month 4-6:** 15 customers = $2,985/month = $36k/year
- **Month 7-12:** 30 customers = $5,970/month = $72k/year

### Unit Economics

- Customer Acquisition Cost (CAC): $300
- Lifetime Value (LTV): $7,164 (3 years @ $199/month)
- LTV:CAC ratio: 24:1 ✅

---

## Next Steps

1. **Read full specs:**
   - `CONDOSYNC_IMPLEMENTATION_SPEC.md` (business + features)
   - `CONDOSYNC_TECHNICAL_GUIDE.md` (code + database)

2. **Set up development environment:**
   - Create Supabase project
   - Get Twilio account + WhatsApp sandbox
   - Get Anthropic API key

3. **Start coding (Priority order):**
   - Database schema (run migration)
   - WhatsApp webhook endpoint
   - AI analysis function
   - Admin dashboard structure
   - Conversations view

4. **Test with pilot building:**
   - Import 5-10 test residents
   - Test WhatsApp flow end-to-end
   - Get feedback, iterate

5. **Launch MVP:**
   - Onboard first 3 paying customers
   - Monitor usage and bugs
   - Iterate based on feedback

---

## Common Questions

**Q: Why WhatsApp-first instead of web app?**  
A: In Puerto Rico, WhatsApp is the default communication tool. Residents already use it daily, so adoption is instant. No new app to download.

**Q: How is this different from existing property management software?**  
A: Traditional PMSs are admin-focused (rent collection, accounting). CondoSync is resident communication-focused with AI automation. Also, most PMSs don't have WhatsApp integration or Spanish-first UX.

**Q: What if residents don't opt-in to WhatsApp?**  
A: Admin can send opt-in request via WhatsApp. Typical opt-in rate is 70-90% for community-focused messages. We also support email/SMS as fallbacks.

**Q: How does AI know when to escalate to human admin?**  
A: Claude analyzes each message and sets `requiresHumanReview: true` for emergencies, complaints, or complex issues. Admin gets real-time notification.

**Q: What about GDPR/privacy?**  
A: All data stored in Supabase (GDPR-compliant). Residents opt-in explicitly. Data retention policies in place. Puerto Rico follows similar privacy standards.

---

## Resources

### Documentation

- Twilio WhatsApp API: https://www.twilio.com/docs/whatsapp
- Anthropic Claude: https://docs.anthropic.com/
- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs

### Competitor Research

- Elise.ai (NYC property tech, $75M funded)
- AppFolio (US property management, $2.4B market cap)
- Buildium (US property management, acquired for $580M)
- **Gap in Puerto Rico:** None of these have WhatsApp-first, Spanish-native, AI-powered solutions

---

## Contact & Support

**Project:** CondoSync  
**Location:** Puerto Rico (Act 60 tax benefits apply)  
**Status:** Pre-launch / MVP development

---

## Quick Reference

### Essential Commands

```bash
# Start dev server
npm run dev

# Run migrations
supabase db push

# Deploy to Vercel
vercel --prod

# Test WhatsApp sandbox
curl -X POST https://your-domain.com/api/webhooks/whatsapp
```

### Key Endpoints

- `POST /api/webhooks/whatsapp` - Incoming WhatsApp messages
- `POST /api/messages/send` - Send message to resident
- `POST /api/broadcasts/send` - Send mass broadcast
- `GET /api/conversations` - List all conversations
- `GET /api/maintenance/list` - List maintenance requests

---

**👉 Start with:** `CONDOSYNC_IMPLEMENTATION_SPEC.md` for full product details  
**👉 Then read:** `CONDOSYNC_TECHNICAL_GUIDE.md` for code implementation  
**👉 Build MVP:** Focus on WhatsApp webhook → AI analysis → Admin dashboard

**🚀 Goal:** Launch with 3 pilot buildings in 30 days, validate product-market fit, then scale.
