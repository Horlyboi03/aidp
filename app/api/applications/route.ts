import { NextRequest, NextResponse } from 'next/server'
import { saveApplication, getAllApplications, getApplicationStats } from '../../../lib/postgres-database'
import { dataStore } from '../../../lib/dataStore'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('Received application data:', data)
    
    const application = {
      id: `APP-${Date.now()}`,
      ...data,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    }
    
    console.log('Creating application:', application)
    
    // Save to Postgres
    try {
      await saveApplication(application)
      console.log('Application saved to Postgres database')
    } catch (postgresError) {
      console.error('Failed to save to Postgres:', postgresError)
      // Continue anyway - will save to local data
    }
    
    // Also save to local data store as fallback
    try {
      dataStore.addApplication(application)
      console.log('Application also saved to local data store')
    } catch (localError) {
      console.error('Failed to save to local data store:', localError)
    }
    
    // Create submission notification
    try {
      const notificationResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: application.id,
          applicantEmail: application.email,
          type: 'submitted'
        })
      })
      console.log('Notification response:', notificationResponse.status)
    } catch (error) {
      console.error('Failed to create submission notification:', error)
    }
    
    console.log('Returning success response')
    return NextResponse.json({ 
      success: true, 
      id: application.id,
      message: 'Application submitted successfully' 
    })
  } catch (error) {
    console.error('Application submission error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to submit application', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    let applications = []
    let stats = {}
    
    // Try to get from Postgres first
    try {
      applications = await getAllApplications()
      stats = await getApplicationStats()
      console.log('GET applications from Postgres - count:', applications.length)
    } catch (postgresError) {
      console.error('Failed to get applications from Postgres:', postgresError)
      // Fall back to local data
      console.log('Falling back to local data store')
      applications = dataStore.getApplications()
      stats = dataStore.getStats()
      console.log('GET applications from local data - count:', applications.length)
    }
    
    console.log('Applications:', applications)
    
    return NextResponse.json({ 
      applications,
      stats 
    })
  } catch (error) {
    console.error('GET applications error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}