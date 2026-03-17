// Database connection using Neon (Vercel Postgres)
import { neon } from '@neondatabase/serverless'

// Get database URL from environment
const DATABASE_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.warn('⚠️  No database URL found. Using in-memory storage (data will not persist)')
}

// Create database connection
export const sql = DATABASE_URL ? neon(DATABASE_URL) : null

// Helper function to check if database is available
export function isDatabaseAvailable(): boolean {
  return sql !== null
}

// Helper to execute queries safely
export async function query(sqlQuery: string, params: any[] = []) {
  if (!sql) {
    throw new Error('Database not configured. Please set POSTGRES_URL environment variable.')
  }
  
  try {
    // Neon requires template literals, so we'll use a different approach
    // For now, return the sql function for direct use
    return sql
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Test database connection
export async function testConnection() {
  if (!sql) {
    return { connected: false, message: 'No database URL configured' }
  }

  try {
    await sql`SELECT 1`
    return { connected: true, message: 'Database connected successfully' }
  } catch (error) {
    return { 
      connected: false, 
      message: error instanceof Error ? error.message : 'Connection failed' 
    }
  }
}
