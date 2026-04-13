import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '../../../../lib/postgres-database'
import { userDataStore } from '../../../../lib/userDataStore'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

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

    // Try to get user from Postgres first
    let user = null
    try {
      user = await getUserByEmail(email) as any
      console.log('✅ User found in Postgres:', !!user)
    } catch (postgresError) {
      console.error('❌ Failed to get user from Postgres:', postgresError)
    }

    // Try persistent store as fallback
    if (!user) {
      user = userDataStore.getUserByEmail(email)
      console.log('✅ User found in persistent store:', !!user)
    }

    if (!user) {
      console.log('❌ User not found for email:', email)
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    console.log('Verifying password for user:', email)
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      console.log('Invalid password for user:', email)
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

    console.log('User signed in successfully:', email)
    return NextResponse.json({
      success: true,
      message: 'Signed in successfully',
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Signin error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, message: 'Failed to sign in', error: errorMessage },
      { status: 500 }
    )
  }
}