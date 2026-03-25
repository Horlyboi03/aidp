import { sql } from '@vercel/postgres'

// Initialize tables if they don't exist
export async function initializeTables() {
  try {
    console.log('Starting table initialization...')
    
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
    console.log('Applications table ready')

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
        resetToken TEXT,
        resetTokenExpiry TEXT,
        createdAt TEXT NOT NULL
      )
    `
    console.log('Users table ready')

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
    console.log('Conversations table ready')

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
    console.log('Messages table ready')

    console.log('All Postgres tables initialized successfully')
    return true
  } catch (error) {
    console.error('Error initializing tables:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack)
    }
    throw error
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
  // Map lowercase postgres fields to camelCase
  return rows.map(app => ({
    ...app,
    fullName: app.fullname || app.fullName,
    grantAmount: app.grantamount || app.grantAmount,
    grantPurpose: app.grantpurpose || app.grantPurpose,
    paymentMethod: app.paymentmethod || app.paymentMethod,
    maritalStatus: app.maritalstatus || app.maritalStatus,
    monthlyIncome: app.monthlyincome || app.monthlyIncome,
    submittedAt: app.submittedat || app.submittedAt,
    updatedAt: app.updatedat || app.updatedAt,
    createdAt: app.createdat || app.createdAt
  }))
}

export async function getApplicationById(id: string) {
  await initializeTables()
  const { rows } = await sql`SELECT * FROM applications WHERE id = ${id}`
  const app = rows[0]
  if (app) {
    // Map lowercase postgres fields to camelCase
    return {
      ...app,
      fullName: app.fullname || app.fullName,
      grantAmount: app.grantamount || app.grantAmount,
      grantPurpose: app.grantpurpose || app.grantPurpose,
      paymentMethod: app.paymentmethod || app.paymentMethod,
      maritalStatus: app.maritalstatus || app.maritalStatus,
      monthlyIncome: app.monthlyincome || app.monthlyIncome,
      submittedAt: app.submittedat || app.submittedAt,
      updatedAt: app.updatedat || app.updatedAt,
      createdAt: app.createdat || app.createdAt
    }
  }
  return app
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
  try {
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
  } catch (error) {
    console.error('Error saving user:', error)
    throw error
  }
}

export async function getUserByEmail(email: string) {
  try {
    await initializeTables()
    const { rows } = await sql`SELECT * FROM users WHERE email = ${email}`
    const user = rows[0]
    if (user) {
      // Map lowercase postgres fields to camelCase
      if (user.fullname && !user.fullName) {
        user.fullName = user.fullname
      }
      if (user.createdat && !user.createdAt) {
        user.createdAt = user.createdat
      }
      if (user.applications) {
        user.applications = JSON.parse(user.applications)
      }
    }
    return user
  } catch (error) {
    console.error('Error getting user by email:', error)
    throw error
  }
}

export async function getUserById(id: string) {
  await initializeTables()
  const { rows } = await sql`SELECT * FROM users WHERE id = ${id}`
  const user = rows[0]
  if (user) {
    // Map lowercase postgres fields to camelCase
    if (user.fullname && !user.fullName) {
      user.fullName = user.fullname
    }
    if (user.createdat && !user.createdAt) {
      user.createdAt = user.createdat
    }
    if (user.applications) {
      user.applications = JSON.parse(user.applications)
    }
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
  try {
    await initializeTables()
    
    console.log('saveConversation: Saving conversation:', conversation.id)
    
    const lastMessage = conversation.lastMessage || null
    const lastMessageAt = conversation.lastMessageAt || null
    const unreadCount = conversation.unreadCount || 0
    const createdAt = conversation.createdAt || new Date().toISOString()
    const applicantName = conversation.applicantName || conversation.applicantname || 'Unknown'
    const applicantEmail = conversation.applicantEmail || conversation.applicantemail || ''
    
    await sql`
      INSERT INTO conversations (
        id, applicantName, applicantEmail, lastMessage, lastMessageAt, unreadCount, createdAt
      ) VALUES (
        ${conversation.id},
        ${applicantName},
        ${applicantEmail},
        ${lastMessage},
        ${lastMessageAt},
        ${unreadCount},
        ${createdAt}
      )
      ON CONFLICT (id) DO UPDATE SET
        lastMessage = EXCLUDED.lastMessage,
        lastMessageAt = EXCLUDED.lastMessageAt,
        unreadCount = EXCLUDED.unreadCount
    `
    console.log('saveConversation: Conversation saved successfully')

    return conversation
  } catch (error) {
    console.error('Error saving conversation:', error)
    throw error
  }
}

export async function getAllConversations() {
  try {
    await initializeTables()
    const { rows } = await sql`SELECT * FROM conversations ORDER BY lastMessageAt DESC NULLS LAST`
    // Map lowercase postgres fields to camelCase
    return rows.map(conv => ({
      ...conv,
      applicantName: conv.applicantname || conv.applicantName,
      applicantEmail: conv.applicantemail || conv.applicantEmail,
      lastMessageAt: conv.lastmessageat || conv.lastMessageAt,
      lastMessage: conv.lastmessage || conv.lastMessage,
      unreadCount: conv.unreadcount || conv.unreadCount || 0,
      createdAt: conv.createdat || conv.createdAt
    }))
  } catch (error) {
    console.error('Error getting all conversations:', error)
    throw error
  }
}

export async function getConversationById(id: string) {
  try {
    await initializeTables()
    const { rows } = await sql`SELECT * FROM conversations WHERE id = ${id}`
    const conv = rows[0]
    if (conv) {
      // Map lowercase postgres fields to camelCase
      return {
        ...conv,
        applicantName: conv.applicantname || conv.applicantName,
        applicantEmail: conv.applicantemail || conv.applicantEmail,
        lastMessageAt: conv.lastmessageat || conv.lastMessageAt,
        lastMessage: conv.lastmessage || conv.lastMessage,
        unreadCount: conv.unreadcount || conv.unreadCount || 0,
        createdAt: conv.createdat || conv.createdAt
      }
    }
    return conv
  } catch (error) {
    console.error('Error getting conversation by ID:', error)
    throw error
  }
}

// Message functions
export async function saveMessage(message: any) {
  try {
    await initializeTables()
    
    console.log('saveMessage: Saving message:', message.id)
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
    console.log('saveMessage: Message saved successfully')

    return message
  } catch (error) {
    console.error('Error saving message:', error)
    throw error
  }
}

export async function getMessagesByConversationId(conversationId: string) {
  try {
    await initializeTables()
    const { rows } = await sql`SELECT * FROM messages WHERE conversationId = ${conversationId} ORDER BY timestamp ASC`
    // Map lowercase postgres fields to camelCase
    return rows.map(msg => ({
      id: msg.id,
      conversationId: msg.conversationid || msg.conversationId,
      sender: msg.sender,
      message: msg.message,
      isAdmin: msg.isadmin !== undefined ? Boolean(msg.isadmin) : Boolean(msg.isAdmin),
      delivered: msg.delivered !== undefined ? Boolean(msg.delivered) : true,
      read: msg.read !== undefined ? Boolean(msg.read) : false,
      timestamp: msg.timestamp
    }))
  } catch (error) {
    console.error('Error getting messages by conversation ID:', error)
    throw error
  }
}

export async function markMessagesAsRead(conversationId: string, isAdmin: boolean) {
  try {
    await initializeTables()
    await sql`
      UPDATE messages 
      SET read = 1 
      WHERE conversationId = ${conversationId} AND isAdmin = ${isAdmin ? 1 : 0}
    `
  } catch (error) {
    console.error('Error marking messages as read:', error)
    throw error
  }
}

// Password reset functions
export async function savePasswordResetToken(email: string, token: string, expiry: string) {
  try {
    await initializeTables()
    await sql`
      UPDATE users 
      SET resetToken = ${token}, resetTokenExpiry = ${expiry}
      WHERE email = ${email}
    `
    return true
  } catch (error) {
    console.error('Error saving password reset token:', error)
    throw error
  }
}

export async function verifyPasswordResetToken(token: string) {
  try {
    await initializeTables()
    const { rows } = await sql`
      SELECT * FROM users 
      WHERE resetToken = ${token} 
      AND resetTokenExpiry > ${new Date().toISOString()}
    `
    const user = rows[0]
    if (user) {
      // Map lowercase postgres fields to camelCase
      if (user.fullname && !user.fullName) {
        user.fullName = user.fullname
      }
      if (user.resettoken && !user.resetToken) {
        user.resetToken = user.resettoken
      }
      if (user.resettokenexpiry && !user.resetTokenExpiry) {
        user.resetTokenExpiry = user.resettokenexpiry
      }
    }
    return user
  } catch (error) {
    console.error('Error verifying password reset token:', error)
    throw error
  }
}

export async function updatePassword(email: string, newPassword: string) {
  try {
    await initializeTables()
    await sql`
      UPDATE users 
      SET password = ${newPassword}, resetToken = NULL, resetTokenExpiry = NULL
      WHERE email = ${email}
    `
    return true
  } catch (error) {
    console.error('Error updating password:', error)
    throw error
  }
}
