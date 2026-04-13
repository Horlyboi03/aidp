# AIDP Grant Application - Deployment Guide

## Pre-Deployment Checklist

### ✅ Code Status
- [x] Build completes successfully
- [x] No TypeScript errors
- [x] All components have proper exports
- [x] MessagingPanel export fixed
- [x] All API endpoints created
- [x] Database functions implemented with field mapping

### ✅ Features Implemented
- [x] Application submission and management
- [x] Admin dashboard with statistics
- [x] Application approval/rejection
- [x] Application deletion
- [x] Real-time messaging between admin and applicants
- [x] Email notifications
- [x] Image upload support
- [x] Responsive design for all screen sizes

## Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Fix MessagingPanel export and finalize deployment"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project "aidp-grant-application"
3. Click "Deploy" or wait for automatic deployment from GitHub

### Step 3: Configure Environment Variables in Vercel

Go to **Settings → Environment Variables** and add:

#### Database
- `POSTGRES_URL`: Your Vercel Postgres connection string (from Neon database)

#### Email Configuration
- `EMAIL_HOST`: `smtp.gmail.com`
- `EMAIL_PORT`: `587`
- `EMAIL_USER`: `maryygeorge193@gmail.com`
- `EMAIL_PASS`: Your Gmail app password
- `EMAIL_FROM`: `AIDP Grant Program <maryygeorge193@gmail.com>`

#### Admin Credentials
- `ADMIN_USERNAME`: `horlyboi`
- `ADMIN_PASSWORD`: `horlyboi03!`
- `JWT_SECRET`: `aidp-horlyboi-secret-key-2024-secure`

#### Application
- `NEXTAUTH_URL`: Your Vercel deployment URL (e.g., `https://aidp-grant-application.vercel.app`)

### Step 4: Verify Deployment

1. **Check Build Logs**
   - Go to Deployments tab
   - Click on the latest deployment
   - Verify build completed successfully

2. **Test Application**
   - Visit your deployed URL
   - Test user signup
   - Submit an application
   - Check admin dashboard

3. **Test Admin Features**
   - Login with credentials: `horlyboi` / `horlyboi03!`
   - Verify applications appear in list
   - Test approve/reject functionality
   - Test delete functionality
   - Test messaging system

4. **Test Messaging**
   - Submit an application as user
   - Login as admin
   - Send message to applicant
   - Verify applicant receives message
   - Test applicant reply

## Troubleshooting

### Issue: Applications Not Showing in Admin Dashboard

**Symptoms**: Admin dashboard shows 0 applications even after submissions

**Solutions**:
1. Check Postgres connection string is set correctly
2. Verify database tables were created:
   - Go to Vercel Postgres dashboard
   - Check if `applications`, `conversations`, `messages`, `users` tables exist
3. Check application logs for database errors
4. Run `/api/debug/applications` endpoint to test database connection

### Issue: Messages Not Appearing

**Symptoms**: Admin sends message but applicant doesn't see it

**Solutions**:
1. Verify conversation ID format: should be `conv-${email}`
2. Check messages table in database
3. Verify applicant is using same email for conversation
4. Check browser console for errors
5. Verify email field is being passed correctly

### Issue: Email Notifications Not Sending

**Symptoms**: Users don't receive approval/rejection emails

**Solutions**:
1. Verify EMAIL_* environment variables are set
2. Check Gmail app password is correct (not regular password)
3. Enable "Less secure app access" if using regular Gmail password
4. Check application logs for email errors
5. Verify email addresses in database are correct

### Issue: Build Fails with Database Error

**Symptoms**: Build fails with "missing_connection_string" error

**Solutions**:
1. This is expected during build - database initialization happens at runtime
2. Verify POSTGRES_URL is set in Vercel environment
3. Check build logs for other errors
4. If build still fails, check for TypeScript errors

## Post-Deployment Verification

### Admin Dashboard
- [ ] Overview tab shows correct statistics
- [ ] Applications tab displays all submitted applications
- [ ] Can approve/reject applications
- [ ] Can delete applications
- [ ] Messages tab shows conversations
- [ ] Can send messages to applicants
- [ ] Can start new conversations with "+" button

### User Experience
- [ ] Landing page loads correctly
- [ ] Application form submits successfully
- [ ] User receives confirmation email
- [ ] User can login and view their application
- [ ] User can message admin
- [ ] User receives admin messages
- [ ] Chat is responsive on mobile

### Database
- [ ] Applications are stored correctly
- [ ] Messages are stored and retrieved
- [ ] Conversations are created properly
- [ ] Field mapping works (camelCase conversion)

## Monitoring

### Key Metrics to Monitor
- Application submission rate
- Message delivery success rate
- Email delivery success rate
- Database query performance
- API response times

### Logs to Check
- Vercel deployment logs
- Application error logs
- Database connection logs
- Email service logs

## Rollback Plan

If deployment has critical issues:

1. Go to Vercel Deployments
2. Find the previous working deployment
3. Click "Promote to Production"
4. Verify application is working

## Support

For issues or questions:
1. Check application logs in Vercel
2. Review error messages in browser console
3. Check database connection in Vercel Postgres dashboard
4. Verify all environment variables are set correctly

## Next Steps After Deployment

1. Monitor application for 24 hours
2. Test all features thoroughly
3. Gather user feedback
4. Plan for future enhancements
5. Set up automated backups for database
6. Configure monitoring and alerts
