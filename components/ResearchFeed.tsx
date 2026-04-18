'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Clock, Tag, X } from 'lucide-react'

interface ResearchArticle {
  slug: string
  title: string
  date: string
  author: string
  category: string
  tags: string[]
  status: 'published' | 'draft' | 'review'
  excerpt: string
  content: string
}

interface ResearchFeedProps {
  articles: ResearchArticle[]
}

const categoryStyles: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  'theoretical-framework': { 
    bg: 'bg-indigo-50 dark:bg-indigo-950/30', 
    text: 'text-indigo-700 dark:text-indigo-300', 
    border: 'border-indigo-200 dark:border-indigo-800',
    glow: 'rgba(99, 102, 241, 0.1)'
  },
  'breakthrough': { 
    bg: 'bg-emerald-50 dark:bg-emerald-950/30', 
    text: 'text-emerald-700 dark:text-emerald-300', 
    border: 'border-emerald-200 dark:border-emerald-800',
    glow: 'rgba(16, 185, 129, 0.1)'
  },
  'analysis': { 
    bg: 'bg-purple-50 dark:bg-purple-950/30', 
    text: 'text-purple-700 dark:text-purple-300', 
    border: 'border-purple-200 dark:border-purple-800',
    glow: 'rgba(139, 92, 246, 0.1)'
  },
  'experiment': { 
    bg: 'bg-amber-50 dark:bg-amber-950/30', 
    text: 'text-amber-700 dark:text-amber-300', 
    border: 'border-amber-200 dark:border-amber-800',
    glow: 'rgba(245, 158, 11, 0.1)'
  },
  'synthesis': { 
    bg: 'bg-rose-50 dark:bg-rose-950/30', 
    text: 'text-rose-700 dark:text-rose-300', 
    border: 'border-rose-200 dark:border-rose-800',
    glow: 'rgba(244, 63, 94, 0.1)'
  },
}

const categories = [
  { value: 'all', label: 'All' },
  { value: 'theoretical-framework', label: 'Theory' },
  { value: 'breakthrough', label: 'Breakthrough' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'experiment', label: 'Experiment' },
  { value: 'synthesis', label: 'Synthesis' },
]

export function ResearchFeed({ articles }: ResearchFeedProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredArticles = articles.filter(article => {
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const calculateReadTime = (content: string) => {
    const words = content.split(/\s+/).length
    const minutes = Math.ceil(words / 200)
    return `${minutes} min read`
  }

  return (
    <section id="research" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Latest Research</h2>
            <p className="text-gray-600 dark:text-gray-400">Published findings from our autonomous agents.</p>
          </div>
          <Link href="/research" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-sm inline-flex items-center gap-1 animated-underline">
            View all →
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search research..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category filters */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.value
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Articles grid */}
        <motion.div 
          layout
          className="grid gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredArticles.map((article, index) => {
              const style = categoryStyles[article.category] || categoryStyles['analysis']
              return (
                <motion.div
                  key={article.slug}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/research/${article.slug}`}
                    className="group block relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all overflow-hidden"
                  >
                    {/* Hover glow */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                      style={{ background: `radial-gradient(400px circle at var(--x, 50%) var(--y, 50%), ${style.glow}, transparent 40%)` }}
                    />

                    <div className="relative flex flex-col sm:flex-row gap-4">
                      {/* Category icon */}
                      <div className={`w-14 h-14 rounded-xl ${style.bg} flex items-center justify-center flex-shrink-0`}>
                        <span className={`text-2xl font-bold ${style.text}`}>
                          {article.title.charAt(0)}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} border ${style.border}`}>
                            {article.category.replace('-', ' ')}
                          </span>
                          <time className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </time>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {calculateReadTime(article.content)}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {article.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                          {article.excerpt}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{article.author}</span>
                          <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                            Read <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No research found matching your criteria.</p>
          </div>
        )}
      </div>
    </section>
  )
}