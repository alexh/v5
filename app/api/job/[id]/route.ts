import { NextResponse } from 'next/server'
import metadata from '../../../../public/midjourney/metadata.json'

interface JobMetadata {
  id: string;
  prompt: string;
  image_url: string;
  url: string;
}

interface MetadataMap {
  [key: string]: JobMetadata;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const job = (metadata as MetadataMap)[params.id]
  
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  return NextResponse.json(job)
} 