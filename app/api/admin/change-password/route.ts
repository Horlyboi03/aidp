import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json()

    // Hardcoded current credentials
    const CURRENT_USERNAME = 'horlyboi'
    const CURRENT_PASSWORD = 'horlyboi03!'

    // Verify current password
    if (currentPassword !== CURRENT_PASSWORD) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Update the password in the login route file
    const loginFilePath = path.join(process.cwd(), 'app', 'api', 'admin', 'login', 'route.ts')
    let loginFileContent = fs.readFileSync(loginFilePath, 'utf8')

    // Replace the password in the file
    const oldPasswordLine = `    const ADMIN_PASSWORD = '${CURRENT_PASSWORD}'`
    const newPasswordLine = `    const ADMIN_PASSWORD = '${newPassword}'`
    
    if (loginFileContent.includes(oldPasswordLine)) {
      loginFileContent = loginFileContent.replace(oldPasswordLine, newPasswordLine)
      fs.writeFileSync(loginFilePath, loginFileContent, 'utf8')

      // Also update the change-password route file itself
      const changePasswordFilePath = path.join(process.cwd(), 'app', 'api', 'admin', 'change-password', 'route.ts')
      let changePasswordContent = fs.readFileSync(changePasswordFilePath, 'utf8')
      
      const oldCurrentPasswordLine = `    const CURRENT_PASSWORD = '${CURRENT_PASSWORD}'`
      const newCurrentPasswordLine = `    const CURRENT_PASSWORD = '${newPassword}'`
      
      if (changePasswordContent.includes(oldCurrentPasswordLine)) {
        changePasswordContent = changePasswordContent.replace(oldCurrentPasswordLine, newCurrentPasswordLine)
        fs.writeFileSync(changePasswordFilePath, changePasswordContent, 'utf8')
      }

      return NextResponse.json({
        success: true,
        message: 'Password changed successfully. Please use your new password for future logins.'
      })
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to update password. Please contact support.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to change password' },
      { status: 500 }
    )
  }
}
