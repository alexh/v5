import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { join } from 'path'
import { createReadStream } from 'fs'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/output/')) {
    const filePath = join(process.cwd(), request.nextUrl.pathname)
    try {
      const stream = createReadStream(filePath)
      return new NextResponse(stream as any)
    } catch (error) {
      return NextResponse.next()
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/output/:path*'
} 