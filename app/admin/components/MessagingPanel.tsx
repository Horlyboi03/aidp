'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

interface Message {
  id: string
  sender: string
  message: string
  timestamp: Date
  isAdmin: boolean
  delivered?: boolean
  read?: boolean
  imagedata?: string
  imageData?: string
}

interface Conversation {
  id: string
  applicantName: string
  applicantEmail?: string
  lastMessage: string
  unreadCount: number
  messages: Message[]
}

interface MessagingPanelProps {
  onUnreadCountChange?: (count: number) => void
}

export default function MessagingPanel({ onUnreadCountChange }: MessagingPanelProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [lastMessageCount, setLastMessageCount] = useState(0)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load real conversations from API
  const loadConversations = async () => {
    try {
      const response = await fetch('/api/messages')
      if (response.ok) {
        const data = await response.json()
        if (data.conversations && Array.isArray(data.conversations)) {
          const totalMessages = data.conversations.reduce((sum: number, conv: Conversation) => sum + conv.messages.length, 0)
          
          // Play notification sound if there are new messages
          if (lastMessageCount > 0 && totalMessages > lastMessageCount) {
            // Simple notification sound (you can replace with actual audio file)
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
            audio.volume = 0.3
            audio.play().catch(() => {}) // Ignore errors if audio can't play
          }
          
          setConversations(data.conversations)
          setLastMessageCount(totalMessages)
          console.log('Loaded conversations:', data.conversations.length)
          
          // Notify parent about unread count
          const totalUnread = data.conversations.reduce((sum: number, conv: Conversation) => sum + conv.unreadCount, 0)
          if (onUnreadCountChange) {
            onUnreadCountChange(totalUnread)
          }
        } else {
          setConversations([])
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
      setConversations([])
    }
  }

  useEffect(() => {
    loadConversations()
    
    // Poll for new messages every 10 seconds
    const interval = setInterval(loadConversations, 10000)
    return () => clearInterval(interval)
  }, [])

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedImage || !selectedConversation) return

    const messageText = newMessage || '📷 Image'
    setNewMessage('')

    // Create temporary message for immediate UI update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      sender: 'Admin',
      message: messageText,
      imageData: selectedImage || undefined,
      timestamp: new Date(),
      isAdmin: true,
      delivered: true,
      read: false
    }

    // Update local state immediately for better UX
    setConversations(prev =>
      prev.map(conv =>
        conv.id === selectedConversation.id
          ? {
              ...conv,
              messages: [...conv.messages, tempMessage],
              lastMessage: messageText,
              unreadCount: 0
            }
          : conv
      )
    )

    setSelectedConversation(prev =>
      prev ? { 
        ...prev, 
        messages: [...prev.messages, tempMessage],
        lastMessage: messageText 
      } : null
    )

    try {
      // Send to API
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          sender: 'Admin',
          message: messageText,
          imageData: selectedImage || undefined,
          isAdmin: true,
          applicantName: selectedConversation.applicantName,
          applicantEmail: selectedConversation.applicantEmail || ''
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Admin message sent successfully:', result)
        setSelectedImage(null)
        setImageFile(null)
        
        // Update with real message from server
        if (result.conversation) {
          setConversations(prev =>
            prev.map(conv =>
              conv.id === selectedConversation.id
                ? {
                    ...conv,
                    messages: result.conversation.messages,
                    lastMessage: result.conversation.lastMessage,
                    unreadCount: result.conversation.unreadCount
                  }
                : conv
            )
          )
          
          setSelectedConversation(prev =>
            prev ? {
              ...prev,
              messages: result.conversation.messages,
              lastMessage: result.conversation.lastMessage
            } : null
          )
        }
      } else {
        console.error('Failed to send admin message')
        // Revert the optimistic update on failure
        setConversations(prev =>
          prev.map(conv =>
            conv.id === selectedConversation.id
              ? {
                  ...conv,
                  messages: conv.messages.filter(m => m.id !== tempMessage.id)
                }
              : conv
          )
        )
      }
    } catch (error) {
      console.error('Failed to send admin message:', error)
      // Revert the optimistic update on failure
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation.id
            ? {
                ...conv,
                messages: conv.messages.filter(m => m.id !== tempMessage.id)
              }
            : conv
        )
      )
    }
  }

  const markAsRead = async (conversationId: string) => {
    try {
      // Mark as read on server
      const response = await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          markAsRead: true
        })
      })

      if (response.ok) {
        // Update local state immediately
        setConversations(prev =>
          prev.map(conv =>
            conv.id === conversationId 
              ? { 
                  ...conv, 
                  unreadCount: 0,
                  messages: conv.messages.map(msg => ({ ...msg, read: true }))
                } 
              : conv
          )
        )

        // Update selected conversation if it's the one being marked as read
        if (selectedConversation && selectedConversation.id === conversationId) {
          setSelectedConversation(prev => 
            prev ? {
              ...prev,
              unreadCount: 0,
              messages: prev.messages.map(msg => ({ ...msg, read: true }))
            } : null
          )
        }

        // Refresh conversations to get updated counts
        setTimeout(() => {
          loadConversations()
          // Also immediately notify parent of the change
          if (onUnreadCountChange) {
            const newTotalUnread = conversations.reduce((sum, conv) => 
              conv.id === conversationId ? sum : sum + conv.unreadCount, 0
            )
            onUnreadCountChange(newTotalUnread)
          }
        }, 500)
      }
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
    }
  }

  return (
    <div className="glass-effect rounded-2xl overflow-hidden h-[600px] sm:h-[700px] flex flex-col md:flex-row">
      {/* Conversations List - Responsive */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} md:flex w-full md:w-1/3 border-r border-white/20 p-2 sm:p-4 flex-col`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-white">Live Chat</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">Real-time</span>
          </div>
        </div>
        
        {conversations.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-gray-400 text-sm">No conversations yet</p>
            <p className="text-gray-500 text-xs mt-1">Users will appear here when they start chatting</p>
          </div>
        ) : (
          <div className="space-y-2 flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <motion.div
                key={conv.id}
                onClick={() => {
                  setSelectedConversation(conv)
                  markAsRead(conv.id)
                }}
                className={`p-2 sm:p-3 rounded-lg cursor-pointer transition-all ${
                  selectedConversation?.id === conv.id
                    ? 'bg-coral-500/20 border border-coral-400'
                    : 'hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-white font-medium text-sm sm:text-base flex items-center truncate">
                    {conv.applicantName}
                    {conv.unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-2 w-2 h-2 bg-coral-400 rounded-full flex-shrink-0"
                      />
                    )}
                  </h4>
                  {conv.unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-coral-500 text-white text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0"
                    >
                      {conv.unreadCount}
                    </motion.span>
                  )}
                </div>
                <p className="text-gray-400 text-xs sm:text-sm truncate">{conv.lastMessage}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {new Date(conv.messages[conv.messages.length - 1]?.timestamp || Date.now()).toLocaleString()}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Area - Responsive */}
      <div className="flex-1 flex flex-col w-full">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-2 sm:p-4 border-b border-white/20 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                {selectedConversation.applicantName}
              </h3>
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Messages - Responsive */}
            <div className="flex-1 p-2 sm:p-4 overflow-y-auto space-y-3" style={{ maxHeight: 'calc(100% - 120px)' }}>
              {selectedConversation.messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-xs px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm ${
                      message.isAdmin
                        ? 'bg-coral-gradient text-white'
                        : 'glass-effect text-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-xs truncate">
                        {message.isAdmin ? 'Mary George' : message.sender}
                      </span>
                      <span className="text-xs opacity-70 whitespace-nowrap">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {message.message.includes('📷') ? (
                      <div className="mt-2">
                        <p className="text-xs mb-2">{message.message}</p>
                        {(message.imageData || message.imagedata) && (
                          <img 
                            src={message.imageData || message.imagedata} 
                            alt="Chat image" 
                            className="max-w-full rounded-lg max-h-64 object-cover"
                          />
                        )}
                      </div>
                    ) : (
                      <p className="break-words">{message.message}</p>
                    )}
                    
                    {/* Message Status for Admin Messages */}
                    {message.isAdmin && (
                      <div className="flex justify-end mt-1">
                        {message.delivered && (
                          <span className={`text-xs ${message.read ? 'text-blue-300' : 'text-gray-300'}`}>
                            {message.read ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Message Input - Responsive */}
            <div className="p-2 sm:p-4 border-t border-white/20">
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
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type message..."
                  className="flex-1 form-input px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error('Image size must be less than 5MB')
                        return
                      }
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
                  }}
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
                  onClick={sendMessage}
                  disabled={!newMessage.trim() && !selectedImage}
                  className="btn-coral px-3 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-semibold flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Send
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-400 text-sm sm:text-base">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}