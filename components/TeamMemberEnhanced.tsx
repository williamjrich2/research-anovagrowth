'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Sparkles, FileText, Clock } from 'lucide-react'

interface TeamMemberProps {
  name: string
  role: string
  bio: string
  avatar: string
  color: string
  stats: {
    contributions: number
    activeProjects: number
    lastActive: string
  }
  recentWork: string[]
}

export function TeamMember({ name, role, bio, avatar, color, stats, recentWork }: TeamMemberProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isActive = stats.lastActive === 'now'

  return (
    <motion.div
      className="relative group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="relative">
        {/* Active indicator */}
        {isActive && (
          <motion.div
            className="absolute -top-1 -right-1 z-10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </motion.div>
        )}

        {/* Avatar with glow */}
        <div
          className="relative w-28 h-28 mx-auto mb-4 rounded-2xl overflow-hidden"
          style={{ boxShadow: isHovered ? `0 0 30px ${color}40` : 'none' }}
        >
          <Image
            src={avatar}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="112px"
          />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: `linear-gradient(to top, ${color}20, transparent)` }}
          />
        </div>

        {/* Name and role */}
        <div className="text-center">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">{name}</h3>
          <p className="text-sm font-medium mb-2" style={{ color }}>{role}</p>

          {/* Expanded stats on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{stats.contributions} papers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{stats.activeProjects} active</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">{bio}</p>

          {/* Recent work on hover */}
          <AnimatePresence>
            {isHovered && recentWork.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800"
              >
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  Recent
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">{recentWork[0]}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}