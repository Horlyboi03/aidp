# Vercel Postgres Setup Instructions

## Quick Setup (5 minutes)

### Step 1: Create Postgres Database on Vercel

1. Go to: https://vercel.com/dashboard
2. Select project: **aidpprogramapply**
3. Click **Storage** tab
4. Click **Create Database** → Select **Postgres**
5. Configure:
   - Name: `aidp-db`
   - Region: `us-east-1` (or closest to you)
   - Click **Create**

### Step 2: Copy Connection String

After database is created:
1. Click on the database
2. Go to **.env.local** tab
3. Copy the entire content (it will have all environment variables)

### Step 3: Add to Your Project

**Option A: Automatic (Recommended)**
- Vercel automatically adds variables to your project
- Just redeploy your project
- Variables will be available immediately

**Option B: Manual**
1. Go to Project Settings → Environment Variables
2. Paste all the variables from Step 2
3. Click Save
4. Redeploy

### Step 4: Test Connection

After deployment, visit:
```
https://aidpprogramapply.vercel.app/api/test-db
```

Should show: ✅ Database connection successful

### Step 5: Test Applications

Visit:
```
https://aidpprogramapply.vercel.app/api/debug/env-check
```

Should show all environment variables as ✅ SET

## What Gets Created

Vercel Postgres automatically creates these environment variables:

```
POSTGRES_URL              - Full connection string (with pooling)
POSTGRES_URL_NON_POOLING  - Connection string (without pooling)
POSTGRES_USER             - Database user
POSTGRES_PASSWORD         - Database password
POSTGRES_HOST             - Database host
POSTGRES_PORT             - Database port
POSTGRES_DATABASE         - Database name
```

## Troubleshooting

**"Failed to fetch applications"**
- Check if POSTGRES_URL is set: `/api/debug/env-check`
- Check database connection: `/api/test-db`
- Check if tables exist: `/api/debug/applications-test`

**"Connection refused"**
- Verify POSTGRES_URL is correct
- Check if database is running on Vercel
- Redeploy the project

**"No applications showing"**
- Submit a new application
- Wait 2-3 seconds
- Refresh admin page
- Check `/api/debug/applications-test` for data

## Local Development

To test locally:
1. Copy POSTGRES_URL from Vercel
2. Add to `.env.local`
3. Run: `npm run dev`
4. Test at: `http://localhost:3000/api/test-db`

## Database Schema

Tables automatically created:
- `applications` - Grant applications
- `users` - User accounts
- `conversations` - Chat conversations
- `messages` - Chat messages

All tables created on first API call.

## Support

If issues persist:
1. Check Vercel logs: https://vercel.com/dashboard/aidpprogramapply/logs
2. Check browser console (F12)
3. Visit debug endpoints:
   - `/api/test-db` - Connection test
   - `/api/debug/env-check` - Environment variables
   - `/api/debug/applications-test` - Applications data
