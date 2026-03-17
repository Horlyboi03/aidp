'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function AgentSection() {
  const [agentImage, setAgentImage] = useState<string | null>(null)

  // Load agent image on component mount
  useEffect(() => {
    const loadAgentImage = async () => {
      try {
        // First try localStorage
        const savedImage = localStorage.getItem('agentImage')
        if (savedImage) {
          setAgentImage(savedImage)
          return
        }
        
        // Then try API
        const response = await fetch('/api/agent/image')
        if (response.ok) {
          const data = await response.json()
          if (data.imageUrl) {
            setAgentImage(data.imageUrl)
            localStorage.setItem('agentImage', data.imageUrl)
          }
        }
      } catch (error) {
        console.error('Failed to load agent image:', error)
      }
    }

    loadAgentImage()

    // Listen for agent image updates
    const handleImageUpdate = (event: any) => {
      const newImageUrl = event.detail.imageUrl
      setAgentImage(newImageUrl)
      if (newImageUrl) {
        localStorage.setItem('agentImage', newImageUrl)
      } else {
        localStorage.removeItem('agentImage')
      }
    }

    window.addEventListener('agentImageUpdated', handleImageUpdate)
    return () => window.removeEventListener('agentImageUpdated', handleImageUpdate)
  }, [])

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-center mb-16 gradient-text"
        >
          Meet Your Program Director
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="glass-effect rounded-3xl p-12 text-center coral-glow"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative w-48 h-48 mx-auto mb-8"
          >
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-coral-400 to-pink-500 p-1">
              <div className="w-full h-full rounded-2xl overflow-hidden bg-gray-800">
                {agentImage ? (
                  <img
                    src={agentImage}
                    alt="Mary George - Program Director"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to default image if uploaded image fails
                      e.currentTarget.src = "/images/mary-george.svg"
                    }}
                  />
                ) : (
                  <img
                    src="/images/mary-george.svg"
                    alt="Mary George - Program Director"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Final fallback to emoji if all images fail
                      e.currentTarget.style.display = 'none'
                      const emojiDiv = e.currentTarget.nextElementSibling as HTMLElement
                      if (emojiDiv) emojiDiv.style.display = 'flex'
                    }}
                  />
                )}
                <div className="w-full h-full hidden items-center justify-center text-6xl">
                  👩‍💼
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Mary George
          </motion.h3>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl gradient-text font-semibold mb-6"
          >
            Program Director
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto mb-8"
          >
            With over 15 years of experience in grant administration and financial assistance programs, 
            Mary leads our mission to help individuals in need access life-changing grants. 
            She is dedicated to ensuring that the poor, retired, disabled, and separated individuals 
            receive the financial support they deserve.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="glass-effect rounded-xl p-6 bg-gradient-to-r from-coral-500/20 to-pink-500/20"
          >
            <p className="text-white italic text-lg mb-4">
              "Every person deserves financial security and the opportunity to improve their life. 
              Whether you need help with medical bills, housing, education, or starting over, 
              our grant programs are here to support you. No repayment required - this is your 
              right as a taxpayer, and I'm here to help you access it."
            </p>
            <div className="pt-4 border-t border-white/20">
              <p className="text-coral-400 font-semibold">
                📧 Contact Mary: marygeorge193@gmail.com
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}