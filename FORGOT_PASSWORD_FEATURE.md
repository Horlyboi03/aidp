# Admin Forgot Password Feature

## Overview
Added a complete "Forgot Password" feature to the admin login page that sends OTP to admin email for password reset.

## Features:

### 1. Forgot Password Link
- Located on admin login page below password field
- Click "Forgot Password?" to start reset process

### 2. OTP Email System
- Sends 6-digit OTP to admin email: marygeorge193@gmail.com
- OTP valid for 10 minutes
- Professional email template with security warnings
- Uses nodemailer for email delivery

### 3. Password Reset Flow
**Step 1: Request OTP**
- Enter admin email (marygeorge193@gmail.com)
- System sends OTP to email
- Shows success message

**Step 2: Enter OTP**
- Enter 6-digit code from email
- Create new password (min 6 characters)
- Confirm new password
- System validates OTP and updates password

### 4. Security Features
- OTP expires after 10 minutes
- Email verification (only admin email accepted)
- Password strength validation
- OTP stored temporarily in memory
- Automatic OTP cleanup after use

### 5. Email Template
Professional HTML email includes:
- AIDP branding with coral gradient
- Large, easy-to-read OTP code
- Expiration time (10 minutes)
- Security warnings
- Step-by-step instructions

## Files Created:
1. `app/api/admin/forgot-password/route.ts` - OTP generation and password reset API
2. Updated `app/admin/components/AdminLogin.tsx` - Added forgot password UI

## How to Use:

### For Admin:
1. Go to admin login page
2. Click "Forgot Password?" link
3. Enter email: marygeorge193@gmail.com
4. Check email for 6-digit OTP
5. Enter OTP on reset page
6. Create new password
7. Confirm password
8. Login with new password

### Email Configuration:
The system uses the same email configuration as the approval/rejection emails:
- EMAIL_HOST=smtp.gmail.com
- EMAIL_PORT=587
- EMAIL_USER=marygeorge193@gmail.com
- EMAIL_PASS=[Gmail App Password]
- EMAIL_FROM=AIDP Admin <marygeorge193@gmail.com>

## OTP Email Example:
```
Subject: AIDP Admin - Password Reset OTP

🔐 Password Reset Request

Hello Admin,

We received a request to reset your AIDP Admin Dashboard password.

Your One-Time Password (OTP)
  123456
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

## Testing:
If email service is not configured, the OTP will be logged in the server console for testing purposes.

## Admin Email:
marygeorge193@gmail.com

## Current Password:
horlyboi03! (can be reset using forgot password feature)
