import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { initializeTables } from '../../../lib/postgres-database'

export async function GET() {
  try {
    // Test database connection
    const result = await sql`SELECT NOW() as current_time`
    
    // Initialize tables
    await initializeTables()
    
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
      messagesCount: parseInt(messages.rows[0].count)
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
