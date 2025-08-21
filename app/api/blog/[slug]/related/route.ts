import { NextResponse } from 'next/server'
import { getRelatedPosts } from '../../../../../lib/blog'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const relatedPosts = getRelatedPosts(params.slug, 3)
    return NextResponse.json(relatedPosts)
  } catch (error) {
    console.error('Error fetching related posts:', error)
    return NextResponse.json([], { status: 500 })
  }
}