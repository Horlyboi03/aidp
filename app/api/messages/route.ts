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
    console.log('Messages POST: Starting...')
    const body = await request.json()
    console.log('Messages POST: Body received:', body)
    
    const { conversationId, sender, message, isAdmin, applicantName, applicantEmail } = body
    
    if (!conversationId || !sender || !message) {
      console.error('Messages POST: Missing required fields')
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    console.log('Messages POST: Getting conversation:', conversationId)
    let conversation = await getConversationById(conversationId) as any
    console.log('Messages POST: Existing conversation:', conversation)
    
    if (!conversation) {
      // Create new conversation
      console.log('Messages POST: Creating new conversation')
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
      console.log('Messages POST: New conversation created')
    } else {
      // Update existing conversation
      console.log('Messages POST: Updating existing conversation')
      conversation.lastMessage = message
      conversation.lastMessageAt = new Date().toISOString()
      if (!isAdmin) {
        conversation.unreadCount = (conversation.unreadCount || 0) + 1
      }
      await saveConversation(conversation)
      console.log('Messages POST: Conversation updated')
    }
    
    // Add new message
    console.log('Messages POST: Saving message')
    const newMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      sender,
      message,
      timestamp: new Date().toISOString(),
      isAdmin: isAdmin || false,
      read: false,
      delivered: true
    }
    
    await saveMessage(newMessage)
    console.log('Messages POST: Message saved')
    
    // Get all messages for this conversation
    const messages = await getMessagesByConversationId(conversationId)
    console.log('Messages POST: Retrieved messages count:', messages.length)
    
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, message: 'Failed to send message', error: errorMessage },
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