import { sql } from '@vercel/postgres'

// Initialize tables if they don't exist
export async function initializeTables() {
  try {
    // Applications table
    await sql`
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
    `

    // Users table
    await sql`
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
    `

    // Conversations table
    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        applicantName TEXT NOT NULL,
        applicantEmail TEXT NOT NULL,
        lastMessage TEXT,
        lastMessageAt TEXT,
        unreadCount INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL
      )
    `

    // Messages table
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversationId TEXT NOT NULL,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        isAdmin INTEGER DEFAULT 0,
        delivered INTEGER DEFAULT 1,
        read INTEGER DEFAULT 0,
        timestamp TEXT NOT NULL
      )
    `

    console.log('Postgres tables initialized')
  } catch (error) {
    console.error('Error initializing tables:', error)
  }
}

// Application functions
export async function saveApplication(application: any) {
  await initializeTables()
  
  await sql`
    INSERT INTO applications (
      id, fullName, email, phone, country, maritalStatus, occupation,
      monthlyIncome, grantAmount, grantPurpose, paymentMethod, description,
      status, submittedAt
    ) VALUES (
      ${application.id},
      ${application.fullName},
      ${application.email},
      ${application.phone || null},
      ${application.country},
      ${application.maritalStatus || null},
      ${application.occupation || null},
      ${application.monthlyIncome || null},
      ${application.grantAmount},
      ${application.grantPurpose || null},
      ${application.paymentMethod || null},
      ${application.description || null},
      ${application.status || 'pending'},
      ${application.submittedAt}
    )
  `

  return application
}

export async function getAllApplications() {
  await initializeTables()
  const { rows } = await sql`SELECT * FROM applications ORDER BY submittedAt DESC`
  return rows
}

export async function getApplicationById(id: string) {
  await initializeTables()
  const { rows } = await sql`SELECT * FROM applications WHERE id = ${id}`
  return rows[0]
}

export async function updateApplicationStatus(id: string, status: string) {
  await initializeTables()
  await sql`
    UPDATE applications 
    SET status = ${status}, updatedAt = ${new Date().toISOString()}
    WHERE id = ${id}
  `
  return await getApplicationById(id)
}

export async function getApplicationStats() {
  await initializeTables()
  
  const total = await sql`SELECT COUNT(*) as count FROM applications`
  const pending = await sql`SELECT COUNT(*) as count FROM applications WHERE status = 'pending'`
  const approved = await sql`SELECT COUNT(*) as count FROM applications WHERE status = 'approved'`
  const rejected = await sql`SELECT COUNT(*) as count FROM applications WHERE status = 'rejected'`

  return {
    total: parseInt(total.rows[0].count),
    pending: parseInt(pending.rows[0].count),
    approved: parseInt(approved.rows[0].count),
    rejected: parseInt(rejected.rows[0].count)
  }
}

// User functions
export async function saveUser(user: any) {
  await initializeTables()
  
  await sql`
    INSERT INTO users (id, fullName, email, phone, country, password, applications, createdAt)
    VALUES (
      ${user.id},
      ${user.fullName},
      ${user.email},
      ${user.phone || null},
      ${user.country || null},
      ${user.password},
      ${user.applications || '[]'},
      ${user.createdAt}
    )
  `

  return user
}

export async function getUserByEmail(email: string) {
  await initializeTables()
  const { rows } = await sql`SELECT * FROM users WHERE email = ${email}`
  const user = rows[0]
  if (user && user.applications) {
    user.applications = JSON.parse(user.applications)
  }
  return user
}

export async function getUserById(id: string) {
  await initializeTables()
  const { rows } = await sql`SELECT * FROM users WHERE id = ${id}`
  const user = rows[0]
  if (user && user.applications) {
    user.applications = JSON.parse(user.applications)
  }
  return user
}

export async function addApplicationToUser(userId: string, applicationId: string) {
  await initializeTables()
  const user = await getUserById(userId)
  if (user) {
    const applications = user.applications || []
    applications.push(applicationId)
    await sql`UPDATE users SET applications = ${JSON.stringify(applications)} WHERE id = ${userId}`
    return true
  }
  return false
}

export async function getUserApplications(userId: string) {
  const user = await getUserById(userId)
  return user ? (user.applications || []) : []
}

// Conversation functions
export async function saveConversation(conversation: any) {
  await initializeTables()
  
  await sql`
    INSERT INTO conversations (
      id, applicantName, applicantEmail, lastMessage, lastMessageAt, unreadCount, createdAt
    ) VALUES (
      ${conversation.id},
      ${conversation.applicantName},
      ${conversation.applicantEmail},
      ${conversation.lastMessage || null},
      ${conversation.lastMessageAt || null},
      ${conversation.unreadCount || 0},
      ${conversation.createdAt || new Date().toISOString()}
    )
    ON CONFLICT (id) DO UPDATE SET
      lastMessage = ${conversation.lastMessage || null},
      lastMessageAt = ${conversation.lastMessageAt || null},
      unreadCount = ${conversation.unreadCount || 0}
  `

  return conversation
}

export async function getAllConversations() {
  await initializeTables()
  const { rows } = await sql`SELECT * FROM conversations ORDER BY lastMessageAt DESC NULLS LAST`
  return rows
}

export async function getConversationById(id: string) {
  await initializeTables()
  const { rows } = await sql`SELECT * FROM conversations WHERE id = ${id}`
  return rows[0]
}

// Message functions
export async function saveMessage(message: any) {
  await initializeTables()
  
  await sql`
    INSERT INTO messages (
      id, conversationId, sender, message, isAdmin, delivered, read, timestamp
    ) VALUES (
      ${message.id},
      ${message.conversationId},
      ${message.sender},
      ${message.message},
      ${message.isAdmin ? 1 : 0},
      ${message.delivered ? 1 : 0},
      ${message.read ? 1 : 0},
      ${message.timestamp}
    )
  `

  return message
}

export async function getMessagesByConversationId(conversationId: string) {
  await initializeTables()
  const { rows } = await sql`SELECT * FROM messages WHERE conversationId = ${conversationId} ORDER BY timestamp ASC`
  return rows
}

export async function markMessagesAsRead(conversationId: string, isAdmin: boolean) {
  await initializeTables()
  await sql`
    UPDATE messages 
    SET read = 1 
    WHERE conversationId = ${conversationId} AND isAdmin = ${isAdmin ? 1 : 0}
  `
}
