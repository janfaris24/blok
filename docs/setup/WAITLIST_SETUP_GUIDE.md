# 🎉 Waitlist Feature - Setup Guide

Complete waitlist system with email confirmations and admin notifications.

---

## ✅ What's Been Implemented

### 1. **Database Table**
- Waitlist table created in Supabase
- Tracks email, name, phone, building, source, referrer
- RLS policies: Anyone can insert, only admins can view

### 2. **API Endpoint**
- `/api/waitlist/subscribe` - Handles new signups
- Validates email
- Checks for duplicates
- Sends beautiful confirmation email
- Tracks analytics (source, referrer, user agent)

### 3. **Waitlist Modal Component**
- Beautiful dialog with form
- Email (required), Name, Phone, Building (optional)
- Bilingual (Spanish/English)
- Loading states and error handling
- Success confirmation

### 4. **Landing Page Integration**
Waitlist buttons added to:
- ✅ Hero Section (main CTA)
- ✅ Navigation Bar (desktop & mobile)
- ✅ Final CTA Section (bottom of page)

### 5. **Email Notifications**

**User Confirmation Email:**
- Sent immediately upon signup
- Bilingual (Spanish/English based on user preference)
- Welcomes them warmly 🎉
- Explains what's next (early access, discounts, etc.)
- Beautiful HTML design with gradients

**Admin Notification Email:**
- Via Supabase webhook
- Instant alert when someone joins
- Shows all contact info and signup details
- Includes source, referrer, timestamp

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Apply Migration

The migration is already created. Apply it:

```bash
# If using Supabase CLI
supabase db push

# Or run the migration in Supabase dashboard:
# Go to SQL Editor and run the create_waitlist_table migration
```

### Step 2: Environment Variables

Already configured in `.env.local`:
```bash
RESEND_API_KEY=re_xxxxx  # For sending emails
FEEDBACK_NOTIFICATION_EMAIL=janfaris@blokpr.co  # Where admin notifications go
SUPABASE_WEBHOOK_SECRET=your-secret  # For webhook authentication
```

### Step 3: Configure Supabase Webhook

Go to: https://supabase.com/dashboard → Your Project → Database → Webhooks

**Create Webhook:**
- **Name:** `waitlist-notification`
- **Table:** `waitlist`
- **Events:** ✅ INSERT only
- **Type:** HTTP Request
- **Method:** POST
- **URL:** `https://blokpr.co/api/webhooks/waitlist-notification`
- **Headers:**
  ```
  Authorization: Bearer your-SUPABASE_WEBHOOK_SECRET-here
  Content-Type: application/json
  ```

### Step 4: Deploy to Production

```bash
git add .
git commit -m "Add waitlist feature with email notifications"
git push origin main
vercel --prod
```

### Step 5: Add to Vercel Environment Variables

Go to Vercel → Settings → Environment Variables

Make sure these are set:
- `RESEND_API_KEY`
- `FEEDBACK_NOTIFICATION_EMAIL`
- `SUPABASE_WEBHOOK_SECRET`

Redeploy after adding variables.

---

## 🧪 Testing

### Test the Full Flow:

1. **Visit Landing Page:** https://blokpr.co
2. **Click "Únete a la Lista de Espera"** (or "Join the Waitlist")
3. **Fill out the form:**
   - Email: your-test-email@gmail.com
   - Name: Test User (optional)
   - Phone: 787-555-1234 (optional)
4. **Submit**

**Verify:**
- ✅ Success message appears in modal
- ✅ User receives confirmation email within 1 minute
- ✅ Admin receives notification email
- ✅ Entry appears in Supabase `waitlist` table
- ✅ Email format looks professional and welcoming

### Check Supabase Webhook Logs:
- Go to Supabase → Database → Webhooks → Logs
- Verify webhook fired successfully with 200 response

---

## 📊 What Users See

### Confirmation Email (Spanish Example):

**Subject:** ¡Bienvenido a la lista de espera de Blok! 🎉

**Content:**
- Warm welcome message
- Confirmation their email was added
- What's next:
  - First to know when we launch
  - Early access to platform
  - Special early adopter discounts
- Beautiful gradient design
- CTA button to visit blokpr.co

### What Admin Sees:

**Subject:** 🎉 Nueva Suscripción a Waitlist - user@email.com

**Content:**
- Contact info (email, name, phone, building)
- Signup details (date, source, referrer)
- Link to dashboard
- Professional email design

---

## 🎯 Landing Page User Flow

1. **User visits** blokpr.co
2. **Sees waitlist CTAs** in hero, navigation, or final CTA
3. **Clicks button** → Modal opens
4. **Fills form** (email required, rest optional)
5. **Submits** → API validates and saves
6. **Success!** → Modal shows confirmation
7. **Receives email** → Beautiful confirmation in their inbox
8. **Admin notified** → You get instant alert

---

## 📈 Analytics Tracking

The waitlist automatically tracks:
- **Source:** Where they signed up (landing_page)
- **Referrer URL:** What page they came from
- **User Agent:** Browser/device info
- **Timestamp:** When they subscribed

Use this data to understand:
- Which pages drive signups
- Best times for conversions
- Device/browser preferences

---

## 🔒 Security

- ✅ Email validation (regex check)
- ✅ Duplicate prevention (unique constraint)
- ✅ Rate limiting (via Supabase RLS)
- ✅ Webhook authentication (Bearer token)
- ✅ SQL injection protection (Supabase client)
- ✅ XSS protection (React escapes HTML)

---

## 🎨 Customization

### Change Email Design:
Edit `/api/waitlist/subscribe/route.ts` lines 64-167

### Change Button Text:
Edit `/lib/translations.ts`:
- Line 706 (Spanish): `waitlist: 'Únete a la Lista de Espera'`
- Line 1645 (English): `waitlist: 'Join the Waitlist'`

### Add More Form Fields:
1. Update modal in `/components/landing/waitlist-modal.tsx`
2. Update API in `/api/waitlist/subscribe/route.ts`
3. Add columns to Supabase `waitlist` table

---

## 🐛 Troubleshooting

**Modal doesn't open?**
- Check browser console for errors
- Verify Dialog component is imported

**Form doesn't submit?**
- Check Network tab for API errors
- Verify Supabase table exists
- Check RLS policies allow inserts

**No confirmation email?**
- Verify RESEND_API_KEY is set
- Check spam folder
- Check Resend dashboard: https://resend.com/emails

**No admin notification?**
- Verify webhook is configured in Supabase
- Check webhook secret matches
- Check webhook logs in Supabase
- Verify FEEDBACK_NOTIFICATION_EMAIL is set

**Email looks broken?**
- Test in different email clients
- Check HTML in email service (Resend)
- Verify all closing tags are present

---

## 📚 File Structure

```
src/
├── app/
│   └── api/
│       ├── waitlist/
│       │   └── subscribe/route.ts          # Main subscription endpoint
│       └── webhooks/
│           └── waitlist-notification/route.ts  # Admin email webhook
├── components/
│   └── landing/
│       ├── waitlist-modal.tsx              # Modal component
│       ├── hero-section.tsx                # Updated with waitlist CTA
│       ├── navigation.tsx                  # Updated with waitlist button
│       └── final-cta.tsx                   # Updated with waitlist button
├── lib/
│   └── translations.ts                     # Bilingual text
└── supabase/
    └── migrations/
        └── create_waitlist_table.sql       # Database schema
```

---

## ✨ Features Summary

✅ Beautiful modal with form validation
✅ Bilingual (Spanish/English)
✅ Confirmation emails (user gets instant welcome)
✅ Admin notifications (you get instant alerts)
✅ Analytics tracking (source, referrer, user agent)
✅ Mobile responsive
✅ Duplicate prevention
✅ Professional email design
✅ Error handling
✅ Loading states
✅ Success animations
✅ RLS security
✅ TypeScript typed

---

## 🎯 Next Steps

1. ✅ Apply migration to Supabase
2. ✅ Configure webhook in Supabase dashboard
3. ✅ Deploy to production
4. ✅ Test the full flow
5. 🎉 Share with neighbors via WhatsApp!

---

Good luck with your launch! 🚀
