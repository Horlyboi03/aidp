import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET(request: NextRequest) {
  try {
    console.log('Starting migration to add reset token columns...')
    
    // Add resetToken and resetTokenExpiry columns to users table if they don't exist
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS resetToken TEXT,
      ADD COLUMN IF NOT EXISTS resetTokenExpiry TEXT
    `
    
    console.log('✅ Migration completed successfully!')
    
    return NextResponse.json({
      success: true,
      message: 'Reset token columns added successfully'
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Migration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
