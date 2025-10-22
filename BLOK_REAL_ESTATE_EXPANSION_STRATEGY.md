# Blok Real Estate Expansion Strategy

**Document Created**: January 22, 2025
**Status**: Strategic Planning
**Decision**: Expand "Blok" brand to cover both condo management AND real estate showing coordination

---

## Executive Summary

**Objective**: Transform Blok from a niche condo management tool into a comprehensive property communication platform for Puerto Rico, adding AI-powered showing coordination for real estate agents.

**Strategic Rationale**:
- 80% of infrastructure already built (WhatsApp, AI, bilingual, conversations)
- Natural extension of core competency
- Puerto Rico specialization = defensible moat
- Clear market need: ~6,000 real estate agents in PR with no bilingual WhatsApp AI solution
- Cross-sell opportunity with existing property manager customers

**Financial Potential**:
- Month 12: 200 agents × $75 = $15,000 MRR
- Year 2: 500 agents × $75 = $37,500 MRR
- Year 3: 1,000 agents × $100 = $100,000 MRR

---

## Table of Contents

1. [Core Features for Real Estate](#core-features-for-real-estate)
2. [Technical Architecture](#technical-architecture)
3. [Database Schema](#database-schema)
4. [Implementation Roadmap](#implementation-roadmap)
5. [Branding Strategy](#branding-strategy)
6. [Landing Page Copy](#landing-page-copy)
7. [Business Model](#business-model)
8. [Go-to-Market Strategy](#go-to-market-strategy)
9. [Competitive Analysis](#competitive-analysis)
10. [Risks & Mitigation](#risks--mitigation)
11. [Next Steps](#next-steps)

---

## Core Features for Real Estate

### 1. Automated Showing Scheduling
- Allow buyers, renters, or agents to request property viewings via WhatsApp, voice calls, or web forms
- AI confirms property availability, coordinates with multiple parties, and books appointments directly to agent's calendar (Google, Outlook, Apple)
- Support for scheduling overlapping or recurring showings across multiple listings

### 2. Lead Qualification
- Conversational AI asks screening questions:
  - Budget range
  - Timeline (immediately, 1-3mo, 3-6mo, 6-12mo, exploring)
  - Financing status (pre-approved, working on it, cash buyer)
  - Property preferences (location, bedrooms, bathrooms)
  - Investment eligibility (Act 60 for Puerto Rico)
- Qualifies leads before scheduling and routes to agents with full prospect data
- Lead scoring algorithm (0-100) to prioritize high-quality leads

### 3. 24/7 Inbound Contact Handling
- Manages inbound WhatsApp messages and calls at any time
- Instant responses, appointment booking, and pre-qualification without agent intervention
- Works in both Spanish and English with Puerto Rican dialect

### 4. Feedback Collection & Follow-Up
- After showings, automatically requests feedback from buyers/renters and agents
- Questions: Interest level (1-5), concerns, next steps, follow-up needed?
- Aggregates feedback into Blok dashboard for property owners/managers

### 5. Bilingual Support
- Natural conversation in Puerto Rican Spanish & English
- Customizable templates for local slang, politeness norms, and dialect
- Auto-detects language preference from first message

### 6. Data Sync & Integration
- Sync showing data, leads, and feedback into Blok's dashboard
- Google Calendar, Outlook Calendar, Apple Calendar integration
- Export as CSV, .ics files
- Future: Push to external CRMs/MLS (KW Command, Follow Up Boss, etc.)

---

## Technical Architecture

### What We Already Have (80%)
✅ WhatsApp Business API + webhook
✅ Claude AI with bilingual prompts
✅ Conversation threading & history
✅ Message routing & intents
✅ Twilio account (can add Voice)
✅ Supabase + RLS for multi-tenant
✅ Resident/user management patterns
✅ Payment tracking system (can adapt for commission tracking)

### What We Need to Build (20%)
🔨 Google Calendar API integration (OAuth flow, read/write events)
🔨 Property/listing management tables
🔨 Agent profiles & availability rules
🔨 Lead qualification conversation flow
🔨 Showing scheduling logic with conflict detection
🔨 Feedback collection system
🔨 Agent dashboard (leads pipeline, upcoming showings)

### Integration Points
- **Google Calendar API**: Check availability, create events, send invites
- **Outlook Calendar API**: Microsoft Graph API for Outlook users
- **Apple Calendar**: CalDAV protocol
- **Twilio Voice API**: For phone call handling (Phase 3)
- **OpenAI Embeddings**: For semantic search of property descriptions

---

## Database Schema

### New Tables Required

```sql
-- Agents (real estate agents, not property managers)
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id), -- Link to Supabase auth
  name TEXT NOT NULL,
  phone TEXT,
  whatsapp_number TEXT,
  email TEXT UNIQUE,
  company TEXT,
  license_number TEXT,

  -- Calendar integration
  calendar_provider TEXT CHECK (calendar_provider IN ('google', 'outlook', 'apple')),
  calendar_id TEXT,
  oauth_token TEXT, -- Encrypted
  oauth_refresh_token TEXT, -- Encrypted
  oauth_expires_at TIMESTAMPTZ,

  -- Availability settings
  availability_rules JSONB DEFAULT '{
    "monday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "tuesday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "wednesday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "thursday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "friday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "saturday": {"enabled": true, "start": "10:00", "end": "14:00"},
    "sunday": {"enabled": false}
  }'::jsonb,
  default_showing_duration INTERVAL DEFAULT '30 minutes',
  buffer_between_showings INTERVAL DEFAULT '15 minutes',
  advance_notice_required INTERVAL DEFAULT '2 hours',

  -- Preferences
  auto_qualify_enabled BOOLEAN DEFAULT true,
  auto_schedule_enabled BOOLEAN DEFAULT false, -- Require manual approval?
  preferred_language TEXT DEFAULT 'es' CHECK (preferred_language IN ('es', 'en')),

  -- Status
  active BOOLEAN DEFAULT true,
  vacation_mode BOOLEAN DEFAULT false,
  vacation_start DATE,
  vacation_end DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties/Listings
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id), -- Optional link to condo building

  -- Property details
  address TEXT NOT NULL,
  city TEXT,
  state TEXT DEFAULT 'Puerto Rico',
  zip_code TEXT,
  price DECIMAL(12, 2),
  bedrooms DECIMAL(3, 1), -- Allow 2.5 bedrooms
  bathrooms DECIMAL(3, 1),
  square_feet INTEGER,
  lot_size DECIMAL(10, 2),
  property_type TEXT CHECK (property_type IN ('house', 'condo', 'apartment', 'townhouse', 'land', 'commercial')),
  listing_type TEXT NOT NULL CHECK (listing_type IN ('sale', 'rent', 'vacation_rental')),

  -- Listing info
  mls_number TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'rented', 'withdrawn')),
  photos TEXT[], -- Array of URLs
  description TEXT,
  amenities TEXT[],

  -- Showing logistics
  showing_instructions TEXT,
  lockbox_code TEXT,
  available_days TEXT[] DEFAULT '{monday,tuesday,wednesday,thursday,friday,saturday}',
  notice_required INTERVAL DEFAULT '2 hours',
  showing_duration INTERVAL DEFAULT '30 minutes',

  -- SEO/Search
  search_vector TSVECTOR, -- For full-text search
  embedding VECTOR(1536), -- For semantic search

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  listed_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ
);

-- Leads (prospects)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id), -- Initial property of interest

  -- Contact info
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  email TEXT,

  -- Qualification data
  qualification_score INTEGER CHECK (qualification_score >= 0 AND qualification_score <= 100),
  qualified_at TIMESTAMPTZ,
  budget_min DECIMAL(12, 2),
  budget_max DECIMAL(12, 2),
  financing_status TEXT CHECK (financing_status IN ('pre_approved', 'working_on_it', 'cash_buyer', 'unknown')),
  timeline TEXT CHECK (timeline IN ('immediately', '1-3mo', '3-6mo', '6-12mo', 'exploring')),

  -- Puerto Rico specific
  act60_investor BOOLEAN DEFAULT false,
  current_location TEXT, -- Where they're moving from

  -- Preferences
  preferred_language TEXT DEFAULT 'es' CHECK (preferred_language IN ('es', 'en')),
  preferred_contact_method TEXT CHECK (preferred_contact_method IN ('whatsapp', 'phone', 'email')),

  -- Status & source
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'qualified', 'contacted', 'showing_scheduled', 'active', 'cold', 'lost', 'converted')),
  source TEXT CHECK (source IN ('whatsapp', 'phone', 'website', 'referral', 'walk_in', 'other')),

  -- Notes & tags
  notes TEXT,
  tags TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_contacted_at TIMESTAMPTZ
);

-- Showings (appointments)
CREATE TABLE showings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES conversations(id), -- Link to WhatsApp convo

  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration INTERVAL DEFAULT '30 minutes',
  end_time TIMESTAMPTZ GENERATED ALWAYS AS (scheduled_at + duration) STORED,

  -- Calendar integration
  calendar_event_id TEXT, -- Google/Outlook event ID
  calendar_provider TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
    'scheduled',
    'confirmed',
    'reminded',
    'in_progress',
    'completed',
    'cancelled_by_agent',
    'cancelled_by_lead',
    'no_show',
    'rescheduled'
  )),

  -- Communication tracking
  confirmation_sent_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  reminder_count INTEGER DEFAULT 0,

  -- Feedback
  lead_showed_up BOOLEAN,
  feedback_requested_at TIMESTAMPTZ,
  feedback_received_at TIMESTAMPTZ,

  -- Notes
  notes TEXT,
  cancellation_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead Qualification Data (conversation history)
CREATE TABLE lead_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  answer_type TEXT CHECK (answer_type IN ('text', 'multiple_choice', 'number', 'boolean')),
  asked_at TIMESTAMPTZ DEFAULT NOW(),

  -- For structured data
  extracted_value JSONB
);

-- Showing Feedback
CREATE TABLE showing_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  showing_id UUID NOT NULL REFERENCES showings(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id),
  agent_id UUID REFERENCES agents(id),

  -- Feedback from lead
  lead_rating INTEGER CHECK (lead_rating >= 1 AND lead_rating <= 5),
  lead_interested BOOLEAN,
  lead_feedback_text TEXT,
  lead_concerns TEXT[],

  -- Feedback from agent
  agent_rating INTEGER CHECK (agent_rating >= 1 AND agent_rating <= 5),
  agent_notes TEXT,
  agent_next_steps TEXT,

  -- Follow-up
  followup_needed BOOLEAN DEFAULT false,
  followup_date DATE,

  collected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Performance Analytics (aggregated metrics)
CREATE TABLE agent_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Showing metrics
  showings_scheduled INTEGER DEFAULT 0,
  showings_completed INTEGER DEFAULT 0,
  showings_no_show INTEGER DEFAULT 0,
  showings_cancelled INTEGER DEFAULT 0,

  -- Lead metrics
  leads_received INTEGER DEFAULT 0,
  leads_qualified INTEGER DEFAULT 0,
  leads_converted INTEGER DEFAULT 0,

  -- Response time
  avg_response_time_seconds INTEGER,

  -- Revenue (optional)
  deals_closed INTEGER DEFAULT 0,
  revenue_generated DECIMAL(12, 2),

  UNIQUE(agent_id, date)
);
```

### Indexes for Performance

```sql
-- Properties
CREATE INDEX idx_properties_agent ON properties(agent_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_search ON properties USING GIN(search_vector);
CREATE INDEX idx_properties_embedding ON properties USING ivfflat(embedding vector_cosine_ops);

-- Leads
CREATE INDEX idx_leads_agent ON leads(agent_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_whatsapp ON leads(whatsapp_number);
CREATE INDEX idx_leads_qualified ON leads(qualified_at) WHERE qualification_score >= 70;

-- Showings
CREATE INDEX idx_showings_agent ON showings(agent_id);
CREATE INDEX idx_showings_property ON showings(property_id);
CREATE INDEX idx_showings_lead ON showings(lead_id);
CREATE INDEX idx_showings_scheduled ON showings(scheduled_at);
CREATE INDEX idx_showings_status ON showings(status);

-- Analytics
CREATE INDEX idx_analytics_agent_date ON agent_analytics(agent_id, date DESC);
```

### Row Level Security (RLS)

```sql
-- Agents can only see their own data
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents can view own profile" ON agents FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Agents can update own profile" ON agents FOR UPDATE USING (user_id = auth.uid());

-- Properties
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents can view own properties" ON properties FOR SELECT USING (
  agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid())
);
CREATE POLICY "Agents can manage own properties" ON properties FOR ALL USING (
  agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid())
);

-- Leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents can view own leads" ON leads FOR SELECT USING (
  agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid())
);
CREATE POLICY "Agents can manage own leads" ON leads FOR ALL USING (
  agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid())
);

-- Similar RLS policies for showings, feedback, qualifications, analytics
```

---

## Implementation Roadmap

### Phase 1: MVP (4-6 weeks) - Single agent, basic scheduling

**Week 1-2: Foundation**
- ✅ Create new tables (agents, properties, showings, leads)
- ✅ Google Calendar OAuth flow + API integration
- ✅ Agent onboarding UI (signup, connect calendar, add properties)
- ✅ Property listing form (address, price, photos, description)

**Week 3-4: AI & Scheduling**
- ✅ New AI intents: `showing_request`, `lead_qualification`, `showing_confirmation`
- ✅ Qualification conversation flow (budget, timeline, financing, how soon)
- ✅ Scheduling logic:
  - Check agent's Google Calendar for availability
  - Propose 3 time slots based on property's available days
  - Book on confirmation
  - Handle conflicts and double-booking prevention
- ✅ Send calendar invites to both agent and lead

**Week 5-6: Polish & Beta**
- ✅ Confirmation messages (immediate)
- ✅ Reminder messages (24 hours before showing)
- ✅ Agent dashboard (upcoming showings, leads pipeline, property list)
- ✅ Lead profile page (qualification details, showing history, notes)
- ✅ Beta test with 3-5 agents (recruit via network)
- ✅ Bug fixes & refinement based on beta feedback

**MVP Deliverable**: Agent receives showing request via WhatsApp → AI qualifies lead (5 questions) → AI checks Google Calendar → AI proposes 3 slots → Lead confirms → Both parties get calendar invite with property details

**Success Criteria**:
- 80%+ of showing requests handled without agent intervention
- <5 minute response time for all inquiries
- 90%+ calendar accuracy (no conflicts)
- Beta agents report 10+ hours saved per week

---

### Phase 2: Lead Qualification & Scoring (2-3 weeks)

**Features**:
- ✅ Structured 10-question qualification flow:
  1. Budget range?
  2. Timeline (when are you looking to buy/rent)?
  3. Financing status (pre-approved, working on it, cash)?
  4. Number of bedrooms needed?
  5. Number of bathrooms needed?
  6. Preferred locations (cities in PR)?
  7. Act 60 tax incentive investor?
  8. Where are you moving from?
  9. Have you viewed other properties?
  10. How did you find this listing?

- ✅ Lead scoring algorithm (0-100 points):
  ```javascript
  score = 0;
  // Budget alignment (25 points)
  if (budget matches property price ±20%) score += 25;
  // Timeline (25 points)
  if (timeline === 'immediately') score += 25;
  else if (timeline === '1-3mo') score += 15;
  else if (timeline === '3-6mo') score += 5;
  // Financing (25 points)
  if (financing === 'pre_approved') score += 25;
  else if (financing === 'cash_buyer') score += 25;
  else if (financing === 'working_on_it') score += 10;
  // Engagement (25 points)
  if (viewed_other_properties) score += 10;
  if (act60_investor) score += 15; // High-intent
  ```

- ✅ Auto-routing:
  - Score ≥70: Auto-schedule showing (agent gets notification)
  - Score 40-69: Route to agent for manual approval before scheduling
  - Score <40: Politely decline or offer resources (mortgage pre-approval info)

- ✅ Lead CRM dashboard:
  - Pipeline view (New → Qualified → Showing Scheduled → Active → Converted)
  - Filters (score, status, timeline, budget range)
  - Export to CSV
  - Bulk actions (tag, assign, archive)

**Success Criteria**:
- 70%+ of high-score leads convert to showings
- 50% reduction in time spent on unqualified leads
- Agents report better quality leads

---

### Phase 3: Voice Calls + Multi-Agent (3-4 weeks)

**Features**:
- ✅ Twilio Voice API integration
  - Forward agent's phone number to Twilio
  - AI voice assistant answers calls (text-to-speech Spanish/English)
  - Uses same qualification flow as WhatsApp
  - Transfers to agent if requested or if emergency

- ✅ Multi-agent support:
  - Agency admin dashboard (manage team)
  - Agent roles (admin, agent, assistant)
  - Team calendar view (all agents' schedules)
  - Lead assignment rules (round-robin, territory-based, specialty-based)

- ✅ Agent availability rules:
  - Office hours (Mon-Fri 9am-6pm)
  - Vacation mode (auto-replies: "I'm away until [date], here are my colleagues...")
  - Do Not Disturb (temporarily pause inbound requests)
  - Custom away messages

- ✅ Round-robin or skill-based routing:
  - If Lead requests luxury property → route to luxury specialist
  - If Lead speaks only English → route to bilingual agent
  - If Agent is unavailable → offer next available agent

**Success Criteria**:
- Voice calls handled with <10% transfer rate to human
- Multi-agent teams report 30%+ increase in coverage
- Zero missed opportunities due to agent unavailability

---

### Phase 4: Feedback & Analytics (2-3 weeks)

**Features**:
- ✅ Post-showing feedback request (WhatsApp survey):
  - Sent 1 hour after showing ends
  - "How was the showing? Rate 1-5 stars"
  - "Are you interested in this property? Yes/No/Maybe"
  - "Any concerns or questions?"
  - "Would you like to see other similar properties?"

- ✅ Feedback dashboard:
  - Aggregated by property (avg rating, interest level)
  - Aggregated by agent (performance, response time)
  - Time-series charts (showings per week, conversion rate)
  - Exportable reports (PDF, CSV)

- ✅ Showing analytics:
  - Scheduled vs completed vs no-shows
  - Conversion rate (showing → offer → closed deal)
  - Most popular showing times (heatmap by day/hour)
  - Avg time from inquiry to showing

- ✅ Property performance reports:
  - Which listings get most inquiries?
  - Which listings convert best?
  - Time on market vs showing activity

**Success Criteria**:
- 60%+ feedback response rate
- Agents use analytics weekly to optimize scheduling
- Clear ROI visibility (e.g., "Blok generated 47 showings this month = $23K in potential commissions")

---

### Phase 5: Advanced Features (Ongoing)

**Future Enhancements** (prioritize based on customer demand):

1. **Outlook Calendar + Apple Calendar support**
   - Microsoft Graph API for Outlook
   - CalDAV for Apple Calendar
   - Let agents choose their preferred calendar

2. **MLS integration**
   - Auto-import listings from MLS feeds
   - Sync property status (active → pending → sold)
   - Reduce manual data entry

3. **CRM integrations**
   - Salesforce, HubSpot, Follow Up Boss, KW Command
   - Two-way sync (leads, showings, notes)
   - Zapier webhooks for other tools

4. **Multi-property showings**
   - Back-to-back tours (show 3 properties in one trip)
   - Optimize route (Google Maps integration)
   - Single calendar invite with itinerary

5. **Open house coordination**
   - Mass scheduling (20+ people at same time slot)
   - Sign-in sheet (collect lead info at door)
   - Follow-up automation (thank you message + feedback request)

6. **Vacation rental booking**
   - Airbnb-style instant book
   - Payment processing (Stripe)
   - Check-in/check-out automation

7. **AI-generated property descriptions**
   - Upload photos → AI writes listing description
   - SEO-optimized for Zillow, Realtor.com
   - Spanish + English versions

8. **Virtual tour scheduling**
   - Video call integration (Zoom, Google Meet)
   - Screen share property photos/floor plans
   - Record tours for later review

9. **SMS fallback**
   - For leads who don't use WhatsApp
   - Same conversation flow, different channel

10. **Agent performance leaderboard**
    - Gamification (most showings, highest conversion, best response time)
    - Monthly awards, team competition

---

## Branding Strategy

### Decision: **Expand "Blok" (Keep Name, Broaden Positioning)**

**From**: "AI for condo associations"
**To**: "AI communication platform for Puerto Rico real estate"

### New Brand Positioning

**Mission**: Blok is the AI foundation that runs every property business in Puerto Rico—from condo associations to real estate agencies to vacation rentals.

**Vision**: Every property conversation, automated.

**Tagline Options** (A/B test these):
1. **"Blok: Every property conversation, automated"** ✅ Recommended
2. "Blok: AI that handles your property conversations"
3. "Blok: Property communication, powered by AI"
4. "Blok: The AI behind every property in Puerto Rico"
5. "Blok: AI that runs your property business while you sleep"

### Why "Blok" Still Works

- **"Blok"** = Building Block = Foundation for your business ✅
- Abstract enough to cover multiple use cases (condos, houses, rentals)
- Sounds tech-forward, not outdated
- Easy to explain: "Like ChatGPT, but for property professionals"
- .com domain already owned ✅

### Product Architecture (Two-Product Strategy)

Keep "Blok" as umbrella, create clear product lines:

```
Blok
├── Blok for Property Managers (existing)
│   ├── Resident messaging
│   ├── Maintenance tracking
│   ├── Payment reminders
│   └── Broadcast announcements
│
└── Blok for Agents (NEW)
    ├── Showing coordination
    ├── Lead qualification
    ├── 24/7 availability
    └── Calendar integration
```

**Homepage Structure**:
```
Blok: AI for Property Professionals in Puerto Rico
├── Property Managers → Condo/HOA features
├── Real Estate Agents → Showing coordination
└── Vacation Rentals → Booking automation (coming soon)
```

### Visual Identity Evolution

**Current Blok** (Building-Focused):
- Logo: Stacked blocks/building icon
- Colors: Blue (trust), gray (professional)
- Imagery: Condo buildings, residents, meetings

**New Blok** (Property-Focused):
- Logo: Same logo, but reframe meaning (building blocks = foundation of business)
- Colors: Keep blue, add warm accent (orange/coral) for approachability
- Imagery: Mix of condos, houses, agents with clients, families, WhatsApp screenshots

### Marketing Messaging Framework

**Problem**: Property professionals lose money to missed calls, unqualified leads, and manual scheduling

**Solution**: Blok's AI handles every property conversation 24/7 on WhatsApp

**Proof**:
- "Blok manages 2,500+ units in San Juan"
- "Blok schedules 500+ showings per month"
- "Blok saves agents 15 hours per week"

**Call to Action**: "Start Free Trial" (30 days, no credit card)

---

## Landing Page Copy

### Homepage (Universal Entry Point)

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NAVBAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Blok Logo] Product ▾ | Pricing | Resources | Login | [Try Free]

Product Dropdown:
→ For Property Managers
→ For Real Estate Agents (NEW)
→ For Vacation Rentals (coming soon)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HERO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your AI receptionist for every property conversation

Blok handles resident requests, buyer inquiries, and booking questions
24/7 via WhatsApp—in Spanish and English. Built for Puerto Rico.

[Start Free Trial] [Watch Demo]

Trusted by 50+ property managers and agents in San Juan, Dorado, Rincón


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROBLEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Stop losing money to missed calls and messages

❌ You can't answer WhatsApp 24/7
❌ Unqualified leads waste your time
❌ Residents wait days for simple answers
❌ Showings are a scheduling nightmare

🤖 Blok's AI handles it all—instantly


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOLUTION (3 COLUMNS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────┬──────────────────────────┬──────────────────────────┐
│ For Property Managers   │ For Real Estate Agents   │ For Vacation Rentals     │
├─────────────────────────┼──────────────────────────┼──────────────────────────┤
│ ✅ Resident messaging    │ ✅ Showing coordination   │ ✅ Guest messaging        │
│ ✅ Maintenance tracking  │ ✅ Lead qualification     │ ✅ Check-in/out           │
│ ✅ Payment reminders     │ ✅ 24/7 availability      │ ✅ Review requests        │
│ ✅ Broadcast announcements│ ✅ Calendar integration   │ ✅ Booking automation     │
│                         │                          │                          │
│ → [Learn More]          │ → [Learn More]           │ → [Join Waitlist]        │
└─────────────────────────┴──────────────────────────┴──────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOW IT WORKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Connect your WhatsApp Business number
2. Add your properties, residents, or listings
3. AI handles every conversation—day or night

[See Demo Video]


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TESTIMONIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"Blok saves me 15 hours per week on maintenance requests.
It's like having a full-time assistant."
— María G., Property Manager, San Juan

"I went from missing 50% of buyer calls to booking showings 24/7.
Game changer."
— Carlos R., Realtor, Dorado

"Our condo board loves that residents get instant answers.
Complaints dropped 60%."
— José L., HOA President, Condado


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRICING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────┬───────────────────────┬─────────────────────┐
│ Property Manager    │ Real Estate Agent     │ Enterprise          │
├─────────────────────┼───────────────────────┼─────────────────────┤
│ $99/month           │ $75/month             │ Custom pricing      │
│ 20-100 units        │ Unlimited showings    │ 500+ units/agents   │
│ Payment tracking    │ Lead qualification    │ White-label         │
│ Maintenance board   │ Calendar sync         │ Dedicated support   │
│ Broadcast messages  │ Feedback collection   │ API access          │
│                     │                       │                     │
│ [Start Trial]       │ [Start Trial]         │ [Contact Sales]     │
└─────────────────────┴───────────────────────┴─────────────────────┘

30-day free trial • No credit card required • Cancel anytime


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FAQ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q: Do I need a separate WhatsApp number?
A: Yes, you'll need a WhatsApp Business API number. We help you set it up.

Q: Can Blok speak Spanish?
A: Yes! Blok is fluent in Puerto Rican Spanish and English. It auto-detects language.

Q: What if the AI doesn't understand something?
A: Blok routes complex questions to you with full context. You never lose control.

Q: Does it integrate with my calendar?
A: Yes, Google Calendar, Outlook, and Apple Calendar (coming soon).

Q: Can I try it before paying?
A: Absolutely. 30-day free trial, no credit card required.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FOOTER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Blok • AI for Property Professionals in Puerto Rico

Product              Resources           Company
- For Managers       - Blog              - About
- For Agents         - Case Studies      - Careers
- For Rentals        - API Docs          - Contact
- Pricing            - Help Center       - Privacy

© 2025 Blok. Made with ❤️ in Puerto Rico.
```

---

### Agent-Specific Landing Page (`/agents`)

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HERO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Never miss a buyer again

Blok's AI answers calls, qualifies leads, and books showings
24/7—even when you're with clients. Built for Puerto Rico realtors.

[Try Free for 30 Days]


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE PROBLEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You're losing $10K+ per month to missed opportunities

🚫 Buyers text at 9pm, you're with family
🚫 Out-of-town investors call during showings
🚫 Unqualified leads waste your time
🚫 Manual scheduling = back-and-forth for days

Every missed call = lost commission


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE SOLUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your AI showing coordinator (on WhatsApp)

✅ Answers buyer inquiries instantly (Spanish/English)
✅ Asks qualifying questions (budget, timeline, Act 60 investor?)
✅ Checks your calendar and books showings
✅ Sends confirmation + reminders to both parties
✅ Collects feedback after every showing

Cost: $75/month (cheaper than 1 hour of your time)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOW IT WORKS (EXAMPLE CONVERSATION)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Buyer (via WhatsApp, 10pm):
"Hola, ¿puedo ver la propiedad en Dorado mañana?"

Blok AI:
"¡Claro! Tengo disponibilidad mañana a las 10am, 2pm, o 4pm.
¿Cuál te funciona mejor?"

Buyer: "2pm"

Blok AI:
"Perfecto. ¿Cuál es tu presupuesto aproximado?"

Buyer: "Entre $500K-700K"

Blok AI:
"Excelente. ¿Estás pre-aprobado para un préstamo?"

Buyer: "Sí, con FirstBank"

Blok AI:
"✅ Confirmado. Te espero mañana a las 2pm en Calle Sol #123, Dorado.
Te envié los detalles por WhatsApp y calendario."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Agent receives]:
"🎯 HIGH-QUALITY LEAD: María López, pre-approved $500-700K,
showing tomorrow 2pm. View profile →"


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURES (4 COLUMNS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Calendar Integration
   Syncs with Google, Outlook, Apple Calendar
   No double-bookings, smart scheduling

🎯 Lead Qualification
   Filters tire-kickers, surfaces serious buyers
   Budget, timeline, financing, Act 60 status

💬 WhatsApp + Voice (coming soon)
   Text and call handling (English/Spanish)
   Natural Puerto Rican Spanish dialect

📊 Dashboard & CRM
   Lead pipeline, showing history, feedback
   Export to Excel, integrate with CRM


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TESTIMONIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"I closed 3 deals last month that started with 11pm WhatsApp messages.
Blok doesn't sleep."
— Carlos R., Keller Williams Dorado

"The lead qualification is scary good. It knows the difference between
a $300K buyer and a $2M Act 60 investor."
— Ana M., Luxury Realtor, Condado

"Setup took 20 minutes. First showing booked within 2 hours.
Worth every penny."
— Luis G., RE/MAX San Juan


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRICING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌───────────────────────┬───────────────────────┬───────────────────────┐
│ Solo Agent            │ Small Agency          │ Large Brokerage       │
├───────────────────────┼───────────────────────┼───────────────────────┤
│ $75/month             │ $60/agent/month       │ Custom pricing        │
│ Unlimited showings    │ 5-20 agents           │ 50+ agents            │
│ Lead qualification    │ Team calendar         │ White-label           │
│ Google Calendar       │ Reporting dashboard   │ API access            │
│ WhatsApp + SMS        │ Role-based access     │ Dedicated support     │
│                       │                       │                       │
│ [Try 30 Days Free]    │ [Contact Sales]       │ [Contact Sales]       │
└───────────────────────┴───────────────────────┴───────────────────────┘

No credit card required • Cancel anytime


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FAQ (AGENT-SPECIFIC)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q: Will buyers know they're talking to AI?
A: They'll interact naturally via WhatsApp. Most assume it's your assistant.

Q: What if a lead wants to speak to me directly?
A: Blok can transfer calls or say "The agent will call you within 1 hour."

Q: Can I review leads before Blok books showings?
A: Yes! You can enable "manual approval" mode. Or let high-score leads auto-book.

Q: Does it work with my MLS listings?
A: Not yet, but MLS integration is coming in Q2 2025. You can manually add listings.

Q: What about open houses?
A: Coming soon! Multi-attendee scheduling is on the roadmap.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ready to never miss a lead again?

[Start Your 30-Day Free Trial]

No credit card required. Setup in 15 minutes.
```

---

## Business Model

### Pricing Strategy

**Tiered Pricing by Audience**:

| Customer Type | Price | Target Market | Features |
|---------------|-------|---------------|----------|
| **Property Manager** | $99/month | 20-100 units | Resident messaging, maintenance, payments |
| **Solo Agent** | $75/month | 1 agent | Showing coordination, lead qualification |
| **Small Agency** | $60/agent/month | 5-20 agents | Team dashboard, multi-agent routing |
| **Large Brokerage** | Custom | 50+ agents | White-label, API access, dedicated support |
| **Vacation Rental** | $49/month (future) | 1-10 properties | Guest messaging, booking automation |

**Why These Prices?**:
- **$99 for property managers**: Competitive with existing tools (AppFolio, Buildium charge $200-500/mo but include accounting)
- **$75 for agents**: Lower than ShowingTime ($99/mo), way cheaper than VA ($500+/mo)
- **Volume discounts**: Agencies get 20% off to incentivize team adoption
- **Future upsells**: Voice calls (+$30/mo), CRM integration (+$50/mo), custom training (+$200 one-time)

### Revenue Model Options

**Option 1: Monthly Subscription (Recommended)**
- Predictable recurring revenue
- Simple to explain
- Industry standard

**Option 2: Pay-Per-Showing**
- $5-10 per booked showing
- Lower barrier to entry
- Variable revenue (risky)

**Option 3: Freemium**
- First 20 showings free per month
- Then $75/month for unlimited
- Good for market penetration, but complicates sales

**Recommendation**: Stick with monthly subscription. Add usage-based pricing later if customers demand it.

### Financial Projections

**Conservative Scenario**:
| Month | Agents | MRR | Managers | MRR | Total MRR | Cumulative |
|-------|--------|-----|----------|-----|-----------|------------|
| 1-3   | 5      | $375 | 50       | $4,950 | $5,325    | $15,975    |
| 4-6   | 20     | $1,500 | 55     | $5,445 | $6,945    | $36,810    |
| 7-9   | 50     | $3,750 | 60     | $5,940 | $9,690    | $65,880    |
| 10-12 | 100    | $7,500 | 70     | $6,930 | $14,430   | $108,450   |

**Year 1 Total Revenue**: ~$108K
**Year 1 Net Profit**: $40K (after $68K costs: dev, hosting, support, marketing)

**Aggressive Scenario**:
| Month | Agents | MRR | Total MRR | ARR |
|-------|--------|-----|-----------|-----|
| 6     | 50     | $3,750 | $10K     | $120K |
| 12    | 200    | $15,000 | $22K    | $264K |
| 24    | 500    | $37,500 | $45K    | $540K |
| 36    | 1,000  | $75,000 | $82K    | $984K |

**3-Year Goal**: $1M ARR

### Cost Structure

**Fixed Costs (Monthly)**:
- Hosting (Vercel, Supabase): $200
- Twilio (WhatsApp, Voice): $500
- Anthropic (Claude AI): $800
- OpenAI (embeddings): $100
- Google Workspace: $20
- Tools (Figma, analytics): $80
**Total**: ~$1,700/month

**Variable Costs**:
- Customer support: $15/customer/month (outsource to VA)
- Sales commissions: 10% of first year (if using sales reps)

**Break-Even**: ~120 customers ($10K MRR) = Month 8-10

---

## Go-to-Market Strategy

### Target Customers (Prioritized)

**Tier 1: Easiest to Acquire** (Month 1-6)
1. **High-volume vacation rental managers**
   - Already Blok customers (property managers)
   - Natural upsell: "Want to automate showings too?"
   - 20 potential customers in existing base

2. **Solo luxury agents**
   - High-value deals ($1M+ properties)
   - Serve Act 60 investors (wealthy, tech-savvy)
   - Willing to pay for quality tools
   - 50-100 agents in PR market

**Tier 2: Medium Effort** (Month 6-12)
3. **Boutique agencies**
   - 5-20 agents in San Juan, Dorado, Rincón
   - Agile, fast adoption
   - Decision-maker is owner/broker
   - 30-40 agencies in PR

**Tier 3: Slow Burn** (Month 12+)
4. **Large brokerages**
   - Keller Williams, RE/MAX, Century 21
   - Slow decision-making (committees)
   - High contract value ($3K-10K/month)
   - 5-10 major brokerages in PR

### Distribution Channels

**1. Direct Outreach** (Primary, Month 1-6)
- LinkedIn: Connect with PR realtors, send personalized demo offers
- WhatsApp: Direct message (not spam, personalized)
- Local networking: AREPR events, Colegio de CPA breakfasts
- Cold email: Personalized, 3-touch sequence

**2. Content Marketing** (SEO, Month 3+)
- Blog posts:
  - "How AI is revolutionizing real estate in Puerto Rico"
  - "Act 60 buyers: What agents need to know"
  - "5 ways to never miss a buyer call again"
- YouTube: Demo videos, customer testimonials
- Podcast: Interview top PR agents about tech adoption

**3. Brokerage Partnerships** (Strategic, Month 6+)
- Partner with KW Puerto Rico (largest, most tech-forward)
- Offer wholesale pricing ($50/agent for 20+ agents)
- Co-marketing: Blok featured in broker's newsletter

**4. Referral Program** (Month 3+)
- Give $50 credit for each referred agent
- 2-sided incentive: Referrer gets $50, referee gets 1 month free
- Track with unique referral codes

**5. Paid Ads** (Month 6+, test small)
- Facebook/Instagram: Target "Real Estate Agent" + "Puerto Rico"
- Google Ads: "real estate showing software puerto rico"
- Budget: $1K/month test, scale if CAC <$200

### Launch Plan (Month by Month)

**Month 1: Build MVP, Recruit Beta**
- Finish Phase 1 development
- Recruit 5 beta agents (personal network, LinkedIn)
- Free in exchange for feedback

**Month 2-3: Beta Testing**
- 5 agents use Blok for 30 days
- Collect feedback, fix bugs, iterate
- Get testimonials and case studies

**Month 4: Public Launch**
- Website live with /agents page
- Press release to Caribbean Business, NotiCel, Metro
- LinkedIn post: "We're expanding Blok to serve real estate agents!"
- Goal: 10 paying agents

**Month 5-6: Early Traction**
- Direct outreach: 100 LinkedIn connections, 50 WhatsApp messages
- Partner with 1 boutique agency (5-10 agents)
- Goal: 50 agents

**Month 7-12: Scale**
- Content marketing: 2 blog posts/month
- Brokerage partnership: KW Puerto Rico pilot (20 agents)
- Referral program launch
- Goal: 200 agents

**Year 2: Accelerate**
- Voice calls (Phase 3)
- Multi-agent support
- Open house features
- Goal: 500 agents, $37K MRR

---

## Competitive Analysis

### Direct Competitors

| Competitor | Strengths | Weaknesses | Blok's Advantage |
|------------|-----------|------------|------------------|
| **ShowingTime** | Established, MLS integration | $99/mo, no WhatsApp, no AI, US-only | WhatsApp, bilingual, AI qualification, $25/mo cheaper |
| **Calendly** | Simple, cheap ($15/mo) | No lead qualification, no real estate features | AI qualification, property-specific scheduling |
| **Virtual Assistant** | Human touch, flexible | $500+/mo, limited hours, not scalable | 24/7, $75/mo, instant responses |
| **ShowMojo** | Automated lockbox, self-showing | Rental-focused, no sales | Sales + rentals, human-like AI |
| **Agent Legend** | ISA (inside sales agent) training | $1,200+/mo, human-based | AI-based, 1/10th the cost |

### Indirect Competitors

- **FollowUpBoss, LionDesk, BoomTown**: CRMs, not showing coordinators
- **RealScout, Redfin**: Consumer-facing, not agent tools
- **Twilio**: Infra provider, not end-to-end solution

### Competitive Moats (Defensibility)

1. **Puerto Rico Specialization**
   - Bilingual Spanish/English (Puerto Rican dialect)
   - Act 60 investor detection
   - Local market knowledge (Dorado vs Condado vs Rincón)
   - Hard for mainland US companies to replicate

2. **WhatsApp-First**
   - Every Puerto Rican lives on WhatsApp
   - Competitors focus on SMS (less popular in PR)
   - Integration already built for Blok

3. **AI + Human Hybrid**
   - Not just scheduling (like Calendly)
   - Not just CRM (like Follow Up Boss)
   - End-to-end: inquiry → qualification → booking → feedback

4. **Existing Customer Base**
   - 50 property managers already using Blok
   - Cross-sell opportunity (managers often manage + sell)
   - Network effects (managers refer agents)

5. **Speed to Market**
   - 80% of tech already built
   - Can launch in 4-6 weeks vs 6-12 months for new entrants
   - First-mover advantage in PR market

---

## Risks & Mitigation

### Technical Risks

**Risk 1: Calendar API Complexity**
- Google, Outlook, Apple all have different APIs
- OAuth flows can break
- Double-bookings if not handled correctly

**Mitigation**:
- Start with Google Calendar only (80% market share)
- Add Outlook and Apple in Phase 3 (demand-driven)
- 15-minute buffer between showings
- Conflict detection algorithm (check calendar before proposing slots)
- Manual override for agents (can cancel/reschedule anytime)

**Risk 2: AI Misunderstanding Leads**
- AI might book wrong time or miss key details
- Lead frustration → bad reviews

**Mitigation**:
- Human-in-the-loop for first 50 showings per agent (agent reviews before confirmation)
- "Confidence score" for AI responses (only auto-book if >90% confident)
- Fallback to agent: "Let me connect you with the agent directly"
- Continuous prompt improvement based on error analysis

**Risk 3: WhatsApp API Restrictions**
- Twilio charges per message ($0.005-0.01)
- Rate limits (80 messages/sec)
- Policy violations = account suspension

**Mitigation**:
- Monitor usage, alert if approaching limits
- Follow Twilio's best practices (opt-ins, no spam)
- Have backup Twilio account in case of suspension

---

### Business Risks

**Risk 1: Agents Don't Trust AI with Leads**
- Fear of losing control
- "What if AI says something wrong?"

**Mitigation**:
- Free 30-day trial (no credit card required)
- White-glove onboarding (1-on-1 setup call)
- "AI assistant, not replacement" messaging
- Show audit trail (every conversation logged)
- Testimonials from respected PR agents

**Risk 2: Market Education Required**
- Most agents don't know this technology exists
- Skepticism about AI in conservative industry

**Mitigation**:
- Partner with brokerages for endorsement (KW, RE/MAX)
- Case studies with real numbers ("Closed 3 deals from after-hours messages")
- Video demos (not just text)
- Free lunch-and-learn sessions for agencies

**Risk 3: Slow Adoption Curve**
- Real estate is relationship-driven
- Agents may resist automation

**Mitigation**:
- Target tech-forward agents first (luxury, Act 60 specialists)
- Show ROI quickly (first showing booked within 48 hours)
- Referral program (agents convince other agents)
- Freemium model if needed (first 20 showings free)

**Risk 4: Competitors Copy the Idea**
- ShowingTime could add WhatsApp
- Calendly could add AI qualification

**Mitigation**:
- Move fast (launch in 4-6 weeks, not 6 months)
- Puerto Rico specialization is hard to replicate
- Build network effects (more agents = more referrals)
- Continuous innovation (voice calls, open houses, MLS integration)

---

### Operational Risks

**Risk 1: Customer Support Overhead**
- Agents need hand-holding during setup
- Calendar syncing issues
- AI makes mistakes

**Mitigation**:
- Hire part-time VA for customer support ($15/hr, 20 hrs/week)
- Self-service help center (videos, FAQs)
- In-app chat support (via Intercom or Crisp)
- Prioritize high-value customers (agencies over solo agents)

**Risk 2: Churn**
- Agents try for 1 month, then cancel
- Not seeing ROI fast enough

**Mitigation**:
- Onboarding checklist (ensure first showing booked within 7 days)
- Proactive outreach: "How's it going? Any questions?"
- Quarterly business reviews: "You booked 47 showings, generated $23K in potential commissions"
- Feature releases (keep product fresh)

---

## Next Steps

### Immediate Actions (This Week)

**Customer Discovery** (5-10 hours):
1. Interview 10 real estate agents in Puerto Rico:
   - Solo agents (3)
   - Boutique agency agents (4)
   - Luxury/Act 60 specialists (3)

   **Questions to Ask**:
   - How do you currently schedule showings?
   - What tools do you use? (calendar, CRM, scheduling software)
   - What % of buyer inquiries come after hours (6pm-9am)?
   - How many leads do you lose per month due to slow response time?
   - How do you qualify leads before booking showings?
   - Would you pay $75/month for a WhatsApp AI that books showings 24/7?
   - What features are must-haves vs nice-to-haves?

2. Analyze interview data:
   - Common pain points?
   - Deal-breakers?
   - Price sensitivity?
   - Feature requests?

**Competitive Research** (2-3 hours):
1. Sign up for ShowingTime (free trial)
2. Try Calendly for real estate
3. Research ScheduleOnce, ShowMojo
4. Document: What do they do well? What are gaps? Pricing?

---

### Technical Spike (Next Week)

**Google Calendar API Proof-of-Concept** (8-10 hours):
1. Build OAuth flow for agent authorization
   - Agent clicks "Connect Google Calendar"
   - Redirects to Google consent screen
   - Stores access token + refresh token in database (encrypted)

2. Read events (check availability)
   - Query calendar for next 7 days
   - Return free/busy time slots
   - Handle recurring events, all-day events

3. Create events (book showing)
   - Agent's calendar: "Showing at 123 Main St with John Doe"
   - Lead's calendar: Invite sent via email
   - Include property address, agent contact, Zoom link (for virtual)

4. Error handling
   - Token expiration → refresh token flow
   - Calendar not found → prompt to reconnect
   - Double-booking detected → show error, don't book

**AI Prompt Engineering** (4-6 hours):
1. Showing request detection
   - Spanish: "¿Puedo ver la casa?", "Quiero hacer un appointment"
   - English: "Can I see the property?", "When can I tour?"

2. Qualification questions (bilingual)
   ```
   Q: ¿Cuál es tu presupuesto aproximado?
   A: [Wait for response]

   Q: ¿Cuándo estás buscando comprar? (inmediatamente, 1-3 meses, etc.)
   A: [Wait for response]

   Q: ¿Tienes pre-aprobación de un banco?
   A: [Wait for response]
   ```

3. Test with 20 sample conversations
   - Does AI correctly identify intent?
   - Does it ask the right follow-up questions?
   - Does it handle "I don't know" gracefully?

---

### Month 1 (MVP Development)

See [Implementation Roadmap](#implementation-roadmap) → Phase 1

**Goal**: Working prototype with Google Calendar integration, showing booking, lead qualification

**Success Criteria**:
- Agent can add property listings
- Lead can request showing via WhatsApp
- AI qualifies lead (5 questions)
- AI checks Google Calendar for availability
- AI proposes 3 time slots
- Lead confirms → both get calendar invite
- Zero manual intervention required

---

### Decision Points

**Week 1 Decision: Proceed or Pivot?**
- If 7+ out of 10 agents say "Yes, I'd pay $75/mo" → GREEN LIGHT
- If 4-6 agents say yes → MAYBE (lower price to $50/mo or add more features)
- If <4 agents say yes → PIVOT (focus on vacation rentals or property managers only)

**Week 2 Decision: Build In-House or Outsource?**
- If calendar API is straightforward → Build in-house (you have 80% done)
- If calendar API is complex → Consider contractor for that piece only

**Month 2 Decision: Pricing Model?**
- If beta agents love it → $75/mo subscription
- If beta agents hesitant → Try $49/mo or freemium (20 showings free)
- If agencies want white-label → Custom pricing ($200-500/mo)

---

## Key Performance Indicators (KPIs)

### North Star Metric
**Showings Booked per Month** (agent success = Blok's success)

### Supporting Metrics

**Acquisition**:
- Trial signups per month (goal: 20 in Month 4, 50 in Month 6)
- Trial-to-paid conversion rate (goal: 40%+)
- CAC (customer acquisition cost, goal: <$200)

**Activation**:
- % of agents who connect calendar within 7 days (goal: 80%)
- % of agents who add ≥1 property within 7 days (goal: 90%)
- Time to first showing booked (goal: <7 days)

**Engagement**:
- Showings booked per agent per month (goal: 10+)
- Leads qualified per agent per month (goal: 20+)
- AI auto-booking rate (goal: 70%+ no human needed)

**Retention**:
- Monthly churn rate (goal: <5%)
- NPS (Net Promoter Score, goal: 50+)
- Reasons for cancellation (track to improve product)

**Revenue**:
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- ARPU (Average Revenue Per User)
- LTV (Lifetime Value, goal: $1,200+ = 16 months retention)

**Operational**:
- AI accuracy (% of conversations handled correctly, goal: 95%+)
- Calendar sync errors (goal: <1% of events)
- Support tickets per customer per month (goal: <0.5)

---

## Success Metrics (12-Month Goals)

| Metric | Month 6 | Month 12 | Year 2 | Year 3 |
|--------|---------|----------|--------|--------|
| **Agents** | 50 | 200 | 500 | 1,000 |
| **MRR** | $3,750 | $15,000 | $37,500 | $75,000 |
| **ARR** | $45K | $180K | $450K | $900K |
| **Showings/Month** | 500 | 2,000 | 5,000 | 10,000 |
| **Churn Rate** | 8% | 5% | 4% | 3% |
| **NPS** | 40 | 50 | 60 | 70 |

---

## Final Recommendation

**GREEN LIGHT THIS PROJECT** ✅

**Why**:
1. **Strategic Fit**: Natural extension of Blok's core strengths (WhatsApp, AI, bilingual, property focus)
2. **Market Opportunity**: 6,000 agents in PR, zero competitors with bilingual WhatsApp AI
3. **Technical Feasibility**: 80% of infrastructure already built, 4-6 weeks to MVP
4. **Financial Upside**: Path to $100K MRR in 3 years with <$200K investment
5. **Competitive Moat**: Puerto Rico specialization, WhatsApp-first, AI-powered qualification

**Timeline**:
- **Week 1**: Customer discovery (10 agent interviews)
- **Week 2**: Technical spike (Google Calendar POC + AI prompts)
- **Weeks 3-6**: Build MVP (Phase 1)
- **Month 3**: Beta test with 5 agents
- **Month 4**: Public launch
- **Month 12**: 200 agents, $15K MRR

**First Action**:
Interview 10 agents this week. If 7+ say yes → full steam ahead. If not → adjust pricing or features.

**Branding Decision**:
Expand "Blok" to "AI communication platform for property professionals." Keep name, broaden positioning. Update homepage to show two product lines: "For Property Managers" + "For Agents."

---

## Document Version History

- **v1.0** (January 22, 2025): Initial strategy document created
- **Status**: Ready for customer discovery and technical validation

---

## Contact & Questions

For questions about this strategy document, contact:
- **Strategic Lead**: Jan Faris
- **Technical Lead**: [To be assigned]
- **Marketing Lead**: [To be assigned]

Next review: After 10 customer discovery interviews (Week 1)
