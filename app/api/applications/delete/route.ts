import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Application ID is required' },
        { status: 400 }
      )
    }
    
    console.log('Deleting application:', id)
    
    // Delete the application
    await sql`DELETE FROM applications WHERE id = ${id}`
    
    console.log('Application deleted successfully')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Application deleted successfully' 
    })
  } catch (error) {
    console.error('Delete application error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete application', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
