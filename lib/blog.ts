import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// This file should only be imported on the server side

const contentDirectory = path.join(process.cwd(), 'content/blog')

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

export interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  content: string
  tags?: string[]
  author?: string
  readingTime?: number
}

export function getBlogPosts(): BlogPost[] {
  if (!fs.existsSync(contentDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(contentDirectory)
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '')
      const fullPath = path.join(contentDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)

      return {
        slug,
        title: data.title || 'Untitled',
        date: data.date || new Date().toISOString(),
        excerpt: data.excerpt || '',
        content,
        tags: data.tags || [],
        author: data.author || 'Alex Haynes',
        readingTime: calculateReadingTime(content),
      } as BlogPost
    })

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getBlogPost(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(contentDirectory, `${slug}.mdx`)
    if (!fs.existsSync(fullPath)) {
      return null
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      slug,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      excerpt: data.excerpt || '',
      content,
      tags: data.tags || [],
      author: data.author || 'Alex Haynes',
      readingTime: calculateReadingTime(content),
    } as BlogPost
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error)
    return null
  }
}

export function getBlogSlugs(): string[] {
  if (!fs.existsSync(contentDirectory)) {
    return []
  }
  
  return fs
    .readdirSync(contentDirectory)
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => fileName.replace(/\.mdx$/, ''))
}

export function getAdjacentPosts(currentSlug: string): { prev: BlogPost | null, next: BlogPost | null } {
  const allPosts = getBlogPosts()
  const currentIndex = allPosts.findIndex(post => post.slug === currentSlug)
  
  if (currentIndex === -1) {
    return { prev: null, next: null }
  }

  return {
    prev: currentIndex > 0 ? allPosts[currentIndex - 1] : null,
    next: currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null
  }
}

export function getRelatedPosts(currentSlug: string, limit = 3): BlogPost[] {
  const allPosts = getBlogPosts()
  const currentPost = allPosts.find(post => post.slug === currentSlug)
  
  if (!currentPost || !currentPost.tags || currentPost.tags.length === 0) {
    return []
  }

  const relatedPosts = allPosts
    .filter(post => post.slug !== currentSlug)
    .map(post => {
      const commonTags = post.tags?.filter(tag => currentPost.tags?.includes(tag)).length || 0
      return { post, score: commonTags }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => post)

  return relatedPosts
}