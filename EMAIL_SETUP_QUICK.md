# Quick Email Setup Guide

## ✅ Email System is Now Active!

When you approve/reject applications from admin dashboard, emails will be sent automatically to applicants.

## 🔧 Setup (5 minutes):

### Step 1: Get Gmail App Password

1. **Go to:** https://myaccount.google.com/security
2. **Enable 2-Step Verification** (if not already)
3. **Go to:** https://myaccount.google.com/apppasswords
4. **Create App Password:**
   - Select app: Mail
   - Select device: Other (Custom) → Type "AIDP"
   - Click "Generate"
   - **Copy the 16-character password** (like: `abcd efgh ijkl mnop`)

### Step 2: Add to Vercel

1. **Go to:** https://vercel.com/dashboard
2. **Your project → Settings → Environment Variables**
3. **Add these 5 variables:**

```
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = marygeorge193@gmail.com
EMAIL_PASS = [paste your 16-char app password]
EMAIL_FROM = AIDP Grant Program <marygeorge193@gmail.com>
```

### Step 3: Deploy

After adding variables:
1. Go to Deployments
2. Find latest deployment
3. Click "..." → Redeploy
4. Done!

## 📧 What Emails Are Sent:

### When You Approve an Application:
- ✅ Applicant receives congratulations email
- ✅ Shows grant amount approved
- ✅ Explains next steps
- ✅ Includes Mary George contact info

### When You Reject an Application:
- ✅ Applicant receives notification
- ✅ Explains they can reapply in 6 months
- ✅ Includes Mary George contact for questions

## 🎯 How It Works:

1. **Applicant submits application**
2. **You review in admin dashboard**
3. **You click "Approve" or "Reject"**
4. **Email is sent automatically** ✅
5. **Applicant receives professional email**

## 📋 Email Templates Include:

- Professional AIDP branding
- Coral gradient colors
- Grant amount details
- Next steps instructions
- Mary George contact info
- Legal disclaimers

## ⚠️ Important Notes:

- Emails come from: marygeorge193@gmail.com
- Make sure 2-Step Verification is enabled
- Use App Password, NOT your regular Gmail password
- App passwords are 16 characters with spaces

## 🆘 Troubleshooting:

**Emails not sending?**
- Check all 5 environment variables are set
- Verify app password is correct (16 chars)
- Make sure you redeployed after adding variables
- Check Vercel logs for errors

**Wrong email address?**
- Update EMAIL_USER in Vercel
- Update EMAIL_FROM in Vercel
- Redeploy

## ✅ Test It:

1. Submit a test application
2. Go to admin dashboard
3. Approve or reject it
4. Check the applicant's email
5. You should receive the email!

---

**Status:** ✅ Email system activated
**Next:** Add email credentials to Vercel
**Time:** 5 minutes
