'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

export default function AgentImageUpload() {
  const [agentImage, setAgentImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // Load existing agent image on component mount
  useEffect(() => {
    const loadAgentImage = async () => {
      try {
        console.log('AgentImageUpload: Loading existing image...')
        
        // First try to load from localStorage
        const savedImage = localStorage.getItem('agentImage')
        if (savedImage) {
          console.log('AgentImageUpload: Found saved image in localStorage')
          setAgentImage(savedImage)
          
          // Also update the API
          await fetch('/api/agent/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: savedImage }),
          })
          return
        }
        
        // If not in localStorage, try API
        const response = await fetch('/api/agent/image')
        console.log('AgentImageUpload: API response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('AgentImageUpload: API data:', data)
          
          if (data.imageUrl) {
            setAgentImage(data.imageUrl)
            // Save to localStorage for persistence
            localStorage.setItem('agentImage', data.imageUrl)
            console.log('AgentImageUpload: Image loaded and saved to localStorage:', data.imageUrl)
          } else {
            console.log('AgentImageUpload: No image URL in response')
          }
        } else {
          console.log('AgentImageUpload: API response not ok')
        }
      } catch (error) {
        console.error('AgentImageUpload: Failed to load agent image:', error)
      }
    }

    loadAgentImage()
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        
        // Check file size (limit to 2MB for base64 storage)
        const maxSize = 2 * 1024 * 1024 // 2MB in bytes
        if (file.size > maxSize) {
          toast.error('Image too large. Please use an image smaller than 2MB.')
          return
        }
        
        setUploading(true)
        
        try {
          // Convert the file to base64 data URL
          const reader = new FileReader()
          reader.onload = async (e) => {
            const base64Image = e.target?.result as string
            setAgentImage(base64Image)
            
            // Save the base64 image to the API
            console.log('AgentImageUpload: Saving image to API...')
            const response = await fetch('/api/agent/image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ imageUrl: base64Image }),
            })

            console.log('AgentImageUpload: Save response status:', response.status)

            if (response.ok) {
              const data = await response.json()
              console.log('AgentImageUpload: Save response data:', data)
              
              // Save to localStorage for persistence
              localStorage.setItem('agentImage', base64Image)
              
              toast.success('Agent image updated successfully!')
              // Trigger a custom event to notify other components
              console.log('AgentImageUpload: Dispatching agentImageUpdated event')
              window.dispatchEvent(new CustomEvent('agentImageUpdated', { 
                detail: { imageUrl: base64Image } 
              }))
            } else {
              throw new Error('Failed to save image')
            }
          }
          
          reader.onerror = () => {
            toast.error('Failed to read image file')
            setUploading(false)
          }
          
          reader.readAsDataURL(file)
          
        } catch (error) {
          toast.error('Failed to upload image')
          console.error('Upload error:', error)
          setUploading(false)
        }
      }
    }
  })

  const removeImage = async () => {
    try {
      const response = await fetch('/api/agent/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: null }),
      })

      if (response.ok) {
        setAgentImage(null)
        localStorage.removeItem('agentImage')
        toast.success('Agent image removed')
        // Trigger event to notify other components
        window.dispatchEvent(new CustomEvent('agentImageUpdated', { 
          detail: { imageUrl: null } 
        }))
      }
    } catch (error) {
      toast.error('Failed to remove image')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-2xl p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4">👩‍💼 Agent Profile Image</h3>
      
      <div className="flex items-center space-x-6">
        {/* Current Image Preview */}
        <div className="relative w-24 h-24">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-coral-400 to-pink-500 p-1">
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-800">
              {agentImage ? (
                <img
                  src={agentImage}
                  alt="Agent"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  👩‍💼
                </div>
              )}
            </div>
          </div>
          {agentImage && (
            <motion.button
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ×
            </motion.button>
          )}
        </div>

        {/* Upload Area */}
        <div className="flex-1">
          <motion.div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-300 ${
              isDragActive ? 'border-coral-400 bg-coral-400/10' : 'border-gray-500 hover:border-coral-400'
            }`}
            whileHover={{ scale: 1.01 }}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex items-center justify-center space-x-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-coral-400 border-t-transparent rounded-full"
                />
                <span className="text-coral-400">Uploading...</span>
              </div>
            ) : isDragActive ? (
              <p className="text-coral-400 font-semibold">Drop the image here...</p>
            ) : (
              <div>
                <p className="text-white font-semibold mb-1">
                  Click or drag to upload agent photo
                </p>
                <p className="text-gray-400 text-sm mb-3">
                  JPG, PNG (Max 2MB)
                </p>
                <motion.button
                  onClick={async () => {
                    const defaultImageUrl = "/images/mary-george.svg"
                    setUploading(true)
                    try {
                      const response = await fetch('/api/agent/image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ imageUrl: defaultImageUrl }),
                      })
                      if (response.ok) {
                        setAgentImage(defaultImageUrl)
                        localStorage.setItem('agentImage', defaultImageUrl)
                        toast.success('Default image set!')
                        window.dispatchEvent(new CustomEvent('agentImageUpdated', { 
                          detail: { imageUrl: defaultImageUrl } 
                        }))
                      }
                    } catch (error) {
                      toast.error('Failed to set default image')
                    } finally {
                      setUploading(false)
                    }
                  }}
                  className="bg-coral-500 hover:bg-coral-600 text-white px-3 py-1 rounded text-xs"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Use Default Image
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-400">
        <p>💡 Tip: A professional headshot works best for building trust with applicants.</p>
        <p className="mt-1">🔄 Changes will appear on the main website immediately.</p>
      </div>
    </motion.div>
  )
}