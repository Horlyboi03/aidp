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
    console.log('=== Messages POST: Starting ===')
    
    // Parse request body
    let body
    try {
      body = await request.json()
      console.log('Messages POST: Body received:', JSON.stringify(body, null, 2))
    } catch (parseError) {
      console.error('Messages POST: Failed to parse JSON body:', parseError)
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in request body', error: parseError instanceof Error ? parseError.message : 'Parse error' },
        { status: 400 }
      )
    }
    
    const { conversationId, sender, message, isAdmin, applicantName, applicantEmail } = body
    
    // Validate required fields
    if (!conversationId || !sender || !message) {
      console.error('Messages POST: Missing required fields', { conversationId, sender, message })
      return NextResponse.json(
        { success: false, message: 'Missing required fields: conversationId, sender, and message are required' },
        { status: 400 }
      )
    }
    
    console.log('Messages POST: Getting conversation:', conversationId)
    let conversation
    try {
      conversation = await getConversationById(conversationId) as any
      console.log('Messages POST: Existing conversation:', conversation ? 'Found' : 'Not found')
    } catch (dbError) {
      console.error('Messages POST: Database error getting conversation:', dbError)
      return NextResponse.json(
        { success: false, message: 'Database error retrieving conversation', error: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      )
    }
    
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
      
      try {
        await saveConversation(conversation)
        console.log('Messages POST: New conversation created successfully')
      } catch (saveError) {
        console.error('Messages POST: Failed to save new conversation:', saveError)
        return NextResponse.json(
          { success: false, message: 'Failed to create conversation', error: saveError instanceof Error ? saveError.message : 'Unknown error' },
          { status: 500 }
        )
      }
    } else {
      // Update existing conversation
      console.log('Messages POST: Updating existing conversation')
      conversation.lastMessage = message
      conversation.lastMessageAt = new Date().toISOString()
      if (!isAdmin) {
        conversation.unreadCount = (conversation.unreadCount || 0) + 1
      }
      
      try {
        await saveConversation(conversation)
        console.log('Messages POST: Conversation updated successfully')
      } catch (updateError) {
        console.error('Messages POST: Failed to update conversation:', updateError)
        return NextResponse.json(
          { success: false, message: 'Failed to update conversation', error: updateError instanceof Error ? updateError.message : 'Unknown error' },
          { status: 500 }
        )
      }
    }
    
    // Add new message
    console.log('Messages POST: Saving message')
    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      sender,
      message,
      timestamp: new Date().toISOString(),
      isAdmin: isAdmin || false,
      read: false,
      delivered: true
    }
    
    try {
      await saveMessage(newMessage)
      console.log('Messages POST: Message saved successfully')
    } catch (msgError) {
      console.error('Messages POST: Failed to save message:', msgError)
      return NextResponse.json(
        { success: false, message: 'Failed to save message', error: msgError instanceof Error ? msgError.message : 'Unknown error' },
        { status: 500 }
      )
    }
    
    // Get all messages for this conversation
    console.log('Messages POST: Retrieving all messages')
    let messages
    try {
      messages = await getMessagesByConversationId(conversationId)
      console.log('Messages POST: Retrieved messages count:', messages.length)
    } catch (retrieveError) {
      console.error('Messages POST: Failed to retrieve messages:', retrieveError)
      // Don't fail the request if we can't retrieve messages
      messages = [newMessage]
    }
    
    console.log('=== Messages POST: Success ===')
    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully',
      conversation: {
        ...conversation,
        messages
      }
    })
  } catch (error) {
    console.error('=== Messages POST: Unexpected error ===', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error stack:', errorStack)
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send message', 
        error: errorMessage,
        details: 'Check server logs for more information'
      },
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