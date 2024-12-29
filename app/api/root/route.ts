import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Welcome to the Materials API',
    version: '1.0',
    documentation: 'https://api.materials.nyc/api',
    endpoints: [
      {
        path: '/api/store/products',
        method: 'GET',
        description: 'Get all products from the Materials catalog'
      }
    ]
  })
} 