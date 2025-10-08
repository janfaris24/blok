# Blok MVP - Implementation Checklist

## 📋 Phase 1: Setup & Infrastructure (Week 1)

### Environment Setup

- [ ] Create new Next.js 14 project with TypeScript
  ```bash
  npx create-next-app@latest condosync --typescript --tailwind --app
  ```
- [ ] Install core dependencies
  ```bash
  npm install @anthropic-ai/sdk @supabase/supabase-js twilio zod date-fns
  ```
- [ ] Install UI dependencies
  ```bash
  npm install @radix-ui/react-dialog @radix-ui/react-select lucide-react
  npx shadcn-ui@latest init
  ```
- [ ] Set up environment variables in `.env.local`
- [ ] Configure `next.config.ts` for API routes
- [ ] Set up Git repository

### Supabase Setup

- [ ] Create Supabase project at https://supabase.com
- [ ] Copy project URL and anon key to `.env.local`
- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] Initialize Supabase: `supabase init`
- [ ] Link to project: `supabase link --project-ref your-ref`
- [ ] Create migration file: `supabase/migrations/001_condosync_schema.sql`
- [ ] Copy full schema from `BLOK_TECHNICAL_GUIDE.md`
- [ ] Run migration: `supabase db push`
- [ ] Verify tables in Supabase dashboard

### Twilio Setup

- [ ] Sign up for Twilio account at https://www.twilio.com
- [ ] Get Account SID and Auth Token
- [ ] Add to `.env.local`
- [ ] Request WhatsApp Business API access (can take 1-3 days)
- [ ] While waiting, use WhatsApp Sandbox for testing
- [ ] Join sandbox: Send "join [code]" to Twilio WhatsApp number
- [ ] Note sandbox number for testing

### Anthropic Setup

- [ ] Sign up for Anthropic account at https://console.anthropic.com
- [ ] Generate API key
- [ ] Add to `.env.local` as `ANTHROPIC_API_KEY`
- [ ] Test API key with simple request

---

## 📝 Phase 2: Core Backend (Week 1-2)

### Database Client Setup

- [ ] Create `src/lib/supabase-client.ts` (client-side)
  ```typescript
  import { createBrowserClient } from '@supabase/ssr'
  export const createClient = () => createBrowserClient(...)
  ```
- [ ] Create `src/lib/supabase-server.ts` (server-side)
  ```typescript
  import { createServerClient } from '@supabase/ssr'
  export const createClient = () => createServerClient(...)
  ```
- [ ] Test connection by fetching buildings table

### AI Message Analysis

- [ ] Create `src/lib/condosync-ai.ts`
- [ ] Implement `analyzeMessage()` function
- [ ] Define `AIAnalysisResult` interface
- [ ] Test with sample messages in Spanish and English
- [ ] Verify intent detection accuracy
- [ ] Test emergency detection

### WhatsApp Client

- [ ] Create `src/lib/whatsapp-client.ts`
- [ ] Implement `sendWhatsAppMessage(to, from, body)` function
- [ ] Test sending message to your own phone
- [ ] Implement `sendBulkWhatsApp()` for broadcasts
- [ ] Add rate limiting (15ms delay between messages)

### WhatsApp Webhook Endpoint

- [ ] Create `src/app/api/webhooks/whatsapp/route.ts`
- [ ] Implement POST handler
- [ ] Parse Twilio webhook data (FormData)
- [ ] Look up building by WhatsApp number
- [ ] Look up resident by phone number
- [ ] Find or create conversation
- [ ] Call AI analysis
- [ ] Save incoming message to database
- [ ] Send AI response back to resident
- [ ] Handle unknown residents gracefully
- [ ] Test with Twilio sandbox

### Message Router

- [ ] Create `src/lib/message-router.ts`
- [ ] Implement `routeMessage()` function
- [ ] Route to owner if renter sends message
- [ ] Route to admin for emergencies
- [ ] Test routing logic

### Maintenance Request Auto-Creation

- [ ] In webhook endpoint, check if intent is `maintenance_request`
- [ ] Create maintenance_requests record
- [ ] Link to conversation
- [ ] Extract category, priority from AI analysis
- [ ] Test end-to-end: WhatsApp message → maintenance request created

---

## 🎨 Phase 3: Admin Dashboard (Week 2-3)

### Authentication

- [ ] Create `src/app/auth/page.tsx` (login page)
- [ ] Use Supabase Auth
- [ ] Implement login with email/password
- [ ] Add auth middleware for `/dashboard/*` routes
- [ ] Test login flow

### Dashboard Layout

- [ ] Create `src/app/dashboard/layout.tsx`
- [ ] Add sidebar navigation
  - Overview
  - Conversations
  - Broadcasts
  - Maintenance
  - Residents
  - Settings
- [ ] Add header with building name and logout button
- [ ] Make responsive (mobile menu)

### Overview Page

- [ ] Create `src/app/dashboard/overview/page.tsx`
- [ ] Show key stats:
  - Total residents (owners vs renters)
  - Open maintenance requests
  - Messages today
  - Active conversations
- [ ] Add quick action buttons:
  - Send broadcast
  - Add resident
  - View maintenance queue
- [ ] Test with sample data

### Conversations List

- [ ] Create `src/app/dashboard/conversations/page.tsx`
- [ ] Fetch conversations from Supabase
- [ ] Show resident name, last message, time
- [ ] Filter by status (active/resolved/archived)
- [ ] Click conversation → open detail page

### Conversation Detail

- [ ] Create `src/app/dashboard/conversations/[id]/page.tsx`
- [ ] Show message thread (resident/AI/admin messages)
- [ ] Implement real-time updates (Supabase subscriptions)
- [ ] Add reply input (admin can send message)
- [ ] Show resident info sidebar (name, unit, contact)
- [ ] Add "Mark as Resolved" button

### Message Thread Component

- [ ] Create `src/components/condosync/MessageThread.tsx`
- [ ] Display messages in chat bubble format
- [ ] Color code: resident (green), AI (gray), admin (blue)
- [ ] Auto-scroll to bottom on new message
- [ ] Show timestamps
- [ ] Test real-time updates

### Send Message API

- [ ] Create `src/app/api/messages/send/route.ts`
- [ ] Accept conversationId and content
- [ ] Get building and resident info
- [ ] Send via WhatsApp
- [ ] Save admin message to database
- [ ] Return success/error

---

## 📢 Phase 4: Broadcast System (Week 3)

### Broadcast Composer UI

- [ ] Create `src/app/dashboard/broadcasts/create/page.tsx`
- [ ] Add form fields:
  - Title
  - Message content (textarea)
  - Target audience (select: all/owners/renters/specific units)
  - Channels (checkboxes: WhatsApp/Email/SMS)
  - Schedule (date/time picker or "Send Now")
- [ ] Show recipient count preview
- [ ] Add confirmation modal before sending

### Broadcast Creation API

- [ ] Create `src/app/api/broadcasts/create/route.ts`
- [ ] Validate inputs
- [ ] Create broadcast record in database
- [ ] Set status to "draft" or "scheduled"
- [ ] Return broadcastId

### Broadcast Engine

- [ ] Create `src/lib/broadcast-engine.ts`
- [ ] Implement `sendBroadcast(broadcastId)` function
- [ ] Fetch broadcast details
- [ ] Query target residents based on audience
- [ ] Filter by opt-in preferences
- [ ] Send via WhatsApp using bulk function
- [ ] Update broadcast status to "sent"
- [ ] Track delivery count

### Broadcast Send API

- [ ] Create `src/app/api/broadcasts/send/route.ts`
- [ ] Accept broadcastId
- [ ] Call `sendBroadcast()` function
- [ ] Return success/stats

### Broadcast List

- [ ] Create `src/app/dashboard/broadcasts/page.tsx`
- [ ] Show all broadcasts (newest first)
- [ ] Display: title, audience, sent date, delivery stats
- [ ] Filter by status (draft/sent)
- [ ] Click to view details

### Test Broadcast Flow

- [ ] Create test broadcast targeting yourself
- [ ] Send via WhatsApp
- [ ] Verify receipt on your phone
- [ ] Check delivery stats in dashboard

---

## 🔧 Phase 5: Maintenance Tracking (Week 3-4)

### Maintenance List Page

- [ ] Create `src/app/dashboard/maintenance/page.tsx`
- [ ] Fetch maintenance requests from Supabase
- [ ] Display in table format with columns:
  - Title
  - Unit
  - Resident
  - Priority (badge with color)
  - Status
  - Reported date
- [ ] Add filters: status, priority, category
- [ ] Sort by: priority, date
- [ ] Click request → open detail page

### Maintenance Detail Page

- [ ] Create `src/app/dashboard/maintenance/[id]/page.tsx`
- [ ] Show full details:
  - Description
  - Reporter info
  - Photos (if any)
  - Timeline (reported, assigned, resolved)
- [ ] Add action buttons:
  - Assign to admin/manager (select dropdown)
  - Update status (select: open/in progress/resolved)
  - Add comment (sends message to resident)
- [ ] Show linked conversation (if extracted by AI)

### Maintenance Update API

- [ ] Create `src/app/api/maintenance/update/route.ts`
- [ ] Accept requestId, status, assignedTo, comment
- [ ] Update maintenance_requests record
- [ ] If comment provided, send WhatsApp to resident
- [ ] Return updated request

### Maintenance Kanban Board (Optional)

- [ ] Use a Kanban library (e.g., dnd-kit)
- [ ] Columns: Open, In Progress, Resolved
- [ ] Drag and drop to update status
- [ ] Color code by priority

### Test Maintenance Flow

- [ ] Send WhatsApp message about AC not working
- [ ] Verify maintenance request auto-created
- [ ] Assign in dashboard
- [ ] Update status
- [ ] Add comment → verify resident receives WhatsApp

---

## 👥 Phase 6: Resident Management (Week 4)

### Residents List

- [ ] Create `src/app/dashboard/residents/page.tsx`
- [ ] Fetch residents from Supabase
- [ ] Display in table:
  - Name
  - Unit
  - Type (owner/renter)
  - Phone
  - Email
  - Opt-in status (icons for WhatsApp/Email/SMS)
- [ ] Add search by name or unit
- [ ] Filter by type (owner/renter)
- [ ] Add "New Resident" button

### Add Resident Form

- [ ] Create modal or separate page
- [ ] Form fields:
  - First name, last name
  - Type (owner/renter)
  - Unit number
  - Phone (required)
  - WhatsApp number (optional, defaults to phone)
  - Email (optional)
  - Preferred language (Spanish/English)
- [ ] Validate phone format
- [ ] Create residents API endpoint
- [ ] Test adding resident

### Edit Resident

- [ ] Create `src/app/dashboard/residents/[id]/page.tsx`
- [ ] Pre-fill form with resident data
- [ ] Allow updating all fields
- [ ] Update residents API endpoint
- [ ] Test updating resident

### Bulk Import (Optional)

- [ ] Add CSV upload button
- [ ] Parse CSV file
- [ ] Validate data
- [ ] Bulk insert residents
- [ ] Show import results (success/errors)

---

## ⚙️ Phase 7: Settings & Configuration (Week 4)

### Building Settings Page

- [ ] Create `src/app/dashboard/settings/page.tsx`
- [ ] Show building info (name, address, total units)
- [ ] Show WhatsApp business number
- [ ] Add form to update building details
- [ ] Update buildings API endpoint

### Admin User Management

- [ ] Show current admin users
- [ ] Add "Invite Admin" button
- [ ] Send email invite with signup link
- [ ] Test multi-admin access

### Opt-In Management

- [ ] Show opt-in statistics (% opted in per channel)
- [ ] Add "Send Opt-In Request" button
- [ ] Sends WhatsApp to all residents asking to opt-in
- [ ] Link to opt-in page with checkbox confirmation

---

## ✅ Phase 8: Testing & Refinement (Week 4)

### End-to-End Testing

- [ ] Test complete flow: WhatsApp → AI → Dashboard → Reply
- [ ] Test maintenance request creation
- [ ] Test broadcast to multiple recipients
- [ ] Test real-time updates in conversations
- [ ] Test with Spanish and English messages
- [ ] Test emergency detection
- [ ] Test routing (renter → owner)

### Error Handling

- [ ] Handle unknown residents gracefully
- [ ] Handle AI API failures (fallback response)
- [ ] Handle Twilio rate limits
- [ ] Handle database errors
- [ ] Add error logging (Sentry or similar)

### UI Polish

- [ ] Test mobile responsiveness
- [ ] Add loading states for all actions
- [ ] Add success/error toasts
- [ ] Improve typography and spacing
- [ ] Add empty states (no conversations yet, etc.)
- [ ] Add confirmation modals for destructive actions

### Performance Optimization

- [ ] Add database indexes (already in schema)
- [ ] Implement pagination for lists
- [ ] Add caching for frequently accessed data
- [ ] Optimize image loading (if photos in maintenance requests)

### Documentation

- [ ] Write admin user guide (how to use dashboard)
- [ ] Write resident onboarding guide (how to use WhatsApp bot)
- [ ] Create FAQ page
- [ ] Document API endpoints

---

## 🚀 Phase 9: Deployment (Week 4)

### Vercel Deployment

- [ ] Push code to GitHub repository
- [ ] Connect repository to Vercel
- [ ] Set environment variables in Vercel dashboard
- [ ] Deploy to production
- [ ] Test production URL

### Twilio Webhook Configuration

- [ ] Get production URL from Vercel
- [ ] Update Twilio webhook to: `https://yourdomain.com/api/webhooks/whatsapp`
- [ ] Move from sandbox to production WhatsApp number
- [ ] Test production WhatsApp flow

### Custom Domain (Optional)

- [ ] Purchase domain (e.g., condosync.app)
- [ ] Configure DNS in Vercel
- [ ] Add SSL certificate (automatic)
- [ ] Update WhatsApp webhook URL

### Monitoring Setup

- [ ] Enable Vercel Analytics
- [ ] Set up error tracking (Sentry)
- [ ] Monitor Twilio usage dashboard
- [ ] Set up uptime monitoring (e.g., UptimeRobot)

---

## 🎯 Phase 10: First Customer Onboarding (Week 5+)

### Pre-Launch Checklist

- [ ] Create demo building with sample data
- [ ] Record demo video (3-5 minutes)
- [ ] Create pricing page
- [ ] Set up payment processing (Stripe)
- [ ] Write terms of service
- [ ] Write privacy policy
- [ ] Create onboarding checklist for customers

### Customer Onboarding Process

- [ ] Schedule intro call (30 min)
- [ ] Get building info (name, address, unit count)
- [ ] Get WhatsApp business number (or help set up)
- [ ] Import resident data (CSV)
- [ ] Send opt-in request to all residents
- [ ] Train admin on dashboard (30 min)
- [ ] Provide support for first week

### First Customer Tasks

- [ ] Reach out to 10 condo associations
- [ ] Offer free 30-day trial
- [ ] Get first 3 pilot customers
- [ ] Collect feedback weekly
- [ ] Iterate based on feedback

---

## 📊 Success Metrics to Track

### Technical Metrics

- [ ] Average message delivery time
- [ ] AI response accuracy (% of messages not needing human review)
- [ ] System uptime
- [ ] Error rate

### Business Metrics

- [ ] Total buildings onboarded
- [ ] Monthly recurring revenue (MRR)
- [ ] Customer churn rate
- [ ] Average revenue per building

### User Engagement

- [ ] Resident opt-in rate
- [ ] Messages sent per day
- [ ] Broadcast open rate
- [ ] Maintenance request resolution time

---

## 🔄 Post-MVP Features (Future Phases)

### Phase 11: Polls & Voting

- [ ] Poll creation UI
- [ ] Public poll voting page
- [ ] Results dashboard
- [ ] Vote notifications via WhatsApp

### Phase 12: Email & SMS Channels

- [ ] Resend integration for email
- [ ] Twilio SMS integration
- [ ] Multi-channel broadcast sending
- [ ] Channel preference management

### Phase 13: Advanced Features

- [ ] Amenity reservation system
- [ ] Visitor management (guest lists, parking)
- [ ] HOA fee payment reminders
- [ ] Document library (bylaws, financials)
- [ ] Event calendar

### Phase 14: Analytics & Reporting

- [ ] Custom reports (messages, maintenance, etc.)
- [ ] Export data (CSV, PDF)
- [ ] Admin activity logs
- [ ] Resident engagement scores

---

## 💡 Tips for Success

### Development Tips

- **Start small:** Get WhatsApp webhook working first before building UI
- **Test frequently:** Test each feature as you build it
- **Use TypeScript:** Catch errors early with strict typing
- **Real-time updates:** Supabase subscriptions make dashboard feel alive
- **Mobile-first:** Admins will use on phone, design for small screens

### Business Tips

- **Pilot carefully:** First 3 customers are crucial for feedback
- **Listen actively:** Weekly check-ins with customers
- **Iterate fast:** Fix bugs and add features based on real usage
- **Document everything:** Good docs reduce support burden
- **Focus on outcomes:** Track time saved, not features shipped

### Common Pitfalls to Avoid

- ❌ Building too many features before validating core value
- ❌ Ignoring Spanish language quality (it's primary language!)
- ❌ Underestimating WhatsApp Business API approval time
- ❌ Not testing with real residents early
- ❌ Over-complicating the UI (keep it simple!)

---

## 📞 When to Ask for Help

Reach out if you're stuck on:

- Twilio WhatsApp Business API approval process
- Claude AI not returning expected JSON format
- Supabase RLS policies blocking queries
- Real-time subscriptions not updating UI
- Vercel deployment issues
- First customer sales pitch

---

## ✅ Definition of "MVP Done"

You're ready to launch when:

- [ ] Resident can send WhatsApp → receive AI response
- [ ] Maintenance request auto-created from message
- [ ] Admin can view conversations in dashboard
- [ ] Admin can reply to resident (sends WhatsApp)
- [ ] Admin can send broadcast to all residents
- [ ] Admin can manage residents (add/edit)
- [ ] Admin can track maintenance requests
- [ ] System deployed to production
- [ ] First 3 pilot customers lined up

**Time estimate:** 4-6 weeks for solo developer, 2-3 weeks for small team

---

## 🎉 Launch Checklist

- [ ] All MVP features working
- [ ] Tested with 10+ test messages
- [ ] Mobile-responsive dashboard
- [ ] Spanish translations verified by native speaker
- [ ] Demo video recorded
- [ ] Pricing page live
- [ ] Terms of service published
- [ ] Privacy policy published
- [ ] Support email set up (support@condosync.app)
- [ ] First customer onboarded
- [ ] Monitoring and alerts configured

**You're ready to scale! 🚀**

---

**Next:** Copy this checklist to a project management tool (Notion, Linear, GitHub Projects) and start checking off items!
