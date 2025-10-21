# Supabase Webhook Setup - Feedback Notifications

## 📧 Email Notifications for New Feedback

This guide shows you how to set up automatic email notifications when someone submits feedback on your site.

---

## 🎯 How It Works

1. Someone submits feedback at `https://blokpr.co/feedback`
2. Feedback is saved to Supabase `feedback` table
3. **Supabase webhook triggers automatically**
4. Webhook calls your API endpoint
5. API sends you a beautiful email with all the details

---

## 📋 Prerequisites

1. ✅ Resend account with API key (already in `.env.local`)
2. ✅ Webhook endpoint created at `/api/webhooks/feedback-notification`
3. ⚠️ Need to configure Supabase Database Webhook (instructions below)

---

## 🔧 Step 1: Add Environment Variables

Add these to your `.env.local` file:

```bash
# Webhook Security (create a random string)
SUPABASE_WEBHOOK_SECRET=your-random-secret-here-make-it-long-and-random

# Where to send feedback notifications
FEEDBACK_NOTIFICATION_EMAIL=janfaris@blokpr.co
```

**Generate a secure random secret:**
```bash
openssl rand -base64 32
```

---

## 🚀 Step 2: Deploy to Vercel

The webhook endpoint needs to be publicly accessible, so deploy first:

```bash
# Make sure you're on main branch
git checkout main

# Add and commit the webhook code
git add .
git commit -m "Add Supabase webhook for feedback notifications"

# Push to GitHub
git push origin main

# Deploy to Vercel
vercel --prod
```

After deployment, your webhook URL will be:
```
https://blokpr.co/api/webhooks/feedback-notification
```

---

## ⚙️ Step 3: Configure Supabase Webhook

### A. Go to Supabase Dashboard

1. Visit: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Database** → **Webhooks** (in left sidebar)

### B. Create New Webhook

Click **"Create a new hook"** and configure:

**Basic Settings:**
- **Name:** `feedback-notification`
- **Table:** `feedback`
- **Events:** Check only **`INSERT`** (we only want new feedback notifications)

**Webhook Configuration:**
- **Type:** `HTTP Request`
- **Method:** `POST`
- **URL:** `https://blokpr.co/api/webhooks/feedback-notification`

**Headers:**
```
Authorization: Bearer your-random-secret-from-step-1
Content-Type: application/json
```

**HTTP Parameters:**
- Leave empty (default payload is fine)

### C. Save the Webhook

Click **"Create webhook"** at the bottom.

---

## 🧪 Step 4: Test It

### Option A: Submit Test Feedback

1. Go to https://blokpr.co/feedback
2. Fill out the form with test data
3. Submit
4. Check your email (`janfaris@blokpr.co`)
5. You should receive a beautiful HTML email with all the feedback details!

### Option B: Test from Supabase

1. In Supabase Dashboard, go to **Table Editor** → **feedback**
2. Click **Insert row**
3. Add test data:
   ```
   name: Test User
   email: test@example.com
   phone: 787-555-1234
   role: owner
   building: Test Building
   unit: 101
   clarity_rating: 5
   usefulness_rating: 5
   nps_score: 10
   interested: yes
   concerns: This is a test
   suggestions: Testing webhooks
   submitted_at: (use now())
   ```
4. Click **Save**
5. Check your email!

---

## 📊 Step 5: Monitor Webhooks

### View Webhook Logs in Supabase

1. Go to **Database** → **Webhooks**
2. Click on `feedback-notification`
3. Click **"Logs"** tab
4. You'll see all webhook calls with:
   - ✅ Success (200 status)
   - ❌ Failures (500 status)
   - Response times
   - Payload sent

### View API Logs in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Logs** tab
4. Filter by `/api/webhooks/feedback-notification`
5. You'll see:
   - `[Feedback Webhook] New feedback received: ...`
   - `[Feedback Webhook] Email sent successfully. Resend ID: ...`

---

## 🎨 Email Preview

The email includes:

### Header
- 🎉 "Nuevo Feedback Recibido"
- Timestamp in Spanish format

### Sections
1. **👤 Información de Contacto**
   - Name, email, phone
   - Role (Propietario/Inquilino/Admin)
   - Building and unit (if provided)

2. **⭐ Puntuaciones**
   - NPS Score (color-coded: green 9-10, yellow 7-8, red 0-6)
   - Clarity rating (1-5 stars)
   - Usefulness rating (1-5 stars)

3. **🎯 Interés en Probar**
   - ✅ SÍ - Quiere probar
   - 🤔 Tal vez
   - ❌ No

4. **💬 Comentarios Abiertos**
   - Concerns/doubts
   - Suggestions

5. **Button**
   - "Ver en Dashboard" → Links to https://blokpr.co/dashboard/admin-feedback

---

## 🔒 Security Notes

1. **Webhook Secret:** The `SUPABASE_WEBHOOK_SECRET` prevents unauthorized calls to your webhook
2. **Supabase sends:** `Authorization: Bearer <your-secret>` header
3. **Your API validates:** Rejects requests without matching secret
4. **Keep secret safe:** Never commit to git (it's in `.env.local` which is gitignored)

---

## 🐛 Troubleshooting

### "Webhook failed with status 401"
- Check that `SUPABASE_WEBHOOK_SECRET` in Vercel matches the `Authorization` header in Supabase webhook config
- Format should be: `Authorization: Bearer your-secret-here`

### "Webhook failed with status 500"
- Check Vercel logs for error details
- Most common: Missing `RESEND_API_KEY` environment variable
- Make sure environment variables are set in Vercel dashboard (not just `.env.local`)

### "Email not received"
- Check spam folder
- Verify `FEEDBACK_NOTIFICATION_EMAIL` is correct
- Check Resend dashboard for email logs: https://resend.com/emails
- Verify Resend domain is verified

### "Webhook not triggering"
- Verify webhook is enabled in Supabase
- Check that you selected **INSERT** event
- Try inserting a test row directly in Supabase Table Editor
- Check webhook logs in Supabase dashboard

---

## 🔄 Update Webhook URL (if needed)

If you change domains or need to update the webhook:

1. Go to Supabase Dashboard → Database → Webhooks
2. Click on `feedback-notification`
3. Update the URL
4. Click **Update webhook**

---

## 📧 Change Notification Email

To change where notifications are sent:

### In Vercel:
1. Go to project settings
2. Navigate to **Environment Variables**
3. Edit `FEEDBACK_NOTIFICATION_EMAIL`
4. Set to your desired email
5. Redeploy (or wait for next deployment)

### In `.env.local` (for local testing):
```bash
FEEDBACK_NOTIFICATION_EMAIL=your-email@example.com
```

---

## 🎯 Multiple Recipients (Future Enhancement)

To send to multiple emails, update the webhook code:

```typescript
// In /api/webhooks/feedback-notification/route.ts
const result = await resend.emails.send({
  from: 'Blok Feedback <feedback@blokpr.co>',
  to: [
    'janfaris@blokpr.co',
    'partner@blokpr.co',
    'admin@blokpr.co'
  ],
  // ... rest of config
});
```

---

## ✅ Success Checklist

- [ ] Environment variables added to `.env.local` and Vercel
- [ ] Code deployed to production
- [ ] Supabase webhook created and configured
- [ ] Webhook secret matches in both places
- [ ] Test feedback submitted
- [ ] Email received successfully
- [ ] Email looks good (check spam folder first time)
- [ ] Webhook logs show success in Supabase dashboard

---

## 🚀 You're All Set!

Now every time someone submits feedback, you'll get a beautiful email notification with all the details. No need to constantly check the dashboard!

**Pro tip:** Set up a filter in Gmail to automatically label these emails as "Blok Feedback" for easy tracking.
