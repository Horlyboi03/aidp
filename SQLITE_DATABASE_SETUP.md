# SQLite Database Setup - COMPLETED ✅

## Overview
The AIDP Grant Application website now uses SQLite database for permanent data storage. All application submissions, user accounts, and chat conversations are stored in a local SQLite database file.

## What Was Done

### 1. Database Implementation
- ✅ Installed `better-sqlite3` package
- ✅ Created database handler at `lib/database.ts`
- ✅ Implemented 4 tables:
  - `applications` - Grant application submissions
  - `users` - User accounts with authentication
  - `conversations` - Chat conversations
  - `messages` - Individual chat messages

### 2. API Routes Updated
All API routes now use the SQLite database instead of JSON files:
- ✅ `app/api/applications/route.ts` - Application submissions
- ✅ `app/api/applications/[id]/status/route.ts` - Status updates
- ✅ `app/api/auth/signup/route.ts` - User registration
- ✅ `app/api/auth/signin/route.ts` - User authentication
- ✅ `app/api/messages/route.ts` - Chat messaging
- ✅ `app/api/admin/stats/route.ts` - Admin statistics
- ✅ `app/api/user/applications/route.ts` - User's applications
- ✅ `app/api/user/link-application/route.ts` - Link applications to users

### 3. Database Features
- Automatic table creation on first run
- Persistent storage in `data/aidp.db`
- CRUD operations for all entities
- Foreign key relationships
- Password hashing with bcryptjs
- JSON field support for user applications array

## Database Schema

### Applications Table
```sql
CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  fullName TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT NOT NULL,
  maritalStatus TEXT,
  occupation TEXT,
  monthlyIncome TEXT,
  grantAmount TEXT NOT NULL,
  grantPurpose TEXT,
  paymentMethod TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending',
  submittedAt TEXT NOT NULL,
  updatedAt TEXT
)
```

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  fullName TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  country TEXT,
  password TEXT NOT NULL,
  applications TEXT DEFAULT '[]',
  createdAt TEXT NOT NULL
)
```

### Conversations Table
```sql
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  applicantName TEXT NOT NULL,
  applicantEmail TEXT NOT NULL,
  lastMessage TEXT,
  lastMessageAt TEXT,
  unreadCount INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL
)
```

### Messages Table
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversationId TEXT NOT NULL,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  isAdmin INTEGER DEFAULT 0,
  delivered INTEGER DEFAULT 1,
  read INTEGER DEFAULT 0,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (conversationId) REFERENCES conversations(id)
)
```

## How to Use

### Starting Fresh
If you're starting with a new installation:
1. Run `npm install` to ensure all dependencies are installed
2. Run `npm run dev` to start the development server
3. The database will be automatically created at `data/aidp.db`

### Migrating Existing Data
If you have existing data in JSON files:
1. Run the migration script:
   ```bash
   node scripts/migrate-to-sqlite.js
   ```
2. This will transfer all data from JSON files to SQLite
3. Start the server: `npm run dev`

### Database Location
- Development: `data/aidp.db` (local file)
- The database file is automatically created if it doesn't exist
- All data persists across server restarts

## Benefits

1. **Permanent Storage**: Data survives server restarts and redeployments
2. **Better Performance**: Faster queries and data retrieval
3. **Data Integrity**: Foreign keys and constraints ensure data consistency
4. **Scalability**: Can handle thousands of applications efficiently
5. **Backup Ready**: Single file (`aidp.db`) can be easily backed up

## Testing

To verify the database is working:
1. Start the server: `npm run dev`
2. Submit a test application through the website
3. Check the admin dashboard - the application should appear
4. Restart the server
5. Check the admin dashboard again - the application should still be there

## Deployment Notes

### For Vercel Deployment
Vercel's serverless environment is ephemeral, so SQLite won't persist between deployments. For production on Vercel, you should:
1. Use Vercel Postgres (Neon) instead
2. Or use a managed database service like PlanetScale, Supabase, or Railway

### For Traditional Hosting (VPS, Dedicated Server)
SQLite works perfectly! Just ensure:
1. The `data` directory has write permissions
2. The database file is included in backups
3. Consider using a process manager like PM2

## Backup Strategy

To backup your database:
```bash
# Copy the database file
cp data/aidp.db data/aidp-backup-$(date +%Y%m%d).db

# Or use SQLite's backup command
sqlite3 data/aidp.db ".backup data/aidp-backup.db"
```

## Troubleshooting

### Database locked error
- This happens when multiple processes try to write simultaneously
- Solution: Ensure only one server instance is running

### Permission denied
- The `data` directory needs write permissions
- Solution: `chmod 755 data` on Linux/Mac

### Database not found
- The database is created automatically on first run
- Ensure the server has write permissions to create files

## Next Steps

The database integration is complete! You can now:
1. Test application submissions
2. Verify data persistence
3. Deploy to your hosting platform
4. Set up regular backups

All data will be permanently stored and survive server restarts.
