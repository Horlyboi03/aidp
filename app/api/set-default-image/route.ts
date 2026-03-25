import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const defaultImageUrl = "/images/WhatsApp Image 2026-03-12 at 8.11.50 PM.jpeg"
    
    // Set the default image
    const response = await fetch(`http://localhost:3000/api/agent/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl: defaultImageUrl }),
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        success: true,
        message: 'Default image set successfully',
        imageUrl: defaultImageUrl,
        apiResponse: data
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to set default image',
        status: response.status
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error setting default image',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}