# Quick Vercel Setup Guide

## Current Status

Your AIDP website is deployed but has these issues:
1. ✅ Logo too big on mobile - **FIXED**
2. ✅ Chat button too big - **FIXED**  
3. ✅ Mary George picture not showing - **FIXED**
4. ❌ Data not persisting - **NEEDS DATABASE**

## Why Data Doesn't Persist on Vercel

Vercel is a **serverless platform**:
- File system is **read-only** in production
- Each request runs in a new container
- JSON files can't be written/saved
- Data resets on every deployment

## Solution: Add a Real Database

### EASIEST OPTION: Vercel KV (Redis)

**Step 1: Create KV Database**
1. Go to https://vercel.com/dashboard
2. Select your project (aidp-g)
3. Click "Storage" tab
4. Click "Create Database"
5. Select "KV" (Redis)
6. Click "Create"
7. Vercel automatically adds environment variables

**Step 2: Install Package**
```bash
npm install @vercel/kv
```

**Step 3: I'll update the code to use KV**

### ALTERNATIVE: Vercel Postgres (Better for Production)

**Step 1: Create Postgres Database**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Storage" tab
4. Click "Create Database"
5. Select "Postgres"
6. Click "Create"

**Step 2: Install Package**
```bash
npm install @vercel/postgres
```

## What Happens Without Database?

- ✅ Website loads perfectly
- ✅ Users can submit applications
- ✅ Admin can log in
- ❌ Applications disappear after page refresh
- ❌ Data resets on each deployment
- ❌ No persistence between sessions

## Current Workaround

The site works but data is **temporary**:
- Good for: Testing, demos, previews
- Bad for: Real users, production use

## Next Steps

**Choose one:**

1. **Quick Fix (5 minutes):** 
   - I'll set up Vercel KV for you
   - Data will persist
   - Works immediately

2. **Production Ready (15 minutes):**
   - I'll set up Vercel Postgres
   - Full database with tables
   - Best for long-term use

3. **Keep Testing:**
   - Use current setup
   - Data resets are expected
   - Good for showing the site to others

## Which Option Do You Want?

Reply with:
- "Option 1" - Quick KV setup
- "Option 2" - Full Postgres setup  
- "Option 3" - Keep testing for now

I'll implement whichever you choose!
