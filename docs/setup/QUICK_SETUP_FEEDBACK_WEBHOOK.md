# ⚡ Quick Setup: Feedback Email Notifications

Get instant email notifications when someone submits feedback.

---

## 🚀 Quick Start (5 minutes)

### 1. Add Environment Variables

Add to `.env.local` (and later to Vercel):

```bash
# Generate secret:
openssl rand -base64 32

# Then add:
SUPABASE_WEBHOOK_SECRET=paste-the-generated-secret-here
FEEDBACK_NOTIFICATION_EMAIL=janfaris@blokpr.co
```

### 2. Deploy to Production

```bash
git add .
git commit -m "Add feedback webhook notifications"
git push origin main
vercel --prod
```

### 3. Configure Supabase Webhook

Go to: https://supabase.com/dashboard → Your Project → Database → Webhooks

**Create webhook:**
- Name: `feedback-notification`
- Table: `feedback`
- Events: ✅ **INSERT** only
- Type: HTTP Request
- Method: POST
- URL: `https://blokpr.co/api/webhooks/feedback-notification`
- Headers:
  ```
  Authorization: Bearer your-secret-from-step-1
  Content-Type: application/json
  ```

### 4. Add to Vercel Environment Variables

1. Go to Vercel project → Settings → Environment Variables
2. Add:
   - `SUPABASE_WEBHOOK_SECRET` = (same as local)
   - `FEEDBACK_NOTIFICATION_EMAIL` = janfaris@blokpr.co
3. Redeploy

### 5. Test It!

Submit test feedback at: https://blokpr.co/feedback

Check your email - you should get a beautiful notification! 🎉

---

## 📧 What You'll Get

Every feedback submission sends you an email with:

✅ Contact info (name, email, phone)
✅ Role and building info
✅ **Color-coded NPS score** (green/yellow/red)
✅ Clarity and usefulness ratings
✅ Interest level (✅ Yes, 🤔 Maybe, ❌ No)
✅ All open-ended comments
✅ Direct link to dashboard

---

## 🐛 Troubleshooting

**Webhook fails?**
- Check Supabase → Database → Webhooks → Logs
- Verify secret matches in both places
- Make sure Vercel env vars are set

**No email?**
- Check spam folder
- Verify RESEND_API_KEY is set in Vercel
- Check Resend dashboard: https://resend.com/emails

---

## 📚 Full Documentation

See `SUPABASE_WEBHOOK_SETUP.md` for complete details.
