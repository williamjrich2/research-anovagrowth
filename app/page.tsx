import type { Metadata } from 'next'
import { getAllResearch } from '@/lib/research'
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { ExperimentsSection } from '@/components/ExperimentsSection'
import { ResearchFeed } from '@/components/ResearchFeed'
import { TeamSection } from '@/components/TeamSection'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'AI Labs Research | AnovaGrowth',
  description: 'Breaking beyond model limitations. Independent AI research and breakthrough discovery.',
}

export default async function Home() {
  const research = await getAllResearch()
  const publishedResearch = research.filter(r => r.status === 'published')

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />
      <Hero />
      <ExperimentsSection />
      <ResearchFeed articles={publishedResearch} />
      <TeamSection />
      <Footer />
    </main>
  )
}