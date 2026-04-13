import { NextResponse } from 'next/server'
import { getAllApplications, getApplicationStats, initializeTables } from '../../../lib/postgres-database'

export async function GET() {
  try {
    console.log('🔍 Debug: Testing applications endpoint...')
    
    // Initialize tables
    console.log('🔄 Initializing tables...')
    await initializeTables()
    console.log('✅ Tables initialized')
    
    // Get stats
    console.log('📊 Getting stats...')
    const stats = await getApplicationStats()
    console.log('✅ Stats retrieved:', stats)
    
    // Get all applications
    console.log('📋 Getting all applications...')
    const applications = await getAllApplications()
    console.log('✅ Applications retrieved:', applications.length)
    console.log('📋 Applications:', applications)
    
    return NextResponse.json({
      success: true,
      message: 'Debug test successful',
      stats,
      applications,
      count: applications.length
    })
  } catch (error) {
    console.error('❌ Debug test failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Debug test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : ''
    }, { status: 500 })
  }
}
