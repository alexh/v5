import { NextResponse } from 'next/server'
import { getBlogPost } from '../../../../lib/blog'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const post = getBlogPost(params.slug)
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}