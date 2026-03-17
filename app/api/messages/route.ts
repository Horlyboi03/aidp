import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export interface Message {
  id: string
  conversationId: string
  sender: string
  message: string
  timestamp: string
  isAdmin: boolean
  read: boolean
  delivered: boolean
}

export interface Conversation {
  id: string
  applicantName: string
  applicantEmail: string
  lastMessage: string
  unreadCount: number
  messages: Message[]
  createdAt: string
}

// File-based storage for demo purposes
const dataFile = path.join(process.cwd(), 'data', 'conversations.json')

function loadConversations(): Conversation[] {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(dataFile)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Load existing data
    if (fs.existsSync(dataFile)) {
      const data = fs.readFileSync(dataFile, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error loading conversations:', error)
    return []
  }
}

function saveConversations(conversations: Conversation[]): void {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(conversations, null, 2))
    console.log('Saved', conversations.length, 'conversations to file')
  } catch (error) {
    console.error('Error saving conversations:', error)
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get('conversationId')
  
  const conversations = loadConversations()
  
  if (conversationId) {
    // Get specific conversation
    const conversation = conversations.find(c => c.id === conversationId)
    return NextResponse.json({ conversation })
  }
  
  // Get all conversations
  return NextResponse.json({ conversations })
}

export async function POST(request: NextRequest) {
  try {
    const { conversationId, sender, message, isAdmin, applicantName, applicantEmail } = await request.json()
    
    let conversations = loadConversations()
    let conversation = conversations.find(c => c.id === conversationId)
    
    if (!conversation) {
      // Create new conversation
      conversation = {
        id: conversationId,
        applicantName: applicantName || sender,
        applicantEmail: applicantEmail || '',
        lastMessage: message,
        unreadCount: isAdmin ? 0 : 1,
        messages: [],
        createdAt: new Date().toISOString()
      }
      conversations.push(conversation)
    }
    
    // Add new message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      sender,
      message,
      timestamp: new Date().toISOString(),
      isAdmin,
      read: false,
      delivered: true // Messages are delivered immediately when sent
    }
    
    conversation.messages.push(newMessage)
    conversation.lastMessage = message
    
    // Update unread count
    if (isAdmin) {
      // Admin sent message, reset unread count for admin
      conversation.unreadCount = 0
    } else {
      // User sent message, increment unread count for admin
      conversation.unreadCount = conversation.messages.filter(m => !m.isAdmin && !m.read).length
    }
    
    saveConversations(conversations)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully',
      conversation 
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to send message' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { conversationId, markAsRead, markAdminMessagesAsRead } = await request.json()
    
    let conversations = loadConversations()
    const conversation = conversations.find(c => c.id === conversationId)
    
    if (conversation) {
      if (markAsRead) {
        // Mark all user messages as read (admin reading user messages)
        conversation.messages.forEach(m => {
          if (!m.isAdmin) {
            m.read = true
          }
        })
        conversation.unreadCount = 0
      }
      
      if (markAdminMessagesAsRead) {
        // Mark all admin messages as read (user reading admin messages)
        conversation.messages.forEach(m => {
          if (m.isAdmin) {
            m.read = true
          }
        })
      }
      
      saveConversations(conversations)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update conversation' },
      { status: 500 }
    )
  }
}