import { NextRequest, NextResponse } from 'next/server'
import { userStore } from '../../../../lib/userStore'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Authenticate user
    const user = await userStore.authenticateUser(email, password)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Return user without password and token
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: 'Signed in successfully',
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to sign in' },
      { status: 500 }
    )
  }
}