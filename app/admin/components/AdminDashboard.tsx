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
    const interval = setInterval(loadUnreadCount, 3000)
    return () => clearInterval(interval)
  }, [])

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
            toast.success(`🎉 ${newCount} new application${newCount > 1 ? 's' : ''} received!`, {
              duration: 5000,
              icon: '📋'
            })
          }
          
          setLastApplicationsCount(currentCount)
          setStats(prev => ({
            ...prev,
            total: currentCount,
            pending: data.applications?.filter((app: any) => app.status === 'pending').length || 0,
            approved: data.applications?.filter((app: any) => app.status === 'approved').length || 0,
            rejected: data.applications?.filter((app: any) => app.status === 'rejected').length || 0
          }))
        }
      } catch (error) {
        console.error('Failed to check applications:', error)
      }
    }

    checkNewApplications()
    const interval = setInterval(checkNewApplications, 2000)
    return () => clearInterval(interval)
  }, [lastApplicationsCount])

  useEffect(() => {
    const loadAgentImage = async () => {
      try {
        const savedImage = localStorage.getItem('agentImage')
        if (savedImage) {
          setAgentImage(savedImage)
          return
        }
        
        const response = await fetch('/api/agent/image')
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.imageUrl) {
            setAgentImage(data.imageUrl)
            localStorage.setItem('agentImage', data.imageUrl)
          } else {
            const defaultUrl = "/images/WhatsApp Image 2026-03-12 at 8.11.50 PM.jpeg"
            setAgentImage(defaultUrl)
            localStorage.setItem('agentImage', defaultUrl)
          }
        } else {
          const defaultUrl = "/images/WhatsApp Image 2026-03-12 at 8.11.50 PM.jpeg"
          setAgentImage(defaultUrl)
          localStorage.setItem('agentImage', defaultUrl)
        }
      } catch (error) {
        console.error('AdminDashboard: Failed to load agent image:', error)
        const defaultUrl = "/images/WhatsApp Image 2026-03-12 at 8.11.50 PM.jpeg"
        setAgentImage(defaultUrl)
        localStorage.setItem('agentImage', defaultUrl)
      }
    }

    const timer = setTimeout(loadAgentImage, 100)

    const handleImageUpdate = (event: any) => {
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
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        } else {
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
        setStats({
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0
        })
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [refreshKey])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    onLogout()
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'applications', label: 'Application', icon: '📋', badge: stats.pending > 0 ? stats.pending : 0 },
    { id: 'messages', label: 'Messages', icon: '💬', badge: unreadMessagesCount },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 lg:py-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto min-w-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex-shrink-0"
                >
                  <img
                    src="/images/aidp-logo-white.svg"
                    alt="AIDP"
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 drop-shadow-2xl"
                    onError={(e) => {
                      e.currentTarget.src = "/images/aidp-logo.svg"
                    }}
                  />
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <h1 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold gradient-text truncate">AIDP Admin</h1>
                  <p className="text-gray-300 text-xs sm:text-sm truncate">Dashboard</p>
                </div>
              </div>
              <motion.button
                onClick={handleLogout}
                className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-xs sm:text-sm md:text-base font-semibold flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-effect rounded-lg sm:rounded-xl md:rounded-2xl p-1 sm:p-2 mb-4 sm:mb-6"
          >
            <div className="grid grid-cols-4 gap-1 sm:gap-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 px-1 sm:px-3 md:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all text-xs sm:text-sm md:text-base ${
                    activeTab === tab.id
                      ? 'btn-coral text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-sm sm:text-base">{tab.icon}</span>
                  <span className="hidden sm:inline text-xs sm:text-sm">{tab.label}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {tab.badge}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Content Area */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {activeTab === 'overview' && (
              <div className="space-y-3 sm:space-y-4 md:space-y-6 w-full">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-effect rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 lg:p-6 text-center cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setActiveTab('applications')}
                  >
                    <div className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">📊</div>
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-0.5 sm:mb-1">{stats.total}</h3>
                    <p className="text-gray-300 text-xs sm:text-sm">Total</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-effect rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 lg:p-6 text-center cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setActiveTab('applications')}
                  >
                    <div className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">⏳</div>
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-yellow-400 mb-0.5 sm:mb-1">{stats.pending}</h3>
                    <p className="text-gray-300 text-xs sm:text-sm">Pending</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-effect rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 lg:p-6 text-center cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setActiveTab('applications')}
                  >
                    <div className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">✅</div>
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-green-400 mb-0.5 sm:mb-1">{stats.approved}</h3>
                    <p className="text-gray-300 text-xs sm:text-sm">Approved</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-effect rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 lg:p-6 text-center cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setActiveTab('applications')}
                  >
                    <div className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">❌</div>
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-red-400 mb-0.5 sm:mb-1">{stats.rejected}</h3>
                    <p className="text-gray-300 text-xs sm:text-sm">Rejected</p>
                  </motion.div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-effect rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 lg:p-6 text-center"
                  >
                    <div className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">📅</div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-coral-400 mb-0.5 sm:mb-1">{stats.todayApplications || 0}</h3>
                    <p className="text-gray-300 text-xs sm:text-sm">Today</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-effect rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 lg:p-6 text-center"
                  >
                    <div className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">📈</div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-blue-400 mb-0.5 sm:mb-1">{stats.thisWeekApplications || 0}</h3>
                    <p className="text-gray-300 text-xs sm:text-sm">This Week</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="glass-effect rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 lg:p-6 text-center"
                  >
                    <div className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">💰</div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-green-400 mb-0.5 sm:mb-1">{stats.totalGrantsAwarded || '$0'}</h3>
                    <p className="text-gray-300 text-xs sm:text-sm">Awarded</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="glass-effect rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 lg:p-6 text-center cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setActiveTab('messages')}
                  >
                    <div className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">💬</div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-purple-400 mb-0.5 sm:mb-1">Active</h3>
                    <p className="text-gray-300 text-xs sm:text-sm">Messages</p>
                  </motion.div>
                </div>

                {/* Program Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="glass-effect rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 w-full"
                >
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold gradient-text mb-3 sm:mb-4 md:mb-6">AIDP Program Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 w-full">
                    <div>
                      <h4 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-white mb-2 sm:mb-3">Program Purpose</h4>
                      <p className="text-gray-300 leading-relaxed text-xs sm:text-sm md:text-base">
                        AIDP helps the poor, retired, disabled, separated, and many more. In conjunction with the Private Grant Foundation, we issue billions of dollars in grants to individuals every day.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-white mb-2 sm:mb-3">Grant Benefits</h4>
                      <ul className="text-gray-300 space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base">
                        <li>• No repayment required</li>
                        <li>• Not taxable income</li>
                        <li>• No credit check needed</li>
                        <li>• Processing fee required</li>
                        <li>• Worldwide program</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === 'applications' && <ApplicationsList onStatsUpdate={refreshStats} />}
            {activeTab === 'messages' && <MessagingPanel onUnreadCountChange={handleUnreadCountChange} />}
            {activeTab === 'settings' && (
              <div className="space-y-3 sm:space-y-4 md:space-y-6 w-full">
                <ChangePassword />
                <AgentImageUpload />
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-effect rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 w-full"
                >
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4 md:mb-6">⚙️ System Settings</h3>
                  <div className="space-y-3 sm:space-y-4 md:space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-xs sm:text-sm md:text-base">Auto-approve applications</span>
                      <button className="bg-gray-600 rounded-full w-12 h-6 relative flex-shrink-0">
                        <div className="bg-white w-5 h-5 rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-xs sm:text-sm md:text-base">Email notifications</span>
                      <button className="bg-coral-500 rounded-full w-12 h-6 relative flex-shrink-0">
                        <div className="bg-white w-5 h-5 rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-xs sm:text-sm md:text-base">SMS notifications</span>
                      <button className="bg-coral-500 rounded-full w-12 h-6 relative flex-shrink-0">
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
    </div>
  )
}
