'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface Notification {
  id: string
  applicationId: string
  type: 'approved' | 'rejected' | 'submitted'
  title: string
  message: string
  timestamp: string
  read: boolean
}

interface NotificationDisplayProps {
  applicationId: string
}

export default function NotificationDisplay({ applicationId }: NotificationDisplayProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await fetch(`/api/notifications?applicationId=${applicationId}`)
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications || [])
        }
      } catch (error) {
        console.error('Failed to load notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
    
    // Poll for new notifications every 10 seconds
    const interval = setInterval(loadNotifications, 10000)
    return () => clearInterval(interval)
  }, [applicationId])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-2 border-coral-400 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="space-y-4 mb-8">
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`glass-effect rounded-xl p-6 border-l-4 ${
              notification.type === 'approved' 
                ? 'border-green-400' 
                : notification.type === 'rejected'
                ? 'border-red-400'
                : 'border-blue-400'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className={`text-xl font-bold ${
                notification.type === 'approved' 
                  ? 'text-green-400' 
                  : notification.type === 'rejected'
                  ? 'text-red-400'
                  : 'text-blue-400'
              }`}>
                {notification.title}
              </h3>
              <span className="text-xs text-gray-400">
                {new Date(notification.timestamp).toLocaleString()}
              </span>
            </div>
            
            <div className="text-gray-200 leading-relaxed whitespace-pre-line">
              {notification.message}
            </div>
            
            {notification.type === 'approved' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-4 bg-green-500/20 rounded-lg border border-green-400/30"
              >
                <h4 className="text-green-400 font-semibold mb-2">🎉 Congratulations!</h4>
                <p className="text-green-200 text-sm">
                  Your grant application has been approved! Check your email for detailed next steps 
                  and payment instructions for the processing fee.
                </p>
              </motion.div>
            )}
            
            {notification.type === 'rejected' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-4 bg-red-500/20 rounded-lg border border-red-400/30"
              >
                <h4 className="text-red-400 font-semibold mb-2">📋 Application Not Approved</h4>
                <p className="text-red-200 text-sm">
                  You may reapply after 6 months. Contact our support team for feedback 
                  on your application.
                </p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}