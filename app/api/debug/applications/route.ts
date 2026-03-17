import { NextResponse } from 'next/server'
import { dataStore } from '../../../../lib/dataStore'

export async function GET() {
  try {
    const applications = dataStore.getApplications()
    const stats = dataStore.getStats()
    
    return NextResponse.json({
      success: true,
      count: applications.length,
      applications: applications,
      stats: stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}