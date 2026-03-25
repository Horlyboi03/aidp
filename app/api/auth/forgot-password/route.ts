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
      console.log('Password reset requested for non-existent email:', email)
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.'
      })
    }

    console.log('Password reset requested for user:', user.fullName, email)

    // Generate a secure 6-digit reset token
    const resetToken = crypto.randomInt(100000, 999999).toString()
    
    // Token expires in 1 hour
    const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    
    console.log('Generated reset token:', resetToken, 'expires:', expiry)
    
    // Save token to database
    await savePasswordResetToken(email, resetToken, expiry)
    console.log('Token saved to database')
    
    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://aidpprogramapply.vercel.app'}/reset-password?token=${resetToken}`
    
    console.log('Attempting to send email to:', email)
    console.log('Email config check:', {
      hasHost: !!process.env.EMAIL_HOST,
      hasPort: !!process.env.EMAIL_PORT,
      hasUser: !!process.env.EMAIL_USER,
      hasPass: !!process.env.EMAIL_PASS,
      hasFrom: !!process.env.EMAIL_FROM
    })
    
    // Send email
    const emailSent = await sendEmail({
      to: email,
      subject: '🔐 Reset Your AIDP Account Password',
      html: getPasswordResetEmailTemplate(user.fullName || 'User', resetToken, resetUrl)
    })

    if (!emailSent) {
      console.error('❌ Failed to send password reset email to:', email)
      return NextResponse.json({
        success: false,
        message: 'Failed to send reset email. Please contact maryygeorge193@gmail.com for assistance.'
      }, { status: 500 })
    }
    
    console.log('✅ Password reset email sent successfully to:', email)
    
    return NextResponse.json({
      success: true,
      message: 'Password reset instructions have been sent to your email. Please check your inbox and spam folder.'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process request' },
      { status: 500 }
    )
  }
}
