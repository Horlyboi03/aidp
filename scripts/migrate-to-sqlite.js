// Migration script to transfer data from JSON files to SQLite database
const fs = require('fs')
const path = require('path')
const Database = require('better-sqlite3')

const dataDir = path.join(process.cwd(), 'data')
const dbPath = path.join(dataDir, 'aidp.db')

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Initialize database
const db = new Database(dbPath)

// Create tables
console.log('Creating database tables...')
db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
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
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    country TEXT,
    password TEXT NOT NULL,
    applications TEXT DEFAULT '[]',
    createdAt TEXT NOT NULL
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    applicantName TEXT NOT NULL,
    applicantEmail TEXT NOT NULL,
    lastMessage TEXT,
    lastMessageAt TEXT,
    unreadCount INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
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
`)

console.log('Tables created successfully!')

// Migrate applications
const applicationsFile = path.join(dataDir, 'applications.json')
if (fs.existsSync(applicationsFile)) {
  console.log('\nMigrating applications...')
  const applications = JSON.parse(fs.readFileSync(applicationsFile, 'utf8'))
  
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO applications (
      id, fullName, email, phone, country, maritalStatus, occupation,
      monthlyIncome, grantAmount, grantPurpose, paymentMethod, description,
      status, submittedAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  let count = 0
  for (const app of applications) {
    stmt.run(
      app.id,
      app.fullName,
      app.email,
      app.phone || null,
      app.country,
      app.maritalStatus || null,
      app.occupation || null,
      app.monthlyIncome || null,
      app.grantAmount,
      app.grantPurpose || null,
      app.paymentMethod || null,
      app.description || null,
      app.status || 'pending',
      app.submittedAt,
      app.updatedAt || null
    )
    count++
  }
  console.log(`Migrated ${count} applications`)
}

// Migrate users
const usersFile = path.join(dataDir, 'users.json')
if (fs.existsSync(usersFile)) {
  console.log('\nMigrating users...')
  const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'))
  
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO users (
      id, fullName, email, phone, country, password, applications, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  let count = 0
  for (const user of users) {
    stmt.run(
      user.id,
      user.fullName,
      user.email,
      user.phone || null,
      user.country || null,
      user.password,
      JSON.stringify(user.applications || []),
      user.createdAt
    )
    count++
  }
  console.log(`Migrated ${count} users`)
}

// Migrate conversations
const conversationsFile = path.join(dataDir, 'conversations.json')
if (fs.existsSync(conversationsFile)) {
  console.log('\nMigrating conversations...')
  const conversations = JSON.parse(fs.readFileSync(conversationsFile, 'utf8'))
  
  const convStmt = db.prepare(`
    INSERT OR REPLACE INTO conversations (
      id, applicantName, applicantEmail, lastMessage, lastMessageAt, unreadCount, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  const msgStmt = db.prepare(`
    INSERT OR REPLACE INTO messages (
      id, conversationId, sender, message, isAdmin, delivered, read, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  let convCount = 0
  let msgCount = 0
  
  for (const conv of conversations) {
    convStmt.run(
      conv.id,
      conv.applicantName,
      conv.applicantEmail,
      conv.lastMessage || null,
      conv.lastMessageAt || null,
      conv.unreadCount || 0,
      conv.createdAt
    )
    convCount++

    // Migrate messages
    if (conv.messages && Array.isArray(conv.messages)) {
      for (const msg of conv.messages) {
        msgStmt.run(
          msg.id,
          msg.conversationId,
          msg.sender,
          msg.message,
          msg.isAdmin ? 1 : 0,
          msg.delivered ? 1 : 0,
          msg.read ? 1 : 0,
          msg.timestamp
        )
        msgCount++
      }
    }
  }
  console.log(`Migrated ${convCount} conversations and ${msgCount} messages`)
}

db.close()

console.log('\n✅ Migration completed successfully!')
console.log('\nYou can now start your application with: npm run dev')
console.log('The database file is located at: data/aidp.db')
