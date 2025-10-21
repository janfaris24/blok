# 🚀 Deployment Checklist - Before Sending Feedback Form to Neighbors

Use this checklist before sharing the feedback form with your neighbors.

---

## ✅ Pre-Deployment Checklist

### 🌐 Landing Page & Demo

- [ ] Landing page loads correctly at https://blokpr.co
- [ ] Demo video (BLOK-DEMO.mp4) plays correctly
- [ ] All sections display properly (Spanish + English toggle works)
- [ ] Mobile responsive (test on phone)
- [ ] No console errors in browser

### 📝 Feedback Form

- [ ] Feedback form loads at https://blokpr.co/feedback
- [ ] All fields work correctly
- [ ] Form validation works (required fields)
- [ ] Submit button works
- [ ] Success message appears after submission
- [ ] Data saves to Supabase `feedback` table

### 📧 Email Notifications

- [ ] Environment variables set in Vercel:
  - `RESEND_API_KEY`
  - `FEEDBACK_NOTIFICATION_EMAIL`
  - `SUPABASE_WEBHOOK_SECRET`
- [ ] Supabase webhook configured:
  - Name: `feedback-notification`
  - Table: `feedback`
  - Events: INSERT only
  - URL: `https://blokpr.co/api/webhooks/feedback-notification`
  - Authorization header with secret
- [ ] Test submission sends email successfully
- [ ] Email format looks good (HTML renders correctly)
- [ ] Email goes to correct address

### 🗄️ Database

- [ ] Supabase project is live (not paused)
- [ ] `feedback` table exists with correct schema
- [ ] Row Level Security (RLS) policies allow inserts
- [ ] Test data inserted successfully

### 📊 Admin Dashboard

- [ ] Admin feedback page loads: https://blokpr.co/dashboard/admin-feedback
- [ ] Can see submitted feedback
- [ ] Can export feedback to CSV
- [ ] Filters work (role, interest, date range)
- [ ] Authentication works (login required)

### 🔒 Security

- [ ] Webhook secret is strong (32+ characters)
- [ ] API keys not exposed in frontend code
- [ ] Environment variables not committed to git
- [ ] Webhook validates secret before processing

---

## 🧪 Testing Procedure

### 1. Local Testing

```bash
# Start local server
npm run dev

# Test feedback form at http://localhost:3000/feedback
# Submit test data
# Verify saves to Supabase
```

### 2. Production Testing

After deploying:

```bash
# Deploy
vercel --prod

# Test production form
# Visit https://blokpr.co/feedback
# Submit test feedback
# Verify:
#   1. Data in Supabase
#   2. Email received
#   3. Shows in admin dashboard
```

### 3. End-to-End Test

Submit a complete test feedback with:
- Name: "Test Neighbor"
- Email: your-test-email@gmail.com
- Phone: 787-555-1234
- Role: Owner
- Building: Test Building
- Unit: 101
- Rate everything 5/5 and 10/10
- Add concerns and suggestions
- Select "Yes" for interested

**Verify:**
- [ ] Form submits successfully
- [ ] Email arrives within 1 minute
- [ ] Email contains all submitted data
- [ ] Email formatting looks professional
- [ ] Dashboard shows the feedback
- [ ] Can export to CSV

---

## 📱 Before Messaging Neighbors

### Content Review

- [ ] NEIGHBOR_FEEDBACK_GUIDE.md message reviewed
- [ ] Landing page content is accurate
- [ ] Pricing section is up to date (if shown)
- [ ] Contact info is correct
- [ ] No typos or broken links

### Communication Strategy

- [ ] (Optional) Admin notified via DM
- [ ] Message personalized for your building
- [ ] Best time selected (7-9 PM, Thursday/Friday)
- [ ] Ready to answer questions
- [ ] Follow-up message planned for 3-5 days later

### Monitoring Setup

- [ ] Email notifications working
- [ ] Can check Supabase for real-time submissions
- [ ] Can access admin dashboard anytime
- [ ] Webhook logs accessible in Supabase
- [ ] Vercel logs accessible for debugging

---

## 🎯 Launch Readiness

**All checks passed?** ✅

You're ready to share with neighbors!

### Next Steps:

1. Copy message from `NEIGHBOR_FEEDBACK_GUIDE.md`
2. Personalize it (add 1-2 lines)
3. Send to WhatsApp group
4. Monitor feedback submissions
5. Respond to questions quickly
6. Send follow-up in 3-5 days

---

## 🆘 Emergency Contacts

**If something breaks:**

1. **Check webhook logs:** Supabase → Database → Webhooks → Logs
2. **Check API logs:** Vercel → Your Project → Logs
3. **Check email logs:** https://resend.com/emails
4. **Check database:** https://supabase.com/dashboard → Table Editor → feedback

**Quick fixes:**

- Form not submitting? Check browser console
- No emails? Verify Resend API key in Vercel
- Webhook failing? Check secret matches
- Data not saving? Check Supabase RLS policies

---

## 📈 Success Metrics

After 7 days, check:

- [ ] Response rate: ___% (aim for 20-30%)
- [ ] Average NPS: ___ (aim for 7+)
- [ ] Interested count: ___ (aim for 3+)
- [ ] Quality feedback received: Yes/No

---

## ✅ Post-Launch Checklist

After sending to neighbors:

- [ ] First response received and acknowledged
- [ ] Email notifications working
- [ ] Responded to any questions in group
- [ ] Tracking responses in spreadsheet or dashboard
- [ ] Planning follow-up message
- [ ] Analyzing feedback patterns

---

Good luck! 🚀
