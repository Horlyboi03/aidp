// Email service for sending notifications
import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    console.log('📧 Sending email...')
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('Email config:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      hasPassword: !!process.env.EMAIL_PASS,
      from: process.env.EMAIL_FROM
    })

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    console.log('Transporter created, sending email...')

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'AIDP Grant Program <noreply@aidp.com>',
      to,
      subject,
      html,
    })

    console.log('✅ Email sent successfully!')
    console.log('Message ID:', info.messageId)
    console.log('Response:', info.response)
    return true
  } catch (error) {
    console.error('❌ Failed to send email:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return false
  }
}

export function getApprovalEmailTemplate(applicantName: string, grantAmount: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #FF6B6B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Congratulations!</h1>
          <p>Your AIDP Grant Application Has Been Approved</p>
        </div>
        <div class="content">
          <p>Dear ${applicantName},</p>
          
          <p>We are pleased to inform you that your application for the <strong>AIDP Grant Program</strong> has been <strong>approved</strong>!</p>
          
          <p><strong>Grant Amount Approved:</strong> $${grantAmount}</p>
          
          <h3>Next Steps:</h3>
          <ol>
            <li>A one-time processing fee is required before your grant is released</li>
            <li>You will receive payment instructions within 24 hours</li>
            <li>Once the processing fee is paid, your grant will be released within 48 hours</li>
            <li>You will receive your grant via your selected payment method (cash or cheque)</li>
          </ol>
          
          <p><strong>Important Information:</strong></p>
          <ul>
            <li>Grant money is not taxable and bears no interest</li>
            <li>No repayment is required - this is your right as a taxpayer</li>
            <li>Keep this email for your records</li>
          </ul>
          
          <p>If you have any questions, please contact our Program Director:</p>
          <p><strong>Mary George</strong><br>
          Email: maryygeorge193@gmail.com</p>
          
          <p>Thank you for applying to the AIDP Grant Program!</p>
          
          <p>Best regards,<br>
          <strong>AIDP Grant Program Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email from the AIDP Grant Program. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} AIDP Grant Program. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getRejectionEmailTemplate(applicantName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AIDP Grant Application Update</h1>
        </div>
        <div class="content">
          <p>Dear ${applicantName},</p>
          
          <p>Thank you for your interest in the <strong>AIDP Grant Program</strong>.</p>
          
          <p>After careful review of your application, we regret to inform you that we are unable to approve your grant application at this time.</p>
          
          <h3>What This Means:</h3>
          <ul>
            <li>Your application did not meet all the current eligibility requirements</li>
            <li>You may reapply after 6 months with updated information</li>
            <li>We encourage you to review the eligibility criteria before reapplying</li>
          </ul>
          
          <h3>Next Steps:</h3>
          <p>If you believe this decision was made in error or if you have additional information to support your application, please contact our Program Director:</p>
          
          <p><strong>Mary George</strong><br>
          Email: maryygeorge193@gmail.com</p>
          
          <p>We appreciate your understanding and wish you the best in your future endeavors.</p>
          
          <p>Best regards,<br>
          <strong>AIDP Grant Program Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email from the AIDP Grant Program. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} AIDP Grant Program. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getWelcomeEmailTemplate(applicantName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #FF6B6B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>👋 Welcome to AIDP!</h1>
          <p>Your Account Has Been Created Successfully</p>
        </div>
        <div class="content">
          <p>Dear ${applicantName},</p>
          
          <p>Thank you for creating an account with the <strong>AIDP Grant Program</strong>!</p>
          
          <p>Your account has been successfully created and you can now:</p>
          <ul>
            <li>Apply for grants ranging from $100,000 to $450,000</li>
            <li>Track your application status in real-time</li>
            <li>Communicate directly with our Program Director, Mary George</li>
            <li>Receive instant notifications about your application</li>
          </ul>
          
          <h3>Next Steps:</h3>
          <ol>
            <li>Log in to your dashboard</li>
            <li>Complete your grant application</li>
            <li>Submit required documents</li>
            <li>Wait for review (typically less than 24 hours)</li>
          </ol>
          
          <p><strong>Important Information:</strong></p>
          <ul>
            <li>Grant amounts: $100K, $150K, $200K, $250K, $300K, $350K, $400K, $450K</li>
            <li>Review time: Less than 24 hours</li>
            <li>No repayment required - this is your right as a taxpayer</li>
            <li>Grant money is not taxable and bears no interest</li>
          </ul>
          
          <p>If you have any questions, please contact our Program Director:</p>
          <p><strong>Mary George</strong><br>
          Email: maryygeorge193@gmail.com</p>
          
          <p>We look forward to helping you achieve your goals!</p>
          
          <p>Best regards,<br>
          <strong>AIDP Grant Program Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email from the AIDP Grant Program. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} AIDP Grant Program. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getPasswordResetEmailTemplate(applicantName: string, resetToken: string, resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #FF6B6B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .token-box { background: #fff; border: 2px dashed #FF6B6B; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .warning { background: #FFF3CD; border-left: 4px solid #FFC107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
          <p>Reset Your AIDP Account Password</p>
        </div>
        <div class="content">
          <p>Dear ${applicantName},</p>
          
          <p>We received a request to reset the password for your <strong>AIDP Grant Program</strong> account.</p>
          
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p>Or use this reset code:</p>
          
          <div class="token-box">${resetToken}</div>
          
          <div class="warning">
            <strong>⚠️ Important Security Information:</strong>
            <ul style="margin: 10px 0;">
              <li>This reset link expires in 1 hour</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Never share this code with anyone</li>
              <li>AIDP staff will never ask for your password or reset code</li>
            </ul>
          </div>
          
          <h3>Need Help?</h3>
          <p>If you're having trouble resetting your password or didn't request this change, please contact our Program Director:</p>
          
          <p><strong>Mary George</strong><br>
          Email: maryygeorge193@gmail.com</p>
          
          <p>Best regards,<br>
          <strong>AIDP Grant Program Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email from the AIDP Grant Program. Please do not reply to this email.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p>&copy; ${new Date().getFullYear()} AIDP Grant Program. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}