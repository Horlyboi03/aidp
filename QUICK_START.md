# Quick Start Guide - AIDP

## 🚀 What I Just Did

### ✅ Fixed Issues:
1. Logo and chat button now responsive (smaller on mobile)
2. Mary George picture always shows
3. Removed demo credentials from login page
4. Set up database support (Neon Postgres)
5. Added secure authentication with environment variables

### 📝 What YOU Need to Do:

## Step 1: Set Your Admin Credentials (2 minutes)

### For Local Testing:
1. Open `.env.local` file (already created)
2. Change these lines:
```env
ADMIN_USERNAME=your_username_here
ADMIN_PASSWORD=your_secure_password_here
```

### For Production (Vercel):
1. Go to https://vercel.com/dashboard
2. Click your project (aidp-g)
3. Go to Settings → Environment Variables
4. Add:
   - `ADMIN_USERNAME` = your username
   - `ADMIN_PASSWORD` = your password
   - `JWT_SECRET` = (generate random string)

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Step 2: Create Database (5 minutes)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Storage" tab
4. Click "Create Database"
5. Select "Postgres"
6. Click "Create"
7. Done! Vercel adds environment variables automatically

## Step 3: Set Up Database Tables (2 minutes)

After creating database:

1. Vercel will show you a link to Neon dashboard
2. Click it
3. Go to "SQL Editor"
4. Copy everything from `database/schema.sql`
5. Paste and click "Run"
6. Done!

## Step 4: Deploy (1 minute)

```bash
git add .
git commit -m "Add database and custom credentials"
git push origin main
```

Vercel will auto-deploy in 1-2 minutes.

## Step 5: Test

1. Go to https://your-site.vercel.app/admin
2. Login with YOUR new username/password
3. Submit a test application
4. Refresh page - data should still be there!

## 🎯 Summary

**Before:**
- ❌ Demo credentials visible
- ❌ Data doesn't persist
- ❌ Logo too big on mobile
- ❌ No database

**After:**
- ✅ Your own secure credentials
- ✅ Data persists forever
- ✅ Mobile-friendly
- ✅ Production database

## ⏱️ Total Time: ~10 minutes

## 🆘 Need Help?

**Can't set environment variables?**
- Make sure you're in the right project
- Click "Add" button for each variable
- Redeploy after adding them

**Database not working?**
- Make sure you ran schema.sql
- Check Vercel logs for errors
- Verify POSTGRES_URL is set

**Still having issues?**
- Let me know and I'll help!

## 📞 What's Your Username/Password?

Tell me what you want to use:
- Username: ?
- Password: ?

I'll help you set it up!
