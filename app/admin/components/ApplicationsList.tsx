'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Application {
  id: string
  fullName: string
  email: string
  country: string
  grantAmount: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
}

interface ApplicationsListProps {
  onStatsUpdate?: () => void
}

export default function ApplicationsList({ onStatsUpdate }: ApplicationsListProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
    
    // Auto-refresh every 5 seconds to show new applications immediately
    const interval = setInterval(fetchApplications, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchApplications = async () => {
    try {
      console.log('Fetching applications...')
      const response = await fetch('/api/applications')
      console.log('Applications API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Applications API data:', data)
        console.log('Applications count:', data.applications?.length || 0)
        
        if (data.applications && Array.isArray(data.applications) && data.applications.length > 0) {
          setApplications(data.applications)
          console.log('Applications set from API:', data.applications)
        } else {
          console.log('No applications in API response, trying fallback...')
          await loadFromFallback()
        }
      } else {
        console.error('Applications API failed with status:', response.status)
        await loadFromFallback()
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      await loadFromFallback()
    } finally {
      setLoading(false)
    }
  }

  const loadFromFallback = async () => {
    try {
      console.log('Loading from fallback endpoint...')
      const fallbackResponse = await fetch('/api/debug/applications')
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json()
        console.log('Fallback data:', fallbackData)
        if (fallbackData.applications && Array.isArray(fallbackData.applications)) {
          setApplications(fallbackData.applications)
          console.log('Loaded applications from fallback:', fallbackData.applications.length, 'applications')
          toast.success(`Loaded ${fallbackData.applications.length} applications from local data`)
        } else {
          console.log('No applications in fallback response')
          setApplications([])
        }
      } else {
        console.error('Fallback endpoint failed with status:', fallbackResponse.status)
        setApplications([])
      }
    } catch (fallbackError) {
      console.error('Fallback fetch failed:', fallbackError)
      setApplications([])
    }
  }

  const updateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        // Update local state
        setApplications(prev =>
          prev.map(app =>
            app.id === id ? { ...app, status: newStatus } : app
          )
        )
        
        // Update selected app if it's the one being updated
        if (selectedApp && selectedApp.id === id) {
          setSelectedApp(prev => prev ? { ...prev, status: newStatus } : null)
        }
        
        toast.success(`Application ${newStatus}`)
        
        // Refresh the applications list to get updated data
        fetchApplications()
        
        // Notify parent component to refresh stats
        if (onStatsUpdate) {
          onStatsUpdate()
        }
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const deleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/applications/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (response.ok) {
        setApplications(prev => prev.filter(app => app.id !== id))
        if (selectedApp && selectedApp.id === id) {
          setSelectedApp(null)
        }
        toast.success('Application deleted successfully')
        if (onStatsUpdate) {
          onStatsUpdate()
        }
      } else {
        toast.error('Failed to delete application')
      }
    } catch (error) {
      console.error('Failed to delete application:', error)
      toast.error('Error deleting application')
    }
  }

  const startDirectMessage = async (applicantName: string, applicantEmail: string) => {
    try {
      const conversationId = `conv-${applicantEmail}`
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          sender: 'Admin',
          message: 'Hello! This is Mary George from AIDP. How can I assist you today?',
          isAdmin: true,
          applicantName,
          applicantEmail
        })
      })

      if (response.ok) {
        toast.success('💬 Opening conversation...')
        setSelectedApp(null)
        // Navigate to messages tab
        setTimeout(() => {
          const event = new CustomEvent('navigateToMessages', {
            detail: { conversationId, applicantName, applicantEmail }
          })
          window.dispatchEvent(event)
        }, 100)
      } else {
        toast.error('Failed to start conversation')
      }
    } catch (error) {
      console.error('Failed to start conversation:', error)
      toast.error('Error starting conversation')
    }
  }

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { bg: 'bg-yellow-500', text: 'Pending' },
      approved: { bg: 'bg-green-500', text: 'Approved' },
      rejected: { bg: 'bg-red-500', text: 'Rejected' }
    }
    const config = configs[status as keyof typeof configs]
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${config.bg}`}>
        {config.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="glass-effect rounded-2xl p-8 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-coral-400 border-t-transparent rounded-full mx-auto"
        />
        <p className="text-gray-300 mt-4">Loading applications...</p>
      </div>
    )
  }

  return (
    <div className="glass-effect rounded-2xl p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Grant Applications</h2>
      
      {/* Mobile View - Card Layout */}
      <div className="block md:hidden space-y-4">
        {applications.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-gray-400">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-lg font-medium">No applications yet</p>
              <p className="text-sm">Applications will appear here once submitted</p>
            </div>
          </div>
        ) : (
          applications.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedApp(app)}
              className="glass-effect rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-white font-semibold">{app.fullName}</p>
                  <p className="text-gray-400 text-sm">{app.email}</p>
                </div>
                {getStatusBadge(app.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <p className="text-gray-400">Country</p>
                  <p className="text-white">{app.country}</p>
                </div>
                <div>
                  <p className="text-gray-400">Grant Amount</p>
                  <p className="text-coral-400 font-semibold">{app.grantAmount}</p>
                </div>
              </div>
              
              <div className="text-xs text-gray-400 mb-3">
                Submitted: {new Date(app.submittedAt).toLocaleDateString()}
              </div>
              
              {app.status === 'pending' && (
                <div className="flex space-x-2">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      updateStatus(app.id, 'approved')
                    }}
                    className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Approve
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      updateStatus(app.id, 'rejected')
                    }}
                    className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Reject
                  </motion.button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
      
      {/* Desktop View - Table Layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left py-3 px-4 text-gray-300 font-semibold">Applicant</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold">Country</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold">Grant Amount</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold">Status</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold">Submitted</th>
              <th className="text-left py-3 px-4 text-gray-300 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="text-gray-400">
                    <div className="text-4xl mb-4">📋</div>
                    <p className="text-lg font-medium">No applications yet</p>
                    <p className="text-sm">Applications will appear here once submitted</p>
                  </div>
                </td>
              </tr>
            ) : (
              applications.map((app, index) => (
                <motion.tr
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedApp(app)}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-white font-medium">{app.fullName}</p>
                      <p className="text-gray-400 text-sm">{app.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-300">{app.country}</td>
                  <td className="py-4 px-4 text-coral-400 font-semibold">{app.grantAmount}</td>
                  <td className="py-4 px-4">{getStatusBadge(app.status)}</td>
                  <td className="py-4 px-4 text-gray-300">
                    {new Date(app.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      {app.status === 'pending' && (
                        <>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateStatus(app.id, 'approved')
                            }}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Approve
                          </motion.button>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateStatus(app.id, 'rejected')
                            }}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Reject
                          </motion.button>
                        </>
                      )}
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedApp(app)
                        }}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Application Detail Modal - Responsive with White Background */}
      {selectedApp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedApp(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 md:mb-6 pb-4 border-b border-gray-300">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">Application Details</h3>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-gray-700 hover:text-gray-900 text-3xl leading-none font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 text-sm font-semibold">Application ID</label>
                  <p className="text-gray-900 font-medium">{selectedApp.id}</p>
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-semibold">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedApp.status)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 text-sm font-semibold">Full Name</label>
                  <p className="text-gray-900 font-medium">{selectedApp.fullName}</p>
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-semibold">Email</label>
                  <p className="text-gray-900 font-medium break-all">{selectedApp.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 text-sm font-semibold">Country</label>
                  <p className="text-gray-900 font-medium">{selectedApp.country}</p>
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-semibold">Gender</label>
                  <p className="text-gray-900 font-medium capitalize">{(selectedApp as any).gender || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 text-sm font-semibold">Marital Status</label>
                  <p className="text-gray-900 font-medium capitalize">{(selectedApp as any).maritalStatus || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-semibold">Occupation</label>
                  <p className="text-gray-900 font-medium">{(selectedApp as any).occupation || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 text-sm font-semibold">Grant Amount</label>
                  <p className="text-coral-600 font-semibold text-lg">{selectedApp.grantAmount}</p>
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-semibold">Grant Purpose</label>
                  <p className="text-gray-900 font-medium capitalize">{(selectedApp as any).grantPurpose || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 text-sm font-semibold">Payment Method</label>
                  <p className="text-gray-900 font-medium capitalize">{(selectedApp as any).paymentMethod || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-semibold">Phone</label>
                  <p className="text-gray-900 font-medium">{(selectedApp as any).phone || 'Not provided'}</p>
                </div>
              </div>
              
              <div>
                <label className="text-gray-700 text-sm font-semibold">Monthly Income</label>
                <p className="text-gray-900 font-medium capitalize">{(selectedApp as any).monthlyIncome?.replace('-', ' - ') || 'Not provided'}</p>
              </div>
              
              {(selectedApp as any).description && (
                <div>
                  <label className="text-gray-700 text-sm font-semibold">Additional Details</label>
                  <p className="text-gray-900 font-medium">{(selectedApp as any).description}</p>
                </div>
              )}
              
              <div>
                <label className="text-gray-700 text-sm font-semibold">Submitted Date</label>
                <p className="text-gray-900 font-medium">
                  {new Date(selectedApp.submittedAt).toLocaleString()}
                </p>
              </div>
              
              {/* Action Buttons - Responsive */}
              {selectedApp.status === 'pending' && (
                <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-gray-200">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      updateStatus(selectedApp.id, 'approved')
                      setSelectedApp(null)
                    }}
                    className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ✓ Approve Application
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      updateStatus(selectedApp.id, 'rejected')
                      setSelectedApp(null)
                    }}
                    className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ✗ Reject Application
                  </motion.button>
                </div>
              )}

              {/* Message and Delete Buttons */}
              <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-gray-200">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation()
                    startDirectMessage(selectedApp.fullName, selectedApp.email)
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>💬</span>
                  <span>Message</span>
                </motion.button>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteApplication(selectedApp.id)
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>🗑️</span>
                  <span>Delete</span>
                </motion.button>
              </div>


            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
