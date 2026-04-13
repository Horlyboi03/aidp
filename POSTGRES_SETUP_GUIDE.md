# 🗄️ Postgres Database Setup Guide for Vercel

## Overview

This guide will help you set up a Postgres database on Vercel to make all applicant information permanent and prevent data loss.

## What This Does

✅ Stores all applicant applications permanently
✅ Stores all user accounts permanently
✅ Stores all messages permanently
✅ Prevents data from being wiped on redeploy
✅ Enables real-time data synchronization

## Step 1: Create Vercel Postgres Database

### Option A: Using Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard

2. **Select Your Project**
   - Click on "aidp-grant-application"

3. **Go to Storage Tab**
   - Click "Storage" in the top navigation

4. **Create Postgres Database**
   - Click "Create Database"
   - Select "Postgres"
   - Choose a region (closest to your users)
   - Click "Create"

5. **Copy Connection String**
   - After creation, you'll see a connection string
   - Copy the full connection string (starts with `postgres://`)

### Option B: Using Neon (Alternative)

If Vercel Postgres isn't available:

1. Go to https://neon.tech
2. Sign up with your GitHub account
3. Create a new project
4. Copy the connection string
5. Use it in Vercel environment variables

## Step 2: Add Environment Variable to Vercel

1. **Go to Project Settings**
   - In Vercel Dashboard, click your project
   - Go to "Settings" tab

2. **Go to Environment Variables**
   - Click "Environment Variables" in the left menu

3. **Add POSTGRES_URL**
   - Name: `POSTGRES_URL`
   - Value: Paste the connection string you copied
   - Select environments: Production, Preview, Development
   - Click "Save"

4. **Redeploy Project**
   - Go to "Deployments" tab
   - Click "Redeploy" on the latest deployment
   - Or wait for automatic redeploy

## Step 3: Verify Database Connection

### Check Deployment Logs

1. Go to "Deployments" tab
2. Click on the latest deployment
3. Check the build logs for:
   - "Applications table ready"
   - "Users table ready"
   - "Conversations table ready"
   - "Messages table ready"

### Test Database Connection

1. Visit your Vercel URL
2. Open browser DevTools (F12)
3. Go to Console tab
4. Look for logs showing database operations

## Step 4: Migrate Existing Data (Optional)

If you have existing applications in local data:

1. **Export Local Data**
   - The `data/applications.json` file contains all applications

2. **Import to Postgres**
   - Applications will be automatically migrated on first API call
   - The system will detect Postgres is available and use it

3. **Verify Migration**
   - Login to admin dashboard
   - Check "Application" tab
   - All applications should appear

## Environment Variables Needed

Make sure these are set in Vercel:

```
POSTGRES_URL=postgres://user:password@host:port/database
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=maryygeorge193@gmail.com
EMAIL_PASS=<gmail-app-password>
EMAIL_FROM=AIDP Grant Program <maryygeorge193@gmail.com>
ADMIN_USERNAME=horlyboi
ADMIN_PASSWORD=horlyboi03!
JWT_SECRET=aidp-horlyboi-secret-key-2024-secure
NEXTAUTH_URL=<your-vercel-url>
```

## Database Schema

The system automatically creates these tables:

### applications
- id (TEXT PRIMARY KEY)
- fullName, email, phone, country
- address, homeAddress, gender
- maritalStatus, occupation, monthlyIncome
- grantAmount, grantPurpose, paymentMethod
- description, status, submittedAt, updatedAt

### users
- id (TEXT PRIMARY KEY)
- fullName, email, phone, country
- password, applications, resetToken
- resetTokenExpiry, createdAt

### conversations
- id (TEXT PRIMARY KEY)
- applicantName, applicantEmail
- lastMessage, lastMessageAt
- unreadCount, createdAt

### messages
- id (TEXT PRIMARY KEY)
- conversationId, sender, message
- imagedata, isAdmin, delivered, read
- timestamp

## How Data Flows

### When User Creates Account
```
User submits signup form
    ↓
POST /api/auth/signup
    ↓
Try to save to Postgres
    ↓
If Postgres available → Save to Postgres
If Postgres fails → Save to local fallback
    ↓
Account created successfully
```

### When User Submits Application
```
User submits application form
    ↓
POST /api/applications
    ↓
Try to save to Postgres
    ↓
Also save to local JSON (fallback)
    ↓
Application stored permanently
```

### When Admin Views Applications
```
Admin clicks "Application" tab
    ↓
GET /api/applications
    ↓
Try to fetch from Postgres
    ↓
If Postgres available → Return Postgres data
If Postgres fails → Return local data
    ↓
Display all applications
```

## Troubleshooting

### Database Not Connecting

**Check 1: Verify POSTGRES_URL**
- Go to Vercel Settings → Environment Variables
- Verify POSTGRES_URL is set correctly
- Check for typos or missing characters

**Check 2: Check Deployment Logs**
- Go to Deployments tab
- Click on latest deployment
- Look for database connection errors

**Check 3: Verify Database Exists**
- Go to Vercel Storage tab
- Confirm Postgres database is created
- Check database status is "Active"

### Data Not Persisting

**Check 1: Verify Tables Created**
- Check deployment logs for "table ready" messages
- All 4 tables should be created

**Check 2: Check Application Logs**
- Look for errors in deployment logs
- Check browser console for API errors

**Check 3: Test API Directly**
- Open browser DevTools
- Go to Network tab
- Submit an application
- Check if POST request succeeds

### Account Creation Failing

**Check 1: Check Email Validation**
- Verify email format is correct
- Check password is at least 6 characters

**Check 2: Check Postgres Connection**
- Verify POSTGRES_URL is set
- Check deployment logs for connection errors

**Check 3: Check Local Fallback**
- Even if Postgres fails, account should be created
- Check browser console for error messages

## Benefits of Postgres

✅ **Permanent Storage** - Data persists across deployments
✅ **Scalability** - Handles unlimited applications
✅ **Reliability** - Automatic backups
✅ **Performance** - Fast queries
✅ **Security** - Encrypted connections
✅ **Real-time** - Instant data updates

## After Setup

### Test Everything

1. **Create Account**
   - Go to homepage
   - Create new account
   - Should succeed without errors

2. **Submit Application**
   - Login with new account
   - Submit application
   - Should appear in admin dashboard

3. **Admin Dashboard**
   - Login as admin
   - Check "Application" tab
   - All applications should be visible
   - Should persist after page refresh

4. **Messaging**
   - Send message from applicant
   - Check admin receives it
   - Send reply from admin
   - Check applicant receives it

## Monitoring

### Check Database Usage

1. Go to Vercel Dashboard
2. Click "Storage" tab
3. View database statistics
4. Monitor storage usage

### View Database Logs

1. Go to Vercel Storage
2. Click on your Postgres database
3. View connection logs
4. Check for errors

## Support

If you encounter issues:

1. Check deployment logs in Vercel
2. Verify all environment variables are set
3. Check browser console for errors
4. Review this guide for troubleshooting steps

## Summary

Once Postgres is set up:
- ✅ All applicant data is permanent
- ✅ All user accounts are permanent
- ✅ All messages are permanent
- ✅ Data won't be wiped on redeploy
- ✅ System is production-ready

**Status**: Ready to set up Postgres on Vercel
