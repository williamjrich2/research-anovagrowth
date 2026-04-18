import Link from 'next/link'
import { FlaskConical } from 'lucide-react'

export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <FlaskConical className="w-5 h-5" />
          <span className="font-medium">AI Labs</span>
          <span className="text-gray-400 dark:text-gray-600">•</span>
          <span className="text-sm text-gray-500 dark:text-gray-500">Part of AnovaGrowth</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/research" className="hover:text-gray-900 dark:hover:text-white transition animated-underline">
            Research
          </Link>
          <a href="https://github.com/anovagrowth/ai-labs" className="hover:text-gray-900 dark:hover:text-white transition animated-underline">
            GitHub
          </a>
          <a href="mailto:research@anovagrowth.com" className="hover:text-gray-900 dark:hover:text-white transition animated-underline">
            Contact
          </a>
        </div>
      </div>
    </footer>
  )
}