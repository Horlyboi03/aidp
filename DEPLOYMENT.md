# AIDP Deployment Guide for Vercel

## Database Storage Solution

Since Vercel is a serverless platform, file-based storage (JSON files) won't persist between deployments. Here are your options:

### Option 1: Vercel Postgres (Recommended for Production)

1. **Install Vercel Postgres:**
```bash
npm install @vercel/postgres
```

2. **Set up database in Vercel Dashboard:**
   - Go to your project on vercel.com
   - Click "Storage" tab
   - Create a new Postgres database
   - Vercel will automatically add environment variables

3. **Create database tables:**
```sql
CREATE TABLE applications (
  id VARCHAR(255) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  country VARCHAR(100),
  address TEXT,
  date_of_birth DATE,
  occupation VARCHAR(255),
  marital_status VARCHAR(50),
  monthly_income VARCHAR(100),
  grant_amount VARCHAR(100),
  grant_purpose VARCHAR(255),
  payment_method VARCHAR(50),
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  privacy_agreed BOOLEAN DEFAULT false
);

CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversations (
  id VARCHAR(255) PRIMARY KEY,
  applicant_name VARCHAR(255) NOT NULL,
  applicant_email VARCHAR(255),
  last_message TEXT,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
  id VARCHAR(255) PRIMARY KEY,
  conversation_id VARCHAR(255) REFERENCES conversations(id),
  sender VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  delivered BOOLEAN DEFAULT true,
  read BOOLEAN DEFAULT false,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agent_settings (
  id SERIAL PRIMARY KEY,
  image_url TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Option 2: Vercel KV (Redis) - Simpler Setup

1. **Install Vercel KV:**
```bash
npm install @vercel/kv
```

2. **Set up KV in Vercel Dashboard:**
   - Go to your project on vercel.com
   - Click "Storage" tab
   - Create a new KV (Redis) database
   - Vercel will automatically add environment variables

### Option 3: MongoDB Atlas (Free Tier Available)

1. **Install MongoDB:**
```bash
npm install mongodb
```

2. **Create MongoDB Atlas account:**
   - Go to mongodb.com/cloud/atlas
   - Create free cluster
   - Get connection string

3. **Add to Vercel environment variables:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aidp
```

### Option 4: Quick Fix - Use Vercel Blob Storage

For now, to keep your current file-based system working:

1. **Install Vercel Blob:**
```bash
npm install @vercel/blob
```

2. **Set up Blob in Vercel Dashboard:**
   - Go to your project
   - Click "Storage" tab
   - Create Blob storage
   - Vercel adds environment variables automatically

## Current Setup (File-based)

Your current setup uses JSON files in the `data/` folder. This works locally but **will not persist** on Vercel because:
- Vercel's filesystem is read-only in production
- Each deployment creates a new instance
- Data is lost between deployments

## Immediate Fix (Temporary)

To make your site work immediately on Vercel with the current code:

1. **The data will reset on each deployment** - this is expected
2. **For testing purposes**, this is fine
3. **For production**, you MUST use a real database (Option 1, 2, or 3 above)

## Environment Variables for Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

```
# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=aidp2024

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=marygeorge193@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=AIDP Grant Program <noreply@aidp.com>
```

## Deployment Steps

1. **Push your code to GitHub:**
```bash
git add .
git commit -m "Fix mobile responsiveness and add deployment guide"
git push origin main
```

2. **Vercel will auto-deploy** (if connected to GitHub)
   OR manually deploy:
```bash
vercel --prod
```

3. **Your site will be live at:**
   - https://your-project.vercel.app
   - https://your-project.vercel.app/admin

## Known Limitations (Current Setup)

1. ✅ Website works perfectly
2. ✅ Applications can be submitted
3. ✅ Admin can view applications
4. ❌ Data resets on each deployment
5. ❌ No data persistence between sessions
6. ❌ Uploaded images don't persist

## Recommended Next Steps

1. **For testing:** Current setup is fine
2. **For production:** Implement Vercel Postgres (Option 1)
3. **For quick fix:** Use Vercel KV (Option 2)

## Support

If you need help setting up a database, let me know which option you prefer:
- Option 1: Vercel Postgres (best for production)
- Option 2: Vercel KV (easiest setup)
- Option 3: MongoDB Atlas (most flexible)
