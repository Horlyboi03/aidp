import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Hardcoded admin credentials
    const ADMIN_USERNAME = 'horlyboi'
    const ADMIN_PASSWORD = 'horlyboi03!'
    const JWT_SECRET = 'aidp-horlyboi-secret-key-2024-secure'

    // Verify credentials
    if (username !== ADMIN_USERNAME) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if password is hashed or plain text
    let isValidPassword = false
    if (ADMIN_PASSWORD.startsWith('$2a$') || ADMIN_PASSWORD.startsWith('$2b$')) {
      // Password is hashed
      isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD)
    } else {
      // Password is plain text (for backward compatibility)
      isValidPassword = password === ADMIN_PASSWORD
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      success: true,
      token,
      message: 'Login successful'
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    )
  }
}
