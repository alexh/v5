interface JobMetadata {
  id: string;
  prompt: string;
  image_url: string;
  url: string;
}

interface MetadataMap {
  [key: string]: JobMetadata;
}

import metadata from '../public/midjourney/metadata.json' assert { type: "json" };

export interface MidjourneyJob {
  id: string;
  prompt: string;
  url: string;
}

export function getMidjourneyData(): MidjourneyJob[] {
  const jobsArray = Object.values(metadata as MetadataMap);
  return jobsArray;
}

export function getRandomJob(): MidjourneyJob {
  const jobs = getMidjourneyData();
  const randomIndex = Math.floor(Math.random() * jobs.length);
  return jobs[randomIndex];
}

export async function getRandomJobs(count = 5): Promise<MidjourneyJob[]> {
  const jobs = getMidjourneyData()
  const shuffled = [...jobs].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
} 