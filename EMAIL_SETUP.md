# Email Notification Setup Guide

This guide explains how to set up email notifications for the AIDP Grant Application website.

## Prerequisites

1. A Gmail account (or other SMTP email service)
2. Node.js and npm installed

## Installation Steps

### 1. Install Nodemailer

Run the following command in your project directory:

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### 2. Set Up Gmail App Password

If using Gmail:

1. Go to your Google Account settings
2. Navigate to Security > 2-Step Verification
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password

### 3. Create Environment Variables

Create a `.env.local` file in the root of your project (if it doesn't exist) and add:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=AIDP Grant Program <noreply@aidp.com>
```

Replace `your-email@gmail.com` with your Gmail address and `your-16-character-app-password` with the app password you generated.

### 4. Enable Email Sending

Open `lib/emailService.ts` and uncomment the following lines:

1. Line 4: `import nodemailer from 'nodemailer'`
2. Lines 25-44: The nodemailer transporter and sendMail code

Comment out or remove lines 46-48 (the console.log statements).

### 5. Test Email Sending

1. Start your development server: `npm run dev`
2. Go to the admin dashboard
3. Approve or reject an application
4. Check the applicant's email inbox for the notification

## Email Templates

The system includes two email templates:

### Approval Email
- Sent when an application is approved
- Includes grant amount and next steps
- Provides contact information for Mary George

### Rejection Email
- Sent when an application is rejected
- Explains the decision and reapplication process
- Provides contact information for appeals

## Customization

You can customize the email templates in `lib/emailService.ts`:

- `getApprovalEmailTemplate()` - Approval email HTML
- `getRejectionEmailTemplate()` - Rejection email HTML

## Troubleshooting

### Emails Not Sending

1. Check that nodemailer is installed: `npm list nodemailer`
2. Verify environment variables are set correctly
3. Check console for error messages
4. Ensure Gmail app password is correct
5. Check that 2-Step Verification is enabled on your Google account

### Gmail Blocking Emails

If Gmail blocks the emails:

1. Enable "Less secure app access" (not recommended)
2. Use an app password instead (recommended)
3. Check Gmail's "Blocked account" notifications

### Using Other Email Services

To use a different SMTP service (e.g., SendGrid, Mailgun, AWS SES):

1. Update `EMAIL_HOST` and `EMAIL_PORT` in `.env.local`
2. Update authentication credentials
3. Adjust the transporter configuration in `lib/emailService.ts`

## Production Deployment

For production:

1. Use environment variables on your hosting platform
2. Consider using a dedicated email service (SendGrid, Mailgun, AWS SES)
3. Implement email queuing for better performance
4. Add email delivery tracking and logging
5. Set up SPF, DKIM, and DMARC records for better deliverability

## Security Notes

- Never commit `.env.local` to version control
- Use app passwords instead of your main Gmail password
- Rotate email credentials regularly
- Monitor email sending for abuse
- Implement rate limiting to prevent spam

## Support

For issues or questions:
- Check the console logs for error messages
- Review the nodemailer documentation: https://nodemailer.com/
- Contact the development team

---

Last updated: ${new Date().toLocaleDateString()}
