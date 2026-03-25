import { NextRequest, NextResponse } from 'next/server'
import { saveUser, getUserByEmail } from '../../../../lib/postgres-database'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, phone, country, password } = await request.json()

    // Validate required fields
    if (!fullName || !email || !phone || !country || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists with this email' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = {
      id: `USER-${Date.now()}`,
      fullName,
      email,
      phone,
      country,
      password: hashedPassword,
      applications: '[]',
      createdAt: new Date().toISOString()
    }

    await saveUser(user)

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Signup error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, message: 'Failed to create account', error: errorMessage },
      { status: 500 }
    )
  }
}