'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Brain, GitBranch, Users, Terminal } from 'lucide-react'
import { useState } from 'react'

interface ExperimentCardProps {
  title: string
  description: string
  icon: 'brain' | 'git' | 'users' | 'terminal'
  progress: number
  status: 'active' | 'paused' | 'completed'
  color: 'indigo' | 'purple' | 'green' | 'orange'
  details: string
}

const icons = {
  brain: Brain,
  git: GitBranch,
  users: Users,
  terminal: Terminal,
}

const colors = {
  indigo: { bg: 'bg-indigo-50', hover: 'hover:bg-indigo-100', icon: 'text-indigo-600', glow: 'rgba(99, 102, 241, 0.15)', border: 'hover:border-indigo-300' },
  purple: { bg: 'bg-purple-50', hover: 'hover:bg-purple-100', icon: 'text-purple-600', glow: 'rgba(139, 92, 246, 0.15)', border: 'hover:border-purple-300' },
  green: { bg: 'bg-green-50', hover: 'hover:bg-green-100', icon: 'text-green-600', glow: 'rgba(16, 185, 129, 0.15)', border: 'hover:border-green-300' },
  orange: { bg: 'bg-orange-50', hover: 'hover:bg-orange-100', icon: 'text-orange-600', glow: 'rgba(249, 115, 22, 0.15)', border: 'hover:border-orange-300' },
}

const statusColors = {
  active: 'bg-green-500',
  paused: 'bg-amber-500',
  completed: 'bg-blue-500',
}

export function ExperimentCard({ title, description, icon, progress, status, color, details }: ExperimentCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const Icon = icons[icon]
  const style = colors[color]

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) / rect.width)
    y.set((e.clientY - centerY) / rect.height)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  return (
    <motion.div
      className="relative group cursor-pointer"
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 overflow-hidden"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${style.glow}, transparent 40%)`,
          }}
        />

        {/* Status indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${statusColors[status]} ${status === 'active' ? 'animate-pulse' : ''}`} />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">{status}</span>
        </div>

        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl ${style.bg} ${style.hover} flex items-center justify-center mb-4 transition-colors`}>
          <Icon className={`w-6 h-6 ${style.icon}`} />
        </div>

        {/* Content */}
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">{description}</p>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
            <span className="text-xs font-medium text-gray-900 dark:text-white">{progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${style.icon.replace('text-', 'bg-')}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Expandable details */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: isHovered ? 'auto' : 0, opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
            {details}
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}