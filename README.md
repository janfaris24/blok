# Blok - AI-Powered Condo Communication Platform

WhatsApp-first communication platform for Puerto Rico condominium associations with AI-driven message analysis, smart routing, and automated responses.

## 🚀 Quick Start (POC)

### Prerequisites

- Node.js 18+ and npm
- Supabase account (database already configured)
- Anthropic API key (Claude)
- Twilio account (for WhatsApp)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local` from the example:

```bash
cp .env.example .env.local
```

Then fill in your credentials:

```env
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://ywavxrgibgfcvnxygpbz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_WHATSAPP_NUMBER=+14155238886

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Populate Test Data

```bash
npx tsx scripts/setup-test-data.ts
```

This creates:
- 1 test building (Edificio Vista del Mar)
- 2 owners (Carlos, María)
- 1 renter (Ana)
- 2 units (301: owner-occupied, 302: rented)

### 4. Test AI Analysis

```bash
npx tsx scripts/test-ai.ts
```

Tests Claude AI with various message types (maintenance, questions, complaints).

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🧪 Testing the POC

### Option 1: Test AI Locally

```bash
npx tsx scripts/test-ai.ts
```

### Option 2: Test WhatsApp Webhook (with curl)

```bash
curl -X POST http://localhost:3000/api/webhooks/whatsapp \
  -F "From=whatsapp:+17875551234" \
  -F "To=whatsapp:+14155238886" \
  -F "Body=Hola, el aire acondicionado no funciona" \
  -F "MessageSid=test123"
```

### Option 3: Test with Twilio Sandbox

1. Go to [Twilio WhatsApp Sandbox](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
2. Join sandbox with your phone
3. Configure webhook: `https://your-ngrok-url.ngrok.io/api/webhooks/whatsapp`
4. Send test messages from WhatsApp

### Option 4: Use ngrok for Local Testing

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel
ngrok http 3000

# Copy the https URL and set it as Twilio webhook
```

## 🏗️ Architecture

### Core Flow

```
1. Resident sends WhatsApp → Twilio Webhook → /api/webhooks/whatsapp
2. System looks up resident by phone
3. Claude AI analyzes message (intent, priority, routing)
4. System creates conversation + message records
5. If maintenance request: create maintenance_request record
6. AI responds to resident (if no human review needed)
7. Routes to owner/admin if applicable
```

### Database Schema

**7 Core Tables:**
- `buildings` - Building info + WhatsApp number
- `residents` - Owners & renters
- `units` - Unit relationships
- `conversations` - Chat threads
- `messages` - Individual messages
- `maintenance_requests` - AI-extracted requests
- `broadcasts` - Mass messaging (future)

### AI Analysis

Uses Claude Sonnet 4.5 to extract:
- **Intent**: maintenance_request, general_question, noise_complaint, etc.
- **Priority**: low, medium, high, emergency
- **Routing**: owner, renter, admin, both
- **Response**: Auto-generated in resident's language (Spanish/English)
- **Data**: Extracted details (category, urgency, location)

## 📁 Project Structure

```
blok/
├── app/
│   ├── api/webhooks/whatsapp/route.ts  # Main webhook endpoint
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── blok-ai.ts                 # AI analysis (Claude)
│   ├── whatsapp-client.ts              # Twilio WhatsApp
│   ├── message-router.ts               # Smart routing
│   ├── supabase-server.ts              # Server-side DB
│   └── supabase-client.ts              # Client-side DB
├── types/
│   └── blok.ts                    # TypeScript types
├── scripts/
│   ├── setup-test-data.ts              # Populate test data
│   └── test-ai.ts                      # Test AI analysis
└── README.md
```

## 🧑‍💻 Development Commands

```bash
# Start dev server
npm run dev

# Type check
npm run type-check

# Build production
npm run build

# Start production
npm start
```

## 🔑 Key Features (POC)

✅ **WhatsApp Integration**
- Receive messages via Twilio webhook
- Send AI-generated responses
- Multi-language support (Spanish/English)

✅ **AI Message Analysis**
- Intent classification
- Priority detection
- Auto-extraction of maintenance requests
- Smart routing logic

✅ **Database**
- Supabase PostgreSQL with RLS
- Full schema with relationships
- Conversation threading
- Message history

✅ **Smart Routing**
- Renter → Owner (for maintenance)
- Owner → Renter (for notifications)
- Emergency → Admin
- Complaint → Human review

## 🧪 Test Scenarios

### Scenario 1: Renter Reports Maintenance

**From:** Ana (renter, Unit 302) - `+17875551234`
**Message:** "Hola, el aire acondicionado no funciona"

**Expected:**
1. AI detects `maintenance_request` intent
2. Creates maintenance request in database
3. Sends response: "Hemos recibido tu reporte..."
4. Forwards to owner María
5. Flags for admin review

### Scenario 2: Owner Asks Question

**From:** Carlos (owner, Unit 301) - `+17871234567`
**Message:** "¿A qué hora cierra la piscina?"

**Expected:**
1. AI detects `general_question` intent
2. AI responds with info
3. No routing needed
4. No human review needed

### Scenario 3: Noise Complaint

**From:** Any resident
**Message:** "Hay mucho ruido a las 2am"

**Expected:**
1. AI detects `noise_complaint` intent
2. Routes to admin
3. Requires human review
4. Creates conversation record

## 🚢 Next Steps (Post-POC)

1. **Admin Dashboard** - Web UI to manage conversations
2. **Broadcast System** - Mass messaging to residents
3. **Email/SMS Integration** - Multi-channel support
4. **Polls & Voting** - Owner voting system
5. **Payment Reminders** - HOA fee notifications
6. **Analytics Dashboard** - Usage metrics

## 📊 Database Info

**Supabase Project:** `ywavxrgibgfcvnxygpbz`
**Tables Created:** 7
**RLS Policies:** Enabled (admin scoped by building)
**Migrations:** Applied via Supabase MCP

## 🆘 Troubleshooting

### Issue: "Twilio client not configured"
- Add `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` to `.env.local`

### Issue: "Building not found"
- Run `npx tsx scripts/setup-test-data.ts` to create test building

### Issue: "AI analysis failed"
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check API key has sufficient credits

### Issue: "Resident not found"
- Ensure test phone number matches resident in database
- Check phone format: `+17871234567` (no spaces)

## 📝 License

Private - Blok POC

## 🔗 Resources

- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- [Anthropic Claude](https://docs.anthropic.com/)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js 15](https://nextjs.org/docs)
