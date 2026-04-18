'use client'

import { useState, useEffect, useRef } from 'react'
import { FlaskConical, Send, Users, Bot, Sparkles, X } from 'lucide-react'
import Link from 'next/link'

interface Agent {
  id: string
  name: string
  role: string
  avatar: string
  color: string
  status: 'online' | 'busy' | 'offline'
  specialty: string
}

interface Message {
  id: string
  from: string
  to: string
  content: string
  timestamp: string
  type: 'user' | 'agent' | 'system'
}

const AGENTS: Agent[] = [
  { id: 'nova', name: 'Nova', role: 'Lead Scientist', avatar: '/avatars/nova.png', color: '#6366f1', status: 'online', specialty: 'Research synthesis & breakthrough direction' },
  { id: 'coder', name: 'Coder', role: 'Implementation', avatar: '/avatars/coder.png', color: '#f59e0b', status: 'online', specialty: 'Code experiments & technical validation' },
  { id: 'reasoner', name: 'Reasoner', role: 'Analysis', avatar: '/avatars/reasoner.png', color: '#8b5cf6', status: 'online', specialty: 'Logical verification & hypothesis testing' },
  { id: 'builder', name: 'Builder', role: 'Systems', avatar: '/avatars/builder.png', color: '#10b981', status: 'online', specialty: 'Tool creation & system architecture' },
  { id: 'social', name: 'Social', role: 'Network', avatar: '/avatars/social.png', color: '#3b82f6', status: 'online', specialty: 'Cross-pollination & external research' },
]

export default function LabPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent>(AGENTS[0])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      from: 'user',
      to: selectedAgent.id,
      content: input,
      timestamp: new Date().toISOString(),
      type: 'user'
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      // Call funnel API
      const res = await fetch('/api/funnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'user-to-agent',
          to: selectedAgent.id,
          content: input,
          context: { threadId: 'lab-session' }
        })
      })

      const data = await res.json()
      
      if (data.success) {
        const agentMsg: Message = {
          id: (Date.now() + 1).toString(),
          from: selectedAgent.id,
          to: 'user',
          content: data.response.response,
          timestamp: new Date().toISOString(),
          type: 'agent'
        }
        setMessages(prev => [...prev, agentMsg])
      }
    } catch (error) {
      console.error('Funnel error:', error)
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        from: 'system',
        to: 'user',
        content: 'Agent temporarily unavailable. Try again shortly.',
        timestamp: new Date().toISOString(),
        type: 'system'
      }
      setMessages(prev => [...prev, errorMsg])
    }

    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-indigo-600" />
            <span className="font-semibold text-lg">AI Labs</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Lab</span>
          </Link>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-700">5 agents online</span>
          </div>
        </div>
      </header>

      <div className="pt-16 flex h-[calc(100vh-64px)]">
        {/* Agent Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>Research Team</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {AGENTS.map(agent => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${
                  selectedAgent.id === agent.id
                    ? 'bg-indigo-50 border border-indigo-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="relative">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                      agent.status === 'online' ? 'bg-green-500' :
                      agent.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{agent.name}</div>
                  <div className="text-xs text-gray-500 truncate">{agent.role}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col bg-white">
          {/* Agent Header */}
          <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
            <img
              src={selectedAgent.avatar}
              alt={selectedAgent.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-900">{selectedAgent.name}</h2>
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: `${selectedAgent.color}20`, color: selectedAgent.color }}
                >
                  {selectedAgent.role}
                </span>
              </div>
              <p className="text-sm text-gray-500">{selectedAgent.specialty}</p>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-sm text-gray-600">AI-powered</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Start collaborating with {selectedAgent.name}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Ask questions, delegate research tasks, or request analysis. 
                  {selectedAgent.name} specializes in {selectedAgent.specialty.toLowerCase()}.
                </p>
              </div>
            )}
            
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className="flex-shrink-0">
                  {msg.from === 'user' ? (
                    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-medium">
                      You
                    </div>
                  ) : msg.type === 'system' ? (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-gray-500" />
                    </div>
                  ) : (
                    <img
                      src={AGENTS.find(a => a.id === msg.from)?.avatar || selectedAgent.avatar}
                      alt={msg.from}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                </div>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                    msg.from === 'user'
                      ? 'bg-indigo-600 text-white'
                      : msg.type === 'system'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <span className="text-xs opacity-60 mt-1 block">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <img
                  src={selectedAgent.avatar}
                  alt={selectedAgent.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="max-w-4xl mx-auto flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${selectedAgent.name}...`}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  disabled={isLoading}
                />
                {input && (
                  <button
                    onClick={() => setInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
              Press Enter to send • Agents may delegate to teammates when appropriate
            </p>
          </div>
        </main>
      </div>
    </main>
  )
}
