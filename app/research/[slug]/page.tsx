'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { remark } from 'remark'
import html from 'remark-html'
import { FlaskConical, ArrowLeft, Calendar, User, Clock } from 'lucide-react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

interface ResearchArticle {
  slug: string
  title: string
  date: string
  author: string
  category: string
  tags: string[]
  status: string
  excerpt: string
  content: string
}

const categoryStyles: Record<string, { bg: string; text: string }> = {
  'theoretical-framework': { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-300' },
  'breakthrough': { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300' },
  'analysis': { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-300' },
  'experiment': { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300' },
  'synthesis': { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-300' },
}

export default function ResearchPage() {
  const params = useParams()
  const [article, setArticle] = useState<ResearchArticle | null>(null)
  const [contentHtml, setContentHtml] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/research/${params.slug}`)
        if (res.ok) {
          const data = await res.json()
          setArticle(data)
          
          const processedContent = await remark()
            .use(html)
            .process(data.content)
          setContentHtml(processedContent.toString())
        }
      } catch (error) {
        console.error('Error fetching article:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchArticle()
    }
  }, [params.slug])

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="pt-24 pb-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-6"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <Header />
        <div className="pt-24 pb-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Article Not Found</h1>
            <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const style = categoryStyles[article.category] || categoryStyles['analysis']
  const readTime = Math.ceil(article.content.split(/\s+/).length / 200)

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      <article className="pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                {article.category.replace('-', ' ')}
              </span>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <time className="text-sm text-gray-500 dark:text-gray-400 inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(article.date).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </time>
              <span className="text-sm text-gray-500 dark:text-gray-400 inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {readTime} min read
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">
              {article.title}
            </h1>

            {/* Author */}
            <div className="flex items-center gap-3 mb-12 pb-8 border-b border-gray-100 dark:border-gray-800">
              <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center`}>
                <User className={`w-5 h-5 ${style.text}`} />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{article.author}</div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">Research Scientist</div>
              </div>
            </div>

            {/* Content */}
            <div 
              className="prose prose-lg prose-gray dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:tracking-tight
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900 dark:prose-strong:text-white
                prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                prose-pre:bg-gray-50 dark:prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-800
                prose-blockquote:border-l-indigo-500 prose-blockquote:bg-indigo-50/30 dark:prose-blockquote:bg-indigo-950/30 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
                prose-ul:text-gray-600 dark:prose-ul:text-gray-300 prose-ol:text-gray-600 dark:prose-ol:text-gray-300"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            {/* Tags */}
            <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Tags:</span>
                {article.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </article>

      <Footer />
    </main>
  )
}