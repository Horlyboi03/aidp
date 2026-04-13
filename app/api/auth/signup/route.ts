import { NextRequest, NextResponse } from 'next/server'
import { saveUser, getUserByEmail } from '../../../../lib/postgres-database'
import { sendEmail, getWelcomeEmailTemplate } from '../../../../lib/emailService'
import { userDataStore } from '../../../../lib/userDataStore'
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
    let existingUser = null
    try {
      existingUser = await getUserByEmail(email)
    } catch (postgresError) {
      console.error('Failed to check user in Postgres:', postgresError)
    }

    // Also check in persistent store
    if (!existingUser) {
      existingUser = userDataStore.getUserByEmail(email)
    }

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

    // Try to save to Postgres
    let savedToPostgres = false
    try {
      await saveUser(user)
      savedToPostgres = true
      console.log('✅ User saved to Postgres successfully')
    } catch (postgresError) {
      console.error('❌ Failed to save user to Postgres:', postgresError)
      // Continue - will save to persistent store
    }

    // Also save to persistent store as fallback
    try {
      userDataStore.addUser(user)
      console.log('✅ User also saved to persistent store')
    } catch (localError) {
      console.error('❌ Failed to save user to persistent store:', localError)
    }

    // Ensure at least one storage succeeded
    if (!savedToPostgres && userDataStore.getUserByEmail(email) === undefined) {
      return NextResponse.json(
        { success: false, message: 'Failed to save user to any storage' },
        { status: 500 }
      )
    }

    // Send welcome email
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to AIDP Grant Program! 🎉',
        html: getWelcomeEmailTemplate(fullName)
      })
      console.log('Welcome email sent to:', email)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the signup if email fails
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: userWithoutPassword,
      savedToPostgres
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