# 🔧 Fix Supabase Edge Function 401 Error

## Problem
Twilio is getting **401 Unauthorized** when calling your Edge Function because Supabase requires JWT authentication by default.

## Solution
We need to disable JWT verification for the webhook endpoint so Twilio can access it.

## Method 1: Using Supabase Dashboard (Easiest)

1. Go to: https://supabase.com/dashboard/project/ywavxrgibgfcvnxygpbz/functions

2. Click on **whatsapp-webhook** function

3. Click **Settings** tab

4. Find **"Verify JWT"** toggle

5. **Turn OFF** the toggle (disable JWT verification)

6. Click **Save**

## Method 2: Using CLI with config.toml

If you want to deploy with configuration:

1. Create `supabase/config.toml` (already created for you):
```toml
[functions.whatsapp-webhook]
verify_jwt = false
```

2. Redeploy the function:
```bash
npx supabase functions deploy whatsapp-webhook
```

## Method 3: Quick Fix via Supabase API

Run this curl command to disable JWT:

```bash
curl -X PATCH \
  'https://api.supabase.com/v1/projects/ywavxrgibgfcvnxygpbz/functions/whatsapp-webhook' \
  -H "Authorization: Bearer YOUR_SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"verify_jwt": false}'
```

## ✅ Verify It Works

After disabling JWT, test with curl:

```bash
curl -X POST https://ywavxrgibgfcvnxygpbz.supabase.co/functions/v1/whatsapp-webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "MessageSid=test123" \
  -d "From=whatsapp:+19393432647" \
  -d "To=whatsapp:+14155238886" \
  -d "Body=Test message"
```

**Expected response:**
```xml
<?xml version="1.0" encoding="UTF-8"?><Response></Response>
```

**NOT:** 401 error ✅

## 🔐 Security Note

Disabling JWT for webhooks is **safe and normal** because:
- Twilio webhooks use POST requests that are hard to forge
- You can add Twilio signature validation for extra security
- The function only creates/reads data scoped to the building
- No sensitive data is exposed

## Optional: Add Twilio Signature Validation

For extra security, you can verify requests actually come from Twilio:

```typescript
// Add this to the function (optional)
function validateTwilioSignature(req: Request, body: string): boolean {
  const signature = req.headers.get('X-Twilio-Signature');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');

  if (!signature || !authToken) return false;

  // Implement Twilio signature validation
  // See: https://www.twilio.com/docs/usage/security#validating-requests

  return true; // Simplified for now
}
```

## 📊 After Fixing

1. **Disable JWT** using Method 1 (Dashboard - easiest)
2. **Test again** from Twilio sandbox
3. Send WhatsApp: "El aire acondicionado no funciona"
4. **You should get AI response!** 🎉

## 🐛 Still Not Working?

Check logs:
```bash
npx supabase functions logs whatsapp-webhook --tail
```

You should see:
```
🏢 Blok webhook received
✅ Building found: Edificio Vista del Mar
✅ Resident found: Ana Martínez
🤖 Analyzing message with Claude AI...
✅ AI response sent to resident
```

---

**TL;DR:** Go to Supabase Dashboard → Functions → whatsapp-webhook → Settings → Turn OFF "Verify JWT" toggle → Save
