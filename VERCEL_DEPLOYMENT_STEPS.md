# Vercel Deployment Steps - AIDP Grant Application

## ✅ Code Pushed to GitHub
- Commit: `ae5bec3` - "Fix MessagingPanel export and add deployment documentation"
- Branch: `main`
- Status: Ready for deployment

## 🚀 Deploy to Vercel (Manual Steps)

### Option 1: Automatic Deployment (Recommended)
Vercel should automatically detect the push and start deploying. Check your Vercel dashboard:

1. Go to https://vercel.com/dashboard
2. Select your project "aidp-grant-application"
3. Wait for automatic deployment to start
4. Monitor the build progress

### Option 2: Manual Deployment via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click on "aidp-grant-application" project
3. Click "Deployments" tab
4. Click "Deploy" button (if available)
5. Select "main" branch
6. Click "Deploy"

## ⚙️ Configure Environment Variables

After deployment starts, go to **Settings → Environment Variables** and add:

### Database
```
POSTGRES_URL=<your-vercel-postgres-connection-string>
```
Get this from: Vercel Dashboard → Storage → Postgres → Connection String

### Email Configuration
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=maryygeorge193@gmail.com
EMAIL_PASS=<your-gmail-app-password>
EMAIL_FROM=AIDP Grant Program <maryygeorge193@gmail.com>
```

### Admin Credentials
```
ADMIN_USERNAME=horlyboi
ADMIN_PASSWORD=horlyboi03!
JWT_SECRET=aidp-horlyboi-secret-key-2024-secure
```

### Application
```
NEXTAUTH_URL=<your-vercel-deployment-url>
```
Example: `https://aidp-grant-application.vercel.app`

## 📋 Deployment Checklist

- [ ] Code pushed to GitHub (✅ DONE)
- [ ] Vercel deployment started
- [ ] Build completed successfully
- [ ] Environment variables set
- [ ] Database connected
- [ ] Email service configured
- [ ] Admin credentials set
- [ ] Application URL accessible

## 🧪 Post-Deployment Testing

### Test User Flow
1. Visit your deployed URL
2. Sign up as new user
3. Submit application
4. Check email for confirmation
5. Login and view application
6. Send message to admin

### Test Admin Flow
1. Login with: `horlyboi` / `horlyboi03!`
2. View applications in dashboard
3. Approve/reject an application
4. Delete an application
5. Send message to applicant
6. Start new conversation with "+"

### Test Responsive Design
1. Test on mobile device
2. Test on tablet
3. Test on desktop
4. Verify no overflow issues

## 🔍 Monitoring Deployment

### Check Build Status
1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Deployments" tab
4. Click on the latest deployment
5. Check build logs

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Build fails | Check build logs for errors |
| Database not connecting | Verify POSTGRES_URL is set |
| Emails not sending | Check EMAIL_* variables |
| Applications not showing | Check database connection |
| Messages not appearing | Verify conversation ID format |

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Check database connection in Vercel Storage

## ✅ Deployment Complete

Once all tests pass, your application is live and ready for users!

**Deployment URL**: https://aidp-grant-application.vercel.app (or your custom domain)

---

**Status**: Ready for Vercel Deployment
**Last Updated**: April 13, 2026
