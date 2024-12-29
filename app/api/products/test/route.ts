import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const apiUrl = process.env.API_URL
    const apiKey = process.env.API_KEY

    if (!apiUrl || !apiKey) {
      return NextResponse.json({ 
        error: 'Configuration error'
      }, { status: 500 })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${apiUrl}/api/store/products`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store',
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return NextResponse.json({ 
        error: `API responded with status ${response.status}`
      }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })

  } catch (error) {
    console.error('API error:', error)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json({ 
          error: 'Request timed out'
        }, { status: 504 })
      }
    }
    return NextResponse.json({ 
      error: 'Failed to fetch data'
    }, { status: 500 })
  }
} 