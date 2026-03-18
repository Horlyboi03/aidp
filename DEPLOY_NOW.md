# Deploy Mary George Picture - Quick Guide

## What I Just Fixed
✅ Updated code to use your actual Mary George picture: `WhatsApp Image 2026-03-12 at 8.11.50 PM.jpeg`
✅ Updated all references in the code to point to your image
✅ Picture will now show on homepage and admin dashboard

## Deploy to Vercel in VS Code - 3 Simple Steps

### Step 1: Open Terminal in VS Code
- Press `Ctrl + `` (backtick key, above Tab)
- Or click: Terminal → New Terminal from the top menu

### Step 2: Run These Commands (Copy & Paste One by One)

```bash
git add .
```
Press Enter, then:

```bash
git commit -m "Add Mary George picture"
```
Press Enter, then:

```bash
git push origin main
```
Press Enter

### Step 3: Wait for Deployment
- Vercel will automatically deploy (takes 1-2 minutes)
- Your site will update with the Mary George picture

## Find Your Website URL

### Option 1: In Vercel Dashboard
1. Go to https://vercel.com
2. Click on your project (should be "aidp" or similar)
3. Look at the top - you'll see your URL like: `https://aidp-xxx.vercel.app`

### Option 2: In VS Code Terminal
After pushing, look for a message like:
```
✓ Deployed to production: https://your-site.vercel.app
```

## Troubleshooting

### If Git Says "Nothing to Commit"
Your changes are already saved! Just run:
```bash
git push origin main
```

### If You Get "Remote Origin Already Exists" Error
That's fine! It means Git is already set up. Just run:
```bash
git push origin main
```

### If You Need to Check What Changed
```bash
git status
```

## After Deployment
1. Wait 1-2 minutes for Vercel to build
2. Visit your website URL
3. Mary George picture should now appear on the homepage!

---

**Your GitHub Repo:** https://github.com/Horlyboi03/aidp.git
**Vercel Dashboard:** https://vercel.com/dashboard
