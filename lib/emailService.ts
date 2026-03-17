// Email service for sending notifications
// NOTE: Requires nodemailer to be installed: npm install nodemailer @types/nodemailer

// Uncomment the following lines after installing nodemailer:
// import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

// Email configuration
// You'll need to set these environment variables in .env.local:
// EMAIL_HOST=smtp.gmail.com
// EMAIL_PORT=587
// EMAIL_USER=your-email@gmail.com
// EMAIL_PASS=your-app-password
// EMAIL_FROM=AIDP Grant Program <noreply@aidp.com>

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    // Uncomment after installing nodemailer:
    /*
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'AIDP Grant Program <noreply@aidp.com>',
      to,
      subject,
      html,
    })
    */

    console.log('Email would be sent to:', to)
    console.log('Subject:', subject)
    console.log('HTML:', html)
    
    // For now, just log the email (remove this after implementing nodemailer)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
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
          Email: marygeorge193@gmail.com</p>
          
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
          Email: marygeorge193@gmail.com</p>
          
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