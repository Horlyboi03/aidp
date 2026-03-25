import { NextRequest, NextResponse } from 'next/server'
import { 
  saveConversation, 
  getAllConversations, 
  getConversationById,
  saveMessage, 
  getMessagesByConversationId,
  markMessagesAsRead 
} from '../../../lib/postgres-database'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get('conversationId')
  
  if (conversationId) {
    // Get specific conversation with messages
    const conversation = await getConversationById(conversationId) as any
    if (conversation) {
      const messages = await getMessagesByConversationId(conversationId)
      return NextResponse.json({ 
        conversation: {
          ...conversation,
          messages
        }
      })
    }
    return NextResponse.json({ conversation: null })
  }
  
  // Get all conversations with their messages
  const conversations = await getAllConversations() as any[]
  const conversationsWithMessages = await Promise.all(
    conversations.map(async (conv) => ({
      ...conv,
      messages: await getMessagesByConversationId(conv.id)
    }))
  )
  
  return NextResponse.json({ conversations: conversationsWithMessages })
}

export async function POST(request: NextRequest) {
  try {
    const { conversationId, sender, message, isAdmin, applicantName, applicantEmail } = await request.json()
    
    let conversation = await getConversationById(conversationId) as any
    
    if (!conversation) {
      // Create new conversation
      conversation = {
        id: conversationId,
        applicantName: applicantName || sender,
        applicantEmail: applicantEmail || '',
        lastMessage: message,
        lastMessageAt: new Date().toISOString(),
        unreadCount: isAdmin ? 0 : 1,
        createdAt: new Date().toISOString()
      }
      await saveConversation(conversation)
    } else {
      // Update existing conversation
      conversation.lastMessage = message
      conversation.lastMessageAt = new Date().toISOString()
      if (!isAdmin) {
        conversation.unreadCount = (conversation.unreadCount || 0) + 1
      }
      await saveConversation(conversation)
    }
    
    // Add new message
    const newMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      sender,
      message,
      timestamp: new Date().toISOString(),
      isAdmin,
      read: false,
      delivered: true
    }
    
    await saveMessage(newMessage)
    
    // Get all messages for this conversation
    const messages = await getMessagesByConversationId(conversationId)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully',
      conversation: {
        ...conversation,
        messages
      }
    })
  } catch (error) {
    console.error('Message send error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send message' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { conversationId, markAsRead, markAdminMessagesAsRead } = await request.json()
    
    const conversation = await getConversationById(conversationId) as any
    
    if (conversation) {
      if (markAsRead) {
        // Mark all user messages as read (admin reading user messages)
        await markMessagesAsRead(conversationId, false)
        conversation.unreadCount = 0
        await saveConversation(conversation)
      }
      
      if (markAdminMessagesAsRead) {
        // Mark all admin messages as read (user reading admin messages)
        await markMessagesAsRead(conversationId, true)
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update conversation error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update conversation' },
      { status: 500 }
    )
  }
}