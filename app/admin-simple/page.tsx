'use client'

import { useState, useEffect } from 'react'

export default function SimpleAdminPage() {
  const [agentImage, setAgentImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadImage = async () => {
      try {
        console.log('Loading agent image...')
        const response = await fetch('/api/agent/image')
        console.log('Response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Response data:', data)
          setAgentImage(data.imageUrl)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadImage()
  }, [])

  const setDefaultImage = async () => {
    const defaultUrl = "/images/WhatsApp Image 2026-03-12 at 8.11.50 PM.jpeg"
    
    try {
      const response = await fetch('/api/agent/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: defaultUrl }),
      })

      if (response.ok) {
        setAgentImage(defaultUrl)
        alert('Image set successfully!')
      } else {
        alert('Failed to set image')
      }
    } catch (error) {
      alert('Error: ' + error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Simple Admin Test</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl mb-4">Current Agent Image:</h2>
          {loading ? (
            <p>Loading...</p>
          ) : agentImage ? (
            <div className="space-y-4">
              <img 
                src={agentImage} 
                alt="Agent" 
                className="w-32 h-32 rounded-full object-cover"
              />
              <p className="text-sm text-gray-400 break-all">{agentImage}</p>
            </div>
          ) : (
            <p>No image set</p>
          )}
        </div>

        <button
          onClick={setDefaultImage}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
        >
          Set Default Image
        </button>

        <div className="mt-8">
          <a href="/admin" className="text-blue-400 hover:underline">
            → Go to Full Admin Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}