import { NextResponse } from 'next/server'
import metadata from '../../../../public/midjourney/metadata.json'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const job = metadata[params.id]
  
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  return NextResponse.json({
    ...job,
    id: params.id
  })
} 