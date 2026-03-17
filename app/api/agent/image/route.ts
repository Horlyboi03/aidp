import { NextRequest, NextResponse } from 'next/server'
import { agentImageStore } from '@/lib/agentImageStore'

export async function GET() {
  try {
    // Get the stored agent image
    const storedImage = agentImageStore.getAgentImage()
    console.log('GET /api/agent/image - Stored image:', storedImage ? 'Yes' : 'No')
    
    // If no image is set, return the default
    const defaultImage = "/images/mary-george.svg"
    
    return NextResponse.json({ 
      imageUrl: storedImage || defaultImage,
      success: true 
    })
  } catch (error) {
    console.error('GET /api/agent/image - Error:', error)
    // Fallback to default image on error
    return NextResponse.json({ 
      imageUrl: "/images/mary-george.svg",
      success: false,
      message: 'Error loading agent image'
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()
    console.log('POST /api/agent/image - Setting imageUrl:', imageUrl ? 'Yes' : 'No')
    
    // Store the image (can be null to remove it)
    agentImageStore.setAgentImage(imageUrl)
    
    console.log('POST /api/agent/image - Image stored successfully')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Agent image updated successfully',
      imageUrl: imageUrl
    })
  } catch (error) {
    console.error('POST /api/agent/image - Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update agent image' },
      { status: 500 }
    )
  }
}