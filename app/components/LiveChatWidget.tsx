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
  imageData?: string
}

interface LiveChatWidgetProps {
  user?: any
  token?: string | null
  guestInfo?: {
    fullName: string
    email: string
    applicationId?: string
  }
}

export default function LiveChatWidget({ user, token, guestInfo }: LiveChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Use either authenticated user or guest info
  const chatUser = user || (guestInfo ? {
    id: guestInfo.applicationId || `guest-${Date.now()}`,
    fullName: guestInfo.fullName,
    email: guestInfo.email
  } : null)
  
  // Generate conversationId - ensure it's consistent
  const conversationId = chatUser?.id ? `conv-${chatUser.id}` : null

  // Debug logging
  useEffect(() => {
    console.log('=== LiveChatWidget Mount/Update ===')
    console.log('user prop:', user)
    console.log('guestInfo prop:', guestInfo)
    console.log('chatUser (computed):', chatUser)
    console.log('conversationId:', conversationId)
    
    if (chatUser) {
      console.log('LiveChatWidget: User loaded', {
        id: chatUser.id,
        fullName: chatUser.fullName,
        email: chatUser.email,
        conversationId,
        isGuest: !!guestInfo
      })
    } else {
      console.log('LiveChatWidget: No user or guest info')
    }
  }, [chatUser, conversationId, guestInfo, user])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load existing conversation when chat opens
  useEffect(() => {
    if (isOpen && chatUser) {
      loadConversation()
      // Poll for new messages every 3 seconds when chat is open
      const interval = setInterval(loadConversation, 3000)
      return () => clearInterval(interval)
    }
  }, [isOpen, chatUser])



  // Poll for new messages when chat is closed (for unread count)
  useEffect(() => {
    if (chatUser) {
      // Check immediately on mount
      checkForNewMessages()
      
      if (!isOpen) {
        // Poll every 5 seconds when chat is closed
        const interval = setInterval(checkForNewMessages, 5000)
        return () => clearInterval(interval)
      }
    }
  }, [isOpen, chatUser])

  const loadConversation = async () => {
    if (!chatUser || !conversationId) return
    
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.conversation && data.conversation.messages) {
          const senderName = chatUser.fullName || (chatUser as any).fullname || chatUser.name || (chatUser as any).full_name || 'User'
          const formattedMessages = data.conversation.messages.map((msg: any) => ({
            id: msg.id,
            text: msg.message,
            sender: msg.isAdmin ? 'admin' : 'user',
            timestamp: new Date(msg.timestamp),
            senderName: msg.isAdmin ? 'Mary George' : senderName,
            delivered: msg.delivered || true,
            read: msg.read || false,
            imageData: msg.imagedata || msg.imageData
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
    if (chatUser && conversationId) {
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
    if (!chatUser || !conversationId) return
    
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.conversation && data.conversation.messages) {
          // Count unread messages FROM ADMIN (not from user)
          const unreadAdminMessages = data.conversation.messages.filter((msg: any) => 
            msg.isAdmin && !msg.read
          ).length
          setUnreadCount(unreadAdminMessages)
        }
      }
    } catch (error) {
      console.error('Failed to check for new messages:', error)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const imageData = event.target?.result as string
        setSelectedImage(imageData)
        setImageFile(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const sendImage = async () => {
    if (!selectedImage || !chatUser || !conversationId) return

    const senderName = chatUser.fullName || (chatUser as any).fullname || chatUser.name || (chatUser as any).full_name || 'User'
    const senderEmail = chatUser.email || (chatUser as any).user_email || ''

    if (!senderName || senderName === 'User' || !senderEmail) {
      toast.error('Unable to send image. Please sign out and sign in again.')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: '📷 Image',
      sender: 'user',
      timestamp: new Date(),
      senderName: senderName,
      delivered: true,
      read: false
    }

    setMessages(prev => [...prev, userMessage])
    setSelectedImage(null)
    setImageFile(null)

    const payload = {
      conversationId: conversationId,
      sender: senderName,
      message: '📷 Image',
      imageData: selectedImage,
      isAdmin: false,
      applicantName: senderName,
      applicantEmail: senderEmail
    }

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(payload)
      })

      const responseData = await response.json()

      if (response.ok) {
        toast.success('✅ Image sent to Mary George!', {
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
            color: '#fff',
            border: '2px solid #fff',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 8px 24px rgba(255, 107, 107, 0.4)',
          },
          icon: '📷',
        })
      } else {
        throw new Error(responseData.error || 'Failed to send image')
      }
    } catch (error) {
      console.error('Failed to send image:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send image. Please try again.'
      toast.error(errorMessage)
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id))
    }
  }

  const sendMessage = async () => {
    console.log('=== SEND MESSAGE DEBUG ===')
    console.log('inputText:', inputText)
    console.log('chatUser:', chatUser)
    console.log('conversationId:', conversationId)
    console.log('user prop:', user)
    console.log('guestInfo prop:', guestInfo)
    
    if (!inputText.trim() || !chatUser || !conversationId) {
      console.error('Cannot send message:', { 
        hasInput: !!inputText.trim(), 
        hasChatUser: !!chatUser, 
        hasConversationId: !!conversationId,
        chatUser 
      })
      if (!conversationId) {
        toast.error('Unable to start conversation. Please refresh the page.')
      } else if (!chatUser) {
        toast.error('Please sign in or submit an application first to chat.')
      }
      return
    }

    // Get fullName and email with fallbacks - check both camelCase and lowercase
    const senderName = chatUser.fullName || (chatUser as any).fullname || chatUser.name || (chatUser as any).full_name || 'User'
    const senderEmail = chatUser.email || (chatUser as any).user_email || ''
    
    console.log('Extracted sender info:', { senderName, senderEmail })

    // Validate we have at least a name and email
    if (!senderName || senderName === 'User' || !senderEmail) {
      console.error('User object missing required fields:', chatUser)
      console.error('senderName:', senderName)
      console.error('senderEmail:', senderEmail)
      toast.error('Unable to send message. Please sign out and sign in again.')
      return
    }

    const messageText = inputText
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      senderName: senderName,
      delivered: true,
      read: false
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')

    const payload = {
      conversationId: conversationId,
      sender: senderName,
      message: messageText,
      isAdmin: false,
      applicantName: senderName,
      applicantEmail: senderEmail
    }

    console.log('Sending message with payload:', payload)

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(payload)
      })

      const responseData = await response.json()
      console.log('Server response:', responseData)

      if (response.ok) {
        console.log('Message sent successfully')
        toast.success('✅ Message sent to Mary George!', {
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
            color: '#fff',
            border: '2px solid #fff',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 8px 24px rgba(255, 107, 107, 0.4)',
          },
          icon: '✅',
        })
      } else {
        console.error('Server error:', responseData)
        const errorMsg = responseData.error || responseData.message || 'Failed to send message'
        console.error('Error message:', errorMsg)
        if (responseData.details) {
          console.error('Error details:', responseData.details)
        }
        throw new Error(errorMsg)
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
      if (chatUser && conversationId) {
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
  }, [chatUser, conversationId])

  if (!chatUser) {
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

      {/* Chat Window - Beautiful White Background - Responsive */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 md:bottom-24 right-2 md:right-6 z-40 w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] md:w-96 h-[500px] sm:h-[550px] bg-white/98 backdrop-blur-xl rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-gray-200"
          >
            {/* Chat Header */}
            <div className="bg-coral-gradient p-3 sm:p-4 text-white flex justify-between items-center flex-shrink-0">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base truncate">Chat with Mary George</h3>
                <p className="text-xs sm:text-sm opacity-90 flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                  <span className="truncate">{isConnected ? 'Connected' : 'Connecting...'}</span>
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 text-2xl ml-2 flex-shrink-0"
              >
                ×
              </button>
            </div>

            {/* Messages - White Background */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-gray-50 to-white flex flex-col">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8 flex items-center justify-center h-full">
                  <div>
                    <div className="text-4xl mb-2">👋</div>
                    <p className="font-medium text-sm sm:text-base">Start a conversation with Mary George!</p>
                    <p className="text-xs sm:text-sm mt-2">She'll respond as soon as possible.</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-xs px-3 py-2 rounded-lg text-xs sm:text-sm shadow-md ${
                      message.sender === 'user'
                        ? 'bg-coral-gradient text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`font-semibold text-xs ${message.sender === 'user' ? 'text-white' : 'text-coral-600'} truncate`}>
                        {message.senderName}
                      </span>
                      <span className={`text-xs whitespace-nowrap ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {message.text.includes('📷') ? (
                      <div className="mt-2">
                        <p className="text-xs mb-2">{message.text}</p>
                        {((message as any).imageData || (message as any).imagedata) && (
                          <img 
                            src={(message as any).imageData || (message as any).imagedata} 
                            alt="Chat image" 
                            className="max-w-full rounded-lg max-h-64 object-cover"
                          />
                        )}
                      </div>
                    ) : (
                      <p className="break-words">{message.text}</p>
                    )}
                    
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
                </>
              )}
            </div>

            {/* Input - White Background */}
            <div className="p-3 sm:p-4 border-t border-gray-200 bg-white flex-shrink-0">
              {/* Image Preview */}
              {selectedImage && (
                <div className="mb-3 relative">
                  <img 
                    src={selectedImage} 
                    alt="Preview" 
                    className="max-w-full max-h-32 rounded-lg object-cover"
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null)
                      setImageFile(null)
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
              
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type message..."
                  className="flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm border-2 border-gray-300 focus:border-coral-500 focus:outline-none bg-white text-gray-900 placeholder-gray-500"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Upload image"
                >
                  📷
                </motion.button>
                <motion.button
                  onClick={selectedImage ? sendImage : sendMessage}
                  disabled={!inputText.trim() && !selectedImage}
                  className="btn-coral px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {selectedImage ? 'Send' : 'Send'}
                </motion.button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Direct message to Mary George
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}