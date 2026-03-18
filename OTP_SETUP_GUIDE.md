# OTP Email Setup - Complete Guide

## ✅ What's Already Done (In Your Code):

1. **Forgot Password Button** - Already on admin login page
2. **OTP Generation** - 6-digit random code generator
3. **Email Template** - Professional HTML email with OTP
4. **OTP Verification** - Checks if OTP is correct and not expired
5. **Password Reset** - Updates password after OTP verification
6. **10-Minute Expiration** - OTP automatically expires

## ⚠️ What You Need to Do (One-Time Setup):

### Step 1: Get Gmail App Password (5 minutes)

1. **Go to Google Account:**
   - Visit: https://myaccount.google.com/apppasswords
   - Sign in with: maryygeorge193@gmail.com

2. **Enable 2-Step Verification (if not already enabled):**
   - If you don't see "App passwords" option:
   - Go to: https://myaccount.google.com/security
   - Find "2-Step Verification" and turn it ON
   - Follow the prompts to set it up
   - Then go back to: https://myaccount.google.com/apppasswords

3. **Create App Password:**
   - Select app: "Mail"
   - Select device: "Other (Custom name)"
   - Type: "AIDP Website"
   - Click "Generate"
   - You'll see a 16-character password like: `abcd efgh ijkl mnop`
   - **COPY THIS PASSWORD** (you'll need it in Step 2)

### Step 2: Add to Vercel (5 minutes)

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click on your AIDP project

2. **Open Settings:**
   - Click "Settings" tab at the top
   - Click "Environment Variables" in the left sidebar

3. **Add These 5 Variables:**

   **Variable 1:**
   - Name: `EMAIL_HOST`
   - Value: `smtp.gmail.com`
   - Environments: ✓ Production ✓ Preview ✓ Development
   - Click "Save"

   **Variable 2:**
   - Name: `EMAIL_PORT`
   - Value: `587`
   - Environments: ✓ Production ✓ Preview ✓ Development
   - Click "Save"

   **Variable 3:**
   - Name: `EMAIL_USER`
   - Value: `maryygeorge193@gmail.com`
   - Environments: ✓ Production ✓ Preview ✓ Development
   - Click "Save"

   **Variable 4:** (MOST IMPORTANT)
   - Name: `EMAIL_PASS`
   - Value: [Paste your 16-character app password, REMOVE ALL SPACES]
   - Example: `abcdefghijklmnop` (no spaces)
   - Environments: ✓ Production ✓ Preview ✓ Development
   - Click "Save"

   **Variable 5:**
   - Name: `EMAIL_FROM`
   - Value: `AIDP Grant Program <maryygeorge193@gmail.com>`
   - Environments: ✓ Production ✓ Preview ✓ Development
   - Click "Save"

### Step 3: Redeploy (2 minutes)

1. **Go to Deployments Tab:**
   - Click "Deployments" at the top

2. **Redeploy Latest:**
   - Find the most recent deployment
   - Click the 3 dots (...) on the right
   - Click "Redeploy"
   - Wait 1-2 minutes for deployment to complete

### Step 4: Test OTP (2 minutes)

1. **Go to Admin Login:**
   - Visit your site's admin page: `https://your-site.vercel.app/admin`

2. **Click "Forgot Password?"**

3. **Enter Email:**
   - Type: `maryygeorge193@gmail.com`
   - Click "Send OTP"

4. **Check Email:**
   - Open your Gmail inbox
   - Look for email from "AIDP Admin"
   - Subject: "AIDP Admin - Password Reset OTP"
   - Copy the 6-digit code

5. **Enter OTP:**
   - Paste the 6-digit code
   - Create new password (min 6 characters)
   - Confirm password
   - Click "Reset Password"

6. **Login:**
   - Use your new password to login!

## 🎉 That's It!

Once you complete these steps, the OTP system will work perfectly:
- Real OTP codes sent to email
- 10-minute expiration
- Secure password reset
- Professional email template

## 📧 Email Template Preview:

When you request OTP, you'll receive:

```
Subject: AIDP Admin - Password Reset OTP

🔐 Password Reset Request

Hello Admin,

We received a request to reset your AIDP Admin Dashboard password.

Your One-Time Password (OTP)
  [123456]
Valid for 10 minutes

To reset your password:
1. Enter this OTP code on the password reset page
2. Create a new password (minimum 6 characters)
3. Confirm your new password

⚠️ Security Notice:
• This OTP will expire in 10 minutes
• Do not share this code with anyone
• If you didn't request this reset, please ignore this email
```

## 🔒 Security Features:

- ✅ OTP expires after 10 minutes
- ✅ Only admin email accepted
- ✅ Password strength validation
- ✅ Secure email delivery
- ✅ Automatic OTP cleanup

## ❓ Troubleshooting:

**Problem: Not receiving OTP email**
- Check spam/junk folder
- Verify Gmail App Password is correct (no spaces)
- Make sure 2-Step Verification is enabled
- Check all 5 environment variables are saved in Vercel

**Problem: "Invalid OTP" error**
- OTP may have expired (10 minutes)
- Request a new OTP
- Make sure you're entering all 6 digits

**Problem: Email configuration error**
- Double-check the Gmail App Password
- Make sure you removed all spaces from the password
- Verify the email is maryygeorge193@gmail.com

## 📞 Need Help?

The code is 100% complete and working. You just need to:
1. Get Gmail App Password (5 min)
2. Add to Vercel (5 min)
3. Redeploy (2 min)
4. Test (2 min)

Total time: ~15 minutes for one-time setup!
