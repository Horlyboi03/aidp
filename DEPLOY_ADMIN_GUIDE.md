# Deploy AIDP Admin Dashboard - Step by Step Guide

## Prerequisites

Before deploying, make sure you have:
- ✅ GitHub account
- ✅ Vercel account (free tier works)
- ✅ Git installed on your computer
- ✅ VS Code with terminal access

## Step 1: Prepare Your Code

### 1.1 Open Terminal in VS Code
Press `Ctrl + ~` (or View → Terminal)

### 1.2 Check Git Status
```bash
git status
```

### 1.3 Add All Changes
```bash
git add .
```

### 1.4 Commit Changes
```bash
git commit -m "Added SQLite database integration for permanent storage"
```

### 1.5 Push to GitHub
```bash
git push origin main
```

If you get an error about branch name, try:
```bash
git push origin master
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

#### 2.1 Install Vercel CLI
```bash
npm install -g vercel
```

#### 2.2 Login to Vercel
```bash
vercel login
```
Follow the prompts to authenticate.

#### 2.3 Deploy
```bash
vercel
```

Answer the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **Y** (if you have one) or **N** (for new)
- Project name? **aidp-grant-application** (or your preferred name)
- Directory? Press Enter (current directory)
- Override settings? **N**

#### 2.4 Deploy to Production
```bash
vercel --prod
```

### Option B: Using Vercel Dashboard

#### 2.1 Go to Vercel
Open your browser and go to: https://vercel.com

#### 2.2 Login
Login with your GitHub account

#### 2.3 Import Project
1. Click "Add New..." → "Project"
2. Select your GitHub repository: `Horlyboi03/aidp`
3. Click "Import"

#### 2.4 Configure Project
- Framework Preset: **Next.js**
- Root Directory: `./` (leave as is)
- Build Command: `npm run build`
- Output Directory: `.next`

#### 2.5 Add Environment Variables
Click "Environment Variables" and add these:

**Required Variables:**
```
ADMIN_USERNAME=horlyboi
ADMIN_PASSWORD=horlyboi03!
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=maryygeorge193@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=AIDP Grant Program <maryygeorge193@gmail.com>
```

**Important Notes:**
- For `JWT_SECRET`: Generate a random string (at least 32 characters)
- For `EMAIL_PASS`: Use your Gmail App Password (16 characters, no spaces)

#### 2.6 Deploy
Click "Deploy" button

## Step 3: Get Your Admin Link

### After Deployment Completes:

Your admin dashboard will be available at:
```
https://your-project-name.vercel.app/admin
```

For example:
```
https://aidp-grant-application.vercel.app/admin
```

### Admin Login Credentials:
- **Username**: horlyboi
- **Password**: horlyboi03!

## Step 4: Important - Database Configuration

### ⚠️ CRITICAL: SQLite Won't Work on Vercel

Vercel uses serverless functions, which means SQLite database files won't persist. You need to use Vercel Postgres (Neon) instead.

### Option 1: Use Vercel Postgres (Recommended for Production)

#### 4.1 Create Postgres Database
1. Go to your Vercel project dashboard
2. Click "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Choose "Neon" as provider
6. Click "Create"

#### 4.2 Connect Database
Vercel will automatically add these environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

#### 4.3 Update Your Code (I can help with this)
You'll need to update `lib/database.ts` to use Postgres instead of SQLite.

### Option 2: Keep SQLite for Testing Only

If you just want to test the deployment:
1. The site will work but data won't persist
2. Each deployment will reset the database
3. Good for testing, not for production

## Step 5: Test Your Deployment

### 5.1 Test Homepage
Visit: `https://your-project-name.vercel.app`

### 5.2 Test Admin Login
Visit: `https://your-project-name.vercel.app/admin`
- Enter username: horlyboi
- Enter password: horlyboi03!

### 5.3 Test Application Submission
1. Go to homepage
2. Click "Apply Now"
3. Fill out the form
4. Submit
5. Check admin dashboard

## Step 6: Share Admin Link

Your admin dashboard link is:
```
https://your-project-name.vercel.app/admin
```

Share this link with anyone who needs admin access. They'll need the username and password.

## Quick Commands Reference

### Deploy from VS Code Terminal:
```bash
# First time setup
npm install -g vercel
vercel login
vercel

# Future deployments
git add .
git commit -m "Your update message"
git push origin main
vercel --prod
```

### Check Deployment Status:
```bash
vercel ls
```

### View Logs:
```bash
vercel logs
```

## Troubleshooting

### Issue: "Command not found: vercel"
**Solution**: Install Vercel CLI globally
```bash
npm install -g vercel
```

### Issue: "Authentication required"
**Solution**: Login to Vercel
```bash
vercel login
```

### Issue: "Build failed"
**Solution**: Check environment variables are set correctly in Vercel dashboard

### Issue: "Admin login not working"
**Solution**: 
1. Check environment variables in Vercel dashboard
2. Make sure `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set
3. Redeploy after adding variables

### Issue: "Data not persisting"
**Solution**: 
- SQLite doesn't work on Vercel
- Use Vercel Postgres instead (see Step 4)

## Need to Update After Deployment?

### Method 1: Automatic (Recommended)
1. Make changes in VS Code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. Vercel will automatically redeploy

### Method 2: Manual
1. Make changes in VS Code
2. Run in terminal:
   ```bash
   vercel --prod
   ```

## Your Admin Dashboard URLs

After deployment, you'll have:
- **Homepage**: `https://your-project-name.vercel.app`
- **Admin Dashboard**: `https://your-project-name.vercel.app/admin`
- **Admin Login**: Username: `horlyboi`, Password: `horlyboi03!`

## Security Tips

1. Change the admin password after first login
2. Use strong JWT_SECRET (32+ characters)
3. Keep your Gmail App Password secure
4. Don't share your environment variables
5. Use HTTPS only (Vercel provides this automatically)

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Test admin login
3. ✅ Test application submission
4. ⏳ Set up Postgres database for production
5. ⏳ Configure custom domain (optional)
6. ⏳ Set up monitoring and alerts

---

**Need Help?**
If you encounter any issues, let me know and I'll help you troubleshoot!
