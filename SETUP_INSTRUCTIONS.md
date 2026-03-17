# AIDP Setup Instructions

## Step 1: Set Your Admin Credentials

### Option A: For Local Development

1. Open `.env.local` file
2. Change these values to your own:

```env
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_password
JWT_SECRET=your-random-secret-key
```

### Option B: For Vercel Production

1. Go to https://vercel.com/dashboard
2. Select your project (aidp-g)
3. Go to Settings → Environment Variables
4. Add these variables:

```
ADMIN_USERNAME = your_username
ADMIN_PASSWORD = your_password
JWT_SECRET = your-random-secret-key
```

**Important:** Use a strong password and keep it secret!

## Step 2: Set Up Database (Neon Postgres)

### Create Database on Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Storage" tab
4. Click "Create Database"
5. Select "Postgres" (powered by Neon)
6. Click "Create"
7. Vercel automatically adds these environment variables:
   - POSTGRES_URL
   - POSTGRES_PRISMA_URL
   - POSTGRES_URL_NON_POOLING
   - POSTGRES_USER
   - POSTGRES_HOST
   - POSTGRES_PASSWORD
   - POSTGRES_DATABASE

### Run Database Schema

After creating the database:

1. Go to Neon dashboard (link provided by Vercel)
2. Click "SQL Editor"
3. Copy the contents of `database/schema.sql`
4. Paste and run it
5. This creates all tables and indexes

**OR** use the Neon CLI:

```bash
# Install Neon CLI
npm install -g neonctl

# Login
neonctl auth

# Run schema
neonctl sql < database/schema.sql
```

## Step 3: Update Code to Use Database

I'll create database helper files that use Neon. The code will automatically:
- Store applications in database
- Store users in database
- Store messages in database
- Persist all data permanently

## Step 4: Deploy

```bash
# Commit changes
git add .
git commit -m "Add database support and custom admin credentials"

# Push to GitHub (triggers Vercel deployment)
git push origin main
```

## Step 5: Test

1. Wait for Vercel deployment (1-2 minutes)
2. Go to https://your-site.vercel.app/admin
3. Login with YOUR new credentials
4. Submit a test application
5. Check if it persists after page refresh

## Security Notes

### ✅ DO:
- Use a strong, unique password
- Keep credentials secret
- Use environment variables
- Change JWT_SECRET to a random string

### ❌ DON'T:
- Commit .env.local to Git (it's in .gitignore)
- Share your credentials
- Use simple passwords like "password123"
- Reuse passwords from other sites

## Generate Secure JWT Secret

Use one of these methods:

**Method 1: OpenSSL**
```bash
openssl rand -base64 32
```

**Method 2: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Method 3: Online**
- Go to https://generate-secret.vercel.app/32
- Copy the generated secret

## Troubleshooting

### Can't login with new credentials?
- Check environment variables in Vercel dashboard
- Redeploy after adding variables
- Clear browser cache and try again

### Database not working?
- Verify database is created in Vercel
- Check environment variables are set
- Run schema.sql in Neon SQL Editor

### Data still not persisting?
- Make sure database is connected
- Check Vercel logs for errors
- Verify schema was run successfully

## What's Changed?

### ✅ Removed:
- Demo credentials display
- Hardcoded admin/aidp2024
- File-based storage (JSON files)

### ✅ Added:
- Environment variable credentials
- Secure JWT authentication
- Neon Postgres database
- Persistent data storage
- Production-ready setup

## Next Steps

After setup is complete:
1. Test admin login with your credentials
2. Submit test applications
3. Verify data persists
4. Set up email notifications (optional)
5. Go live!

## Support

If you need help:
1. Check Vercel deployment logs
2. Check Neon database connection
3. Verify environment variables
4. Ask me for help!
