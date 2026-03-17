import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '../../../../../lib/dataStore'
import { sendEmail, getApprovalEmailTemplate, getRejectionEmailTemplate } from '../../../../../lib/emailService'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  
  const application = dataStore.getApplicationById(id)
  const status = application?.status || 'pending'
  
  return NextResponse.json({ status })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { status } = await request.json()
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      )
    }
    
    const updated = dataStore.updateApplicationStatus(id, status)
    
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      )
    }
    
    // Get the application to send notification
    const application = dataStore.getApplicationById(id)
    if (application && (status === 'approved' || status === 'rejected')) {
      try {
        // Send in-app notification
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applicationId: id,
            applicantEmail: application.email,
            type: status
          })
        })

        // Send email notification
        const emailSubject = status === 'approved' 
          ? '🎉 Your AIDP Grant Application Has Been Approved!'
          : 'AIDP Grant Application Update'
        
        const emailHtml = status === 'approved'
          ? getApprovalEmailTemplate(application.fullName, application.grantAmount)
          : getRejectionEmailTemplate(application.fullName)
        
        const emailSent = await sendEmail({
          to: application.email,
          subject: emailSubject,
          html: emailHtml
        })

        if (emailSent) {
          console.log(`Email notification sent to ${application.email} for ${status} status`)
        } else {
          console.error(`Failed to send email to ${application.email}`)
        }
      } catch (error) {
        console.error('Failed to create status notification:', error)
      }
    }
    
    // Email notification sent successfully
    // In production, you would also:
    // 1. Log the status change to audit trail
    // 2. Send SMS notification (optional)
    // 3. Update external systems if needed
    
    return NextResponse.json({ 
      success: true, 
      message: 'Status updated successfully' 
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update status' },
      { status: 500 }
    )
  }
}