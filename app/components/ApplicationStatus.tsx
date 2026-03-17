'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import NotificationDisplay from './NotificationDisplay'

interface ApplicationStatusProps {
  applicationId: string
  onBack: () => void
}

type Status = 'pending' | 'approved' | 'rejected'

export default function ApplicationStatus({ applicationId, onBack }: ApplicationStatusProps) {
  const [status, setStatus] = useState<Status>('pending')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to check status
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/applications/${applicationId}/status`)
        if (response.ok) {
          const data = await response.json()
          setStatus(data.status)
        }
      } catch (error) {
        console.error('Failed to fetch status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
    // Poll for status updates every 30 seconds
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [applicationId])

  const getStatusConfig = (status: Status) => {
    switch (status) {
      case 'pending':
        return {
          color: 'status-pending',
          icon: '⏳',
          title: 'Application Pending',
          message: 'Your application is being reviewed by our team. We will notify you once a decision is made.'
        }
      case 'approved':
        return {
          color: 'status-approved',
          icon: '✅',
          title: 'Application Approved!',
          message: 'Congratulations! Your grant application has been approved. You will receive further instructions via email.'
        }
      case 'rejected':
        return {
          color: 'status-rejected',
          icon: '❌',
          title: 'Application Not Approved',
          message: 'Unfortunately, your application was not approved at this time. You may reapply after 6 months.'
        }
    }
  }

  const statusConfig = getStatusConfig(status)

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-coral-400 border-t-transparent rounded-full"
        />
      </section>
    )
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="glass-effect rounded-3xl p-12 text-center relative"
        >
          <motion.button
            onClick={onBack}
            className="absolute top-6 left-6 text-coral-400 hover:text-coral-300 transition-colors flex items-center space-x-2"
            whileHover={{ x: -5 }}
          >
            <span>←</span>
            <span>Back to Home</span>
          </motion.button>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`w-24 h-24 rounded-full ${statusConfig.color} flex items-center justify-center text-4xl mx-auto mb-8`}
          >
            {statusConfig.icon}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            {statusConfig.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-gray-300 mb-8 leading-relaxed"
          >
            {statusConfig.message}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="glass-effect rounded-xl p-6 mb-8"
          >
            <h3 className="text-xl font-semibold text-white mb-2">Application Details</h3>
            <div className="text-left space-y-2">
              <p className="text-gray-300">
                <span className="font-semibold">Application ID:</span> {applicationId}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Submitted:</span> {new Date().toLocaleDateString()}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Status:</span> 
                <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.color}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </p>
            </div>
          </motion.div>

          {/* Notifications */}
          <NotificationDisplay applicationId={applicationId} />

          {status === 'approved' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="glass-effect rounded-xl p-6 mb-8 border-l-4 border-green-400"
            >
              <h3 className="text-xl font-bold text-green-400 mb-4">🎉 Next Steps</h3>
              <div className="space-y-3 text-gray-200">
                <p>Congratulations! Your grant has been approved. Here's what happens next:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You will receive an email with payment instructions for the processing fee</li>
                  <li>Once the processing fee is paid, your grant will be released</li>
                  <li>You can choose to receive your grant via cash or cheque as selected</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="font-semibold text-coral-400 mb-2">Need to contact us?</p>
                  <motion.button
                    onClick={() => {
                      // Create a custom event to open chat widget
                      const chatEvent = new CustomEvent('openChat', { 
                        detail: { 
                          message: 'Hi! I was approved for my grant application. What are the next steps for the processing fee payment?' 
                        } 
                      })
                      window.dispatchEvent(chatEvent)
                    }}
                    className="btn-coral px-6 py-2 rounded-lg text-sm font-semibold mr-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    💬 Chat with Admin
                  </motion.button>
                  <span className="text-gray-400 text-sm">
                    Or email: marygeorge193@gmail.com
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {status === 'pending' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="glass-effect rounded-xl p-6 border-l-4 border-yellow-400"
            >
              <h4 className="text-yellow-400 font-semibold mb-3">⏳ Application Under Review</h4>
              <div className="space-y-2 text-gray-300 text-sm">
                <p>• Your application is being carefully reviewed by our team</p>
                <p>• You will receive email notifications about any status updates</p>
                <p>• Status updates automatically every 30 seconds on this page</p>
                <p>• Average review time: Less than 24 hours</p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-yellow-200 font-medium">
                  💡 Keep this page bookmarked to check your status anytime
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}