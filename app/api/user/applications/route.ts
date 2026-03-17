import { NextRequest, NextResponse } from 'next/server'
import { userStore } from '../../../../lib/userStore'
import { dataStore } from '../../../../lib/dataStore'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

function getUserFromToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, email: string }
    return userStore.getUserById(decoded.userId)
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's applications
    const userApplicationIds = userStore.getUserApplications(user.id)
    const applications = userApplicationIds
      .map(id => dataStore.getApplicationById(id))
      .filter(app => app !== undefined)

    return NextResponse.json({
      success: true,
      applications,
      count: applications.length
    })
  } catch (error) {
    console.error('Get user applications error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get applications' },
      { status: 500 }
    )
  }
}