'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

interface Message {
  id: string
  text: string
  sender: 'user' | 'admin'
  timestamp: Date
  senderName: string
  delivered?: boolean
  read?: boolean
}

interface LiveChatWidgetProps {
  user?: any
  token?: string | null
}

export default function LiveChatWidget({ user, token }: LiveChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const conversationId = user ? `conv-${user.id}` : `conv-guest-${Date.now()}`

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load existing conversation when chat opens
  useEffect(() => {
    if (isOpen && user) {
      loadConversation()
      // Poll for new messages every 3 seconds when chat is open
      const interval = setInterval(loadConversation, 3000)
      return () => clearInterval(interval)
    }
  }, [isOpen, user])



  // Poll for new messages when chat is closed (for unread count)
  useEffect(() => {
    if (!isOpen && user) {
      const interval = setInterval(checkForNewMessages, 10000)
      return () => clearInterval(interval)
    }
  }, [isOpen, user])

  const loadConversation = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.conversation && data.conversation.messages) {
          const formattedMessages = data.conversation.messages.map((msg: any) => ({
            id: msg.id,
            text: msg.message,
            sender: msg.isAdmin ? 'admin' : 'user',
            timestamp: new Date(msg.timestamp),
            senderName: msg.isAdmin ? 'Mary George' : user.fullName,
            delivered: msg.delivered || true,
            read: msg.read || false
          }))
          setMessages(formattedMessages)
          setIsConnected(true)
        }
      }
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }

  const openChat = () => {
    setIsOpen(true)
    setUnreadCount(0)
    if (user) {
      // Mark admin messages as read when user opens chat
      fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          markAdminMessagesAsRead: true
        })
      }).then(() => {
        // Refresh conversation to get updated read status
        loadConversation()
      })
    }
  }

  const checkForNewMessages = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.conversation && data.conversation.messages) {
          const newMessageCount = data.conversation.messages.filter((msg: any) => 
            !msg.isAdmin && !msg.read
          ).length
          setUnreadCount(newMessageCount)
        }
      }
    } catch (error) {
      console.error('Failed to check for new messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!inputText.trim() || !user) return

    const messageText = inputText
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      senderName: user.fullName,
      delivered: true,
      read: false
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          conversationId,
          sender: user.fullName,
          message: messageText,
          isAdmin: false,
          applicantName: user.fullName,
          applicantEmail: user.email
        })
      })

      if (response.ok) {
        console.log('Message sent successfully')
        toast.success('Message sent to Mary George!')
      } else {
        const errorData = await response.json()
        console.error('Server error:', errorData)
        throw new Error(errorData.message || errorData.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message. Please try again.'
      toast.error(errorMessage)
      // Remove the message from UI if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Listen for openChat events
  useEffect(() => {
    const handleOpenChat = (event: any) => {
      setIsOpen(true)
      setUnreadCount(0)
      // If there's a pre-filled message in the event, set it
      if (event.detail?.message) {
        setInputText(event.detail.message)
      }
      // Mark admin messages as read when user opens chat
      if (user) {
        fetch('/api/messages', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            markAdminMessagesAsRead: true
          })
        }).then(() => {
          loadConversation()
        })
      }
    }

    window.addEventListener('openChat', handleOpenChat)
    return () => window.removeEventListener('openChat', handleOpenChat)
  }, [user, conversationId])

  if (!user) {
    return (
      <motion.button
        onClick={() => {
          // Trigger auth modal to open
          const event = new CustomEvent('openAuthModal', { detail: { defaultTab: 'signin' } })
          window.dispatchEvent(event)
        }}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 btn-coral w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg flex items-center justify-center text-xl md:text-2xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Sign in to chat with Mary George"
      >
        💬
      </motion.button>
    )
  }

  return (
    <>
      {/* Chat Toggle Button - Responsive Size */}
      <motion.button
        onClick={openChat}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 btn-coral w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg flex items-center justify-center text-xl md:text-2xl relative"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        💬
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white text-xs w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center font-bold"
          >
            {unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Chat Window - Beautiful White Background */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 md:bottom-24 right-4 md:right-6 z-40 w-[calc(100vw-2rem)] md:w-96 h-[500px] bg-white/98 backdrop-blur-xl rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-gray-200"
          >
            {/* Chat Header */}
            <div className="bg-coral-gradient p-4 text-white flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Chat with Mary George</h3>
                <p className="text-sm opacity-90 flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                  {isConnected ? 'Connected' : 'Connecting...'}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Messages - White Background */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-gray-50 to-white">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">👋</div>
                  <p className="font-medium">Start a conversation with Mary George!</p>
                  <p className="text-sm mt-2">She'll respond as soon as possible.</p>
                </div>
              )}
              
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm shadow-md ${
                      message.sender === 'user'
                        ? 'bg-coral-gradient text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`font-semibold text-xs ${message.sender === 'user' ? 'text-white' : 'text-coral-600'}`}>
                        {message.senderName}
                      </span>
                      <span className={`text-xs ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p>{message.text}</p>
                    
                    {/* Message Status for User Messages */}
                    {message.sender === 'user' && (
                      <div className="flex justify-end mt-1">
                        {message.delivered && (
                          <span className={`text-xs ${message.read ? 'text-blue-200' : 'text-white/60'}`}>
                            {message.read ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input - White Background */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message to Mary..."
                  className="flex-1 px-3 py-2 rounded-lg text-sm border-2 border-gray-300 focus:border-coral-500 focus:outline-none bg-white text-gray-900 placeholder-gray-500"
                />
                <motion.button
                  onClick={sendMessage}
                  disabled={!inputText.trim()}
                  className="btn-coral px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Send
                </motion.button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Messages are sent directly to Mary George (maryygeorge193@gmail.com)
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}