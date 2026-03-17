'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import HeroSection from './components/HeroSection'
import ProgramDetails from './components/ProgramDetails'
import AgentSection from './components/AgentSection'
import ApplicationForm from './components/ApplicationForm'
import LiveChatWidget from './components/LiveChatWidget'
import AuthModal from './components/AuthModal'
import UserDashboard from './components/UserDashboard'

interface User {
  id: string
  fullName: string
  email: string
  phone: string
  country: string
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [agentImage, setAgentImage] = useState<string | null>(null)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('aidp_user')
    const savedToken = localStorage.getItem('aidp_token')
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
      setToken(savedToken)
    }

    // Load agent image from localStorage
    const savedAgentImage = localStorage.getItem('agentImage')
    if (savedAgentImage) {
      setAgentImage(savedAgentImage)
    }

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

  const handleAuthSuccess = (userData: User, userToken: string) => {
    setUser(userData)
    setToken(userToken)
    localStorage.setItem('aidp_user', JSON.stringify(userData))
    localStorage.setItem('aidp_token', userToken)
  }

  const handleSignOut = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('aidp_user')
    localStorage.removeItem('aidp_token')
    setCurrentPage(1)
  }

  const nextPage = () => {
    if (!user) {
      setShowAuthModal(true)
    } else {
      setCurrentPage(2)
    }
  }

  const prevPage = () => {
    setCurrentPage(1)
  }

  const showDashboard = () => {
    if (!user) {
      setShowAuthModal(true)
    } else {
      setCurrentPage(3)
    }
  }

  // If user is logged in and on page 1, show option to go to dashboard
  if (user && currentPage === 1) {
    return (
      <main className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-20 w-72 h-72 bg-coral-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-coral-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
          </div>
        </div>

        {/* Page Content */}
        <div className="relative z-10">
          {/* User Welcome Bar */}
          <div className="bg-coral-gradient/20 backdrop-blur-sm border-b border-white/10 p-4">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-4">
                {/* Agent Profile Picture */}
                <div className="relative w-12 h-12">
                  <div className="w-full h-full rounded-lg bg-gradient-to-br from-coral-400 to-pink-500 p-1">
                    <div className="w-full h-full rounded-lg overflow-hidden bg-gray-800">
                      <img
                        src={agentImage || "/images/mary-george.svg"}
                        alt="Mary George"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const emojiDiv = e.currentTarget.nextElementSibling as HTMLElement
                          if (emojiDiv) emojiDiv.style.display = 'flex'
                        }}
                      />
                      <div className="w-full h-full hidden items-center justify-center text-lg" style={{ display: 'none' }}>
                        👩‍💼
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-white">Welcome back, <span className="font-semibold">{user.fullName}</span>!</p>
                  <p className="text-coral-200 text-sm">Mary George is available to help</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <motion.button
                  onClick={showDashboard}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  My Dashboard
                </motion.button>
                <motion.button
                  onClick={handleSignOut}
                  className="bg-gray-600/50 hover:bg-gray-600/70 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign Out
                </motion.button>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <HeroSection />
            <ProgramDetails />
            <AgentSection />
            
            {/* Navigation */}
            <div className="flex justify-center py-12 space-x-4">
              <motion.button
                onClick={showDashboard}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View My Applications
              </motion.button>
              <motion.button
                onClick={nextPage}
                className="btn-coral px-8 py-4 rounded-full text-white font-semibold text-lg shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Apply for New Grant →
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Live Chat Widget */}
        <LiveChatWidget user={user} token={token} />
      </main>
    )
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-coral-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-coral-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
        </div>
      </div>

      {/* Page Content */}
      <div className="relative z-10">
        {/* Logo Header - Bigger and More Prominent */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute top-8 left-8 z-20"
        >
          <img
            src="/images/aidp-logo-white.svg"
            alt="AIDP Grant Program"
            className="w-32 h-32 drop-shadow-2xl hover:scale-110 transition-transform duration-300"
          />
        </motion.div>

        {currentPage === 1 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <HeroSection />
            <ProgramDetails />
            <AgentSection />
            
            {/* Navigation */}
            <div className="flex justify-center py-12">
              <motion.button
                onClick={nextPage}
                className="btn-coral px-8 py-4 rounded-full text-white font-semibold text-lg shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Apply Now →
              </motion.button>
            </div>
          </motion.div>
        ) : currentPage === 2 ? (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <ApplicationForm 
              onBack={prevPage} 
              user={user} 
              token={token}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <UserDashboard 
              user={user!} 
              token={token!} 
              onSignOut={handleSignOut}
              onApplyNew={() => setCurrentPage(2)}
            />
          </motion.div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Live Chat Widget */}
      <LiveChatWidget user={user} token={token} />
    </main>
  )
}