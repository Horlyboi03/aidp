import { NextRequest, NextResponse } from 'next/server'
import { verifyPasswordResetToken, updatePassword } from '../../../../lib/postgres-database'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Token and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Verify token
    const user = await verifyPasswordResetToken(token)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await updatePassword(user.email, hashedPassword)

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new password.'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
