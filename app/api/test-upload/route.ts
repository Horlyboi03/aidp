import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test uploading a default image
    const defaultImageUrl = "/images/WhatsApp Image 2026-03-12 at 8.11.50 PM.jpeg"
    
    const uploadResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/agent/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl: defaultImageUrl }),
    })

    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json()
      
      // Now test getting the image
      const getResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/agent/image`)
      const getData = await getResponse.json()
      
      return NextResponse.json({
        success: true,
        uploadResult: uploadData,
        getResult: getData,
        message: 'Test completed successfully'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Upload failed',
        status: uploadResponse.status
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}