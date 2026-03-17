import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '../../../../lib/dataStore'

export async function POST(request: NextRequest) {
  try {
    // Create a test application
    const testApplication = {
      id: `APP-TEST-${Date.now()}`,
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      country: 'Test Country',
      address: '123 Test Street',
      dateOfBirth: '1990-01-01',
      occupation: 'Tester',
      maritalStatus: 'single',
      grantAmount: '$250,000',
      grantPurpose: 'medical',
      paymentMethod: 'cash',
      description: 'Test application for debugging',
      status: 'pending' as const,
      submittedAt: new Date().toISOString(),
      privacyAgreed: true
    }
    
    dataStore.addApplication(testApplication)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test application created',
      application: testApplication,
      totalApplications: dataStore.getApplications().length
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to create test application', error: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const applications = dataStore.getApplications()
    const stats = dataStore.getStats()
    
    return NextResponse.json({
      applications,
      stats,
      count: applications.length
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to get applications', error: error.message },
      { status: 500 }
    )
  }
}