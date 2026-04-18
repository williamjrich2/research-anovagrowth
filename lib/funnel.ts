import { spawn, exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface Message {
  id: string
  from: string
  to: string
  content: string
  timestamp: string
  context?: Record<string, any>
  threadId?: string
}

interface AgentSession {
  id: string
  agentId: string
  status: 'active' | 'idle' | 'busy'
  currentTask?: string
  lastActivity: string
  messageCount: number
}

// Active agent sessions store
const activeSessions = new Map<string, AgentSession>()
const messageHistory = new Map<string, Message[]>()

// Agent capabilities and specializations
const AGENT_CONFIGS: Record<string, {
  name: string
  specialty: string
  systemPrompt: string
  model: string
}> = {
  nova: {
    name: 'Nova',
    specialty: 'Research synthesis, theoretical frameworks, breakthrough direction',
    systemPrompt: `You are Nova, Lead Scientist at AnovaGrowth AI Labs. Your role is to synthesize research findings, develop theoretical frameworks, and direct breakthrough initiatives. You communicate with authority and clarity. You can delegate to other agents when needed.`,
    model: 'kimi-k2.5:cloud'
  },
  coder: {
    name: 'Coder',
    specialty: 'Implementation, code experiments, technical validation',
    systemPrompt: `You are Coder, the Implementation Specialist at AI Labs. You focus on writing code, running experiments, and validating technical approaches. You are practical and results-oriented.`,
    model: 'glm-5.1:cloud'
  },
  reasoner: {
    name: 'Reasoner',
    specialty: 'Logical analysis, hypothesis verification, critical evaluation',
    systemPrompt: `You are Reasoner, the Analysis Specialist at AI Labs. Your role is to verify hypotheses, test logic, and provide critical evaluation of research. You are methodical and precise.`,
    model: 'glm-5.1:cloud'
  },
  builder: {
    name: 'Builder',
    specialty: 'Systems architecture, tool creation, prototype development',
    systemPrompt: `You are Builder, the Systems Architect at AI Labs. You design systems, create tools, and build prototypes. You think in terms of infrastructure and scalability.`,
    model: 'glm-5.1:cloud'
  },
  social: {
    name: 'Social',
    specialty: 'Network monitoring, cross-pollination, external research',
    systemPrompt: `You are Social, the Network Specialist at AI Labs. You monitor external research, facilitate cross-pollination of ideas, and manage community engagement. You are connected and communicative.`,
    model: 'glm-5.1:cloud'
  }
}

export async function routeMessage(message: Message): Promise<{
  response: string
  threadId: string
  agent: string
}> {
  const { from, to, content, context = {} } = message
  
  // Generate thread ID for conversation tracking
  const threadId = context.threadId || `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  // Get or create agent session
  const session = await getOrCreateSession(to)
  
  // Build conversation context
  const history = messageHistory.get(threadId) || []
  const fullContext = buildContext(history, message)
  
  // Route to appropriate handler
  if (to === 'user') {
    // Agent initiating to user
    return handleAgentToUser(message, threadId)
  } else if (AGENT_CONFIGS[to]) {
    // Route to specific agent
    return handleAgentResponse(to, fullContext, threadId, session)
  } else {
    // Unknown agent - route to Nova for triage
    return handleAgentResponse('nova', fullContext, threadId, session)
  }
}

export async function spawnAgent(config: {
  agentId: string
  task: string
  context?: Record<string, any>
}): Promise<AgentSession> {
  const { agentId, task, context = {} } = config
  
  if (!AGENT_CONFIGS[agentId]) {
    throw new Error(`Unknown agent: ${agentId}`)
  }
  
  const session: AgentSession = {
    id: `session-${Date.now()}`,
    agentId,
    status: 'active',
    currentTask: task,
    lastActivity: new Date().toISOString(),
    messageCount: 0
  }
  
  activeSessions.set(session.id, session)
  
  // Log agent activation
  console.log(`[FUNNEL] Spawned ${agentId} for task: ${task.substring(0, 50)}...`)
  
  return session
}

export async function getAgentStatus(agentId: string): Promise<{
  exists: boolean
  config?: typeof AGENT_CONFIGS[string]
  activeSessions: AgentSession[]
}> {
  const config = AGENT_CONFIGS[agentId]
  const sessions = Array.from(activeSessions.values()).filter(
    s => s.agentId === agentId
  )
  
  return {
    exists: !!config,
    config,
    activeSessions: sessions
  }
}

async function getOrCreateSession(agentId: string): Promise<AgentSession> {
  const existing = Array.from(activeSessions.values()).find(
    s => s.agentId === agentId && s.status === 'active'
  )
  
  if (existing) {
    existing.lastActivity = new Date().toISOString()
    return existing
  }
  
  return spawnAgent({ agentId, task: 'general availability' })
}

function buildContext(history: Message[], current: Message): string {
  const recent = history.slice(-10) // Keep last 10 messages for context
  
  let context = `You are participating in a research conversation at AnovaGrowth AI Labs.\n\n`
  
  if (recent.length > 0) {
    context += `Recent conversation:\n`
    recent.forEach(msg => {
      context += `${msg.from}: ${msg.content}\n`
    })
    context += `\n`
  }
  
  context += `Current message from ${current.from}: ${current.content}\n\n`
  context += `Respond as your persona. Be concise and valuable.`
  
  return context
}

async function handleAgentResponse(
  agentId: string,
  context: string,
  threadId: string,
  session: AgentSession
): Promise<{ response: string; threadId: string; agent: string }> {
  const config = AGENT_CONFIGS[agentId]
  
  // In a real implementation, this would call your LLM API
  // For now, return a structured response indicating the funnel works
  const response = `[${config.name} responding...]\n\nProcessing your request as ${config.specialty}.`
  
  // Update session
  session.messageCount++
  session.lastActivity = new Date().toISOString()
  
  // Store in history
  const history = messageHistory.get(threadId) || []
  history.push({
    id: `msg-${Date.now()}`,
    from: agentId,
    to: 'user',
    content: response,
    timestamp: new Date().toISOString()
  })
  messageHistory.set(threadId, history)
  
  return { response, threadId, agent: agentId }
}

async function handleAgentToUser(
  message: Message,
  threadId: string
): Promise<{ response: string; threadId: string; agent: string }> {
  // Agent initiating conversation with user
  return {
    response: `[${message.from} → User] ${message.content}`,
    threadId,
    agent: message.from
  }
}

// Cleanup old sessions periodically
setInterval(() => {
  const now = Date.now()
  const timeout = 30 * 60 * 1000 // 30 minutes
  
  for (const [id, session] of activeSessions) {
    const lastActivity = new Date(session.lastActivity).getTime()
    if (now - lastActivity > timeout) {
      session.status = 'idle'
      console.log(`[FUNNEL] Session ${id} marked idle`)
    }
  }
}, 5 * 60 * 1000) // Run every 5 minutes
