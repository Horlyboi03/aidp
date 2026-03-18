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
  grantPurpose: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
}

interface User {
  id: string
  fullName: string
  email: string
  phone: string
  country: string
}

interface UserDashboardProps {
  user: User
  token: string
  onSignOut: () => void
  onApplyNew: () => void
}

export default function UserDashboard({ user, token, onSignOut, onApplyNew }: UserDashboardProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchApplications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/user/applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      } else {
        console.error('Failed to fetch applications')
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const configs = {
      pending: { bg: 'bg-yellow-500', text: 'Pending Review', icon: '⏳' },
      approved: { bg: 'bg-green-500', text: 'Approved', icon: '✅' },
      rejected: { bg: 'bg-red-500', text: 'Not Approved', icon: '❌' }
    }
    const config = configs[status as keyof typeof configs]
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${config.bg} flex items-center space-x-1`}>
        <span>{config.icon}</span>
        <span>{config.text}</span>
      </span>
    )
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your application is being reviewed by our team. You will receive an email notification once a decision is made.'
      case 'approved':
        return 'Congratulations! Your grant has been approved. You will receive payment instructions via email within 24 hours.'
      case 'rejected':
        return 'Unfortunately, your application was not approved at this time. You may reapply after 6 months with updated information.'
      default:
        return ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-coral-400 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <section className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-3xl p-8 mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">Welcome back, {user.fullName}!</h1>
              <p className="text-gray-300">Manage your grant applications and track their status</p>
            </div>
            <div className="flex space-x-4">
              <motion.button
                onClick={onApplyNew}
                className="btn-coral px-6 py-3 rounded-xl font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Apply for New Grant
              </motion.button>
              <motion.button
                onClick={onSignOut}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Out
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Applications */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-3xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Your Applications</h2>

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Applications Yet</h3>
              <p className="text-gray-400 mb-6">You haven't submitted any grant applications yet.</p>
              <motion.button
                onClick={onApplyNew}
                className="btn-coral px-8 py-3 rounded-xl font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Submit Your First Application
              </motion.button>
            </div>
          ) : (
            <div className="space-y-6">
              {applications.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-effect rounded-xl p-6 border-l-4 border-coral-400"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        Grant Application #{app.id.split('-').pop()}
                      </h3>
                      <p className="text-gray-400">
                        Submitted on {new Date(app.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-gray-400 text-sm">Grant Amount</label>
                      <p className="text-coral-400 font-semibold text-lg">{app.grantAmount}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Purpose</label>
                      <p className="text-white font-medium capitalize">{app.grantPurpose}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Application ID</label>
                      <p className="text-white font-medium">{app.id}</p>
                    </div>
                  </div>

                  <div className="glass-effect rounded-lg p-4 border-l-4 border-blue-400">
                    <h4 className="text-blue-400 font-semibold mb-2">Status Update</h4>
                    <p className="text-gray-200 text-sm">{getStatusMessage(app.status)}</p>
                  </div>

                  {app.status === 'approved' && (
                    <div className="mt-4 glass-effect rounded-lg p-4 border-l-4 border-green-400">
                      <h4 className="text-green-400 font-semibold mb-2">🎉 Next Steps</h4>
                      <div className="space-y-2 text-gray-200 text-sm">
                        <p>• Check your email for payment instructions</p>
                        <p>• Complete the processing fee payment</p>
                        <p>• Your grant will be released within 48 hours after payment</p>
                        <p>• Contact support if you need assistance: maryygeorge193@gmail.com</p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <p className="text-green-200 font-medium text-sm flex items-center">
                          💬 <span className="ml-2">Need help? Chat with Mary George using the chat button!</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {app.status === 'pending' && (
                    <div className="mt-4 glass-effect rounded-lg p-4 border-l-4 border-yellow-400">
                      <h4 className="text-yellow-400 font-semibold mb-2">⏳ Application Under Review</h4>
                      <div className="space-y-2 text-gray-200 text-sm">
                        <p>• Your application is being carefully reviewed</p>
                        <p>• You will receive email notifications about status updates</p>
                        <p>• Average review time: Less than 24 hours</p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <p className="text-yellow-200 font-medium text-sm flex items-center">
                          💬 <span className="ml-2">Have questions? Chat with Mary George anytime!</span>
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}