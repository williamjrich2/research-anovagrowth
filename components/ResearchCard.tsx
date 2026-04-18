import Link from 'next/link'
import { ResearchArticle } from '@/lib/research'
import { ArrowRight } from 'lucide-react'

interface ResearchCardProps {
  article: ResearchArticle
}

export default function ResearchCard({ article }: ResearchCardProps) {
  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    'theoretical-framework': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    'breakthrough': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'analysis': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'experiment': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    'synthesis': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  }

  const style = categoryColors[article.category] || categoryColors['analysis']

  return (
    <Link 
      href={`/research/${article.slug}`}
      className="group block bg-white border border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0`}>
          <span className={`text-lg font-semibold ${style.text}`}>
            {article.title.charAt(0)}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} ${style.border} border`}>
              {article.category.replace('-', ' ')}
            </span>
            <time className="text-xs text-gray-500">
              {new Date(article.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric'
              })}
            </time>
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
            {article.title}
          </h3>
          
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {article.excerpt}
          </p>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-900">{article.author}</span>
            <span className="text-gray-300">•</span>
            <span className="text-indigo-600 font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Read <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
