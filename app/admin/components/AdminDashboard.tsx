'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import ApplicationsList from './ApplicationsList'
import MessagingPanel from './MessagingPanel'
import AgentImageUpload from './AgentImageUpload'
import ChangePassword from './ChangePassword'

interface AdminDashboardProps {
  onLogout: () => void
}

interface DashboardStats {
  total: number
  pending: number
  approved: number
  rejected: number
  todayApplications?: number
  thisWeekApplications?: number
  totalGrantsAwarded?: string
  averageGrantAmount?: string
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })
  const [refreshKey, setRefreshKey] = useState(0)
  const [agentImage, setAgentImage] = useState<string | null>(null)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)
  const [newApplicationsCount, setNewApplicationsCount] = useState(0)
  const [lastApplicationsCount, setLastApplicationsCount] = useState(0)

  const handleUnreadCountChange = (count: number) => {
    setUnreadMessagesCount(count)
  }

  const refreshStats = () => {
    setRefreshKey(prev => prev + 1)
  }

  // Load unread messages count and check for new applications
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const response = await fetch('/api/messages')
        if (response.ok) {
          const data = await response.json()
          const totalUnread = data.conversations?.reduce((total: number, conv: any) => total + conv.unreadCount, 0) || 0
          setUnreadMessagesCount(totalUnread)
        }
      } catch (error) {
        console.error('Failed to load unread count:', error)
      }
    }

    loadUnreadCount()
    const interval = setInterval(loadUnreadCount, 3000) // Check every 3 seconds
    return () => clearInterval(interval)
  }, [])

  // Check for new applications
  useEffect(() => {
    const checkNewApplications = async () => {
      try {
        const response = await fetch('/api/applications')
        if (response.ok) {
          const data = await response.json()
          const currentCount = data.applications?.length || 0
          
          if (lastApplicationsCount > 0 && currentCount > lastApplicationsCount) {
            const newCount = currentCount - lastApplicationsCount
            setNewApplicationsCount(newCount)
            // Show notification
            toast.success(`🎉 ${newCount} new application${newCount > 1 ? 's' : ''} received!`, {
              duration: 5000,
              icon: '📋'
            })
            // Auto-switch to applications tab if there are new applications
            setActiveTab('applications')
          }
          
          setLastApplicationsCount(currentCount)
        }
      } catch (error) {
        console.error('Failed to check applications:', error)
      }
    }

    checkNewApplications()
    const interval = setInterval(checkNewApplications, 3000) // Check every 3 seconds
    return () => clearInterval(interval)
  }, [lastApplicationsCount])

  // Load agent image
  useEffect(() => {
    const loadAgentImage = async () => {
      try {
        console.log('AdminDashboard: Loading agent image...')
        
        // First try localStorage
        const savedImage = localStorage.getItem('agentImage')
        if (savedImage) {
          console.log('AdminDashboard: Found saved image in localStorage')
          setAgentImage(savedImage)
          return
        }
        
        // Then try API
        const response = await fetch('/api/agent/image')
        console.log('AdminDashboard: API response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('AdminDashboard: API data:', data)
          
          if (data.imageUrl) {
            console.log('AdminDashboard: Setting image URL:', data.imageUrl)
            setAgentImage(data.imageUrl)
            localStorage.setItem('agentImage', data.imageUrl)
          } else {
            console.log('AdminDashboard: No image URL, setting default')
            // Set default image if no custom image is uploaded
            const defaultUrl = "/images/WhatsApp Image 2026-03-12 at 8.11.50 PM.jpeg"
            setAgentImage(defaultUrl)
            localStorage.setItem('agentImage', defaultUrl)
          }
        } else {
          console.log('AdminDashboard: API response not ok, setting default')
          // Fallback to default image if API fails
          const defaultUrl = "/images/WhatsApp Image 2026-03-12 at 8.11.50 PM.jpeg"
          setAgentImage(defaultUrl)
          localStorage.setItem('agentImage', defaultUrl)
        }
      } catch (error) {
        console.error('AdminDashboard: Failed to load agent image:', error)
        // Fallback to default image on error
        const defaultUrl = "/images/WhatsApp Image 2026-03-12 at 8.11.50 PM.jpeg"
        setAgentImage(defaultUrl)
        localStorage.setItem('agentImage', defaultUrl)
      }
    }

    // Add a small delay to ensure the component is fully mounted
    const timer = setTimeout(loadAgentImage, 100)

    // Listen for agent image updates
    const handleImageUpdate = (event: any) => {
      console.log('AdminDashboard: Agent image updated:', event.detail.imageUrl)
      const newImageUrl = event.detail.imageUrl || "/images/WhatsApp Image 2026-03-12 at 8.11.50 PM.jpeg"
      setAgentImage(newImageUrl)
      if (newImageUrl) {
        localStorage.setItem('agentImage', newImageUrl)
      } else {
        localStorage.removeItem('agentImage')
      }
    }

    window.addEventListener('agentImageUpdated', handleImageUpdate)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('agentImageUpdated', handleImageUpdate)
    }
  }, [])

  useEffect(() => {
    // Fetch real stats from API
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        } else {
          // Fallback to applications API
          const appResponse = await fetch('/api/applications')
          if (appResponse.ok) {
            const appData = await appResponse.json()
            setStats(appData.stats || {
              total: 0,
              pending: 0,
              approved: 0,
              rejected: 0
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        // Fallback to default stats if API fails
        setStats({
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0
        })
      }
    }

    fetchStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [refreshKey])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    onLogout()
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'applications', label: 'Applications', icon: '📋', badge: newApplicationsCount > 0 ? newApplicationsCount : stats.pending },
    { id: 'messages', label: 'Messages', icon: '💬', badge: unreadMessagesCount },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen p-2 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-2xl p-4 md:p-6 mb-4 md:mb-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 md:space-x-6 w-full md:w-auto">
              {/* AIDP Logo - Responsive */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src="/images/aidp-logo-white.svg"
                  alt="AIDP Grant Program"
                  className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 drop-shadow-2xl hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    console.error('Logo failed to load, trying fallback')
                    e.currentTarget.src = "/images/aidp-logo.svg"
                  }}
                  onLoad={() => console.log('AIDP Logo loaded successfully')}
                />
              </motion.div>
              
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold gradient-text">AIDP Admin Dashboard</h1>
                <p className="text-gray-300 mt-1 text-xs md:text-sm">Manage grant applications and communications</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 w-full md:w-auto justify-end">
              <motion.button
                onClick={handleLogout}
                className="px-4 md:px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm md:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs - Responsive with Horizontal Scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-2xl p-2 mb-8 overflow-x-auto"
        >
          <div className="flex space-x-2 min-w-max md:min-w-0">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center space-x-2 px-4 md:px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'btn-coral text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{tab.icon}</span>
                <span className="text-sm md:text-base">{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-effect rounded-2xl p-6 text-center cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setActiveTab('applications')}
                >
                  <div className="text-4xl mb-2">📊</div>
                  <h3 className="text-2xl font-bold text-white mb-1">{stats.total}</h3>
                  <p className="text-gray-300">Total Applications</p>
                  <p className="text-xs text-coral-400 mt-2">Click to view all</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-effect rounded-2xl p-6 text-center cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setActiveTab('applications')}
                >
                  <div className="text-4xl mb-2">⏳</div>
                  <h3 className="text-2xl font-bold text-yellow-400 mb-1">{stats.pending}</h3>
                  <p className="text-gray-300">Pending Review</p>
                  <p className="text-xs text-coral-400 mt-2">Click to manage</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-effect rounded-2xl p-6 text-center cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setActiveTab('applications')}
                >
                  <div className="text-4xl mb-2">✅</div>
                  <h3 className="text-2xl font-bold text-green-400 mb-1">{stats.approved}</h3>
                  <p className="text-gray-300">Approved</p>
                  <p className="text-xs text-coral-400 mt-2">Click to view</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-effect rounded-2xl p-6 text-center cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setActiveTab('applications')}
                >
                  <div className="text-4xl mb-2">❌</div>
                  <h3 className="text-2xl font-bold text-red-400 mb-1">{stats.rejected}</h3>
                  <p className="text-gray-300">Rejected</p>
                  <p className="text-xs text-coral-400 mt-2">Click to view</p>
                </motion.div>
              </div>

              {/* Additional Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="glass-effect rounded-2xl p-6 text-center"
                >
                  <div className="text-4xl mb-2">📅</div>
                  <h3 className="text-2xl font-bold text-coral-400 mb-1">{stats.todayApplications || 0}</h3>
                  <p className="text-gray-300">Today's Applications</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="glass-effect rounded-2xl p-6 text-center"
                >
                  <div className="text-4xl mb-2">📈</div>
                  <h3 className="text-2xl font-bold text-blue-400 mb-1">{stats.thisWeekApplications || 0}</h3>
                  <p className="text-gray-300">This Week</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="glass-effect rounded-2xl p-6 text-center"
                >
                  <div className="text-4xl mb-2">💰</div>
                  <h3 className="text-xl font-bold text-green-400 mb-1">{stats.totalGrantsAwarded || '$0'}</h3>
                  <p className="text-gray-300">Total Grants Awarded</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="glass-effect rounded-2xl p-6 text-center cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setActiveTab('messages')}
                >
                  <div className="text-4xl mb-2">💬</div>
                  <h3 className="text-xl font-bold text-purple-400 mb-1">Active</h3>
                  <p className="text-gray-300">Message Center</p>
                  <p className="text-xs text-coral-400 mt-2">Click to open</p>
                </motion.div>
              </div>

              {/* Program Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="glass-effect rounded-2xl p-8"
              >
                <h3 className="text-2xl font-bold gradient-text mb-6">AIDP Program Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Program Purpose</h4>
                    <p className="text-gray-300 leading-relaxed">
                      AIDP helps the poor, retired, disabled, separated, and many more. In conjunction 
                      with the Private Grant Foundation, we issue billions of dollars in grants to 
                      individuals every day.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Grant Benefits</h4>
                    <ul className="text-gray-300 space-y-2">
                      <li>• No repayment required</li>
                      <li>• Not taxable income</li>
                      <li>• No credit check needed</li>
                      <li>• Processing fee required</li>
                      <li>• Worldwide program</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {activeTab === 'applications' && <ApplicationsList onStatsUpdate={refreshStats} />}
          {activeTab === 'messages' && <MessagingPanel onUnreadCountChange={handleUnreadCountChange} />}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <ChangePassword />
              
              <AgentImageUpload />
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4">⚙️ System Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Auto-approve applications</span>
                    <button className="bg-gray-600 rounded-full w-12 h-6 relative">
                      <div className="bg-white w-5 h-5 rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Email notifications</span>
                    <button className="bg-coral-500 rounded-full w-12 h-6 relative">
                      <div className="bg-white w-5 h-5 rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">SMS notifications</span>
                    <button className="bg-coral-500 rounded-full w-12 h-6 relative">
                      <div className="bg-white w-5 h-5 rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}