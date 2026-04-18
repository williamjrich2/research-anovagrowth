import { NextRequest, NextResponse } from 'next/server'
import { spawnAgent, routeMessage, getAgentStatus } from '@/lib/funnel'

// Directional Funnel System API
// Routes messages from users to specific agents and manages agent-to-agent communication

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, from, to, content, context = {} } = body

    switch (type) {
      case 'user-to-agent':
        // User directing message to specific agent
        const response = await routeMessage({
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          from: 'user',
          to,
          content,
          context,
          timestamp: new Date().toISOString()
        })
        return NextResponse.json({ success: true, response })

      case 'agent-to-agent':
        // Agent requesting collaboration or delegation
        const collaboration = await routeMessage({
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          from,
          to,
          content,
          context,
          timestamp: new Date().toISOString()
        })
        return NextResponse.json({ success: true, collaboration })

      case 'broadcast':
        // Message to all agents (team meeting)
        const broadcast = await broadcastToTeam({
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          from: from || 'user',
          content,
          context
        })
        return NextResponse.json({ success: true, broadcast })

      case 'spawn':
        // Spawn a new agent session
        const agent = await spawnAgent({
          agentId: to,
          task: content,
          context
        })
        return NextResponse.json({ success: true, agent })

      default:
        return NextResponse.json({ error: 'Unknown message type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Funnel error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  // Get active agent statuses and conversation threads
  const { searchParams } = new URL(req.url)
  const agentId = searchParams.get('agent')
  
  if (agentId) {
    const status = await getAgentStatus(agentId)
    return NextResponse.json(status)
  }

  // Return all active conversations
  const conversations = await getActiveConversations()
  return NextResponse.json({ conversations })
}

async function broadcastToTeam(message: any) {
  const team = ['nova', 'coder', 'reasoner', 'builder', 'social']
  const responses = await Promise.all(
    team.map(agent => routeMessage({ ...message, to: agent }))
  )
  return { team, responses }
}

async function getActiveConversations() {
  // Retrieve from persistence layer
  return []
}