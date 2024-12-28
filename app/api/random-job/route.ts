import { NextResponse } from 'next/server'
import { getRandomJob } from '../../../lib/midjourney'

export async function GET() {
  try {
    console.log('API route called')
    const randomJob = getRandomJob()
    console.log('API returning job:', randomJob)
    return NextResponse.json(randomJob)
  } catch (error: any) {
    console.error('Error fetching random job:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch random job', 
        details: error?.message || 'Unknown error' 
      },
      { status: 500 }
    )
  }
} 