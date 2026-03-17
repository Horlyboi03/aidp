import { NextRequest, NextResponse } from 'next/server'

export interface Notification {
  id: string
  applicationId: string
  applicantEmail: string
  type: 'approved' | 'rejected' | 'submitted'
  title: string
  message: string
  timestamp: string
  read: boolean
}

// In-memory storage for demo purposes
let notifications: Notification[] = []

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const applicationId = searchParams.get('applicationId')
  
  if (applicationId) {
    // Get notifications for specific application
    const appNotifications = notifications.filter(n => n.applicationId === applicationId)
    return NextResponse.json({ notifications: appNotifications })
  }
  
  // Get all notifications (for admin)
  return NextResponse.json({ notifications })
}

export async function POST(request: NextRequest) {
  try {
    const { applicationId, applicantEmail, type, customMessage } = await request.json()
    
    let title = ''
    let message = ''
    
    switch (type) {
      case 'submitted':
        title = '🎉 Application Submitted Successfully!'
        message = 'Thank you for submitting your AIDP grant application. We have received your application and will review it within 24 hours. You will receive email notifications about any status updates.'
        break
      case 'approved':
        title = '🎉 Congratulations! Your Grant Application Has Been Approved!'
        message = customMessage || `Excellent news! Your AIDP grant application has been approved. 

🎯 Next Steps:
• You will receive an email with detailed payment instructions for the processing fee
• Once the processing fee is paid, your grant will be released within 48 hours
• You can contact our support team if you have any questions

💰 Remember: This grant money is yours and never needs to be repaid. It is not taxable and bears no interest.

Thank you for choosing AIDP for your financial assistance needs!`
        break
      case 'rejected':
        title = '📋 Application Status Update'
        message = customMessage || `Thank you for your interest in the AIDP grant program. 

After careful review, we regret to inform you that your application was not approved at this time. This decision was based on our current funding criteria and availability.

🔄 You may reapply after 6 months with updated information or documentation.

💡 For feedback on your application or assistance with future applications, please contact our support team.

We appreciate your interest in AIDP and encourage you to apply again in the future.`
        break
    }
    
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      applicationId,
      applicantEmail,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false
    }
    
    notifications.push(notification)
    
    return NextResponse.json({ 
      success: true, 
      notification,
      message: 'Notification created successfully' 
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { notificationId, read } = await request.json()
    
    const notification = notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = read
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update notification' },
      { status: 500 }
    )
  }
}