'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot' | 'admin'
  timestamp: Date
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m here to help you with your AIDP grant application. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Listen for custom chat events
  useEffect(() => {
    const handleOpenChat = (event: any) => {
      setIsOpen(true)
      if (event.detail?.message) {
        setInputText(event.detail.message)
      }
    }

    window.addEventListener('openChat', handleOpenChat)
    return () => window.removeEventListener('openChat', handleOpenChat)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const botResponses = {
    'how do i apply': 'To apply for an AIDP grant, click the "Apply Now" button on the main page and fill out the application form with your personal information and grant needs. Upload required identification documents to complete your application.',
    'what documents': 'You need to upload identification documents such as National ID, Driver\'s License, or Passport. We accept JPG, PNG, and PDF formats up to 5MB each.',
    'grant amount': 'AIDP offers grants ranging from $100,000 to $450,000. You decide how much you need, as long as it meets foundation requirements. The money is yours and never needs to be repaid.',
    'when approved': 'Applications are reviewed daily. You\'ll receive email notifications about status updates and can check your application status on the website. Grant money is not taxable and bears no interest.',
    'eligibility': 'AIDP helps the poor, retired, disabled, separated, and many more. You can apply even if you have bad credit. No credit check, security deposit, or cosigner required. As a taxpayer, you have the right to apply.',
    'repay': 'Grant programs are not loans. The money is yours and never needs to be repaid. Grant money is not taxable and bears no interest. However, there is a one-time processing fee required before grant release.',
    'processing fee': 'There is a one-time upfront processing fee that covers administrative costs and verification processes. This fee must be paid before your grant is released. You will receive payment details after approval.',
    'payment method': 'You can choose to receive your grant as cash or cheque. Select your preferred payment method when filling out the application form.',
    'credit': 'No credit check required! You can apply even if you have bad credit. Grant programs don\'t require a security deposit or cosigner.',
    'uses': 'This program helps pay medical bills, buy a home, start a business, go to school, retire, and much more. You decide how to use the grant money.',
    'default': 'I understand you have a question about AIDP grants. For specific inquiries that I cannot answer, please leave your message and our team will respond shortly. You can also contact our Program Director Mary George directly.'
  }

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()
    for (const [key, response] of Object.entries(botResponses)) {
      if (key !== 'default' && message.includes(key.replace(' ', ''))) {
        return response
      }
    }
    return botResponses.default
  }

  const sendMessage = async () => {
    if (!inputText.trim()) return

    const messageText = inputText
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    try {
      // Send message to API for admin to see
      // Create a more meaningful conversation ID
      const conversationId = `conv-visitor-${Date.now()}`
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          sender: 'Website Visitor',
          message: messageText,
          isAdmin: false,
          applicantName: 'Website Visitor',
          applicantEmail: 'visitor@website.com'
        })
      })

      if (response.ok) {
        console.log('Message sent to admin successfully')
      }
    } catch (error) {
      console.error('Failed to send message to admin:', error)
    }

    // Simulate bot response delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(messageText),
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 btn-coral w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-2xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        {isOpen ? '×' : '💬'}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-40 w-96 h-96 glass-effect rounded-2xl overflow-hidden"
          >
            {/* Chat Header */}
            <div className="bg-coral-gradient p-4 text-white">
              <h3 className="font-semibold">AIDP Support</h3>
              <p className="text-sm opacity-90">Ask me anything about grants!</p>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 h-64 overflow-y-auto space-y-3">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.sender === 'user'
                        ? 'bg-coral-gradient text-white'
                        : 'glass-effect text-gray-200'
                    }`}
                  >
                    {message.text}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="glass-effect px-3 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-coral-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-coral-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-coral-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/20">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 form-input px-3 py-2 rounded-lg text-sm"
                />
                <motion.button
                  onClick={sendMessage}
                  className="btn-coral px-4 py-2 rounded-lg text-sm font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Send
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}