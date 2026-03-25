# Email Notifications Setup Guide

## ✅ What's Implemented:

### 1. Welcome Email (Account Creation)
- **Trigger**: When a user successfully creates an account
- **Subject**: "Welcome to AIDP Grant Program! 🎉"
- **Content**: 
  - Welcome message
  - Account benefits
  - Next steps to apply
  - Grant amounts available
  - Contact information

### 2. Approval Email
- **Trigger**: When admin approves an application
- **Subject**: "🎉 Your AIDP Grant Application Has Been Approved!"
- **Content**:
  - Congratulations message
  - Approved grant amount
  - Next steps (processing fee, payment)
  - Important information
  - Contact details

### 3. Rejection Email
- **Trigger**: When admin rejects an application
- **Subject**: "AIDP Grant Application Update"
- **Content**:
  - Polite rejection message
  - Explanation
  - Reapplication information (6 months)
  - Contact details for questions

## 📧 Email Configuration:

### Environment Variables Needed:

Add these to your Vercel environment variables:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=AIDP Grant Program <noreply@aidp.com>
```

### For Gmail:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "AIDP Grant Program"
   - Copy the 16-character password
3. **Add to Vercel**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `EMAIL_USER` = your Gmail address
   - Add `EMAIL_PASS` = the 16-character app password
   - Add `EMAIL_HOST` = smtp.gmail.com
   - Add `EMAIL_PORT` = 587
   - Add `EMAIL_FROM` = AIDP Grant Program <your-email@gmail.com>

### For Other Email Providers:

**Outlook/Hotmail:**
```
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
```

**Yahoo:**
```
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
```

**Custom SMTP:**
```
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587 (or 465 for SSL)
```

## 🧪 Testing:

### Test Welcome Email:
1. Create a new account with a real email address
2. Check your inbox for the welcome email
3. Verify all links and information are correct

### Test Approval Email:
1. Submit an application
2. Go to admin dashboard
3. Approve the application
4. Check the applicant's email for approval notification

### Test Rejection Email:
1. Submit an application
2. Go to admin dashboard
3. Reject the application
4. Check the applicant's email for rejection notification

## 🔧 Troubleshooting:

### Emails Not Sending:

1. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Deployments → Latest → Functions
   - Check `/api/auth/signup` and `/api/applications/[id]/status` logs

2. **Verify Environment Variables**:
   - Make sure all EMAIL_* variables are set in Vercel
   - Redeploy after adding variables

3. **Gmail Issues**:
   - Make sure 2FA is enabled
   - Use App Password, not regular password
   - Check "Less secure app access" is OFF (use App Password instead)

4. **Check Spam Folder**:
   - Emails might be going to spam initially
   - Mark as "Not Spam" to train the filter

### Email Logs:

The system logs email sending status:
- ✅ Success: "Email sent successfully to: email@example.com"
- ❌ Failure: "Failed to send email: [error details]"

## 📝 Email Templates:

All email templates are in `lib/emailService.ts`:
- `getWelcomeEmailTemplate()` - Welcome email
- `getApprovalEmailTemplate()` - Approval email
- `getRejectionEmailTemplate()` - Rejection email

You can customize these templates by editing the HTML in that file.

## 🚀 Deployment:

The email system is already deployed! Just add the environment variables in Vercel and it will start working immediately.

**No code changes needed** - just configure the email settings in Vercel!
