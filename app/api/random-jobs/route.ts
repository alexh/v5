import { getRandomJobs } from '@/lib/midjourney'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const count = parseInt(searchParams.get('count') || '5')
  
  try {
    const jobs = await getRandomJobs(count)
    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Error in random-jobs route:', error)
    return NextResponse.json({ error: 'Failed to fetch random jobs' }, { status: 500 })
  }
} 