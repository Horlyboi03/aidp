import { NextRequest, NextResponse } from 'next/server'
import { getUserById, addApplicationToUser } from '../../../../lib/postgres-database'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

async function getUserFromToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, email: string }
    return await getUserById(decoded.userId)
  } catch (error) {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { applicationId } = await request.json()

    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: 'Application ID is required' },
        { status: 400 }
      )
    }

    // Link application to user
    const success = await addApplicationToUser(user.id, applicationId)

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Application linked to user successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to link application' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Link application error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to link application' },
      { status: 500 }
    )
  }
}