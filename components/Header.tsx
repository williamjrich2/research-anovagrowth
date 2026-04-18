'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { FlaskConical, Sun, Moon, Search } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export function Header() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()

  const navItems = [
    { href: '#research', label: 'Research' },
    { href: '#experiments', label: 'Experiments' },
    { href: '#team', label: 'Team' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 glass border-b border-gray-200/50 dark:border-gray-700/50 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 15 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <FlaskConical className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </motion.div>
          <span className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            AI Labs
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors animated-underline"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Search trigger for command palette */}
          <button
            onClick={() => {
              // Trigger is handled by keyboard event, this is visual feedback
            }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-text"
          >
            <Search className="w-4 h-4" />
            <span>Search...</span>
            <kbd className="text-xs bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded shadow-sm">⌘K</kbd>
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  )
}