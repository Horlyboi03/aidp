import { NextRequest, NextResponse } from 'next/server'
import { saveApplication, getAllApplications, getApplicationStats } from '../../../lib/postgres-database'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('📝 Received application data:', data)
    
    const application = {
      id: `APP-${Date.now()}`,
      ...data,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    }
    
    console.log('➕ Creating application:', application.id)
    
    // Save to Postgres (only source of truth)
    await saveApplication(application)
    console.log('✅ Application saved to Postgres database')
    
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
      console.log('📬 Notification response:', notificationResponse.status)
    } catch (error) {
      console.error('❌ Failed to create submission notification:', error)
    }
    
    console.log('✅ Returning success response')
    return NextResponse.json({ 
      success: true, 
      id: application.id,
      message: 'Application submitted successfully' 
    })
  } catch (error) {
    console.error('❌ Application submission error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to submit application', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    console.log('📋 Fetching applications from Postgres...')
    
    // Get from Postgres (only source of truth)
    const applications = await getAllApplications()
    const stats = await getApplicationStats()
    
    console.log('✅ Applications retrieved from Postgres - count:', applications.length)
    console.log('📊 Stats:', stats)
    
    return NextResponse.json({ 
      applications,
      stats,
      source: 'postgres'
    })
  } catch (error) {
    console.error('❌ Failed to get applications from Postgres:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { success: false, message: 'Failed to fetch applications', error: errorMessage, applications: [], stats: { total: 0, pending: 0, approved: 0, rejected: 0 } },
      { status: 500 }
    )
  }
}