import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { initializeTables } from '../../../lib/postgres-database'

export async function GET() {
  try {
    // Test database connection
    const result = await sql`SELECT NOW() as current_time`
    
    // Initialize tables
    await initializeTables()
    
    // Add reset token columns if they don't exist
    try {
      await sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS resetToken TEXT,
        ADD COLUMN IF NOT EXISTS resetTokenExpiry TEXT
      `
      console.log('✅ Reset token columns added/verified')
    } catch (alterError) {
      console.log('Note: Could not alter users table (columns may already exist):', alterError)
    }
    
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    
    // Check conversations table
    const conversations = await sql`SELECT COUNT(*) as count FROM conversations`
    
    // Check messages table
    const messages = await sql`SELECT COUNT(*) as count FROM messages`
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      time: result.rows[0].current_time,
      database: 'Connected to Vercel Postgres',
      tables: tables.rows.map(t => t.table_name),
      conversationsCount: parseInt(conversations.rows[0].count),
      messagesCount: parseInt(messages.rows[0].count),
      migrationRun: true
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
