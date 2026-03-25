import { NextRequest, NextResponse } from 'next/server'
import { getApplicationById, updateApplicationStatus } from '../../../../../lib/database'
import { sendEmail, getApprovalEmailTemplate, getRejectionEmailTemplate } from '../../../../../lib/emailService'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  
  const application = getApplicationById(id) as any
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
    
    const application = updateApplicationStatus(id, status) as any
    
    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      )
    }
    
    // Send notification if status is approved or rejected
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