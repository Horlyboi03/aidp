import { NextRequest, NextResponse } from 'next/server'
import { dataStore, Application } from '../../../lib/dataStore'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('Received application data:', data)
    
    const application: Application = {
      id: `APP-${Date.now()}`,
      ...data,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    }
    
    console.log('Creating application:', application)
    dataStore.addApplication(application)
    console.log('Application added to dataStore')
    
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
    const applications = dataStore.getApplications()
    const stats = dataStore.getStats()
    
    console.log('GET applications - count:', applications.length)
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