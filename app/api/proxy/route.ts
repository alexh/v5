import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint')
    
    if (!endpoint) {
      return NextResponse.json({ error: 'No endpoint specified' }, { status: 400 })
    }

    const apiUrl = process.env.API_URL?.replace(/\/$/, '')
    const apiKey = process.env.API_KEY

    if (!apiUrl || !apiKey) {
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }

    const fullUrl = `${apiUrl}${endpoint}`
    console.log('Making request to:', fullUrl)

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json({ 
        error: `API responded with status ${response.status}`,
        url: fullUrl,
      }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store' }
    })

  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 