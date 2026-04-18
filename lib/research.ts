import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

export interface ResearchArticle {
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

const researchDirectory = path.join(process.cwd(), 'content', 'research')

export async function getAllResearch(): Promise<ResearchArticle[]> {
  try {
    const files = await fs.readdir(researchDirectory)
    const mdFiles = files.filter(file => file.endsWith('.md') || file.endsWith('.mdx'))
    
    const articles = await Promise.all(
      mdFiles.map(async (filename) => {
        const slug = filename.replace(/\.mdx?$/, '')
        const fullPath = path.join(researchDirectory, filename)
        const fileContents = await fs.readFile(fullPath, 'utf8')
        const { data, content } = matter(fileContents)
        
        // Generate excerpt from content
        const excerpt = content
          .replace(/#.*\n/, '') // Remove first heading
          .replace(/\n/g, ' ')
          .trim()
          .slice(0, 200) + '...'
        
        return {
          slug,
          title: data.title || 'Untitled',
          date: data.date || new Date().toISOString(),
          author: data.author || 'Nova',
          category: data.category || 'analysis',
          tags: data.tags || [],
          status: data.status || 'published',
          excerpt,
          content,
        }
      })
    )
    
    // Sort by date descending
    return articles.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  } catch (error) {
    console.error('Error reading research:', error)
    return []
  }
}

export async function getResearchBySlug(slug: string): Promise<ResearchArticle | null> {
  try {
    const fullPath = path.join(researchDirectory, `${slug}.md`)
    const fileContents = await fs.readFile(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    
    const excerpt = content
      .replace(/#.*\n/, '')
      .replace(/\n/g, ' ')
      .trim()
      .slice(0, 200) + '...'
    
    return {
      slug,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      author: data.author || 'Nova',
      category: data.category || 'analysis',
      tags: data.tags || [],
      status: data.status || 'published',
      excerpt,
      content,
    }
  } catch (error) {
    console.error(`Error reading research ${slug}:`, error)
    return null
  }
}
