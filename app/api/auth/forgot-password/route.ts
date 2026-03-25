import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, savePasswordResetToken } from '../../../../lib/postgres-database'
import { sendEmail, getPasswordResetEmailTemplate } from '../../../../lib/emailService'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await getUserByEmail(email)

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.'
      })
    }

    // Generate a secure 6-digit reset token
    const resetToken = crypto.randomInt(100000, 999999).toString()
    
    // Token expires in 1 hour
    const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    
    // Save token to database
    await savePasswordResetToken(email, resetToken, expiry)
    
    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://aidpprogramapply.vercel.app'}/reset-password?token=${resetToken}`
    
    // Send email
    const emailSent = await sendEmail({
      to: email,
      subject: '🔐 Reset Your AIDP Account Password',
      html: getPasswordResetEmailTemplate(user.fullName || 'User', resetToken, resetUrl)
    })

    if (!emailSent) {
      console.error('Failed to send password reset email to:', email)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Password reset instructions have been sent to your email. Please check your inbox.'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process request' },
      { status: 500 }
    )
  }
}
