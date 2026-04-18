import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const researchDirectory = path.join(process.cwd(), 'content', 'research')
    const fullPath = path.join(researchDirectory, `${slug}.md`)
    const fileContents = await fs.readFile(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    
    const excerpt = content
      .replace(/#.*\n/, '')
      .replace(/\n/g, ' ')
      .trim()
      .slice(0, 200) + '...'
    
    return NextResponse.json({
      slug,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      author: data.author || 'Nova',
      category: data.category || 'analysis',
      tags: data.tags || [],
      status: data.status || 'published',
      excerpt,
      content,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 })
  }
}