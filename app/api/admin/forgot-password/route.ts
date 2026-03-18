import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number }>()

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Verify this is the admin email
    const ADMIN_EMAIL = 'maryygeorge193@gmail.com'
    
    if (email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { success: false, message: 'Email not found in our system' },
        { status: 404 }
      )
    }

    // Generate OTP
    const otp = generateOTP()
    
    // Store OTP with 10 minute expiration
    otpStore.set(email, {
      otp,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    })

    // Send OTP via email
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER || 'maryygeorge193@gmail.com',
          pass: process.env.EMAIL_PASS || 'your-app-password'
        }
      })

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'AIDP Admin <maryygeorge193@gmail.com>',
        to: email,
        subject: 'AIDP Admin - Password Reset OTP',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .otp-box { background: white; border: 2px dashed #FF6B6B; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
              .otp-code { font-size: 32px; font-weight: bold; color: #FF6B6B; letter-spacing: 5px; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Password Reset Request</h1>
              </div>
              <div class="content">
                <p>Hello Admin,</p>
                <p>We received a request to reset your AIDP Admin Dashboard password.</p>
                
                <div class="otp-box">
                  <p style="margin: 0; font-size: 14px; color: #666;">Your One-Time Password (OTP)</p>
                  <div class="otp-code">${otp}</div>
                  <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
                </div>

                <p><strong>To reset your password:</strong></p>
                <ol>
                  <li>Enter this OTP code on the password reset page</li>
                  <li>Create a new password (minimum 6 characters)</li>
                  <li>Confirm your new password</li>
                </ol>

                <div class="warning">
                  <strong>⚠️ Security Notice:</strong><br>
                  • This OTP will expire in 10 minutes<br>
                  • Do not share this code with anyone<br>
                  • If you didn't request this reset, please ignore this email
                </div>

                <p>If you have any questions, please contact support.</p>
                
                <p>Best regards,<br>
                <strong>AIDP Admin Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated message from AIDP Grant Program</p>
                <p>© ${new Date().getFullYear()} AIDP. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      })

      console.log('OTP sent successfully to:', email)
      console.log('OTP (for testing):', otp) // Remove in production

      return NextResponse.json({
        success: true,
        message: 'OTP sent to your email. Please check your inbox.'
      })
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      
      // Still return success but log the OTP for testing
      console.log('OTP (email failed, use this):', otp)
      
      return NextResponse.json({
        success: true,
        message: 'OTP generated. Check server logs for the code (email service not configured).',
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      })
    }
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process request' },
      { status: 500 }
    )
  }
}

// Verify OTP endpoint
export async function PUT(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json()

    const ADMIN_EMAIL = 'maryygeorge193@gmail.com'
    
    if (email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { success: false, message: 'Invalid email' },
        { status: 404 }
      )
    }

    // Check if OTP exists and is valid
    const storedOTP = otpStore.get(email)
    
    if (!storedOTP) {
      return NextResponse.json(
        { success: false, message: 'OTP not found. Please request a new one.' },
        { status: 400 }
      )
    }

    if (Date.now() > storedOTP.expires) {
      otpStore.delete(email)
      return NextResponse.json(
        { success: false, message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    if (storedOTP.otp !== otp) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP. Please try again.' },
        { status: 400 }
      )
    }

    // OTP is valid, update password
    const fs = require('fs')
    const path = require('path')

    // Update password in login route
    const loginFilePath = path.join(process.cwd(), 'app', 'api', 'admin', 'login', 'route.ts')
    let loginFileContent = fs.readFileSync(loginFilePath, 'utf8')

    // Find and replace the password line
    const passwordRegex = /const ADMIN_PASSWORD = '[^']*'/
    const newPasswordLine = `const ADMIN_PASSWORD = '${newPassword}'`
    
    if (passwordRegex.test(loginFileContent)) {
      loginFileContent = loginFileContent.replace(passwordRegex, newPasswordLine)
      fs.writeFileSync(loginFilePath, loginFileContent, 'utf8')

      // Also update change-password route
      const changePasswordFilePath = path.join(process.cwd(), 'app', 'api', 'admin', 'change-password', 'route.ts')
      let changePasswordContent = fs.readFileSync(changePasswordFilePath, 'utf8')
      
      if (passwordRegex.test(changePasswordContent)) {
        changePasswordContent = changePasswordContent.replace(passwordRegex, newPasswordLine)
        fs.writeFileSync(changePasswordFilePath, changePasswordContent, 'utf8')
      }

      // Clear the OTP
      otpStore.delete(email)

      return NextResponse.json({
        success: true,
        message: 'Password reset successfully. You can now login with your new password.'
      })
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to update password' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}
