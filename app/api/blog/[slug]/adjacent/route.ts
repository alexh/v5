import { NextResponse } from 'next/server'
import { getAdjacentPosts } from '../../../../../lib/blog'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const adjacentPosts = getAdjacentPosts(params.slug)
    return NextResponse.json(adjacentPosts)
  } catch (error) {
    console.error('Error fetching adjacent posts:', error)
    return NextResponse.json({ prev: null, next: null }, { status: 500 })
  }
}