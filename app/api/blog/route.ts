import { NextResponse } from 'next/server'
import { getBlogPosts } from '../../../lib/blog'

export async function GET() {
  try {
    const posts = getBlogPosts()
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json([], { status: 500 })
  }
}