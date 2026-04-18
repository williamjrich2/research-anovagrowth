'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, FileText, Users, FlaskConical, Home, Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'

interface Command {
  id: string
  title: string
  icon: React.ReactNode
  action: () => void
  category: 'navigation' | 'actions'
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setIsOpen(false)
  }, [])

  const commands: Command[] = [
    { 
      id: 'home', 
      title: 'Go to Home', 
      icon: <Home className="w-4 h-4" />, 
      action: () => { window.location.href = '/' }, 
      category: 'navigation' 
    },
    { 
      id: 'research', 
      title: 'Browse Research', 
      icon: <FileText className="w-4 h-4" />, 
      action: () => scrollToSection('research'), 
      category: 'navigation' 
    },
    { 
      id: 'experiments', 
      title: 'View Experiments', 
      icon: <FlaskConical className="w-4 h-4" />, 
      action: () => scrollToSection('experiments'), 
      category: 'navigation' 
    },
    { 
      id: 'team', 
      title: 'Meet the Team', 
      icon: <Users className="w-4 h-4" />, 
      action: () => scrollToSection('team'), 
      category: 'navigation' 
    },
    { 
      id: 'theme', 
      title: resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode', 
      icon: resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />, 
      action: () => { toggleTheme(); setIsOpen(false) }, 
      category: 'actions' 
    },
  ]

  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen(open => !open)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-xl z-[101]"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search commands..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
                  autoFocus
                />
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 rounded">
                  ESC
                </kbd>
              </div>
              <div className="max-h-[50vh] overflow-y-auto p-2">
                {['navigation', 'actions'].map(category => {
                  const cmds = filteredCommands.filter(c => c.category === category)
                  if (cmds.length === 0) return null
                  return (
                    <div key={category}>
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {category}
                      </div>
                      {cmds.map((cmd) => (
                        <button
                          key={cmd.id}
                          onClick={cmd.action}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                        >
                          <span className="text-gray-500 group-hover:text-indigo-500 transition-colors">
                            {cmd.icon}
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {cmd.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  )
                })}
                {filteredCommands.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No commands found
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2 text-center">
              <kbd className="px-2 py-1 text-xs font-medium text-gray-400 bg-white dark:bg-gray-800 rounded shadow">
                ⌘K
              </kbd>
              <span className="text-xs text-gray-500 ml-2">to toggle</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}