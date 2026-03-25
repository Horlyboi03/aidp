import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

// Database file path
const DB_PATH = path.join(process.cwd(), 'data', 'aidp.db')

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(DB_PATH)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Initialize database
let db: Database.Database | null = null

export function getDatabase() {
  if (!db) {
    ensureDataDir()
    db = new Database(DB_PATH)
    initializeTables()
  }
  return db
}

// Create tables if they don't exist
function initializeTables() {
  if (!db) return

  // Applications table
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

  // Users table
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

  // Conversations table
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

  // Messages table
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

  console.log('Database tables initialized')
}

// Application functions
export function saveApplication(application: any) {
  const db = getDatabase()
  
  const stmt = db.prepare(`
    INSERT INTO applications (
      id, fullName, email, phone, country, maritalStatus, occupation,
      monthlyIncome, grantAmount, grantPurpose, paymentMethod, description,
      status, submittedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    application.id,
    application.fullName,
    application.email,
    application.phone || null,
    application.country,
    application.maritalStatus || null,
    application.occupation || null,
    application.monthlyIncome || null,
    application.grantAmount,
    application.grantPurpose || null,
    application.paymentMethod || null,
    application.description || null,
    application.status || 'pending',
    application.submittedAt
  )

  return application
}

export function getAllApplications() {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM applications ORDER BY submittedAt DESC')
  return stmt.all()
}

export function getApplicationById(id: string) {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM applications WHERE id = ?')
  return stmt.get(id)
}

export function updateApplicationStatus(id: string, status: string) {
  const db = getDatabase()
  const stmt = db.prepare(`
    UPDATE applications 
    SET status = ?, updatedAt = ? 
    WHERE id = ?
  `)
  stmt.run(status, new Date().toISOString(), id)
  return getApplicationById(id)
}

export function getApplicationStats() {
  const db = getDatabase()
  
  const total = db.prepare('SELECT COUNT(*) as count FROM applications').get() as any
  const pending = db.prepare('SELECT COUNT(*) as count FROM applications WHERE status = ?').get('pending') as any
  const approved = db.prepare('SELECT COUNT(*) as count FROM applications WHERE status = ?').get('approved') as any
  const rejected = db.prepare('SELECT COUNT(*) as count FROM applications WHERE status = ?').get('rejected') as any

  return {
    total: total.count,
    pending: pending.count,
    approved: approved.count,
    rejected: rejected.count
  }
}

// User functions
export function saveUser(user: any) {
  const db = getDatabase()
  
  const stmt = db.prepare(`
    INSERT INTO users (id, fullName, email, phone, country, password, applications, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    user.id,
    user.fullName,
    user.email,
    user.phone || null,
    user.country || null,
    user.password,
    user.applications || '[]',
    user.createdAt
  )

  return user
}

export function getUserByEmail(email: string) {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
  const user = stmt.get(email) as any
  if (user && user.applications) {
    user.applications = JSON.parse(user.applications)
  }
  return user
}

export function getUserById(id: string) {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
  const user = stmt.get(id) as any
  if (user && user.applications) {
    user.applications = JSON.parse(user.applications)
  }
  return user
}

export function addApplicationToUser(userId: string, applicationId: string) {
  const db = getDatabase()
  const user = getUserById(userId)
  if (user) {
    const applications = user.applications || []
    applications.push(applicationId)
    const stmt = db.prepare('UPDATE users SET applications = ? WHERE id = ?')
    stmt.run(JSON.stringify(applications), userId)
    return true
  }
  return false
}

export function getUserApplications(userId: string) {
  const user = getUserById(userId)
  return user ? (user.applications || []) : []
}

// Conversation functions
export function saveConversation(conversation: any) {
  const db = getDatabase()
  
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO conversations (
      id, applicantName, applicantEmail, lastMessage, lastMessageAt, unreadCount, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    conversation.id,
    conversation.applicantName,
    conversation.applicantEmail,
    conversation.lastMessage || null,
    conversation.lastMessageAt || null,
    conversation.unreadCount || 0,
    conversation.createdAt || new Date().toISOString()
  )

  return conversation
}

export function getAllConversations() {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM conversations ORDER BY lastMessageAt DESC')
  return stmt.all()
}

export function getConversationById(id: string) {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM conversations WHERE id = ?')
  return stmt.get(id)
}

// Message functions
export function saveMessage(message: any) {
  const db = getDatabase()
  
  const stmt = db.prepare(`
    INSERT INTO messages (
      id, conversationId, sender, message, isAdmin, delivered, read, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    message.id,
    message.conversationId,
    message.sender,
    message.message,
    message.isAdmin ? 1 : 0,
    message.delivered ? 1 : 0,
    message.read ? 1 : 0,
    message.timestamp
  )

  return message
}

export function getMessagesByConversationId(conversationId: string) {
  const db = getDatabase()
  const stmt = db.prepare('SELECT * FROM messages WHERE conversationId = ? ORDER BY timestamp ASC')
  return stmt.all(conversationId)
}

export function markMessagesAsRead(conversationId: string, isAdmin: boolean) {
  const db = getDatabase()
  const stmt = db.prepare(`
    UPDATE messages 
    SET read = 1 
    WHERE conversationId = ? AND isAdmin = ?
  `)
  stmt.run(conversationId, isAdmin ? 1 : 0)
}

// Close database connection
export function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}
