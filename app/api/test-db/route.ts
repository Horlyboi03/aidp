import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET() {
  try {
    // Test database connection
    const result = await sql`SELECT NOW() as current_time`
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      time: result.rows[0].current_time,
      database: 'Connected to Vercel Postgres'
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
