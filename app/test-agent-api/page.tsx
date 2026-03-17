'use client'

import { useState, useEffect } from 'react'

export default function TestAgentAPI() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('Testing agent image API...')
        const response = await fetch('/api/agent/image')
        console.log('Response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Response data:', data)
          setImageUrl(data.imageUrl)
        } else {
          setError(`API returned status: ${response.status}`)
        }
      } catch (err) {
        console.error('API test error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    testAPI()
  }, [])

  const testUpload = async () => {
    try {
      const testImageUrl = "/images/mary-george.svg"
      
      const response = await fetch('/api/agent/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: testImageUrl }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Upload response:', data)
        setImageUrl(data.imageUrl)
        alert('Test image uploaded successfully!')
      } else {
        alert('Upload failed')
      }
    } catch (err) {
      console.error('Upload test error:', err)
      alert('Upload error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Agent Image API Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">API Status:</h2>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-400">Error: {error}</p>
          ) : (
            <p className="text-green-400">API is working!</p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Current Image URL:</h2>
          <p className="text-gray-300 break-all">
            {imageUrl || 'No image set'}
          </p>
        </div>

        {imageUrl && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Image Preview:</h2>
            <img 
              src={imageUrl} 
              alt="Agent" 
              className="w-32 h-32 rounded-full object-cover"
              onError={() => console.log('Image failed to load')}
            />
          </div>
        )}

        <button
          onClick={testUpload}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
        >
          Test Upload Default Image
        </button>

        <div className="mt-8">
          <a href="/admin" className="text-blue-400 hover:underline">
            ← Back to Admin Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}