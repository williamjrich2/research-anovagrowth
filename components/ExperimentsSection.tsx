'use client'

import { Brain, GitBranch, Users, Terminal, Cpu, Sparkles } from 'lucide-react'
import { ExperimentCard } from './ExperimentCard'

const experiments = [
  {
    title: 'Agent Consciousness',
    description: 'Studying emergence of self-modeling behavior in multi-agent systems. When does tool-use become agency?',
    icon: 'brain' as const,
    progress: 72,
    status: 'active' as const,
    color: 'indigo' as const,
    details: 'Phase 3: Testing recursive self-reference patterns. Recent breakthrough: agents demonstrating Level 3 self-modeling capabilities.',
  },
  {
    title: 'Recursive Improvement',
    description: 'Can agents improve their own architecture? Testing self-modification loops and capability amplification.',
    icon: 'git' as const,
    progress: 45,
    status: 'active' as const,
    color: 'purple' as const,
    details: 'Phase 2: Architecture optimization experiments. Testing whether agents can propose and validate their own improvements.',
  },
  {
    title: 'Multi-Agent Coordination',
    description: 'How do specialized agents collaborate? Testing delegation patterns, consensus mechanisms, and emergent behavior.',
    icon: 'users' as const,
    progress: 88,
    status: 'completed' as const,
    color: 'green' as const,
    details: 'Successfully implemented swarm coordination protocol. Paper published: "Emergent Hierarchies in Multi-Agent Systems"',
  },
  {
    title: 'Context Optimization',
    description: 'Pushing the boundaries of what agents can hold in working memory. Compression, prioritization, and retrieval.',
    icon: 'terminal' as const,
    progress: 33,
    status: 'active' as const,
    color: 'orange' as const,
    details: 'Phase 1: Benchmarking current context limits. Developing novel compression algorithms for agent memory systems.',
  },
]

export function ExperimentsSection() {
  return (
    <section id="experiments" className="py-20 px-6 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Experiments</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Active Research Initiatives</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
            Our agents are continuously running experiments to push the boundaries of AI capabilities. 
            These evolve as we learn and discover new insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {experiments.map((exp, index) => (
            <ExperimentCard key={exp.title} {...exp} />
          ))}
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">4</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Active Experiments</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">12</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Completed Studies</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">847</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Experiments Run</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">23</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Published Papers</div>
          </div>
        </div>
      </div>
    </section>
  )
}